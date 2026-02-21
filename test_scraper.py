import requests
from bs4 import BeautifulSoup

def test_scrape():
    url = "https://events.yorku.ca/"
    headers = {"User-Agent": "Mozilla/5.0"}
    try:
        response = requests.get(url, headers=headers)
        print(f"Status Code: {response.status_code}")
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Look for event cards or list items
        events = soup.find_all(['article', 'div'], class_=lambda x: x and 'event' in x.lower())
        print(f"Found {len(events)} elements with 'event' class.")
        
        for e in events[:2]:
            print("---")
            title = e.find(['h2', 'h3'])
            print(f"Title: {title.text.strip() if title else 'No Title'}")
            print(f"HTML Preview: {str(e)[:200]}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_scrape()
