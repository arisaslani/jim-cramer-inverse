import sys
sys.path.append('/opt/.manus/.sandbox-runtime')
from data_api import ApiClient
import json
import time
from datetime import datetime, timedelta

def get_stock_data(symbol, range="5y", interval="1mo"):
    """
    Retrieve stock data from Yahoo Finance API
    
    Args:
        symbol (str): Stock symbol (e.g., AAPL, TSLA)
        range (str): Time range (e.g., 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)
        interval (str): Data interval (e.g., 1m, 2m, 5m, 15m, 30m, 60m, 1d, 1wk, 1mo)
        
    Returns:
        dict: Stock data including price history and metadata
    """
    client = ApiClient()
    
    try:
        # Call Yahoo Finance API to get stock chart data
        result = client.call_api('YahooFinance/get_stock_chart', query={
            'symbol': symbol,
            'region': 'US',
            'interval': interval,
            'range': range,
            'includeAdjustedClose': True
        })
        
        return result
    except Exception as e:
        print(f"Error retrieving stock data for {symbol}: {e}")
        return None

def get_stock_insights(symbol):
    """
    Retrieve stock insights from Yahoo Finance API
    
    Args:
        symbol (str): Stock symbol (e.g., AAPL, TSLA)
        
    Returns:
        dict: Stock insights including technical events, valuation, etc.
    """
    client = ApiClient()
    
    try:
        # Call Yahoo Finance API to get stock insights
        result = client.call_api('YahooFinance/get_stock_insights', query={
            'symbol': symbol
        })
        
        return result
    except Exception as e:
        print(f"Error retrieving stock insights for {symbol}: {e}")
        return None

def process_stock_data(stock_data):
    """
    Process raw stock data into a format suitable for charting
    
    Args:
        stock_data (dict): Raw stock data from Yahoo Finance API
        
    Returns:
        dict: Processed stock data for charting
    """
    if not stock_data or 'chart' not in stock_data or 'result' not in stock_data['chart'] or not stock_data['chart']['result']:
        return None
    
    result = stock_data['chart']['result'][0]
    
    # Extract metadata
    meta = result['meta']
    
    # Extract timestamp and price data
    timestamps = result['timestamp']
    indicators = result['indicators']
    
    quote = indicators['quote'][0]
    close_prices = quote['close']
    open_prices = quote['open']
    high_prices = quote['high']
    low_prices = quote['low']
    volumes = quote['volume']
    
    # Get adjusted close prices if available
    adj_close_prices = None
    if 'adjclose' in indicators and indicators['adjclose']:
        adj_close_prices = indicators['adjclose'][0]['adjclose']
    
    # Create processed data structure
    processed_data = {
        'meta': {
            'symbol': meta.get('symbol'),
            'currency': meta.get('currency'),
            'exchange': meta.get('exchangeName'),
            'company_name': meta.get('shortName') or meta.get('longName')
        },
        'prices': []
    }
    
    # Combine timestamp and price data
    for i in range(len(timestamps)):
        if i < len(close_prices) and close_prices[i] is not None:
            data_point = {
                'date': datetime.fromtimestamp(timestamps[i]).strftime('%Y-%m-%d'),
                'timestamp': timestamps[i],
                'close': close_prices[i],
                'open': open_prices[i] if i < len(open_prices) and open_prices[i] is not None else None,
                'high': high_prices[i] if i < len(high_prices) and high_prices[i] is not None else None,
                'low': low_prices[i] if i < len(low_prices) and low_prices[i] is not None else None,
                'volume': volumes[i] if i < len(volumes) and volumes[i] is not None else None
            }
            
            if adj_close_prices and i < len(adj_close_prices) and adj_close_prices[i] is not None:
                data_point['adjClose'] = adj_close_prices[i]
            
            processed_data['prices'].append(data_point)
    
    return processed_data

def find_cramer_recommendations_for_stock(symbol):
    """
    Find Jim Cramer's recommendations for a specific stock
    
    Args:
        symbol (str): Stock symbol (e.g., AAPL, TSLA)
        
    Returns:
        list: Cramer's recommendations for the stock
    """
    try:
        # Load Cramer recommendations from JSON file
        with open('/home/ubuntu/inverse-cramer-project/inverse-cramer/src/lib/data/cramer_recommendations.json', 'r') as f:
            all_recommendations = json.load(f)
        
        # Filter recommendations for the specified stock
        stock_recommendations = [rec for rec in all_recommendations if rec['ticker'].upper() == symbol.upper()]
        
        return stock_recommendations
    except Exception as e:
        print(f"Error finding Cramer recommendations for {symbol}: {e}")
        return []

def get_stock_with_cramer_recommendations(symbol):
    """
    Get stock data and Cramer recommendations for a specific stock
    
    Args:
        symbol (str): Stock symbol (e.g., AAPL, TSLA)
        
    Returns:
        dict: Combined stock data and Cramer recommendations
    """
    # Get stock data
    stock_data = get_stock_data(symbol, range="5y", interval="1mo")
    processed_data = process_stock_data(stock_data)
    
    # Get Cramer recommendations
    recommendations = find_cramer_recommendations_for_stock(symbol)
    
    # Combine data
    result = {
        'stock_data': processed_data,
        'cramer_recommendations': recommendations
    }
    
    # Save combined data to file
    output_file = f'/home/ubuntu/inverse-cramer-project/inverse-cramer/src/lib/data/{symbol.lower()}_data.json'
    with open(output_file, 'w') as f:
        json.dump(result, f, indent=2)
    
    print(f"Stock data and Cramer recommendations for {symbol} saved to {output_file}")
    
    return result

if __name__ == "__main__":
    # Test with a few example stocks
    test_symbols = ["AAPL", "TSLA", "AMZN", "NVDA", "NFLX"]
    
    for symbol in test_symbols:
        print(f"Processing {symbol}...")
        get_stock_with_cramer_recommendations(symbol)
        time.sleep(1)  # Avoid rate limiting
