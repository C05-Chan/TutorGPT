import { useState } from "react"
import ErrorPopup from "../components/ErrorMessage.jsx"
import useLogin from "../hooks/useLogin.jsx"

function Login({ setPage }) {
    //Login Page

    // hook components
    // these components stores the value and when some is "set"  (e.g setEmail) it rerenders the UI.

    const [email, setEmail] = useState("") 
    const [password, setPassword] = useState("")
    const { login, error } = useLogin(setPage) // calls the custome hook

    return (
        <div className="login-container">
            <h2>Login</h2>

            {/* this checks if there is an error and if there is an error, it shows error message */}
            {error && <ErrorPopup message={error} />} 

            <div className="login-feature">
                <label htmlFor="email">Email:</label>
                <input id="email" onChange={(event) => setEmail(event.target.value)} />
            </div>

            <div className="login-feature">
                <label htmlFor="password">Password:</label>
                <input  id="password" type="password" onChange={(event) => setPassword(event.target.value)} />
            </div>

            <button onClick={() => login(email, password)}>Login</button>

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