import sys
sys.path.append('/opt/.manus/.sandbox-runtime')
from data_api import ApiClient
import json
import re
import time

def search_cramer_recommendations():
    client = ApiClient()
    
    # Search queries to find Jim Cramer's stock recommendations
    search_queries = [
        "from:jimcramer buy stock",
        "from:jimcramer sell stock",
        "from:jimcramer bullish on",
        "from:jimcramer bearish on",
        "from:jimcramer recommend",
        "from:jimcramer $"
    ]
    
    all_recommendations = []
    
    for query in search_queries:
        print(f"Searching for: {query}")
        try:
            # Search Twitter for Jim Cramer's tweets
            results = client.call_api('Twitter/search_twitter', query={
                'query': query,
                'count': 100,
                'type': 'Latest'
            })
            
            # Process results
            if results and 'result' in results and 'timeline' in results['result']:
                process_twitter_results(results, all_recommendations)
                
            # Sleep to avoid rate limiting
            time.sleep(1)
            
        except Exception as e:
            print(f"Error searching Twitter: {e}")
    
    # Save recommendations to a JSON file
    with open('/home/ubuntu/inverse-cramer-project/inverse-cramer/src/lib/cramer_recommendations.json', 'w') as f:
        json.dump(all_recommendations, f, indent=2)
    
    print(f"Found {len(all_recommendations)} recommendations")
    return all_recommendations

def process_twitter_results(results, all_recommendations):
    if not results or 'result' not in results or 'timeline' not in results['result']:
        return
    
    timeline = results['result']['timeline']
    if 'instructions' not in timeline:
        return
    
    for instruction in timeline['instructions']:
        if 'entries' not in instruction:
            continue
        
        for entry in instruction['entries']:
            if 'content' not in entry:
                continue
            
            content = entry['content']
            if 'items' not in content:
                continue
            
            for item in content['items']:
                if 'item' not in item or 'itemContent' not in item['item']:
                    continue
                
                item_content = item['item']['itemContent']
                
                # Extract tweet text and metadata
                tweet_data = extract_tweet_data(item_content)
                if tweet_data and is_stock_recommendation(tweet_data['text']):
                    all_recommendations.append(tweet_data)

def extract_tweet_data(item_content):
    # This function extracts relevant tweet data
    # The structure might need adjustments based on actual API response
    try:
        if 'tweet_results' in item_content and 'result' in item_content['tweet_results']:
            tweet = item_content['tweet_results']['result']
            
            # Extract user info
            user_info = None
            if 'core' in tweet and 'user_results' in tweet['core'] and 'result' in tweet['core']['user_results']:
                user = tweet['core']['user_results']['result']
                user_info = {
                    'name': user['legacy']['name'] if 'legacy' in user and 'name' in user['legacy'] else 'Unknown',
                    'screen_name': user['legacy']['screen_name'] if 'legacy' in user and 'screen_name' in user['legacy'] else 'Unknown'
                }
            
            # Extract tweet text and date
            tweet_info = None
            if 'legacy' in tweet:
                legacy = tweet['legacy']
                tweet_info = {
                    'text': legacy.get('full_text', ''),
                    'created_at': legacy.get('created_at', ''),
                    'id': legacy.get('id_str', '')
                }
            
            if user_info and tweet_info:
                return {
                    'user': user_info,
                    'text': tweet_info['text'],
                    'created_at': tweet_info['created_at'],
                    'id': tweet_info['id'],
                    'stock_symbols': extract_stock_symbols(tweet_info['text']),
                    'sentiment': determine_sentiment(tweet_info['text'])
                }
    except Exception as e:
        print(f"Error extracting tweet data: {e}")
    
    return None

def extract_stock_symbols(text):
    # Extract stock symbols (e.g., $AAPL, $TSLA)
    symbols = re.findall(r'\$([A-Za-z]{1,5})', text)
    return list(set([symbol.upper() for symbol in symbols]))

def determine_sentiment(text):
    # Simple sentiment analysis for buy/sell recommendations
    text = text.lower()
    
    buy_keywords = ['buy', 'bullish', 'long', 'positive', 'up', 'recommend', 'like', 'good']
    sell_keywords = ['sell', 'bearish', 'short', 'negative', 'down', 'avoid', 'bad']
    
    buy_score = sum(1 for keyword in buy_keywords if keyword in text)
    sell_score = sum(1 for keyword in sell_keywords if keyword in text)
    
    if buy_score > sell_score:
        return 'buy'
    elif sell_score > buy_score:
        return 'sell'
    else:
        return 'neutral'

def is_stock_recommendation(text):
    # Check if the tweet is likely a stock recommendation
    text = text.lower()
    
    # Look for stock symbols
    has_symbol = bool(re.search(r'\$[A-Za-z]{1,5}', text))
    
    # Look for recommendation keywords
    recommendation_keywords = ['buy', 'sell', 'bullish', 'bearish', 'long', 'short', 
                              'recommend', 'like', 'avoid', 'positive', 'negative']
    has_recommendation = any(keyword in text for keyword in recommendation_keywords)
    
    return has_symbol and has_recommendation

if __name__ == "__main__":
    search_cramer_recommendations()
