import pytest, sqlite3, os, sys

# this inserts the parent directory into the path
# so that Python can find main.py when running tests from the tests folder
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))) # this must be before database import

import database
from main import app
from fastapi.testclient import TestClient


# this points the database module at a separate test database
# so that tests never read from or write to the real one

TEST_DB_PATH = os.path.join(os.path.dirname(__file__), "test_tutgpt.db")
SQL_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "tutgpt.sql"))
database.DATABASE_PATH = TEST_DB_PATH

# this runs once before all tests and creates a fresh test database
# by removing any leftover file, running the SQL schema,
# then deleting the database again once all tests are done

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    if os.path.exists(TEST_DB_PATH):
        os.remove(TEST_DB_PATH)
    conn = sqlite3.connect(TEST_DB_PATH)
    conn.executescript(open(SQL_PATH).read())
    conn.close()
    yield
    os.remove(TEST_DB_PATH)

# this gives every test a client they can use to make API calls
# it spins up a fresh TestClient for each test and tears it down after

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c