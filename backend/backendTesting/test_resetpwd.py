RESET_EMAIL = "testuser@fakemail.com"
NEW_PASSWORD = "mynewpassword456"
ORIGINAL_PASSWORD = "password123"

def test_reset_password_success(client):
    response = client.post("/api/resetpassword", json={
        "email": RESET_EMAIL,
        "password": NEW_PASSWORD
    })
    data = response.json()
    assert response.status_code == 200
    assert data["success"] == True

def test_login_with_new_password(client):
    # Should be able to log in with the new password after reset
    response = client.post("/api/login", json={
        "email": RESET_EMAIL,
        "password": NEW_PASSWORD
    })
    assert response.json()["success"] == True

def test_old_password_no_longer_works(client):
    # Old password should now fail
    response = client.post("/api/login", json={
        "email": RESET_EMAIL,
        "password": ORIGINAL_PASSWORD
    })
    assert response.json()["error"] == True

def test_restore_original_password(client):
    # Restore original password so other tests aren't affected
    client.post("/api/resetpassword", json={
        "email": RESET_EMAIL,
        "password": ORIGINAL_PASSWORD
    })
    response = client.post("/api/login", json={
        "email": RESET_EMAIL,
        "password": ORIGINAL_PASSWORD
    })
    assert response.json()["success"] == True