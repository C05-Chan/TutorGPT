import pytest, sqlite3, os, sys

# This lets Python find main.py in the parent folder
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import database
from main import app
from fastapi.testclient import TestClient

# Use a separate test database so we don't touch the real one
TEST_DB_PATH = os.path.join(os.path.dirname(__file__), "test_tutgpt.db")
SQL_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "tutgpt.sql"))
database.DATABASE_PATH = TEST_DB_PATH

# This runs once before all tests — creates a fresh test DB
# and deletes it again when all tests are done
@pytest.fixture(scope="session", autouse=True)
def setup_database():
    if os.path.exists(TEST_DB_PATH):
        os.remove(TEST_DB_PATH)
    conn = sqlite3.connect(TEST_DB_PATH)
    conn.executescript(open(SQL_PATH).read())
    conn.close()
    yield
    os.remove(TEST_DB_PATH)

# This gives every test a "client" they can use to call the API
@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c