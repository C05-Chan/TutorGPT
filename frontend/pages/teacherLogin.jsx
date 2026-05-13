import { useState } from "react"
import ErrorPopup from "../components/ErrorMessage.jsx"
import { getUserInfo } from "../utility.jsx"

async function handleLogin(email, password, setError, setPage) {
    
//This function checks for missing details? data? when trying to log in and checks if the user can log in, also sends an error message if user cant log in 
    const isTeacher = true
    
    if (!email || !password) {
        setError("Please fill all fields.")
        return;
    }
    const emailCheck = email.toLowerCase()
    
        const res = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: emailCheck, password, isTeacher})
        })

        const data = await res.json()

        if (data.success) {
            await getUserInfo(emailCheck, true)
            setPage("teacherdashboard")

        } else {
            setError("Unable to Login. Please check details")
            console.error("Login failed:", data.message)
        }
    }

function TeacherLogin({ setPage }) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")

    return (
        <div className="login-container">
            <h2>Teacher's Login</h2>

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
                <p>Forgotten Password?</p>
                <button onClick={() => setPage("resetpwd")}>Reset Password</button>
            </div>
        </div>
    )
}

export default TeacherLogin