const EXCHANGE_RATE_API_KEY = import.meta.env.VITE_EXCHANGE_API_KEY;
const API_BASE_URL = "https://v6.exchangerate-api.com/v6";

export interface ExchangeRateResponse {
    result: "success";
    documentation: string;
    terms_of_use: string;
    time_last_update_unix: number;
    time_last_update_utc: string;
    time_next_update_unix: number;
    time_next_update_utc: string;
    base_code: string;
    target_code: string;
    conversion_rate: number;
}

export interface ExchangeRateError {
    result: "error";
    documentation: string;
    "terms-of-use": string;
    "error-type": string;
}

async function getExchangeRate(
    fromCurrency: string,
    toCurrency: string,
): Promise<number | null> {
    if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) {
        return 1;
    }

    try {
        const url = `${API_BASE_URL}/${EXCHANGE_RATE_API_KEY}/pair/${fromCurrency.toUpperCase()}/${toCurrency.toUpperCase()}`;
        const response = await fetch(url);

        if (!response.ok) {
            console.error("Exchange rate API request failed:", response.statusText);
            return null;
        }

        const data = (await response.json()) as
            | ExchangeRateResponse
            | ExchangeRateError;

        if (data.result === "error") {
            console.error(
                "Exchange rate API error:",
                (data as ExchangeRateError)["error-type"],
            );
            return null;
        }

        return (data as ExchangeRateResponse).conversion_rate;
    } catch (error) {
        console.error("Failed to fetch exchange rate:", error);
        return null;
    }
}

export async function convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    manualRate?: number,
): Promise<{ convertedAmount: number; rate: number } | null> {
    let rate: number;

    if (manualRate !== undefined && manualRate > 0) {
        rate = manualRate;
    } else {
        const fetchedRate = await getExchangeRate(fromCurrency, toCurrency);
        if (fetchedRate === null) {
            return null;
        }
        rate = fetchedRate;
    }

    const convertedAmount = amount * rate;
    return { convertedAmount, rate };
}
