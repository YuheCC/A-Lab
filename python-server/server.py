from fastapi import FastAPI, Query
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from rdkit import Chem
from rdkit.Chem import Draw
from io import BytesIO

app = FastAPI()

# Enable CORS for React (port 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/molecule")
async def get_molecule(smiles: str = Query(..., title="SMILES String")):
    """Generate a molecular drawing from a SMILES string."""
    try:
        mol = Chem.MolFromSmiles(smiles)
        if mol is None:
            return {"error": "Invalid SMILES string"}

        # Generate molecular image
        img = Draw.MolToImage(mol)

        # Convert image to bytes
        img_bytes = BytesIO()
        img.save(img_bytes, format="PNG")
        img_bytes.seek(0)

        return Response(content=img_bytes.getvalue(), media_type="image/png")

    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
