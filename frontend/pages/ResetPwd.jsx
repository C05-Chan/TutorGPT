import { useState } from "react"
import ErrorPopup from "../components/ErrorMessage.jsx"

async function handleResetPassword(email, password, confirmPassword, setError, setPage) {
    if (!email || !password || !confirmPassword) {
        return setError("Please fill in all fields.")
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
        const res = await fetch(`/api/emailcheck?email=${email}`);

        const data = await res.json()

        if (!data.exists) {
            console.log("Email is not registered. Please use a different email.")
            return setError("Email is not registered. Please use a different email.")
        }
    }

    const res = await fetch("/api/resetpassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, email  })
    })

    const data = await res.json()

    if (data.success) {
        setPage("login")
    } else {
        setError(data.message)
        console.error("Password reset failed:", data.message)
    }   
}


function ResetPassword({ setPage }) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    
    return (
        <div className="restpwd-container">
            <h2>Reset Password</h2>

            {error && <ErrorPopup message={error} />}

            <div className="restpwd-feature">
                <label>Email:</label>
                <input onChange={(event) => setEmail(event.target.value)} />
            </div>

            <div className="restpwd-feature">
                <label>New Password:</label>
                <input type="password" onChange={(event) => setPassword(event.target.value)} />
            </div>

            <div className="restpwd-feature">
                <label>Confirm New Password:</label>
                <input type="password" onChange={(event) => setConfirmPassword(event.target.value)} />
            </div>

            <button onClick={() => handleResetPassword(email, password, confirmPassword, setError, setPage)}>Reset Password</button>
        </div>
    )
}
export default ResetPassword