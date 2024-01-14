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
    const [loaded, setLoaded] = useState(false);
    const [editing, setEditing] = useState<Transaction | undefined>(undefined);

    useEffect(() => {
        (async () => {
            // TODO: Error handling
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
            (payload: any) => {
                console.log({ payload });
                switch (payload.eventType) {
                    case 'INSERT':
                        setTransactions(oldTransactions => {
                            const newTransaction = { ...payload.new, date: new Date(payload.new.date) };
                            return [...oldTransactions, newTransaction];
                        });
                        break;
                    case 'UPDATE':
                        setTransactions(oldTransactions => {
                            return oldTransactions.map(t => {
                                if (t.id !== payload.old.id) {
                                    return t;
                                }
                                return { ...t, ...payload.new, date: new Date(payload.new.date) };
                            });
                        });
                        break;
                    case 'DELETE':
                        setTransactions(oldTransactions => {
                            return oldTransactions.filter(t => t.id !== payload.old.id);
                        });
                        break;
                }
            }
        )
        .subscribe();

    async function addTransaction(transaction: Omit<Transaction, "id">) {
        // TODO: Error handling
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
        // TODO: Error handling
        const { error } = await supabase
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
        // TODO: Error handling
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
                            setEditing(undefined);
                            selectTransaction(t.id);
                        }}
                        onEdit={() => setEditing(!editing
                            ? transactions.find(t => t.selected)
                            : undefined)
                        }
                        onDelete={() => {
                            setEditing(undefined);
                            removeTransaction(t.id);
                        }}
                        {...t} />)}
            </ul>
        </div >
    </>;
}
