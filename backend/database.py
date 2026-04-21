import sqlite3
import os

MAIN_DIRECTORY = os.path.dirname(__file__)
DATABASE_PATH = os.path.join(MAIN_DIRECTORY, "tutgpt.db")
SQL_PATH = os.path.join(MAIN_DIRECTORY, "tutgpt.sql")


def get_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def init_db():
    connection = get_connection()

    with open(SQL_PATH, "r") as file:
        connection.executescript(file.read())

    connection.close()