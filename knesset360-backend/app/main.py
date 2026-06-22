from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from routes import timeline, trends, scores

import pandas as pd

app = FastAPI()

# --- CORS SETUP ---
# Allow react+vite app to talk with the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(timeline.router)
app.include_router(trends.router)
app.include_router(scores.router)


@app.get("/")
def read_root():
    return {"message": "Welcome to the Knesset360 API!"}
