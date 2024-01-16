import styles from "./transaction.module.scss";
import { Currency } from "./currency";

export function Balance({ transactions }: {
    transactions: {
        amount: number;
    }[];
}) {
    return <h2 className={styles.balance}>
        <div className={styles.title}>EUR Balance</div>

        <div>
            <Currency amount={transactions
                .map(t => t.amount).reduce((a, b) => a + b, 0)} />
        </div>
    </h2>;
}
