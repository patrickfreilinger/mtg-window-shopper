import requests
from bs4 import BeautifulSoup
from urllib.parse import quote_plus

storeNames = {
    "mugugames": "Mugu Games", # https://www.mugugames.com/products/search?q=teferi&c=1
    "geekfortressgames": "Geek Fortress", # https://www.geekfortressgames.com/products/search?q=teferi
    "zulusgames": "Zulu's", # https://zulusgames.com/search?page=1&q=%2Ateferi%2A
    "stupidgeeksinc": "Stupid Geeks" # https://stupidgeeksinc.com/search?type=product&options%5Bprefix%5D=last&q=teferi
}

class Card:
    def __init__(self, id, name, set, price, condition, quantity, location, link, image):
        self.id = id
        self.name = name
        self.set = set
        self.price = price
        self.condition = condition
        self.quantity = quantity
        self.location = location
        self.link = link
        self.image = image
    
    def __str__(self):
        return "ID: {0} NAME: {1} SET: {2} CONDITION: {3} PRICE: {4} QUANTITY: {5} LOCATION: {6} LINK: {7} IMAGE: {8}".format(
            self.id, self.name, self.set, self.condition, self.price, self.quantity, self.location, self.link, self.image
        )
                
def fetch_product_prices(domain, search_query, show_out_of_stock, min_price, max_price):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
    }
    
    safe_query = quote_plus(search_query)
    category = "1"

    if domain == "mugugames":
        category = "8" # Code for Magic singles on Mugu Games.
    elif domain == "geekfortressgames":
        category = "13362" # Code for Magic singles on Geek Fortress.

    new_url = "https://www.{0}.com/advanced_search?utf8=%E2%9C%93&search%5Bfuzzy_search%5D={1}&search%5Bcategory_ids_with_descendants%5D%5B%5D={2}&search%5Bin_stock%5D={3}&buylist_mode=0&search%5Bsell_price_gte%5D={4}&search%5Bsell_price_lte%5D={5}".format(domain, safe_query, category, int(not show_out_of_stock), min_price, max_price)

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
            location = storeNames[domain]
            image = anchor.find('img').get('src')

            # Add card to list of results.
            card = Card(id, name, set, "Out of Stock", "Out of Stock", "Out of Stock", location, href, image)
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

                location = storeNames[domain]
                image = anchor.find('img').get('src')

                productDict[id + "-" + condition] = Card(id, name, set, price, condition, quantity, location, href, image)

            # There could be multiple listings for the same card with different conditions.
            for product in productDict:
                print(productDict[product])
                results.append(productDict[product])

    return results

# Test code    
url = "mugugames"
search_query = "jace, architect of thought"

r = fetch_product_prices(url, search_query, False, "1.00", "5.00")
