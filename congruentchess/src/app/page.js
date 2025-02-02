import Image from "next/image";
import styles from "./page.module.css";
import ChessBoard from "./components/ChessBoard/chessBoard";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <ChessBoard />
      </main>
      <footer className={styles.footer}>
        <p>Footer</p>
      </footer>
    </div>
  );
}
