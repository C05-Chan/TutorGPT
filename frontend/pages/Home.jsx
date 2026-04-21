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

async function loadChats(setChats) {
    const chats = await fetchChats();
    setChats(chats);
}

function Home({ setPage }) {
    const [chats, setChats] = useState([]);

    useEffect(() => {loadChats(setChats);}, []);

    if (localStorage.getItem("userID")) {
        const chatLists = [];
        for (let i = 0; i < chats.length; i++) {
            chatLists.push(
                <button key={i} className="btn-selections" onClick={() => setPage("continuechat")}>{chats[i][1]}</button>
            );
        }

        console.log("chatLists:", chatLists)

        return (
            <div>
                <h2>Hello {localStorage.getItem("username")}!</h2>
                <button className="btn-selections" onClick={() => setPage("newchat")}>+</button>
                {chatLists}
            </div>
        );
    }

    return (
    <div>
        <h2>Start a Conversation!</h2>
        <button className="btn-selections" onClick={() => setPage("newchat")}>+</button>
    </div>
    );
}


export default Home 