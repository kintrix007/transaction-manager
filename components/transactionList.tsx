"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Transaction, TransactionItem } from "./transaction";
import { TransactionForm } from "./transactionForm";
import { createClient } from "@/utils/supabase/client";
import { Balance } from "./balance";
import { Popup } from "./popup";
import { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";

function useClickOutside(id: string, onClickOutside: () => void) {
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            const element = document.getElementById(id);

            if (element?.contains(e.target as Node)) {
                return;
            }

            onClickOutside();
        }

        document.addEventListener("mousedown", handleClick);
        return () => {
            document.removeEventListener("mousedown", handleClick);
        };
    });
}

function supabaseUpdateChannel(
    supabase: SupabaseClient,
    setTransactions: Dispatch<SetStateAction<Transaction[]>>
): RealtimeChannel {
    return supabase.channel("custom-all-channel")
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
                    default:
                        break;
                }
            }
        );

}

export default function TransactionList() {
    const supabase = createClient();

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    // In case we want to do something with it
    const [loaded, setLoaded] = useState(false);
    const [editing, setEditing] = useState<Transaction | undefined>(undefined);
    const [selected, setSelected] = useState<Transaction["id"] | undefined>(undefined);

    useClickOutside("selected-transaction", () => {
        setSelected(undefined);
    });

    useEffect(() => {
        (async () => {
            let { data, error, status, statusText } = await supabase
                .from("transactions")
                .select()
                .order("date", { ascending: false });

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

    const channels = supabaseUpdateChannel(supabase, setTransactions);
    channels.subscribe();

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

    // I do realize working with floats is a terrible idea for precise values,
    // especially when it comes to currencies.
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
                <Popup title="New transaction ➕">
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
                    ? null
                    : <>
                        <div><em>Loading...</em></div>
                        <TransactionItem
                            id={-1}
                            amount={99.99}
                            title={"Loading..."}
                            description={null}
                            date={new Date()}
                        />
                    </>
                }

                {transactions.map(t =>
                    <TransactionItem key={t.id}
                        onSelect={() => {
                            setSelected(t.id);
                            if (t.id !== editing?.id) {
                                setEditing(undefined);
                            }
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
        </div>
    </>;
}
