import { useState, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import remarkBreaks from "remark-breaks";
import ChatPromptBar from "../components/ChatPromptBar"
import Citations  from "../components/Citations"
import ConfidenceFlag from "../components/ConfidenceFlag"


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
        const res = await fetch(`/api/retrievetempchatinfo?tempChatSessionID=${localStorage.getItem("tempChatSessionID")}`, {
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
    const chatID = localStorage.getItem("chatSessionID")
    const res = await fetch(`/api/getdocument?chatSessionID=${chatID}`)
    const data = await res.json()
    setUploadedDoc(data.documents[0] || null) 
}

async function fetchCitations(messageID, setSelectedCitations) {
    console.log("fetchCitations called with messageID:", messageID)
    const res = await fetch(`/api/getcitations?messageID=${messageID}`)
    const data = await res.json()
    console.log("citations data:", data)
    setSelectedCitations(data.citations || [])
}

function NewChat() {
    const [chatTitle, setChatTitle] = useState("")
    const [messages, setMessage] = useState([])
    const [uploadedDoc, setUploadedDoc] = useState(null)
    const [selectedCitations, setSelectedCitations] = useState([])

    useEffect(() => {
        fetchChatInfo(setChatTitle)
        fetchDocuments(setUploadedDoc)
    }, [])

    let messagesList = [];
    if (messages.length > 0) {
        for (let i = 0; i < messages.length; i++) {
            messagesList.push(
            <div key={i} className={messages[i][1] === "User" ? "message-user" : "message-ai"}> 
                <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                    {String(messages[i][2] || "")}
                </ReactMarkdown>

                {messages[i][1] === "TutorGPT" && (
                    <ConfidenceFlag confidence={messages[i][3]} />
                )}

                {messages[i][1] === "TutorGPT" && (
                    <button onClick={() => fetchCitations(messages[i][0], setSelectedCitations)}>Show Sources</button> 
                )}
            </div>
            );
        }
    }

    if (uploadedDoc) {
        return (
            <div className="new-chat-container">
                <Citations citations={selectedCitations}/>
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
            <Citations citations={selectedCitations} />
            <h2>{chatTitle}</h2>
            {messagesList}
            <ChatPromptBar messages={messages} setMessage={setMessage} />
        </div>
            )
}
export default NewChat