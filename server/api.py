from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from scraper import domains, fetch_product_prices

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
async def search_mugu(query: str):
    result = fetch_product_prices(domains["Mugu"], query)
    return result

@app.get("/gf")
async def search_gf(query: str):
    result = fetch_product_prices(domains["GeekFortress"], query)
    return result