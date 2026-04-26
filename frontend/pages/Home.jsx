import { useState, useEffect } from "react";

async function fetchChats() {
    const res = await fetch(`/api/retrievechats?user_id=${localStorage.getItem("userID")}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })
    const data = await res.json()

    console.log("chats:", data.chats)

    return data.chats;
}

async function fetchTempChats() {
    const res = await fetch(`/api/retrievetempchats?tempChatID=${localStorage.getItem("tempChatID")}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })
    const data = await res.json()

    console.log("tempChats:", data.tempChats)

    return data.tempChats;
}  

async function loadChats(setChats) {
    console.log("loadChats called")
    if (!localStorage.getItem("userID") && localStorage.getItem("tempChatID")) {
        const chats = await fetchTempChats();
        console.log("fetched chats:", chats)
        setChats(chats || []);
    } else if (localStorage.getItem("userID")) {
        const chats = await fetchChats();
        console.log("fetched chats:", chats)
        setChats(chats || []);
    } else {
        setChats([]);
    }
}

async function deleteChat(chatSessionID, setChats) {
    console.log("deleteChat called", chatSessionID)
    
    if (!localStorage.getItem("userID")) {
        const res = await fetch("/api/deletetempchat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tempChatID: chatSessionID })
        })
        const data = await res.json()
        if (data.success) {
            loadChats(setChats)
            return;
        }
    }

    const res = await fetch("/api/deletechat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatSessionID })
    })
    const data = await res.json()

    if (data.success) {
        loadChats(setChats)
    }
}


function Home({ setPage }) {
    const [chats, setChats] = useState([]);

    useEffect(() => {
        loadChats(setChats);
    }, []);

    if (chats.length > 0) {
        const chatLists = [];
        for (let i = 0; i < chats.length; i++) {
            chatLists.push(
                <div key={i} className="chat-item">
                    <button className="btn-selections" 
                        onClick={() => {
                            localStorage.setItem("chatSessionID", chats[i][0]);
                            setPage("continuechat");
                        }}>
                        Continue Chat: {chats[i][1]}
                    </button>
                    <button 
                    onClick={() => {
                        console.log("delete clicked", chats[i][0]) 
                        deleteChat(chats[i][0], setChats)}}>Delete</button>
                </div>
            );
        }

        console.log("chatLists:", chatLists)

        if (localStorage.getItem("username")) {
            return (
                <div>
                    <h2>Welcombe back {localStorage.getItem("username")}!</h2>
                    <button className="btn-selections" onClick={() => setPage("newchatinfo")}>+</button>
                    {chatLists}
                </div>
            );
        } else {
            return (
                <div>
                    <h2>Welcome back!</h2>
                    <button className="btn-selections" onClick={() => setPage("newchatinfo")}>+</button>
                    {chatLists}
                </div>
            );
        }
    }

    return (
    <div>
        <h2>Start a Conversation!</h2>
        <button className="btn-selections" onClick={() => setPage("newchatinfo")}>+</button>
    </div>
    );
}


export default Home 