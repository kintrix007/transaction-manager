"use client";

import { useState } from "react";

let id = 0;

type Transaction = {
    id: number;
    title: string;
    amount: string;
};

function TransactionItem({ title, amount, onClick }: Transaction & { onClick: () => void }) {
    return <li><a onClick={onClick}>
        <div>{title}</div>
        <div>€{amount}</div>
    </a></li>;
}

function TransactionForm({ onAdd }: { onAdd: (title: string, amount: string) => void }) {
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState(0);

    return <form>
        <label htmlFor="title">Name:
            <input value={title} onChange={e => setTitle(e.target.value)}
                type="text" name="title" placeholder="Title" />
        </label>
        <label htmlFor="amount">€
            <input value={amount} onChange={e => setAmount(e.target.value)}
                type="number" name="amount" placeholder="Amount" />
        </label>
        <button type="submit" onClick={(ev) => {
            ev.preventDefault();
            onAdd(title, amount.toString());
            setTitle("");
            setAmount(0);
        }}>Add</button>
    </form>;
}

export default function About() {
    const [transactions, setTransactions] = useState<Transaction[]>([
        { id: id++, title: "Food", amount: "10.0" },
        { id: id++, title: "Groceries", amount: "20.0" },
        { id: id++, title: "Entertainment", amount: "30.0" },
        { id: id++, title: "Idx", amount: "40.0" },
    ]);

    function addTransaction(title: string, amount: string) {
        setTransactions(oldTransactions => {
            const newTransaction = { id: id++, title, amount };
            return [...oldTransactions, newTransaction];
        });
    }

    function removeTransaction(id: number) {
        setTransactions(oldTransactions => {
            const newTransactions = oldTransactions.filter(t => t.id !== id);
            console.log(newTransactions);
            return newTransactions;
        });
    }

    // I do realize working with floats is a terrible idea for precise values,
    // espectiall when it comes when it comes to currencies.
    // But a the same time, for this demo it is fine. 
    // (Might change my mind later)
    return <>
        <div>
            €{transactions.map(t => t.amount).reduce((a, b) => parseFloat(a) + parseFloat(b), 0)}
        </div>

        <TransactionForm onAdd={addTransaction} />

        <div>
            Past transactions
            <ul>
                {transactions.map(t =>
                    <TransactionItem key={t.id} onClick={() => removeTransaction(t.id)} {...t} />)}
            </ul>
        </div >
    </>;
}
