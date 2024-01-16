
export function Currency({ amount }: { amount: number }) {
    return <span>€{amount.toFixed(2)}</span>;
}
