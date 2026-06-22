import requests
import time
import random
import psycopg2
from datetime import datetime, timedelta, timezone
from psycopg2.extras import execute_values
from config import config

def yesterday_odata_format():
    today = datetime.now(timezone.utc)
    yesterday = today - timedelta(days=1)
    yesterday_midnight = yesterday.replace(hour=0, minute=0, second=0, microsecond=0)
    new_date = yesterday_midnight.strftime("%Y-%m-%dT%H:%M:%SZ")
    print(f"Fetching records updated since: {new_date}")
    return new_date


""" Connect to the PostgreSQL database server """
def connect():
    conn = None
    try:
        params = config() # read connection parameters
        print('Connecting to the PostgreSQL database...')
        conn = psycopg2.connect(**params)
        cur = conn.cursor()

        fetch_by_last_update_date_from_odata(conn, cur)
        # fetch_knesset_table_odata_to_DB_by_specific_id(conn, cur, "kns_committeesession", "554729")
        # fetch_knesset_table_odata_to_DB(conn, cur, "KNS_DocumentCommitteeSession", yesterday_odata_format())

        cur.close()  
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if conn is not None:
            conn.close()
            print('Database connection closed.')


# batch-upsert (update or insert) page by page
def fetch_by_last_update_date_from_odata(conn, cursor):
    table_names = [ "KNS_Status",
                    "KNS_Committee",
                    "KNS_CommitteeSession",
                    "KNS_DocumentCommitteeSession",
                    "KNS_GovMinistry",
                    "KNS_IsraelLaw",
                    "KNS_IsraelLawClassificiation",
                    "KNS_IsraelLawMinistry",
                    "KNS_PlenumSession",
                    "KNS_DocumentPlenumSession",
                    "KNS_KnessetDates",
                    "KNS_Person",
                    "KNS_Position",
                    "KNS_Faction", 
                    "KNS_PersonToPosition",
                    "KNS_Bill",
                    "KNS_BillInitiator",
                    "KNS_BillHistoryInitiator"]
    data_since_date = yesterday_odata_format()
    for table in table_names:
        print(f"\n --- Fetching data for: {table} ---")
        fetch_knesset_table_odata_to_DB(conn, cursor, table, data_since_date)


def add_filter_based_on_table(table_name):
    knesset19 = "KnessetNum ge 19"
    knessetNum_tables = ["KNS_Bill", "KNS_IsraelLaw", "KNS_Committee",
        "KNS_CommitteeSession", "KNS_PlenumSession",
        "KNS_PersonToPosition", "KNS_Faction",
        "KNS_KnessetDates"]
    if table_name in knessetNum_tables:
        return f" and {knesset19}"
    elif table_name == "KNS_DocumentPlenumSession":
        return f" and ApplicationID ne 6 and KNS_PlenumSession/{knesset19}"
    elif table_name == "KNS_DocumentCommitteeSession":
        return f" and ApplicationID ne 6 and KNS_CommitteeSession/{knesset19}"
    elif table_name == "KNS_BillInitiator" or table_name == "KNS_BillHistoryInitiator":
        return f" and KNS_Bill/{knesset19}"
    else: return ""


def fetch_knesset_table_odata_to_DB(conn, cursor, table_name: str, date):
    url = f"https://knesset.gov.il/OdataV4/ParliamentInfo/{table_name}"
    params = {
        "$filter": f"LastUpdatedDate ge {date}{add_filter_based_on_table(table_name)}",
        "$orderby": "Id"
    }
    req_headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9,he;q=0.8",
        "Connection": "keep-alive"
    }

    # Initialize the first session
    session = requests.Session()
    session.headers.update(req_headers)
    current_params = params
    
    page_count = 1
    total_records = 0
    
    while url:
        print(f"Fetching page {page_count}...")
        success = False
        max_retries = 3
        db_error_occurred = False
        
        for attempt in range(max_retries):
            try:
                # 60-second timeout to give the server plenty of time
                response = session.get(url, params=current_params, timeout=60) 
                
                # Handle soft blocks / rate limiting
                if response.status_code in [403, 429]:
                    print(f"Warning: Blocked! (Status {response.status_code}). Resting for 60 seconds...")
                    time.sleep(60)
                    continue
                
                response.raise_for_status()
                data = response.json() 
                records = data.get('value', [])

                # Write the successful data to the DB
                if records:
                    # check if knessetNum is here and do a filter.
                    columns = [col for col in records[0].keys() if not col.startswith('@')] # Dynamically grab column names from the first record in the JSON
                    lower_case_columns = [col.lower() for col in columns]
                    col_names_str = '", "'.join(lower_case_columns)  # Format columns for the query
                    update_set = ', '.join([f'"{col}" = EXCLUDED."{col}"' for col in lower_case_columns if col != 'Id']) # Update every column EXCEPT the Id column
                    # Raw query using ON CONFLICT - UPSERT
                    upsert_query = f"""
                        INSERT INTO {table_name} ("{col_names_str}") 
                        VALUES %s
                        ON CONFLICT (id) 
                        DO UPDATE SET {update_set};
                    """
                    values_to_insert = [[record.get(col) for col in columns] for record in records] # get values only

                    if values_to_insert:
                        try:
                            execute_values(cursor, upsert_query, values_to_insert)
                            conn.commit() 
                            total_records += len(records)
                        except psycopg2.Error as db_err:
                            print(f"\nDB ERROR on table {table_name}: {db_err}")
                            conn.rollback() # Reset the frozen transaction!
                            db_error_occurred = True
                            break # Break out of the retry loop completely
                
                if db_error_occurred:
                    break

                # Handle pagination
                next_link = data.get('@odata.nextLink')
                if next_link:
                    url = next_link
                    current_params = None
                    page_count += 1
                    
                    # Random sleep to look like a human clicking "Next Page"
                    sleep_time = random.uniform(1.5, 3.0)
                    print(f"Sleeping for {sleep_time:.2f} seconds...")
                    time.sleep(sleep_time)
                else:
                    url = None # No more pages, exit loop
                
                success = True
                break # Success! Break out of the retry loop and move to the next page
                
            except requests.exceptions.Timeout:
                print(f"--> Timeout on page {page_count} (Attempt {attempt+1}/{max_retries}). Retrying in 5 seconds...")
                time.sleep(5)
                
            except Exception as e:
                print(f"--> Error on page {page_count} (Attempt {attempt+1}/{max_retries}): {e}")
                time.sleep(5)
                
                # Rebuild pipeline If the server forcefully hangs up
                if "RemoteDisconnected" in str(e) or "Connection aborted" in str(e):
                    print("Rebuilding connection session to bypass drop...")
                    session = requests.Session()
                    session.headers.update(req_headers)
        
        # If we looped 3 times and still failed, give up gracefully
        if not success:
            print(f"Failed to fetch page {page_count} after {max_retries} attempts. Stopping script.")
            break 


    if total_records == 0:
        print(f"\nSuccess! No New data found for: {table_name}")
    else:
        print(f"\nSuccess! Total records saved/updated: {total_records}")


def fetch_knesset_table_odata_to_DB_by_specific_id(conn, cursor, table_name: str, filter_id):
    url = f"https://knesset.gov.il/OdataV4/ParliamentInfo/{table_name}?$filter=id eq {filter_id}"
    req_headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9,he;q=0.8",
        "Connection": "keep-alive"
    }

    # Initialize the first session
    session = requests.Session()
    session.headers.update(req_headers)
    page_count = 1
    total_records = 0
    
    while url:
        print(f"Fetching page {page_count}...")
        success = False
        max_retries = 3
        db_error_occurred = False
        
        for attempt in range(max_retries):
            try:
                # 60-second timeout to give the server plenty of time
                response = session.get(url, timeout=60) 
                
                # Handle soft blocks / rate limiting
                if response.status_code in [403, 429]:
                    print(f"Warning: Blocked! (Status {response.status_code}). Resting for 60 seconds...")
                    time.sleep(60)
                    continue
                
                response.raise_for_status()
                data = response.json() 
                records = data.get('value', [])

                # Write the successful data to the DB
                if records:

                    # check if knessetNum is here and do a filter.
                    columns = [col for col in records[0].keys() if not col.startswith('@')] # Dynamically grab column names from the first record in the JSON
                    lower_case_columns = [col.lower() for col in columns]
                    col_names_str = '", "'.join(lower_case_columns)  # Format columns for the query
                    update_set = ', '.join([f'"{col}" = EXCLUDED."{col}"' for col in lower_case_columns if col != 'Id']) # Update every column EXCEPT the Id column
                    # Raw query using ON CONFLICT - UPSERT
                    upsert_query = f"""
                        INSERT INTO {table_name} ("{col_names_str}") 
                        VALUES %s
                        ON CONFLICT (id) 
                        DO UPDATE SET {update_set};
                    """
                    values_to_insert = [[record.get(col) for col in columns] for record in records] # get values only
                    
                    try:
                        execute_values(cursor, upsert_query, values_to_insert)
                        conn.commit() 
                        total_records += len(records)
                    except psycopg2.Error as db_err:
                        print(f"\nDB ERROR on table {table_name}: {db_err}")
                        conn.rollback() # Reset the frozen transaction!
                        db_error_occurred = True
                        break # Break out of the retry loop completely
                
                if db_error_occurred:
                    break

                # Handle pagination
                next_link = data.get('@odata.nextLink')
                if next_link:
                    url = next_link
                    page_count += 1
                    
                    # Random sleep to look like a human clicking "Next Page"
                    sleep_time = random.uniform(1.5, 3.0)
                    print(f"Sleeping for {sleep_time:.2f} seconds...")
                    time.sleep(sleep_time)
                else:
                    url = None # No more pages, exit loop
                
                success = True
                break # Success! Break out of the retry loop and move to the next page
                
            except requests.exceptions.Timeout:
                print(f"--> Timeout on page {page_count} (Attempt {attempt+1}/{max_retries}). Retrying in 5 seconds...")
                time.sleep(5)
                
            except Exception as e:
                print(f"--> Error on page {page_count} (Attempt {attempt+1}/{max_retries}): {e}")
                time.sleep(5)
                
                # Rebuild pipeline If the server forcefully hangs up
                if "RemoteDisconnected" in str(e) or "Connection aborted" in str(e):
                    print("Rebuilding connection session to bypass drop...")
                    session = requests.Session()
                    session.headers.update(req_headers)
        
        # If we looped 3 times and still failed, give up gracefully
        if not success:
            print(f"Failed to fetch page {page_count} after {max_retries} attempts. Stopping script.")
            break 


    if total_records == 0:
        print(f"\nSuccess! No New data found for: {table_name}")
    else:
        print(f"\nSuccess! Total records saved/updated: {total_records}")


if __name__ == '__main__':
    connect()