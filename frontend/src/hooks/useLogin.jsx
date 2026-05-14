import { useState } from "react"
import { localStorageSettingsLoader, getUserInfo } from "../utility.jsx"

export default function useLogin(setPage) {

    // this creates a custom hook: validates user login, get userID and render their settings

    // hook components
    // these components stores the value and when some is "set"  (e.g setError) it rerenders the UI.
    const [error, setError] = useState("")

    async function login(email, password) {
        
        //This function input validates and authenticates user can log in
    
        if (!email || !password) { // checks all fields are fileld in=
            setError("Please fill all fields.")
            return;
        }
    
        const emailLower = email.toLowerCase() // changes the emails to lower case
    
        const res = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: emailLower, password})
        })

        const data = await res.json()

        if (data.success) {
            const userID = await getUserInfo(emailLower) // get their ID and Username
            await localStorageSettingsLoader(userID) // load their settings and add it to local storage

            setPage("home") // take them to the home page if successfully logged in

        } else {
            setError("Unable to Login. Please check details")
            console.error("Login failed:", data.message)
        }
    }

    return { login, error }
}