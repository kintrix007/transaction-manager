export function Currency({ amount }: { amount: number }) {
    return <>€{amount.toFixed(2)}</>;
}
