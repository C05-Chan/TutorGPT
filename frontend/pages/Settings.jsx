import React, { useState, useEffect } from "react"

async function getUserSettings(userID) {
    const res = await fetch(`/api/userSettings?user_id=${userID}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })
    
    const data = await res.json()
    return data.settings
}

async function saveUserSettings(userID, responseLength, displayMode, displayTextSize, displayFontStyle) {
    if (userID == 'null') {
        localStorage.setItem("responseLength", responseLength)
        localStorage.setItem("displayMode", displayMode)
        localStorage.setItem("displayTextSize", displayTextSize)
        localStorage.setItem("displayFontStyle", displayFontStyle)
    } else { 
        console.log("Saving settings for userID:", userID, "Response Length:", responseLength, "Display Mode:", displayMode, "Text Size:", displayTextSize, "Font Style:", displayFontStyle)
        const res = await fetch("/api/updateSettings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userID, responseLength, displayMode, displayTextSize, displayFontStyle })
        })

        const data = await res.json()

        if (data.success) {
            console.log("Settings saved successfully.")
        } else {
            console.error("Failed to save settings:", data.message)
        }
    }
}   

function Settings() {
    const [responseLength, setResponseLength] = useState("")
    const [displayTextSize, setDisplayTextSize] = useState("")
    const [displayFontStyle, setDisplayFontStyle] = useState("")
    const [displayMode, setDisplayMode] = useState("")

    const userID = localStorage.getItem("userID")

    useEffect(() => {
        if (userID) {
            const fetchSettings = async () => {
                const settings = await getUserSettings(userID)
                console.log("Fetched settings:", settings)
                setResponseLength(settings.responseLength)
                setDisplayMode(settings.displayMode)
                setDisplayTextSize(settings.displayTextSize)
                setDisplayFontStyle(settings.displayFontStyle)
            }
            fetchSettings()
        }
    }, [])

    const handleLogout = () => {
        localStorage.removeItem("userID")
        localStorage.removeItem("username")
        window.location.reload()
    }

    return (
        <div className="settings-container">
            <h2>Settings Page</h2>

            <select onChange={(e) => setResponseLength(e.target.value)} value={responseLength}>
                <option value="Short">Short</option>
                <option value="Medium">Medium</option>
                <option value="Long">Long</option>
            </select>

            <select onChange={(e) => setDisplayMode(e.target.value)} value={displayMode}>
                <option value="Light">Light Mode</option>
                <option value="Dark">Dark Mode</option>
            </select>

            <select onChange={(e) => setDisplayTextSize(e.target.value)} value={displayTextSize}>
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
                <option value="Large">Large</option>
            </select>

            <select onChange={(e) => setDisplayFontStyle(e.target.value)} value={displayFontStyle}>
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
            </select>

            <button onClick={() => saveUserSettings(userID ?? 'null', responseLength, displayMode, displayTextSize, displayFontStyle)}>
                Save Settings
            </button>
            {userID && <button onClick={handleLogout}>Logout</button>}
        </div>
    )
}

export default Settings