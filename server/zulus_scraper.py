import requests
from bs4 import BeautifulSoup
from urllib.parse import quote_plus

from scraper import Card

def fetch_product_prices(search_query, show_out_of_stock):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
    }

    safe_query = quote_plus(search_query)

    url = "https://zulusgames.com/search?page=1&q=%2AMTG%20Single%20{0}%2A".format(safe_query)

    # Send a GET request to the website
    response = requests.get(url, headers=headers)

    # Check if the request was successful
    if response.status_code != 200:
        print(f"Failed to retrieve the page: Status code {response.status_code}")
        return []
    
    # Parse the HTML content using BeautifulSoup
    soup = BeautifulSoup(response.content.decode("utf-8"), 'html.parser')

    divs = soup.find_all('div', attrs={'data-producttype': 'MTG Single'})

    results = []

    for div in divs:
        id = div.get('data-productid')
        name = div.find('p', class_="productCard__title").find('a').get_text()
        set = div.find('p', class_="productCard__setName").get_text()
        location = "Zulus"
        image = div.find('img').get("data-src")
        href = "https://zulusgames.com" + div.find('a', class_="productCard__a").get("href")

        outOfStock = div.find('img', class_="productCard__img lazy productCard__img--outOfStock")

        if outOfStock and show_out_of_stock:
            card = Card(id, name, set, "Out of Stock", "Out of Stock", "Out of Stock", location, href, image)
            results.append(card)
            print(card)
        else:
            productDict = {}
            list_items = div.find('ul', class_="productChip__grid").find_all('li', class_="productChip")
            for li in list_items:
                condition = li.get("data-varianttitle")
                quantity = li.get("data-variantqty")
                price = li.get("data-variantprice")

                if quantity != "0":
                    productDict[id + "-" + condition] = Card(id, name, set, price, condition, quantity, location, href, image)
            
            for product in productDict:
                print(productDict[product])
                results.append(productDict[product])
    
    return results

            

# Test code    
search_query = "black lotus"

if __name__ == '__main__':
    r = fetch_product_prices(search_query, True)