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

################################
#                              #
#       REUSED FUNCTIONS       #
#                              #
################################

def parse_response(ai_response):
###############################################################################################################
#                                                                                                             #
#       This function changes the ai response from json to a python dictionary and gets the data inside       #
#                                                                                                             #
###############################################################################################################
    parsed = json.loads(ai_response) # this convert the ai response to python diction from json string
    message_text = parsed.get("response", ai_response) # this retrieves the parsed json response or just falls back to the ai_response if there is not response key 
    
    confidence = parsed.get("confidence", "") # get the parsed json confidence number but falls back to an empty string
    confidence_reason = parsed.get("confidence_reason", "")
    citations = parsed.get("citations", []) #gets the list of citations but falls back to an empty array 
    
    confidence_score = confidence.split("/")[0].strip()
    
    return {
        "message_text": message_text,
        "confidence": confidence_score,
        "confidence_reason": confidence_reason,
        "citations": citations
    }
    
def save_citations(cursor, citations, message_id, file=None, chatSessionID=None):
###############################################################################################################
#                                                                                                             #
#       This function saves the citations from the AI response into the database                              #
#       and links them to the message.                                                                        #
#                                                                                                             #
###############################################################################################################
    for c in citations: # for every citation in the array
        source = c["source"].strip().lower() # this makes the source (e.g external or uploaded document) to have no spaces behind or infront of the word and forces lowercase.

        if source == "external" or source == "external source": # check source type
            source = "External Source" # relabels to be consistent with the database

            cursor.execute("INSERT OR IGNORE INTO citations (citationSource, citationName, citationText, citationURL) VALUES (?, ?, ?, ?)", (source, c["name"], c["text"], c["url"])) # added or ignores this citation row to the database

            cursor.execute("SELECT citationID FROM citations WHERE citationURL = ? AND citationName = ?", (c["url"], c["name"]))

            citation = cursor.fetchone()

            if citation:
                citation_id = citation[0]  # get the citation id
                cursor.execute("INSERT OR IGNORE INTO messageCitations (messageID, citationID) VALUES (?, ?)", (message_id, citation_id))

        if file and (source == "document" or source == "uploaded document" or source == "uploaded"): # if this is a document citation
            cursor.execute("SELECT documentID FROM uploadedDocuments WHERE chatSessionID = ?", (chatSessionID,)) # gets the document associated to this chat session
            doc = cursor.fetchone()

            document_id = doc[0]
            cursor.execute("INSERT OR IGNORE INTO citations (documentID, citationSource, citationName, citationText, citationURL) VALUES (?, ?, ?, ?, ?)", (document_id, "Uploaded Document", file[1], "Referenced document", file[0]))

            cursor.execute("SELECT citationID FROM citations WHERE documentID = ?", (doc[0],))

            citation = cursor.fetchone()

            if citation:
                citation_id = citation[0]
                cursor.execute("INSERT OR IGNORE INTO messageCitations (messageID, citationID) VALUES (?, ?)", (message_id, citation_id))
    

########################################
#                                      #
#       ACCOUNT LOGIN AND SIGNUP       #
#                                      #
########################################

@app.post("/api/login")
def login(data: dict = Body(...)):
################################################################################################
#                                                                                              #
#       This function checks if the input matches the user's email and password stored         #
#                                                                                              #
################################################################################################

    email = data["email"].lower()
    password = data["password"]
    isTeacher = data["isTeacher"]

    connection = get_connection() # opens a connection to the database
    cursor = connection.cursor() # used to run SQL queries
    
    if isTeacher: 
        cursor.execute("SELECT teacherID, teacherPassword FROM teachers WHERE teacherEmail = ?", (email,))
    else:
        cursor.execute("SELECT userID, password FROM users WHERE email = ?", (email,))
    
    result = cursor.fetchone() # returns a single row
    connection.close() # closes database connection when it is no longer used

    if result is None: # checks if any result was return
        return {"success": False, "message": "Invalid Email or Password. Please Try Again."}

    stored_password = result[1] # get the hashed password

    if isinstance(stored_password, str): # checks if password stored in db is a string. THIS IS MAINLY FOR THE AUTOMATED TEST.
        stored_password = stored_password.encode("utf-8") # coverts string into bytes
        
    entered_password = password.encode("utf-8")
    
    # does a special comparison where it hashes the password with the same salt extracted from the stored password. 
    passwords_match_checker = bcrypt.checkpw(entered_password, stored_password)  

    
    if passwords_match_checker:
        
        if isTeacher:
            return {"success": True, "teacherID": result[0]}
        
        return {"success": True, "userID": result[0]}
    
    return {"success": False, "message": "Invalid Email or Password. Please Try Again."}

@app.post("/api/signup")
def signup(data: dict = Body(...)):
##################################################################################################################
#                                                                                                                #
#       This function creates a new row in the database when a signup is successful and return the user ID       #
#                                                                                                                #
##################################################################################################################
    username = data["username"]
    email = data["email"].lower() # forces all emails to be lowercase()
    password = data["password"]
    
    connection = get_connection()
    cursor = connection.cursor()
    
    hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()) # this hashes the password
    
    cursor.execute("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", (username, email, hashed_password))
    cursor.execute("SELECT userID FROM users WHERE email = ?", (email,))
    
    user = cursor.fetchone()
    user_id = user[0] # get the user ID
    
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

    hashed_password = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt()) # hashes the password

    connection = get_connection()
    cursor = connection.cursor()
    
    cursor.execute("UPDATE users SET password = ? WHERE email = ?", (hashed_password, email)) # updates the user passwords in the database
    
    connection.commit()
    connection.close()

    return {"success": True, "message": "Password reset successfully. Please log in with your new password."}

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
    
    used_result = cursor.fetchone()
    connection.close()

    if used_result: #if there is a result
        return {"exists": True}
    else:
        return {"exists": False}

@app.get("/api/userinfo")
def get_user(email: str, isTeacher: bool = False):
##########################################################################################
# #                                                                                       #
# #       This function gets if users ID and username from the database after login       #
# #                                                                                       #
# #########################################################################################
    email = email.lower()

    connection = get_connection()
    cursor = connection.cursor()

    if isTeacher:
        cursor.execute(
            "SELECT teacherID, teacherName FROM teachers WHERE teacherEmail = ?",
            (email,)
        )
        result = cursor.fetchone()
        connection.close()

        if result:
            return {"teacherID": result[0], "username": result[1]}
        else:
            return {"success": False, "message": "Teacher not found."}

    else:
        cursor.execute(
            "SELECT userID, username FROM users WHERE email = ?",  # fixed: was userEmail
            (email,)
        )
        result = cursor.fetchone()
        connection.close()

        if result:
            return {"userID": result[0], "username": result[1]}
        else:
            return {"success": False, "message": "User not found."}


###################
#                 #
#       CHAT      #
#                 #
###################
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
    
    chat = cursor.fetchone()
    chat_session_id = chat[0]
    connection.close()

    return {"success": True, "message": "New chat session created successfully.", "chatSessionID": chat_session_id}

@app.post("/api/createtempchat")
def create_temp_chat(data: dict = Body(...)):
#########################################################################
#                                                                       #
#       This function creates and/ or replace the temporary chats       #
#                                                                       #
#########################################################################
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

@app.get("/api/getchats")
def get_chats(user_id: int):
########################################################
#                                                      #
#       This function retrieve all chat sessions       #
#                                                      #
########################################################

    connection = get_connection()
    cursor = connection.cursor()
    
    cursor.execute("SELECT chatSessionID, chatTitle, chatCreateDate FROM chatSession WHERE userID = ? ORDER BY chatCreateDate DESC", (user_id,))
    
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
        return {"success": False, "message": "Chat session not found."}
    
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
        "SELECT tempChatTitle, tempChatSubject FROM tempChats WHERE tempChatSessionID = ?", (tempChatSessionID,)
        )
    
    chat = cursor.fetchone()
    connection.close()

    if chat is None: # checks if there is no temporary chat matching the tempChatSessionID
        return {"success": False, "message": "Temporary chat not found."}

    return {
        "tempChats": [(tempChatSessionID, chat[0])],
        "tempChatTitle": chat[0],
        "tempChatSubject": chat[1]
    }
    
@app.post("/api/deletechat")
def delete_chat(data: dict = Body(...)):
################################################################################
#                                                                              #
#       This function deletes logged in user's chat sessions from database     #
#                                                                              #
################################################################################

    chatSessionID = data["chatSessionID"]
    
    connection = get_connection()
    cursor = connection.cursor()
    
    cursor.execute("DELETE FROM chatSession WHERE chatSessionID = ?", (chatSessionID,))
    
    connection.commit()
    connection.close()
    
    return {"success": True}

@app.post("/api/deletetempchat")
def delete_temp_chat(data: dict = Body(...)):
#########################################################################
#                                                                       #
#       This function deletes temporary chat sessions from database     #
#                                                                       #
#########################################################################
    tempChatSessionID = data["tempChatSessionID"]
    
    connection = get_connection()
    cursor = connection.cursor()
    
    cursor.execute("DELETE FROM tempChats WHERE tempChatSessionID = ?", (tempChatSessionID,))
    
    connection.commit()
    connection.close()
    
    return {"success": True}

##################################
#                                #
#       MESSAGE AND PROMPTS      #
#                                #
##################################

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
        return {"success": False, "message": "No chat session or temporary chat specified."}
    
    messages = cursor.fetchall()
    connection.close()

    return {"messages": messages}

@app.post("/api/submitloggedprompt")
def submit_logged_prompt(data: dict = Body(...)):
#######################################################################################
#                                                                                     #
#       This calls and sends the prompt to the AI. Then it parses the response        #
#       and saves into the database. This is for logged users                         #
#                                                                                     #
#######################################################################################
    prompt = data["prompt"] # user prompt
    chatSessionID = data["chatSessionID"] # chat session ID for the logged-in users to know where the messages are saved for which session in the database.
    response_length = data["responseLength"] 
    confidence = ""
    confidence_reason = ""
    citations = []


    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute("SELECT chatSubject, chatExplanationLevel FROM chatSession WHERE chatSessionID = ?", (chatSessionID,))
    
    chat_info = cursor.fetchone() # this only gets one row of data back.
    
    if chat_info is None: # this check if any chat information with the chat session ID was found or not.
        connection.close()
        return {"success": False, "message": "Chat session not found."}

    subject = chat_info[0] # type of subject (e.g mathematics, computer science)
    level = chat_info[1] # level of the subject (e.g beginner, expert, advanced)

    cursor.execute("SELECT filePath, fileName FROM uploadedDocuments WHERE chatSessionID = ?", (chatSessionID,)) # this gets any uploaded documents
    file = cursor.fetchone() 

    if file: # if there is a document, it reads the content
        with open(file[0], "r") as f:
            document_context = f.read()
            
        full_prompt = f"""
        Use this document as context (document name: {file[1]}): {document_context}
        User question:{prompt}, and cite 1 or more relevant source [Remember: never give me a complete answers].
        """ # this creates the user prompt and puts the documents content in that prompt too
    else:
        full_prompt = f"{prompt} , and cite 1 or more relevant sources [Remember: never give me a complete answers]." 

    ai_response = call_ai(full_prompt, subject=subject, level=level, response_length=response_length) # calls the ai service and gives the settings to format the system prompt
    
    if ai_response == "The AI is currently unavailable. Please try again in a moment.":
        connection.close()
        return {"success": False, "message": "The AI is currently unavailable. Please try again in a moment."}
    
    try:
        response = parse_response(ai_response)
        
        message_text = response["message_text"]
        confidence_score = response["confidence"]
        confidence_reason = response["confidence_reason"]
        citations = response["citations"]

    except Exception as e: # this catches any errors and prevents it being stored into the database
        print(f"[JSON PARSE ERROR]: {e}") # shows the error message
        return {"success": False, "message": "Failed to parse AI response"}

    cursor.execute("INSERT INTO messages (chatSessionID, sender, messageContent) VALUES (?, ?, ?)", (chatSessionID, "User", prompt)) # adds users prompt into messages table
    
    cursor.execute("INSERT INTO messages (chatSessionID, sender, messageContent, messageConfidence, messageConfidenceReason) VALUES (?, ?, ?, ?, ?)", 
    (chatSessionID, "TutorGPT", message_text, confidence_score, confidence_reason)) # adds ai response to message table

    cursor.execute("SELECT messageID FROM messages WHERE chatSessionID = ? AND sender = 'TutorGPT' ORDER BY messageTime DESC LIMIT 1", (chatSessionID,)) 
    
    message = cursor.fetchone()
    
    message_id = message[0]
    
    print("citations", citations)
    
    save_citations(cursor, citations, message_id, file=file, chatSessionID=chatSessionID)

    connection.commit()
    connection.close()

    return {"success": True, "message": message_text, "confidence": confidence_score, "messageID": message_id}

@app.post("/api/submitunloggedprompt")
def submit_unlogged_prompt(data: dict = Body(...)):
#######################################################################################
#                                                                                     #
#       This calls and sends the prompt to the AI. Then it parses the response        #
#       and saves into the database for unlogged in users                             #
#                                                                                     #
#######################################################################################
    prompt = data["prompt"]
    tempChatSessionID = data["tempChatSessionID"]
    response_length = data["responseLength"]
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

    ai_response = call_ai(full_prompt, subject=subject, level=level, response_length=response_length)
    
    if ai_response == "The AI is currently unavailable. Please try again in a moment.":
        connection.close()
        return {"success": False, "message": "The AI is currently unavailable. Please try again in a moment."}
    
    try:
        response = parse_response(ai_response)

        message_text = response["message_text"]
        confidence_score = response["confidence"]
        confidence_reason = response["confidence_reason"]
        citations = response["citations"]

    except Exception as e: # this catches any errors and prevents it being stored into the database
        print(f"[JSON PARSE ERROR]: {e}") # shows the error message
        return {"success": False, "message": "Failed to parse AI response"}  

    cursor.execute("INSERT INTO messages (tempChatSessionID, sender, messageContent) VALUES (?, ?, ?)", (tempChatSessionID, "User", prompt))

    cursor.execute("INSERT INTO messages (tempChatSessionID, sender, messageContent, messageConfidence, messageConfidenceReason) VALUES (?, ?, ?, ?, ?)", 
    (tempChatSessionID, "TutorGPT", message_text, confidence_score, confidence_reason))

    cursor.execute("SELECT messageID FROM messages WHERE tempChatSessionID = ? AND sender = 'TutorGPT' ORDER BY messageTime DESC LIMIT 1", (tempChatSessionID,))
    
    message = cursor.fetchone()
    message_id = message[0]
    
    print("citations", citations)
    
    save_citations(cursor, citations, message_id, file=None, chatSessionID=None)
            
    connection.commit()
    connection.close()

    return {"success": True, "message": message_text, "confidence": confidence, "messageID": message_id}

#######################
#                     #
#       DOCUMENTS     #
#                     #
#######################

@app.post("/api/uploaddocument")
async def upload_document(file: UploadFile = File(...), chatSessionID: int = Form(...)):
#######################################################################################
#                                                                                     #
#       This function saves any uploaded document into the database                   #
#                                                                                     #
#######################################################################################

    file_path = "uploads/" + str(chatSessionID) + "_" + file.filename #this prevents clashing document names

    contents = await file.read() # waits for the file to finish uploading and reads the content
    text = contents.decode("utf-8") # converts the contents from bytes to string

    with open(file_path, "w") as f: # this opens a new file with the file path name created earlier 
        f.write(text) # copy the contents from the uploaded file into the new file

    connection = get_connection()
    cursor = connection.cursor()
    
    cursor.execute("INSERT INTO uploadedDocuments (chatSessionID, fileName, fileType, filePath, fileSize) VALUES (?, ?, ?, ?, ?)", (chatSessionID, file.filename, file.content_type, file_path, file.size))
    
    connection.commit()
    connection.close()

    return {"success": True, "fileName": file.filename}

@app.get("/api/getdocument")
def get_documents(chatSessionID: int):
######################################################################################################
#                                                                                                    #
#       This function gets the metadata of the uploaded document from the database                   #
#                                                                                                    #
######################################################################################################
    connection = get_connection()
    cursor = connection.cursor()
    
    cursor.execute("SELECT fileName, fileType, filePath FROM uploadedDocuments WHERE chatSessionID = ?", (chatSessionID,))
    
    document = cursor.fetchone() # only one file per chat session
    connection.close()

    return {"document": document}

@app.get("/api/getfile")
def get_file(chatSessionID: int):
########################################################################
#                                                                      #
#       This function gets a downloadable file from the database       #
#                                                                      #
########################################################################
    connection = get_connection()
    cursor = connection.cursor()
    
    cursor.execute("SELECT filePath, fileName FROM uploadedDocuments WHERE chatSessionID = ?", (chatSessionID,))
    
    file = cursor.fetchone()
    connection.close()

    if file is None:
        return {"success": False, "message": "File not found."}
    
    filepath = file[0]
    filename = file[1]

    return FileResponse(filepath, filename=filename) # return actual file that is downloadable

########################
#                      #
#       CITATIONS      #
#                      #
########################

@app.get("/api/getcitations")
def get_citations(messageID: int):
###################################################################################################
#                                                                                                 #
#       This function gets all the citation associated to the ai response from the database       #
#                                                                                                 #
###################################################################################################
    connection = get_connection()
    cursor = connection.cursor()
    
    cursor.execute("""
        SELECT citationName, citationText, citationSource, citationURL 
        FROM citations
        JOIN messageCitations ON messageCitations.citationID = citations.citationID 
        WHERE messageCitations.messageID = ?
    """, (messageID,))
    
    citations = cursor.fetchall()
    connection.close()
    
    return {"citations": citations} 

#######################
#                     #
#       SETTINGS      #
#                     #
#######################
    
@app.get("/api/userSettings")
def get_user_settings(user_id: int):
####################################################
#                                                  #
#       This function gets the user settings       #
#                                                  #
####################################################
    connection = get_connection()
    cursor = connection.cursor()
    
    cursor.execute("SELECT responseLength, displayMode, displayTextSize, displayFontStyle FROM accountSettings WHERE userID = ?", (user_id,))
    
    settings = cursor.fetchone()
    
    connection.close()
    
    if settings is None:
        return {"success": False, "message": "Settings not found."}
    
    responseLength = settings[0] 
    displayMode = settings[1]
    displayTextSize = settings[2] 
    displayFontStyle = settings[3]  

    return {"settings": {"responseLength": responseLength, "displayMode": displayMode, "displayTextSize": displayTextSize, "displayFontStyle": displayFontStyle}}

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

@app.post("/api/deleteaccount")
def delete_account(data: dict = Body(...)):
#################################################################################################
#                                                                                               #
#       This function deletes the user account and all the data associated to the account       #
#                                                                                               #
#################################################################################################
    userID = data["userID"]
    
    connection = get_connection()
    cursor = connection.cursor()
    
    cursor.execute("DELETE FROM users WHERE userID = ?", (userID,))
    
    connection.commit()
    connection.close()
    
    return {"success": True, "message":"Account deleted"}





################################
#                              #
#       TEACHER ENDPOINTS      #
#                              #
################################

@app.get("/api/userinfo")
def get_user(email: str, isTeacher: bool = False):
#########################################################################################
#                                                                                       #
#       This function gets the user's/teacher's ID and username from the database       #
#       after login. isTeacher flag determines which table to query.                    #
#                                                                                       #
#########################################################################################
    email = email.lower()

    connection = get_connection()
    cursor = connection.cursor()

    if isTeacher:
        cursor.execute(
            "SELECT teacherID, teacherName FROM teachers WHERE teacherEmail = ?",
            (email,)
        )
        result = cursor.fetchone()
        connection.close()

        if result:
            return {"teacherID": result[0], "username": result[1]}
        else:
            return {"success": False, "message": "Teacher not found."}

    else:
        cursor.execute(
            "SELECT userID, username FROM users WHERE email = ?",
            (email,)
        )
        result = cursor.fetchone()
        connection.close()

        if result:
            return {"userID": result[0], "username": result[1]}
        else:
            return {"success": False, "message": "User not found."}



# Replace the /api/searchusers endpoint in main.py (currently around line 797)

@app.get("/api/searchusers")
def search_users(query: str, teacher_id: int):
###############################################################################
#                                                                             #
#       This function searches for students that belong to the same           #
#       institution as the logged-in teacher. Results are filtered            #
#       by username or email matching the search query.                       #
#                                                                             #
###############################################################################
    connection = get_connection()
    cursor = connection.cursor()

    # First get the teacher's institutionID
    cursor.execute(
        "SELECT institutionID FROM teachers WHERE teacherID = ?",
        (teacher_id,)
    )
    teacher = cursor.fetchone()

    if teacher is None:
        connection.close()
        return {"success": False, "message": "Teacher not found.", "users": []}

    institution_id = teacher[0]

    # Search users in the same institution by username or email
    # Fixed: column is 'email' not 'userEmail'
    like_query = f"%{query}%"
    cursor.execute(
        """
        SELECT userID, username, email
        FROM users
        WHERE institutionID = ?
          AND (username LIKE ? OR email LIKE ?)
        ORDER BY username ASC
        """,
        (institution_id, like_query, like_query)
    )

    users = cursor.fetchall()
    connection.close()

    return {"users": users}
