from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_get_identity_graph():
    response = client.get("/api/graph")
    
    assert response.status_code == 200
    
    data = response.json()
    assert data["status"] == "success"
    
    # Check that the Cytoscape graph format exists
    assert "nodes" in data["data"]
    assert "edges" in data["data"]
    
    # Verify the graph is not empty (since we load the default synthetic data)
    assert len(data["data"]["nodes"]) > 0
