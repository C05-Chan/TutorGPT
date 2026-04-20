import sqlite3
import os

BASE_DIR = os.path.dirname(__file__)
DB_PATH = os.path.join(BASE_DIR, "tutgpt.db")
SQL_PATH = os.path.join(BASE_DIR, "tutgpt.sql")


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    conn = get_connection()

    with open(SQL_PATH, "r") as file:
        conn.executescript(file.read())

    conn.close()