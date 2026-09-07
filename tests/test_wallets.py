import pandas as pd
from backend.analyzer import extract_entities

def test_wc01_address_extraction_accuracy():
    # Test that regex correctly extracts BTC and PGP without false positives
    data = [
        {"post_id": 1, "author": "User1", "content": "My wallet is 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"},
        {"post_id": 2, "author": "User2", "content": "My key is 8F92 3B4C 5D6E 7F8A"},
        {"post_id": 3, "author": "User3", "content": "Here is a random number 1234567890"}
    ]
    df = pd.DataFrame(data)
    df = extract_entities(df)
    
    assert df.loc[0, 'btc'] == "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
    assert df.loc[1, 'pgp'] == "8F923B4C5D6E7F8A" # Spaces stripped
    assert df.loc[2, 'btc'] is None
    assert df.loc[2, 'pgp'] is None

def test_wc02_wallet_reuse_detection():
    # Test that when extracted, they are recognized as the same entity
    data = [
        {"post_id": 1, "author": "AliasA", "content": "BTC to 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"},
        {"post_id": 2, "author": "AliasB", "content": "BTC to 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"}
    ]
    df = pd.DataFrame(data)
    df = extract_entities(df)
    
    assert df.loc[0, 'btc'] == df.loc[1, 'btc']
