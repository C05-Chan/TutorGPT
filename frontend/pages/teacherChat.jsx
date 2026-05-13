import { useState, useEffect } from "react"
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import { fetchCitations, fetchDocuments, fetchChatInfo } from "../utility";
import Citations from "../components/Citations"
import ConfidenceFlag from "../components/ConfidenceFlag"

async function fetchMessages(setMessages) {
    // Teacher is always viewing a logged-in user's chat (never a tempChat)
    const chatSessionID = localStorage.getItem("chatSessionID");
    const res = await fetch(`/api/getmessages?chatSessionID=${chatSessionID}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    setMessages(data.messages || []);
}

function TeacherChat({ setPage }) {
    const [chatTitle, setChatTitle] = useState("")
    const [messages, setMessage] = useState([])
    const [uploadedDoc, setUploadedDoc] = useState(null)
    const [selectedCitations, setSelectedCitations] = useState([])

    useEffect(() => {
        fetchChatInfo(setChatTitle)
        fetchMessages(setMessage)
        fetchDocuments(setUploadedDoc)
    }, [])

    // Pair messages: [userMsg, aiMsg]
    const message_pairs = []
    for (let i = 0; i < messages.length; i += 2) {
        message_pairs.push([messages[i], messages[i + 1]])
    }
    message_pairs.reverse()

    const messagesList = []
    for (let i = 0; i < message_pairs.length; i++) {
        const user_messages = message_pairs[i][0]
        const ai_messages = message_pairs[i][1]

        if (user_messages) {
            messagesList.push(
                <div key={`user-${i}`} className="message-user">
                    <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                        {String(user_messages[2] || "")}
                    </ReactMarkdown>
                </div>
            )
        }

        if (ai_messages) {
            messagesList.push(
                <div key={`ai-${i}`} className="message-ai">
                    <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                        {String(ai_messages[2] || "")}
                    </ReactMarkdown>

                    <ConfidenceFlag confidence={ai_messages[3]} />
                    <button onClick={() => fetchCitations(ai_messages[0], setSelectedCitations)}>
                        Show Sources
                    </button>
                </div>
            )
        }
    }

    return (
        <div className="chat-layout">
            <div className="chat-sidebar">
                <Citations citations={selectedCitations} />
            </div>

            <div className="chat-main">
                <div className="teacher-chat-header">
                    <button className="back-btn" onClick={() => setPage("teacherdashboard")}>
                        ← Back
                    </button>
                    <h2>{chatTitle}</h2>
                    <span className="read-only-badge">Read Only</span>
                </div>

                {uploadedDoc && (
                    <p>Refers to this document:{" "}
                        <a
                            href={`/api/getfile?chatSessionID=${localStorage.getItem("chatSessionID")}`}
                            download
                        >
                            {uploadedDoc[0]}
                        </a>
                    </p>
                )}

                {/* No ChatPromptBar — teachers view only */}
                {messagesList.length === 0
                    ? <p className="empty-state">No messages in this chat.</p>
                    : messagesList
                }
            </div>
        </div>
    )
}

export default TeacherChat