import requests
import time
import random
import csv

def fetch_knesset_GovMinistry_odata_to_csv():
    url = "https://knesset.gov.il/OdataV4/ParliamentInfo/KNS_GovMinistry?$orderby=Id"
    csv_filename = "GovMinistry.csv"
    
    headers = [
        "Id", "Name", "IsActive", "LastUpdatedDate", 
        "CategoryID", "CategoryName", "GovID"
    ]
    
    page_count = 1
    total_records = 0

    # Open the CSV file once
    with open(csv_filename, mode='w', newline='', encoding='utf-8-sig') as csv_file:
        # Set up the writer with your known headers
        writer = csv.DictWriter(csv_file, fieldnames=headers)
        
        # Write the header row immediately, before even fetching data
        writer.writeheader()
        
        # Start fetching pages
        while url:
            print(f"Fetching page {page_count}...")
            response = requests.get(url)
            
            if response.status_code != 200:
                print(f"Failed! HTTP Status: {response.status_code}")
                break
                
            data = response.json()
            records = data.get('value', [])
            
            # Write all the records from this page
            for record in records:
                # extrasaction='ignore' is a great safety net! 
                # It tells the writer to ignore any unexpected extra fields the API might send
                writer.writerow(record)
                total_records += 1
                
            # Check for the next page
            next_link = data.get('@odata.nextLink')
            if next_link:
                url = next_link
                page_count += 1
            else:
                url = None
                
    print(f"\nSuccess! Fetched {page_count} pages.")
    print(f"Total records saved: {total_records}")


def fetch_knesset_person_odata_to_csv():
    url = "https://knesset.gov.il/OdataV4/ParliamentInfo/KNS_Person?$orderby=Id"
    csv_filename = "Person.csv"
    
    headers = [
        "Id", "LastName", "FirstName", "GenderID", 
        "GenderDesc", "Email", "IsCurrent", "LastUpdatedDate"
    ]
    
    page_count = 1
    total_records = 0

    # Open the CSV file once
    with open(csv_filename, mode='w', newline='', encoding='utf-8-sig') as csv_file:
        # Set up the writer with your known headers
        writer = csv.DictWriter(csv_file, fieldnames=headers)
        
        # Write the header row immediately, before even fetching data
        writer.writeheader()
        
        # Start fetching pages
        while url:
            print(f"Fetching page {page_count}...")
            response = requests.get(url)
            
            if response.status_code != 200:
                print(f"Failed! HTTP Status: {response.status_code}")
                break
                
            data = response.json()
            records = data.get('value', [])
            
            # Write all the records from this page
            for record in records:
                # extrasaction='ignore' is a great safety net! 
                # It tells the writer to ignore any unexpected extra fields the API might send
                writer.writerow(record)
                total_records += 1
                
            # Check for the next page
            next_link = data.get('@odata.nextLink')
            if next_link:
                url = next_link
                page_count += 1
            else:
                url = None
                
    print(f"\nSuccess! Fetched {page_count} pages.")
    print(f"Total records saved: {total_records}")


def fetch_knesset_PersonToPosition_odata_to_csv_stealthily():
    url = "https://knesset.gov.il/OdataV4/ParliamentInfo/KNS_PersonToPosition?$filter=KnessetNum%20ge%2019"
    csv_filename = "PersonToPosition.csv"
    
    csv_headers = [ "Id",
                    "PersonID",
                    "PositionID",
                    "KnessetNum",
                    "StartDate",
                    "FinishDate",
                    "GovMinistryID",
                    "GovMinistryName",
                    "DutyDesc",
                    "FactionID",
                    "FactionName",
                    "GovernmentNum",
                    "CommitteeID",
                    "CommitteeName",
                    "IsCurrent",
                    "LastUpdatedDate"]

    # 1. Set up standard browser headers
    req_headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9,he;q=0.8",
        "Connection": "keep-alive"
    }

    # 2. Create a Session to handle cookies automatically
    session = requests.Session()
    session.headers.update(req_headers)

    page_count = 1
    total_records = 0

    with open(csv_filename, mode='w', newline='', encoding='utf-8-sig') as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=csv_headers, extrasaction='ignore')
        writer.writeheader()
        
        while url:
            print(f"Fetching page {page_count}...")
            
            try:
                # Use session.get instead of requests.get
                response = session.get(url, timeout=60) 
                
                # Check if we got rate-limited (HTTP 429) or forbidden (HTTP 403)
                if response.status_code in [403, 429]:
                    print(f"Warning: Blocked by server (Status {response.status_code}). Resting for 60 seconds...")
                    time.sleep(60)
                    continue # Try the same URL again after resting
                
                response.raise_for_status()
                
                data = response.json()
                records = data.get('value', [])
                
                for record in records:
                    writer.writerow(record)
                    total_records += 1
                    
                next_link = data.get('@odata.nextLink')
                if next_link:
                    url = next_link
                    page_count += 1
                    
                    # 3. Add a RANDOM delay between pages (e.g., 1.5 to 3 seconds)
                    sleep_time = random.uniform(1.5, 3.0)
                    print(f"Sleeping for {sleep_time:.2f} seconds...")
                    time.sleep(sleep_time)
                else:
                    url = None
                    
            except Exception as e:
                print(f"Error on page {page_count}: {e}")
                break # Exit loop if something breaks heavily
                
    print(f"\nSuccess! Total records saved: {total_records}")


def fetch_knesset_table_odata_to_csv_general(url_part: str, csv_headers: list[str], csv_name: str):
    url = "https://knesset.gov.il/OdataV4/ParliamentInfo/" + url_part
    csv_filename = csv_name + ".csv"

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

    with open(csv_filename, mode='w', newline='', encoding='utf-8-sig') as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=csv_headers, extrasaction='ignore')
        writer.writeheader()
        
        while url:
            print(f"Fetching page {page_count}...")
            
            success = False
            max_retries = 3
            
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
                    
                    # Write the successful data to our CSV
                    for record in records:
                        writer.writerow(record)
                        total_records += 1
                        
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
                    
                    # THE FIX: If the server forcefully hangs up, rebuild the pipeline!
                    if "RemoteDisconnected" in str(e) or "Connection aborted" in str(e):
                        print("Rebuilding connection session to bypass drop...")
                        session = requests.Session()
                        session.headers.update(req_headers)
            
            # If we looped 3 times and still failed, give up gracefully
            if not success:
                print(f"Failed to fetch page {page_count} after {max_retries} attempts. Stopping script.")
                break 

    print(f"\nSuccess! Total records saved: {total_records}")


def fetch_knesset_bill_odata_to_csv():
    csv_headers = [ "Id",
                    "KnessetNum",
                    "Name",
                    "TypeID",
                    "TypeDesc",
                    "SubTypeID",
                    "SubTypeDesc",
                    "PrivateNumber",
                    "CommitteeID",
                    "StatusID",
                    "Number",
                    "PostponementReasonID",
                    "PostponementReasonDesc",
                    "PublicationDate",
                    "PublicationSeriesID",
                    "PublicationSeriesDesc",
                    "PublicationSeriesFirstCallID",
                    "PublicationSeriesFirstCallDesc",
                    "MagazineNumber",
                    "PageNumber",
                    "IsContinuationBill",
                    "SummaryLaw",
                    "LastUpdatedDate"]
    fetch_knesset_table_odata_to_csv_general("KNS_Bill?$filter=KnessetNum%20ge%2019", csv_headers, "Bill")


def fetch_knesset_committee_odata_to_csv():
    csv_headers = [ "Id",
                    "Name",
                    "CategoryID",
                    "CategoryDesc",
                    "KnessetNum",
                    "CommitteeTypeID",
                    "CommitteeTypeDesc",
                    "Email",
                    "StartDate",
                    "FinishDate",
                    "AdditionalTypeID",
                    "AdditionalTypeDesc",
                    "ParentCommitteeID",
                    "CommitteeParentName",
                    "IsCurrent",
                    "LastUpdatedDate"]
    fetch_knesset_table_odata_to_csv_general("KNS_Committee?$filter=KnessetNum%20ge%2019", csv_headers, "Committee")

def fetch_knesset_committee_session_odata_to_csv():
    csv_headers = [ "Id",
                    "Number",
                    "KnessetNum",
                    "TypeID",
                    "TypeDesc",
                    "CommitteeID",
                    "StatusID",
                    "StatusDesc",
                    "Location",
                    "SessionUrl",
                    "BroadcastUrl",
                    "StartDate",
                    "FinishDate",
                    "Note",
                    "LastUpdatedDate"]
    fetch_knesset_table_odata_to_csv_general("KNS_CommitteeSession?$filter=KnessetNum%20ge%2019", csv_headers, "CommitteeSession")


def fetch_knesset_document_committee_session_odata_to_csv():
    csv_headers = [ "Id",
                    "CommitteeSessionID",
                    "GroupTypeID",
                    "GroupTypeDesc",
                    "DocumentName",
                    "ApplicationID",
                    "ApplicationDesc",
                    "FilePath",
                    "LastUpdatedDate"]
    fetch_knesset_table_odata_to_csv_general("KNS_DocumentCommitteeSession?$filter=ApplicationID%20ne%206%20and%20KNS_CommitteeSession/KnessetNum%20ge%2019%20and%20KNS_CommitteeSession/StartDate%20ge%202015-01-01T00:00:00Z", csv_headers, "DocumentCommitteeSession")


def fetch_knesset_plenum_session_odata_to_csv():
    csv_headers = [ "Id",
                    "Number",
                    "KnessetNum",
                    "Name",
                    "StartDate",
                    "FinishDate",
                    "IsSpecialMeeting",
                    "LastUpdatedDate"]
    fetch_knesset_table_odata_to_csv_general("KNS_PlenumSession?$filter=KnessetNum%20ge%2019 and StartDate%20ge%202015-01-01T00:00:00Z", csv_headers, "PlenumSession")


def fetch_knesset_document_plenum_session_odata_to_csv():
    csv_headers = [ "Id",
                    "PlenumSessionID",
                    "GroupTypeID",
                    "GroupTypeDesc",
                    "ApplicationID",
                    "ApplicationDesc",
                    "FilePath",
                    "LastUpdatedDate"]
    fetch_knesset_table_odata_to_csv_general("KNS_DocumentPlenumSession?$filter=ApplicationID%20ne%206%20and%20KNS_PlenumSession/KnessetNum%20ge%2019", csv_headers, "DocumentPlenumSession")


def fetch_knesset_KNS_IsraelLaw_odata_to_csv():
    csv_headers = [ "Id",
                    "KnessetNum",
                    "Name",
                    "IsBasicLaw",
                    "IsFavoriteLaw",
                    "PublicationDate",
                    "LatestPublicationDate",
                    "IsBudgetLaw",
                    "LawValidityID",
                    "LawValidityDesc",
                    "ValidityStartDate",
                    "ValidityStartDateNotes",
                    "ValidityFinishDate",
                    "ValidityFinishDateNotes",
                    "LastUpdatedDate"]
    fetch_knesset_table_odata_to_csv_general("KNS_IsraelLaw", csv_headers, "IsraelLaw")


def fetch_knesset_KNS_IsraelLawClassificiation_odata_to_csv():
    csv_headers = [ "Id",
                    "IsraelLawID",
                    "ClassificiationID",
                    "ClassificiationDesc",
                    "LastUpdatedDate"]
    fetch_knesset_table_odata_to_csv_general("KNS_IsraelLawClassificiation", csv_headers, "IsraelLawClassificiation")

def fetch_knesset_KNS_IsraelLawMinistry_odata_to_csv():
    csv_headers = [ "Id",
                    "IsraelLawID",
                    "LastUpdatedDate",
                    "MinistryCategoryID",
                    "MinistryCategoryDesc"]
    fetch_knesset_table_odata_to_csv_general("KNS_IsraelLawMinistry", csv_headers, "IsraelLawMinistry")


def fetch_knesset_KNS_BillInitiator_odata_to_csv():
    csv_headers = [ "Id",
                    "BillID",
                    "PersonID",
                    "IsInitiator",
                    "Ordinal",
                    "LastUpdatedDate"]
    fetch_knesset_table_odata_to_csv_general("KNS_BillInitiator?$filter=KNS_Bill/KnessetNum%20ge%2019", csv_headers, "BillInitiator")


def fetch_knesset_KNS_BillHistoryInitiator_odata_to_csv():
    csv_headers = [ "Id",
                    "BillID",
                    "PersonID",
                    "IsInitiator",
                    "StartDate",
                    "EndDate",
                    "ReasonID",
                    "ReasonDesc",
                    "LastUpdatedDate"]
    fetch_knesset_table_odata_to_csv_general("KNS_BillHistoryInitiator?$filter=KNS_Bill/KnessetNum%20ge%2019", csv_headers, "BillHistoryInitiator")


if __name__ == "__main__":
    # fetch_knesset_table_odata_to_csv_general("KNS_Faction?$filter=KnessetNum%20ge%2019", [ "Id", "Name", "KnessetNum", "StartDate", "FinishDate", "IsCurrent", "LastUpdatedDate"], "Faction") # faction data
    # fetch_knesset_document_committee_session_odata_to_csv()
    # fetch_knesset_KNS_IsraelLawClassificiation_odata_to_csv()
    # fetch_knesset_KNS_IsraelLawMinistry_odata_to_csv()
    fetch_knesset_KNS_BillHistoryInitiator_odata_to_csv()