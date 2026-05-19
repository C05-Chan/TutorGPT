RESET_EMAIL = "testuser@fakemail.com"
NEW_PASSWORD = "mynewpassword456"
ORIGINAL_PASSWORD = "password123"

def test_reset_password_success(client):
    # this tests the reset password endpoint
    # with valid data and confirms the response is successful
    
    response = client.post("/api/resetpassword", json={
        "email": RESET_EMAIL,
        "password": NEW_PASSWORD
    })
    
    data = response.json()
    assert response.status_code == 200
    assert data["success"] == True

def test_login_with_new_password(client):
    # this tests logging in with the new password
    # makes sure the new password works
    
    response = client.post("/api/login", json={
        "email": RESET_EMAIL,
        "password": NEW_PASSWORD
    })
    assert response.json()["success"] == True

def test_old_password_no_longer_works(client):
    # this tests that the old password can no longer works
    # makes sure user can't log in with old password
    
    response = client.post("/api/login", json={
        "email": RESET_EMAIL,
        "password": ORIGINAL_PASSWORD
    })
    assert response.json()["success"] == False

def test_restore_original_password(client):
    # this restores the original password after the reset tests
    # so that other tests that rely on it are not affected
    
    client.post("/api/resetpassword", json={
        "email": RESET_EMAIL,
        "password": ORIGINAL_PASSWORD
    })
    response = client.post("/api/login", json={
        "email": RESET_EMAIL,
        "password": ORIGINAL_PASSWORD
    })
    assert response.json()["success"] == True

def test_reset_password_old_no_longer_works_regression(client):
    # this is a regression test that checks the previously reset password
    # makes sure old password is fully invalidated after another reset
    # then restores the original password so other tests are not affected
    
    client.post("/api/resetpassword", json={"email": RESET_EMAIL, "password": "anothernewpassword"})
    response = client.post("/api/login", json={"email": RESET_EMAIL, "password": NEW_PASSWORD})
    assert response.json()["success"] == False
    # restore
    client.post("/api/resetpassword", json={"email": RESET_EMAIL, "password": ORIGINAL_PASSWORD})