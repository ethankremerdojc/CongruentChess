import { useState } from "react";
import useWebSocket from "/src/app/hooks/useWebSocket";

const ChatComponent = () => {
    const { messages, sendMessage } = useWebSocket("ws://localhost:8000/ws");
    const [message, setMessage] = useState("");

    const handleSend = () => {
        if (message.trim() !== "") {
            sendMessage(message);
            setMessage("");
        }
    };

    return (
        <div style={{ maxWidth: "500px", margin: "auto", textAlign: "center" }}>
            <h2>FastAPI WebSocket Chat</h2>
            <div style={{
                border: "1px solid #ddd",
                padding: "10px",
                height: "300px",
                overflowY: "auto",
                marginBottom: "10px"
            }}>
                {messages.map((msg, index) => (
                    <p key={index} style={{ textAlign: "left" }}>{msg}</p>
                ))}
            </div>
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                style={{ padding: "10px", width: "70%" }}
            />
            <button onClick={handleSend} style={{ padding: "10px" }}>Send</button>
        </div>
    );
};

export default ChatComponent;