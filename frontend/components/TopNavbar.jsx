import {HouseIcon, SettingsIcon, LoginIcon} from "./Icons";

export default function TopNavbar({ setPage }) {
  const goHome = () => setPage("home");
  const goSettings = () => setPage("settings");
  const goLogin = () => setPage("login");

  if (localStorage.getItem("userID")) {
    return (
      <div className="navbar">
        <div className="navbar-left">
          <button className='navbar-btns navbar-home' 
            onClick={goHome}>
            <HouseIcon/>
          </button>
        </div>
        
        <h1 className="logo">Tutor-GPT</h1>
        
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
      
      <h1 className="logo">Tutor-GPT</h1>
      
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