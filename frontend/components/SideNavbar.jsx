 export function Sidebar({ setPage }) {
  return (
    <div style={{ width: "200px" }}>
      <button onClick={() => setPage("home")}>Home</button>
      <button onClick={() => setPage("settings")}>Settings</button>
    </div>
  )
}
