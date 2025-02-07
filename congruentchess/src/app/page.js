"use client"
import Image from "next/image";
import styles from "./page.module.css";
import ChessBoard from "./components/ChessBoard/chessBoard";
import ChatComponent from "./components/ChessBoard/chatComponent";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <ChessBoard />
        <ChatComponent />
      </main>
      <footer className={styles.footer}>
        <p>Footer</p>
      </footer>
    </div>
  );
}
