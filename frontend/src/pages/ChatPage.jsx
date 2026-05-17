import { useState, useEffect } from "react"
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";

import { fetchCitations, fetchDocuments, fetchChatInfo } from "../utility";
import ChatPromptBar from "../components/ChatPromptBar"
import Citations from "../components/Citations"
import ConfidenceFlag from "../components/ConfidenceFlag"

async function fetchMessages(setMessages) { 

    // this function gets the previous messages from database and displays it

    if (localStorage.getItem("userID")) { // checks if its a logged in user
        const res = await fetch(`/api/getmessages?chatSessionID=${localStorage.getItem("chatSessionID")}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })

        const data = await res.json()
        setMessages(data.messages || [])


    } else {
        const res = await fetch(`/api/getmessages?tempChatSessionID=${localStorage.getItem("tempChatSessionID")}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })

        const data = await res.json()
        setMessages(data.messages || [])
    }
}

function ChatView({ isContinuedChat }) {

    // this is the continue chat page, where users can continue where they left their chat on

    // hook components lets a component remember and update a value which re-renders the component with the new value to update UI
    const [chatTitle, setChatTitle] = useState("")
    const [messages, setMessage] = useState([])
    const [uploadedDoc, setUploadedDoc] = useState(null)
    const [selectedCitations, setSelectedCitations] = useState([])

    useEffect(() => {
        fetchChatInfo(setChatTitle)
        fetchDocuments(setUploadedDoc)
        

        if (isContinuedChat){ // this checks if it was a previously created chat
            fetchMessages(setMessage) // fetch and renders previous messages
        }

    }, [])  // runs code inside after the component renders, [] means it runs once when the component first loads

    // groups messages into pairs of [user, ai] since they are stored flat in the array
    const messagePairs = [] 
    for (let i = 0; i < messages.length; i += 2) {
        messagePairs.push([messages[i], messages[i + 1]]) // builds the message_pair array of messages by pairing them
    }

    messagePairs.reverse()  // reverses so the most recent messages appear at the top
    
    let messagesList = []
    for (let i = 0; i < messagePairs.length; i++) { // builds the list of message components to render, for ever item in the messagePairs
        const userMessages = messagePairs[i][0] // user message is the first item of the message pair item
        const aiResponse = messagePairs[i][1] // ai response is the first item of the message pair item

        
        if (userMessages) { // renders the user message if it exists
            messagesList.push(
                <div key={`user-${i}`} className="message-user">
                    <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                        {String(userMessages[2] || "")}
                    </ReactMarkdown>
                </div>
            )
        }

        
        if (aiResponse) { // renders the ai message if it exists, along with confidence flag and show sources button
            console.log("ai_response:", aiResponse)
            messagesList.push(
                <div key={`ai-${i}`} className="message-ai">
                    <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                        {String(aiResponse[2] || "")}
                    </ReactMarkdown>

                    <div className="confidence-citations">
                        <button onClick={() => fetchCitations(aiResponse[0], setSelectedCitations)}>Show Sources</button>
                        <ConfidenceFlag confidence={aiResponse[3]} confidenceReason={aiResponse[4]} />
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

export default ChatView