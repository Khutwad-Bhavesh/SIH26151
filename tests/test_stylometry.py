import pandas as pd
from backend.analyzer import compute_stylometry
from sklearn.metrics.pairwise import cosine_similarity

def test_st02_different_author_separation():
    # ST-02: Two different authors writing about the exact same topic shouldn't be falsely linked.
    # This proves the embedding captures STYLE, not just topic keywords.
    data = [
        {"post_id": 1, "author": "RussianHacker", "content": "I am selling a zero day exploit for windows 10. Price is high, contact me on jabber. Only serious buyers."},
        {"post_id": 2, "author": "TeenScripter", "content": "yo i got a sick 0day for win 10 hmu if u wanna buy it cheap lol"}
    ]
    df = pd.DataFrame(data)
    df = compute_stylometry(df)
    
    emb1 = df.loc[0, 'embedding']
    emb2 = df.loc[1, 'embedding']
    sim = cosine_similarity([emb1], [emb2])[0][0]
    
    # Assert similarity is below our hardcoded linking threshold (0.15)
    assert sim < 0.15
