function Settings() {
    const handleLogout = () => {
        localStorage.removeItem("userID")
        localStorage.removeItem("username")
        window.location.reload()
    }

    if (localStorage.getItem("userID")) {
        return (
        <div className="settings-container">
            <h2>Settings Page</h2>

            
                <button className="btn-logout" onClick={handleLogout}>
                    Logout
                </button>
        </div>
        )
    }

    return (
        <div className="settings-container">
            <h2>Settings Page</h2>
        </div>
    )
}

export default Settings 