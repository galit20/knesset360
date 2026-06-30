import os
import sys
import re
import time
import unicodedata
from pathlib import Path

import requests

sys.path.append(str(Path(__file__).resolve().parent / "knesset360-backend" / "app"))
import psycopg2
from config import config

# -- Settings ----------------------------------------------------------------
OUTPUT_DIR = Path("knesset360-frontend/public/mk-photos")
LISTING_URLS = [
    "https://www.knesset.tv/knesset-members/knesset25/",
    "https://www.knesset.tv/knesset-members/knesset24/",
]
SLEEP_BETWEEN_REQUESTS = 0.5
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

NIKUD_RE = re.compile(r"[\u0591-\u05C7]")  # Hebrew diacritics


def normalize_name(name):
    name = unicodedata.normalize("NFKC", name)
    name = NIKUD_RE.sub("", name)
    name = name.replace("-", " ").replace("'", "").replace('"', "").replace("(", " ").replace(")", " ")
    name = re.sub(r"\s+", " ", name).strip()
    return name


def name_tokens(name):
    return set(normalize_name(name).split())


# -- Get all MKs from DB -------------------------------------------------------
def get_db_mks():
    base_dir = Path(__file__).resolve().parent / "db-files"
    ini_path = base_dir / "database.ini"
    params = config(filename=str(ini_path))
    conn = psycopg2.connect(**params)
    cursor = conn.cursor()
    cursor.execute("SELECT DISTINCT id, firstname, lastname FROM kns_person WHERE firstname IS NOT NULL AND lastname IS NOT NULL")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return rows  # list of (id, firstname, lastname)


def match_person(scraped_name, db_mks):
    """Token-based fuzzy match: scraped name's tokens must be a subset of
    (or equal to) the DB person's full-name tokens, or vice versa."""
    scraped_tokens = name_tokens(scraped_name)
    if not scraped_tokens:
        return None

    best = None
    best_score = 0
    for pid, firstname, lastname in db_mks:
        db_tokens = name_tokens(f"{firstname} {lastname}")
        if not db_tokens:
            continue
        overlap = scraped_tokens & db_tokens
        if not overlap:
            continue
        # require near-full agreement in at least one direction
        if overlap == scraped_tokens or overlap == db_tokens:
            score = len(overlap)
            if score > best_score:
                best_score = score
                best = pid
    return best


# -- Scrape listing pages for name -> profile URL -----------------------------
def get_member_links(html):
    # anchors pointing to a member profile page, capturing visible text
    pattern = re.compile(
        r'<a[^>]+href="(https://www\.knesset\.tv/knesset-members/[^"/]+/?)"[^>]*>(.*?)</a>',
        re.DOTALL,
    )
    results = []
    for url, inner in pattern.findall(html):
        text = re.sub(r"<[^>]+>", " ", inner)
        text = re.sub(r"\s+", " ", text).strip()
        if not text or "knesset25" in url or "knesset24" in url:
            continue
        results.append((text, url))
    return results


def get_profile_image(html):
    m = re.search(r'property="og:image"\s+content="([^"]+)"', html)
    if m:
        return m.group(1).split("?")[0]  # drop ?width=... query params, get full image
    return None


# -- Main ----------------------------------------------------------------------
def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    session = requests.Session()
    session.headers.update(HEADERS)

    print("Loading MKs from database...")
    db_mks = get_db_mks()
    print(f"{len(db_mks)} people in DB")

    # Collect all (name, profile_url) pairs across both listing pages, deduped by url
    seen_urls = set()
    member_links = []
    for listing_url in LISTING_URLS:
        print(f"Fetching listing: {listing_url}")
        r = session.get(listing_url, timeout=20)
        r.raise_for_status()
        for name, url in get_member_links(r.text):
            if url not in seen_urls:
                seen_urls.add(url)
                member_links.append((name, url))
        time.sleep(SLEEP_BETWEEN_REQUESTS)

    print(f"Found {len(member_links)} unique MK profile links")

    downloaded = 0
    skipped_existing = 0
    no_match = []
    no_image = []

    for name, profile_url in member_links:
        personid = match_person(name, db_mks)
        if personid is None:
            no_match.append(name)
            continue

        out_path = OUTPUT_DIR / f"{personid}.jpg"
        if out_path.exists():
            skipped_existing += 1
            continue

        try:
            r = session.get(profile_url, timeout=20)
            r.raise_for_status()
            image_url = get_profile_image(r.text)
            if not image_url:
                no_image.append(name)
                continue

            img_r = session.get(image_url, timeout=20)
            if img_r.status_code == 200 and len(img_r.content) > 1000:
                out_path.write_bytes(img_r.content)
                downloaded += 1
                print(f"OK {personid} {name}")
            else:
                no_image.append(name)
        except Exception as e:
            print(f"-- {name} (error: {e})")
            no_image.append(name)

        time.sleep(SLEEP_BETWEEN_REQUESTS)

    print(f"\nDone. Downloaded: {downloaded}, Already had photo: {skipped_existing}, "
          f"No DB match: {len(no_match)}, No image found: {len(no_image)}")
    if no_match:
        print("\nNo DB match (name mismatch, needs manual check):")
        for n in no_match:
            print(f"  {n}")
    if no_image:
        print("\nMatched in DB but no image found on knesset.tv:")
        for n in no_image:
            print(f"  {n}")


if __name__ == "__main__":
    main()
