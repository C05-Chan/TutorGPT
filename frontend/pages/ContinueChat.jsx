import { useState, useEffect } from "react"
import ChatPromptBar from "../components/ChatPromptBar"
import Citations from "../components/Citations"

async function fetchMessages(setMessages) {
    if (localStorage.getItem("userID")) {
        const res = await fetch(`/api/retrievemessages?chatSessionID=${localStorage.getItem("chatSessionID")}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })
        const data = await res.json()
        setMessages(data.messages || [])
    } else {
        const res = await fetch(`/api/retrievemessages?tempChatID=${localStorage.getItem("tempChatID")}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })
        const data = await res.json()
        setMessages(data.messages || [])
    }
}

async function fetchChatInfo(setChatTitle) {
    if (localStorage.getItem("userID")) {
        const res = await fetch(`/api/retrievechatinfo?chatSessionID=${localStorage.getItem("chatSessionID")}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })

        const data = await res.json()
        setChatTitle(data.chatTitle)
        console.log(data)
        return data
    } else {
        const res = await fetch(`/api/retrievetempchatinfo?tempChatID=${localStorage.getItem("tempChatID")}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })

    
        const data = await res.json()
        setChatTitle(data.tempChatTitle)
        console.log(data)
        return data
    }
}


async function fetchDocuments(setUploadedDoc) {
    if (!localStorage.getItem("userID")) return
    const chatID = localStorage.getItem("chatSessionID")
    const res = await fetch(`/api/getdocument?chatSessionID=${chatID}`)
    const data = await res.json()
    setUploadedDoc(data.documents[0] || null) 
}

function ContinueChat() {
    const [chatTitle, setChatTitle] = useState("")
    const [messages, setMessage] = useState([])
    const [uploadedDoc, setUploadedDoc] = useState(null)

    useEffect(() => {
        fetchChatInfo(setChatTitle)
        fetchMessages(setMessage)
        fetchDocuments(setUploadedDoc)

    }, [])

    let messagesList = [];
    if (messages.length > 0) {
        for (let i = 0; i < messages.length; i++) {
            messagesList.push(
                <div key={i} className={messages[i][1] === "User" ? "message-user" : "message-ai"}>
                    <p>{messages[i][1]}</p>
                </div>
            );
        }
    }

    if (uploadedDoc) {
        return (
            <div className="new-chat-container">
                <Citations></Citations>
                <h2>{chatTitle}</h2>
                <p>Refers to this document: <a href={`/api/getfile?chatSessionID=${localStorage.getItem("chatSessionID")}`} download>
    {uploadedDoc[0]} </a> </p>
                {messagesList}
                <ChatPromptBar messages={messages} setMessage={setMessage} />
            </div>
        )
    }
    return (
                <div className="new-chat-container">
                    <Citations></Citations>
                    <h2>{chatTitle}</h2>
                    {messagesList}
                    <ChatPromptBar messages={messages} setMessage={setMessage} />
                </div>
            )
    }

export default ContinueChat