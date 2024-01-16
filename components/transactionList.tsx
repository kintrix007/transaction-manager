"use client";

import { useEffect, useState } from "react";
import { Transaction, TransactionItem } from "./transaction";
import { TransactionForm } from "./transactionForm";
import { createClient } from "@/utils/supabase/client";
import styles from "./transaction.module.scss";
import { Currency } from "./currency";
import { Popup } from "./popup";

function Balance({ transactions }: { transactions: { amount: number }[] }) {
    return <h2 className={styles.balance}>
        <div className={styles.title}>EUR Balance</div>

        <div>
            <Currency amount={transactions
                .map(t => t.amount).reduce((a, b) => a + b, 0)} />
        </div>
    </h2>;
}

export default function TransactionList() {
    const supabase = createClient();

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    // In case we want to do something with it
    const [loaded, setLoaded] = useState(false);
    const [editing, setEditing] = useState<Transaction | undefined>(undefined);
    const [selected, setSelected] = useState<Transaction["id"] | undefined>(undefined);

    useEffect(() => {
        (async () => {
            let { data, error, status, statusText } = await supabase
                .from("transactions")
                .select();

            if (error) {
                // Crude, but gets the point across
                alert(error.message);
                return;
            }

            if (!status.toString().startsWith("2")) {
                // Crude, but gets the point across
                alert(`Error: ${status} ${statusText}`);
                return;
            }

            const transactions = data!
                .map(t => ({ ...t, date: new Date(t.date) })) ?? [];

            setTransactions(transactions);
            setLoaded(true);
        })();
    }, [supabase]);

    const channels = supabase.channel("custom-all-channel")
        .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "transactions" },
            (payload: any) => {
                switch (payload.eventType) {
                    case "INSERT":
                        setTransactions(oldTransactions => {
                            const newTransaction = { ...payload.new, date: new Date(payload.new.date) };
                            return [...oldTransactions, newTransaction];
                        });
                        break;
                    case "UPDATE":
                        setTransactions(oldTransactions => {
                            return oldTransactions.map(t => {
                                if (t.id !== payload.old.id) {
                                    return t;
                                }
                                return { ...t, ...payload.new, date: new Date(payload.new.date) };
                            });
                        });
                        break;
                    case "DELETE":
                        setTransactions(oldTransactions => {
                            return oldTransactions.filter(t => t.id !== payload.old.id);
                        });
                        break;
                }
            }
        )
        .subscribe();

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            setSelected(undefined);
        }

        document.addEventListener("mousedown", handleClick);
        return () => {
            document.removeEventListener("mousedown", handleClick);
        };
    }, [transactions]);

    async function addTransaction(transaction: Omit<Transaction, "id">) {
        const { data, error } = await supabase
            .from("transactions")
            .insert({ ...transaction, date: transaction.date.toISOString() })
            .select();

        if (error) {
            // Crude, but gets the point across
            alert(error.message);
            return;
        }

        setTransactions(oldTransactions => {
            const newTransaction = { ...transaction, id: data[0].id };
            return [...oldTransactions, newTransaction];
        });
    }

    async function editTransaction(transaction: Transaction) {
        const { error } = await supabase
            .from("transactions")
            .update({ ...transaction, date: transaction.date.toISOString() })
            .eq("id", transaction.id)
            .select();

        if (error) {
            // Crude, but gets the point across
            alert(error.message);
            return;
        }

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

        if (error) {
            // Crude, but gets the point across
            alert(error.message);
            return;
        }

        setTransactions(oldTransactions => {
            return oldTransactions.filter(t => t.id !== id);
        });
    }

    function selectTransaction(id: number | undefined) {
        setSelected(id);
    }

    // I do realize working with floats is a terrible idea for precise values,
    // especially when it comes when it comes to currencies.
    // But at the same time, for this demo it is fine. 
    // (Might change my mind later)
    return <>
        <Balance transactions={transactions} />

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
                {transactions.map(t =>
                    <TransactionItem key={t.id}
                        onSelect={() => {
                            setSelected(t.id);
                            setEditing(undefined);
                        }}
                        onEdit={() => setEditing(!editing
                            ? transactions.find(t => t.id === selected)
                            : undefined)
                        }
                        onDelete={() => {
                            setEditing(undefined);
                            removeTransaction(t.id);
                        }}
                        selected={t.id === selected}
                        {...t} />)}
            </ul>
        </div >
    </>;
}
