from fastapi import APIRouter, HTTPException
from psycopg2.extras import RealDictCursor
from db import get_db_connection

router = APIRouter(prefix="/api/timeline", tags=["Timeline"]) #define route

SUBJECTS_CONFIG = {
    "road-safety": {
        "label": "בטיחות בדרכים",
        "keywords": ["תעבורה", "תאונות דרכים", "בטיחות בדרכים", "חוק הדרכים"],
    },
    "education": {
        "label": "חינוך",
        "keywords": ["חינוך", "בתי ספר", "מורים", "השכלה גבוהה", "מעונות יום"],
    },
    "health": {
        "label": "בריאות",
        "keywords": ["תחלואה", "קורונה", "בתי חולים", "חולים", "חיסונים", "חיסון", "מחלה", "בריאות"],
    },
    "crime": {
        "label": "פשיעה",
        "keywords": ["משטרה", "שוטר", "פשע", "נשק", "פציעה", "שופט", "פיגוע", "מחבל"],
    },
    "migration": {
        "label": "עלייה ותפוצות",
        "keywords": ["עולה חדש", "עלייה", "הגירה", "מהגר"],
    },
    "environment": {
        "label": "איכות הסביבה",
        "keywords": ["זיהום", "סביבה", "מחזור", "אנרגיה", "אקלים", "שפכים"],
    }
}

@router.get("")                # Default for /api/timeline
@router.get("/")               # Matches /api/timeline/
@router.get("/{subject}")
async def get_subject_timeline(subject: str = "road-safety"):

    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="Could not connect to the database")
    
    config = SUBJECTS_CONFIG.get(subject)
    if not config:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)  # read as JSON for better react functionallity
        
        query_keywords = [f"%{k}%" for k in config['keywords']]
        
        query = """
            SELECT 
                B.id,
                B.knessetnum,
                B.name,
                B.statusid,
				DATE_TRUNC('day', MIN(BI.lastupdateddate)) as publishdate,
                json_agg(
                    json_build_object(
                        'id', P.id, 
                        'name', P.firstname || ' ' || P.lastname)
                    ) AS initiators_info,
                ROW_NUMBER() OVER(PARTITION BY B.knessetnum ORDER BY B.lastupdateddate ASC) as stack_position
            FROM kns_bill as B 
            JOIN kns_billinitiator as BI on BI.billid = B.id
            JOIN kns_person as P on P.id = BI.personid
            JOIN kns_status as S on S.id = B.statusid
            WHERE B.name LIKE ANY(%s)
				and B.knessetnum > 19
            GROUP BY 
                B.id,
                B.knessetnum,
                B.name
            ORDER BY B.id ASC;
        """

        cursor.execute(query, (query_keywords,))
        
        timeline_data = cursor.fetchall()
        
        # Clean up and return the data!
        cursor.close()
        conn.close()
    
        return timeline_data

    except Exception as e:
        if conn:
            conn.close()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")