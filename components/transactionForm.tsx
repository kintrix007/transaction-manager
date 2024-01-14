import { useState } from "react";
import styles from "./transaction.module.scss";
import { Transaction } from "./transaction";

function getDateString(date: Date) {
    return date.toISOString().split("T")[0];
}

export function TransactionForm({ transaction, onSubmit }: { transaction?: Omit<Transaction, "id">; onSubmit: (obj: Omit<Transaction, "id">) => void }) {
    const defaults = {
        amount: transaction?.amount.toFixed(2) ?? "0.00",
        title: transaction?.title ?? "",
        description: transaction?.description ?? "",
        date: getDateString(transaction?.date ?? new Date()),
    };

    const [amount, setAmount] = useState(defaults.amount);
    const [title, setTitle] = useState(defaults.title);
    const [description, setDescription] = useState(defaults.description);
    const [date, setDate] = useState(defaults.date);

    function submit() {
        const trimmedTitle = title.trim();
        if (trimmedTitle === "") return;
        const numAmount = +amount;
        if (amount == "" || isNaN(numAmount) || numAmount === 0) return;
        const trimmedDescription = description.trim() || undefined;
        const parsedDate = new Date(date);

        onSubmit({
            amount: numAmount,
            title: trimmedTitle,
            description: trimmedDescription,
            date: parsedDate,
        });

        setAmount(defaults.amount);
        setTitle(defaults.title);
        setDescription(defaults.description);
        // Actually... Don't reset the date. That's annoying.
        // setDate(getCurrentDateString());
    }

    return <form className={styles.transactionForm}>
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
            e.stopPropagation();
            submit();
        }}>
            {transaction === undefined ? "Add" : "Save"}
        </button>
    </form>;
}

