import { useState } from 'react';
import { Search, Users } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import { Input } from '../../components/common/Field';
import { PageLoader } from '../../components/common/Spinner';
import { EmptyState, ErrorState } from '../../components/common/States';
import { useFetch } from '../../hooks/useFetch';
import { adminService } from '../../services/adminService';
import { formatDateTime } from '../../utils/format';

export default function AdminUsers() {
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState('');
  const users = useFetch(() => adminService.getUsers({ page, size: 10 }), [page]);

  const data = users.data;
  // The backend has no user-search endpoint, so this filters the rows of the current page only.
  const q = query.trim().toLowerCase();
  const rows = (data?.content ?? []).filter((u) => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));

  return (
    <>
      <PageHeader title="Users" subtitle="All registered customers and administrators." />
      <div className="card overflow-hidden">
        <div className="border-b border-slate-200 p-4 dark:border-slate-800">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <Input aria-label="Filter users on this page" placeholder="Filter this page by name or email" className="[&_input]:pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>

        {users.loading ? (
          <PageLoader label="Loading users..." />
        ) : users.error ? (
          <ErrorState message={users.error} onRetry={users.reload} />
        ) : rows.length === 0 ? (
          <EmptyState icon={Users} title="No users found" text={q ? 'No one on this page matches your filter.' : undefined} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-900/60">
                  <tr>
                    <th className="th">ID</th>
                    <th className="th">Name</th>
                    <th className="th">Email</th>
                    <th className="th">Role</th>
                    <th className="th">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {rows.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="td text-slate-500">{u.id}</td>
                      <td className="td font-medium text-slate-900 dark:text-slate-100">{u.name}</td>
                      <td className="td">{u.email}</td>
                      <td className="td"><Badge value={u.role} /></td>
                      <td className="td whitespace-nowrap text-slate-600 dark:text-slate-400">{formatDateTime(u.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={data.page} totalPages={data.totalPages} totalElements={data.totalElements} onChange={setPage} />
          </>
        )}
      </div>
    </>
  );
}
