import { Link } from 'react-router-dom';
import { Activity, Landmark, Receipt, UserX, Users } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import { PageLoader } from '../../components/common/Spinner';
import { EmptyState, ErrorState } from '../../components/common/States';
import StatCard from '../../components/dashboard/StatCard';
import TypeChart from '../../components/dashboard/TypeChart';
import TransactionTable from '../../components/transactions/TransactionTable';
import { useFetch } from '../../hooks/useFetch';
import { adminService } from '../../services/adminService';
import { countByType, sumBalances } from '../../utils/analytics';
import { formatCurrency } from '../../utils/format';

const SAMPLE = 100; // the backend caps page size at 100

export default function AdminDashboard() {
  // There is no dedicated "statistics" endpoint, so the numbers come from the paginated list endpoints:
  // totals come from `totalElements`; breakdowns use the most recent 100 rows.
  const stats = useFetch(async () => {
    const [users, accounts, txns] = await Promise.all([
      adminService.getUsers({ size: 1 }),
      adminService.getAccounts({ size: SAMPLE }),
      adminService.getTransactions({ size: SAMPLE }),
    ]);
    return { users, accounts, txns };
  }, []);

  if (stats.loading) return <PageLoader label="Loading statistics..." />;
  if (stats.error) return <ErrorState message={stats.error} onRetry={stats.reload} />;

  const { users, accounts, txns } = stats.data;
  const inactive = accounts.content.filter((a) => a.status === 'INACTIVE').length;
  const complete = accounts.totalElements <= SAMPLE;

  return (
    <>
      <PageHeader title="Admin overview" subtitle="Monitor users, accounts and banking activity." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Registered users" value={users.totalElements} />
        <StatCard icon={Landmark} label="Bank accounts" value={accounts.totalElements} tone="blue" hint={complete ? `${formatCurrency(sumBalances(accounts.content))} held in total` : undefined} />
        <StatCard icon={Receipt} label="Transactions" value={txns.totalElements} tone="violet" />
        <StatCard icon={UserX} label="Inactive accounts" value={inactive} tone="amber" hint={complete ? undefined : `Among the latest ${SAMPLE} accounts`} />
      </div>

      <section className="mt-8 grid gap-6 xl:grid-cols-5">
        <div className="card min-w-0 p-5 xl:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Transactions by type</h2>
          <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">Latest {Math.min(SAMPLE, txns.totalElements)} transactions</p>
          <TypeChart counts={countByType(txns.content)} />
        </div>

        <div className="card min-w-0 xl:col-span-3">
          <div className="flex items-center justify-between p-5 pb-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Latest activity</h2>
            <Link to="/admin/transactions" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
              View all
            </Link>
          </div>
          {txns.content.length === 0 ? (
            <EmptyState icon={Activity} title="No transactions yet" text="Customer activity will show up here." />
          ) : (
            <TransactionTable transactions={txns.content.slice(0, 6)} showAccount />
          )}
        </div>
      </section>
    </>
  );
}
