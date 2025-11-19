export type ExpenseMethod =
    | "Credit Card"
    | "Debit Card"
    | "Cash"
    | "Bank Transfer";

export type IncomeMethod = "Cash" | "Bank Transfer";

export type TransactionType = "Expense" | "Income";

export type Transaction = {
    id: number;
    date: string;
    description: string;
    amount: number;
    category: string;
    paymentMethod: ExpenseMethod | IncomeMethod;
    type: TransactionType;
    currency: string;
    baseAmount: number;
    baseCurrency: string;
    exchangeRate?: number;
};

export type TransactionFormState = Omit<Transaction, "id">;
