from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.analyzer import generate_graph_data

app = FastAPI(title="NTRO De-anonymization API")

# Allow the frontend (running on a different port or file://) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/graph")
def get_identity_graph(target: str = None):
    """
    Runs the OSINT pipeline and returns the Identity Graph (Nodes + Edges)
    formatted for Cytoscape.js.
    """
    try:
        graph_data = generate_graph_data(target)
        return {"status": "success", "data": graph_data}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# Serve the frontend UI directly from the root path
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")
