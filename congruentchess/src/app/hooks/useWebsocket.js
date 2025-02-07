import { useEffect, useState } from "react";

const useWebSocket = (url) => {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const ws = new WebSocket(url);

        ws.onopen = () => {
            console.log("Connected to WebSocket");
        };

        ws.onmessage = (event) => {
            setMessages((prevMessages) => [...prevMessages, event.data]);
        };

        ws.onclose = () => {
            console.log("WebSocket disconnected, attempting to reconnect...");
            setTimeout(() => setSocket(new WebSocket(url)), 3000);
        };

        setSocket(ws);

        return () => ws.close();
    }, [url]);

    const sendMessage = (message) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(message);
        }
    };

    return { messages, sendMessage };
};

export default useWebSocket;