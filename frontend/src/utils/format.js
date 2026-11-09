const CURRENCY = import.meta.env.VITE_CURRENCY || 'INR';
const LOCALE = import.meta.env.VITE_LOCALE || 'en-IN';

const currencyFormatter = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY });

export const formatCurrency = (value) => currencyFormatter.format(Number(value ?? 0));

export const formatDate = (iso) =>
  iso ? new Intl.DateTimeFormat(LOCALE, { dateStyle: 'medium' }).format(new Date(iso)) : '-';

export const formatDateTime = (iso) =>
  iso ? new Intl.DateTimeFormat(LOCALE, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso)) : '-';

export const TRANSACTION_TYPES = ['DEPOSIT', 'WITHDRAWAL', 'TRANSFER_DEBIT', 'TRANSFER_CREDIT'];

export const TYPE_LABELS = {
  DEPOSIT: 'Deposit',
  WITHDRAWAL: 'Withdrawal',
  TRANSFER_DEBIT: 'Transfer out',
  TRANSFER_CREDIT: 'Transfer in',
};

/** Money coming into the account. */
export const isCredit = (type) => type === 'DEPOSIT' || type === 'TRANSFER_CREDIT';

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('') || '?';
