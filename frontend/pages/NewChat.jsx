import { useState, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import remarkBreaks from "remark-breaks";
import ChatPromptBar from "../components/ChatPromptBar"
import Citations  from "../components/Citations"
import ConfidenceFlag from "../components/ConfidenceFlag"


async function fetchChatInfo(setChatTitle) {
    if (localStorage.getItem("userID")) {
        const res = await fetch(`/api/getchatinfo?chatSessionID=${localStorage.getItem("chatSessionID")}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })

        const data = await res.json()
        setChatTitle(data.chatTitle)
        console.log(data)
        return data
    } else {
        const res = await fetch(`/api/gettempchatinfo?tempChatSessionID=${localStorage.getItem("tempChatSessionID")}`, {
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
    const res = await fetch(`/api/getcitations?messageID=${messageID}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })
    const data = await res.json()

    if (!data.citations || data.citations.length === 0) {
        setSelectedCitations(["empty"])  // special flag
    } else {
        setSelectedCitations(data.citations)
    }
    console.log("citations data:", data)
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

    const pairs = []
    for (let i = 0; i < messages.length; i += 2) {
        pairs.push([messages[i], messages[i + 1]])
    }
    
    pairs.reverse()

    let messagesList = []
    for (let i = 0; i < pairs.length; i++) {
        const userMsg = pairs[i][0]
        const aiMsg = pairs[i][1]

        if (userMsg) {
            messagesList.push(
                <div key={`user-${i}`} className="message-user">
                    <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                        {String(userMsg[2] || "")}
                    </ReactMarkdown>
                </div>
            )
        }

        if (aiMsg) {
            messagesList.push(
                <div key={`ai-${i}`} className="message-ai">
                    <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                        {String(aiMsg[2] || "")}
                    </ReactMarkdown>

                    <ConfidenceFlag confidence={aiMsg[3]} />
                    <button onClick={() => fetchCitations(aiMsg[0], setSelectedCitations)}>Show Sources</button>
                </div>
            )
        }
    }

    if (uploadedDoc) {
        return (
            <div className="chat-layout">
                <div className="chat-sidebar">
                    <Citations citations={selectedCitations} />
                </div>
    
                <div className="chat-main">
                    <h2>{chatTitle}</h2>
                    <p>Refers to this document: <a href={`/api/getfile?chatSessionID=${localStorage.getItem("chatSessionID")}`} download>
                        {uploadedDoc[0]}
                    </a></p>
                    <ChatPromptBar messages={messages} setMessage={setMessage} />
                    {messagesList}
                    
                </div>
            </div>
        )
    }
    return (
        <div className="chat-layout">
            <div className="chat-sidebar">
                <Citations citations={selectedCitations} />
            </div>

            <div className="chat-main">
                <h2>{chatTitle}</h2>
                <ChatPromptBar messages={messages} setMessage={setMessage} />
                {messagesList}
                
            </div>
        </div>
    )
}
export default NewChat