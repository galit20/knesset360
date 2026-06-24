from fastapi import APIRouter, HTTPException
import pandas as pd

router = APIRouter(prefix="/api/scores", tags=["Scores"]) #define route


@router.get("/road_safety")
async def get_road_safety_scores():
    df = pd.read_csv("../static_data/population.csv") # using static data before API integration to the DB
    df['weighted_points'] = (df['fatal'] * 15) + (df['severe'] * 8) + (df['light'] * 2) # weights for each severity
    df['ratio'] = (df['weighted_points'] / df['population_thousands']) * 100  #calculating accidents for 100,000 people
    df['score'] = 100 - (df['ratio'] * 2) # Calibration factoring
    df['score'] = df['score'].clip(0, 100).round(2) # change to this later maybe (100 - df['score'].clip(0, 100)).round(2)
    result = df[['year', 'month', 'score', 'fatal', 'severe', 'light']].to_dict(orient="records")
    return result


@router.get("/education")
async def get_education_scores():
    df = pd.read_csv("../static_data/Education_data.csv") # using static data before API integration to the DB
    df = df.sort_values('year').ffill() # fill unknown values with the last known value (forward fill)
    
    # we prefer low values teacher students ratio
    df['K_student_teacher_ratio'] = df['K-num_students'] / df['K-num_teachers']
    df['S_student_teacher_ratio'] = df['S-num_students'] / df['S-num_teachers']
    
    # Min-Max Scaling)
    def normalize(series, invert=False):
        low, high = series.min(), series.max()
        if high == low: return 100
        res = (series - low) / (high - low) * 100
        return 100 - res if invert else res

    # invert=True for metrics where lower values are better (e.g., student-teacher ratio, dropout rate)
    infra_score = (
        normalize(df['K-avg_students_per_class'], invert=True) +
        normalize(df['S-avg_students_per_class'], invert=True) +
        normalize(df['K_student_teacher_ratio'], invert=True) +
        normalize(df['S_student_teacher_ratio'], invert=True)
    ) / 4

    # teachers category (we want more teachers with higher skills, so we invert the scores)
    teachers_score = (
        normalize(df['teachers_pre_minimal_skills_percentage'], invert=True) +
        normalize(df['teachers_elementry_min_skills_per'], invert=True) +
        normalize(df['teachers_middle_min_skills_per'], invert=True) +
        normalize(df['teachers_high_min_skills_per'], invert=True)
    ) / 4

    # category of achievements (high graduation = good, low dropout = good)
    success_score = (
        normalize(df['bargut_eligibility']) * 0.6 +
        normalize(df['bargut_eligibility-stem']) * 0.4 + # internal weight for scientific graduation
        normalize(df['Dropout_rate_country'], invert=True)
    ) / 2

    # final score calculation with weights for each category
    df['score'] = (infra_score * 0.3) + (teachers_score * 0.3) + (success_score * 0.4)
    df['score'] = df['score'].round(1)

    return df[['year', 'score', 'bargut_eligibility', 'Dropout_rate_country']].to_dict(orient="records") # return to react



@router.get("/health")
async def get_health_scores():
    df = pd.read_csv("../static_data/population.csv") # using static data before API integration to the DB
    df['weighted_points'] = (df['fatal'] * 15) + (df['severe'] * 8) + (df['light'] * 2) # weights for each severity
    df['ratio'] = (df['weighted_points'] / df['population_thousands']) * 100  #calculating accidents for 100,000 people
    df['score'] = 100 - (df['ratio'] * 2) # Calibration factoring
    df['score'] = df['score'].clip(0, 100).round(2) # change to this later maybe (100 - df['score'].clip(0, 100)).round(2)
    result = df[['year', 'month', 'score', 'fatal', 'severe', 'light']].to_dict(orient="records")
    return result



@router.get("/crime")
async def get_crime_scores():
    df = pd.read_csv("../static_data/population.csv") # using static data before API integration to the DB
    df['weighted_points'] = (df['fatal'] * 15) + (df['severe'] * 8) + (df['light'] * 2) # weights for each severity
    df['ratio'] = (df['weighted_points'] / df['population_thousands']) * 100  #calculating accidents for 100,000 people
    df['score'] = 100 - (df['ratio'] * 2) # Calibration factoring
    df['score'] = df['score'].clip(0, 100).round(2) # change to this later maybe (100 - df['score'].clip(0, 100)).round(2)
    result = df[['year', 'month', 'score', 'fatal', 'severe', 'light']].to_dict(orient="records")
    return result
