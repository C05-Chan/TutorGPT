import { applySettingsOnLoad } from "./src/applySettings"

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

    applySettingsOnLoad(settings.displayMode, settings.displayTextSize, settings.displayFontStyle)

    return settings;
}

export async function getUserInfo(email, isTeacher = false) {
    
    const res = await fetch(`/api/userinfo?email=${email}&isTeacher=${isTeacher}`, {           
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })
    const data = await res.json()

    if (isTeacher) {
        localStorage.setItem("teacherID", data.teacherID)
        localStorage.setItem("username", data.username)
        return data.teacherID

    } else {
        localStorage.setItem("userID", data.userID)
        localStorage.setItem("username", data.username)
        return data.userID
    }
}

export async function fetchChatInfo(setChatTitle) {
    if (localStorage.getItem("userID")) {
        const res = await fetch(`/api/getchatinfo?chatSessionID=${localStorage.getItem("chatSessionID")}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })

        const data = await res.json()
        setChatTitle(data.chatTitle)
        console.log(data)
        return data
    } else {
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
    if (!localStorage.getItem("userID")) return
        const chatID = localStorage.getItem("chatSessionID")
        const res = await fetch(`/api/getdocument?chatSessionID=${chatID}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })

        const data = await res.json()
        setUploadedDoc(data.document || null) 
}

export async function fetchCitations(messageID, setSelectedCitations) {
        console.log("fetchCitations called with messageID:", messageID)
        const res = await fetch(`/api/getcitations?messageID=${messageID}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })
        const data = await res.json()

        if (!data.citations || data.citations.length === 0) {
            setSelectedCitations(["empty"])
        } else {
            setSelectedCitations(data.citations)
        }
        console.log("citations data:", data)
}