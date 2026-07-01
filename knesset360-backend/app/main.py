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
from app.routes import timeline, trends, scores
from psycopg2.extras import RealDictCursor
from app.db import get_db_connection
from datetime import datetime, timedelta, timezone

import pandas as pd

app = FastAPI()

FACTION_NAME_ALIASES = {
    'הליכוד בהנהגת בנימין נתניהו לראשות הממשלה': 'הליכוד',
    'כחול לבן בראשות בנימין גנץ': 'כחול לבן',
    'הרשימה המשותפת חדש, רעם, תעל, בלד':'הרשימה המשותפת',
    'הרשימה המשותפת (חדש, רעם, בלד ותעל)': 'הרשימה המשותפת',
    'הרשימה המשותפת חדש, רעמ, תעל, בלד':'הרשימה המשותפת',
    'הרשימה המשותפת (חדש, תעל, בלד)': 'הרשימה המשותפת',
    'הרשימה המשותפת (חדש, בלד)': 'הרשימה המשותפת',
    'הרשימה הערבית המאוחדת': 'רעם',
    'ימינה בראשות נפתלי בנט': 'ימינה',
    'הבית היהודי בראשות נפתלי בנט': 'הבית היהודי',
    'ימינה בראשות איילת שקד הבית היהודי – האיחוד הלאומי – הימין החדש': 'ימינה',
    'הימין החדש': 'ימינה',
    'הבית היהודי - האיחוד הלאומי': 'ימינה',
    'המחנה הדמוקרטי - האיחוד הלאומי': 'המחנה הדמוקרטי',
    'אגודת ישראל': 'יהדות התורה',
    'חדש': 'הרשימה המשותפת',
    'יהדות התורה והשבת - אגודת ישראל דגל התורה': 'יהדות התורה',
    'יהדות התורה והשבת אגודת ישראל - דגל התורה': 'יהדות התורה',
    'דגל התורה': 'יהדות התורה',
    'התאחדות הספרדים שומרי תורה תנועתו של מרן הרב עובדיה יוסף זצל':'שס',
    'הציונות הדתית (נסגרה)': 'הציונות הדתית',
    'הציונות הדתית בראשות בצלאל סמוטריץ\'': 'הציונות הדתית',
    'עוצמה יהודית בראשות איתמר בן גביר': 'עוצמה יהודית',
    'רעמ – רשימת האיחוד הערבי ':'רעם',
    'רעמ - רשימת האיחוד הערבי':'רעם',
    'רעמ – רשימת האיחוד הערבי':'רעם',
    'העבודה הישראלית':'העבודה',
    'תקווה חדשה - אחדות לישראל':'תקווה חדשה',
    'ישראל ביתנו בראשות אביגדור ליברמן':'ישראל ביתנו',
    'חדש תעל בראשות איימן עודה ואחמד טיבי':'חדש-תעל',
    'חדש-תעל':'חדש-תעל',
    'כולנו בראשות משה כחלון': 'כולנו',
    'בלד – ברית לאומית דמוקרטית': 'רעם-בלד',
    'רעם - בלד - הרשימה הערבית המאוחדת ברית לאומית דמוקרטית': 'רעם-בלד',
    'הרשימה הערבית המאוחדת ברית לאומית דמוקרטית': 'רעם-בלד',
    'תלם - תנועה לאומית ממלכתית':'תלם',
    'חדש - חזית דמוקרטית לשלום ושוויון':'הרשימה המשותפת',

    # add more as needed
}

def normalize_faction_name(name: str) -> str:
    cleaned = ' '.join(name.split())  # removes all extra whitespace
    return FACTION_NAME_ALIASES.get(cleaned, cleaned)

# ── HARDCODED OVERRIDES ───────────────────────────────────────────────────────

# Manually verified rebel counts per MK per Knesset.
# {knesset: {personid: rebel_count}} — overrides SQL for individual MKs
# that appear in the SQL top-3 results for their faction.
REBEL_OVERRIDES = {
    25: {965: 3, 1025: 2, 23635: 8},
    24: {477: 5, 965: 4},
    23: {23635: 7, 12952: 9, 23568: 8, 23651: 6},
}

# Full replacement of rebel results for a specific faction+knesset.
# {knesset: {faction_name: [list of {personid, name, rebel_count}]}}
# Top 3 by rebel_count are shown.
REBEL_FACTION_OVERRIDES = {
    20: {
        'המחנה הציוני': [
            {'personid': 30062, 'name': 'זוהיר בהלול',      'rebel_count': 12},
            {'personid': 23596, 'name': 'יעל גרמן',         'rebel_count': 11},
            {'personid': 23632, 'name': 'מיקי לוי',         'rebel_count': 9},
            {'personid': 12961, 'name': 'נחמן שי',          'rebel_count': 8},
            {'personid': 503,   'name': 'אילן גילאון',      'rebel_count': 8},
            {'personid': 23652, 'name': "עיסאווי פריג'",    'rebel_count': 8},
            {'personid': 4405,  'name': "שלי יחימוביץ'",   'rebel_count': 7},
            {'personid': 23599, 'name': 'עליזה לביא',       'rebel_count': 7},
            {'personid': 12952, 'name': 'אורלי לוי אבקסיס', 'rebel_count': 6},
        ]
    },
}

# Manually verified faction-level bill counts.
# {knesset: {faction_name: {field: value}}}
FACTION_STATS_OVERRIDES = {
    22: {
        'העבודה - גשר': {'total_bills': 16},
        'המחנה הדמוקרטי': {'total_bills': 9},
    },
}

# Some parties were elected as one joint list but split into separate
# parliamentary factions mid-term, sharing no common text prefix with the
# original list name (e.g. "כחול לבן" / "יש עתיד" in Knesset 23). A single
# alias/prefix can't merge those for matching purposes - this maps
# {knesset: {canonical_display_name: [name_prefixes_to_match]}} so all data
# endpoints can correctly aggregate across every sub-faction.
KNESSET_FACTION_MERGE_GROUPS = {
    20: {
        'המחנה הציוני': ['המחנה הציוני', 'העבודה', 'התנועה'],
    },
    21: {
        'רעם-בלד': ['רעם-בלד', 'רעם', 'בלד'],
        'חדש-תעל': [
            'חדש-תעל',
            'הרשימה המשותפת',
            'הרשימה המשותפת חדש, רעם, תעל, בלד',
            'הרשימה המשותפת (חדש, רעם, בלד ותעל)',
            'הרשימה המשותפת חדש, רעמ, תעל, בלד',
        ],
    },
    23: {
        'כחול לבן': ['כחול לבן', 'יש עתיד'],
        'העבודה - גשר - מרצ': ['העבודה', 'מרצ'],
    },
}

def get_faction_match_patterns(faction_name, knesset):
    patterns = [faction_name]

    # Pull in every alias whose target IS this canonical name - this matters
    # because many renames (e.g. "דגל התורה" -> "יהדות התורה") don't share a
    # text prefix with their target, so prefix-matching alone would miss the
    # raw DB rows stored under the original (un-normalized) name.
    for source, target in FACTION_NAME_ALIASES.items():
        if target == faction_name and source not in patterns:
            patterns.append(source)

    if knesset:
        groups = KNESSET_FACTION_MERGE_GROUPS.get(knesset, {})
        if faction_name in groups:
            for p in groups[faction_name]:
                if p not in patterns:
                    patterns.append(p)
        else:
            for group_patterns in groups.values():
                if any(faction_name.startswith(p) or p.startswith(faction_name) for p in group_patterns):
                    for p in group_patterns:
                        if p not in patterns:
                            patterns.append(p)
                    break

    return patterns

def faction_match_sql(column_expr, faction_name, knesset, params_list):
    """Builds '(col ILIKE %s OR col ILIKE %s ...)' for every matching pattern
    and appends the corresponding '<pattern>%' values to params_list (positional-style)."""
    patterns = get_faction_match_patterns(faction_name, knesset)
    conditions = []
    for p in patterns:
        conditions.append(f"TRIM({column_expr}) ILIKE %s")
        params_list.append(f"{p}%")
    return "(" + " OR ".join(conditions) + ")"

def faction_match_sql_named(column_expr, faction_name, knesset, params_dict):
    """Same as faction_match_sql but for named (%(key)s) parameter style."""
    patterns = get_faction_match_patterns(faction_name, knesset)
    conditions = []
    for i, p in enumerate(patterns):
        key = f"faction_pattern_{i}"
        conditions.append(f"TRIM({column_expr}) ILIKE %({key})s")
        params_dict[key] = f"{p}%"
    return "(" + " OR ".join(conditions) + ")"

# --- CORS SETUP ---
# Allow react+vite app to talk with the API
origins = [
    "http://localhost:5173",       # Local Vite development
    "https://knesset360.vercel.app" # Your live production Vercel frontend!
]

# 2. Add the middleware to your FastAPI application
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,         # Tells the backend to trust these domains
    allow_credentials=True,
    allow_methods=["*"],           # Allows GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],           # Allows all custom headers
)

app.include_router(timeline.router)
app.include_router(trends.router)
app.include_router(scores.router)


@app.get("/")
def read_root():
    return {"message": "Welcome to the Knesset360 API!"}

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

        # Knesset 23 special case: "יש עתיד" ran as one joint list with
        # "כחול לבן" in the March 2020 election. The split into separate
        # factions ("יש עתיד", "יש עתיד-תלם", etc.) happened mid-term, after
        # the election - so for the original seat breakdown we merge those
        # splinters back into "כחול לבן". This can't be a global alias since
        # "יש עתיד" is a real, separate, independent party in other Knessets.
        if knesset == 20:
            for row in data:
                if row['name'] in ('העבודה', 'התנועה'):
                    row['name'] = 'המחנה הציוני'

        if knesset == 21:
            for row in data:
                if row['name'].startswith('רעם') or row['name'].startswith('בלד'):
                    row['name'] = 'רעם-בלד'
                elif row['name'] == 'הרשימה המשותפת':
                    row['name'] = 'חדש-תעל'

        if knesset == 23:
            for row in data:
                if row['name'] == 'יש עתיד' or 'תלם' in row['name']:
                    row['name'] = 'כחול לבן'
                elif row['name'] == 'מרצ' or 'העבודה' in row['name']:
                    row['name'] = 'העבודה - גשר - מרצ'
            # רעם wasn't a separate elected list in the original 2020 Knesset 23
            # election result - exclude it entirely for this Knesset.
            data = [row for row in data if row['name'] != 'רעם']

        # Remove duplicates after normalization
        seen = set()
        unique_data = []
        for row in data:
            if row['name'] not in seen:
                seen.add(row['name'])
                unique_data.append(row)

        return unique_data
    except Exception as e:
        import traceback
        traceback.print_exc() # This prints the beautiful, detailed error to your terminal!
        if conn:
            conn.close()
        raise HTTPException(status_code=500, detail=f"Database or server error: {str(e)}")

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

        params_total = []
        match_sql = faction_match_sql("p2p.factionname", faction_name, knesset, params_total)
        if knesset:
            params_total.append(knesset)

        # Total bills by faction name
        cursor.execute(f"""
            SELECT COUNT(DISTINCT b.id) as total_bills
            FROM kns_bill b
            JOIN kns_billinitiator bi ON bi.billid = b.id
            JOIN kns_persontoposition p2p ON p2p.personid = bi.personid
            WHERE {match_sql}
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
            WHERE {match_sql}
              AND bi.isinitiator = true
              AND b.statusid = 118
              {knesset_filter}
        """, params_total)
        passed = cursor.fetchone()["passed_bills"]

        cursor.close()
        conn.close()

        success_rate = round((passed / total * 100), 1) if total > 0 else 0

        # Apply manual overrides
        if knesset and knesset in FACTION_STATS_OVERRIDES:
            faction_overrides = FACTION_STATS_OVERRIDES[knesset]
            for override_name, override_vals in faction_overrides.items():
                if faction_name.startswith(override_name) or override_name.startswith(faction_name):
                    if 'total_bills' in override_vals:
                        total = override_vals['total_bills']
                    success_rate = round((passed / total * 100), 1) if total > 0 else 0
                    break

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

        params = []
        match_sql = faction_match_sql("p2p.factionname", faction_name, knesset, params)
        if knesset:
            params.append(knesset)

        cursor.execute(f"""
            SELECT c.name, COUNT(DISTINCT b.id) as bill_count
            FROM kns_bill b
            JOIN kns_committee c ON c.id = b.committeeid
            JOIN kns_billinitiator bi ON bi.billid = b.id
            JOIN kns_persontoposition p2p ON p2p.personid = bi.personid
            WHERE {match_sql}
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

        params = []
        match_sql = faction_match_sql("p2p.factionname", faction_name, knesset, params)
        if knesset:
            params.append(knesset)
        if committee:
            params.append(committee)

        # "בתהליך" (in process) is only a meaningful distinct status for the
        # current, ongoing Knesset (25) - those bills could still pass. For
        # concluded terms (20-24), a bill still "in process" when the term
        # ended effectively died with it, so count it as "נעצרו" instead.
        in_process_label = 'בתהליך' if knesset == 25 else 'נעצרו'

        cursor.execute(f"""
            SELECT 
                CASE 
                    WHEN b.statusid = 118 THEN 'עברו'
                    WHEN b.statusid IN (101,108,113,109,167,178,179,130,131,141,111,114,117,106,142,150,181,175,126,169,158,161,162,165,140,143,115,104,120,176) THEN '{in_process_label}'
                    WHEN b.statusid IN (177,122,124,110) THEN 'נעצרו'
                    ELSE 'אחר'
                END as status_group,
                COUNT(DISTINCT b.id) as count
            FROM kns_bill b
            JOIN kns_billinitiator bi ON bi.billid = b.id
            JOIN kns_persontoposition p2p ON p2p.personid = bi.personid
            LEFT JOIN kns_committee c ON c.id = b.committeeid
            WHERE {match_sql}
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

        params = []
        match_sql = faction_match_sql("p2p.factionname", faction_name, knesset, params)
        if knesset:
            params.append(knesset)
        if committee:
            params.append(committee)

        cursor.execute(f"""
            SELECT p.id as personid,
                   p.firstname || ' ' || p.lastname as name,
                   COUNT(DISTINCT b.id) as bill_count
            FROM kns_bill b
            JOIN kns_billinitiator bi ON bi.billid = b.id
            JOIN kns_persontoposition p2p ON p2p.personid = bi.personid
            JOIN kns_person p ON p.id = bi.personid
            LEFT JOIN kns_committee c ON c.id = b.committeeid
            WHERE {match_sql}
              AND bi.isinitiator = true
              {knesset_filter}
              {committee_filter}
            GROUP BY p.id, p.firstname, p.lastname
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
    
        
@app.get("/api/faction-rebels")
def get_faction_rebels(faction_id: int, knesset: int):
    """
    Finds MKs who voted against their own faction's majority position in plenum
    votes, for a specific Knesset. A vote only counts if at least 3 faction
    members cast a decisive vote (בעד/נגד) on it, and ties (no clear majority)
    are skipped entirely.

    Majority/rebel status is still detected per individual VoteID (a real,
    distinct decision point), but the final counts are deduplicated by ItemID -
    the plenum agenda item a vote belongs to. Multi-clause bills are voted on
    clause-by-clause, each getting its own VoteID but sharing one ItemID; without
    this dedup, disagreeing on every clause of one bill would be counted as
    dozens of separate "rebellions" instead of the one real disagreement it is.
    """
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
        params = {"knesset": knesset}
        match_sql = faction_match_sql_named("factionname", faction_name, knesset, params)

        base_cte = f"""
            WITH faction_members AS (
                SELECT DISTINCT personid
                FROM kns_persontoposition
                WHERE knessetnum = %(knesset)s
                  AND factionname IS NOT NULL
                  AND {match_sql}
            ),
            faction_votes AS (
                SELECT vr."mkid" AS mkid,
                       vr."voteid" AS voteid,
                       pv."itemid" AS itemid,
                       vr."resultdesc" AS resultdesc
                FROM "kns_plenumvoteresult" vr
                JOIN "kns_plenumvote" pv ON pv."id" = vr."voteid"
                JOIN kns_plenumsession ps ON ps.id = pv."sessionid"
                JOIN faction_members fm ON fm.personid = vr."mkid"
                WHERE ps.knessetnum = %(knesset)s
                  AND vr."resultdesc" IN ('בעד', 'נגד')
            ),
            vote_majority AS (
                SELECT voteid,
                       CASE
                           WHEN SUM(CASE WHEN resultdesc = 'בעד' THEN 1 ELSE 0 END) >
                                SUM(CASE WHEN resultdesc = 'נגד' THEN 1 ELSE 0 END)
                           THEN 'בעד'
                           WHEN SUM(CASE WHEN resultdesc = 'נגד' THEN 1 ELSE 0 END) >
                                SUM(CASE WHEN resultdesc = 'בעד' THEN 1 ELSE 0 END)
                           THEN 'נגד'
                           ELSE NULL
                       END AS majority
                FROM faction_votes
                GROUP BY voteid
                HAVING COUNT(*) >= 3
            ),
            rebel_votes AS (
                SELECT fv.mkid, fv.voteid, fv.itemid
                FROM faction_votes fv
                JOIN vote_majority vm ON vm.voteid = fv.voteid
                WHERE vm.majority IS NOT NULL
                  AND fv.resultdesc <> vm.majority
            )
        """

        cursor.execute(base_cte + """
            , mk_rebel_counts AS (
                SELECT mkid, COUNT(DISTINCT itemid) AS rebel_count
                FROM rebel_votes
                GROUP BY mkid
            )
            SELECT p.id AS personid,
                   p.firstname || ' ' || p.lastname AS name,
                   rc.rebel_count
            FROM mk_rebel_counts rc
            JOIN kns_person p ON p.id = rc.mkid
            ORDER BY rc.rebel_count DESC
            LIMIT 3
        """, params)
        top_mks = cursor.fetchall()

        cursor.execute(base_cte + """
            SELECT
                (SELECT COUNT(DISTINCT (mkid, itemid)) FROM rebel_votes) AS total_rebel_votes,
                (SELECT COUNT(DISTINCT mkid) FROM rebel_votes) AS rebel_mk_count
        """, params)
        summary = cursor.fetchone()

        # Faction-level full replacement (e.g. knesset 20 המחנה הציוני)
        if knesset in REBEL_FACTION_OVERRIDES:
            for override_faction, override_mks in REBEL_FACTION_OVERRIDES[knesset].items():
                if (faction_name == override_faction or
                        faction_name.startswith(override_faction) or
                        override_faction.startswith(faction_name)):
                    sorted_mks = sorted(override_mks, key=lambda x: x['rebel_count'], reverse=True)
                    top3 = sorted_mks[:3]
                    override_summary = {
                        'total_rebel_votes': sum(m['rebel_count'] for m in sorted_mks),
                        'rebel_mk_count': len(sorted_mks),
                    }
                    cursor.close()
                    conn.close()
                    return {'summary': override_summary, 'top_mks': top3}

        # Person-level count overrides (knessets 23/24/25)
        if knesset in REBEL_OVERRIDES:
            overrides = REBEL_OVERRIDES[knesset]
            top_mks = [dict(mk) for mk in top_mks]
            for mk in top_mks:
                if mk['personid'] in overrides:
                    mk['rebel_count'] = overrides[mk['personid']]
            summary = dict(summary)
            summary['total_rebel_votes'] = sum(mk['rebel_count'] for mk in top_mks)

        cursor.close()
        conn.close()
        return {
            "summary": summary,
            "top_mks": top_mks,
        }
    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.close()
        raise HTTPException(status_code=500, detail=str(e))
    
        
# ── DASHBOARD ENDPOINTS ─────────────────────────────────────────────────────
# Add these routes to main.py

@app.get("/api/dashboard/stats")
def get_dashboard_stats(knesset: int = 25):
    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="DB connection failed")
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        # Total bills
        cursor.execute("SELECT COUNT(*) as total FROM kns_bill WHERE knessetnum = %s", (knesset,))
        total_bills = cursor.fetchone()["total"]

        # Gender split
        cursor.execute("""
            SELECT p.genderid, COUNT(DISTINCT p2p.personid) as cnt
            FROM kns_persontoposition p2p
            JOIN kns_person p ON p.id = p2p.personid
            WHERE p2p.positionid IN (43, 61) AND p2p.knessetnum = %s
            AND p2p.startdate <= (
                SELECT MIN(startdate) + INTERVAL '1 day'
                FROM kns_persontoposition
                WHERE positionid IN (43, 61) AND knessetnum = %s
            )
            GROUP BY p.genderid
        """, (knesset, knesset))
        gender_rows = cursor.fetchall()
        women = next((r["cnt"] for r in gender_rows if r["genderid"] == 250), 0)
        men = next((r["cnt"] for r in gender_rows if r["genderid"] == 251), 0)

        # Mid-term exits
        cursor.execute("""
            SELECT COUNT(DISTINCT personid) as exits
            FROM kns_persontoposition
            WHERE positionid IN (43, 61)
              AND finishdate IS NOT NULL
              AND knessetnum = %s
              AND finishdate < (
                SELECT MAX(plenumfinish) FROM kns_knessetdates
                WHERE kns_knessetdates.knessetnum = kns_persontoposition.knessetnum
              )
        """, (knesset,))
        exits = cursor.fetchone()["exits"]

        # Gov ministries
        cursor.execute("SELECT COUNT(*) as cnt FROM kns_govministry WHERE isactive = true")
        ministries = cursor.fetchone()["cnt"]

        cursor.close()
        conn.close()
        return {
            "total_bills": total_bills,
            "women": women,
            "men": men,
            "mid_term_exits": exits,
            "ministries": ministries,
        }
    except Exception as e:
        if conn: conn.close()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/dashboard/bills-per-month")
def get_bills_per_month(knesset: int = 25):
    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="DB connection failed")
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT
                TO_CHAR(DATE_TRUNC('month', publicationdate), 'YYYY-MM') as month,
                COUNT(*) as count
            FROM kns_bill
            WHERE knessetnum = %s
              AND publicationdate IS NOT NULL
            GROUP BY DATE_TRUNC('month', publicationdate)
            ORDER BY DATE_TRUNC('month', publicationdate)
        """, (knesset,))
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return data
    except Exception as e:
        if conn: conn.close()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/dashboard/bill-status")
def get_bill_status(knesset: int = 25):
    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="DB connection failed")
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT
                CASE
                    WHEN statusid = 118 THEN 'עברו'
                    WHEN statusid IN (101,108,113,109,167,178,179,130,131,141,111,
                                      114,117,106,142,150,181,175,126,169,158,161,
                                      162,165,140,143,115,104,120,176) THEN 'בתהליך'
                    WHEN statusid IN (177,122,124,110) THEN 'נעצרו'
                    ELSE 'אחר'
                END as status_group,
                COUNT(*) as count
            FROM kns_bill
            WHERE knessetnum = %s
            GROUP BY status_group
            ORDER BY count DESC
        """, (knesset,))
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return data
    except Exception as e:
        if conn: conn.close()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/dashboard/hot-committees")
def get_hot_committees(knesset: int = 25):
    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="DB connection failed")
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT c.name, COUNT(cs.id) as session_count
            FROM kns_committeesession cs
            JOIN kns_committee c ON c.id = cs.committeeid
            WHERE c.knessetnum = %s
              AND cs.startdate IS NOT NULL
            GROUP BY c.name
            ORDER BY session_count DESC
            LIMIT 10
        """, (knesset,))
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return data
    except Exception as e:
        if conn: conn.close()
        raise HTTPException(status_code=500, detail=str(e))


OFFICIAL_SEATS = {
    20: [
        {'name': 'הליכוד', 'seats': 30},
        {'name': 'המחנה הציוני', 'seats': 24},
        {'name': 'הרשימה המשותפת', 'seats': 13},
        {'name': 'יש עתיד', 'seats': 11},
        {'name': 'כולנו', 'seats': 10},
        {'name': 'הבית היהודי', 'seats': 8},
        {'name': 'שס', 'seats': 7},
        {'name': 'ישראל ביתנו', 'seats': 6},
        {'name': 'יהדות התורה', 'seats': 6},
        {'name': 'מרצ', 'seats': 5},
    ],
    21: [
        {'name': 'הליכוד', 'seats': 35},
        {'name': 'כחול לבן', 'seats': 35},
        {'name': 'שס', 'seats': 8},
        {'name': 'יהדות התורה', 'seats': 8},
        {'name': 'העבודה', 'seats': 6},
        {'name': 'חדש-תעל', 'seats': 6},
        {'name': 'ישראל ביתנו', 'seats': 5},
        {'name': 'ימינה', 'seats': 5},
        {'name': 'כולנו', 'seats': 4},
        {'name': 'מרצ', 'seats': 4},
        {'name': 'רעם-בלד', 'seats': 4},
    ],
    22: [
        {'name': 'כחול לבן', 'seats': 33},
        {'name': 'הליכוד', 'seats': 32},
        {'name': 'הרשימה המשותפת', 'seats': 13},
        {'name': 'שס', 'seats': 9},
        {'name': 'ישראל ביתנו', 'seats': 8},
        {'name': 'יהדות התורה', 'seats': 7},
        {'name': 'ימינה', 'seats': 7},
        {'name': 'העבודה - גשר', 'seats': 6},
        {'name': 'המחנה הדמוקרטי', 'seats': 5},
    ],
    23: [
        {'name': 'הליכוד', 'seats': 36},
        {'name': 'כחול לבן', 'seats': 33},
        {'name': 'הרשימה המשותפת', 'seats': 15},
        {'name': 'שס', 'seats': 9},
        {'name': 'יהדות התורה', 'seats': 7},
        {'name': 'ישראל ביתנו', 'seats': 7},
        {'name': 'העבודה - גשר - מרצ', 'seats': 7},
        {'name': 'ימינה', 'seats': 6},
    ],
    24: [
        {'name': 'הליכוד', 'seats': 30},
        {'name': 'יש עתיד', 'seats': 17},
        {'name': 'שס', 'seats': 9},
        {'name': 'כחול לבן', 'seats': 8},
        {'name': 'ימינה', 'seats': 7},
        {'name': 'העבודה', 'seats': 7},
        {'name': 'יהדות התורה', 'seats': 7},
        {'name': 'ישראל ביתנו', 'seats': 7},
        {'name': 'הציונות הדתית', 'seats': 6},
        {'name': 'הרשימה המשותפת', 'seats': 6},
        {'name': 'תקווה חדשה', 'seats': 6},
        {'name': 'מרצ', 'seats': 6},
        {'name': 'רעם', 'seats': 4},
    ],
    25: [
        {'name': 'הליכוד', 'seats': 32},
        {'name': 'יש עתיד', 'seats': 24},
        {'name': 'שס', 'seats': 11},
        {'name': 'כחול לבן - המחנה הממלכתי', 'seats': 8},
        {'name': 'הציונות הדתית', 'seats': 7},
        {'name': 'יהדות התורה', 'seats': 7},
        {'name': 'ישראל ביתנו', 'seats': 6},
        {'name': 'עוצמה יהודית', 'seats': 6},
        {'name': 'רעם', 'seats': 5},
        {'name': 'חדש-תעל', 'seats': 5},
        {'name': 'העבודה', 'seats': 4},
        {'name': 'הימין הממלכתי', 'seats': 4},
        {'name': 'נעם', 'seats': 1},
    ],
}

@app.get("/api/dashboard/factions")
def get_dashboard_factions(knesset: int = 25):
    data = OFFICIAL_SEATS.get(knesset, OFFICIAL_SEATS[25])
    return data


@app.get("/api/dashboard/committee-calendar")
def get_committee_calendar(year: int = None, month: int = None, knesset: int = 25):
    from datetime import date
    today = date.today()
    y = year or today.year
    m = month or today.month
    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="DB connection failed")
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute("""
            SELECT
                cs.startdate::date as session_date,
                c.name as committee_name,
                COUNT(*) as session_count
            FROM kns_committeesession cs
            JOIN kns_committee c ON c.id = cs.committeeid
            WHERE EXTRACT(YEAR FROM cs.startdate) = %s
              AND EXTRACT(MONTH FROM cs.startdate) = %s
              AND c.knessetnum = %s
            GROUP BY cs.startdate::date, c.name
            ORDER BY cs.startdate::date
        """, (y, m, knesset))
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return data
    except Exception as e:
        if conn: conn.close()
        raise HTTPException(status_code=500, detail=str(e))

# Bill status buckets (statusid -> bucket), based on kns_status typeid=2 (הצעת חוק)
BILL_PASSED_STATUSES = (118,)
BILL_FAILED_STATUSES = (110, 176, 177, 122, 140, 143)


@app.get("/api/dashboard/last-week-summary")
def get_last_week_summary():
    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=500, detail="DB connection failed")
    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        # 1. Establish the timeframe based on 'today' instead of the database max date
        week_end = datetime.now(timezone.utc)
        week_start = week_end - timedelta(days=7)
        
        # Keep your string parameter format matching your existing logic
        week_start_param = "(%s::timestamptz - interval '7 days')"

        # Committee sessions held
        cursor.execute(f"""
            SELECT COUNT(*) AS count
            FROM kns_committeesession
            WHERE startdate BETWEEN {week_start_param} AND %s
        """, (week_end, week_end))
        committee_sessions = cursor.fetchone()["count"]

        # Plenum sessions held
        cursor.execute(f"""
            SELECT COUNT(*) AS count
            FROM kns_plenumsession
            WHERE startdate BETWEEN {week_start_param} AND %s
        """, (week_end, week_end))
        plenum_sessions = cursor.fetchone()["count"]

        # Bills with a status change this week, bucketed by current status
        cursor.execute(f"""
            SELECT
                CASE
                    WHEN statusid = ANY(%s) THEN 'passed'
                    WHEN statusid = ANY(%s) THEN 'failed'
                    ELSE 'in_process'
                END AS bucket,
                COUNT(*) AS count
            FROM kns_bill
            WHERE lastupdateddate BETWEEN {week_start_param} AND %s
            GROUP BY bucket
        """, (list(BILL_PASSED_STATUSES), list(BILL_FAILED_STATUSES), week_end, week_end))
        bucket_rows = cursor.fetchall()
        bill_status_counts = {"passed": 0, "failed": 0, "in_process": 0}
        for row in bucket_rows:
            bill_status_counts[row["bucket"]] = row["count"]

        # Active committees this week (top 5 by session count)
        cursor.execute(f"""
            SELECT c.name AS committee_name, COUNT(*) AS session_count
            FROM kns_committeesession cs
            JOIN kns_committee c ON c.id = cs.committeeid
            WHERE cs.startdate BETWEEN {week_start_param} AND %s
            GROUP BY c.name
            ORDER BY session_count DESC
            LIMIT 5
        """, (week_end, week_end))
        active_committees = cursor.fetchall()

        # Most active MKs (by bill-initiator count, among bills with a status change this week)
        cursor.execute(f"""
            SELECT p.id AS personid, p.firstname, p.lastname, COUNT(DISTINCT bi.billid) AS bill_count
            FROM kns_billinitiator bi
            JOIN kns_bill b ON b.id = bi.billid
            JOIN kns_person p ON p.id = bi.personid
            WHERE bi.isinitiator = true
              AND b.lastupdateddate BETWEEN {week_start_param} AND %s
            GROUP BY p.id, p.firstname, p.lastname
            ORDER BY bill_count DESC
            LIMIT 3
        """, (week_end, week_end))
        top_mks = cursor.fetchall()

        # Fallback for bills with no explicitly tracked initiator
        if not top_mks:
            cursor.execute(f"""
                SELECT p.id AS personid, p.firstname, p.lastname, COUNT(DISTINCT bi.billid) AS bill_count
                FROM kns_committeesession cs
                JOIN kns_bill b ON b.committeeid = cs.committeeid
                JOIN kns_billinitiator bi ON bi.billid = b.id AND bi.isinitiator = true
                JOIN kns_person p ON p.id = bi.personid
                WHERE cs.startdate BETWEEN {week_start_param} AND %s
                GROUP BY p.id, p.firstname, p.lastname
                ORDER BY bill_count DESC
                LIMIT 3
            """, (week_end, week_end))
            top_mks = cursor.fetchall()

        cursor.close()
        conn.close()

        return {
            "week_start": week_start,
            "week_end": week_end,
            "committee_sessions": committee_sessions,
            "plenum_sessions": plenum_sessions,
            "bills": {
                "passed": bill_status_counts["passed"],
                "failed": bill_status_counts["failed"],
                "in_process": bill_status_counts["in_process"],
            },
            "active_committees": active_committees,
            "top_mks": top_mks,
        }
    except Exception as e:
        if conn: conn.close()
        raise HTTPException(status_code=500, detail=str(e))
