"use client"
import React, { useState } from "react";
import styles from "./page.module.css";
import ChessBoard from "./components/ChessBoard/chessBoard";
import Menu from "./components/GameMenu/menu";

export default function Home() {
  const [userID, _setUserId] = useState(Math.floor(Math.random() * 1000000000000));
  const [view, setView] = useState("menu");

  const [isJoiningGame, setIsJoiningGame] = useState(false);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {view === "game" && <ChessBoard userID={userID} isJoiningGame={isJoiningGame} />}
        {view === "menu" && <Menu userID={userID} openGameView={ (gameID, isJoining=false) => {
          // set the hash of the page to gameID
          window.location.hash = gameID;
          setIsJoiningGame(isJoining);
          setView("game");
        } }  />}
      </main>
      <footer className={styles.footer}>
        <p>Footer</p>
      </footer>
    </div>
  );
}
