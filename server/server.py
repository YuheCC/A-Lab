from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from huggingface_hub import login
from pinecone import Pinecone, ServerlessSpec
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import DirectoryLoader, JSONLoader
import httpx
import os
from tavily import TavilyClient
from pymongo import MongoClient
from typing import Optional
from openai import OpenAI
import re
from dotenv import load_dotenv
from snowflake.snowpark import Session as SnowflakeSession
import pubchempy as pcp
from rdkit import Chem
from rdkit.Chem import Draw
import io
import base64
import traceback
import unicodedata
import requests
import pandas as pd

load_dotenv()

snowflake_auth = {
    "account": "SESAI-MAIN",
    "user": "ADAM.ATANAS@SES.AI",
    "authenticator": "externalbrowser",
    "role": "PROMETHEUS",
    "warehouse": "MATERIAL_WH",
    "database": "UMAP_DATA",
    "schema": "PUBLIC"
}

snowflake_session = SnowflakeSession.builder.configs(snowflake_auth).create()

# df = snowflake_session.sql("SELECT * FROM UMAP_DATA.PUBLIC.UMAP_71K LIMIT 10").to_pandas()
# print(df)

openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# if there are fewer than this many links in OpenAI, ignore web search result
NUM_LINKS_THRESH = 2

# MongoDB Setup
MONGO_URI = os.getenv("MONGO_URI")
mongo_client = MongoClient(MONGO_URI)
db = mongo_client["chatApp"]

ANSWER_OUTPUT_LENGTH = 1024 # Maximum number of tokens to generate for the answer
MAX_LOOPS = 2 # Maximum number of loops to run the LLM

hf_api_keys=os.getenv("HF_API_KEY")
login(hf_api_keys)

tavily_api_key = os.getenv("TAVILY_API_KEY")
tavily_client = TavilyClient(api_key=tavily_api_key)

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index_name = "ses-papers-textbooks-for-rag"
index = pc.Index(index_name)
print(index.describe_index_stats())


### Paper name loading code

def find_full_doi(doi_suffix, excel_file_path):
    try:
        # Load the Excel file
        df = pd.read_excel(excel_file_path, engine='openpyxl')

        # Find the row where the DOI suffix matches the end part of 'doi' column
        df['doi'] = df['doi'].str.lower()
        match = df[df['doi'].str.endswith(doi_suffix, na=False)]

        if not match.empty:
            return match.iloc[0]['doi']
        else:
            return f"No matching full DOI found in DB for suffix: {doi_suffix}"

    except Exception as e:
        return f"An error occurred: {e}"

def get_paper_title(full_doi):
    url = f"https://api.crossref.org/works/{full_doi}"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        title = data['message'].get('title', ["Title not available"])[0]
        doi_url = f"https://doi.org/{full_doi}"

        return f'<a href="{doi_url}" target="_blank" rel="noopener noreferrer">{title}</a> (DOI: {full_doi})'
    else:
        return f'- {full_doi}'
    
def extract_title_doi_from_filename(filename):

    # List of regex patterns to match different filename formats
    patterns = [
        r'/llm_data/papers/rag_papers/9300LIB/(.+)-0\.jsonl$',
        r'/llm_data/papers/rag_papers/Gyuleen_update/(.+)-0\.jsonl$',
        r'/llm_data/papers/3p6_jsonl/(.+)-0\.jsonl$',
        r'/llm_data/papers/textbooks_jsonl/(.+)-0\.jsonl$'
    ]

    for pattern in patterns:
        match = re.search(pattern, filename)
        if match:
            extracted = match.group(1)
            if "9300LIB" in pattern:
                extracted = find_full_doi(extracted, './9300 doi_for_RAG.xlsx')
                title_doi_link = f'- Paper from DB: {get_paper_title(extracted)}'
            if "Gyuleen_update" in pattern:
                extracted = find_full_doi(extracted, './Gyuleen_update.xlsx')
                title_doi_link = f'- Paper from DB: {get_paper_title(extracted)}'
            # If the pattern matches the 3p6_jsonl format, replace underscores with slashes
            if "3p6_jsonl" in pattern:
                extracted = extracted.replace("_", "/")
                title_doi_link = f'- Paper from DB: {get_paper_title(extracted)}'
            # If the pattern matches the textbooks_jsonl format, convert hyphens to spaces and capitalize each word
            if "textbooks_jsonl" in pattern:
                title_doi_link = f'- Textbook: {extracted.replace("-", " ").title()}'

            return title_doi_link
    return None

def hybrid_score_norm(dense, sparse, alpha: float):
    """Hybrid score using a convex combination

    alpha * dense + (1 - alpha) * sparse

    Args:
        dense: Array of floats representing
        sparse: a dict of `indices` and `values`
        alpha: scale between 0 and 1
    """
    if alpha < 0 or alpha > 1:
        raise ValueError("Alpha must be between 0 and 1")
    hs = {
        'indices': sparse['indices'],
        'values':  [v * (1 - alpha) for v in sparse['values']]
    }
    return [v * alpha for v in dense], hs

def dense_sparse_vector(query):
    de = pc.inference.embed(
        model="multilingual-e5-large",
        inputs=query,
        parameters={"input_type": "passage", "truncate": "END"}
    )    

    # Embeddings of sparse_vector
    se = pc.inference.embed(
        model="pinecone-sparse-english-v0",
        inputs=query,
        parameters={"input_type": "passage", "return_tokens": True}
    )
    return de[0]['values'], {'indices': se[0]['sparse_indices'], 'values': se[0]['sparse_values']}

def retrieve_context(query, top_k_chunks, rag_enabled: bool, web_search_enabled: bool, web_search_client:str):
    context = ""
    sources = []

    if web_search_enabled:
        if web_search_client == "Tavily":
            tavily_response = tavily_client.search(
                query=query,
                search_depth="advanced",
                max_results=3,
                include_answer=True,
                include_raw_content=True,
                include_images=False
            )
            if tavily_response.get("answer"):
                context += f"Web search result: {tavily_response['answer']}\n\n"
                for result in tavily_response["results"]:
                    title = result["title"]
                    url = result["url"]
                    url_link = f'- Web Search: <a href="{url}" target="_blank" rel="noopener noreferrer">{title}</a>'

                if url_link not in sources:
                    sources.append(f'{url_link}')

        elif web_search_client == "OpenAI":
            completion = client.chat.completions.create(
                model = "gpt-4o-mini-search-preview",
                messages = [
                    {
                        "role": "user",
                        "content": query
                    }
                ],
            )
            openai_response = completion.choices[0].message.content
            links = re.findall(r'\(\[([^\]]+)\]\(([^)]+)\)\)', openai_response)
            if len(links) >= NUM_LINKS_THRESH:
                for text, url in links:
                    url_split = url.split("?utm_source=openai")[0]
                    sources.append(f"- {text}: {url_split}")
                # Optionally, include the full response in the context as well:
                context += f"Web search result: {openai_response}\n\n"

    if rag_enabled:
        query_payload = {
            "inputs": {
                "text": f"{query}"
            },
            "top_k": top_k_chunks
        }

        results = index.search(
            namespace="ses_rag",
            query=query_payload
        )

        for (i,hit) in enumerate(results['result']['hits']):
            context_text = hit['fields']['context']
            source_text = hit['fields']['source']
            citation = extract_title_doi_from_filename(source_text)

            if citation:
                context += "Database result " + str(i+1) + ", from " + citation + ": " + context_text + f"\n\n"
            else:
                context += "Database result " + str(i+1) + ": " + context_text + "\n\n"

            sources.append(f'{citation}')

    sources = list(dict.fromkeys(sources))
    sources = "\n".join(sources)
    return context, sources

async def query_llm(prompt: str, model: str, max_output_len: int = 1024) -> str:
    """
    Query the LLM inference server with the given prompt and output token budget.
    
    This function queries the inference server at "http://localhost:8800/v2/models/llama/infer"
    and, if the returned output does not include the end-of-text marker ("<|eot_id|>"),
    it issues a follow-up request (continuation) appending the received output to the original prompt.
    
    Args:
        prompt: The full prompt (including any retrieved context) to send.
        max_output_len: The number of tokens to generate for each call.
        
    Returns:
        The full text response from the LLM including all continuation outputs.
    
    Raises:
        HTTPException: If the inference server does not return a valid response.
    """

    if model == "o3-mini":
        final_response = openai_client.chat.completions.create(model="o3-mini", reasoning_effort="high", 
            messages=[
                {
                    "role": "user",
                    "content": prompt
                    }
                ]).choices[0].message.content
    elif model == "OmniScience":
        inference_url = "http://localhost:8800/v2/models/llama/infer"
        final_response = ""
        current_prompt = prompt
        count = 0

        while True:
            if count == 0:
                length = max_output_len
            else:
                length = ANSWER_OUTPUT_LENGTH
            payload = {
                "inputs": [
                    {
                        "name": "prompts",
                        "shape": [1, 1],
                        "datatype": "BYTES",
                        "data": [[current_prompt]]
                    },
                    {
                        "name": "max_output_len",
                        "shape": [1, 1],
                        "datatype": "INT64",
                        "data": [[length]]
                    },
                    {
                        "name": "output_generation_logits",
                        "shape": [1, 1],
                        "datatype": "BOOL",
                        "data": [[False]]
                    }
                ],
                "outputs": [
                    {"name": "outputs"}
                ]
            }

            async with httpx.AsyncClient(timeout=300) as client:
                response = await client.post(inference_url, json=payload)
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code,
                                    detail=f"LLM query failed: {response.text}")

            result = response.json()
            try:
                new_output = result["outputs"][0]["data"][0]
            except (KeyError, IndexError):
                raise HTTPException(status_code=500, detail="LLM query returned no output")

            final_response += new_output

            # Check if the end-of-text marker is present in the full output.
            if "<|eot_id|>" in final_response:
                final_response = final_response.replace("<|eot_id|>", "")
                break

            # if the answer marker isn't present, append one.
            if "<|start_header_id|>answer" not in new_output and count == 0:
                final_response += "\n<|start_header_id|>answer\n"

            # Update the prompt for the continuation call:
            current_prompt = prompt + "\n" + final_response

            count += 1

            if count >= MAX_LOOPS:
                break
    else:
        raise HTTPException(status_code=400, detail="Invalid model specified")

    return final_response

# Add this helper function after your imports (e.g., after importing openai_client)
def extract_molecule_names(text: str) -> list:
    """
    Use OpenAI's 4o-mini model to extract unique molecule names from the given text.
    Returns a list of molecule names.
    """
    prompt = (
        "Extract and list the unique molecule names mentioned in the following text. "
        "Return them as a semicolon-separated list. Only include each molecule once. "
        "Do not include abbreviations if the full molecule name was provided.\n\n"
        f"Text: {text}"
    )
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0
        )
        result = response.choices[0].message.content.strip()
        molecules = [mol.strip() for mol in result.split(";") if mol.strip()]
        # Remove duplicates while preserving order
        seen = set()
        unique = []
        for mol in molecules:
            if mol not in seen:
                unique.append(mol)
                seen.add(mol)
        return unique
    except Exception as e:
        print("Error extracting molecule names:", e)
        return []

greek_letter_mapping = {
    "α": "alpha",
    "β": "beta",
    "γ": "gamma",
    "δ": "delta",
    "ε": "epsilon",
    "ζ": "zeta",
    "η": "eta",
    "θ": "theta",
    "ι": "iota",
    "κ": "kappa",
    "λ": "lambda",
    "μ": "mu",
    "ν": "nu",
    "ξ": "xi",
    "ο": "omicron",
    "π": "pi",
    "ρ": "rho",
    "σ": "sigma",
    "τ": "tau",
    "υ": "upsilon",
    "φ": "phi",
    "χ": "chi",
    "ψ": "psi",
    "ω": "omega"
}

def replace_greek_letters(molecule: str) -> str:
    for greek, eng in greek_letter_mapping.items():
        molecule = molecule.replace(greek, eng)
    return molecule

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_smiles(molecule: str) -> dict:
    molecule = unicodedata.normalize('NFC', molecule).replace('\u2013', '-').replace('\u2014', '-').replace('\u2010', '-')
    try:
        compounds = pcp.get_compounds(molecule, 'name')
        if compounds:
            smiles = compounds[0].canonical_smiles
            return {"molecule": molecule, "smiles": smiles}
        else:
            return {"molecule": molecule, "smiles": "Not found"}
    except Exception as e:
        return {"molecule": molecule, "smiles": f"Error: {str(e)}"}

# Add a new endpoint to query PubChem via pubchempy for a molecule's SMILES string:
@app.get("/api/find_smiles")
async def find_smiles(molecule: str):
    result = get_smiles(molecule)
    return result

class RagRequest(BaseModel):
    query: str
    maxOutputLength: int = 2048
    ragEnabled: bool = True
    webSearchEnabled: bool = True
    webSearchClient: str = "OpenAI"
    model: str = "o3-mini"

class FeedbackRequest(BaseModel):
    isPositive: bool
    feedbackText: str
    responseContent: Optional[str] = ""
    collapsibleContent: Optional[str] = ""
    timestamp: Optional[str] = None

@app.post("/api/feedback")
async def save_feedback(feedback: FeedbackRequest):
    if not feedback.feedbackText or feedback.feedbackText.strip() == "":
        raise HTTPException(status_code=400, detail="Feedback text is required")
    try:
        collection = db["feedback"]
        result = collection.insert_one({
            "isPositive": feedback.isPositive,
            "feedbackText": feedback.feedbackText,
            "responseContent": feedback.responseContent,
            "collapsibleContent": feedback.collapsibleContent,
            "timestamp": feedback.timestamp or httpx._utils.get_timestamp()
        })
        return {"message": "Feedback saved successfully", "id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save feedback: {str(e)}")
    
def smiles_to_image(smiles: str):
    mol = Chem.MolFromSmiles(smiles)
    if mol:
        img = Draw.MolToImage(mol, size=(300, 300))
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        return buf.getvalue()
    return None
    
@app.get("/api/molecule_details")
async def molecule_details(molecule: str):
    """
    Query the UMAP_DATA.PUBLIC.UMAP_1M_MOLECULAR table for the given molecule (by SMILES).
    If found, return its properties and a base64-encoded image generated by smiles_to_image.
    """
    print(f"Searching for {molecule}...")
    smiles = get_smiles(molecule)
    if not smiles or smiles["smiles"] == "Not found" or "Error" in smiles["smiles"]:
        return {"found": False, "message": "Molecule not found"}

    query = f'''
        SELECT SMILE, 
               CAST(HOMO AS INT) as HOMO,
               CAST(LUMO AS INT) as LUMO,
               CAST(ESP_MAX AS INT) as ESP_MAX,
               CAST(ESP_MIN AS INT) as ESP_MIN,
               CAST(ENERGY AS INT) as ENERGY
        FROM UMAP_DATA.PUBLIC.UMAP_1M_MOLECULAR
        WHERE SMILE = '{smiles["smiles"]}'
        LIMIT 1
    '''
    print("Constructed query: ", query)
    try:
        result_df = snowflake_session.sql(query).to_pandas()
        if result_df.empty:
            print("Molecule not found.")
            return {"found": False, "message": "Molecule not found"}
        row = result_df.iloc[0].to_dict()
        # Generate molecule image
        image_data = smiles_to_image(row['SMILE'])
        if image_data:
            b64_image = base64.b64encode(image_data).decode('utf-8')
            image_uri = f"data:image/png;base64,{b64_image}"
        else:
            image_uri = None
        row['image'] = image_uri
        row['name'] = molecule
        return {"found": True, "molecule_details": row}
    except Exception as e:
        print("Error querying molecule details:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error querying molecule details: {str(e)}")

@app.post("/rag")
async def handle_rag(query_req: RagRequest):
    query = query_req.query
    max_output_length = query_req.maxOutputLength
    rag_enabled = query_req.ragEnabled
    web_search_enabled = query_req.webSearchEnabled
    web_search_client = query_req.webSearchClient
    model = query_req.model  # either OmniScience or o3-mini
    # Run retrieval based on the enabled options
    context, sources = retrieve_context(query, 3, rag_enabled, web_search_enabled, web_search_client)
    # Construct the prompt by combining the query and retrieval results
    initial_prompt = f"{query}"
    extended_prompt = ""
    if rag_enabled or web_search_enabled:
        if model == "OmniScience":
            extended_prompt += "\n<|start_header_id|>think\nOkay, let me start by searching "
            if rag_enabled:
                extended_prompt += "my database "
            if web_search_enabled:
                if rag_enabled:
                    extended_prompt += "and "
                extended_prompt += "the internet "
            extended_prompt += "for information about this query. I found the following information:\n"
            extended_prompt += context
            extended_prompt += "Let me think about which parts of this information are useful to answer the query."
        elif model == "o3-mini":
            extended_prompt += "\nThe following are"
            if rag_enabled:
                extended_prompt += " database"
            if web_search_enabled:
                if rag_enabled:
                    extended_prompt += " and"
                extended_prompt += " internet"
            extended_prompt += " database search results you might find useful when answering the query:\n"
            extended_prompt += context
            extended_prompt += "These results may or may not be relevant. "
            extended_prompt += "Think about which parts of this information are useful to answer the query. "
            extended_prompt += "If you name specific molecules in your response, make sure to state the full molecule name before using any abbreviations.\n"
    prompt = initial_prompt + extended_prompt
    # Query your LLM with the combined prompt
    llm_response = await query_llm(prompt, model, max_output_length)
    if not llm_response:
        raise HTTPException(status_code=500, detail="LLM query failed")
    
    # Extract molecule names from the LLM response
    original_molecule_list = extract_molecule_names(llm_response)
    molecule_text = ""
    if original_molecule_list:
        molecule_text = "; ".join(original_molecule_list)
    
    processed_molecule_list = [replace_greek_letters(mol) for mol in original_molecule_list]

    if model == "OmniScience":
        return {"outputs": extended_prompt + llm_response + "\n**Sources:**\n" + sources, "molecules": processed_molecule_list}
    else:
        return {"outputs": llm_response + "<br><br><strong>Sources:</strong><br><br>" + sources +"<br><br><strong>Detected molecules in LLM response:</strong><br><br>" + molecule_text, "molecules": processed_molecule_list}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8010)