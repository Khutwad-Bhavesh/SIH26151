import pandas as pd
from backend.analyzer import extract_entities, compute_stylometry, build_graph

def test_cs02_negative_control_isolated_node():
    # CS-02 & GC-03: Inject a completely innocent persona. 
    # They should NOT be connected to the hacker cluster.
    data = [
        # Hacker Alias 1
        {"post_id": 1, "author": "ShadowBroker", "content": "Selling CVVs to 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa.", "gpu_timing_hash": "HashA", "monitor": "1080p"},
        # Hacker Alias 2 (Shared BTC, Shared GPU)
        {"post_id": 2, "author": "AnonCoder", "content": "I have an exploit. Send to 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa.", "gpu_timing_hash": "HashA", "monitor": "1080p"},
        
        # Innocent user (Negative Control)
        {"post_id": 3, "author": "NormalGuy99", "content": "Does anyone know how to install Ubuntu? I'm having trouble with the wifi drivers.", "gpu_timing_hash": "HashB", "monitor": "4k"}
    ]
    df = pd.DataFrame(data)
    
    # Run the full pipeline logic on the DataFrame
    df = extract_entities(df)
    df = compute_stylometry(df)
    G = build_graph(df)
    
    # Assert ShadowBroker and AnonCoder are connected (True Positive)
    assert G.has_edge("ShadowBroker", "AnonCoder")
    
    # Assert NormalGuy99 has exactly 0 edges (True Negative / Isolated Node)
    assert "NormalGuy99" in G.nodes
    assert G.degree("NormalGuy99") == 0
