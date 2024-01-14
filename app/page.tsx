import { ReactNode } from "react";
import TransactionList from "@/components/transactionList";
import Link from "next/link";
import styles from "./page.module.scss";

function Panel({ children }: { children: ReactNode }) {
    return <div className={styles.panel}>{children}</div>;
}

function MainContent({ children }: { children: ReactNode }) {
    return <main className={styles.mainContent}>{children}</main>;
}

function Header() {
    return <header className={styles.mainHeader}>
        <h1>Transaction Manager</h1>
        <nav className={styles.navbar}>
            <ul>
                <li className={styles.active}>
                    <Link href="/">Transactions</Link>
                </li>
                <li>
                    <Link href="/about">About</Link>
                </li>
            </ul>
        </nav>
    </header>
}

export default function App() {
    return (
        <>
            <Header />

            <MainContent>
                <Panel>
                    <TransactionList />
                </Panel>
            </MainContent>
        </>
    );
}
