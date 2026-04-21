import { useState } from "react"
import "./App.css"

// Components
import { TopNavbar } from "../components/TopNavbar.jsx"
import { Sidebar } from "../components/SideNavbar.jsx"

// Pages
import Home from "../pages/Home.jsx"
import Settings from "../pages/Settings.jsx"
import Login from "../pages/Login.jsx"
import Signup from "../pages/Signup.jsx"
import ResetPassword from "../pages/ResetPwd.jsx"
import NewChat from "../pages/NewChat.jsx"
import ContinueChat from "../pages/ContinueChat.jsx"

function App() {
  const [page, setPage] = useState("home")
  // const [message, setMessage] = useState("message")


  if (page === "chat") {
    return (
      <div className="chat-layout">
        <Sidebar setPage={setPage} />
        <div className="chat-main">
          <Chat />
        </div>
      </div>
    )
  }


  return (
    <>
      <TopNavbar setPage={setPage} />

      {page === "home" && <Home setPage={setPage} />}
      {page === "settings" && <Settings />}
      {page === "login" && <Login setPage={setPage} />}
      {page === "signup" && <Signup setPage={setPage} />}
      {page === "resetpwd" && <ResetPassword setPage={setPage} />}
      {page === "newchat" && <NewChat  />}
      {page === "continuechat" && <ContinueChat  />}
    </>
  )
}

export default App