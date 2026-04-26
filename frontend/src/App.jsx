import { useState, useEffect } from "react"
import "./App.css"

// Components
import TopNavbar from "../components/TopNavbar.jsx"

// Pages
import Home from "../pages/Home.jsx"
import Settings from "../pages/Settings.jsx"
import Login from "../pages/Login.jsx"
import Signup from "../pages/Signup.jsx"
import ResetPassword from "../pages/ResetPwd.jsx"
import NewChatInfo from "../pages/NewChatInfo.jsx"
import NewChat from "../pages/NewChat.jsx"
import ContinueChat from "../pages/ContinueChat.jsx"

function App() {
  const [page, setPage] = useState("home")
  // const [message, setMessage] = useState("message")


  return (
    <>
      <TopNavbar setPage={setPage} />

      {page === "home" && <Home setPage={setPage} />}
      {page === "settings" && <Settings setPage={setPage} />}
      {page === "login" && <Login setPage={setPage} />}
      {page === "signup" && <Signup setPage={setPage} />}
      {page === "resetpwd" && <ResetPassword setPage={setPage} />}
      {page === "newchatinfo" && <NewChatInfo setPage={setPage} />}
      {page === "continuechat" && <ContinueChat  />}
      {page === "newchat" && <NewChat  />}
    </>
  )
}

export default App