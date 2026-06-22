from elasticsearch import Elasticsearch
import pandas as pd
import matplotlib.pyplot as plt
import json

es = Elasticsearch("http://localhost:9200")

def check_word_with_wildcard(keyword):
    print(f"🔎 Scanning for whole word variations matching: *{keyword}*...")
    
    query = {
        "size": 0,
        "query": {
            "wildcard": {
                "RawText": f"*{keyword}*"
            }
        }
    }
    
    response = es.search(index="quotes", body=query)
    hits = response["hits"]["hits"]
    total = response["hits"]["total"]["value"]
    
    print(f"🎯 Found {total} absolute matches.")
    print("=" * 50)
    for hit in hits:
        print(f"🔊 {hit['_source']['Speaker']}:")
        print(f"   \"{hit['_source']['RawText']}\"")
        print("-" * 50)

# Run the check
# check_word_with_wildcard("אופניים")


def visualize_keyword_trend(keyword):
    print(f"📈 Aggregating trends for: '{keyword}'...")
    
    # Query Elasticsearch for monthly counts
    query = {
        "size": 0,
        "query": {
            "wildcard": { "RawText": f"*{keyword}*" }
        },
        "aggs": {
            "mentions_over_time": {
                "date_histogram": {
                    "field": "StartDate",
                    "calendar_interval": "month",
                    "format": "yyyy-MM-dd"
                }
            }
        }
    }
    
    response = es.search(index="quotes", body=query)
    buckets = response["aggregations"]["mentions_over_time"]["buckets"]
    
    # Convert to DataFrame
    df = pd.DataFrame(buckets)
    df['key_as_string'] = pd.to_datetime(df['key_as_string'])
    
    # Plotting
    plt.figure(figsize=(12, 6))
    plt.plot(df['key_as_string'], df['doc_count'], marker='o', linestyle='-', color='#2c3e50')
    plt.title(f"Mentions of '{keyword}' in Knesset Committees (2015-2026)", fontsize=14)
    plt.xlabel("Date", fontsize=12)
    plt.ylabel("Number of Mentions", fontsize=12)
    plt.grid(True, linestyle='--', alpha=0.7)
    plt.tight_layout()
    plt.show()

# Run a test with a common term
# visualize_keyword_trend("קסדה")


SUBJECT_KEYWORDS = {
    "road_safety": [
        "תאונ*", 
        "תחבור*", 
        "אופני*", 
        '"הולך רגל"', 
        '"הולכי רגל"', 
        "קסד*",
        "מהירות נסיעה",
        "בטיחות בדרכים"
    ],
    "transportation": [
        "אוטובוס*", 
        "רכבת", 
        "רכבות"
    ],
    "health": ["בריאות", "חולים", "רופאי*", "בית חולים", "תרופות"],
    "education": ["חינוך", "בתי ספר", "מורים", "תלמידי*", "בגרות"]
}

def get_subject_trend(subject: str):
    # Fallback to general terms if subject not explicitly mapped
    keywords = SUBJECT_KEYWORDS.get(subject.lower(), [subject])
    
    # Compile keywords into: "(*תאונ* OR *תחבור* OR *אופני*)"
    # Note: We don't wrap explicit quotes like "הולכי רגל" in extra asterisks
    compiled_query = " OR ".join([kw if '"' in kw else f"*{kw}*" for kw in keywords])
    
    es_query = {
        "size": 0, # Super fast: tells ES to skip downloading rows and just do the math
        "query": {
            "bool": {
                "filter": [
                    { "term": { "DocType": "Plenum" } } 
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
    # Convert to DataFrame
    df = pd.DataFrame(buckets)
    df['key_as_string'] = pd.to_datetime(df['key_as_string'])
    
    # Plotting
    plt.figure(figsize=(12, 6))
    plt.plot(df['key_as_string'], df['doc_count'], marker='o', linestyle='-', color='#2c3e50')
    plt.title(f"Mentions of '{subject}' in Knesset Committees (2015-2026)", fontsize=14)
    plt.xlabel("Date", fontsize=12)
    plt.ylabel("Number of Mentions", fontsize=12)
    plt.grid(True, linestyle='--', alpha=0.7)
    plt.tight_layout()
    plt.show()



get_subject_trend("road_safety")