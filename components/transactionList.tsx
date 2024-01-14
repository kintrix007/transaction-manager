"use client";

import { useEffect, useState } from "react";
import { Transaction, TransactionItem } from "./transaction";
import { TransactionForm } from "./transactionForm";
import { createClient } from "@/utils/supabase/client";
import styles from "./transaction.module.scss";
import { Currency } from "./currency";
import { Popup } from "./popup";

export default function TransactionList() {
    const supabase = createClient();

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [editing, setEditing] = useState<Transaction | undefined>(undefined);

    useEffect(() => {
        (async () => {
            let { data, error } = await supabase
                .from("transactions")
                .select();

            const transactions = data
                ?.map(t => ({ ...t, date: new Date(t.date) })) ?? [];

            setTransactions(transactions);
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

    async function addTransaction(transaction: Omit<Transaction, "id">) {
        const { data, error } = await supabase
            .from("transactions")
            .insert({ ...transaction, date: transaction.date.toISOString() })
            .select();

        setTransactions(oldTransactions => {
            const newTransaction = { ...transaction, id: data![0]!.id };
            return [...oldTransactions, newTransaction];
        });
    }

    async function editTransaction(transaction: Transaction) {
        const { data, error } = await supabase
            .from("transactions")
            .update({ ...transaction, date: transaction.date.toISOString() })
            .eq("id", transaction.id)
            .select();

        setTransactions(oldTransactions => {
            return oldTransactions.map(t => {
                if (t.id !== transaction.id) {
                    return t;
                }
                return { ...t, ...transaction };
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

    function selectTransaction(id: number) {
        setTransactions(oldTransactions => {
            return oldTransactions.map(t => {
                return { ...t, selected: t.id == id };
            });
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

        {
            // This is a temporary hack. It should have its own state
            // and be an actual popup. It should show up when the user
            // clicks on the "Add transaction" button.
            //
            // However, this works for the sake of the demo.
            !editing
                ?
                <Popup title="Add new transaction ➕">
                    <TransactionForm onSubmit={addTransaction} />
                </Popup>
                : null
        }

        {
            editing
                ? <Popup title="Edit transaction ✏️">
                    <TransactionForm
                        transaction={editing}
                        onSubmit={newTransaction => {
                            editTransaction({ ...newTransaction, id: editing.id });
                            setEditing(undefined);
                        }} />
                </Popup>
                : null
        }

        <div>
            <h2>Past transactions</h2>
            <ul>
                {loaded
                    ? transactions.map(t =>
                        <TransactionItem key={t.id}
                            onSelect={() => {
                                setEditing(undefined);
                                selectTransaction(t.id)
                            }}
                            onEdit={() => setEditing(transactions.find(t => t.selected))}
                            onDelete={() => {
                                setEditing(undefined);
                                removeTransaction(t.id)
                            }}
                            {...t} />)
                    : <div><em>Loading...</em></div>}
            </ul>
        </div >
    </>;
}
