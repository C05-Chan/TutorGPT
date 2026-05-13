import { useState } from "react"
import ErrorPopup from "./ErrorMessage.jsx"
import { SendIcon } from "./Icons.jsx"

export default function UserSearchBar({ onSearch, searching }) {
    const [query, setQuery] = useState("")
    const [error, setError] = useState("")

    function handleSubmit() {
        if (!query.trim()) {
            return setError("Please enter a username or email.")
        }
        setError("")
        onSearch(query.trim())
    }

    return (
        <div className="chat-prompt-container">
            <div className="chat-prompt-bar">
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by username or email..."
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === "Return") {
                            handleSubmit()
                        }
                    }}
                />
                <button onClick={handleSubmit} disabled={searching}>
                    <SendIcon />
                </button>
            </div>
            <div className="chat-prompt-checker">
                {error && <ErrorPopup message={error} />}
            </div>
        </div>
    )
}