import { applySettingsOnLoad } from "./src/applySettings"

export async function localStorageSettingsLoader(userID) {

    // fetches the user's saved settings from the server

    const res = await fetch(`/api/userSettings?user_id=${userID}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })

    const data = await res.json()
    const settings = data.settings

    // saves the settings to localStorage
    localStorage.setItem("responseLength", settings.responseLength)
    localStorage.setItem("displayMode", settings.displayMode)
    localStorage.setItem("displayTextSize", settings.displayTextSize)
    localStorage.setItem("displayFontStyle", settings.displayFontStyle)

    applySettingsOnLoad(settings.displayMode, settings.displayTextSize, settings.displayFontStyle) // applies the settings to the UI

    return settings;
}

export async function getUserInfo(email) {
    // fetches the user's ID and username from the server and stores them in localStorage
    const res = await fetch(`/api/userinfo?email=${email}`, {           
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })
    const data = await res.json()

    localStorage.setItem("userID", data.userID)
    localStorage.setItem("username", data.username)
    return data.userID
}

export async function fetchChatInfo(setChatTitle) {
    if (localStorage.getItem("userID")) {
        // logged in user: fetches chat info using the permanent chat session ID
        const res = await fetch(`/api/getchatinfo?chatSessionID=${localStorage.getItem("chatSessionID")}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })

        const data = await res.json()
        setChatTitle(data.chatTitle)
        console.log(data)
        return data
    } else {
        // guest user: fetches chat info using the temporary chat session ID
        const res = await fetch(`/api/gettempchatinfo?tempChatSessionID=${localStorage.getItem("tempChatSessionID")}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })

        const data = await res.json()
        setChatTitle(data.tempChatTitle)
        console.log(data)
        return data
    }
}

export async function fetchDocuments(setUploadedDoc) {
    // only logged in users can have uploaded documents
    if (!localStorage.getItem("userID")) {
        return
    }

    const chatID = localStorage.getItem("chatSessionID")
    const res = await fetch(`/api/getdocument?chatSessionID=${chatID}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })

    const data = await res.json()
    setUploadedDoc(data.document || null) // sets null if no document is found
}

export async function fetchCitations(messageID, setSelectedCitations) {
    // fetches the citations associated with a specific AI message
    console.log("fetchCitations called with messageID:", messageID)
    const res = await fetch(`/api/getcitations?messageID=${messageID}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })
    const data = await res.json()

    if (!data.citations || data.citations.length === 0) {
        setSelectedCitations(["empty"]) // "empty" signals to Citations.jsx that there are genuinely no sources
    } else {
        setSelectedCitations(data.citations)
    }
    console.log("citations data:", data)
}