import { useState } from "react";
import { Transaction, TransactionForm, TransactionItem } from "./transaction";

let id = 0;

export default function TransactionList() {
    const [transactions, setTransactions] = useState<Transaction[]>([
        { id: id++, title: "Food", amount: "10.0" },
        { id: id++, title: "Groceries", amount: "20.0" },
        { id: id++, title: "Entertainment", amount: "30.0" },
        { id: id++, title: "Idx", amount: "40.0" },
    ]);

    function addTransaction(amount: string, title: string, description?: string) {
        setTransactions(oldTransactions => {
            const newTransaction = { id: id++, title, description, amount };
            return [...oldTransactions, newTransaction];
        });
    }

    function editTransaction(id: number, amount: string, title: string, description?: string) {
        setTransactions(oldTransactions => {
            return oldTransactions.map(t => {
                if (t.id === id) {
                    return t;
                }
                return { ...t, title, description, amount };
            });
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
    // especially when it comes when it comes to currencies.
    // But at the same time, for this demo it is fine. 
    // (Might change my mind later)
    return <>
        <div>
            €{transactions.map(t => t.amount).reduce((a, b) => a + parseFloat(b), 0)}
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
