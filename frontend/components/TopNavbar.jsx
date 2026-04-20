export function TopNavbar({ setPage }) {
  const goHome = () => setPage("home");
  const goChat = () => setPage("settings");
  const goLogin = () => setPage("login");

  return (
    <div>
      <button className="Home" onClick={goHome}>Home</button>
      <button className="Settings" onClick={goChat}>Settings </button>
      <button className="Login" onClick={goLogin}>Login</button>
    </div>
  );
}