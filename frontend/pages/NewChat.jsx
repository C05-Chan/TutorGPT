import { useState, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import remarkBreaks from "remark-breaks";

import { fetchCitations, fetchDocuments, fetchChatInfo } from "../utility";
import ChatPromptBar from "../components/ChatPromptBar"
import Citations  from "../components/Citations"
import ConfidenceFlag from "../components/ConfidenceFlag"


function NewChat() {

    const [chatTitle, setChatTitle] = useState("")
    const [messages, setMessage] = useState([])
    const [uploadedDoc, setUploadedDoc] = useState(null)
    const [selectedCitations, setSelectedCitations] = useState([])

    useEffect(() => {
        fetchChatInfo(setChatTitle)
        fetchDocuments(setUploadedDoc)
    }, [])

    const message_pairs = []
    for (let i = 0; i < messages.length; i += 2) {
        message_pairs.push([messages[i], messages[i + 1]])
    }
    
    message_pairs.reverse()

    let messagesList = []
    for (let i = 0; i < message_pairs.length; i++) {
        const userMsg = message_pairs[i][0]
        const aiMsg = message_pairs[i][1]

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