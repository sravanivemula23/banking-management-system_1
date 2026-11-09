import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PiggyBank, RefreshCw, Briefcase } from 'lucide-react';
import { toast } from 'react-toastify';
import Badge from '../common/Badge';
import { accountService } from '../../services/accountService';
import { formatCurrency, formatDate } from '../../utils/format';
import { getErrorMessage } from '../../utils/errors';
import { Spinner } from '../common/Spinner';

export default function AccountCard({ account, compact = false }) {
  // Lets the user re-check the live balance via GET /api/accounts/{id}/balance.
  const [balance, setBalance] = useState(account.balance);
  const [checking, setChecking] = useState(false);
  const Icon = account.accountType === 'SAVINGS' ? PiggyBank : Briefcase;

  const checkBalance = async () => {
    setChecking(true);
    try {
      const res = await accountService.getBalance(account.id);
      setBalance(res.balance);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="card flex flex-col p-5 transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="rounded-lg bg-brand-50 p-2.5 text-brand-600 dark:bg-brand-950 dark:text-brand-300">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {account.accountType === 'SAVINGS' ? 'Savings account' : 'Current account'}
            </p>
            <p className="font-mono text-xs text-slate-500 dark:text-slate-400">{account.accountNumber}</p>
          </div>
        </div>
        <Badge value={account.status} />
      </div>

      <div className="mt-5 flex items-end justify-between gap-2">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Available balance</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(balance)}</p>
        </div>
        <button type="button" onClick={checkBalance} disabled={checking} className="btn-ghost p-2" aria-label="Check balance" title="Check balance">
          {checking ? <Spinner className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
        </button>
      </div>

      {!compact && (
        <dl className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4 text-xs dark:border-slate-800">
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Account ID</dt>
            <dd className="font-medium text-slate-800 dark:text-slate-200">{account.id}</dd>
          </div>
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Opened</dt>
            <dd className="font-medium text-slate-800 dark:text-slate-200">{formatDate(account.createdAt)}</dd>
          </div>
        </dl>
      )}

      <Link to={`/accounts/${account.id}`} className="btn-secondary mt-4 w-full">
        View details
      </Link>
    </div>
  );
}
