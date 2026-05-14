import { useState, useEffect } from "react"
import "./App.css"
import { applySettingsOnLoad } from "./applySettings"

// Components
import TopNavbar from "../components/TopNavbar.jsx"

// Pages
import Home from "../pages/Home.jsx"
import Settings from "../pages/Settings.jsx"
import Login from "../pages/Login.jsx"
import Signup from "../pages/Signup.jsx"
import ResetPassword from "../pages/ResetPwd.jsx"
import NewChatInfo from "../pages/NewChatInfo.jsx"
import ChatView from "../pages/ChatPage.jsx"

function App() {
  const [page, setPage] = useState("home") // tracks which page is currently displayed

  useEffect(() => {
    // applies the user's saved visual settings as soon as the app loads
    const displayMode = localStorage.getItem("displayMode") || "Light"
    const displayTextSize = localStorage.getItem("displayTextSize") || "Medium"
    const displayFontStyle = localStorage.getItem("displayFontStyle") || "Arial"
    applySettingsOnLoad(displayMode, displayTextSize, displayFontStyle)
  }, [])

  return (
    <>
      <TopNavbar setPage={setPage} />

      {/* conditionally renders the current page based on the page state */}
      {page === "home" && <Home setPage={setPage} />}
      {page === "settings" && <Settings setPage={setPage} />}
      {page === "login" && <Login setPage={setPage} />}
      {page === "signup" && <Signup setPage={setPage} />}
      {page === "resetpwd" && <ResetPassword setPage={setPage} />}
      {page === "newchatinfo"  && <NewChatInfo setPage={setPage} />}
      {page === "newchat" && <ChatView isContinuedChat={false} />}
      {page === "continuechat" && <ChatView isContinuedChat={true}/>}
    </>
  )
}

export default App