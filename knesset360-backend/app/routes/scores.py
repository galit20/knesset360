from fastapi import APIRouter, HTTPException
import pandas as pd

router = APIRouter(prefix="/api/scores", tags=["Scores"]) #define route


@router.get("/road_safety")
async def get_scores():
    df = pd.read_csv("../static_data/population.csv") # using static data before API integration to the DB
    df['weighted_points'] = (df['fatal'] * 15) + (df['severe'] * 8) + (df['light'] * 2) # weights for each severity
    df['ratio'] = (df['weighted_points'] / df['population_thousands']) * 100  #calculating accidents for 100,000 people
    df['score'] = 100 - (df['ratio'] * 2) # Calibration factoring
    df['score'] = df['score'].clip(0, 100).round(2) # change to this later maybe (100 - df['score'].clip(0, 100)).round(2)
    result = df[['year', 'month', 'score', 'fatal', 'severe', 'light']].to_dict(orient="records")
    return result


