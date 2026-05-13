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
import NewChat from "../pages/NewChat.jsx"
import ContinueChat from "../pages/ContinueChat.jsx"
import TeacherLogin from "../pages/teacherLogin.jsx"
import Dashboard from "../pages/teacherDashboard.jsx"
import TeacherChat from "../pages/teacherChat.jsx"


function App() {
  const [page, setPage] = useState("home")

  // Apply the user's saved visual settings as soon as the app loads
  useEffect(() => {
    const displayMode = localStorage.getItem("displayMode") || "Light"
    const displayTextSize = localStorage.getItem("displayTextSize") || "Medium"
    const displayFontStyle = localStorage.getItem("displayFontStyle") || "Arial"
    applySettingsOnLoad(displayMode, displayTextSize, displayFontStyle)
  }, [])

  return (
    <>
      <TopNavbar setPage={setPage} />

      {page === "home" && <Home setPage={setPage} />}
      {page === "teacherdashboard" && <Dashboard setPage={setPage} />}
      {page === "settings" && <Settings setPage={setPage} />}
      {page === "login" && <Login setPage={setPage} />}
      {page === "teacherlogin" && <TeacherLogin setPage={setPage} />}
      {page === "signup" && <Signup setPage={setPage} />}
      {page === "resetpwd" && <ResetPassword setPage={setPage} />}
      {page === "newchatinfo"  && <NewChatInfo setPage={setPage} />}
      {page === "newchat" && <NewChat />}
      {page === "continuechat" && <ContinueChat />}
      {page === "teacherchat" && <TeacherChat setPage={setPage} />}

    </>
  )
}

export default App