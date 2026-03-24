from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from psycopg2.extras import RealDictCursor
from db import get_db_connection

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


@app.get("/")
def read_root():
    return {"message": "Welcome to the Knesset360 API! hiiiiii"}

@app.get("/api/timeline")
def get_timeline():
    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="Could not connect to the database")
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)  # read as JSON for better react functionallity
        cursor.execute("""
            SELECT 
                B.id,
                B.knessetnum,
                B.name,
                B.statusid,
                array_agg(P.firstname || ' ' || P.lastname) AS initiators,
                ROW_NUMBER() OVER(PARTITION BY B.knessetnum ORDER BY B.lastupdateddate ASC) as stack_position
            FROM kns_bill as B 
            JOIN kns_billinitiator as BI on BI.billid = B.id
            JOIN kns_person as P on P.id = BI.personid
            JOIN kns_status as S on S.id = B.statusid
            WHERE (name LIKE '%חוק הדרכים%' 
                or name LIKE '%תאונות דרכים%' 
                or name LIKE '%בטיחות בדרכים%'
                or name LIKE '%תעבורה%')
            GROUP BY 
                B.id,
                B.knessetnum,
                B.name
            ORDER BY B.id ASC;
        """)
        
        timeline_data = cursor.fetchall()
        
        # Clean up and return the data!
        cursor.close()
        conn.close()
    
        return timeline_data

    except Exception as e:
        if conn:
            conn.close()
        raise HTTPException(status_code=500, detail=str(e))