from fastapi import APIRouter, HTTPException
from elasticsearch import Elasticsearch

router = APIRouter(prefix="/api/trends", tags=["Trends"]) #define route

es = Elasticsearch("http://localhost:9200")

# Define our subject keyword maps global state
SUBJECT_KEYWORDS = {
    "road_safety": [
        "תאונ*", 
        "תחבור*", 
        "אופניי*", 
        '"הולך רגל"', 
        '"הולכי רגל"', 
        "קסד*"
    ],
    "transportation": [
        "אוטובוס*", 
        "רכבת", 
        "רכבות", 
        "מונית",
        "מוניות"
    ],
    "health": ["בריאות", "חולים", "רופאי*", "בית חולים", "תרופות"],
    "education": ["חינוך", "בתי ספר", "מורים", "תלמידי*", "בגרות"]
}

@router.get("")                # Default for /api/trends
@router.get("/")               # Matches /api/trends/
@router.get("/{subject}")
async def get_subject_timeline(subject: str):
    keywords = SUBJECT_KEYWORDS.get(subject.lower(), [subject])
    
    compiled_query = " OR ".join([kw if '"' in kw else f"*{kw}*" for kw in keywords])
    
    es_query = {
        "size": 0, # count rows
        "query": {
            "query_string": {
                "default_field": "RawText",
                "query": compiled_query
            }
        },
        "aggs": {
            "timeline": {
                "date_histogram": {
                    "field": "StartDate",
                    "calendar_interval": "month",
                    "format": "MM/yy"
                }
            }
        }
    }
    
    response = es.search(index="quotes", body=es_query)
    buckets = response["aggregations"]["timeline"]["buckets"]
    
    # Format for Recharts array parsing
    recharts_compatible_data = []
    for bucket in buckets:
        recharts_compatible_data.append({
            "name": bucket["key_as_string"], # Will show as 'yyyy-mm' on X-Axis
            "mentions": bucket["doc_count"]  # Total sentences matched in that month
        })
        
    return recharts_compatible_data