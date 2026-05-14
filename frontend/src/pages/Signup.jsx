import { useState } from "react"
import ErrorPopup from "../components/ErrorMessage.jsx"
import useSignup from "../hooks/useSignup.jsx"


function Signup({ setPage }) {
    //Signup Page

    // hook components
    // these components stores the value and when some is "set"  (e.g setEmail) it rerenders the UI.

    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const { signup, error } = useSignup(setPage)

    return (
        <div className="signup-container">
            <h2>Sign Up</h2>
            
            {/* this checks if there is an error and if there is an error, it shows error message */}
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

            <button onClick={() => signup(username, email, password, confirmPassword)}>Sign Up</button>

            <div className="signup-feature">
                <p>Already have an account?</p>
                <button onClick={() => setPage("login")}>Login</button>
            </div>
        </div>
    )
}

export default Signup