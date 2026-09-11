import networkx as nx
import community.community_louvain as louvain
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd

class GraphBuilder:
    """
    Graph construction and Community Detection module.
    In production, this interfaces directly with Neo4j.
    """

    @staticmethod
    def build_network(df: pd.DataFrame) -> nx.Graph:
        G = nx.Graph()

        # Add nodes
        for author in df['author'].unique():
            G.add_node(author)

        edge_evidence = {}

        def add_evidence(u, v, weight, reason):
            pair = tuple(sorted([u, v]))
            if pair not in edge_evidence:
                edge_evidence[pair] = {'weight': 0.0, 'reasons': []}
            edge_evidence[pair]['weight'] += weight
            edge_evidence[pair]['reasons'].append(reason)

        authors = df['author'].unique()
        
        # Hard Identifiers (BTC, PGP, Infra)
        for col, weight, reason_text in [
            ('infrastructure_id', 10.0, 'CRITICAL: Shared Infrastructure / SSH Key'),
            ('btc', 8.0, 'CRITICAL: Shared Crypto Wallet Link'), 
            ('pgp', 3.0, 'Shared PGP Key')
        ]:
            if col in df.columns:
                for val in df[col].dropna().unique():
                    matched = df[df[col] == val]['author'].unique()
                    if len(matched) > 1:
                        for i in range(len(matched)):
                            for j in range(i+1, len(matched)):
                                add_evidence(matched[i], matched[j], weight, reason_text)

        # Hardware Fingerprints
        for col, weight, reason_text in [('gpu_timing_hash', 2.5, 'Remote GPU Timing Signature Match'), ('monitor', 1.0, 'Shared Monitor Resolution')]:
            if col in df.columns:
                for val in df[col].dropna().unique():
                    matched = df[df[col] == val]['author'].unique()
                    if len(matched) > 1:
                        for i in range(len(matched)):
                            for j in range(i+1, len(matched)):
                                add_evidence(matched[i], matched[j], weight, reason_text)

        # Temporal Correlation
        if 'median_active_hour' in df.columns:
            for i in range(len(authors)):
                for j in range(i+1, len(authors)):
                    hour_i = df[df['author'] == authors[i]]['median_active_hour'].iloc[0]
                    hour_j = df[df['author'] == authors[j]]['median_active_hour'].iloc[0]
                    if abs(hour_i - hour_j) <= 1.5:
                        add_evidence(authors[i], authors[j], 1.5, f'Temporal Correlation: Shared Active Hours (UTC {hour_i:.1f})')

        # Stylistic Similarity
        if 'embedding' in df.columns:
            for i in range(len(authors)):
                for j in range(i+1, len(authors)):
                    emb_i = df[df['author'] == authors[i]]['embedding'].mean(axis=0)
                    emb_j = df[df['author'] == authors[j]]['embedding'].mean(axis=0)
                    sim = cosine_similarity([emb_i], [emb_j])[0][0]
                    if sim > 0.15:
                        add_evidence(authors[i], authors[j], sim, f'Stylometric Similarity ({sim:.2f})')

        # Build Graph
        for (u, v), data in edge_evidence.items():
            unique_reasons = list(dict.fromkeys(data['reasons']))
            reason_str = " | ".join(unique_reasons)
            G.add_edge(u, v, weight=data['weight'], reason=reason_str)

        return G

    @staticmethod
    def format_for_cytoscape(G: nx.Graph, df: pd.DataFrame, target=None) -> dict:
        """Runs Louvain clustering and formats for frontend consumption."""
        partition = louvain.best_partition(G, random_state=42)

        if target:
            target_lower = target.lower()
            matched_author = next((author for author in partition if author.lower() == target_lower), None)
            
            if not matched_author:
                raise ValueError(f"Target '{target}' not found in the database.")
                
            target_cluster = partition[matched_author]
            partition = {k: v for k, v in partition.items() if v == target_cluster}

        nodes = []
        for author, cluster_id in partition.items():
            author_df = df[df['author'] == author]
            
            # Extract metadata (first non-null value for each)
            pgp = author_df['pgp'].dropna().iloc[0] if 'pgp' in author_df.columns and not author_df['pgp'].dropna().empty else "UNKNOWN"
            btc = author_df['btc'].dropna().iloc[0] if 'btc' in author_df.columns and not author_df['btc'].dropna().empty else "UNKNOWN"
            gpu = author_df['gpu_timing_hash'].dropna().iloc[0] if 'gpu_timing_hash' in author_df.columns and not author_df['gpu_timing_hash'].dropna().empty else "UNKNOWN"
            infra = author_df['infrastructure_id'].dropna().iloc[0] if 'infrastructure_id' in author_df.columns and not author_df['infrastructure_id'].dropna().empty else "UNKNOWN"
            
            nodes.append({
                "data": {
                    "id": author,
                    "label": author,
                    "cluster": cluster_id,
                    "pgp": pgp,
                    "btc": btc,
                    "gpu": gpu,
                    "infra": infra
                }
            })
        
        edges = []
        for u, v, data in G.edges(data=True):
            if u in partition and v in partition:
                edges.append({"data": {"source": u, "target": v, "weight": data['weight'], "reason": data['reason']}})

        return {"nodes": nodes, "edges": edges}
