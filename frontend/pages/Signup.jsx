import { useState } from "react"
import ErrorPopup from "../components/ErrorMessage.jsx"
import { localStorageSettingsLoader, getUserInfo } from "../utility.jsx"

async function handleSignup(username, email, password, confirmPassword, setError, setPage) {
    
    // this function validates all signup fields before sending to the server

    if (!username || !email || !password) {
        console.log("not all fields filled in")
        return setError("All fields are required.")
    }
    else if (username.length < 3 || username.length > 20) { 
        // validates username length
        console.log("Username must be at 3 - 20 characters long.")
        return setError("Username must be at 3 - 20 characters long.")
    }
    else if (email.includes(" ")) {
        // checks for spaces in email
        console.log("Please enter a valid email address.")
        return setError("Please enter a valid email address. Email cannot contain spaces.")
    }
    else if (!email.includes("@")) {
        // checks for @ symbol in email
        console.log("email must include @ symbol.")
        return setError("Please enter a valid email address. Email must include @ symbol.")
    }
    else if (!email.endsWith(".com") && !email.endsWith(".co.uk") && !email.endsWith(".co") && !email.endsWith(".ac.uk")) {
        // validates email domain ending
        return setError("Please enter a valid email address. Email must end with .com, .co.uk, .co, or .ac.uk.")
    }
    else if (email.startsWith("@") || email.startsWith(".") || email.startsWith("_") || email.startsWith("-")) {
        // checks email doesn't start with special characters
        console.log("Please enter a valid email address.")
        return setError("Please enter a valid email address. Email cannot start with special characters.")
    }
    else if (password.length < 8 || password.length > 20) {
        // validates password length
        console.log("password must be at least 8 characters long and less than 20 characters long.")  
        return setError("Password must be at least 8 characters long and less than 20 characters long.")
    }
    else if (password !== confirmPassword) {
        // checks both password fields match
        console.log("Passwords do not match.")
        return setError("Passwords do not match.")
    }
    else if (email) {
        // checks if the email is already registered before attempting signup
        const emailSignUp = email.toLowerCase()
        const res = await fetch(`/api/emailcheck?email=${emailSignUp}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })

        const data = await res.json()

        if (data.exists) {
            console.log("Email is already in use. Please use a different email.")
            return setError("Email is already in use. Please use a different email.")
        }
    }

    // sends the signup request to the server
    const emailSignUp = email.toLowerCase() // normalises email to lowercase before storing
    const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email: emailSignUp, password })
    })

    const data = await res.json()

    if (data.success) {
        // loads user info and settings into localStorage then redirects to home
        const userID = await getUserInfo(emailSignUp)
        await localStorageSettingsLoader(userID)
        setPage("home")
    } else {
        setError(data.message)
        console.error("Signup failed:", data.message)
    }
}

function Signup({ setPage }) {
    // hook components which re-renders the component with the new value to update UI
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")

    return (
        <div className="signup-container">
            <h2>Sign Up</h2>

            {error && <ErrorPopup message={error} />}

            <div className="signup-feature">
                <label htmlFor="username">Username: </label>
                <input id="username" onChange={(event) => setUsername(event.target.value)} />
            </div>

            <div className="signup-feature">
                <label htmlFor="email">Email: </label>
                <input id="email" onChange={(event) => setEmail(event.target.value)} />
            </div>

            <div className="signup-feature">
                <label htmlFor="password">Password: </label>
                {/* type password hides the input text */}
                <input id="password" type="password" onChange={(event) => setPassword(event.target.value)} />
            </div>

            <div className="signup-feature">
                <label htmlFor="confirm">Confirm Password: </label>
                <input id="confirm" type="password" onChange={(event) => setConfirmPassword(event.target.value)} />
            </div>

            <button onClick={() => handleSignup(username, email, password, confirmPassword, setError, setPage)}>Sign Up</button>

            <div className="signup-feature">
                <p>Already have an account?</p>
                <button onClick={() => setPage("login")}>Login</button>
            </div>
        </div>
    )
}

export default Signup