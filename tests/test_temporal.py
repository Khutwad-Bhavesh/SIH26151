import pandas as pd
from backend.analyzer import compute_temporal_correlation

def test_temporal_correlation():
    # Arrange: Create test data with known UTC timestamps
    data = [
        {"author": "UserA", "timestamp": "2023-10-01T23:00:00Z"},
        {"author": "UserA", "timestamp": "2023-10-02T23:30:00Z"}, # median active hour = 23
        {"author": "UserB", "timestamp": "2023-10-01T04:15:00Z"},
        {"author": "UserB", "timestamp": "2023-10-02T05:45:00Z"}, # median active hour = 4.5 -> 4
    ]
    df = pd.DataFrame(data)
    
    # Act
    result_df = compute_temporal_correlation(df)
    
    # Assert
    # Check that median_active_hour is correctly assigned
    user_a_median = result_df[result_df['author'] == 'UserA']['median_active_hour'].iloc[0]
    user_b_median = result_df[result_df['author'] == 'UserB']['median_active_hour'].iloc[0]
    
    assert user_a_median == 23.0
    assert user_b_median == 4.5
