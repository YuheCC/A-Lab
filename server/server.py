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

load_dotenv()

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
                    sources.append(f'- <a href="{url}" target="_blank" rel="noopener noreferrer">{title}</a>')

        elif web_search_client == "OpenAI":
            completion = openai_client.chat.completions.create(
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
        
        for (i, hit) in enumerate(results['result']['hits']):
            context_text = hit['fields']['context']
            full_source = hit['fields']['source'].split("/")[-1].split(".jsonl")[0]
            citation = ""

            print(full_source)
            if full_source[-2:] == "-0":
                # doi
                doi = full_source[:-2].replace("_", "/")
                try:
                    headers = {"Accept": "text/x-bibliography; style=apa"}
                    response = httpx.get(f"https://doi.org/{doi}", headers=headers, follow_redirects=True)
                    if response.status_code == 200:
                        citation = response.text.strip().split("https://doi.org")[0]
                        source_text = f'{citation} <a href="https://doi.org/{doi}" target="_blank" rel="noopener noreferrer">https://doi.org/{doi}</a>'
                    else:
                        source_text = f"DOI: {doi}"
                except Exception as e:
                    source_text = f"DOI: {doi}"
            else:
                pattern = "(z-lib"
                idx = full_source.lower().find(pattern)
                if idx != -1:
                    source_text = full_source[:idx]
                else:
                    source_text = full_source
                citation = source_text

            if citation:
                context += "Database result " + str(i+1) + ", from " + citation + ": " + context_text + f"\n\n"
            else:
                context += "Database result " + str(i+1) + ": " + context_text + "\n\n"
            sources.append("- " + source_text)
    
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

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.post("/rag")
async def handle_rag(query_req: RagRequest):
    query = query_req.query
    max_output_length = query_req.maxOutputLength
    rag_enabled = query_req.ragEnabled
    web_search_enabled = query_req.webSearchEnabled
    web_search_client = query_req.webSearchClient
    model = query_req.model # either OmniScience or o3-mini
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
            extended_prompt += "These results may or may not be relevant. Think about which parts of this information are useful to answer the query."
    prompt = initial_prompt + extended_prompt
    # Query your LLM with the combined prompt
    llm_response = await query_llm(prompt, model, max_output_length)  # Your function to query the LLM
    if not llm_response:
        raise HTTPException(status_code=500, detail="LLM query failed")
    if model == "OmniScience":
        return {"outputs": extended_prompt + llm_response + "\n**Sources:**\n" + sources}
    else:
        return {"outputs": llm_response + "<br><br><strong>Sources:</strong><br><br>" + sources}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8010)