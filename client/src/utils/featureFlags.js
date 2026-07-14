export const isPaymentEnabled =
  String(import.meta.env.VITE_PAYMENT).toLowerCase() === "true";
