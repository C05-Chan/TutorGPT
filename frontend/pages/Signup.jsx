import { useState } from "react"
import ErrorPopup from "../components/ErrorMessage.jsx"

async function handleSignup(username, email, password, confirmPassword, setError, setPage) {
    if (!username || !email || !password) {
        console.log("not all fields filled in")
        return setError("All fields are required.")
    }
    else if (username.length < 3 || username.length > 20) { 
        console.log("Username must be at 3 - 20 characters long.")
        return setError("Username must be at 3 - 20 characters long.")
    }

    else if (email.includes(" ")) {
        console.log("Please enter a valid email address.")

        return setError("Please enter a valid email address. Email cannot contain spaces.")
    }
    else if (!email.includes("@")) {
        console.log("email must include @ symbol.")
        return setError("Please enter a valid email address. Email must include @ symbol.")
    }
    else if (!email.endsWith(".com") && !email.endsWith(".co.uk") && !email.endsWith(".co") && !email.endsWith(".ac.uk")) {
        return setError("Please enter a valid email address. Email must end with .com, .co.uk, .co, or .ac.uk.")
    }
    else if (email.startsWith("@") || email.startsWith(".") || email.startsWith("_") || email.startsWith("-")) {
        console.log("Please enter a valid email address.")
        return setError("Please enter a valid email address. Email cannot start with special characters.")
    }

    else if (password.length < 8 || password.length > 20) {
        console.log("password must be at least 8 characters long and less than 20 characters long.")  
        return setError("Password must be at least 8 characters long and less than 20 characters long.")
    }
    else if (password !== confirmPassword) {
        console.log("Passwords do not match.")
        return setError("Passwords do not match.")
    }
    else if (email) {
        const res = await fetch(`/api/emailcheck?email=${email}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })

        const data = await res.json()

        if (data.exists) {
            console.log("Email is already in use. Please use a different email.")
            return setError("Email is already in use. Please use a different email.")
        }
    }

    const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
    })

    const data = await res.json()

    if (data.success) {
        const res = await fetch(`/api/userinfo?email=${email}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        
        const data = await res.json()

        localStorage.setItem("userID", data.userID)
        localStorage.setItem("username", data.username)
        
        setPage("home")
    } else {
        setError(data.message)
        console.error("Signup failed:", data.message)
    }
}

function Signup({ setPage }) {
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")

    return (
    <>
        <div className="signup-form">
            {error && <ErrorPopup message={error} />}
            <label>Username: </label>
            <input onChange={(event) => setUsername(event.target.value)} />
            <label>Email: </label>
            <input onChange={(event) => setEmail(event.target.value)} />
            <label>Password: </label>
            <input onChange={(event) => setPassword(event.target.value)} />
            <label>Confirm Password: </label>
            <input onChange={(event) => setConfirmPassword(event.target.value)} />
            <button onClick={() => handleSignup(username, email, password, confirmPassword, setError, setPage)}>Sign Up</button>
        </div>

        <div className="login-link">
            <p>Already have an account?</p> 
            <button onClick={() => setPage("login")}>Login!</button>
        </div>
    </>
)
}

export default Signup