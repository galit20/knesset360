# from fastapi import FastAPI, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from psycopg2.extras import RealDictCursor
# from db import get_db_connection

# app = FastAPI()

# # --- CORS SETUP ---
# # Allow react+vite app to talk with the API
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173"], 
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )


# @app.get("/")
# def read_root():
#     return {"message": "Welcome to the Knesset360 API! hello"}

# @app.get("/api/timeline")
# def get_timeline():
#     conn = get_db_connection()
#     if conn is None:
#         raise HTTPException(status_code=500, detail="Could not connect to the database")
    
#     try:
#         cursor = conn.cursor(cursor_factory=RealDictCursor)  # read as JSON for better react functionallity
        
#         cursor.execute("""
            
#         """)
        
#         timeline_data = cursor.fetchall()
        
#         # 4. Clean up and return the data!
#         cursor.close()
#         conn.close()
        
#         return timeline_data

#     except Exception as e:
#         if conn:
#             conn.close()
#         raise HTTPException(status_code=500, detail=str(e))
    
# @app.get("/api/factions")
# def get_factions(knesset: int = None):
#     conn = get_db_connection()
#     if conn is None:
#         raise HTTPException(status_code=500, detail="Could not connect to the database")
#     try:
#         cursor = conn.cursor(cursor_factory=RealDictCursor)
#         if knesset:
#             cursor.execute("""
#                 SELECT id, name, knessetnum, startdate, finishdate, member_count
#                 FROM (
#                     SELECT DISTINCT ON (f.name) f.id, f.name, f.knessetnum, f.startdate, f.finishdate,
#                            COUNT(DISTINCT p2p.personid) as member_count
#                     FROM kns_faction f
#                     LEFT JOIN kns_persontoposition p2p ON p2p.factionid = f.id
#                     WHERE f.knessetnum = %s
#                     GROUP BY f.id, f.name, f.knessetnum, f.startdate, f.finishdate
#                     HAVING COUNT(DISTINCT p2p.personid) >= 4
#                     ORDER BY f.name
#                 ) sub
#                 ORDER BY member_count DESC
#             """, (knesset,))
#         else:
#             cursor.execute("""
#                 SELECT id, name, knessetnum, startdate, finishdate, member_count
#                 FROM (
#                     SELECT DISTINCT ON (f.name) f.id, f.name, f.knessetnum, f.startdate, f.finishdate,
#                            COUNT(DISTINCT p2p.personid) as member_count
#                     FROM kns_faction f
#                     LEFT JOIN kns_persontoposition p2p ON p2p.factionid = f.id
#                     WHERE f.knessetnum BETWEEN 20 AND 25
#                     GROUP BY f.id, f.name, f.knessetnum, f.startdate, f.finishdate
#                     HAVING COUNT(DISTINCT p2p.personid) >= 4
#                     ORDER BY f.name
#                 ) sub
#                 ORDER BY member_count DESC
#             """)
#         data = cursor.fetchall()
#         cursor.close()
#         conn.close()
#         return data
#     except Exception as e:
#         if conn:
#             conn.close()
#         raise HTTPException(status_code=500, detail=str(e))

# @app.get("/api/faction-stats")
# def get_faction_stats(faction_id: int, knesset: int = None):
    
#     conn = get_db_connection()
#     if conn is None:
#         raise HTTPException(status_code=500, detail="Could not connect to the database")
#     try:
#         cursor = conn.cursor(cursor_factory=RealDictCursor)

#         # Get faction info by id
#         cursor.execute("""
#             SELECT id, name, knessetnum, startdate, finishdate
#             FROM kns_faction WHERE id = %s
#         """, (faction_id,))
#         faction = cursor.fetchone()
#         if not faction:
#             raise HTTPException(status_code=404, detail="Faction not found")

#         faction_name = faction['name']
#         knesset_filter = "AND b.knessetnum = %s" if knesset else ""
#         params_total = (faction_name, knesset) if knesset else (faction_name,)

#         # Total bills by faction name
#         cursor.execute(f"""
#             SELECT COUNT(DISTINCT b.id) as total_bills
#             FROM kns_bill b
#             JOIN kns_billinitiator bi ON bi.billid = b.id
#             JOIN kns_persontoposition p2p ON p2p.personid = bi.personid
#             WHERE TRIM(p2p.factionname) = TRIM(%s)
#               AND bi.isinitiator = true
#               {knesset_filter}
#         """, params_total)
#         total = cursor.fetchone()["total_bills"]

#         # Passed bills by faction name
#         cursor.execute(f"""
#             SELECT COUNT(DISTINCT b.id) as passed_bills
#             FROM kns_bill b
#             JOIN kns_billinitiator bi ON bi.billid = b.id
#             JOIN kns_persontoposition p2p ON p2p.personid = bi.personid
#             WHERE TRIM(p2p.factionname) = TRIM(%s)
#               AND bi.isinitiator = true
#               AND b.statusid = 118
#               {knesset_filter}
#         """, params_total)
#         passed = cursor.fetchone()["passed_bills"]

#         cursor.close()
#         conn.close()

#         success_rate = round((passed / total * 100), 1) if total > 0 else 0
#         return {
#             "faction": faction,
#             "total_bills": total,
#             "passed_bills": passed,
#             "success_rate": success_rate
#         }
#     except HTTPException:
#         raise
#     except Exception as e:
#         if conn:
#             conn.close()
#         raise HTTPException(status_code=500, detail=str(e))
    
# @app.get("/api/faction-topics")
# def get_faction_topics(faction_id: int, knesset: int = None):
#     conn = get_db_connection()
#     if conn is None:
#         raise HTTPException(status_code=500, detail="Could not connect to the database")
#     try:
#         cursor = conn.cursor(cursor_factory=RealDictCursor)

#         cursor.execute("SELECT name FROM kns_faction WHERE id = %s", (faction_id,))
#         faction = cursor.fetchone()
#         if not faction:
#             raise HTTPException(status_code=404, detail="Faction not found")

#         faction_name = faction['name']
#         knesset_filter = "AND b.knessetnum = %s" if knesset else ""
#         params = (faction_name, knesset) if knesset else (faction_name,)

#         cursor.execute(f"""
#             SELECT c.name, COUNT(DISTINCT b.id) as bill_count
#             FROM kns_bill b
#             JOIN kns_committee c ON c.id = b.committeeid
#             JOIN kns_billinitiator bi ON bi.billid = b.id
#             JOIN kns_persontoposition p2p ON p2p.personid = bi.personid
#             WHERE TRIM(p2p.factionname) = TRIM(%s)
#               AND bi.isinitiator = true
#               AND c.name != 'אין ועדה מטפלת'
#               {knesset_filter}
#             GROUP BY c.name
#             ORDER BY bill_count DESC
#             LIMIT 5
#         """, params)

#         data = cursor.fetchall()
#         cursor.close()
#         conn.close()
#         return data
#     except HTTPException:
#         raise
#     except Exception as e:
#         if conn:
#             conn.close()
#         raise HTTPException(status_code=500, detail=str(e))
    
# @app.get("/api/faction-status")
# def get_faction_status(faction_id: int, knesset: int = None, committee: str = None):
#     conn = get_db_connection()
#     if conn is None:
#         raise HTTPException(status_code=500, detail="Could not connect to the database")
#     try:
#         cursor = conn.cursor(cursor_factory=RealDictCursor)

#         cursor.execute("SELECT name FROM kns_faction WHERE id = %s", (faction_id,))
#         faction = cursor.fetchone()
#         if not faction:
#             raise HTTPException(status_code=404, detail="Faction not found")

#         faction_name = faction['name']
#         knesset_filter = "AND b.knessetnum = %s" if knesset else ""
#         committee_filter = "AND c.name = %s" if committee else ""

#         params = [faction_name]
#         if knesset:
#             params.append(knesset)
#         if committee:
#             params.append(committee)

#         cursor.execute(f"""
#             SELECT 
#                 CASE 
#                     WHEN b.statusid = 118 THEN 'עברו'
#                     WHEN b.statusid IN (101,108,113,109,167,178,179,130,131,141,111,114,117,106,142,150,181,175,126,169,158,161,162,165,140,143,115,104,120,176) THEN 'בתהליך'
#                     WHEN b.statusid IN (177,122,124,110) THEN 'נעצרו'
#                     ELSE 'אחר'
#                 END as status_group,
#                 COUNT(DISTINCT b.id) as count
#             FROM kns_bill b
#             JOIN kns_billinitiator bi ON bi.billid = b.id
#             JOIN kns_persontoposition p2p ON p2p.personid = bi.personid
#             LEFT JOIN kns_committee c ON c.id = b.committeeid
#             WHERE TRIM(p2p.factionname) = TRIM(%s)
#               AND bi.isinitiator = true
#               {knesset_filter}
#               {committee_filter}
#             GROUP BY status_group
#             ORDER BY count DESC
#         """, params)

#         data = cursor.fetchall()
#         cursor.close()
#         conn.close()
#         return data
#     except HTTPException:
#         raise
#     except Exception as e:
#         if conn:
#             conn.close()
#         raise HTTPException(status_code=500, detail=str(e))
    

# @app.get("/api/faction-top-mks")
# def get_faction_top_mks(faction_id: int, knesset: int = None, committee: str = None):
#     conn = get_db_connection()
#     if conn is None:
#         raise HTTPException(status_code=500, detail="Could not connect to the database")
#     try:
#         cursor = conn.cursor(cursor_factory=RealDictCursor)

#         cursor.execute("SELECT name FROM kns_faction WHERE id = %s", (faction_id,))
#         faction = cursor.fetchone()
#         if not faction:
#             raise HTTPException(status_code=404, detail="Faction not found")

#         faction_name = faction['name']
#         knesset_filter = "AND b.knessetnum = %s" if knesset else ""
#         committee_filter = "AND c.name = %s" if committee else ""

#         params = [faction_name]
#         if knesset:
#             params.append(knesset)
#         if committee:
#             params.append(committee)

#         cursor.execute(f"""
#             SELECT p.firstname || ' ' || p.lastname as name,
#                    COUNT(DISTINCT b.id) as bill_count
#             FROM kns_bill b
#             JOIN kns_billinitiator bi ON bi.billid = b.id
#             JOIN kns_persontoposition p2p ON p2p.personid = bi.personid
#             JOIN kns_person p ON p.id = bi.personid
#             LEFT JOIN kns_committee c ON c.id = b.committeeid
#             WHERE TRIM(p2p.factionname) = TRIM(%s)
#               AND bi.isinitiator = true
#               {knesset_filter}
#               {committee_filter}
#             GROUP BY p.firstname, p.lastname
#             ORDER BY bill_count DESC
#             LIMIT 3
#         """, params)

#         data = cursor.fetchall()
#         cursor.close()
#         conn.close()
#         return data
#     except HTTPException:
#         raise
#     except Exception as e:
#         if conn:
#             conn.close()
#         raise HTTPException(status_code=500, detail=str(e))
    
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from psycopg2.extras import RealDictCursor
from db import get_db_connection

app = FastAPI()

FACTION_NAME_ALIASES = {
    'הליכוד בהנהגת בנימין נתניהו לראשות הממשלה': 'הליכוד',
    'כחול לבן בראשות בנימין גנץ': 'כחול לבן',
    'הרשימה המשותפת חדש, רעם, תעל, בלד':'הרשימה המשותפת חדש, רעמ, תעל, בלד',
    'התאחדות הספרדים שומרי תורה תנועתו של מרן הרב עובדיה יוסף זצל':'ש"ס',
    'שס':'ש"ס',
    'הציונות הדתית (נסגרה)': 'הציונות הדתית',
    'הציונות הדתית בראשות בצלאל סמוטריץ\'': 'הציונות הדתית',
    'הרשימה המשותפת (חדש, רעם, בלד ותעל)': 'הרשימה המשותפת (חד"ש-רע"מ-תע"ל-בל"ד)',
    'הרשימה המשותפת חדש, רעמ, תעל, בלד':'הרשימה המשותפת (חד"ש-רע"מ-תע"ל-בל"ד)',
    'עוצמה יהודית בראשות איתמר בן גביר': 'עוצמה יהודית',
    'רעם': 'רע"מ',
    'רעמ – רשימת האיחוד הערבי ':'רע"מ',
    'רעמ - רשימת האיחוד הערבי':'רע"מ',
    'רעמ – רשימת האיחוד הערבי':'רע"מ',
    'העבודה הישראלית':'העבודה',  
    'תקווה חדשה - אחדות לישראל':'תקווה חדשה',
    'ישראל ביתנו בראשות אביגדור ליברמן':'ישראל ביתנו', 
    'חדש תעל בראשות איימן עודה ואחמד טיבי':' חד"ש-תע"ל',
    'חדש-תעל':' חד"ש-תע"ל',
    'תקווה חדשה - אחדות לישראל':'תקווה חדשה',
    'תלם - תנועה לאומית ממלכתית':'תל"ם',
    'חדש - חזית דמוקרטית לשלום ושוויון':'חד"ש',
    'חדש':'חד"ש'

    # add more as needed
}

def normalize_faction_name(name: str) -> str:
    cleaned = ' '.join(name.split())  # removes all extra whitespace
    return FACTION_NAME_ALIASES.get(cleaned, cleaned)

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
    return {"message": "Welcome to the Knesset360 API! hello"}

@app.get("/api/timeline")
def get_timeline():
    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="Could not connect to the database")
    
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)  # read as JSON for better react functionallity
        
        cursor.execute("""
            
        """)
        
        timeline_data = cursor.fetchall()
        
        # 4. Clean up and return the data!
        cursor.close()
        conn.close()
        
        return timeline_data

    except Exception as e:
        if conn:
            conn.close()
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/api/factions")
def get_factions(knesset: int = None):
    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="Could not connect to the database")
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        if knesset:
            cursor.execute("""
                SELECT id, name, knessetnum, startdate, finishdate, member_count
                FROM (
                    SELECT DISTINCT ON (f.name) f.id, f.name, f.knessetnum, f.startdate, f.finishdate,
                           COUNT(DISTINCT p2p.personid) as member_count
                    FROM kns_faction f
                    LEFT JOIN kns_persontoposition p2p ON p2p.factionid = f.id
                    WHERE f.knessetnum = %s
                    GROUP BY f.id, f.name, f.knessetnum, f.startdate, f.finishdate
                    HAVING COUNT(DISTINCT p2p.personid) >= 4
                    ORDER BY f.name
                ) sub
                ORDER BY member_count DESC
            """, (knesset,))
        else:
            cursor.execute("""
                SELECT id, name, knessetnum, startdate, finishdate, member_count
                FROM (
                    SELECT DISTINCT ON (f.name) f.id, f.name, f.knessetnum, f.startdate, f.finishdate,
                           COUNT(DISTINCT p2p.personid) as member_count
                    FROM kns_faction f
                    LEFT JOIN kns_persontoposition p2p ON p2p.factionid = f.id
                    WHERE f.knessetnum BETWEEN 20 AND 25
                    GROUP BY f.id, f.name, f.knessetnum, f.startdate, f.finishdate
                    HAVING COUNT(DISTINCT p2p.personid) >= 4
                    ORDER BY f.name
                ) sub
                ORDER BY member_count DESC
            """)
        data = cursor.fetchall()
        cursor.close()
        conn.close()

        # Apply name aliases
        for row in data:
            row['name'] = normalize_faction_name(row['name'])

        # Remove duplicates after normalization
        seen = set()
        unique_data = []
        for row in data:
            if row['name'] not in seen:
                seen.add(row['name'])
                unique_data.append(row)

        return unique_data
    except Exception as e:
        if conn:
            conn.close()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/faction-stats")
def get_faction_stats(faction_id: int, knesset: int = None):
    
    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="Could not connect to the database")
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        # Get faction info by id
        cursor.execute("""
            SELECT id, name, knessetnum, startdate, finishdate
            FROM kns_faction WHERE id = %s
        """, (faction_id,))
        faction = cursor.fetchone()
        if not faction:
            raise HTTPException(status_code=404, detail="Faction not found")

        faction_name = normalize_faction_name(faction['name'])
        knesset_filter = "AND b.knessetnum = %s" if knesset else ""
        params_total = (faction_name, knesset) if knesset else (faction_name,)

        # Total bills by faction name
        cursor.execute(f"""
            SELECT COUNT(DISTINCT b.id) as total_bills
            FROM kns_bill b
            JOIN kns_billinitiator bi ON bi.billid = b.id
            JOIN kns_persontoposition p2p ON p2p.personid = bi.personid
            WHERE TRIM(p2p.factionname) = TRIM(%s)
              AND bi.isinitiator = true
              {knesset_filter}
        """, params_total)
        total = cursor.fetchone()["total_bills"]

        # Passed bills by faction name
        cursor.execute(f"""
            SELECT COUNT(DISTINCT b.id) as passed_bills
            FROM kns_bill b
            JOIN kns_billinitiator bi ON bi.billid = b.id
            JOIN kns_persontoposition p2p ON p2p.personid = bi.personid
            WHERE TRIM(p2p.factionname) = TRIM(%s)
              AND bi.isinitiator = true
              AND b.statusid = 118
              {knesset_filter}
        """, params_total)
        passed = cursor.fetchone()["passed_bills"]

        cursor.close()
        conn.close()

        success_rate = round((passed / total * 100), 1) if total > 0 else 0
        return {
            "faction": faction,
            "total_bills": total,
            "passed_bills": passed,
            "success_rate": success_rate
        }
    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.close()
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/api/faction-topics")
def get_faction_topics(faction_id: int, knesset: int = None):
    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="Could not connect to the database")
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        cursor.execute("SELECT name FROM kns_faction WHERE id = %s", (faction_id,))
        faction = cursor.fetchone()
        if not faction:
            raise HTTPException(status_code=404, detail="Faction not found")

        faction_name = normalize_faction_name(faction['name'])
        knesset_filter = "AND b.knessetnum = %s" if knesset else ""
        params = (faction_name, knesset) if knesset else (faction_name,)

        cursor.execute(f"""
            SELECT c.name, COUNT(DISTINCT b.id) as bill_count
            FROM kns_bill b
            JOIN kns_committee c ON c.id = b.committeeid
            JOIN kns_billinitiator bi ON bi.billid = b.id
            JOIN kns_persontoposition p2p ON p2p.personid = bi.personid
            WHERE TRIM(p2p.factionname) = TRIM(%s)
              AND bi.isinitiator = true
              AND c.name != 'אין ועדה מטפלת'
              {knesset_filter}
            GROUP BY c.name
            ORDER BY bill_count DESC
            LIMIT 5
        """, params)

        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return data
    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.close()
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/api/faction-status")
def get_faction_status(faction_id: int, knesset: int = None, committee: str = None):
    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="Could not connect to the database")
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        cursor.execute("SELECT name FROM kns_faction WHERE id = %s", (faction_id,))
        faction = cursor.fetchone()
        if not faction:
            raise HTTPException(status_code=404, detail="Faction not found")

        faction_name = normalize_faction_name(faction['name'])
        knesset_filter = "AND b.knessetnum = %s" if knesset else ""
        committee_filter = "AND c.name = %s" if committee else ""

        params = [faction_name]
        if knesset:
            params.append(knesset)
        if committee:
            params.append(committee)

        cursor.execute(f"""
            SELECT 
                CASE 
                    WHEN b.statusid = 118 THEN 'עברו'
                    WHEN b.statusid IN (101,108,113,109,167,178,179,130,131,141,111,114,117,106,142,150,181,175,126,169,158,161,162,165,140,143,115,104,120,176) THEN 'בתהליך'
                    WHEN b.statusid IN (177,122,124,110) THEN 'נעצרו'
                    ELSE 'אחר'
                END as status_group,
                COUNT(DISTINCT b.id) as count
            FROM kns_bill b
            JOIN kns_billinitiator bi ON bi.billid = b.id
            JOIN kns_persontoposition p2p ON p2p.personid = bi.personid
            LEFT JOIN kns_committee c ON c.id = b.committeeid
            WHERE TRIM(p2p.factionname) = TRIM(%s)
              AND bi.isinitiator = true
              {knesset_filter}
              {committee_filter}
            GROUP BY status_group
            ORDER BY count DESC
        """, params)

        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return data
    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.close()
        raise HTTPException(status_code=500, detail=str(e))
    

@app.get("/api/faction-top-mks")
def get_faction_top_mks(faction_id: int, knesset: int = None, committee: str = None):
    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="Could not connect to the database")
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        cursor.execute("SELECT name FROM kns_faction WHERE id = %s", (faction_id,))
        faction = cursor.fetchone()
        if not faction:
            raise HTTPException(status_code=404, detail="Faction not found")

        faction_name = normalize_faction_name(faction['name'])
        knesset_filter = "AND b.knessetnum = %s" if knesset else ""
        committee_filter = "AND c.name = %s" if committee else ""

        params = [faction_name]
        if knesset:
            params.append(knesset)
        if committee:
            params.append(committee)

        cursor.execute(f"""
            SELECT p.firstname || ' ' || p.lastname as name,
                   COUNT(DISTINCT b.id) as bill_count
            FROM kns_bill b
            JOIN kns_billinitiator bi ON bi.billid = b.id
            JOIN kns_persontoposition p2p ON p2p.personid = bi.personid
            JOIN kns_person p ON p.id = bi.personid
            LEFT JOIN kns_committee c ON c.id = b.committeeid
            WHERE TRIM(p2p.factionname) = TRIM(%s)
              AND bi.isinitiator = true
              {knesset_filter}
              {committee_filter}
            GROUP BY p.firstname, p.lastname
            ORDER BY bill_count DESC
            LIMIT 3
        """, params)

        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return data
    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.close()
        raise HTTPException(status_code=500, detail=str(e))
    
        