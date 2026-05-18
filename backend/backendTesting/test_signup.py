NEW_EMAIL = "brandnewuser@test.com"

def test_email_check_existing_user(client):
    # this test the email check endpoint with an email that is already in the test database 

    response = client.get("/api/emailcheck", params={"email": "testuser@fakemail.com"})
    assert response.status_code == 200
    assert response.json()["exists"] == True

def test_email_check_nonexistent_user(client):
    # this test the email check endpoint with an email that is not in the test database
    
    response = client.get("/api/emailcheck", params={"email": "nobody@nowhere.com"})
    assert response.status_code == 200
    assert response.json()["exists"] == False

def test_email_check_case_insensitive(client):
    # this test the email check endpoint with an email that is in the test database but with different casing to check if its case insensitive
    
    response = client.get("/api/emailcheck", params={"email": "TESTUSER@FAKEMAIL.COM"})
    assert response.status_code == 200
    assert response.json()["exists"] == True
    
def test_signup_success(client):
    # this tests the signup endpoint with valid data and checks if the response is successful
    
    response = client.post("/api/signup", json={
        "username": "Brand New User",
        "email": NEW_EMAIL,
        "password": "securepassword123"
    })
    data = response.json()
    assert response.status_code == 200
    assert data["success"] == True

def test_signup_creates_account_settings(client):
    # this tests that after signing up the user has default account settings created for them [RELIES ON PREVIOUS TESTS TO PASS]
    
    user_response = client.get("/api/userinfo", params={"email": NEW_EMAIL})
    user_id = user_response.json()["userID"]

    settings_response = client.get("/api/userSettings", params={"user_id": user_id})
    assert settings_response.status_code == 200
    settings = settings_response.json()["settings"]
    assert settings["responseLength"] == "Medium"
    assert settings["displayMode"] == "Light"

def test_signup_then_login(client):
    # this test that the new signed up user can then log in with the credentials [RELIES ON PREVIOUS TESTS TO PASS]
    
    response = client.post("/api/login", json={
        "email": NEW_EMAIL,
        "password": "securepassword123"
    })
    data = response.json()
    assert data["success"] == True
    
    
def test_integration_signup_and_login(client):
    # this is an integration test that covers the full flow of signing up a new user 
    # then logging in with that user to check if everything works together
    
    client.post("/api/signup", json={
        "username": "Integration User",
        "email": "integration@test.com",
        "password": "password123"
    })
    response = client.post("/api/login", json={
        "email": "integration@test.com",
        "password": "password123"
    })
    assert response.json()["success"] == True