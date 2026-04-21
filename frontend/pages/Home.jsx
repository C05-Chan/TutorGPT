import { useState, useEffect } from "react";

function Home({ setPage }) {
    const [chats, setChats] = useState([]);

    useEffect(() => {
        async function load() {
            const data = await fetchChats();
            setChats(data);
        }
        load();
    }, []);

    if (localStorage.getItem("userID")) {
        const buttons = [];
        for (let i = 0; i < chats.length; i++) {
            buttons.push(
                <button className="btn-selections" onClick={() => setPage("continuechat")}>
                    {chats[i].chatTitle}
                </button>
            );
        }

        return (
            <div>
                <h2>Hello {localStorage.getItem("username")}!</h2>
                <button className="btn-selections" onClick={() => setPage("newchat")}>
                    +
                </button>
                {buttons}
            </div>
        );
    }

        

    return (
    <div>
        <h2>Start a Conversation!</h2>
        <button className="btn-selections" onClick={() => setPage("newchat")}>
            +
        </button>

    </div>
    );
}

async function fetchChats() {
    let chats = [];

    const res = await fetch(`/api/chats?user_id=${localStorage.getItem("userID")}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        })
    const data = await res.json()
    chats = data.chats

    console.log("chats:", chats)

    return chats
}



export default Home 