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
    assert response.json()["success"] == False

def test_full_delete_clears_everything(client):
    # Integration: delete → email gone → login fails
    client.post("/api/signup", json={
        "username": "Delete Flow User",
        "email": "deleteflow@test.com",
        "password": "password123"
    })
    user_id = client.get("/api/userinfo", params={"email": "deleteflow@test.com"}).json()["userID"]
    client.post("/api/deleteaccount", json={"userID": user_id})

    assert client.get("/api/emailcheck", params={"email": "deleteflow@test.com"}).json()["exists"] == False
    assert client.post("/api/login", json={
        "email": "deleteflow@test.com", "password": "password123"
    }).json()["success"] == False