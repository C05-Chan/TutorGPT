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