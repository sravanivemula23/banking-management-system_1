import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Receipt, Search, Wallet, X } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Pagination from '../../components/common/Pagination';
import { Input, Select } from '../../components/common/Field';
import { PageLoader } from '../../components/common/Spinner';
import { EmptyState, ErrorState, InlineError } from '../../components/common/States';
import TransactionTable from '../../components/transactions/TransactionTable';
import { useFetch } from '../../hooks/useFetch';
import { useMyAccounts } from '../../hooks/useMyAccounts';
import { transactionService } from '../../services/transactionService';
import { getErrorMessage } from '../../utils/errors';
import { TRANSACTION_TYPES, TYPE_LABELS } from '../../utils/format';

const PAGE_SIZE = 10;

export default function Transactions() {
  const [params] = useSearchParams();
  const { accounts, loading: accountsLoading, error: accountsError, reload: reloadAccounts } = useMyAccounts();

  const [selected, setSelected] = useState(params.get('account') || '');
  const [type, setType] = useState('');
  const [direction, setDirection] = useState('desc');
  const [page, setPage] = useState(0);

  // Search by transaction ID (reference)
  const [reference, setReference] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');

  const accountId = selected || accounts[0]?.id;
  const history = useFetch(
    () => transactionService.history(accountId, { type, page, size: PAGE_SIZE, direction }),
    [accountId, type, direction, page],
    { enabled: Boolean(accountId) },
  );

  const search = async (e) => {
    e.preventDefault();
    const value = reference.trim();
    if (!value) return;
    setSearching(true);
    setSearchError('');
    setSearchResult(null);
    try {
      setSearchResult(await transactionService.getByReference(value));
    } catch (err) {
      setSearchError(
        err.response?.status === 404 ? 'No transaction found with that ID.' : getErrorMessage(err),
      );
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = () => {
    setReference('');
    setSearchResult(null);
    setSearchError('');
  };

  if (accountsLoading) return <PageLoader label="Loading..." />;
  if (accountsError) return <ErrorState message={accountsError} onRetry={reloadAccounts} />;

  if (accounts.length === 0) {
    return (
      <>
        <PageHeader title="Transactions" />
        <div className="card">
          <EmptyState icon={Wallet} title="No accounts yet" text="Open an account to start seeing transactions." />
        </div>
      </>
    );
  }

  const data = history.data;
  return (
    <>
      <PageHeader title="Transactions" subtitle="Browse, filter and look up your transaction history." />

      <div className="card mb-4 grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <Select
          label="Account"
          value={accountId}
          onChange={(e) => {
            setSelected(e.target.value);
            setPage(0);
          }}
        >
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.accountNumber} ({a.accountType})
            </option>
          ))}
        </Select>
        <Select
          label="Type"
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(0);
          }}
        >
          <option value="">All types</option>
          {TRANSACTION_TYPES.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABELS[t]}
            </option>
          ))}
        </Select>
        <Select
          label="Sort by date"
          value={direction}
          onChange={(e) => {
            setDirection(e.target.value);
            setPage(0);
          }}
        >
          <option value="desc">Newest first</option>
          <option value="asc">Oldest first</option>
        </Select>
        <form onSubmit={search} className="flex items-end gap-2">
          <Input
            className="flex-1"
            label="Find by transaction ID"
            placeholder="TXN..."
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
          <Button type="submit" variant="secondary" loading={searching} aria-label="Search" className="h-[38px] px-3">
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {(searchResult || searchError) && (
        <div className="card mb-4 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Search result</h2>
            <button type="button" onClick={clearSearch} className="btn-ghost p-1.5" aria-label="Clear search">
              <X className="h-4 w-4" />
            </button>
          </div>
          {searchError ? (
            <div className="p-4">
              <InlineError>{searchError}</InlineError>
            </div>
          ) : (
            <TransactionTable transactions={[searchResult]} showAccount />
          )}
        </div>
      )}

      <div className="card overflow-hidden">
        {history.loading ? (
          <PageLoader label="Loading transactions..." />
        ) : history.error ? (
          <ErrorState message={history.error} onRetry={history.reload} />
        ) : !data || data.content.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No transactions found"
            text={type ? 'Try a different filter.' : 'Transactions for this account will appear here.'}
          />
        ) : (
          <>
            <TransactionTable transactions={data.content} />
            <Pagination page={data.page} totalPages={data.totalPages} totalElements={data.totalElements} onChange={setPage} />
          </>
        )}
      </div>
    </>
  );
}
