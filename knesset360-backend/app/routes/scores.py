from fastapi import APIRouter, HTTPException
import pandas as pd

router = APIRouter(prefix="/api/scores", tags=["Scores"]) #define route

# Min-Max Scaling
def normalize(series: pd.Series, invert: bool = False) -> pd.Series:
    low, high = series.min(), series.max()
    if high == low:
        return pd.Series(100, index=series.index)

    res = (series - low) / (high - low) * 100
    return 100 - res if invert else res


@router.get("/road_safety")
async def get_road_safety_scores():
    df = pd.read_csv("../static_data/population.csv") # using static data before API integration to the DB
    df['weighted_points'] = (df['fatal'] * 15) + (df['severe'] * 8) + (df['light'] * 2) # weights for each severity
    df['ratio'] = (df['weighted_points'] / df['population_thousands']) * 100  #calculating accidents for 100,000 people
    df['score'] = 100 - (df['ratio'] * 2) # Calibration factoring
    df['score'] = df['score'].clip(0, 100).round(2) # change to this later maybe (100 - df['score'].clip(0, 100)).round(2)
    return df[['year', 'month', 'score', 'fatal', 'severe', 'light']].to_dict(orient="records")


@router.get("/education")
async def get_education_scores():
    df = pd.read_csv("../static_data/Education_data.csv") # using static data before API integration to the DB
    df = df.sort_values('year').ffill() # fill unknown values with the last known value (forward fill)
    
    # we prefer low values teacher students ratio
    df['K_student_teacher_ratio'] = df['K-num_students'] / df['K-num_teachers']
    df['S_student_teacher_ratio'] = df['S-num_students'] / df['S-num_teachers']
    
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
    df['score'] = (df['score'] - 20).round(1)

    return df[['year', 'month', 'score', 'bargut_eligibility', 'Dropout_rate_country']].to_dict(orient="records") # return to react


@router.get("/health")
async def get_health_scores():
    df = pd.read_csv("../static_data/health.csv") # using static data before API integration to the DB    

    df = df.sort_values(by=['year', 'month']).reset_index(drop=True)
    df = df.ffill()
    df = df.bfill()

    clinical_score = (
        normalize(df['birth_death_rate_1000'], invert=True) +
        normalize(df['avoidable_mortality_percent'], invert=True)
    ) / 2

    total_beds = (df['hospital_beds_general_1000'] + df['hospital_beds_psychic_1000'] + 
                  df['hospital_beds_geriatric_1000'] + df['hospital_beds_rehab_1000'])
    
    total_interns = (df['interns_israel_grad'] + df['interns_abroad_official'] + 
                     df['interns_aboard_unofficial'])

    capacity_score = (
        normalize(df['doctors_per_1000']) +
        normalize(df['nurses_per_1000']) +
        normalize(total_beds) +
        normalize(total_interns)
    ) / 4

    preventive_score = (
        normalize(df['smoking_adults'], invert=True) +
        normalize(df['memograph_women_50_to_74']) +
        normalize(df['underweight_first_grade'], invert=True) +
        normalize(df['underweight_seventh_grade'], invert=True) +
        normalize(df['overweight_first_grade'], invert=True) +
        normalize(df['overweight_seventh_grade'], invert=True)
    ) / 6

    trust_score = (
        normalize(df['trust_health_system_percent']) +
        normalize(df['satisfaction_health_system_percent_20year_up']) +
        normalize(df['complaints_total'], invert=True) +
        normalize(df['complaints_substantiated_total'], invert=True)
    ) / 4

    mental_score = (
        normalize(df['self_observasion_health_percent_20year_up']) +
        normalize(df['depression_feel_20year_up'], invert=True)
    ) / 2

    df['score'] = (
        (clinical_score * 0.25) +
        (capacity_score * 0.15) +
        (preventive_score * 0.15) +
        (trust_score * 0.25) +
        (mental_score * 0.20)
    )
    df['score'] = (df['score'] - 20).round(1)

    # return to react chart
    return df[['year', 'month', 'score', 'birth_death_rate_1000', 'smoking_adults', 'doctors_per_1000']].to_dict(orient="records")



@router.get("/crime")
async def get_crime_scores():
    
    df = pd.read_csv("../static_data/crime_data.csv") # using static data before API integration to the DB
    df = df.ffill().bfill()

    df['total_women_murder'] = (
        df['women_murder_by_spause_jews'] + df['women_murder_by_spause_nonjews'] +
        df['women_murder_by_other_jews'] + df['women_murder_by_other_nonjews']
    )
    
    severe_score = (
        normalize(df['total_women_murder'], invert=True) +
        normalize(df['Offenses_Against_a_Person'], invert=True) +
        normalize(df['Offenses_Against_the_Body'], invert=True) +
        normalize(df['Sexual_Offenses'], invert=True) +
        normalize(df['Security_Offenses'], invert=True)
    ) / 5

    safety_feeling_score = (
        normalize(df['safe_feel_walk_alone_atnight_neighberhood_man']) +
        normalize(df['safe_feel_walk_alone_atnight_neighberhood_woman'])
    ) / 2

    property_order_score = (
        normalize(df['crime_rate_cases_1000'], invert=True) +
        normalize(df['car_steals_per_1000'], invert=True) +
        normalize(df['Property_Offenses'], invert=True) +
        normalize(df['Fraud_Offenses'], invert=True) +
        normalize(df['Public_Order_Offenses'], invert=True) +
        normalize(df['Public_Morality_Offenses'], invert=True)
    ) / 6

    df['score'] = (
        (severe_score * 0.50) +
        (safety_feeling_score * 0.15) +
        (property_order_score * 0.35)
    )
    df['score'] = ((df['score'] / 100) * 60).round(1)

    return df[['year', 'month', 'score']].to_dict(orient="records")
