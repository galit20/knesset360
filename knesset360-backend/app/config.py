import os
from configparser import ConfigParser

def config(filename='database.ini', section='postgresql'):
    # Check if we are on Render first!
    env_url = os.environ.get("DATABASE_URL")
    if env_url:
        # Render gives a string: postgresql://user:pass@host:port/dbname
        # We need to parse this string into a dictionary for psycopg2
        import urllib.parse as urlparse
        url = urlparse.urlparse(env_url)
        
        return {
            "dbname": url.path[1:],
            "user": url.username,
            "password": url.password,
            "host": url.hostname,
            "port": url.port or 5432
        }

    # Your local .ini file layout
    parser = ConfigParser()
    parser.read(filename)

    db = {}
    if parser.has_section(section):
        params = parser.items(section)
        for param in params:
            db[param[0]] = param[1]
    else:
        raise Exception('Section {0} not found in the {1} file'.format(section, filename))

    return db
