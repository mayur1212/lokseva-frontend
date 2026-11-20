const locale = "mr-IN";
const zone = "Asia/Kolkata";
export const number = (value: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value);
export const money = (value: number) => new Intl.NumberFormat(locale, {style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
export const date = (value: string) => new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: zone }).format(new Date(value));
export const dateTime = (value: string) => new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", timeZone: zone }).format(new Date(value));
export const day = 86_400_000;
export const ago = (value: string, now = Date.now()) => Math.max(0, Math.floor((now - Date.parse(value)) / day));
