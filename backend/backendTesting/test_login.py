TEST_EMAIL = "testuser@fakemail.com"
TEST_PASSWORD = "password123"

def test_login_success(client):
    response = client.post("/api/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    data = response.json()
    
    assert response.status_code == 200
    assert data["success"] == True
    assert "userID" in data

def test_login_wrong_password(client):
    response = client.post("/api/login", json={
        "email": TEST_EMAIL,
        "password": "wrongpassword"
    })
    data = response.json()
    assert data["error"] == True

def test_login_nonexistent_email(client):
    response = client.post("/api/login", json={
        "email": "nobody@fake.com",
        "password": TEST_PASSWORD
    })
    data = response.json()
    assert data["error"] == True

def test_login_email_case_insensitive(client):
    response = client.post("/api/login", json={
        "email": TEST_EMAIL.upper(),
        "password": TEST_PASSWORD
    })
    assert response.status_code == 200