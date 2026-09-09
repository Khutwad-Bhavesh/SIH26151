import pandas as pd
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import networkx as nx
import community.community_louvain as louvain
import warnings
warnings.filterwarnings('ignore')

def get_default_data():
    data = [
        {"post_id": 1, "author": "ShadowBroker", "forum": "MarketA", "content": "Selling fresh CVVs. BTC only to 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa. DM me your PGP.", "gpu_timing_hash": "NVIDIA_RTX3080_Hash_7F9A", "monitor": "2560x1440", "timestamp": "2023-10-01T23:15:00Z"},
        {"post_id": 2, "author": "ShadowBroker", "forum": "MarketA", "content": "Restocked the database. Contact me. My key fingerprint is 8F92 3B4C 5D6E 7F8A.", "gpu_timing_hash": "NVIDIA_RTX3080_Hash_7F9A", "monitor": "2560x1440", "timestamp": "2023-10-02T00:30:00Z"},
        {"post_id": 3, "author": "AnonCoder", "forum": "ForumB", "content": "I have an exploit for sale. Price is 0.5 BTC. Send to 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa.", "gpu_timing_hash": "NVIDIA_RTX3080_Hash_7F9A", "monitor": "2560x1440", "timestamp": "2023-10-05T23:45:00Z"},
        {"post_id": 4, "author": "NoobHacker", "forum": "ForumB", "content": "How do I use this tool? Anyone got a tutorial?", "gpu_timing_hash": "INTEL_IRIS_Hash_2B4C", "monitor": "1920x1080", "timestamp": "2023-10-06T14:20:00Z"}, # Different timezone/active hours
        {"post_id": 5, "author": "AnonCoder", "forum": "ForumB", "content": "New zero-day available. Hit me up. PGP: 8F92 3B4C 5D6E 7F8A.", "gpu_timing_hash": "NVIDIA_RTX3080_Hash_7F9A", "monitor": "2560x1440", "timestamp": "2023-10-08T01:10:00Z"},
        {"post_id": 6, "author": "RandomUser", "forum": "MarketA", "content": "Thanks for the tutorial! Much appreciated.", "gpu_timing_hash": "INTEL_IRIS_Hash_2B4C", "monitor": "1920x1080", "timestamp": "2023-10-09T15:00:00Z"},
    ]
    return pd.DataFrame(data)

def extract_entities(df):
    def extract_btc(text):
        m = re.findall(r'\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b', str(text))
        return m[0] if m else None

    def extract_pgp(text):
        m = re.findall(r'\b([A-Fa-f0-9]{4}\s?[A-Fa-f0-9]{4}\s?[A-Fa-f0-9]{4}\s?[A-Fa-f0-9]{4})\b', str(text))
        return m[0].replace(' ', '') if m else None

    df['btc'] = df['content'].apply(extract_btc)
    df['pgp'] = df['content'].apply(extract_pgp)
    return df

def compute_stylometry(df):
    vectorizer = TfidfVectorizer(analyzer='char', ngram_range=(2, 4))
    tfidf_matrix = vectorizer.fit_transform(df['content'])
    df['embedding'] = list(tfidf_matrix.toarray())
    return df

def compute_temporal_correlation(df):
    """
    Extracts the hour from the UTC timestamp and calculates the median active hour for each author.
    This creates a basic 'Sleep Schedule Profile' to infer timezone and operational hours.
    """
    df['datetime'] = pd.to_datetime(df['timestamp'])
    df['hour'] = df['datetime'].dt.hour
    
    # Calculate median active hour for each author
    author_temporal_profiles = df.groupby('author')['hour'].median().to_dict()
    df['median_active_hour'] = df['author'].map(author_temporal_profiles)
    
    return df

def build_graph(df):
    G = nx.Graph()

    # Add nodes (Authors)
    for author in df['author'].unique():
        G.add_node(author)

    # Accumulate evidence
    # edge_evidence[ (u, v) ] = {'weight': 0.0, 'reasons': []}
    edge_evidence = {}

    def add_evidence(u, v, weight, reason):
        # ensure deterministic ordering
        pair = tuple(sorted([u, v]))
        if pair not in edge_evidence:
            edge_evidence[pair] = {'weight': 0.0, 'reasons': []}
        edge_evidence[pair]['weight'] += weight
        edge_evidence[pair]['reasons'].append(reason)

    # Hard Identifiers (BTC, PGP)
    if 'btc' in df.columns:
        for btc in df['btc'].dropna().unique():
            authors = df[df['btc'] == btc]['author'].unique()
            if len(authors) > 1:
                for i in range(len(authors)):
                    for j in range(i+1, len(authors)):
                        add_evidence(authors[i], authors[j], 2.0, 'Shared BTC Address')

    if 'pgp' in df.columns:
        for pgp in df['pgp'].dropna().unique():
            authors = df[df['pgp'] == pgp]['author'].unique()
            if len(authors) > 1:
                for i in range(len(authors)):
                    for j in range(i+1, len(authors)):
                        add_evidence(authors[i], authors[j], 2.0, 'Shared PGP Key')

    # Hardware Fingerprints (Remote GPU Timing & Monitor Resolution)
    if 'gpu_timing_hash' in df.columns:
        for gpu in df['gpu_timing_hash'].dropna().unique():
            authors = df[df['gpu_timing_hash'] == gpu]['author'].unique()
            if len(authors) > 1:
                for i in range(len(authors)):
                    for j in range(i+1, len(authors)):
                        add_evidence(authors[i], authors[j], 2.5, 'Remote GPU Timing Signature Match')

    if 'monitor' in df.columns:
        for monitor in df['monitor'].dropna().unique():
            authors = df[df['monitor'] == monitor]['author'].unique()
            if len(authors) > 1:
                for i in range(len(authors)):
                    for j in range(i+1, len(authors)):
                        add_evidence(authors[i], authors[j], 1.0, 'Shared Monitor Resolution')

    # Temporal Correlation (Sleep Schedule Profiling)
    if 'median_active_hour' in df.columns:
        authors = df['author'].unique()
        for i in range(len(authors)):
            for j in range(i+1, len(authors)):
                hour_i = df[df['author'] == authors[i]]['median_active_hour'].iloc[0]
                hour_j = df[df['author'] == authors[j]]['median_active_hour'].iloc[0]
                
                if abs(hour_i - hour_j) <= 1.5:
                    add_evidence(authors[i], authors[j], 1.5, f'Temporal Correlation: Shared Active Hours (UTC {hour_i:.1f})')

    # Stylistic Similarity (Cosine threshold)
    if 'embedding' in df.columns:
        authors = df['author'].unique()
        for i in range(len(authors)):
            for j in range(i+1, len(authors)):
                emb_i = df[df['author'] == authors[i]]['embedding'].mean(axis=0)
                emb_j = df[df['author'] == authors[j]]['embedding'].mean(axis=0)
                
                sim = cosine_similarity([emb_i], [emb_j])[0][0]
                if sim > 0.15:
                    add_evidence(authors[i], authors[j], sim, f'Stylometric Similarity ({sim:.2f})')

    # Build the final graph from fused evidence
    for (u, v), data in edge_evidence.items():
        # Deduplicate reasons using dict.fromkeys() to maintain deterministic insertion order
        unique_reasons = list(dict.fromkeys(data['reasons']))
        reason_str = " | ".join(unique_reasons)
        G.add_edge(u, v, weight=data['weight'], reason=reason_str)

    return G

def format_cytoscape_json(G):
    # Community Detection (with random_state for deterministic output)
    partition = louvain.best_partition(G, random_state=42)

    # Construct JSON output
    nodes = []
    edges = []

    for author, cluster_id in partition.items():
        nodes.append({
            "data": {
                "id": author,
                "label": author,
                "cluster": cluster_id
            }
        })

    for u, v, data in G.edges(data=True):
        edges.append({
            "data": {
                "source": u,
                "target": v,
                "weight": data['weight'],
                "reason": data['reason']
            }
        })

    return {"nodes": nodes, "edges": edges}

def generate_graph_data():
    """Main pipeline execution for the API."""
    df = get_default_data()
    df = extract_entities(df)
    df = compute_stylometry(df)
    df = compute_temporal_correlation(df) # NEW LAYER: Timezone profiling
    G = build_graph(df)
    return format_cytoscape_json(G)
