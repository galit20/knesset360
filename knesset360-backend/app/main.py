from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from routes import timeline

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

@app.get("/")
def read_root():
    return {"message": "Welcome to the Knesset360 API!"}


@app.get("/api/traffic_score")
def get_scores():
    df = pd.read_csv("../static_data/population.csv") # using static data before API integration to the DB
    df['weighted_points'] = (df['fatal'] * 15) + (df['severe'] * 8) + (df['light'] * 2) # weights for each severity
    df['ratio'] = (df['weighted_points'] / df['population_thousands']) * 100  #calculating accidents for 100,000 people
    df['score'] = 100 - (df['ratio'] * 2) # Calibration factoring
    df['score'] = df['score'].clip(0, 100).round(2) # change to this later maybe (100 - df['score'].clip(0, 100)).round(2)
    result = df[['year', 'month', 'score', 'fatal', 'severe', 'light']].to_dict(orient="records")
    return result
