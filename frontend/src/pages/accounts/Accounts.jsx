import { useState } from 'react';
import { Plus, Wallet } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import { PageLoader } from '../../components/common/Spinner';
import { EmptyState, ErrorState } from '../../components/common/States';
import AccountCard from '../../components/accounts/AccountCard';
import CreateAccountModal from '../../components/accounts/CreateAccountModal';
import { useMyAccounts } from '../../hooks/useMyAccounts';

export default function Accounts() {
  const { accounts, loading, error, reload } = useMyAccounts();
  const [creating, setCreating] = useState(false);

  return (
    <>
      <PageHeader
        title="My accounts"
        subtitle="View balances and open new accounts."
        actions={
          <Button icon={Plus} onClick={() => setCreating(true)}>
            New account
          </Button>
        }
      />

      {loading ? (
        <PageLoader label="Loading accounts..." />
      ) : error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : accounts.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Wallet}
            title="No accounts yet"
            text="Open a savings or current account to get started."
            action={
              <Button icon={Plus} onClick={() => setCreating(true)}>
                Open an account
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {accounts.map((a) => (
            <AccountCard key={a.id} account={a} />
          ))}
        </div>
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
