from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from scraper import fetch_product_prices as fetch_mugu_or_gf
from zulus_scraper import fetch_product_prices as fetch_zulus

app = FastAPI()

# Allow traffic from localhost to get around CORS policy.
origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/mugu")
async def search_mugu(searchQuery: str, showOOS: bool, minPrice: str, maxPrice: str):
    result = fetch_mugu_or_gf("mugugames", searchQuery, showOOS, minPrice, maxPrice)
    return result

@app.get("/gf")
async def search_gf(searchQuery: str, showOOS: bool, minPrice: str, maxPrice: str):
    result = fetch_mugu_or_gf("geekfortressgames", searchQuery, showOOS, minPrice, maxPrice)
    return result

@app.get("/zulus")
async def search_gf(searchQuery: str, showOOS: bool, minPrice: str, maxPrice: str):
    result = fetch_zulus(searchQuery, showOOS)
    return result