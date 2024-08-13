import requests
from bs4 import BeautifulSoup

domains = {
    "Mugu": "mugugames", # https://www.mugugames.com/products/search?q=teferi&c=1
    "GeekFortress": "geekfortressgames", # https://www.geekfortressgames.com/products/search?q=teferi
    "Zulus": "zulusgames", # https://zulusgames.com/search?page=1&q=%2Ateferi%2A
    "StupidGeeks": "stupidgeeksinc" # https://stupidgeeksinc.com/search?type=product&options%5Bprefix%5D=last&q=teferi
}

class Card:
    def __init__(self, id, name, set, price, condition, quantity, link):
        self.id = id
        self.name = name
        self.set = set
        self.price = price
        self.condition = condition
        self.quantity = quantity
        self.link = link
    
    def __str__(self):
        return "ID: {0} NAME: {1} SET: {2} CONDITION: {3} PRICE: {4} QUANTITY: {5} LINK: {6}".format(
            self.id, self.name, self.set, self.condition, self.price, self.quantity, self.link
        )
                

def fetch_product_prices(domain, search_query):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
    }
    
    new_url = "https://www.{0}.com/products/search?q={1}&c=1".format(domain, search_query)

    # Send a GET request to the website
    response = requests.get(new_url, headers=headers)
 
    # Check if the request was successful
    if response.status_code != 200:
        print(f"Failed to retrieve the page: Status code {response.status_code}")
        return []
    
    # Parse the HTML content using BeautifulSoup
    soup = BeautifulSoup(response.content.decode("utf-8"), 'html.parser')
    list_items = soup.find_all('li', class_="product")
            
    results = []

    for li in list_items:
        # Get the first anchor tag. Any anchor should have an href property. 
        anchor = li.find('a')

        # This check to make sure the anchor exists is needed because Geek Fortress
        # lists a product at the end of search results that does not have an anchor tag.
        href = ""
        if anchor:
            href = anchor.get('href')
        
        outOfStock = li.find('div', class_="variant-row no-stock")
        if outOfStock:
            # Get id from last section of the href
            tokens = href.split("/")
            id = tokens[-1]

            name = anchor.get('title')
            set = li.find('span', class_="category").get_text()

            # Add card to list of results.
            card = Card(id, name, set, "Out of Stock", "Out of Stock", "Out of Stock", href)
            results.append(card)
            print(card)
        else:
            productDict = {}
            availableProducts = li.find_all('form', class_='add-to-cart-form')
            
            for product in availableProducts:
                id = product.get('data-id')
                name = product.get('data-name')
                price = product.get('data-price')
                set = product.get('data-category')
                condition = product.get('data-variant')

                # Get quantity from the properties of the input.
                qty = product.find('input', class_='qty')
                quantity = qty.get('max')

                productDict[id] = Card(id, name, set, price, condition, quantity, href)

            # There could be multiple listings for the same card with different conditions.
            for product in productDict:
                print(productDict[product])
                results.append(productDict[product])

    return results

# Test code    
url = domains["GeekFortress"]  # Replace with the actual URL
search_query = "Teferi"  # Replace with the product you're searching for

r = fetch_product_prices(url, search_query)
