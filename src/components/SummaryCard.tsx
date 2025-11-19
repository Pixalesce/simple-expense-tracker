interface SummaryCardsProps {
    title: string;
    value: string;
}

export default function SummaryCard({ title, value }: SummaryCardsProps) {
    return (
        <div className="rounded-lg border bg-card p-3 shadow-sm sm:p-4">
            <p className="text-xs font-medium text-muted-foreground sm:text-sm">{title}</p>
            <p className="mt-1 text-sm font-semibold sm:mt-2 sm:text-lg">{value}</p>
        </div>
    );
}
