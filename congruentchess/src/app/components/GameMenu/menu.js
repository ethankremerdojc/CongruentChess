"use client"
import React, { useState } from "react";
import { API } from "./api";


export default function Menu({userID, openGameView}) {

    const [games, setGames] = useState("INIT");
    
    if (games == "INIT") {
        API.getGames().then((data) => {
            setGames(data);
        });
    }

    const createGame = () => {
        API.startGame(userID).then((data) => {
            openGameView(data.game_id)
        });
    }

    const joinGame = (gameID) => {
        openGameView(gameID, true);
    }

    return (
        <div>
            <h1>Menu</h1>
            <button onClick={createGame}>Create Game</button>

            <ol>
                { games.length > 0 && games !== "INIT" && games.map((game) => {
                    return (
                        <li key={game.game_id}>
                            <button onClick={() => joinGame(game.game_id)}>
                                Join Game {game.game_id}
                            </button>
                        </li>
                    );
                })
            }
            </ol>
        </div>
    );
}