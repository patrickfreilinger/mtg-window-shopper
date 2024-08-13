from fastapi import FastAPI
from scraper import domains, fetch_product_prices

app = FastAPI()

@app.get("/mugu")
async def search_mugu(query: str):
    result = fetch_product_prices(domains["Mugu"], query)
    return result

@app.get("/gf")
async def search_gf(query: str):
    result = fetch_product_prices(domains["GeekFortress"], query)
    return result