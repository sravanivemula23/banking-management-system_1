import { isCredit } from './format';

const toCents = (v) => Math.round(Number(v) * 100);

/** Sums balances using integer cents to avoid floating-point drift. */
export const sumBalances = (accounts) => accounts.reduce((sum, a) => sum + toCents(a.balance), 0) / 100;

/** Newest first. */
export const sortByDateDesc = (txns) =>
  [...txns].sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate) || b.id - a.id);

/** Money in vs. money out for each of the last `months` calendar months. */
export function monthlyFlow(txns, months = 6) {
  const now = new Date();
  const buckets = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      month: d.toLocaleString('en', { month: 'short' }),
      inCents: 0,
      outCents: 0,
    });
  }
  const byKey = Object.fromEntries(buckets.map((b) => [b.key, b]));
  txns.forEach((t) => {
    const d = new Date(t.transactionDate);
    const bucket = byKey[`${d.getFullYear()}-${d.getMonth()}`];
    if (!bucket) return;
    if (isCredit(t.transactionType)) bucket.inCents += toCents(t.amount);
    else bucket.outCents += toCents(t.amount);
  });
  return buckets.map((b) => ({ month: b.month, In: b.inCents / 100, Out: b.outCents / 100 }));
}

/** Count of transactions per type, for the admin chart. */
export function countByType(txns) {
  const counts = {};
  txns.forEach((t) => {
    counts[t.transactionType] = (counts[t.transactionType] || 0) + 1;
  });
  return counts;
}
