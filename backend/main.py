# python3 -m uvicorn main:app --reload

from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Backend is working"}

@app.get("/api/hello")
def hello():
    return {"message": "Hello from FastAPI 🚀"}