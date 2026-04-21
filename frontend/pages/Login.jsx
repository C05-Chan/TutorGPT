import { useState } from "react"
import ErrorPopup from "../components/ErrorMessage.jsx"

async function handleLogin(email, password, setError, setPage) {
    
        const res = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
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
            console.error("Login failed:", data.message)
        }
    }


function Login({ setPage }) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")


    return (
    <>
        <div className="login-form">
            {error && <ErrorPopup message={error} />}
            <label>Email: </label>
            <input onChange={(event) => setEmail(event.target.value)} />
            <label>Password: </label>
            <input onChange={(event) => setPassword(event.target.value)} />
            <button onClick={() => handleLogin(email, password, setError, setPage)}>Login</button>

        </div>

        <div className="signup-link">
            <p>Don't have an account?</p> 
            <button onClick={() => setPage("signup")}>Sign Up</button>
        </div>

        <div className="resetPwd-link">
            <p>Forgotten Password?</p>
            <button onClick={() => setPage("resetpwd")}>Reset Password</button>
        </div>
    </>
)
}

export default Login