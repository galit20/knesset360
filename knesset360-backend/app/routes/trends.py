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


@router.get("/{doc_type}/{subject}/top_mks")
async def get_top_mks_by_subject(doc_type: str, subject: str, limit: int = 15):
    keywords = SUBJECT_KEYWORDS.get(subject.lower(), [subject])
    compiled_query = " OR ".join([kw if '"' in kw else f"*{kw}*" for kw in keywords])
    formatted_doc_type = doc_type.capitalize() # Capitalize doc_type

    es_query = {
        "size": 0,
        "query": {
            "bool": {
                "must": [
                    {
                        "query_string": {
                            "default_field": "RawText",
                            "query": compiled_query
                        }
                    }
                ],
                "filter": [ 
                    {"exists": {"field": "PersonID"}},  # Not Null PersonID, ensures we only count actual MKs
                    {"term": {"DocType": formatted_doc_type }} 
                ]
            }
        },
        "aggs": {
            "top_speakers": {
                "terms": {
                    "field": "PersonID",
                    "size": limit  # Limit the number of top MKs returned based on the query parameter
                },
                "aggs": {
                    "speaker_name": {
                        "terms": {
                            "field": "Speaker",
                            "size": 1
                        }
                    }
                }
            }
        }
    }
    
    response = es.search(index="quotes", body=es_query)
    buckets = response["aggregations"]["top_speakers"]["buckets"]
    
    top_mks = []
    for bucket in buckets:
        person_id = bucket["key"]
        mention_count = bucket["doc_count"]
        
        # Extract the speaker name from the sub-aggregation bucket list safely
        name_buckets = bucket["speaker_name"]["buckets"]
        speaker_name = name_buckets[0]["key"] if name_buckets else "חבר כנסת לא מזוהה"
        
        top_mks.append({
            "id": int(person_id),
            "name": speaker_name,
            "count": mention_count
        })
        
    return top_mks


@router.get("/{doc_type}/{subject}")
async def get_subject_trend_by_doctype(doc_type: str, subject: str):
    keywords = SUBJECT_KEYWORDS.get(subject.lower(), [subject])
    compiled_query = " OR ".join([kw if '"' in kw else f"*{kw}*" for kw in keywords])
    
    formatted_doc_type = doc_type.capitalize() # Capitalize doc_type
    
    es_query = {
        "size": 0, 
        "query": {
            "bool": {
                "filter": [
                    { "term": { "DocType": formatted_doc_type } } 
                ],
                "must": [
                    {
                        "query_string": {
                            "default_field": "RawText",
                            "query": compiled_query
                        }
                    }
                ]
            }
        },
        "aggs": {
            "timeline": {
                "date_histogram": {
                    "field": "StartDate",
                    "calendar_interval": "month",
                    "format": "yyyy-MM"
                }
            }
        }
    }
    
    response = es.search(index="quotes", body=es_query)
    buckets = response["aggregations"]["timeline"]["buckets"]
    
    recharts_compatible_data = []
    for bucket in buckets:
        recharts_compatible_data.append({
            "name": bucket["key_as_string"],
            "mentions": bucket["doc_count"]
        })
        
    return recharts_compatible_data



