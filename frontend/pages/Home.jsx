import { useState, useEffect } from "react";

async function fetchChats() {
    const res = await fetch(`/api/chats?user_id=${localStorage.getItem("userID")}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })
    const data = await res.json()

    console.log("chats:", data.chats)

    return data.chats;
}

async function fetchTempChats() {
    const res = await fetch(`/api/tempchats?tempChatID=${localStorage.getItem("tempChatID")}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })
    const data = await res.json()

    console.log("tempChats:", data.tempChats)

    return data.tempChats;
}  

async function loadChats(setChats) {
    if (!localStorage.getItem("userID") && localStorage.getItem("tempChatID")) {
        const chats = await fetchTempChats();
        setChats(chats || []);
    } else if (localStorage.getItem("userID")) {
        const chats = await fetchChats();
        setChats(chats || []);
    } else {
        setChats([]);
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
                <button key={i} className="btn-selections" 
                onClick={() => {
                    localStorage.setItem("chatSessionID", chats[i][0]);
                    setPage("continuechat");
                }}>Continue Chat: {chats[i][1]}</button>
            );
        }

        console.log("chatLists:", chatLists)

        return (
            <div>
                <h2>Hello {localStorage.getItem("username")}!</h2>
                <button className="btn-selections" onClick={() => setPage("newchatinfo")}>+</button>
                {chatLists}
            </div>
        );
    }

    return (
    <div>
        <h2>Start a Conversation!</h2>
        <button className="btn-selections" onClick={() => setPage("newchatinfo")}>+</button>
    </div>
    );
}


export default Home 