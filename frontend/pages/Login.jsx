import { useState } from "react"
import ErrorPopup from "../components/ErrorMessage.jsx"
import { localStorageSettingsLoader, getUserInfo } from "../utility.jsx"


async function handleLogin(email, password, setError, setPage) {
    if (!email || !password) {
        setError("Please fill all fields.")
        return;
    }
    const emailCheck = email.toLowerCase()
    
        const res = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: emailCheck, password })
        })

        const data = await res.json()

        if (data.success) {
            const userID = await getUserInfo(emailCheck)
            await localStorageSettingsLoader(userID)
            setPage("home")

        } else {
            setError("Unable to Login. Please check details")
            console.error("Login failed:", data.message)
        }
    }

function Login({ setPage }) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")


    return (
        <div className="login-container">
            <h2>Login</h2>

            {error && <ErrorPopup message={error} />}

            <div className="login-feature">
                <label>Email:</label>
                <input onChange={(event) => setEmail(event.target.value)} />
            </div>

            <div className="login-feature">
                <label>Password:</label>
                <input type="password" onChange={(event) => setPassword(event.target.value)} />
            </div>

            <button onClick={() => handleLogin(email, password, setError, setPage)}>Login</button>

            <div className="login-feature">
                <p>Don't have an account?</p>
                <button onClick={() => setPage("signup")}>Sign Up</button>
            </div>

            <div className="login-feature">
                <p>Forgotten Password?</p>
                <button onClick={() => setPage("resetpwd")}>Reset Password</button>
            </div>
        </div>
    )
}

export default Login