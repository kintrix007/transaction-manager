import { useState } from "react";
import styles from "./transaction.module.scss";
import { Transaction } from "./transaction";

function getCurrentDateString() {
    return new Date().toISOString().split("T")[0]!
}

export function TransactionForm({ onAdd }: { onAdd: (obj: Omit<Transaction, "id">) => void }) {
    const [amount, setAmount] = useState("0.00");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState(getCurrentDateString());

    console.log({ date });

    return <form className={styles.transactionForm}>
        <h3>Add a new transaction</h3>
        <label htmlFor="amount">* Total:
            <input className={styles.foo} value={amount} onChange={e => setAmount(e.target.value)}
                type="number" name="amount" placeholder="Amount" required />
        </label>
        <label htmlFor="title">* Name:
            <input value={title} onChange={e => setTitle(e.target.value)}
                type="text" name="title" placeholder="Title" required />
        </label>
        <label htmlFor="description">Description:
            <input value={description} onChange={e => setDescription(e.target.value)}
                type="text" name="description" placeholder="Description" />
        </label>
        <label htmlFor="date">* Date:
            <input value={date} onChange={e => setDate(e.target.value)}
                type="date" name="date" placeholder="Date" required />
        </label>

        <button type="submit" onClick={e => {
            e.preventDefault();
            const trimmedTitle = title.trim();
            if (trimmedTitle === "") return;
            const numAmount = +amount;
            if (amount == "" || isNaN(numAmount) || numAmount === 0) return;
            const trimmedDescription = description.trim() || undefined;
            const parsedDate = new Date(date);

            onAdd({
                amount: numAmount,
                title: trimmedTitle,
                description: trimmedDescription,
                date: parsedDate,
            });
            setTitle("");
            setDescription("");
            setAmount("0.00");
            // Actually... Don't reset the date. That's annoying.
            // setDate(getCurrentDateString());
        }}>Add</button>
    </form>;
}

