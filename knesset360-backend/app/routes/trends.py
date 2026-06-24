from fastapi import APIRouter, HTTPException
from elasticsearch import Elasticsearch

router = APIRouter(prefix="/api/trends", tags=["Trends"]) #define route

es = Elasticsearch("http://localhost:9200")

KNESSETS = {
    20: {"start": "2015-03-31", "end": "2019-04-29"},
    21: {"start": "2019-04-30", "end": "2019-10-03"},
    22: {"start": "2019-10-03", "end": "2020-03-16"},
    23: {"start": "2020-03-16", "end": "2021-01-06"},
    24: {"start": "2021-04-06", "end": "2022-11-14"},
    25: {"start": "2022-11-15", "end": "2026-10-27"}
};

# Define our subject keyword maps global state
SUBJECT_KEYWORDS = {
    "road_safety": [
        "תאונ*", 
        "תחבור*", 
        "אופניי*", 
        '"הולך רגל"', 
        '"הולכי רגל"', 
        "קסד*",
        "אוטובוס*",
        "רכבת",
        "רכבות"
    ],
    "transportation": [
        "אוטובוס*", 
        "רכבת", 
        "רכבות", 
        "מונית",
        "מוניות"
    ],
    "health": ["בריאות", "חולים", "רופאי*", "בית חולים", "תרופות", "חיסון*", "חיסונים", "מחלה", "תחלואה", "קורונה", "מגיפה", "מחלות", "ביתי חולים"],
    "education": ["חינוך", "בתי ספר", "מורים", "תלמיד*", "בגרות", "סטודנט*", "לימודים", "השכלה", "מעונות יום"],
    "crime": ["פשיעה", "משטרה", "שוטר*", "פשע", "נשק", "פציעה", "שופט*", "פיגוע*", "מחבל*", "טרור", "פשעי*", "פריצה", "גניבה", "שוד"]
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
async def get_top_mks_by_subject(doc_type: str, subject: str, limit: int = 15, knesset: int = None):
    keywords = SUBJECT_KEYWORDS.get(subject.lower(), [subject])
    compiled_query = " OR ".join([kw if '"' in kw else f"*{kw}*" for kw in keywords])
    formatted_doc_type = doc_type.capitalize() # Capitalize doc_type

    # Base filters
    filter_conditions = [
        {"exists": {"field": "PersonID"}}, 
        {"term": {"DocType": formatted_doc_type}}
    ]

    #  Only inject range filter if knesset is provided and valid
    if knesset is not None and knesset in KNESSETS:
        date_range = KNESSETS[knesset]
        filter_conditions.append({
            "range": {
                "StartDate": {
                    "gte": date_range["start"],
                    "lte": date_range["end"]
                }
            }
        })

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
                "filter": filter_conditions
            }
        },
        "aggs": {
            "top_speakers": {
                "terms": {
                    "field": "PersonID",
                    "size": limit  # Limit the number of top MKs returned based on the query parameter
                }
            }
        }
    }
    
    response = es.search(index="quotes", body=es_query)
    buckets = response["aggregations"]["top_speakers"]["buckets"]
    
    return [
        {
            "id": int(bucket["key"]),
            "count": bucket["doc_count"]
        } 
        for bucket in buckets
    ]


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



