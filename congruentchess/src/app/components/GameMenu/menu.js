"use client"
import React, { useState, useEffect } from "react";
import useWebSocket from "@/app/hooks/useWebsocket";
import { SERVER_URL } from '@/app/components/ChessBoard/config';


export default function Menu() {

    const { messages, sendMessage } = useWebSocket(`ws://${SERVER_URL}:8000/ws`);

    useEffect(() => {
        const latestMessage = messages[messages.length - 1];
        if (latestMessage == undefined) {return}

        if (latestMessage.includes("NEWGAME")) {
            console.log("New game started")
        }
    },[messages])

    const createGame = () => {
        console.log("Creating game")
        sendMessage("NEWGAME|15sec");
    }

    return (
        <div>
            <h1>Menu</h1>
            <button onClick={createGame}>Create Game</button>
        </div>
    );
}