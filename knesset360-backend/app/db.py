import psycopg2
import os
from config import config

def get_db_connection():
    try:
        # This gets the folder where db.py is located, then navigates to database.ini
        base_dir = os.path.dirname(os.path.abspath(__file__))
        ini_path = os.path.join(base_dir, '..', '..', 'db-files', 'database.ini')
        params = config(filename=ini_path)
        conn = psycopg2.connect(**params)
        return conn
    except Exception as e:
        print(f"Database connection failed: {e}")
        return None