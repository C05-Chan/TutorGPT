import React, { useState, useEffect } from "react"
import { localStorageSettingsLoader } from "../utility"

async function loadSettings(userID, setResponseLength, setDisplayMode, setDisplayTextSize, setDisplayFontStyle) {
    if (userID && userID !== "null") {
        const settings = await localStorageSettingsLoader(userID)
        setResponseLength(settings.responseLength)
        setDisplayMode(settings.displayMode)
        setDisplayTextSize(settings.displayTextSize)
        setDisplayFontStyle(settings.displayFontStyle)
    } else {
        setResponseLength(localStorage.getItem("responseLength") || "Medium")
        setDisplayMode(localStorage.getItem("displayMode") || "Light")
        setDisplayTextSize(localStorage.getItem("displayTextSize") || "Medium")
        setDisplayFontStyle(localStorage.getItem("displayFontStyle") || "Arial")
    }
}

async function saveUserSettings(userID, responseLength, displayMode, displayTextSize, displayFontStyle) {
    if (userID && userID !== "null") {
        localStorage.setItem("responseLength", responseLength)
        localStorage.setItem("displayMode", displayMode)
        localStorage.setItem("displayTextSize", displayTextSize)
        localStorage.setItem("displayFontStyle", displayFontStyle)
        console.log("Settings saved to localStorage for non-logged-in user. Response Length:", responseLength, "Display Mode:", displayMode, "Text Size:", displayTextSize, "Font Style:", displayFontStyle)
    } else { 
        const res = await fetch("/api/updateSettings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userID, responseLength, displayMode, displayTextSize, displayFontStyle })
        })

        const data = await res.json()

        if (data.success) {
            console.log("Settings saved successfully.")
            console.log("Saving settings for userID:", userID, "Response Length:", responseLength, "Display Mode:", displayMode, "Text Size:", displayTextSize, "Font Style:", displayFontStyle)
            await localStorageSettingsLoader(userID)

        } else {
            console.error("Failed to save settings:", data.message)
        }
    }
}   

async function handleDeleteAccount(setPage) {
    const userID = localStorage.getItem("userID")

    const res = await fetch("/api/deleteaccount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID })
        })

        const data = await res.json()

        if (data.success) {
            localStorage.removeItem("userID")
            localStorage.removeItem("username")

            if (localStorage.getItem("chatSessionID")) {
                localStorage.removeItem("chatSessionID")
            }

            console.log("Account deleted.")
        }
    window.location.reload()
    setPage("Home")
}

function handleLogout() {
        localStorage.removeItem("userID")
        localStorage.removeItem("username")
        window.location.reload()
}

function Settings({setPage}) {
    const [responseLength, setResponseLength] = useState("")
    const [displayTextSize, setDisplayTextSize] = useState("")
    const [displayFontStyle, setDisplayFontStyle] = useState("")
    const [displayMode, setDisplayMode] = useState("")

    const userID = localStorage.getItem("userID")

    useEffect(() => {
        loadSettings(userID, setResponseLength, setDisplayMode, setDisplayTextSize, setDisplayFontStyle)
    }, [])


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

            <button onClick={() => saveUserSettings(userID ?? 'null', responseLength, displayMode, displayTextSize, displayFontStyle)}>Save Settings</button>
            {userID && <button onClick={() => handleDeleteAccount(setPage)}>Deactivate Account</button>}
            {userID && <button onClick={handleLogout}>Logout</button>}
        </div>
    )
}

export default Settings