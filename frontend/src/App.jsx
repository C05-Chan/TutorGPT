import { useState } from "react"
import "./App.css"

// Components
import { TopNavbar } from "../components/TopNavbar.jsx"
import { Sidebar } from "../components/SideNavbar.jsx"

// Pages
import Home from "../pages/Home.jsx"
import Chat from "../pages/NewChat.jsx"
import Settings from "../pages/Settings.jsx"
import ChatSelection from "../pages/ChatSelection.jsx"
import Login from "../pages/Login.jsx"

function App() {
  const [page, setPage] = useState("home")
  const [message, setMessage] = useState("")

  const sendMessage = async () => {
    const res = await fetch("/api/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: message }),
    })

    const data = await res.json()
    console.log(data)
    setMessage("")
  }

  if (page === "chat") {
    return (
      <div className="chat-layout">
        <Sidebar setPage={setPage} />
        <div className="chat-main">
          <Chat />
          <input value={message} onChange={(e) => setMessage(e.target.value)} />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    )
  }


  return (
    <>
      <TopNavbar setPage={setPage} />

      {page === "home" && <Home />}
      {page === "settings" && <Settings />}
      {page === "chatselect" && <ChatSelection />}
      {page === "login" && <Login />}
    </>
  )
}

export default App