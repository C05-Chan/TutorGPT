import { useState } from "react"
import { localStorageSettingsLoader, getUserInfo } from "../utility.jsx"

function validateEmail(email){
    if (email.includes(" ")) {
        // checks for spaces in email
        console.log("Please enter a valid email address.")
        return "Please enter a valid email address. Email cannot contain spaces."

    } else if (!email.includes("@")) {
        // checks for @ symbol in email
        console.log("email must include @ symbol.")
        return "Please enter a valid email address. Email must include @ symbol."

    } else if (!email.endsWith(".com") && !email.endsWith(".co.uk") && !email.endsWith(".co") && !email.endsWith(".ac.uk")) {
        // validates email domain ending
        return "Please enter a valid email address. Email must end with .com, .co.uk, .co, or .ac.uk."

    } else if (email.startsWith("@") || email.startsWith(".") || email.startsWith("_") || email.startsWith("-")) {
        // checks email doesn't start with special characters
        console.log("Please enter a valid email address.")
        return "Please enter a valid email address. Email cannot start with special characters."
    }

    return null
}

export default function useSignup(setPage) {
    const [error, setError] = useState("")

   async function signup(username, email, password, confirmPassword) {
    
    // this function validates all signup fields before sending to the server

        if (!username || !email || !password) {
            console.log("not all fields filled in")
            return setError("All fields are required.")

        } else if (username.length < 3 || username.length > 20) { 
            // validates username length
            console.log("Username must be at 3 - 20 characters long.")
            return setError("Username must be at 3 - 20 characters long.")
        } else if (password.length < 8 || password.length > 20) {
            // validates password length
            console.log("password must be at least 8 characters long and less than 20 characters long.")  
            return setError("Password must be at least 8 characters long and less than 20 characters long.")
        } else if (password !== confirmPassword) {
            // checks both password fields match
            console.log("Passwords do not match.")
            return setError("Passwords do not match.")
        }

        const emailError = validateEmail(email)

        if (emailError) {
            setError(emailError)
            return 
        }
        
        // checks if the email is already registered before attempting signup
        const emailLower  = email.toLowerCase() // normalises email to lowercase

        const checkRes = await fetch(`/api/emailcheck?email=${emailLower}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })
        
        const checkData  = await checkRes.json()

        if (checkData.exists) {
            console.log("Email is already in use. Please use a different email.")
            return setError("Email is already in use. Please use a different email.")
        }

        // sends the signup request to the server
        const signupRes  = await fetch("/api/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email: emailLower, password })
        })

        const signupData  = await signupRes.json()

        if (signupData.success) {
            // loads user info and settings into localStorage then redirects to home
            const userID = await getUserInfo(emailLower)
            await localStorageSettingsLoader(userID)
            setPage("home")
        } else {
            setError(signupData.message)
            console.error("Signup failed:", signupData.message)
        }
    }
    return { signup, error }
}

