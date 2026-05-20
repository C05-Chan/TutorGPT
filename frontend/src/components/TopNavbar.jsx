import {HouseIcon, SettingsIcon, LoginIcon} from "./Icons"; // import icons

export default function TopNavbar({ setPage }) {

  // This is the top navigation bar 

  const goHome = () => setPage("home"); // redirect to home page
  const goSettings = () => setPage("settings"); // redirect to settings page
  const goLogin = () => setPage("login"); // redirect to login page

  if (localStorage.getItem("userID")) { // checks if the user is logged in --> if they are they do not have the login icon
    return (
      <div className="navbar">
        <div className="navbar-left">
          <button className='navbar-btns navbar-home' 
            onClick={goHome}> 
            <HouseIcon/> {/* This makes the button use an icon */}
          </button>
        </div>
        
        <h1 className="logo">TutorGPT</h1>
        
        <div className="navbar-right">

          <button className='navbar-btns navbar-settings'
            onClick={goSettings}>
            <SettingsIcon/>
          </button>

        </div>
      </div>
    )
  }

  return (
    <div className="navbar">
      <div className="navbar-left">

          <button className='navbar-btns navbar-home'  
            onClick={goHome}>
            <HouseIcon/>
          </button>

      </div>
      
      <h1 className="logo">TutorGPT</h1>
      
      <div className="navbar-right">

          <button className='navbar-btns navbar-settings'
            onClick={goSettings}>
            <SettingsIcon/>
          </button>

          <button className='navbar-btns navbar-settings'
            onClick={goLogin}>
            <LoginIcon/>
          </button>

      </div>
    </div>
  )
};