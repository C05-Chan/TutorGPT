import { useState } from "react"
import ErrorPopup from "../components/ErrorMessage.jsx"
import { SendIcon } from "./Icons.jsx"

async function handlePrompt(prompt, setError, timer, setLastSubmit, setPrompt, messages, setMessage) {
    if (!prompt) {
        return setError("Please enter a prompt.")
    } else if (prompt.length > 100) {
        return setError("Prompt is too long. Please enter a prompt less than 100 characters.")
    } else if (timer && Date.now() - timer < 30000) { /// 6000 for a minute 
        const secondsLeft = ((30000 - (Date.now() - timer)) / 1000) | 0
        return setError(`Please wait ${secondsLeft} seconds before sending another prompt.`)
    } else {
        setError("")
    }

    const newMessages = [...messages]
    newMessages.push([null, "User", prompt, null])
    setMessage(newMessages)
    setPrompt("")
    setLastSubmit(Date.now())
    
    if (localStorage.getItem("userID")) {
        const res = await fetch("/api/submitloggedprompt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, chatSessionID: localStorage.getItem("chatSessionID") })
        })

        const data = await res.json()

        if (data.success) {
            console.log("Prompt submitted successfully:", prompt)
            const newMessagesAndResponse = [...newMessages]
            newMessagesAndResponse.push([data.messageID, "TutorGPT", data.message, data.confidence])
            setMessage(newMessagesAndResponse)
            // setLastSubmit(Date.now())
        }
    } else {
        const res = await fetch("/api/submitunloggedprompt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, tempChatSessionID: localStorage.getItem("tempChatSessionID") })
        })

        const data = await res.json()

        if (data.success) {
            console.log("Prompt submitted successfully:", prompt)
            console.log(data.message)
            const newMessagesAndResponse = [...newMessages]
            newMessagesAndResponse.push([data.messageID, "TutorGPT", data.message, data.confidence])
            setMessage(newMessagesAndResponse)
            // setLastSubmit(Date.now())
        }
    }
}

export default function ChatPromptBar({messages, setMessage}) {
    const [prompt, setPrompt] = useState("")
    const [error, setError] = useState("")
    const [lastSubmit, setLastSubmit] = useState(null)

    return (
        <div className="chat-prompt-wrapper">
            <div className="chat-prompt-bar">
                <input
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    placeholder="Enter your question or topic here..."
                    onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === "Return") {
                            handlePrompt(prompt, setError, lastSubmit, setLastSubmit, setPrompt, messages, setMessage)
                        }
                    }}
                />
                <button onClick={() => handlePrompt(prompt, setError, lastSubmit, setLastSubmit, setPrompt, messages, setMessage)}><SendIcon/></button>
            </div>
            <div className="chat-prompt-checker">
                <p>{prompt.length}/100 </p>
                {error && <ErrorPopup message={error} />}
            </div>
        </div>
    )
}