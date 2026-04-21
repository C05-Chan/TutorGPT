from unittest import result
# import bycrypt
from fastapi import FastAPI, Body
from database import init_db, get_connection

app = FastAPI()

init_db()


@app.post("/api/login")
def login(email: str = Body(...), password: str = Body(...)):
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT userID FROM users WHERE email = ? AND password = ?", (email, password))
    result = cursor.fetchone()
    connection.close()

    if result:
        return {"success": True, "userID": result[0]}
    else:
        return {"error": False, "message": "Invalid Email or Password. Please Try Again."}
    


@app.get("/api/emailcheck")
def email_check(email: str):
    email = email.lower()
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT email FROM users WHERE email = ?", (email,))
    
    result = cursor.fetchone()
    connection.close()

    if result:
        return {"exists": True}
    else:
        return {"exists": False}

@app.get("/api/userinfo")
def get_user(email: str):
    email = email.lower()
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT userID, username FROM users WHERE email = ?", (email,))
    
    result = cursor.fetchone()
    connection.close()

    if result:
        return {"userID": result[0], "username": result[1]}
    else:
        return {"error": True, "message": "User not found."}

    
@app.post("/api/signup")
def signup(data: dict = Body(...)):
    username = data["username"]
    email = data["email"].lower()
    password = data["password"]
    
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", (username, email, password))
    connection.commit()
    connection.close()
    
    return {"success": True, "message": "Account created successfully. Please log in."}

@app.post("/api/resetpassword")
def reset_password(data: dict = Body(...)):
    new_password = data["password"]
    email = data["email"].lower()


    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("UPDATE users SET password = ? WHERE email = ?", (new_password, email))
    
    connection.commit()
    connection.close()

    return {"success": True, "message": "Password reset successfully. Please log in with your new password."}

@app.get("/api/chats")
def get_chats(user_id: int):
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT chatSessionID, chatTitle FROM chatSession WHERE userID = ?", (user_id,))
    chats = cursor.fetchall()
    connection.close()

    return {"chats": chats}

@app.get("/api/userSettings")
def get_user_settings(user_id: int):
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM accountSettings WHERE userID = ?", (user_id,))
    settings = cursor.fetchone()
    connection.close()

    return {"settings": {
        "responseLength": settings[2],
        "displayMode": settings[3],
        "displayTextSize": settings[4],
        "displayFontStyle": settings[5]
    }}

@app.post("/api/updateSettings")
def update_settings(data: dict = Body(...)):
    user_id = data["userID"]
    response_length = data["responseLength"]
    display_mode = data["displayMode"]
    display_text_size = data["displayTextSize"]
    display_font_style = data["displayFontStyle"]

    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("UPDATE accountSettings SET responseLength = ?, displayMode = ?, displayTextSize = ?, displayFontStyle = ? WHERE userID = ? ",  (response_length, display_mode, display_text_size, display_font_style, user_id))
    
    connection.commit()
    connection.close()

    return {"success": True, "message": "Settings updated successfully."}