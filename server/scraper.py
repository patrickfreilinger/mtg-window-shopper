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

def has_matching_data_name(form, target_data_name):
    data_name = form.get('data-name', '').lower()
    return data_name == target_data_name

def fetch_product_prices(url, search_query):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
    }
    
    new_url = "https://www.{0}.com/products/search?q={1}&c=1".format(url, search_query)

    print(new_url)
    # Send a GET request to the website
    response = requests.get(new_url, headers=headers)
 
    # Check if the request was successful
    if response.status_code != 200:
        print(f"Failed to retrieve the page: Status code {response.status_code}")
        return []
    
    # Parse the HTML content using BeautifulSoup
    f = open("scraped_content.txt", "w")
    f.write(response.content.decode("utf-8"))
    f.close()   
    
    soup = BeautifulSoup(response.content.decode("utf-8"), 'html.parser')
    list_items = soup.find_all('li', class_="product")
            
    result = []

    for l in list_items:
        anchor = l.find('a')

        href = None
        if anchor:
            href = anchor.get('href')
            
        products = l.find_all('form', class_='add-to-cart-form')

        filtered_products = {}
        for x in products:
            id = x.get('data-id')
            name = x.get('data-name')
            price = x.get('data-price')
            set = x.get('data-category')
            condition = x.get('data-variant')

            quantity = None
            qty = x.find('input', class_='qty')
            if qty:
                quantity = qty.get('max')

            if id and price and name and set and condition and quantity and href:
                filtered_products[id] = Card(id, name, set, price, condition, quantity, href)

        for product in filtered_products:
            print("ID:", filtered_products[product].id,
                "NAME:", filtered_products[product].name,
                "SET", filtered_products[product].set,
                "CONDITION", filtered_products[product].condition,
                "PRICE:", filtered_products[product].price,
                "QUANTITY:", filtered_products[product].quantity,
                "LINK:", filtered_products[product].link,
            )
            result.append(filtered_products[product])

    return result
        
url = domains["GeekFortress"]  # Replace with the actual URL
search_query = "Teferi"  # Replace with the product you're searching for

r = fetch_product_prices(url, search_query)
