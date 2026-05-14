NEW_EMAIL = "brandnewuser@test.com"

def test_email_check_existing_user(client):
    response = client.get("/api/emailcheck", params={"email": "testuser@fakemail.com"})
    assert response.status_code == 200
    assert response.json()["exists"] == True

def test_email_check_nonexistent_user(client):
    response = client.get("/api/emailcheck", params={"email": "nobody@nowhere.com"})
    assert response.status_code == 200
    assert response.json()["exists"] == False

def test_email_check_case_insensitive(client):
    response = client.get("/api/emailcheck", params={"email": "TESTUSER@FAKEMAIL.COM"})
    assert response.status_code == 200
    assert response.json()["exists"] == True
    
def test_signup_success(client):
    response = client.post("/api/signup", json={
        "username": "Brand New User",
        "email": NEW_EMAIL,
        "password": "securepassword123"
    })
    data = response.json()
    assert response.status_code == 200
    assert data["success"] == True

def test_signup_creates_account_settings(client):
    # After signup the user should have default account settings
    user_response = client.get("/api/userinfo", params={"email": NEW_EMAIL})
    user_id = user_response.json()["userID"]

    settings_response = client.get("/api/userSettings", params={"user_id": user_id})
    assert settings_response.status_code == 200
    settings = settings_response.json()["settings"]
    assert settings["responseLength"] == "Medium"
    assert settings["displayMode"] == "Light"

def test_signup_then_login(client):
    # User created in test_signup_success should be able to log in
    response = client.post("/api/login", json={
        "email": NEW_EMAIL,
        "password": "securepassword123"
    })
    data = response.json()
    assert data["success"] == True
    

def test_full_signup_to_login_flow(client):
    # Integration: sign up then immediately log in
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