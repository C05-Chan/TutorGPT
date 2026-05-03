#########################################################################
#                                                                       #
#       This file acts as the backend server for the application        #
#           - Uses FastAPI                                              #
#           - Connects frontend and database                            #
#           - Calls the AI services                                     #
#                                                                       #
#########################################################################

import bcrypt
import json
from fastapi import FastAPI, Body, UploadFile, File, Form
from fastapi.responses import FileResponse
from database import init_db, get_connection
from dotenv import load_dotenv
from aiservice import call_ai

load_dotenv("API.env")

app = FastAPI()

init_db()

@app.post("/api/login")
def login(email: str = Body(...), password: str = Body(...)):
################################################################################################
#                                                                                              #
#       This function checks if the input matches the user's email and password stored         #
#                                                                                              #
################################################################################################

    connection = get_connection() # opens a connection to the database
    cursor = connection.cursor() # used to run SQL queries
    
    cursor.execute("SELECT userID, password FROM users WHERE email = ?", (email,))
    
    result = cursor.fetchone() # returns a single row
    connection.close() # closes database connection when it is no longer used

    if result is None: # checks if any result was return
        return {"error": True, "message": "Invalid Email or Password. Please Try Again."}

    stored_password = result[1] # get the hashed password

    if isinstance(stored_password, str):
        stored_password = stored_password.encode("utf-8")
    if bcrypt.checkpw(password.encode("utf-8"), stored_password): # this decrypts the password 
        return {"success": True, "userID": result[0]} # if the decrypted password matches the input then it is a success
    
    return {"error": True, "message": "Invalid Email or Password. Please Try Again."}

@app.get("/api/emailcheck")
def email_check(email: str):
#############################################################################################
#                                                                                           #
#       This function checks if the email is already in the database for the signup         #
#                                                                                           #
#############################################################################################
    email = email.lower() # converts all emails to be all lower case

    connection = get_connection()
    cursor = connection.cursor()
    
    cursor.execute("SELECT email FROM users WHERE email = ?", (email,))
    
    result = cursor.fetchone()
    connection.close()

    if result: #if there is a result
        return {"exists": True}
    else:
        return {"exists": False}

@app.get("/api/userinfo")
def get_user(email: str):
#########################################################################################
#                                                                                       #
#       This function gets if users ID and username from the database after login       #
#                                                                                       #
#########################################################################################
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
##################################################################################################################
#                                                                                                                #
#       This function creates a new row in the database when a signup is successful and return the user ID       #
#                                                                                                                #
##################################################################################################################
    username = data["username"]
    email = data["email"].lower()
    password = data["password"]
    
    connection = get_connection()
    cursor = connection.cursor()
    
    hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()) # this hashes the password
    
    cursor.execute("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", (username, email, hashed_password))
    cursor.execute("SELECT userID FROM users WHERE email = ?", (email,))
    
    user_id = cursor.fetchone()[0] # get the user ID
    cursor.execute("INSERT INTO accountSettings (userID) VALUES (?)", (user_id,)) # creates default settings for a new user
    
    connection.commit()
    connection.close()
    
    return {"success": True, "message": "Account created successfully. Please log in."}

@app.post("/api/resetpassword")
def reset_password(data: dict = Body(...)):
#####################################################################################################
#                                                                                                   #
#       This function updates the password for the user when they want to change the password       #
#                                                                                                   #
#####################################################################################################
    new_password = data["password"]
    email = data["email"].lower()

    hashed_password = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt())

    connection = get_connection()
    cursor = connection.cursor()
    
    cursor.execute("UPDATE users SET password = ? WHERE email = ?", (hashed_password, email)) # updates the user passwords in the database
    
    connection.commit()
    connection.close()

    return {"success": True, "message": "Password reset successfully. Please log in with your new password."}

@app.get("/api/getchats")
def get_chats(user_id: int):
########################################################
#                                                      #
#       This function retrieve the chat sessions       #
#                                                      #
########################################################

    connection = get_connection()
    cursor = connection.cursor()
    
    cursor.execute("SELECT chatSessionID, chatTitle FROM chatSession WHERE userID = ?", (user_id,))
    
    chats = cursor.fetchall()
    connection.close()

    return {"chats": chats}

@app.get("/api/getchatinfo")
def get_chat_info(chatSessionID: int):
###########################################################################
#                                                                         #
#       This function retrieve the chat sessions' title and subject       #
#                                                                         #
###########################################################################
    connection = get_connection()
    cursor = connection.cursor()
    
    cursor.execute("SELECT chatTitle, chatSubject FROM chatSession WHERE chatSessionID = ?", (chatSessionID,))
    
    chat_info = cursor.fetchone()
    connection.close()

    if chat_info: # checks if there is a chat matching the chatSessionID
        return {"chatTitle": chat_info[0], "chatSubject": chat_info[1]}
    else:
        return {"error": True, "message": "Chat session not found."}
    
@app.get("/api/gettempchatinfo")
def get_temp_chat_info(tempChatSessionID: int):
#####################################################################################
#                                                                                   #
#       This function retrieve the temporary chat sessions' title and subject       #
#                                                                                   #
#####################################################################################

    connection = get_connection()
    cursor = connection.cursor()
    
    cursor.execute(
        "SELECT tempChatSessionID, tempChatTitle, tempChatSubject FROM tempChats WHERE tempChatSessionID = ?", (tempChatSessionID,)
        )
    
    chat = cursor.fetchone()
    connection.close()

    if chat is None:
        return {"error": True, "message": "Temporary chat not found."}

    return {
        "tempChats": [(chat[0], chat[1])],
        "tempChatTitle": chat[1],
        "tempChatSubject": chat[2]
    }
    
@app.get("/api/getmessages")
def get_messages(chatSessionID: int = None, tempChatSessionID: int = None):
############################################################################################
#                                                                                          #
#       This function retrieve the temporary chat and normal chat sessions' messages       #
#                                                                                          #
############################################################################################
    connection = get_connection()
    cursor = connection.cursor()
    
    if chatSessionID: # checks if its chatSessionID for logged in users
        cursor.execute("SELECT messageID, sender, messageContent, messageConfidence FROM messages WHERE chatSessionID = ?", (chatSessionID,))
    elif tempChatSessionID: #checks if its tempChatSessionID for not logged in users
        cursor.execute("SELECT messageID, sender, messageContent, messageConfidence FROM messages WHERE tempChatSessionID = ?", (tempChatSessionID,))
    else:
        return {"error": True, "message": "No chat session or temporary chat specified."}
    
    messages = cursor.fetchall()
    connection.close()

    return {"messages": messages}

@app.get("/api/userSettings")
def get_user_settings(user_id: int):
########################################################
#                                                      #
#       This function retrieve the user settings       #
#                                                      #
########################################################
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
######################################################
#                                                    #
#       This function update the user settings       #
#                                                    #
######################################################
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
##################################################################
#                                                                #
#       This function creates/ replace the temporary chats       #
#                                                                #
##################################################################
    temp_chat_title = data["tempChatTitle"]
    temp_chat_subject = data["tempChatSubject"]
    temp_chat_level = data["tempChatExplanationLevel"]

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("DELETE FROM tempChats") 
    cursor.execute("INSERT INTO tempChats (tempChatTitle, tempChatSubject, tempChatExplanationLevel) VALUES (?, ?, ?)", (temp_chat_title, temp_chat_subject, temp_chat_level))
    
    connection.commit()
    connection.close()

    return {"success": True, "tempChatSessionID": 1, "message": "Temporary chat created successfully."}

@app.post("/api/createchat")
def new_chat(data: dict = Body(...)):
####################################################################
#                                                                  #
#       This function creates a new chat for logged in users       #
#                                                                  #
####################################################################
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
#######################################################################################
#                                                                                     #
#       This calls and sends the prompt to the AI. Then it parses the response.       #
#                                                                                     #
#######################################################################################
    prompt = data["prompt"]
    chatSessionID = data["chatSessionID"]
    confidence = ""
    confidence_reason = ""
    citations = []


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
        SELECT as.responseLength FROM accountSettings as
        JOIN chatSession cs ON cs.userID = as.userID
        WHERE cs.chatSessionID = ?
    """, (chatSessionID,))
    
    settings = cursor.fetchone()
    response_length = settings[0] if settings else "Medium"

    cursor.execute("SELECT filePath, fileName FROM uploadedDocuments WHERE chatSessionID = ?", (chatSessionID,))
    file = cursor.fetchone()

    if file:
        with open(file[0], "r") as f:
            document_context = f.read()
            
        full_prompt = f"""Use this document as context (document name: {file[1]}):
        {document_context}

        User question:{prompt}, and cite 1 or more relevant source [Remember: never give complete answers]."""
    else:
        full_prompt = f"{prompt} , and cite 1 or more relevant sources [Remember: never give complete answers]."

    ai_response = call_ai(full_prompt, subject=subject, level=level, response_length=response_length)

    try:
        parsed = json.loads(ai_response)

        message_text = parsed.get("response", ai_response)
        
        confidence = parsed.get("confidence", "")
        confidence_reason = parsed.get("confidence_reason", "")
        
        citations = parsed.get("citations", [])
        
    except Exception as e:
        print(f"[JSON PARSE ERROR]: {e}")
        message_text = ai_response

    cursor.execute("INSERT INTO messages (chatSessionID, sender, messageContent) VALUES (?, ?, ?)", (chatSessionID, "User", prompt))
    cursor.execute("INSERT INTO messages (chatSessionID, sender, messageContent, messageConfidence, messageConfidenceReason) VALUES (?, ?, ?, ?, ?)", 
    (chatSessionID, "TutorGPT", message_text, confidence, confidence_reason))

    cursor.execute("SELECT messageID FROM messages WHERE chatSessionID = ? AND sender = 'TutorGPT' ORDER BY messageTime DESC LIMIT 1", (chatSessionID,))
    message_id = cursor.fetchone()[0]
    
    print("citations", citations)
    for c in citations:
        
        source = c["source"].strip().lower()
        if source == "external" or source == "external source":
            source = "External Source"
        elif source == "document" or source == "uploaded document" or source == 'uploaded':
            continue
            
        cursor.execute("INSERT OR IGNORE INTO citations (citationSource, citationName, citationText, citationURL) VALUES (?, ?, ?, ?)",
            (source, c["name"], c["text"], c["url"]))
        cursor.execute("SELECT citationID FROM citations WHERE citationURL = ? AND citationName = ?", (c["url"], c["name"]))
        result = cursor.fetchone()
        
        if result is None:
            continue
        
        citation_id = result[0]
        cursor.execute("INSERT OR IGNORE INTO messageCitations (messageID, citationID) VALUES (?, ?)", (message_id, citation_id))
        
        
    if file:
        cursor.execute("SELECT documentID FROM uploadedDocuments WHERE chatSessionID = ?", (chatSessionID,))
        doc = cursor.fetchone()
        if doc:
            cursor.execute("INSERT OR IGNORE INTO citations (documentID, citationSource, citationName, citationText, citationURL) VALUES (?, ?, ?, ?, ?)",
    (doc[0], "Uploaded Document", file[1], "Referenced document", file[0]))
            cursor.execute("SELECT citationID FROM citations WHERE documentID = ?", (doc[0],))
            citation_id = cursor.fetchone()[0]
            cursor.execute("INSERT OR IGNORE INTO messageCitations (messageID, citationID) VALUES (?, ?)", (message_id, citation_id))

    connection.commit()
    connection.close()

    return {"success": True, "message": message_text, "confidence": confidence, "messageID": message_id}


@app.post("/api/submitunloggedprompt")
def submit_unlogged_prompt(data: dict = Body(...)):
    prompt = data["prompt"]
    tempChatSessionID = data["tempChatSessionID"]
    confidence = ""
    confidence_reason = ""
    citations = []

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT tempChatSubject, tempChatExplanationLevel FROM tempChats WHERE tempChatSessionID = ?", (tempChatSessionID,))
    chat_info = cursor.fetchone()
    
    if chat_info is None:
        connection.close()
        return {"success": False, "message": "Chat session not found."}

    subject = chat_info[0]
    level = chat_info[1]
    
    full_prompt = f"{prompt}, and cite at least 1 source."

    ai_response = call_ai(full_prompt, subject=subject, level=level)

    try:
        parsed = json.loads(ai_response)
        message_text = parsed.get("response", ai_response)
        confidence = parsed.get("confidence", "")
        confidence_reason = parsed.get("confidence_reason", "")
        citations = parsed.get("citations", [])
    except Exception as e:
        print(f"[JSON PARSE ERROR]: {e}")
        message_text = ai_response

    cursor.execute("INSERT INTO messages (tempChatSessionID, sender, messageContent) VALUES (?, ?, ?)", (tempChatSessionID, "User", prompt))
    cursor.execute("INSERT INTO messages (tempChatSessionID, sender, messageContent, messageConfidence, messageConfidenceReason) VALUES (?, ?, ?, ?, ?)", 
    (tempChatSessionID, "TutorGPT", message_text, confidence, confidence_reason))

    cursor.execute("SELECT messageID FROM messages WHERE tempChatSessionID = ? AND sender = 'TutorGPT' ORDER BY messageTime DESC LIMIT 1", (tempChatSessionID,))
    message_id = cursor.fetchone()[0]
    
        
    print("citations", citations)
    
    for c in citations:
        
        source = c["source"].strip().lower()
        if source == "external" or source == "external source":
            source = "External Source"
            
        cursor.execute("INSERT OR IGNORE INTO citations (citationSource, citationName, citationText, citationURL) VALUES (?, ?, ?, ?)",
            (source, c["name"], c["text"], c["url"]))
        cursor.execute("SELECT citationID FROM citations WHERE citationURL = ? AND citationName = ?", (c["url"], c["name"]))
        result = cursor.fetchone()
        
        if result is None:
            continue
        
        citation_id = result[0]
        cursor.execute("INSERT OR IGNORE INTO messageCitations (messageID, citationID) VALUES (?, ?)", (message_id, citation_id))
        
    connection.commit()
    connection.close()

    return {"success": True, "message": message_text, "confidence": confidence, "messageID": message_id}

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
    tempChatSessionID = data["tempChatSessionID"]
    connection = get_connection()
    cursor = connection.cursor()
    cursor.execute("DELETE FROM tempChats WHERE tempChatSessionID = ?", (tempChatSessionID,))
    connection.commit()
    connection.close()
    return {"success": True}

@app.get("/api/getcitations")
def get_citations(messageID: int):
    connection = get_connection()
    cursor = connection.cursor()
    
    cursor.execute("SELECT c.citationName, c.citationText, c.citationSource, c.citationURL FROM citations c JOIN messageCitations mc ON mc.citationID = c.citationID WHERE mc.messageID = ?", (messageID,))
    
    citations = cursor.fetchall()
    connection.close()
    
    return {"citations": citations}