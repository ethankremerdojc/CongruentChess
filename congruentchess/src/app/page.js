"use client"
import React, { useState } from "react";
import Image from "next/image";
import styles from "./page.module.css";
import ChessBoard from "./components/ChessBoard/chessBoard";
import ChatComponent from "./components/ChessBoard/chatComponent";
import Menu from "./components/GameMenu/menu";

export default function Home() {

  `
  Display a list of open games and their time formats for users to select and join.
  `

  const [view, setView] = useState("menu");

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {view === "game" && <ChessBoard />}
        {view === "menu" && <Menu />}
      </main>
      <footer className={styles.footer}>
        <p>Footer</p>
      </footer>
    </div>
  );
}
