import { useEffect, useMemo, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import seedTransactions from "@/data/transactions.json";
import type { Transaction, TransactionFormState } from "@/types";
import NewTransactionForm from "./components/NewTransactionForm";
import SummaryCard from "./components/SummaryCard";
import TransactionsTable from "./components/TransactionTable";
import ThemeToggle from "./components/ThemeToggle";
import { convertCurrency } from "@/services/currencyExchange";

const TRANSACTIONS_KEY = "expense-transactions";

const formatCurrency = (value: number, currency: string = "SGD") =>
    new Intl.NumberFormat("en-SG", {
        useGrouping: true,
        currencySign: "standard",
        style: "currency",
        currency: currency,
    }).format(value);

const defaultFormState = (baseCurrency: string): TransactionFormState => ({
    date: new Date().toISOString().slice(0, 10), // so that the correct values are displayed in the form
    description: "",
    amount: 0,
    category: "Food & Drink",
    paymentMethod: "Cash",
    type: "Expense",
    currency: baseCurrency,
    baseAmount: 0,
    baseCurrency: baseCurrency,
    exchangeRate: undefined,
});

// load transactions from JSON file
const initTransactions = () => {
    if (typeof window === "undefined") {
        return [];
    }

    const cachedTransactions = window.localStorage.getItem(TRANSACTIONS_KEY);
    let allTransactions: Transaction[];

    if (cachedTransactions) {
        try {
            const parsedTransactions = JSON.parse(
                cachedTransactions,
            ) as Transaction[];
            allTransactions = parsedTransactions;
        } catch (error) {
            console.warn(
                "Failed to parse cached transactions, seeding instead.",
                error,
            );
            allTransactions = seedTransactions as Transaction[];
        }
    } else {
        allTransactions = seedTransactions as Transaction[];
    }

    window.localStorage.setItem(
        TRANSACTIONS_KEY,
        JSON.stringify(allTransactions),
    );

    return allTransactions;
};

const parseDateString = (value: string) => {
    const ddmmyyyy = value.split("-");
    const parsedDate = new Date(
        parseInt(ddmmyyyy[2]),
        parseInt(ddmmyyyy[1]) - 1,
        parseInt(ddmmyyyy[0]),
    );
    return parsedDate.getTime();
};

export default function App() {
    const baseCurrency = "SGD";
    const [transactions, setTransactions] =
        useState<Transaction[]>(initTransactions());
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [showManualRate, setShowManualRate] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm<TransactionFormState>({
        defaultValues: defaultFormState(baseCurrency),
    });

    const watchedType = watch("type");
    const watchedCurrency = watch("currency");
    const watchedAmount = watch("amount");

    useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        window.localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
    }, [transactions]);

    const totals = useMemo(() => {
        return transactions.reduce(
            (acc, transaction) => {
                if (transaction.type === "Expense") {
                    acc.expense += transaction.baseAmount;
                } else {
                    acc.income += transaction.baseAmount;
                }
                return acc;
            },
            { income: 0, expense: 0 },
        );
    }, [transactions]);

    const sortedTransactions = useMemo(
        () =>
            [...transactions].sort(
                (a, b) => parseDateString(b.date) - parseDateString(a.date),
            ),
        [transactions],
    );

    const onSubmit: SubmitHandler<TransactionFormState> = async (values) => {
        const date = new Date(values.date)
            .toLocaleDateString()
            .replaceAll("/", "-");

        const currency = values.currency.trim().toUpperCase();
        let baseAmount = values.amount;
        let exchangeRate: number | undefined;

        if (currency !== baseCurrency) {
            const conversionResult = await convertCurrency(
                values.amount,
                currency,
                baseCurrency,
                values.exchangeRate,
            );

            if (conversionResult === null) {
                setShowManualRate(true);
                return;
            }

            baseAmount = conversionResult.convertedAmount;
            exchangeRate = conversionResult.rate;
        } else {
            exchangeRate = 1;
        }

        const newTransaction: Transaction = {
            id: transactions.length + 1,
            date: date,
            description: values.description.trim(),
            amount: values.amount,
            category: values.category.trim(),
            paymentMethod: values.paymentMethod,
            type: values.type,
            currency: currency,
            baseAmount: baseAmount,
            baseCurrency: baseCurrency,
            exchangeRate: exchangeRate,
        };

        setTransactions((previous) => [newTransaction, ...previous]);
        reset(defaultFormState(baseCurrency));
        setShowManualRate(false);
        setIsDialogOpen(false);
    };

    const hasTransactions = sortedTransactions.length > 0;
    const netTotal = totals.income - totals.expense;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header>
                <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6 sm:px-6 sm:py-10 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
                        Simple Expense Tracker
                    </h1>
                    <div className="flex flex-wrap items-center gap-2">
                        <ThemeToggle />
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="default" className="sm:text-base">
                                    Add transaction
                                </Button>
                            </DialogTrigger>
                            <NewTransactionForm
                                register={register}
                                handleSubmit={handleSubmit}
                                onSubmit={onSubmit}
                                watchedType={watchedType}
                                errors={errors}
                                baseCurrency={baseCurrency}
                                showManualRate={showManualRate}
                                onCurrencyChange={() => setShowManualRate(false)}
                                watchedCurrency={watchedCurrency}
                                watchedAmount={watchedAmount}
                            />
                        </Dialog>
                        <Button
                            variant="outline"
                            size="default"
                            className="sm:text-base"
                            onClick={() => {
                                if (typeof window === "undefined") {
                                    return;
                                }
                                window.localStorage.removeItem(TRANSACTIONS_KEY);
                                setTransactions(seedTransactions as Transaction[]);
                            }}
                        >
                            Reset data
                        </Button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-5xl space-y-6 px-4 pb-12 sm:space-y-8 sm:px-6">
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <SummaryCard
                        title="Income"
                        value={formatCurrency(totals.income, baseCurrency)}
                    />
                    <SummaryCard
                        title="Expenses"
                        value={formatCurrency(totals.expense, baseCurrency)}
                    />
                    <SummaryCard
                        title="Net Total"
                        value={formatCurrency(netTotal, baseCurrency)}
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
                                Transactions
                            </h2>
                        </div>
                        <p className="text-xs text-muted-foreground sm:text-sm">
                            {hasTransactions
                                ? `${transactions.length} total entr${transactions.length === 1 ? "y" : "ies"
                                }`
                                : "No transactions captured."}
                        </p>
                    </div>

                    <TransactionsTable
                        transactions={sortedTransactions}
                        hasTransactions={hasTransactions}
                        formatCurrency={formatCurrency}
                        baseCurrency={baseCurrency}
                    />
                </div>
            </main>
        </div>
    );
}
