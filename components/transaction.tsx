import { Currency } from "./currency";
import styles from "./transaction.module.scss";

export type Transaction = {
    id: number;
    amount: number;
    title: string;
    description: string | null | undefined;
    date: Date;
};

export function TransactionItem(
    {
        amount, title, description, date, selected,
        onSelect, onDelete, onEdit
    }: Transaction & {
        selected?: boolean;
        onSelect?: () => void;
        onDelete?: () => void;
        onEdit?: () => void;
    }
) {
    const descriptionText = description || "No description";
    return <li className={styles.transaction}>
        {
            // Yes, I do realize this has no business being an achor tag.
            // But changing it to a div breaks the styles.
        }
        <a onClick={e => {
            e.stopPropagation();
            onSelect?.();
        }} id={selected ? "selected-transaction" : undefined} className={selected ? styles.selected : undefined}>
            <div className={styles.leftSide}>
                <div className={styles.title}>{title}</div>
                <div title={descriptionText} className={`${styles.description} ${!description ? styles.empty : undefined}`}>
                    {descriptionText}
                </div>
                <div title={date.toDateString()} className={styles.date}>
                    📅 {date.toDateString()}
                </div>
            </div>
            <div className={styles.rightSide}>
                <Currency amount={amount} />
                {selected
                    ? <>
                        <button onClick={e => {
                            e.stopPropagation();
                            onEdit?.();
                        }} className="btn-danger btn">✏️</button>
                        <button onClick={e => {
                            e.stopPropagation();
                            onDelete?.();
                        }} className="btn-danger btn">🗑</button>
                    </>
                    : null}
            </div>
        </a>
    </li>;
}
