import json
from backend.analyzer import generate_graph_data

if __name__ == "__main__":
    print("[*] NTRO De-anonymization Pipeline CLI wrapper")
    print("[*] Generating Identity Graph from multi-signal correlation engine...")
    
    graph_data = generate_graph_data()
    
    print("[+] Graph generated successfully. Outputting Cytoscape JSON:")
    print(json.dumps(graph_data, indent=2))
