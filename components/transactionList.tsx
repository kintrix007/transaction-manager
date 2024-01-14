"use client";

import { useEffect, useState } from "react";
import { Transaction, TransactionForm, TransactionItem } from "./transaction";
import { createClient } from "@/utils/supabase/client";
import styles from "./transaction.module.scss";
import { Currency } from "./currency";

export default function TransactionList() {
    const supabase = createClient();

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        (async () => {
            let { data, error } = await supabase
                .from("transactions")
                .select();

            setTransactions(data ?? []);
            setLoaded(true);
        })();
    }, []);

    const channels = supabase.channel('custom-all-channel')
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'transactions' },
            (payload) => {
                console.log('Change received!', payload)
            }
        )
        .subscribe()

    async function addTransaction(amount: number, title: string, description?: string) {
        const { data, error } = await supabase
            .from("transactions")
            .insert({ title, description, amount })
            .select();

        console.log({ amount, title, description });

        setTransactions(oldTransactions => {
            const newTransaction = { id: data![0]!.id, title, description, amount };
            return [...oldTransactions, newTransaction];
        });
    }

    async function editTransaction(id: number, amount: number, title: string, description?: string) {
        const { error } = await supabase
            .from("transactions")
            .update(transactions.find(t => t.id === id)!)
            .eq("id", id)
            .select();

        setTransactions(oldTransactions => {
            return oldTransactions.map(t => {
                if (t.id === id) {
                    return t;
                }
                return { ...t, title, description, amount };
            });
        });
    }

    async function removeTransaction(id: number) {
        const { error } = await supabase
            .from("transactions")
            .delete()
            .eq("id", id);

        setTransactions(oldTransactions => {
            return oldTransactions.filter(t => t.id !== id);
        });
    }

    // I do realize working with floats is a terrible idea for precise values,
    // especially when it comes when it comes to currencies.
    // But at the same time, for this demo it is fine. 
    // (Might change my mind later)
    return <>
        <h2 className={styles.balance}>
            <div className={styles.title}>EUR Balance</div>

            <div>
                {loaded
                    ? <Currency amount={transactions
                        .map(t => t.amount).reduce((a, b) => a + b, 0)} />
                    : `Loading...`
                }
            </div>
        </h2>

        <TransactionForm onAdd={addTransaction} />

        <div>
            <h2>Past transactions</h2>
            <ul>
                {loaded
                    ? transactions.map(t =>
                        <TransactionItem key={t.id} onClick={() => removeTransaction(t.id)} {...t} />)
                    : <div><em>Loading...</em></div>}
            </ul>
        </div >
    </>;
}
