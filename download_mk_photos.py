import os
import sys
import time
import requests
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent / "knesset360-backend" / "app"))
import psycopg2
from config import config

# -- Settings ----------------------------------------------------------------
KNESSET_MIN = 20
KNESSET_MAX = 25
OUTPUT_DIR = Path("knesset360-frontend/public/mk-photos")
SLEEP_BETWEEN_REQUESTS = 3.0  # seconds, be polite to Wikidata/Commons

HEADERS = {
    "User-Agent": "Knesset360AcademicProject/1.0 (https://github.com/; student project, non-commercial, low-volume)"
}

SPARQL_ENDPOINT = "https://query.wikidata.org/sparql"

# -- Get all MKs (personid + name) from the DB --------------------------------
def get_mks():
    base_dir = Path(__file__).resolve().parent / "db-files"
    ini_path = base_dir / "database.ini"
    params = config(filename=str(ini_path))
    conn = psycopg2.connect(**params)
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT DISTINCT p.id, p.firstname, p.lastname
        FROM kns_persontoposition p2p
        JOIN kns_person p ON p.id = p2p.personid
        WHERE p2p.knessetnum BETWEEN %s AND %s
          AND p.id IS NOT NULL
        ORDER BY p.id
        """,
        (KNESSET_MIN, KNESSET_MAX),
    )
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return rows  # list of (id, firstname, lastname)

# -- Find a Wikidata image filename for a given Hebrew full name -------------
def find_wikidata_image(full_name):
    query = f"""
    SELECT ?image WHERE {{
      ?person rdfs:label "{full_name}"@he .
      ?person wdt:P31 wd:Q5 .
      ?person wdt:P18 ?image .
    }}
    LIMIT 1
    """
    try:
        r = requests.get(
            SPARQL_ENDPOINT,
            params={"query": query, "format": "json"},
            headers=HEADERS,
            timeout=15,
        )
        r.raise_for_status()
        bindings = r.json().get("results", {}).get("bindings", [])
        if not bindings:
            return None
        image_url = bindings[0]["image"]["value"]
        # image_url looks like http://commons.wikimedia.org/wiki/Special:FilePath/Some_File.jpg
        return image_url
    except Exception as e:
        print(f"  (wikidata query failed: {e})")
        return None

# -- Main ----------------------------------------------------------------------
def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print("Fetching MKs from database...")
    mks = get_mks()
    print(f"Found {len(mks)} unique MKs for Knesset {KNESSET_MIN}-{KNESSET_MAX}")

    session = requests.Session()
    session.headers.update(HEADERS)

    downloaded = 0
    skipped = 0
    missing = []
    consecutive_rate_limits = 0

    for mk_id, firstname, lastname in mks:
        out_path = OUTPUT_DIR / f"{mk_id}.jpg"
        if out_path.exists():
            skipped += 1
            continue

        full_name = f"{firstname} {lastname}".strip()
        image_url = find_wikidata_image(full_name)
        time.sleep(SLEEP_BETWEEN_REQUESTS)

        if not image_url:
            missing.append((mk_id, full_name))
            print(f"-- {mk_id} {full_name} (no Wikidata image found)")
            continue

        try:
            image_bytes = None
            got_rate_limited = False
            for attempt in range(4):
                r = session.get(image_url, timeout=15)
                if r.status_code == 200 and len(r.content) > 1000:
                    image_bytes = r.content
                    break
                if r.status_code == 429:
                    got_rate_limited = True
                    server_wait = int(r.headers.get("Retry-After", 5))
                    wait = min(server_wait, 15)
                    print(f"  (rate limited, waiting {wait}s...)")
                    time.sleep(wait)
                    continue
                break  # other failure, don't retry

            if got_rate_limited:
                consecutive_rate_limits += 1
            else:
                consecutive_rate_limits = 0

            if consecutive_rate_limits >= 3:
                print("  (hit repeatedly, cooling down for 60s...)")
                time.sleep(60)
                consecutive_rate_limits = 0

            if image_bytes:
                out_path.write_bytes(image_bytes)
                downloaded += 1
                print(f"OK {mk_id} {full_name}")
            else:
                missing.append((mk_id, full_name))
                print(f"-- {mk_id} {full_name} (image download failed)")
        except Exception as e:
            missing.append((mk_id, full_name))
            print(f"-- {mk_id} {full_name} (error: {e})")

        time.sleep(SLEEP_BETWEEN_REQUESTS)

    print(f"\nDone. Downloaded: {downloaded}, Skipped (already exist): {skipped}, Missing: {len(missing)}")
    if missing:
        print("\nMissing (no photo found, will fall back to initials):")
        for mk_id, name in missing:
            print(f"  {mk_id}: {name}")

if __name__ == "__main__":
    main()