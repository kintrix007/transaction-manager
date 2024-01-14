import { ReactNode } from "react";

export function Popup({ title, children }: { title: string, children: ReactNode }) {
    return <div>
        {children}
    </div>;
}
