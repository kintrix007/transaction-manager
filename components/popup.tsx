import { ReactNode } from "react";
import styles from "./popup.module.scss";

export function Popup(
    { title, children, onClose }: {
        title: string;
        children: ReactNode;
        onClose?: () => void;
    }
) {
    return <div className={styles.popup}>
        <div className={styles.content}>
            <h3>{title}</h3>
            {children}
        </div>
    </div>;
}
