def test_delete_account_success(client):
    # First create a user to delete
    client.post("/api/signup", json={
        "username": "To Be Deleted",
        "email": "deleteme@test.com",
        "password": "temppassword"
    })
    user_response = client.get("/api/userinfo", params={"email": "deleteme@test.com"})
    user_id = user_response.json()["userID"]

    response = client.post("/api/deleteaccount", json={"userID": user_id})
    data = response.json()
    assert response.status_code == 200
    assert data["success"] == True


def test_deleted_account_no_longer_exists(client):
    response = client.get("/api/emailcheck", params={"email": "deleteme@test.com"})
    assert response.json()["exists"] == False


def test_deleted_account_cannot_login(client):
    response = client.post("/api/login", json={
        "email": "deleteme@test.com",
        "password": "temppassword"
    })
    assert response.json()["error"] == True