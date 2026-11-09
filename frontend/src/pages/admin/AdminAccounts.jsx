import { useState } from 'react';
import { Landmark, Power } from 'lucide-react';
import { toast } from 'react-toastify';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Pagination from '../../components/common/Pagination';
import { PageLoader } from '../../components/common/Spinner';
import { EmptyState, ErrorState } from '../../components/common/States';
import { useFetch } from '../../hooks/useFetch';
import { adminService } from '../../services/adminService';
import { getErrorMessage } from '../../utils/errors';
import { formatCurrency, formatDate } from '../../utils/format';

export default function AdminAccounts() {
  const [page, setPage] = useState(0);
  const [target, setTarget] = useState(null); // account awaiting confirmation
  const [saving, setSaving] = useState(false);
  const accounts = useFetch(() => adminService.getAccounts({ page, size: 10 }), [page]);
  const data = accounts.data;

  const nextStatus = target?.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

  const apply = async () => {
    setSaving(true);
    try {
      await adminService.updateAccountStatus(target.id, nextStatus);
      toast.success(`Account ${target.accountNumber} is now ${nextStatus.toLowerCase()}`);
      setTarget(null);
      accounts.reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader title="Accounts" subtitle="Review every bank account and activate or deactivate it." />
      <div className="card overflow-hidden">
        {accounts.loading && !data ? (
          <PageLoader label="Loading accounts..." />
        ) : accounts.error ? (
          <ErrorState message={accounts.error} onRetry={accounts.reload} />
        ) : data.content.length === 0 ? (
          <EmptyState icon={Landmark} title="No accounts yet" text="Accounts opened by customers will appear here." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-900/60">
                  <tr>
                    <th className="th">ID</th>
                    <th className="th">Account number</th>
                    <th className="th">Holder</th>
                    <th className="th">Type</th>
                    <th className="th text-right">Balance</th>
                    <th className="th">Status</th>
                    <th className="th">Opened</th>
                    <th className="th text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data.content.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="td text-slate-500">{a.id}</td>
                      <td className="td font-mono text-xs">{a.accountNumber}</td>
                      <td className="td">
                        <span className="font-medium text-slate-900 dark:text-slate-100">{a.ownerName}</span>
                        <span className="block text-xs text-slate-500">User #{a.userId}</span>
                      </td>
                      <td className="td">{a.accountType}</td>
                      <td className="td whitespace-nowrap text-right font-semibold">{formatCurrency(a.balance)}</td>
                      <td className="td"><Badge value={a.status} /></td>
                      <td className="td whitespace-nowrap text-slate-600 dark:text-slate-400">{formatDate(a.createdAt)}</td>
                      <td className="td text-right">
                        <Button variant="secondary" icon={Power} className="px-3 py-1.5" onClick={() => setTarget(a)}>
                          {a.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={data.page} totalPages={data.totalPages} totalElements={data.totalElements} onChange={setPage} />
          </>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(target)}
        title={`${nextStatus === 'INACTIVE' ? 'Deactivate' : 'Activate'} account?`}
        confirmLabel={nextStatus === 'INACTIVE' ? 'Deactivate' : 'Activate'}
        variant={nextStatus === 'INACTIVE' ? 'danger' : 'primary'}
        loading={saving}
        onConfirm={apply}
        onCancel={() => setTarget(null)}
      >
        {target && (
          <p>
            Account <span className="font-mono font-medium">{target.accountNumber}</span> ({target.ownerName}) will be set to{' '}
            <strong>{nextStatus}</strong>.{' '}
            {nextStatus === 'INACTIVE' && 'The customer will not be able to deposit, withdraw or transfer from or to it.'}
          </p>
        )}
      </ConfirmDialog>
    </>
  );
}
