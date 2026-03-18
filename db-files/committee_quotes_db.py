"""
Pipeline for extracting quotes from Knesset committee protocol documents.

Steps:
1. Download protocol documents from URL
2. Parse speakers and text from Word files
3. Store quotes in PostgreSQL
4. Index quotes in Elasticsearch
"""

import os
import requests
import docx
from IPython.display import display
import pandas as pd
import swifter
import sqlalchemy
import urllib
import functools
import re
import math
from elasticsearch import Elasticsearch
from elasticsearch.helpers import bulk, parallel_bulk
from datetime import datetime
import psycopg2
import configparser
from sqlalchemy.dialects.postgresql import insert

try:
    import win32com.client as win32
    from win32com.client import constants
except ImportError:
    pass
from io import BytesIO

# Load configuration parameters from database.ini for a given section
def load_config(filename='database.ini', section='postgresql'):
    parser = configparser.ConfigParser()
    parser.read(filename)

    if parser.has_section(section):
        params = parser.items(section)
        return {param[0]: param[1] for param in params}
    else:
        raise Exception(f'Section {section} not found in {filename}')

# Download a protocol document from a URL and return it as a python-docx Document object
def get_doc_from_url(url):
    ### sometimes cache issues occur - delete it from C:\Users\USER_NAME\AppData\Local\Temp\gen_py
    try:
        content = requests.get(url).content

        if content.startswith(b"PK"):
            buffer = BytesIO(content)   # assume it's a docx
        else:
            filepath = os.path.join(os.getcwd(), 'tmp.doc') # assume it's a doc

            with open(filepath, 'wb') as file:
                file.write(content)

            word = win32.gencache.EnsureDispatch('Word.Application')
            doc = word.Documents.Open(filepath)
            doc.Activate()
            word.ActiveDocument.SaveAs(filepath, FileFormat=constants.wdFormatXMLDocument)
            doc.Close(False)

            buffer = BytesIO(open(filepath, "rb").read())
            os.remove(filepath)

        buffer.seek(0)
        doc = docx.Document(buffer)
        return doc
    except Exception as e:
        print(f"{e} - Cannot get content properly from", url)

# Determine if a paragraph represents a speaker line in the protocol
def is_speaker(p):
    if is_speaker_strong(p):
        return True
    return p.text.endswith(':') and p.runs[0].underline

# Strong detection of speaker paragraphs based on Word style tags
def is_speaker_strong(p):
    return p.text and len(p.text.strip()) > 2 and p.style.name in relevant_tags

# Clean and normalize the speaker name by removing tags, titles, and extra symbols
def clean_speaker_name(text):
    text = re.sub(r"<<.*?>>", "", text)
    text = re.sub(r"\(.*?\)", "", text)
    text = re.sub(r"היו\"ר\s*", "", text)
    text = text.replace(":", "") 
    return text.strip()

# Parse protocol documents and extract speaker quotes into a structured DataFrame
def process_protocols(df):
    dfs = []
    non_existent = 0
    j = 0
    for i, row in df.iterrows():
        j += 1
        print(f'processing row {j} - {round(j / df.shape[0] * 100, 2)}%, S: {non_existent}                    ',
              end='\r')

        url = row['FilePath']
        document = get_doc_from_url(url)

        running_index = 0
        latest_speaker = ''
        should_record = False
        records = []
        try:
            for p in document.paragraphs:
                if (not should_record and is_speaker_strong(p)) or (should_record and is_speaker(p)):
                    should_record = True
                    latest_speaker = clean_speaker_name(p.text)
                    continue

                if should_record and len(p.text) > 1 and '<<' not in p.text:
                    running_index += 1
                    records.append(
                        {'Index': running_index, 'Speaker': latest_speaker, 'RawText': p.text, '$Type': "Committee"})
            file_df = pd.DataFrame.from_records(records)
            file_df['DocumentCommitteeSessionID'] = row['DocumentCommitteeSessionID']
            file_df['StartDate'] = row['StartDate']

            if len(file_df):
                dfs.append(file_df)
        except Exception as e:
            print(f'Error: {e}', url)
            import traceback
            traceback.print_exc()

    df = pd.concat(dfs, ignore_index=True)
    return df

# Convert DataFrame rows into Elasticsearch bulk indexing format
def gen(quotes):
    j = 0
    for i, row in quotes.iterrows():
        j = j + 1
        row = dict(row)
        if row["$Type"] == "Committee":
            row["DocumentID"] = row.pop("DocumentCommitteeSessionID")
        else:
            row["DocumentID"] = row.pop("DocumentPlenumSessionID")
        row["$Timestamp"] = datetime.now()
        row["_index"] = "quotes"
        row["_id"] = f'{row["$Type"]}:{row["DocumentID"]}:{row["Index"]}'
        yield row
        if j % 1000 == 0:
            print(f'{j}          ', end='\r')

relevant_tags = ['דובר-המשך', 'קריאה', 'קריאות', 'יור', 'דובר', 'קריאה', 'דובר_המשך']

df = pd.DataFrame(
[["25/12/08 12:30","10230910","https://fs.knesset.gov.il/25/Committees/25_ptv_10230910.doc"]],
columns=["StartDate", "DocumentCommitteeSessionID", "FilePath"]
)

# Convert types to match SQL version
df["StartDate"] = pd.to_datetime(df["StartDate"], format="%y/%m/%d %H:%M")
df["DocumentCommitteeSessionID"] = df["DocumentCommitteeSessionID"].astype(int)
quotes = process_protocols(df)

#pd.set_option("display.max_rows", None)
# pd.set_option("display.max_columns", None)
# print("quotes shape:", quotes.shape)
# display(quotes)

db = load_config(section='postgresql')
engine = sqlalchemy.create_engine(
    f"postgresql+psycopg2://{db['user']}:{db['password']}@{db['host']}:{db['port']}/{db['database']}"
)

def insert_ignore(table, conn, keys, data_iter):
    data = [dict(zip(keys, row)) for row in data_iter]
    stmt = insert(table.table).values(data)
    stmt = stmt.on_conflict_do_nothing(
        index_elements=["DocumentCommitteeSessionID", "Index"]
    )
    conn.execute(stmt)

quotes.to_sql(
    "committee_quotes_table",
    engine,
    if_exists="append",
    index=False,
    method=insert_ignore
)
print("Quotes loaded into PostgreSQL")

# Part 5 removed:
# Previously handled cleaning speaker names and mapping them to PersonID
# values from the KNS_Person database. This mapping logic is no longer used.

#elastic search part
quotes.replace({math.nan: None}, inplace=True)
es_conf = load_config(section='elasticsearch')

es = Elasticsearch(
    f"{es_conf['host']}:{es_conf['port']}",
    basic_auth=(es_conf['user'], es_conf['password']) if es_conf['user'] else None
)

for success, info in parallel_bulk(es, gen(quotes)):
    if not success:
        print('failed', info)

es.transport.close()


