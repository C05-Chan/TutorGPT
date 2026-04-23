from fastapi import FastAPI, Body
from database import init_db, get_connection
from dotenv import load_dotenv
from aiservice import call_ai

load_dotenv("API.env")

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
        return {"error": True   , "message": "Invalid Email or Password. Please Try Again."}
    


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

@app.get("/api/retrievechats")
def get_chats(user_id: int):
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT chatSessionID, chatTitle FROM chatSession WHERE userID = ?", (user_id,))
    chats = cursor.fetchall()
    connection.close()

    return {"chats": chats}

@app.get("/api/retrievechatinfo")
def get_chat_info(chatSessionID: int):
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT chatTitle, chatSubject FROM chatSession WHERE chatSessionID = ?", (chatSessionID,))
    chat_info = cursor.fetchone()
    connection.close()

    if chat_info:
        return {"chatTitle": chat_info[0], "chatSubject": chat_info[1]}
    else:
        return {"error": True, "message": "Chat session not found."}
    
@app.get("/api/retrievetempchatinfo")
def get_temp_chat_info(tempChatID: int):
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT tempChatTitle, tempChatSubject FROM tempChats WHERE tempChatID = ?", (tempChatID,))
    chat_info = cursor.fetchone()
    connection.close()

    if chat_info:
        return {"tempChatTitle": chat_info[0], "tempChatSubject": chat_info[1]}
    else:
        return {"error": True, "message": "Temporary chat not found."}
    
@app.get("/api/retrievemessages")
def get_messages(chatSessionID: int = None, tempChatID: int = None):
    connection = get_connection()
    cursor = connection.cursor()
    
    if chatSessionID:
        cursor.execute("SELECT sender, messageContent FROM messages WHERE chatSessionID = ?", (chatSessionID,))
    elif tempChatID:
        cursor.execute("SELECT sender, messageContent FROM messages WHERE tempChatID = ?", (tempChatID,))
    else:
        return {"error": True, "message": "No chat session or temporary chat specified."}
    
    messages = cursor.fetchall()
    connection.close()

    return {"messages": messages}

@app.get("/api/retrievetempchats")
def get_temp_chats(tempChatID: int):
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT tempChatID, tempChatTitle FROM tempChats WHERE tempChatID = ?", (tempChatID,))
    temp_chats = cursor.fetchall()
    connection.close()

    return {"tempChats": temp_chats}

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

@app.post("/api/createtempchat")
def create_temp_chat(data: dict = Body(...)):
    temp_chat_title = data["tempChatTitle"]
    temp_chat_subject = data["tempChatSubject"]
    temp_chat_level = data["tempChatExplanationLevel"]

    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("DELETE FROM messages WHERE tempChatID IS NOT NULL")
    cursor.execute("DELETE FROM tempChats") 
    cursor.execute("INSERT INTO tempChats (tempChatTitle, tempChatSubject, tempChatExplanationLevel) VALUES (?, ?, ?)", (temp_chat_title, temp_chat_subject, temp_chat_level))
    connection.commit()
    connection.close()

    return {"success": True, "tempChatID": 1, "message": "Temporary chat created successfully."}

@app.post("/api/createchat")
def new_chat(data: dict = Body(...)):
    user_id = data["userID"]
    chat_title = data["chatTitle"]
    chat_subject = data["chatSubject"]
    chat_level = data["chatExplanationLevel"]

    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("INSERT INTO chatSession (userID, chatTitle, chatSubject, chatExplanationLevel) VALUES (?, ?, ?, ?)", (user_id, chat_title, chat_subject, chat_level))
    
    connection.commit()
    
    cursor.execute("SELECT chatSessionID FROM chatSession WHERE userID = ? ORDER BY chatCreateDate DESC LIMIT 1", (user_id,))
    
    chat_session_id = cursor.fetchone()[0]
    connection.close()

    return {"success": True, "message": "New chat session created successfully.", "chatSessionID": chat_session_id}


@app.post("/api/submitloggedprompt")
def submit_logged_prompt(data: dict = Body(...)):
    prompt = data["prompt"]
    chatSessionID = data["chatSessionID"]
    
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("INSERT INTO messages (chatSessionID, sender, messageContent) VALUES (?, ?, ?)", (chatSessionID, "User", prompt))
    connection.commit()
    connection.close()

    return {"success": True, "message": "Prompt submitted successfully."}


@app.post("/api/submitunloggedprompt")
def submit_unlogged_prompt(data: dict = Body(...)):
    prompt = data["prompt"]
    tempChatID = data["tempChatID"]
    
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("INSERT INTO messages (tempChatID, sender, messageContent) VALUES (?, ?, ?)", (tempChatID, "User", prompt))
    connection.commit()
    connection.close()

    return {"success": True, "message": "Prompt submitted successfully."}