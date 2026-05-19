TEST_EMAIL = "testuser@fakemail.com"
TEST_PASSWORD = "password123"

def test_login_success(client):
    # this tests logging in with valid credentials
    # makes sure the user can log in
    
    response = client.post("/api/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    data = response.json()
    
    assert response.status_code == 200
    assert data["success"] == True
    assert "userID" in data

def test_login_wrong_password(client):
    # this tests logging in with in with incorrect password
    # makes sure the user cannot log in
    
    response = client.post("/api/login", json={
        "email": TEST_EMAIL,
        "password": "wrongpassword"
    })
    data = response.json()
    assert data["success"] == False

def test_login_nonexistent_email(client):
    # this tests logging in with an email that is not registered
    # makes sure the user cannot log in
    
    response = client.post("/api/login", json={
        "email": "nobody@fake.com",
        "password": TEST_PASSWORD
    })
    data = response.json()
    assert data["success"] == False

def test_login_email_case_insensitive(client):
    # this tests logging in with a case-insensitive email
    # makes sure the user can log in
    
    response = client.post("/api/login", json={
        "email": TEST_EMAIL.upper(),
        "password": TEST_PASSWORD
    })
    assert response.status_code == 200
    
def test_login_email_case_insensitive_regression(client):
    # this is a regression test that checks a fully uppercased email
    # makes sure user can log in
    
    response = client.post("/api/login", json={
        "email": "TESTUSER@FAKEMAIL.COM",
        "password": TEST_PASSWORD
    })
    assert response.json()["success"] == True