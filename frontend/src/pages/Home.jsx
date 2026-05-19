import { useState, useEffect } from "react";
import { TrashIcon }from "../components/Icons.jsx";

async function fetchChats() {

    // This function fetches all chats associated with the loggedin user  

    const res = await fetch(`/api/getchats?user_id=${localStorage.getItem("userID")}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })
    const data = await res.json()

    console.log("chats:", data.chats)

    return data.chats;
}

async function fetchTempChats() {   
    
    // This function fetches a temporary chat for a guest user 
    const res = await fetch(`/api/gettempchatinfo?tempChatSessionID=${localStorage.getItem("tempChatSessionID")}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })
    const data = await res.json()

    console.log("tempChats:", data.tempChats)

    return data.tempChats;
}  

async function loadChats(setChats) {


    if (!localStorage.getItem("userID") && localStorage.getItem("tempChatSessionID")) {
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
    
    // This function deletes the chat and refreshes it 
    
    console.log("deleteChat called", chatSessionID)
    
    if (!localStorage.getItem("userID")) {
        const res = await fetch("/api/deletetempchat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tempChatSessionID: chatSessionID })
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
                <div key={i} className="home-card home-card-chat">

                    <button className="home-card-body" 
                        onClick={() => {
                            localStorage.setItem("chatSessionID", chats[i][0]);
                            setPage("continuechat");
                        }}>
                        <span className="home-card-title">Continue Chat: {chats[i][1]}</span>
                    </button>

                    <button className="home-card-delete"
                        onClick={() => {
                            console.log("delete clicked", chats[i][0]) 
                            deleteChat(chats[i][0], setChats)
                        }}>
                        <TrashIcon/>
                    </button>

                </div>
            );
        }

        console.log("chatLists:", chatLists)

        if (localStorage.getItem("username")) {
            const username = localStorage.getItem("username")
            return (
                <div className="home-container">
                    <h2 className="home-title">Welcome back, {username}!</h2>
                    <div className="home-grid">
                        <button className="home-card home-card-new" 
                            onClick={() => 
                                setPage("newchatinfo")
                            }>
                            <span className="home-card-newTitle">+</span>
                        </button>
                        {chatLists}
                    </div>
                </div>
            );
        } else {
            return (
                <div className="home-container">
                    <div className="home-grid">
                        <button className="home-card home-card-new" 
                            onClick={() => 
                                setPage("newchatinfo")
                            }>
                            <span className="home-card-newTitle">+</span>
                        </button>
                        {chatLists}
                    </div>
                </div>
            );
        }
    }

    return (
        <div className="home-container">
            <div className="home-grid">
                <button className="home-card home-card-new" 
                    onClick={() => 
                        setPage("newchatinfo")
                    }>
                    <span className="home-card-newTitle">+</span>
                </button>
            </div>
        </div>
    );
}


export default Home 