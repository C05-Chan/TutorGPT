from fastapi import FastAPI
from pydantic import BaseModel
from database import init_db, get_connection

app = FastAPI()

init_db()

# @app.post("/api/message")
# def save_message(data: MessageRequest):
#     conn = get_connection()
#     cursor = conn.cursor()

#     cursor.execute(
#         "INSERT INTO messages (content) VALUES (?)",
#         (data.content,)
#     )

#     conn.commit()
#     conn.close()

#     return {"message": "saved"}

# @app.get("/api/messages")
# def get_messages():
#     conn = get_connection()
#     cursor = conn.cursor()

#     cursor.execute("SELECT * FROM messages")
#     rows = cursor.fetchall()

#     conn.close()

#     return [
#         {"id": row[0], "content": row[1]}
#         for row in rows
#     ]