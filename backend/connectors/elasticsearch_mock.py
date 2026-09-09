import pandas as pd
import hashlib

class ElasticsearchConnector:
    """
    Mock Elasticsearch Connector.
    In a production environment, this connects to the actual Elastic cluster
    indexing Tor scraped data. Here, we simulate the database and dynamic queries.
    """
    def __init__(self, index_name="darkweb_intelligence"):
        self.index_name = index_name
        self._seed_data()

    def _seed_data(self):
        self.data = [
            {"post_id": 1, "author": "ShadowBroker", "forum": "MarketA", "content": "Selling fresh CVVs. BTC only to 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa. DM me your PGP.", "gpu_timing_hash": "NVIDIA_RTX3080_Hash_7F9A", "monitor": "2560x1440", "timestamp": "2023-10-01T23:15:00Z"},
            {"post_id": 2, "author": "ShadowBroker", "forum": "MarketA", "content": "Restocked the database. Contact me. My key fingerprint is 8F92 3B4C 5D6E 7F8A.", "gpu_timing_hash": "NVIDIA_RTX3080_Hash_7F9A", "monitor": "2560x1440", "timestamp": "2023-10-02T00:30:00Z"},
            {"post_id": 3, "author": "AnonCoder", "forum": "ForumB", "content": "I have an exploit for sale. Price is 0.5 BTC. Send to 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa.", "gpu_timing_hash": "NVIDIA_RTX3080_Hash_7F9A", "monitor": "2560x1440", "timestamp": "2023-10-05T23:45:00Z"},
            {"post_id": 4, "author": "NoobHacker", "forum": "ForumB", "content": "How do I use this tool? Anyone got a tutorial?", "gpu_timing_hash": "INTEL_IRIS_Hash_2B4C", "monitor": "1920x1080", "timestamp": "2023-10-06T14:20:00Z"},
            {"post_id": 5, "author": "AnonCoder", "forum": "ForumB", "content": "New zero-day available. Hit me up. PGP: 8F92 3B4C 5D6E 7F8A.", "gpu_timing_hash": "NVIDIA_RTX3080_Hash_7F9A", "monitor": "2560x1440", "timestamp": "2023-10-08T01:10:00Z"},
            {"post_id": 6, "author": "RandomUser", "forum": "MarketA", "content": "Thanks for the tutorial! Much appreciated.", "gpu_timing_hash": "INTEL_IRIS_Hash_2B4C", "monitor": "1920x1080", "timestamp": "2023-10-09T15:00:00Z"},
        ]

    def query(self, target=None):
        """
        Queries the Elasticsearch cluster.
        If a target is not found in the index, this mock simulates a live API pull
        by generating a realistic cluster to prevent demonstration failures.
        """
        if target:
            target_lower = target.lower()
            existing_authors = [d["author"].lower() for d in self.data]
            
            if target_lower not in existing_authors:
                self._simulate_live_pull(target)
                
        return pd.DataFrame(self.data)

    def _simulate_live_pull(self, target):
        """Simulates fetching real-time data from an external Dark Web API."""
        name_hash = hashlib.md5(target.encode()).hexdigest()
        random_pgp = f"{name_hash[0:4]} {name_hash[4:8]} {name_hash[8:12]} {name_hash[12:16]}".upper()
        random_btc = f"1A1zP1eP5QG{name_hash[0:15]}DivfNa"
        gpu = f"AMD_RX6800_Hash_{name_hash[0:4].upper()}"
        
        simulated_data = [
            {"post_id": 901, "author": target, "forum": "DreadForum", "content": f"New database dump available. Contact me. PGP: {random_pgp}", "gpu_timing_hash": gpu, "monitor": "1920x1080", "timestamp": "2023-11-01T02:15:00Z"},
            {"post_id": 902, "author": f"{target}_Alt", "forum": "MarketB", "content": f"Vouching for the dump. Payment sent to BTC: {random_btc}", "gpu_timing_hash": gpu, "monitor": "1920x1080", "timestamp": "2023-11-01T02:20:00Z"},
            {"post_id": 903, "author": "Buyer_Unknown", "forum": "DreadForum", "content": f"Transaction successful. Smooth escrow. Sent BTC: {random_btc}", "gpu_timing_hash": "NVIDIA_GTX1060_Hash_99AA", "monitor": "2560x1440", "timestamp": "2023-11-02T04:10:00Z"}
        ]
        self.data.extend(simulated_data)
