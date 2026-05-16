import { useState, useEffect } from "react"
import { localStorageSettingsLoader } from "../utility"
import { applySettingsOnLoad } from "../applySettings"

export default function useSettings() {
    const [responseLength, setResponseLength] = useState("")
    const [displayMode, setDisplayMode] = useState("")
    const [displayTextSize, setDisplayTextSize] = useState("")
    const [displayFontStyle, setDisplayFontStyle] = useState("")
    const [error, setError] = useState("")

    const userID = localStorage.getItem("userID")

    useEffect(() => {
        async function load() {
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
        load() // immediately calls it
    }, [])

    async function saveSettings() {
        localStorage.setItem("responseLength", responseLength)
        localStorage.setItem("displayMode", displayMode)
        localStorage.setItem("displayTextSize", displayTextSize)
        localStorage.setItem("displayFontStyle", displayFontStyle)

        applySettingsOnLoad(displayMode, displayTextSize, displayFontStyle)
        setError("Settings Saved!")

        if (userID && userID !== "null") {
            const res = await fetch("/api/updateSettings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userID, responseLength, displayMode, displayTextSize, displayFontStyle })
            })
            const data = await res.json()
            if (data.success) {
                await localStorageSettingsLoader(userID)
                setError("Settings Saved!")
            } else {
                setError("Failed to save settings.")  // tell the user something went wrong
            }
        }
    }

    return {
        responseLength, setResponseLength,
        displayMode, setDisplayMode,
        displayTextSize, setDisplayTextSize,
        displayFontStyle, setDisplayFontStyle,
        saveSettings,
        error
    }
}