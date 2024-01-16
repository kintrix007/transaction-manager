function formatCurrency(amount: number) {
    const sign = amount < 0 ? "-" : "";
    const whole = Math.floor(Math.abs(amount)).toString();
    const [, fractional] = amount.toFixed(2).split(".");

    const digitGroups = [];
    for (let i = 0; i < whole.length; i += 3) {
        digitGroups.push(whole.slice(Math.max(0, whole.length - i - 3), whole.length - i));
    }

    return sign + digitGroups.reverse().join(",") + "." + fractional;
    // Alternatively, consider:
    // return amount.toLocaleString();
}

export function Currency({ amount }: { amount: number }) {
    return <span>€{formatCurrency(amount)}</span>;
}
