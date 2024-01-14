import { useState } from "react";

export type Transaction = {
    id: number;
    title: string;
    description: string | null | undefined;
    amount: number;
};

export function TransactionItem({ title, description, amount, onClick }: Transaction & { onClick: () => void }) {
    return <li><a onClick={onClick}>
        <div>{title}</div>
        <div><em>{description || "No description"}</em></div>
        <div>€{amount}</div>
    </a></li>;
}

export function TransactionForm({ onAdd }: { onAdd: (amount: number, title: string, description?: string) => void }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");

    return <form>
        <label htmlFor="title">Name:
            <input value={title} onChange={e => setTitle(e.target.value)}
                type="text" name="title" placeholder="Title" required />
        </label>
        <label htmlFor="description">Description:
            <input value={description} onChange={e => setDescription(e.target.value)}
                type="text" name="description" placeholder="Title" />
        </label>
        <label htmlFor="amount">€
            <input value={amount} onChange={e => setAmount(e.target.value)}
                type="number" name="amount" placeholder="Amount" required />
        </label>

        <button type="submit" onClick={e => {
            e.preventDefault();
            const trimmedTitle = title.trim();
            if (trimmedTitle === "") return;
            const numAmount = +amount;
            if (amount == "" || isNaN(numAmount)) return;
            const trimmedDescription = title.trim() || undefined;

            onAdd(numAmount, trimmedTitle, trimmedDescription);
            setTitle("");
            setDescription("");
            setAmount("");
        }}>Add</button>
    </form>;
}

