export function TopNavbar({ setPage }) {
  const goHome = () => setPage("home");
  const goSettings = () => setPage("settings");
  const goLogin = () => setPage("login");

  if (localStorage.getItem("userID")) {
    return (
      <div className="navbar">
        <div className="navbar-left">
          <button onClick={goHome}>Home</button>
        </div>
        
        <h1 className="logo">Tutor-GPT</h1>
        
        <div className="navbar-right">
          <button onClick={goSettings}>Settings</button>
        </div>
      </div>
    )
  }

  return (
    <div className="navbar">
      <div className="navbar-left">
        <button onClick={goHome}>Home</button>
      </div>
      
      <h1 className="logo">Tutor-GPT</h1>
      
      <div className="navbar-right">
        <button onClick={goSettings}>Settings</button>
        <button onClick={goLogin}>Login</button>
      </div>
    </div>
  )
};