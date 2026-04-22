import { useState } from "react"
import ErrorPopup from "../components/ErrorMessage.jsx"

async function handleLogin(title, subject, setError, setPage) {
    if (!title || !subject) {
        console.log("Please fill in all fields.", title, subject)
        return setError("Please fill in all fields.");
    }

    if (!localStorage.getItem("userID")) {
        const res = await fetch("/api/createtempchat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tempChatTitle: title, tempChatSubject: subject })
            })

            const data = await res.json()

            if (data.success) {
                setPage("newchat")
                console.log("Chat created successfully with title:", title, "and subject:", subject)
                localStorage.setItem("tempChatID", 1)
            } else {
                setError(data.message)
                console.error("Chat creation failed:", data.message)
            }
        return;
    }

    const userID = localStorage.getItem("userID")
    const res = await fetch("/api/createchat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID: userID, chatTitle: title, chatSubject: subject })
    })

    const data = await res.json()

    if (data.success) {
        setPage("newchat")
        console.log("Chat created successfully with title:", title, "and subject:", subject)
    } else {
        setError(data.message)
        console.error("Chat creation failed:", data.message)
    }
}

function NewChatInfo({setPage}) {
    const [title, setTitle] = useState("")
    const [subject, setSubject] = useState("Computer Science")
    const [error, setError] = useState("")
    return (
        <div className="new-chat-form">
            {error && <ErrorPopup message={error} />}
            <label>New Chat Title: </label>
            <input onChange={(event) => setTitle(event.target.value)} />
            <label>Chat Subject: </label>
            <select onChange={(event) => setSubject(event.target.value)} value={subject}>
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
            </select>
            <button onClick={() => handleLogin(title, subject, setError, setPage)}>Create Chat</button>
        </div>
    )
}

export default NewChatInfo