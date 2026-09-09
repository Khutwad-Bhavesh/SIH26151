import re
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class StylometryEngine:
    """
    NLP and Machine Learning pipeline for Author Attribution.
    """
    
    @staticmethod
    def extract_entities(df: pd.DataFrame) -> pd.DataFrame:
        def extract_btc(text):
            m = re.findall(r'\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b', str(text))
            return m[0] if m else None

        def extract_pgp(text):
            m = re.findall(r'\b([A-Fa-f0-9]{4}\s?[A-Fa-f0-9]{4}\s?[A-Fa-f0-9]{4}\s?[A-Fa-f0-9]{4})\b', str(text))
            return m[0].replace(' ', '') if m else None

        df['btc'] = df['content'].apply(extract_btc)
        df['pgp'] = df['content'].apply(extract_pgp)
        return df

    @staticmethod
    def compute_tfidf_embeddings(df: pd.DataFrame) -> pd.DataFrame:
        vectorizer = TfidfVectorizer(analyzer='char', ngram_range=(2, 4))
        tfidf_matrix = vectorizer.fit_transform(df['content'])
        df['embedding'] = list(tfidf_matrix.toarray())
        return df

    @staticmethod
    def compute_temporal_correlation(df: pd.DataFrame) -> pd.DataFrame:
        """
        Extracts the hour from the UTC timestamp and calculates the median active hour for each author.
        """
        df['datetime'] = pd.to_datetime(df['timestamp'])
        df['hour'] = df['datetime'].dt.hour
        
        author_temporal_profiles = df.groupby('author')['hour'].median().to_dict()
        df['median_active_hour'] = df['author'].map(author_temporal_profiles)
        return df

    @staticmethod
    def process_pipeline(df: pd.DataFrame) -> pd.DataFrame:
        """Run the full feature extraction pipeline."""
        df = StylometryEngine.extract_entities(df)
        df = StylometryEngine.compute_tfidf_embeddings(df)
        df = StylometryEngine.compute_temporal_correlation(df)
        return df
