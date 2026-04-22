import { useState } from "react"
import ChatPromptBar from "../components/ChatPromptBar"

function NewChat() {
  const [prompt, setPrompt] = useState("")

  return (
    <div className="new-chat-container">
      <h2>New Chat</h2>
      <ChatPromptBar prompt={prompt} setPrompt={setPrompt} />
    </div>
  )
}

export default NewChat