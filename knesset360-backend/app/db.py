import psycopg2
from config import config

def get_db_connection():
    try:
        # Pass the correct path to your ini file here
        params = config(filename='../../db-files/database.ini')
        conn = psycopg2.connect(**params) 
        return conn
    except Exception as e:
        print(f"Database connection failed: {e}")
        return None