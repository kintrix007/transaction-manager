import { ReactNode } from "react";
import TransactionList from "@/components/transactionList";

function Panel({ children }: { children: ReactNode }) {
    return <div className="panel">{children}</div>;
}

export default function About() {
    return <Panel>
        <TransactionList />
    </Panel>;
}
