import { useState } from 'react';
import { Receipt } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Pagination from '../../components/common/Pagination';
import { Select } from '../../components/common/Field';
import { PageLoader } from '../../components/common/Spinner';
import { EmptyState, ErrorState } from '../../components/common/States';
import TransactionTable from '../../components/transactions/TransactionTable';
import { useFetch } from '../../hooks/useFetch';
import { adminService } from '../../services/adminService';
import { TRANSACTION_TYPES, TYPE_LABELS } from '../../utils/format';

export default function AdminTransactions() {
  const [type, setType] = useState('');
  const [direction, setDirection] = useState('desc');
  const [page, setPage] = useState(0);
  const txns = useFetch(() => adminService.getTransactions({ type, direction, page, size: 10 }), [type, direction, page]);
  const data = txns.data;

  return (
    <>
      <PageHeader title="Transactions" subtitle="Monitor every transaction across the bank." />
      <div className="card mb-4 grid gap-4 p-4 sm:grid-cols-2 lg:max-w-xl">
        <Select label="Type" value={type} onChange={(e) => { setType(e.target.value); setPage(0); }}>
          <option value="">All types</option>
          {TRANSACTION_TYPES.map((t) => (
            <option key={t} value={t}>{TYPE_LABELS[t]}</option>
          ))}
        </Select>
        <Select label="Sort by date" value={direction} onChange={(e) => { setDirection(e.target.value); setPage(0); }}>
          <option value="desc">Newest first</option>
          <option value="asc">Oldest first</option>
        </Select>
      </div>

      <div className="card overflow-hidden">
        {txns.loading && !data ? (
          <PageLoader label="Loading transactions..." />
        ) : txns.error ? (
          <ErrorState message={txns.error} onRetry={txns.reload} />
        ) : data.content.length === 0 ? (
          <EmptyState icon={Receipt} title="No transactions found" text={type ? 'Try a different filter.' : undefined} />
        ) : (
          <>
            <TransactionTable transactions={data.content} showAccount />
            <Pagination page={data.page} totalPages={data.totalPages} totalElements={data.totalElements} onChange={setPage} />
          </>
        )}
      </div>
    </>
  );
}
