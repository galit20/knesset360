from fastapi import APIRouter, HTTPException
from psycopg2.extras import RealDictCursor
from app.db import get_db_connection

router = APIRouter(prefix="/api/timeline", tags=["Timeline"]) #define route

SUBJECTS_CONFIG = {
    "road_safety": {
        "label": "בטיחות בדרכים",
        "keywords": ["תעבורה", "תאונות דרכים", "בטיחות בדרכים", "חוק הדרכים"],
    },
    "education": {
        "label": "חינוך",
        "keywords": ["חינוך", "בתי ספר", " מורים", "השכלה גבוהה", "מעונות יום", "לימודים", "תלמיד", "סטודנט"],
    },
    "health": {
        "label": "בריאות",
        "keywords": ["תחלואה", "קורונה", "בתי חולים", "חולים", "חיסונים", "חיסון", "מחלה", "בריאות"],
    },
    "crime": {
        "label": "פשיעה",
        "keywords": ["משטרה", "שוטר", "פשע", "נשק", "פציעה", "שופט", "פיגוע", "מחבל", "נפגעי עבירה", "עבריין", "מאסר עולם", "אונס", "רצח" , "עונשין"],
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
                B.subtypeid,
                B.summarylaw,
                B.postponementreasonid,
                B.postponementreasondesc,
                COALESCE(
                    DATE_TRUNC('day', B.publicationdate),
                    DATE_TRUNC('day', MIN(BI.lastupdateddate)),
                    DATE_TRUNC('day', B.lastupdateddate)
                ) AS publishdate,
                B.lastupdateddate,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', P.id,
                            'name', P.firstname || ' ' || P.lastname
                        )
                    ) FILTER (WHERE P.id IS NOT NULL),
                    '[]'::json
                ) AS initiators_info,
                ROW_NUMBER() OVER (
                    PARTITION BY B.knessetnum
                    ORDER BY B.lastupdateddate ASC
                ) AS stack_position
            FROM kns_bill AS B
            LEFT JOIN kns_billinitiator AS BI 
                ON BI.billid = B.id
            LEFT JOIN kns_person AS P 
                ON P.id = BI.personid
            JOIN kns_status AS S 
                ON S.id = B.statusid
            WHERE B.name LIKE ANY (%s)
            AND B.knessetnum > 19
            GROUP BY
                B.id,
                B.knessetnum,
                B.name,
                B.statusid,
                B.subtypeid,
                B.summarylaw,
                B.postponementreasonid,
                B.postponementreasondesc,
                B.lastupdateddate
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
