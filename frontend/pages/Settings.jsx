import React, { useState, useEffect } from "react"
import { localStorageSettingsLoader } from "../utility"
import { applySettingsOnLoad } from "../src/applySettings"

async function loadSettings(userID, setResponseLength, setDisplayMode, setDisplayTextSize, setDisplayFontStyle) {
    if (userID && userID !== "null") {
        // logged in user: loads settings from the server and updates localStorage
        const settings = await localStorageSettingsLoader(userID)
        setResponseLength(settings.responseLength)
        setDisplayMode(settings.displayMode)
        setDisplayTextSize(settings.displayTextSize)
        setDisplayFontStyle(settings.displayFontStyle)
    } else {
        // guest user: loads settings from localStorage with defaults as fallback
        setResponseLength(localStorage.getItem("responseLength") || "Medium")
        setDisplayMode(localStorage.getItem("displayMode") || "Light")
        setDisplayTextSize(localStorage.getItem("displayTextSize") || "Medium")
        setDisplayFontStyle(localStorage.getItem("displayFontStyle") || "Arial")
    }
}

async function saveUserSettings(userID, responseLength, displayMode, displayTextSize, displayFontStyle) {
    // always saves to localStorage so settings persist across sessions for all users
    localStorage.setItem("responseLength",    responseLength)
    localStorage.setItem("displayMode",       displayMode)
    localStorage.setItem("displayTextSize",   displayTextSize)
    localStorage.setItem("displayFontStyle",  displayFontStyle)

    applySettingsOnLoad(displayMode, displayTextSize, displayFontStyle) // applies the new settings to the UI immediately

    if (userID && userID !== "null") { // checks if user is logged in
        // save their settings to server and database
        const res = await fetch("/api/updateSettings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userID, responseLength, displayMode, displayTextSize, displayFontStyle })
        })

        const data = await res.json()

        if (data.success) {
            console.log("Settings saved to server for userID:", userID)
            await localStorageSettingsLoader(userID) // reloads settings from server to keep localStorage in sync
        } else {
            console.error("Failed to save settings to server:", data.message)
        }
    } else {
        console.log("Settings saved to localStorage (guest user).")
    }
}

async function handleDeleteAccount(setPage) {

    // function allow logged in users to delete account 

    const userID = localStorage.getItem("userID")

    const res = await fetch("/api/deleteaccount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID })
        })

        const data = await res.json()

        if (data.success) {
            // clears user data from localStorage on successful deletion
            localStorage.removeItem("userID")
            localStorage.removeItem("username")

            if (localStorage.getItem("chatSessionID")) {
                localStorage.removeItem("chatSessionID")
            }

            console.log("Account deleted.")
        }
    window.location.reload() // reloads the page to reset the app state
    setPage("Home")
}

function handleLogout() {
    // this function removes user data from localStorage when they want to log out

    localStorage.removeItem("userID")
    localStorage.removeItem("username")
    window.location.reload() // reloads to reset app state
}

function Settings({setPage}) {
    // hook components which re-renders the component with the new value to update UI
    const [responseLength, setResponseLength] = useState("")
    const [displayTextSize, setDisplayTextSize] = useState("")
    const [displayFontStyle, setDisplayFontStyle] = useState("")
    const [displayMode, setDisplayMode] = useState("")

    const userID = localStorage.getItem("userID")

    useEffect(() => {
        loadSettings(userID, setResponseLength, setDisplayMode, setDisplayTextSize, setDisplayFontStyle)
    }, []) // runs once on load to populate the settings dropdowns with current values

    if (userID) {     // checks if user is logged in as it renders with logout and de-active account buttons
        return (
            <div className="settings-container">
                <h2>Settings Page</h2>

                <div className="settings-feature">
                    <label>Response Length:</label>
                    <select onChange={(event) => setResponseLength(event.target.value)} value={responseLength}>
                        <option value="Short">Short</option>
                        <option value="Medium">Medium</option>
                        <option value="Long">Long</option>
                    </select>
                </div>

                <div className="settings-feature">
                    <label>System Display Mode:</label>
                    <select onChange={(event) => setDisplayMode(event.target.value)} value={displayMode}>
                        <option value="Light">Light Mode</option>
                        <option value="Dark">Dark Mode</option>
                    </select>
                </div>

                <div className="settings-feature">
                    <label>Text Size:</label>
                    <select onChange={(event) => setDisplayTextSize(event.target.value)} value={displayTextSize}>
                        <option value="Small">Small</option>
                        <option value="Medium">Medium</option>
                        <option value="Large">Large</option>
                    </select>
                </div>

                <div className="settings-feature">
                    <label>Text Font: </label>
                    <select onChange={(event) => setDisplayFontStyle(event.target.value)} value={displayFontStyle}>
                        <option value="Arial">Arial</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier New">Courier New</option>
                    </select>
                </div>

                <button onClick={() => saveUserSettings(userID ?? 'null', responseLength, displayMode, displayTextSize, displayFontStyle)}>Save Settings</button>
                <button onClick={() => handleDeleteAccount(setPage)}>Deactivate Account</button>
                <button onClick={handleLogout}>Logout</button>
            </div>
        )
    }

    return (
            <div className="settings-container">
                <h2>Settings Page</h2>

                <div className="settings-feature">
                    <label>Response Length:</label>
                    <select onChange={(event) => setResponseLength(event.target.value)} value={responseLength}>
                        <option value="Short">Short</option>
                        <option value="Medium">Medium</option>
                        <option value="Long">Long</option>
                    </select>
                </div>

                <div className="settings-feature">
                    <label>System Display Mode:</label>
                    <select onChange={(event) => setDisplayMode(event.target.value)} value={displayMode}>
                        <option value="Light">Light Mode</option>
                        <option value="Dark">Dark Mode</option>
                    </select>
                </div>

                <div className="settings-feature">
                    <label>Text Size:</label>
                    <select onChange={(event) => setDisplayTextSize(event.target.value)} value={displayTextSize}>
                        <option value="Small">Small</option>
                        <option value="Medium">Medium</option>
                        <option value="Large">Large</option>
                    </select>
                </div>

                <div className="settings-feature">
                    <label>Text Font: </label>
                    <select onChange={(event) => setDisplayFontStyle(event.target.value)} value={displayFontStyle}>
                        <option value="Arial">Arial</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier New">Courier New</option>
                    </select>
                </div>

                <button onClick={() => saveUserSettings(userID ?? 'null', responseLength, displayMode, displayTextSize, displayFontStyle)}>Save Settings</button>
            </div>
    )
}

export default Settings