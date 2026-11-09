import { Link } from 'react-router-dom';
import { LogOut, Wallet } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { PageLoader } from '../../components/common/Spinner';
import { EmptyState, ErrorState } from '../../components/common/States';
import { useAuth } from '../../context/AuthContext';
import { useFetch } from '../../hooks/useFetch';
import { accountService } from '../../services/accountService';
import { formatCurrency, formatDate, initials } from '../../utils/format';

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="text-sm text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="text-sm font-medium text-slate-900 dark:text-slate-100">{children}</dd>
    </div>
  );
}

export default function Profile() {
  const { user, isAdmin, logout } = useAuth();
  // Admins do not own accounts, so only customers load them.
  const accounts = useFetch(() => accountService.getMyAccounts(), [], { enabled: !isAdmin });

  return (
    <>
      <PageHeader title="Profile" subtitle="Your personal information." />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-700 dark:bg-brand-900 dark:text-brand-200">
              {initials(user.name)}
            </span>
            <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">{user.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
            <div className="mt-2"><Badge value={user.role} /></div>
          </div>
          <Button variant="secondary" icon={LogOut} className="mt-6 w-full" onClick={logout}>
            Log out
          </Button>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="card p-6">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Account holder</h2>
            <dl className="mt-2 divide-y divide-slate-100 dark:divide-slate-800">
              <Row label="Full name">{user.name}</Row>
              <Row label="Email">{user.email}</Row>
              <Row label="Role">{user.role}</Row>
              <Row label="Customer ID">{user.id}</Row>
              <Row label="Member since">{formatDate(user.createdAt)}</Row>
            </dl>
          </div>

          {!isAdmin && (
            <div className="card">
              <div className="flex items-center justify-between p-6 pb-3">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Your bank accounts</h2>
                <Link to="/accounts" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">Manage</Link>
              </div>
              {accounts.loading ? (
                <PageLoader />
              ) : accounts.error ? (
                <ErrorState message={accounts.error} onRetry={accounts.reload} />
              ) : accounts.data.length === 0 ? (
                <EmptyState icon={Wallet} title="No accounts yet" />
              ) : (
                <ul className="divide-y divide-slate-100 px-6 pb-3 dark:divide-slate-800">
                  {accounts.data.map((a) => (
                    <li key={a.id}>
                      <Link to={`/accounts/${a.id}`} className="flex items-center justify-between gap-4 py-3 hover:opacity-80">
                        <span>
                          <span className="block font-mono text-sm text-slate-900 dark:text-slate-100">{a.accountNumber}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">{a.accountType}</span>
                        </span>
                        <span className="text-right">
                          <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(a.balance)}</span>
                          <Badge value={a.status} />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
