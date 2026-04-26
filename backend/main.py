from fastapi import FastAPI, Body, UploadFile, File, Form, staticfiles
from fastapi.responses import FileResponse
from database import init_db, get_connection
from dotenv import load_dotenv
from aiservice import call_ai
import json

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
        return {"error": True, "message": "Invalid Email or Password. Please Try Again."}


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
    cursor.execute("SELECT userID FROM users WHERE email = ?", (email,))
    
    user_id = cursor.fetchone()[0]
    cursor.execute("INSERT INTO accountSettings (userID) VALUES (?)", (user_id,))
    
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
    # cursor.execute("DELETE FROM messages WHERE tempChatID IS NOT NULL")
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

    cursor.execute("SELECT chatSubject, chatExplanationLevel FROM chatSession WHERE chatSessionID = ?", (chatSessionID,))
    chat_info = cursor.fetchone()
    
    if chat_info is None:
        connection.close()
        return {"success": False, "message": "Chat session not found."}

    subject = chat_info[0]
    level = chat_info[1]
    
    cursor.execute("""
        SELECT as2.responseLength FROM accountSettings as2
        JOIN chatSession cs ON cs.userID = as2.userID
        WHERE cs.chatSessionID = ?
    """, (chatSessionID,))
    settings = cursor.fetchone()
    response_length = settings[0] if settings else "Medium"

    cursor.execute("SELECT filePath FROM uploadedDocuments WHERE chatSessionID = ?", (chatSessionID,))
    file = cursor.fetchone()

    if file:
        with open(file[0], "r") as f:
            document_context = f.read()
        full_prompt = f"""Use this document as context:\n{document_context}\n\nUser question: {prompt}"""
    else:
        full_prompt = prompt

    ai_response = call_ai(full_prompt, subject=subject, level=level, response_length=response_length)

    try:
        parsed = json.loads(ai_response)
        message_text = parsed.get("response", ai_response)
    except Exception:
        message_text = ai_response

    cursor.execute("INSERT INTO messages (chatSessionID, sender, messageContent) VALUES (?, ?, ?)", (chatSessionID, "User", prompt))
    cursor.execute("INSERT INTO messages (chatSessionID, sender, messageContent) VALUES (?, ?, ?)", (chatSessionID, "TutorGPT", message_text))
    connection.commit()
    connection.close()

    return {"success": True, "message": message_text}


@app.post("/api/submitunloggedprompt")
def submit_unlogged_prompt(data: dict = Body(...)):
    prompt = data["prompt"]
    tempChatID = data["tempChatID"]

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT tempChatSubject, tempChatExplanationLevel FROM tempChats WHERE tempChatID = ?", (tempChatID,))
    chat_info = cursor.fetchone()
    
    if chat_info is None:
        connection.close()
        return {"success": False, "message": "Chat session not found."}

    subject = chat_info[0]
    level = chat_info[1]

    ai_response = call_ai(prompt, subject=subject, level=level)

    try:
        parsed = json.loads(ai_response)
        message_text = parsed.get("response", ai_response)
    except Exception:
        message_text = ai_response

    cursor.execute("INSERT INTO messages (tempChatID, sender, messageContent) VALUES (?, ?, ?)", (tempChatID, "User", prompt))
    cursor.execute("INSERT INTO messages (tempChatID, sender, messageContent) VALUES (?, ?, ?)", (tempChatID, "TutorGPT", message_text))
    connection.commit()
    connection.close()

    return {"success": True, "message": message_text}

@app.post("/api/uploaddocument")
async def upload_document(file: UploadFile = File(...), chatSessionID: int = Form(...)):

    file_path = "uploads/" + str(chatSessionID) + "_" + file.filename

    contents = await file.read()
    text = contents.decode("utf-8")

    with open(file_path, "w") as f:
        f.write(text)

    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("INSERT INTO uploadedDocuments (chatSessionID, fileName, fileType, filePath, fileSize) VALUES (?, ?, ?, ?, ?)", (chatSessionID, file.filename, file.content_type, file_path, file.size))
    connection.commit()
    # cursor.execute("SELECT documentID FROM uploadedDocuments WHERE chatSessionID = ? ORDER BY uploadTime DESC LIMIT 1", (chatSessionID,))
    # document_id = cursor.fetchone()[0]
    connection.close()

    return {"success": True, "fileName": file.filename}

@app.get("/api/getdocument")
def get_documents(chatSessionID: int):
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT fileName, fileType, filePath FROM uploadedDocuments WHERE chatSessionID = ?", (chatSessionID,))
    documents = cursor.fetchall()
    connection.close()

    return {"documents": documents}


@app.get("/api/getfile")
def get_file(chatSessionID: int):
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT filePath, fileName FROM uploadedDocuments WHERE chatSessionID = ?", (chatSessionID,))
    file = cursor.fetchone()
    connection.close()

    if not file:
        return {"error": True, "message": "File not found."}

    return FileResponse(file[0], filename=file[1])

@app.post("/api/deleteaccount")
def delete_account(data: dict = Body(...)):
    userID = data["userID"]
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("DELETE FROM users WHERE userID = ?", (userID,))
    connection.commit()
    connection.close()
    
    return {"success": True, "message":"Account deleted"}

@app.post("/api/deletechat")
def delete_chat(data: dict = Body(...)):
    chatSessionID = data["chatSessionID"]
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("DELETE FROM chatSession WHERE chatSessionID = ?", (chatSessionID,))
    connection.commit()
    connection.close()
    return {"success": True}

@app.post("/api/deletetempchat")
def delete_temp_chat(data: dict = Body(...)):
    tempChatID = data["tempChatID"]
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("DELETE FROM tempChats WHERE tempChatID = ?", (tempChatID,))
    connection.commit()
    connection.close()
    return {"success": True}