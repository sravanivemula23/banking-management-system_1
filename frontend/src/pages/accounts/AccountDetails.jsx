import { Link, useParams } from 'react-router-dom';
import { ArrowDownToLine, ArrowLeft, ArrowUpFromLine, Receipt, RefreshCw, Send } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/common/Badge';
import { PageLoader, Spinner } from '../../components/common/Spinner';
import { EmptyState, ErrorState } from '../../components/common/States';
import TransactionTable from '../../components/transactions/TransactionTable';
import { useFetch } from '../../hooks/useFetch';
import { accountService } from '../../services/accountService';
import { transactionService } from '../../services/transactionService';
import { formatCurrency, formatDateTime } from '../../utils/format';

function Detail({ label, children }) {
  return (
    <div>
      <dt className="text-xs text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-slate-900 dark:text-slate-100">{children}</dd>
    </div>
  );
}

export default function AccountDetails() {
  const { id } = useParams();
  const account = useFetch(() => accountService.getById(id), [id]);
  const balance = useFetch(() => accountService.getBalance(id), [id]);
  const history = useFetch(() => transactionService.history(id, { size: 10 }), [id]);

  if (account.loading) return <PageLoader label="Loading account..." />;
  if (account.error) return <ErrorState message={account.error} onRetry={account.reload} />;

  const a = account.data;
  return (
    <>
      <Link to="/accounts" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
        <ArrowLeft className="h-4 w-4" /> Back to accounts
      </Link>
      <PageHeader
        title={a.accountType === 'SAVINGS' ? 'Savings account' : 'Current account'}
        subtitle={`Account number ${a.accountNumber}`}
        actions={
          <>
            <Link to={`/money?mode=deposit&account=${a.id}`} className="btn-secondary">
              <ArrowDownToLine className="h-4 w-4" /> Deposit
            </Link>
            <Link to={`/money?mode=withdraw&account=${a.id}`} className="btn-secondary">
              <ArrowUpFromLine className="h-4 w-4" /> Withdraw
            </Link>
            <Link to={`/transfer?account=${a.id}`} className="btn-primary">
              <Send className="h-4 w-4" /> Transfer
            </Link>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">Current balance</p>
            <button type="button" onClick={balance.reload} className="btn-ghost p-1.5" aria-label="Refresh balance" title="Refresh balance">
              {balance.loading ? <Spinner className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">
            {balance.data ? formatCurrency(balance.data.balance) : balance.error ? 'Unavailable' : '...'}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Live value from the balance endpoint</p>
        </div>

        <div className="card p-6 lg:col-span-2">
          <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">Account details</h2>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
            <Detail label="Account number">
              <span className="font-mono">{a.accountNumber}</span>
            </Detail>
            <Detail label="Account ID (used for transfers)">{a.id}</Detail>
            <Detail label="Type">{a.accountType}</Detail>
            <Detail label="Status">
              <Badge value={a.status} />
            </Detail>
            <Detail label="Account holder">{a.ownerName}</Detail>
            <Detail label="Opened">{formatDateTime(a.createdAt)}</Detail>
          </dl>
        </div>
      </div>

      <div className="card mt-6">
        <div className="flex items-center justify-between p-5 pb-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent transactions</h2>
          <Link to={`/transactions?account=${a.id}`} className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
            View all
          </Link>
        </div>
        {history.loading ? (
          <PageLoader label="Loading transactions..." />
        ) : history.error ? (
          <ErrorState message={history.error} onRetry={history.reload} />
        ) : history.data.content.length === 0 ? (
          <EmptyState icon={Receipt} title="No transactions yet" text="Activity on this account will appear here." />
        ) : (
          <TransactionTable transactions={history.data.content} />
        )}
      </div>
    </>
  );
}
