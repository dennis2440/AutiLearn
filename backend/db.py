import pymysql
from flask import current_app, g

def get_db():
    if "db" not in g:
        g.db = pymysql.connect(
            host=current_app.config["DB_HOST"],
            port=current_app.config["DB_PORT"],
            user=current_app.config["DB_USER"],
            password=current_app.config["DB_PASSWORD"],
            database=current_app.config["DB_NAME"],
            cursorclass=pymysql.cursors.DictCursor,
            charset="utf8mb4",
            autocommit=False
        )
    return g.db

def fetch_one(sql, values=()):
    with get_db().cursor() as cursor:
        cursor.execute(sql, values)
        return cursor.fetchone()

def fetch_all(sql, values=()):
    with get_db().cursor() as cursor:
        cursor.execute(sql, values)
        return cursor.fetchall()

def execute(sql, values=()):
    connection = get_db()
    with connection.cursor() as cursor:
        cursor.execute(sql, values)
        connection.commit()
        return cursor.lastrowid

def close_db(error=None):
    connection = g.pop("db", None)
    if connection is not None:
        if error:
            connection.rollback()
        connection.close()

def check_connection():
    try:
        fetch_one("SELECT 1 AS connected")
        return True
    except Exception:
        return False
