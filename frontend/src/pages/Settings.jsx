import ErrorPopup from "../components/ErrorMessage"
import useSettings from "../hooks/useSettings.jsx" 

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

function handleLogout(setPage) {
    // this function removes user data from localStorage when they want to log out

    localStorage.removeItem("userID")
    localStorage.removeItem("username")
    window.location.reload() // reloads the page to reset the app state
    setPage("Home")
}

function Settings({ setPage }) {
    const {
        responseLength, setResponseLength,
        displayMode, setDisplayMode,
        displayTextSize, setDisplayTextSize,
        displayFontStyle, setDisplayFontStyle,
        saveSettings,
        error
    } = useSettings()

    const userID = localStorage.getItem("userID")
    if (userID) {
        return (
            <div className="settings-container">
                <h2>Settings Page</h2>
                <div className="settings-feature">
                    <label>Response Length:</label>
                    <select onChange={(e) => setResponseLength(e.target.value)} value={responseLength}>
                        <option value="Short">Short</option>
                        <option value="Medium">Medium</option>
                        <option value="Long">Long</option>
                    </select>
                </div>
                <div className="settings-feature">
                    <label>Display Mode:</label>
                    <select onChange={(e) => setDisplayMode(e.target.value)} value={displayMode}>
                        <option value="Light">Light Mode</option>
                        <option value="Dark">Dark Mode</option>
                    </select>
                </div>
                <div className="settings-feature">
                    <label>Text Size:</label>
                    <select onChange={(e) => setDisplayTextSize(e.target.value)} value={displayTextSize}>
                        <option value="Small">Small</option>
                        <option value="Medium">Medium</option>
                        <option value="Large">Large</option>
                    </select>
                </div>
                <div className="settings-feature">
                    <label>Text Font:</label>
                    <select onChange={(e) => setDisplayFontStyle(e.target.value)} value={displayFontStyle}>
                        <option value="Arial">Arial</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier New">Courier New</option>
                    </select>
                </div>

                {error && <ErrorPopup message={error} />}
                <button onClick={saveSettings}>Save Settings</button>
                <button onClick={() => handleDeleteAccount(setPage)}>Deactivate Account</button>
                <button onClick={() => handleLogout(setPage)}>Logout</button>
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
            {error && <ErrorPopup message={error} />}
            <button onClick={saveSettings}>Save Settings</button>
        </div>
    )
}

export default Settings