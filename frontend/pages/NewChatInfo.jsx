import { useState } from "react"
import ErrorPopup from "../components/ErrorMessage.jsx"

async function handleCreate(title, subject, level, setError, setPage) {
    if (!title || !subject || !level) {
        console.log("Please fill in all fields.", title, subject)
        return setError("Please fill in all fields.");
    }

    if (!localStorage.getItem("userID")) {
        const res = await fetch("/api/createtempchat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tempChatTitle: title, tempChatSubject: subject, tempChatExplanationLevel: level })
            })

            const data = await res.json()

            if (data.success) {
                setPage("newchat")
                console.log("Chat created successfully with title:", title, "and subject:", subject, "and level:", level)
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
        body: JSON.stringify({ userID: userID, chatTitle: title, chatSubject: subject, chatExplanationLevel: level })
    })

    const data = await res.json()

    if (data.success) {
        setPage("newchat")
        localStorage.setItem("chatSessionID", data.chatSessionID )
        console.log("Chat created successfully with title:", title, "and subject:", subject, "and level:", level)
    } else {
        setError(data.message)
        console.error("Chat creation failed:", data.message)
    }
}

function NewChatInfo({setPage}) {
    const [title, setTitle] = useState("")
    const [subject, setSubject] = useState("Computer Science")
    const [level, setExplanationLevel] = useState("Beginner")
    const [error, setError] = useState("")
    return (
        <div className="new-chat-form">
            {error && <ErrorPopup message={error} />}
            <label>Title: </label>
            <input onChange={(event) => setTitle(event.target.value)} />
            <label> Subject: </label>
            <select onChange={(event) => setSubject(event.target.value)} value={subject}>
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
            </select>
            <label>Explanation Level: </label>
            <select onChange={(event) => setExplanationLevel(event.target.value)}  value={level}>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
            </select>
            <button onClick={() => handleCreate(title, subject, level, setError, setPage)}>Create Chat</button>
        </div>
    )
}

export default NewChatInfo