import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { Transaction } from "@/types";

interface TransactionsTableProps {
    transactions: Transaction[];
    hasTransactions: boolean;
    formatCurrency: (value: number, currency?: string) => string;
    baseCurrency: string;
}

const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
};

export default function TransactionsTable({
    transactions,
    hasTransactions,
    formatCurrency,
    baseCurrency,
}: TransactionsTableProps) {
    const [selectedTransaction, setSelectedTransaction] =
        useState<Transaction | null>(null);

    const handleRowClick = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
    };

    return (
        <>
            <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-24">Date</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="hidden sm:table-cell">
                                Description
                            </TableHead>
                            <TableHead className="hidden md:table-cell">
                                Payment method
                            </TableHead>
                            <TableHead className="hidden sm:table-cell">Type</TableHead>
                            <TableHead className="text-right">
                                Amount ({baseCurrency})
                            </TableHead>
                            <TableHead className="hidden text-right lg:table-cell">
                                Paid In
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((transaction) => (
                            <TableRow
                                key={transaction.id}
                                onClick={() => handleRowClick(transaction)}
                                className="cursor-pointer hover:bg-muted/50"
                            >
                                <TableCell className="text-xs font-medium sm:text-sm">
                                    {transaction.date}
                                </TableCell>
                                <TableCell className="text-xs font-medium sm:text-sm">
                                    {truncateText(transaction.category, 15)}
                                </TableCell>
                                <TableCell className="hidden text-xs text-muted-foreground sm:table-cell sm:text-sm">
                                    {truncateText(transaction.description, 30)}
                                </TableCell>
                                <TableCell className="hidden text-xs text-muted-foreground md:table-cell sm:text-sm">
                                    {transaction.paymentMethod}
                                </TableCell>
                                <TableCell className="hidden text-xs text-muted-foreground sm:table-cell sm:text-sm">
                                    {transaction.type}
                                </TableCell>
                                <TableCell className="text-right text-xs font-medium sm:text-sm">
                                    {formatCurrency(transaction.baseAmount, baseCurrency)}
                                </TableCell>
                                <TableCell className="hidden text-right text-xs text-muted-foreground lg:table-cell sm:text-sm">
                                    {transaction.currency !== baseCurrency
                                        ? `${formatCurrency(transaction.amount, transaction.currency)}`
                                        : "-"}
                                </TableCell>
                            </TableRow>
                        ))}
                        {!hasTransactions ? (
                            <TableRow>
                                <TableCell
                                    colSpan={7}
                                    className="py-8 text-center text-xs sm:py-10 sm:text-sm"
                                >
                                    No transactions yet. Add one to get started.
                                </TableCell>
                            </TableRow>
                        ) : null}
                    </TableBody>
                </Table>
            </div>

            <Dialog
                open={!!selectedTransaction}
                onOpenChange={(open) => !open && setSelectedTransaction(null)}
            >
                <DialogContent className="max-h-3/4 overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Transaction Details</DialogTitle>
                    </DialogHeader>
                    {selectedTransaction && (
                        <div className="space-y-4 pr-2">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Date
                                </p>
                                <p className="text-base font-medium">
                                    {selectedTransaction.date}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Category
                                </p>
                                <p className="text-base font-medium">
                                    {selectedTransaction.category}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Description
                                </p>
                                <p className="text-base">{selectedTransaction.description}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Payment Method
                                </p>
                                <p className="text-base">{selectedTransaction.paymentMethod}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Type
                                </p>
                                <p className="text-base">{selectedTransaction.type}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">
                                    Amount (SGD)
                                </p>
                                <p className="text-base font-semibold">
                                    {formatCurrency(selectedTransaction.baseAmount, baseCurrency)}
                                </p>
                            </div>
                            {selectedTransaction.currency !== baseCurrency && (
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Amount Paid ({selectedTransaction.currency})
                                    </p>
                                    <p className="text-base font-semibold">
                                        {formatCurrency(
                                            selectedTransaction.amount,
                                            selectedTransaction.currency,
                                        )}
                                    </p>
                                    {selectedTransaction.exchangeRate && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Exchange Rate:{" "}
                                            {selectedTransaction.exchangeRate.toFixed(6)}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
