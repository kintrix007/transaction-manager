import { Currency } from "./currency";
import styles from "./transaction.module.scss";

export type Transaction = {
    id: number;
    amount: number;
    title: string;
    description: string | null | undefined;
    date: Date;
    selected?: boolean;
};

export function TransactionItem(
    {
        amount, title, description, date, selected,
        onSelect, onDelete, onEdit
    }: Transaction & {
        onSelect: () => void, onDelete: () => void, onEdit: () => void
    }
) {
    const descriptionText = description || "No description";
    return <li className={styles.transaction}>
        <a onClick={e => {
            e.stopPropagation();
            onSelect();
        }} className={selected ? styles.selected : undefined}>
            <div className={styles.leftSide}>
                <div className={styles.title}>{title}</div>
                <div title={descriptionText} className={!description ? styles.empty : undefined}>
                    {descriptionText}
                </div>
                <div title={date.toDateString()} className={styles.date}>
                    📅 {date.toLocaleDateString()}
                </div>
            </div>
            <div className={styles.rightSide}>
                <Currency amount={amount} />
                {selected
                    ? <>
                        <button onClick={e => {
                            e.stopPropagation();
                            onEdit();
                        }} className="btn-danger btn">✏️</button>
                        <button onClick={e => {
                            e.stopPropagation();
                            onDelete();
                        }} className="btn-danger btn">🗑</button>
                    </>
                    : null}
            </div>
        </a>
    </li>;
}
