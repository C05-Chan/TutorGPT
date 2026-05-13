import { useState } from "react";
import UserSearchBar from "../components/userSearchbar.jsx";

async function searchUsers(query, teacherID) {
    const res = await fetch(
        `/api/searchusers?query=${encodeURIComponent(query)}&teacher_id=${teacherID}`,
        {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        }
    );
    const data = await res.json();
    return data.users || [];
}

async function fetchUserChats(userID) {
    const res = await fetch(`/api/getchats?user_id=${userID}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    return data.chats || [];
}

function TeacherDashboard({ setPage }) {
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [chats, setChats] = useState([]);
    const [searching, setSearching] = useState(false);
    const [loadingChats, setLoadingChats] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [lastQuery, setLastQuery] = useState("");

    async function handleSearch(query) {
        setSearching(true);
        setSelectedUser(null);
        setChats([]);
        setHasSearched(true);
        setLastQuery(query);
        const teacherID = localStorage.getItem("teacherID");
        const results = await searchUsers(query, teacherID);
        setSearchResults(results);
        setSearching(false);
    }

    async function handleSelectUser(user) {
        // user is [userID, username, email]
        setSelectedUser(user);
        setLoadingChats(true);
        const userChats = await fetchUserChats(user[0]);
        setChats(userChats);
        setLoadingChats(false);
    }

    function handleOpenChat(chatSessionID) {
        localStorage.setItem("chatSessionID", chatSessionID);
        localStorage.removeItem("tempChatSessionID");
        setPage("teacherchat");
    }

    const teacherName = localStorage.getItem("username");

    return (
        <div className="teacher-dashboard">

            <div className="dashboard-header">
                <h2>Welcome{teacherName ? `, ${teacherName}` : ""}.</h2>
                <p className="dashboard-subtitle">Search for a student to review their chats.</p>
            </div>

            <UserSearchBar onSearch={handleSearch} searching={searching} />

            {/* Search Results */}
            {hasSearched && (
                <div className="search-results-section">
                    <h3 className="section-label">Students</h3>
                    {searching ? (
                        <p className="empty-state">Searching...</p>
                    ) : searchResults.length === 0 ? (
                        <p className="empty-state">No students found for "{lastQuery}".</p>
                    ) : (
                        <div className="user-results-list">
                            {searchResults.map((user, i) => (
                                <button
                                    key={i}
                                    className={`user-result-row ${selectedUser && selectedUser[0] === user[0] ? "user-result-row--active" : ""}`}
                                    onClick={() => handleSelectUser(user)}
                                >
                                    <span className="user-result-name">{user[1]}</span>
                                    <span className="user-result-email">{user[2]}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Chats for selected user */}
            {selectedUser && (
                <div className="user-chats-section">
                    <h3 className="section-label">{selectedUser[1]}'s Chats</h3>

                    {loadingChats ? (
                        <p className="empty-state">Loading chats...</p>
                    ) : chats.length === 0 ? (
                        <p className="empty-state">This student has no chats yet.</p>
                    ) : (
                        <div className="chat-rows">
                            {chats.map((chat, i) => (
                                // chat: [chatSessionID, chatTitle, chatSubject, chatExplanationLevel, chatCreateDate]
                                <button
                                    key={i}
                                    className="chat-row"
                                    onClick={() => handleOpenChat(chat[0])}
                                >
                                    <div className="chat-row-left">
                                        <span className="chat-row-title">{chat[1]}</span>
                                        <span className="chat-row-meta">{chat[2]} · {chat[3]}</span>
                                    </div>
                                    <div className="chat-row-right">
                                        <span className="chat-row-date">
                                            {chat[4] ? new Date(chat[4]).toLocaleDateString() : ""}
                                        </span>
                                        <span className="chat-row-arrow">→</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default TeacherDashboard;