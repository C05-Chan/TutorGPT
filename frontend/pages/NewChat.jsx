import { useState, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import remarkBreaks from "remark-breaks";

import { fetchCitations, fetchDocuments, fetchChatInfo } from "../utility";
import ChatPromptBar from "../components/ChatPromptBar"
import Citations  from "../components/Citations"
import ConfidenceFlag from "../components/ConfidenceFlag"


function NewChat() {

    // hook components lets a component remember and update a value.which re-renders the component with the new value to update UI
    const [chatTitle, setChatTitle] = useState("")
    const [messages, setMessage] = useState([])
    const [uploadedDoc, setUploadedDoc] = useState(null)
    const [selectedCitations, setSelectedCitations] = useState([])

    useEffect(() => {
        fetchChatInfo(setChatTitle)
        fetchDocuments(setUploadedDoc)
    }, []) // runs code inside after the component renders, [] means it runs once when the component first loads

    // groups messages into pairs of [user, ai] since they are stored flat in the array
    const message_pairs = []
    for (let i = 0; i < messages.length; i += 2) {
        message_pairs.push([messages[i], messages[i + 1]]) // builds the message_pair array of messages by pairing them
    }
    
    message_pairs.reverse() // reverses so the most recent messages appear at the top

    let messagesList = []
    for (let i = 0; i < message_pairs.length; i++) { // builds the list of message components to render, for ever item in the message_pairs

        const user_messages = message_pairs[i][0] // user message is the first item of the message pair item
        const ai_response = message_pairs[i][1] // ai response is the first item of the message pair item

        if (user_messages) { // renders the user message if it exists
            messagesList.push(
                <div key={`user-${i}`} className="message-user">
                    <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                        {String(user_messages[2] || "")}
                    </ReactMarkdown>
                </div>
            )
        }

        if (ai_response) { // renders the ai message if it exists, along with confidence flag and show sources button
            messagesList.push(
                <div key={`ai-${i}`} className="message-ai">
                    <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                        {String(ai_response[2] || "")}
                    </ReactMarkdown>

                    <div className="confidence-citations">
                        <button onClick={() => fetchCitations(ai_response[0], setSelectedCitations)}>Show Sources</button>
                        <ConfidenceFlag confidence={ai_response[3]} />
                    </div>
                </div>
            )
        }
    }

    if (uploadedDoc) { // if an uploaded document is associated with the chat, show a download link for it
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