import pandas as pd
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import networkx as nx
import community.community_louvain as louvain
import warnings
warnings.filterwarnings('ignore')

import warnings
warnings.filterwarnings('ignore')

from connectors.elasticsearch_mock import ElasticsearchConnector
from ml.stylometry import StylometryEngine
from graph.builder import GraphBuilder

def generate_graph_data(target=None):
    """
    Main Enterprise Pipeline Execution for the API.
    1. Ingestion / Data Lake query (Mocked via ElasticsearchConnector)
    2. Feature Extraction (StylometryEngine)
    3. Graph Construction & Community Detection (GraphBuilder)
    """
    # 1. Query the Data Lake
    es = ElasticsearchConnector()
    df = es.query(target=target)
    
    # 2. Extract Entities & Run ML Profiling
    df = StylometryEngine.process_pipeline(df)
    
    # 3. Build the Network Graph & Detect Communities
    G = GraphBuilder.build_network(df)
    
    # 4. Format for UI consumption
    return GraphBuilder.format_for_cytoscape(G, df, target=target)
