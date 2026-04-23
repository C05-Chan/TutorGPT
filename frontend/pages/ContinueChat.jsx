import { useState, useEffect } from "react"
import ChatPromptBar from "../components/ChatPromptBar"

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


function ContinueChat() {
    const [chatTitle, setChatTitle] = useState("")
    const [messages, setMessage] = useState([])

    useEffect(() => {
        fetchChatInfo(setChatTitle)
        fetchMessages(setMessage)

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

    return (
        <div className="continued-chat-container">
            <h2>{chatTitle}</h2>
            {messagesList}
            
            <ChatPromptBar messages={messages} setMessage={setMessage} />
        </div>
    )
}

export default ContinueChat