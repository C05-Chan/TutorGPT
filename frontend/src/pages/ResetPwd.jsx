import { useState } from "react"
import ErrorPopup from "../components/ErrorMessage.jsx"

async function handleResetPassword(email, password, confirmPassword, setError, setPage) {

    // this function allows users to update their password using an email after input validation

    if (!email || !password || !confirmPassword) { 
        return setError("Please fill in all fields.")
    }
    else if (password.length < 8 || password.length > 20) {
        // validates password length before sending to the server
        console.log("password must be at least 8 characters long and less than 20 characters long.")  
        return setError("Password must be at least 8 characters long and less than 20 characters long.")
    }
    else if (password !== confirmPassword) {
        // checks both password fields match before sending to the server
        console.log("Passwords do not match.")
        return setError("Passwords do not match.")
    }
    else if (email) {
        // checks if the email is registered
        const res = await fetch(`/api/emailcheck?email=${email}`);
        const data = await res.json()

        if (!data.exists) {
            console.log("Email is not registered. Please use a different email.")
            return setError("Email is not registered. Please use a different email.")
        }
    }

    // sends the new password and email to the server to update the password
    const res = await fetch("/api/resetpassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, email  })
    })

    const data = await res.json()

    if (data.success) {
        setPage("login") // redirects to login page on success
    } else {
        setError(data.message)
        console.error("Password reset failed:", data.message)
    }   
}


function ResetPassword({ setPage }) {
    // hook components which re-renders the component with the new value to update UI
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    
    return (
        <div className="restpwd-container">
            <h2>Reset Password</h2>

            {error && <ErrorPopup message={error} />}

            <div className="restpwd-feature">
                <label htmlFor="email">Email:</label>
                <input id="email" onChange={(event) => setEmail(event.target.value)} />
            </div>

            <div className="restpwd-feature">
                <label htmlFor="password">New Password:</label>
                <input id="password" type="password" onChange={(event) => setPassword(event.target.value)} />
            </div>

            <div className="restpwd-feature">
                <label htmlFor="confirm">Confirm New Password:</label>
                {/* type password hides the input text */}
                <input id="confirm" type="password" onChange={(event) => setConfirmPassword(event.target.value)} />
            </div>

            <button onClick={() => handleResetPassword(email, password, confirmPassword, setError, setPage)}>Reset Password</button>
        </div>
    )
}

export default ResetPassword