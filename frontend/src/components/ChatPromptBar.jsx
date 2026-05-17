import { useState } from "react"
import ErrorPopup from "../components/ErrorMessage.jsx"
import { SendIcon } from "./Icons.jsx"

async function handlePrompt(prompt, setError, timer, setLastSubmit, setPrompt, messages, setMessage) {

    // This function handles the prompt that is sent by validating in the input, check character amount and time limit before sending it to the server to be processed

    let submitTime = Date.now()

    if (!prompt) {
        return setError("Please enter a prompt.")

    } else if (prompt.length > 100) {
        return setError("Prompt is too long. Please enter a prompt less than 100 characters.")

    } else if (timer && submitTime - timer < 30000) { // This checks if last prompt was sent less than 30 seconds ago.
        /// 60000 for a minute 
        const secondsLeft = Math.floor((30000 - (submitTime - timer)) / 1000) // this calculates how many seconds left before user can send another prompt
        return setError(`Please wait ${secondsLeft} seconds before sending another prompt.`)

    } else {
        setError("")
    }

    const newMessages = [...messages] // stored previous messages
    newMessages.push([null, "User", prompt, null])  // added user's prompt into the messages for display

    setMessage(newMessages)
    setPrompt("")
    setLastSubmit(submitTime) // sets the submitTime

    const responseLength = localStorage.getItem("responseLength")
    
    if (localStorage.getItem("userID")) {
        const res = await fetch("/api/submitloggedprompt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, chatSessionID: localStorage.getItem("chatSessionID"), responseLength: responseLength })
        })

        const data = await res.json()

        if (data.success) {
            console.log("Prompt submitted successfully:", prompt)
            
            const newMessagesAndResponse = [...newMessages] // stored previous messages including the users' prompt
            newMessagesAndResponse.push([data.messageID, "TutorGPT", data.message, data.confidence, data.confidenceReason])

            setMessage(newMessagesAndResponse)
            // setLastSubmit(Date.now())
        } else {
            // pushes a placeholder ai message so the pairing logic always has a response for every user message
            const newMessagesAndResponse = [...newMessages]
            newMessagesAndResponse.push([null, "TutorGPT", "TutorGPT is unable to answer you right now. Please try again.", "10", null])
            setMessage(newMessagesAndResponse)
        }
    } else {
        const res = await fetch("/api/submitunloggedprompt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, tempChatSessionID: localStorage.getItem("tempChatSessionID"), responseLength: responseLength })
        })

        const data = await res.json()

        if (data.success) {
            console.log("Prompt submitted successfully:", prompt)
            // console.log(data.message)

            const newMessagesAndResponse = [...newMessages]
            newMessagesAndResponse.push([data.messageID, "TutorGPT", data.message, data.confidence, data.confidenceReason])
 // adds AI response to message list

            setMessage(newMessagesAndResponse) // sets the new messages with the response
            // setLastSubmit(Date.now())
        } else {
            // pushes a placeholder ai message so the pairing logic always has a response for every user message
            const newMessagesAndResponse = [...newMessages]
            newMessagesAndResponse.push([null, "TutorGPT", "TutorGPT is unable to answer you right now. Please try again.", "10", null])
            setMessage(newMessagesAndResponse)
        }
    }
}

export default function ChatPromptBar({messages, setMessage}) {

    // This is a input box where the user can type in a prompt to send to the ai service
    
    // hook components which re-renders the component with the new value to update UI
    const [prompt, setPrompt] = useState("") 
    const [error, setError] = useState("")
    const [lastSubmit, setLastSubmit] = useState(null)

    return (
        <div className="chat-prompt-container">
            <div className="chat-prompt-bar">
                {/* the prompt bar where the user inputs topic */}
                <input
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    placeholder="Enter your question or topic here..."
                    onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === "Return") {
                            handlePrompt(prompt, setError, lastSubmit, setLastSubmit, setPrompt, messages, setMessage)
                        } // this allows user to send the prompt by just hitting enter/ return on keyboard
                    }}
                />
                <button onClick={() => handlePrompt(prompt, setError, lastSubmit, setLastSubmit, setPrompt, messages, setMessage)}><SendIcon/></button>
            </div>
            <div className="chat-prompt-checker">

                {/* This shows the user how many characters their prompt is */}
                <p>{prompt.length}/100 </p> 
                

                {error && <ErrorPopup message={error} />}
            </div>
        </div>
    )
}