SEEDED_EMAIL = "testuser@fakemail.com"
SEEDED_USER_ID = 1

def test_get_user_info_success(client):
    response = client.get("/api/userinfo", params={"email": SEEDED_EMAIL})
    data = response.json()
    assert response.status_code == 200
    assert data["userID"] == SEEDED_USER_ID
    assert "username" in data

def test_get_user_info_not_found(client):
    response = client.get("/api/userinfo", params={"email": "ghost@nowhere.com"})
    assert response.json()["error"] == True

def test_get_user_settings_success(client):
    response = client.get("/api/userSettings", params={"user_id": SEEDED_USER_ID})
    assert response.status_code == 200
    assert "settings" in response.json()

def test_update_settings_success(client):
    response = client.post("/api/updateSettings", json={
        "userID": SEEDED_USER_ID,
        "responseLength": "Long",
        "displayMode": "Dark",
        "displayTextSize": "Large",
        "displayFontStyle": "Times New Roman"
    })
    assert response.status_code == 200
    assert response.json()["success"] == True
    
def test_settings_persist_after_multiple_updates(client):
    # Regression: saving settings twice shouldn't corrupt values
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

def test_full_signup_settings_created_and_updatable(client):
    # Integration: sign up → check default settings → update → verify persisted
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