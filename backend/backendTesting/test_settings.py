SEEDED_EMAIL = "testuser@fakemail.com"
SEEDED_USER_ID = 1

def test_get_user_info_success(client):
    # this tests the user info endpoint with a valid email and checks if the correct user info is returned
    
    response = client.get("/api/userinfo", params={"email": SEEDED_EMAIL})
    data = response.json()
    assert response.status_code == 200
    assert data["userID"] == SEEDED_USER_ID
    assert "username" in data

def test_get_user_info_not_found(client):
    # this tests the user info endpoint with an email that is not in the test database and checks if the correct error response is returned
    
    response = client.get("/api/userinfo", params={"email": "ghost@nowhere.com"})
    assert response.json()["error"] == True

def test_get_user_settings_success(client):
    # this tests the user settings endpoint with a valid user ID and checks if the correct settings are returned
    
    response = client.get("/api/userSettings", params={"user_id": SEEDED_USER_ID})
    assert response.status_code == 200
    assert "settings" in response.json()

def test_update_settings_success(client):
    # this tests the update settings endpoint with valid data and checks if the response is successful
    
    response = client.post("/api/updateSettings", json={
        "userID": SEEDED_USER_ID,
        "responseLength": "Long",
        "displayMode": "Dark",
        "displayTextSize": "Large",
        "displayFontStyle": "Times New Roman"
    })
    assert response.status_code == 200
    assert response.json()["success"] == True
    
def test_settings_regression_multiple_updates(client):
    # this is a regression test that checks if updating settings multiple times works correctly 
    
    client.post("/api/updateSettings", json={
        "userID": SEEDED_USER_ID, "responseLength": "Short",
        "displayMode": "Light", "displayTextSize": "Small", "displayFontStyle": "Arial"
    })
    client.post("/api/updateSettings", json={
        "userID": SEEDED_USER_ID, "responseLength": "Long",
        "displayMode": "Dark", "displayTextSize": "Large", "displayFontStyle": "Times New Roman"
    })
    settings = client.get("/api/userSettings", params={"user_id": SEEDED_USER_ID}).json()["settings"]
    assert settings["responseLength"] == "Long"
    assert settings["displayMode"] == "Dark"

def test_integration_signup_settings_created_and_updatable(client):
    # this is an integration test that covers the full flow of signing up a new user
    # checking they have default settings, 
    # updating those settings and then checking the updated settings are correct

    client.post("/api/signup", json={
        "username": "Settings User",
        "email": "settingsuser@test.com",
        "password": "password123"
    })
    user_id = client.get("/api/userinfo", params={"email": "settingsuser@test.com"}).json()["userID"]

    settings = client.get("/api/userSettings", params={"user_id": user_id}).json()
    assert settings["settings"]["responseLength"] == "Medium"

    client.post("/api/updateSettings", json={
        "userID": user_id, "responseLength": "Long",
        "displayMode": "Dark", "displayTextSize": "Large", "displayFontStyle": "Arial"
    })
    updated = client.get("/api/userSettings", params={"user_id": user_id}).json()
    assert updated["settings"]["responseLength"] == "Long"