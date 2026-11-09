import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownToLine, ArrowUpFromLine, Plus, Receipt, Send, Wallet, WalletCards } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import { PageLoader } from '../../components/common/Spinner';
import { EmptyState, ErrorState } from '../../components/common/States';
import StatCard from '../../components/dashboard/StatCard';
import MonthlyChart from '../../components/dashboard/MonthlyChart';
import AccountCard from '../../components/accounts/AccountCard';
import CreateAccountModal from '../../components/accounts/CreateAccountModal';
import TransactionTable from '../../components/transactions/TransactionTable';
import { useAuth } from '../../context/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import { useMyAccounts } from '../../hooks/useMyAccounts';
import { transactionService } from '../../services/transactionService';
import { monthlyFlow, sortByDateDesc, sumBalances } from '../../utils/analytics';
import { formatCurrency } from '../../utils/format';

const PER_ACCOUNT = 50;

export default function Dashboard() {
  const { user } = useAuth();
  const { accounts, loading, error, reload } = useMyAccounts();
  const [creating, setCreating] = useState(false);

  // There is no "all my transactions" endpoint, so we fetch the latest page for each account and merge them.
  const idsKey = accounts.map((a) => a.id).join(',');
  const { data: txns, loading: txLoading } = useFetch(
    async () => {
      const pages = await Promise.all(accounts.map((a) => transactionService.history(a.id, { size: PER_ACCOUNT })));
      return sortByDateDesc(pages.flatMap((p) => p.content));
    },
    [idsKey],
    { enabled: accounts.length > 0 },
  );

  if (loading) return <PageLoader label="Loading your dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const recent = (txns ?? []).slice(0, 6);
  const totalBalance = sumBalances(accounts);
  const activeCount = accounts.filter((a) => a.status === 'ACTIVE').length;

  const quickActions = [
    { to: '/money?mode=deposit', label: 'Deposit', icon: ArrowDownToLine },
    { to: '/money?mode=withdraw', label: 'Withdraw', icon: ArrowUpFromLine },
    { to: '/transfer', label: 'Transfer', icon: Send },
    { to: '/transactions', label: 'History', icon: Receipt },
  ];

  return (
    <>
      <PageHeader
        title={`Welcome, ${user.name.split(' ')[0]}`}
        subtitle="Here is an overview of your finances."
        actions={
          <Button icon={Plus} onClick={() => setCreating(true)}>
            New account
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={Wallet} label="Total balance" value={formatCurrency(totalBalance)} hint="Across all your accounts" />
        <StatCard icon={WalletCards} label="Accounts" value={accounts.length} hint={`${activeCount} active`} tone="blue" />
        <div className="card p-5 sm:col-span-2 lg:col-span-1">
          <p className="mb-3 text-sm font-medium text-slate-500 dark:text-slate-400">Quick actions</p>
          <div className="grid grid-cols-4 gap-2">
            {quickActions.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex flex-col items-center gap-1.5 rounded-lg px-1 py-2.5 text-xs font-medium text-slate-700 transition hover:bg-brand-50 hover:text-brand-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <span className="rounded-full bg-brand-50 p-2 text-brand-600 dark:bg-brand-950 dark:text-brand-300">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {accounts.length === 0 ? (
        <div className="card mt-6">
          <EmptyState
            icon={Wallet}
            title="You have no accounts yet"
            text="Open your first account to start depositing, withdrawing and transferring money."
            action={
              <Button icon={Plus} onClick={() => setCreating(true)}>
                Open an account
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <section className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Your accounts</h2>
              <Link to="/accounts" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
                View all
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {accounts.slice(0, 3).map((a) => (
                <AccountCard key={a.id} account={a} compact />
              ))}
            </div>
          </section>

          <section className="mt-8 grid gap-6 xl:grid-cols-5">
            <div className="card min-w-0 p-5 xl:col-span-2">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Monthly activity</h2>
              <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
                Last 6 months, based on your latest {PER_ACCOUNT} transactions per account.
              </p>
              {txLoading ? <PageLoader label="Loading chart..." /> : <MonthlyChart data={monthlyFlow(txns ?? [])} />}
            </div>

            <div className="card min-w-0 xl:col-span-3">
              <div className="flex items-center justify-between p-5 pb-3">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent transactions</h2>
                <Link to="/transactions" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
                  View all
                </Link>
              </div>
              {txLoading ? (
                <PageLoader label="Loading transactions..." />
              ) : recent.length === 0 ? (
                <EmptyState icon={Receipt} title="No transactions yet" text="Make a deposit to see your activity here." />
              ) : (
                <TransactionTable transactions={recent} />
              )}
            </div>
          </section>
        </>
      )}

      <CreateAccountModal
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={() => {
          setCreating(false);
          reload();
        }}
      />
    </>
  );
}
