import { ArrowDownLeft, ArrowUpRight, Copy } from 'lucide-react';
import { toast } from 'react-toastify';
import Badge from '../common/Badge';
import { formatCurrency, formatDateTime, isCredit, TYPE_LABELS } from '../../utils/format';

async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success('Transaction ID copied', { toastId: 'copied' });
  } catch {
    toast.error('Could not copy to the clipboard');
  }
}

/** showAccount adds an "Account" column (used by the admin view). */
export default function TransactionTable({ transactions, showAccount = false }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
        <thead className="bg-slate-50 dark:bg-slate-900/60">
          <tr>
            <th className="th">Transaction ID</th>
            {showAccount && <th className="th">Account</th>}
            <th className="th">Type</th>
            <th className="th">Description</th>
            <th className="th text-right">Amount</th>
            <th className="th text-right">Balance after</th>
            <th className="th">Date</th>
            <th className="th">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {transactions.map((t) => {
            const credit = isCredit(t.transactionType);
            const Icon = credit ? ArrowDownLeft : ArrowUpRight;
            return (
              <tr key={t.id} className="transition hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="td">
                  <span className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-600 dark:text-slate-400" title={t.transactionReference}>
                    {t.transactionReference.slice(0, 12)}&hellip;
                    <button type="button" onClick={() => copy(t.transactionReference)} className="rounded p-1 hover:bg-slate-200 dark:hover:bg-slate-700" aria-label="Copy transaction ID">
                      <Copy className="h-3 w-3" />
                    </button>
                  </span>
                </td>
                {showAccount && <td className="td font-mono text-xs">{t.accountNumber}</td>}
                <td className="td">
                  <span className="inline-flex items-center gap-2 whitespace-nowrap">
                    <span className={`rounded-full p-1 ${credit ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950' : 'bg-rose-50 text-rose-600 dark:bg-rose-950'}`}>
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    {TYPE_LABELS[t.transactionType] ?? t.transactionType}
                  </span>
                </td>
                <td className="td max-w-[14rem] truncate text-slate-600 dark:text-slate-400" title={t.description}>
                  {t.description || '-'}
                </td>
                <td className={`td whitespace-nowrap text-right font-semibold ${credit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {credit ? '+' : '-'}
                  {formatCurrency(t.amount)}
                </td>
                <td className="td whitespace-nowrap text-right text-slate-600 dark:text-slate-400">{formatCurrency(t.balanceAfter)}</td>
                <td className="td whitespace-nowrap text-slate-600 dark:text-slate-400">{formatDateTime(t.transactionDate)}</td>
                <td className="td">
                  <Badge value={t.status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
