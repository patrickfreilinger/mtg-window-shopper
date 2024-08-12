from fastapi import FastAPI

app = FastAPI()

@app.get("/get-message")
async def read_root():
    return {"Message": "Hello World"}