import { Button } from "@/components/ui/button";
import {
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
    ExpenseMethod,
    IncomeMethod,
    TransactionFormState,
    TransactionType,
} from "@/types";
import type {
    FieldErrors,
    SubmitHandler,
    UseFormHandleSubmit,
    UseFormRegister,
} from "react-hook-form";

interface NewTransactionFormProps {
    register: UseFormRegister<TransactionFormState>;
    handleSubmit: UseFormHandleSubmit<TransactionFormState>;
    onSubmit: SubmitHandler<TransactionFormState>;
    watchedType: TransactionType;
    errors: FieldErrors<TransactionFormState>;
    baseCurrency: string;
    showManualRate: boolean;
    onCurrencyChange: () => void;
    watchedCurrency: string;
    watchedAmount: number;
}

export default function NewTransactionForm({
    register,
    handleSubmit,
    onSubmit,
    watchedType,
    errors,
    baseCurrency,
    showManualRate,
    onCurrencyChange,
    watchedCurrency,
    watchedAmount,
}: NewTransactionFormProps) {
    const transactionTypes: TransactionType[] = ["Expense", "Income"];
    const incomeMethods: IncomeMethod[] = ["Cash", "Bank Transfer"];
    const expenseMethods: ExpenseMethod[] = [
        "Cash",
        "Credit Card",
        "Debit Card",
        "Bank Transfer",
    ];

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add a transaction</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                        id="date"
                        type="date"
                        {...register("date", {
                            required: "Select a valid date.",
                            validate: (value) =>
                                Boolean(new Date(value).toLocaleDateString()) ||
                                "Select a valid date.",
                        })}
                    />
                    {errors.date?.message ? (
                        <p className="text-sm text-destructive">{errors.date.message}</p>
                    ) : null}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="type">Type</Label>
                    <select
                        id="type"
                        className="focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 text-base shadow-xs outline-none transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        {...register("type")}
                    >
                        {transactionTypes.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                        id="description"
                        placeholder="e.g. Lunch meeting"
                        {...register("description")}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Input
                        id="currency"
                        placeholder="e.g. USD, EUR, SGD"
                        maxLength={3}
                        onKeyPress={(e) => {
                            if (!/[a-zA-Z]/.test(e.key)) {
                                e.preventDefault();
                            }
                        }}
                        {...register("currency", {
                            required: "Enter a 3-letter currency code.",
                            validate: (value) => {
                                const trimmed = value.trim().toUpperCase();
                                return (
                                    (trimmed.length === 3 && /^[A-Z]{3}$/.test(trimmed)) ||
                                    "Enter a valid 3-letter currency code."
                                );
                            },
                            onChange: onCurrencyChange,
                        })}
                    />
                    {errors.currency?.message ? (
                        <p className="text-sm text-destructive">
                            {errors.currency.message}
                        </p>
                    ) : null}
                    <p className="text-xs text-muted-foreground">
                        Base currency: {baseCurrency}
                    </p>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                        id="amount"
                        type="number"
                        min="0.01"
                        step="0.01"
                        inputMode="decimal"
                        {...register("amount", {
                            valueAsNumber: true,
                            required: "Enter a valid amount greater than zero.",
                            validate: (value) => {
                                return (
                                    (!Number.isNaN(value) && value > 0) ||
                                    "Enter a valid amount greater than zero."
                                );
                            },
                        })}
                    />
                    {errors.amount?.message ? (
                        <p className="text-sm text-destructive">{errors.amount.message}</p>
                    ) : null}
                    {watchedCurrency &&
                        watchedCurrency.toUpperCase() !== baseCurrency &&
                        watchedAmount > 0 &&
                        (() => {
                            try {
                                const formatted = new Intl.NumberFormat("en-SG", {
                                    style: "currency",
                                    currency: watchedCurrency.toUpperCase(),
                                }).format(watchedAmount);
                                return (
                                    <p className="text-xs text-muted-foreground">
                                        Amount in {watchedCurrency.toUpperCase()}: {formatted}
                                    </p>
                                );
                            } catch {
                                return (
                                    <p className="text-xs text-muted-foreground">
                                        Amount in {watchedCurrency.toUpperCase()}:{" "}
                                        {watchedAmount.toFixed(2)}
                                    </p>
                                );
                            }
                        })()}
                </div>
                {showManualRate && (
                    <div className="grid gap-2">
                        <Label htmlFor="exchangeRate">Exchange Rate</Label>
                        <Input
                            id="exchangeRate"
                            type="number"
                            min="0.000001"
                            step="0.000001"
                            inputMode="decimal"
                            placeholder="Currency not recognised. Input exchange rate"
                            {...register("exchangeRate", {
                                valueAsNumber: true,
                                validate: (value) => {
                                    if (value === undefined || value === 0) return true;
                                    return (
                                        (!Number.isNaN(value) && value > 0) ||
                                        "Enter a valid exchange rate."
                                    );
                                },
                            })}
                        />
                        {errors.exchangeRate?.message ? (
                            <p className="text-sm text-destructive">
                                {errors.exchangeRate.message}
                            </p>
                        ) : null}
                    </div>
                )}
                <div className="grid gap-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                        id="category"
                        placeholder="e.g. Food & Drink"
                        {...register("category", {
                            required: "Category is required.",
                            validate: (value) =>
                                Boolean(value.trim()) || "Category is required.",
                        })}
                    />
                    {errors.category?.message ? (
                        <p className="text-sm text-destructive">
                            {errors.category.message}
                        </p>
                    ) : null}
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="payment-method">Payment method</Label>
                    <select
                        id="payment-method"
                        className="focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 text-base shadow-xs outline-none transition-[color,box-shadow] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        {...register("paymentMethod", {
                            validate: (value) =>
                                watchedType === "Income" &&
                                    !["Cash", "Bank Transfer"].includes(value)
                                    ? "Income must be recorded as Cash or Bank Transfer."
                                    : true,
                        })}
                    >
                        {watchedType === "Expense"
                            ? expenseMethods.map((method) => (
                                <option key={method} value={method}>
                                    {method}
                                </option>
                            ))
                            : incomeMethods.map((method) => (
                                <option key={method} value={method}>
                                    {method}
                                </option>
                            ))}
                    </select>
                </div>
                {errors.paymentMethod?.message ? (
                    <p className="text-sm text-destructive">
                        {errors.paymentMethod.message}
                    </p>
                ) : null}
                <DialogFooter>
                    <Button type="submit">Save transaction</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}
