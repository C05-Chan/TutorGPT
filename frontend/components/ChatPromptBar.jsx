import { useState } from "react"
import ErrorPopup from "../components/ErrorMessage.jsx"

async function handlePrompt(prompt, setError, timer, setLastSubmit, setPrompt) {
    if (!prompt) {
        return setError("Please enter a prompt.")
    } else if (prompt.length > 500) {
        return setError("Prompt is too long. Please enter a prompt less than 500 characters.")
    } else if (timer && Date.now() - timer < 60000) {
        const secondsLeft = ((60000 - (Date.now() - timer)) / 1000) | 0
        return setError(`Please wait ${secondsLeft} seconds before sending another prompt.`)
    } else {
        setError("")
    }

    const res = await fetch("/api/submitprompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
    })

    const data = await res.json()

    if (data.success) {
        console.log("Prompt submitted successfully:", prompt)
        setPrompt("")
        setLastSubmit(Date.now())
        // return data.response;
}

export default function ChatPromptBar() {
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
                        handlePrompt(prompt, setError, lastSubmit, setLastSubmit, setPrompt)
                    }
                }}
            />
            <p>{prompt.length}/500</p>
            <button onClick={() => handlePrompt(prompt, setError, lastSubmit, setLastSubmit, setPrompt)}>Send</button>
            {error && <ErrorPopup message={error} />}
        </div>
    )
}