
export async function localStorageSettingsLoader(userID) {
    const res = await fetch(`/api/userSettings?user_id=${userID}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })

    const data = await res.json()
    const settings = data.settings

    localStorage.setItem("responseLength", settings.responseLength)
    localStorage.setItem("displayMode", settings.displayMode)
    localStorage.setItem("displayTextSize", settings.displayTextSize)
    localStorage.setItem("displayFontStyle", settings.displayFontStyle)

    return settings;
}

export async function getUserInfo(email) {
    const res = await fetch(`/api/userinfo?email=${email}`)
    const data = await res.json()
    localStorage.setItem("userID", data.userID)
    localStorage.setItem("username", data.username)
    return data.userID
}
