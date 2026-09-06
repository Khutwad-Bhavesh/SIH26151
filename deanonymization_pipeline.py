import pandas as pd
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import networkx as nx
import community.community_louvain as louvain
import warnings
warnings.filterwarnings('ignore')

# 1. Synthetic Dataset with Hardware Fingerprints
print("1. Loading Data...")
data = [
    {"post_id": 1, "author": "ShadowBroker", "forum": "MarketA", "content": "Selling fresh CVVs. BTC only to 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa. DM me your PGP.", "gpu_timing_hash": "NVIDIA_RTX3080_Hash_7F9A", "monitor": "2560x1440"},
    {"post_id": 2, "author": "ShadowBroker", "forum": "MarketA", "content": "Restocked the database. Contact me. My key fingerprint is 8F92 3B4C 5D6E 7F8A.", "gpu_timing_hash": "NVIDIA_RTX3080_Hash_7F9A", "monitor": "2560x1440"},
    {"post_id": 3, "author": "AnonCoder", "forum": "ForumB", "content": "I have an exploit for sale. Price is 0.5 BTC. Send to 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa.", "gpu_timing_hash": "NVIDIA_RTX3080_Hash_7F9A", "monitor": "2560x1440"},
    {"post_id": 4, "author": "NoobHacker", "forum": "ForumB", "content": "How do I use this tool? Anyone got a tutorial?", "gpu_timing_hash": "INTEL_IRIS_Hash_2B4C", "monitor": "1920x1080"},
    {"post_id": 5, "author": "AnonCoder", "forum": "ForumB", "content": "New zero-day available. Hit me up. PGP: 8F92 3B4C 5D6E 7F8A.", "gpu_timing_hash": "NVIDIA_RTX3080_Hash_7F9A", "monitor": "2560x1440"},
    {"post_id": 6, "author": "RandomUser", "forum": "MarketA", "content": "Thanks for the tutorial! Much appreciated.", "gpu_timing_hash": "INTEL_IRIS_Hash_2B4C", "monitor": "1920x1080"},
]
df = pd.DataFrame(data)

# 2. Entity Extraction
print("2. Extracting Entities (BTC, PGP)...")
def extract_btc(text):
    m = re.findall(r'\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b', text)
    return m[0] if m else None

def extract_pgp(text):
    m = re.findall(r'\b([A-Fa-f0-9]{4}\s?[A-Fa-f0-9]{4}\s?[A-Fa-f0-9]{4}\s?[A-Fa-f0-9]{4})\b', text)
    return m[0].replace(' ', '') if m else None

df['btc'] = df['content'].apply(extract_btc)
df['pgp'] = df['content'].apply(extract_pgp)

# 3. Stylometric Embeddings (TF-IDF)
print("3. Generating Stylometric Fingerprints (TF-IDF)...")
vectorizer = TfidfVectorizer(analyzer='char', ngram_range=(2, 4))
tfidf_matrix = vectorizer.fit_transform(df['content'])
df['embedding'] = list(tfidf_matrix.toarray())

# 4. Graph Construction
print("4. Building Identity Graph...")
G = nx.Graph()

# Add nodes (Authors)
for author in df['author'].unique():
    G.add_node(author)

# Add edges based on Hard Identifiers (BTC, PGP)
for btc in df['btc'].dropna().unique():
    authors = df[df['btc'] == btc]['author'].unique()
    if len(authors) > 1:
        for i in range(len(authors)):
            for j in range(i+1, len(authors)):
                G.add_edge(authors[i], authors[j], weight=2.0, reason='Shared BTC Address')

for pgp in df['pgp'].dropna().unique():
    authors = df[df['pgp'] == pgp]['author'].unique()
    if len(authors) > 1:
        for i in range(len(authors)):
            for j in range(i+1, len(authors)):
                G.add_edge(authors[i], authors[j], weight=2.0, reason='Shared PGP Key')

# Add edges based on Hardware Fingerprints (Remote GPU Timing)
for gpu in df['gpu_timing_hash'].dropna().unique():
    authors = df[df['gpu_timing_hash'] == gpu]['author'].unique()
    if len(authors) > 1:
        for i in range(len(authors)):
            for j in range(i+1, len(authors)):
                # Only add if edge doesn't exist, or update reason if it's a stronger connection
                if not G.has_edge(authors[i], authors[j]):
                    G.add_edge(authors[i], authors[j], weight=2.5, reason='Remote GPU Timing Signature Match')

for monitor in df['monitor'].dropna().unique():
    authors = df[df['monitor'] == monitor]['author'].unique()
    if len(authors) > 1:
        for i in range(len(authors)):
            for j in range(i+1, len(authors)):
                if not G.has_edge(authors[i], authors[j]):
                    G.add_edge(authors[i], authors[j], weight=1.0, reason='Shared Monitor Resolution')

# Add edges based on Stylistic Similarity (Cosine threshold)
authors = df['author'].unique()
for i in range(len(authors)):
    for j in range(i+1, len(authors)):
        if G.has_edge(authors[i], authors[j]):
            continue 
        
        emb_i = df[df['author'] == authors[i]]['embedding'].mean(axis=0)
        emb_j = df[df['author'] == authors[j]]['embedding'].mean(axis=0)
        
        sim = cosine_similarity([emb_i], [emb_j])[0][0]
        if sim > 0.15:
            G.add_edge(authors[i], authors[j], weight=sim, reason=f'Stylometric Similarity ({sim:.2f})')

# 5. Community Detection
print("5. Running Community Detection (Louvain)...")
partition = louvain.best_partition(G)

# Output Results
print("\n==================================")
print("=== DE-ANONYMIZATION RESULTS ===")
print("==================================\n")
clusters = {}
for author, cluster_id in partition.items():
    clusters.setdefault(cluster_id, []).append(author)

for cid, members in clusters.items():
    print(f"Cluster {cid} (Probable Same Actor): {members}")
    if len(members) > 1:
        print("  Evidence:")
        for i in range(len(members)):
            for j in range(i+1, len(members)):
                if G.has_edge(members[i], members[j]):
                    edge_data = G.get_edge_data(members[i], members[j])
                    print(f"  -> {members[i]} & {members[j]} linked via: {edge_data['reason']}")
    print("-" * 30)
