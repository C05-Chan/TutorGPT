import { useState } from "react"
import ErrorPopup from "../components/ErrorMessage.jsx"

async function handlePrompt(prompt, setError, timer, setLastSubmit, setPrompt, messages, setMessage) {
    if (!prompt) {
        return setError("Please enter a prompt.")
    } else if (prompt.length > 500) {
        return setError("Prompt is too long. Please enter a prompt less than 500 characters.")
    } else if (timer && Date.now() - timer < 1000) { /// 6000 for a minute
        const secondsLeft = ((1000 - (Date.now() - timer)) / 1000) | 0
        return setError(`Please wait ${secondsLeft} seconds before sending another prompt.`)
    } else {
        setError("")
    }

    const newMessages = [...messages] 
    newMessages.push([null, prompt, "User"])
    setMessage(newMessages)
    setPrompt("")
    
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
            newMessagesAndResponse.push([null, data.message,"Tutor-GPT"])
            setMessage(newMessagesAndResponse)
            setLastSubmit(Date.now())
        }
    } else {
        const res = await fetch("/api/submitunloggedprompt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, tempChatID: localStorage.getItem("tempChatID") })
        })

        const data = await res.json()

        if (data.success) {
            console.log("Prompt submitted successfully:", prompt)
            const newMessagesAndResponse = [...newMessages]
            newMessagesAndResponse.push([null, data.message,"Tutor-GPT"])
            setMessage(newMessagesAndResponse)
            setLastSubmit(Date.now())
            
        }
    }
}

export default function ChatPromptBar({messages, setMessage}) {
    const [prompt, setPrompt] = useState("")
    const [error, setError] = useState("")
    const [lastSubmit, setLastSubmit] = useState(null)

    return (
        <div className="chat-prompt-bar">
            <input id="chat-prompt-input"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Enter your question or topic here..."
                onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === "Return") {
                        handlePrompt(prompt, setError, lastSubmit, setLastSubmit, setPrompt, messages, setMessage)
                    }
                }}
            />
            <p>{prompt.length}/500</p>
            <button onClick={() => handlePrompt(prompt, setError, lastSubmit, setLastSubmit, setPrompt, messages, setMessage)}>Send</button>
            {error && <ErrorPopup message={error} />}
        </div>
    )
}