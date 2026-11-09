import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowDownToLine, ArrowUpFromLine, CheckCircle2, Plus, Wallet } from 'lucide-react';
import { toast } from 'react-toastify';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import { Input, Select } from '../../components/common/Field';
import { PageLoader } from '../../components/common/Spinner';
import { EmptyState, ErrorState, InlineError } from '../../components/common/States';
import { useMyAccounts } from '../../hooks/useMyAccounts';
import { transactionService } from '../../services/transactionService';
import { getErrorMessage } from '../../utils/errors';
import { formatCurrency } from '../../utils/format';
import { validateAmount } from '../../utils/validators';

export default function DepositWithdraw() {
  const [params] = useSearchParams();
  const { accounts, loading, error, reload } = useMyAccounts();

  const [mode, setMode] = useState(params.get('mode') === 'withdraw' ? 'withdraw' : 'deposit');
  const [selected, setSelected] = useState(params.get('account') || '');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [amountError, setAmountError] = useState('');
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  if (loading) return <PageLoader />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const active = accounts.filter((a) => a.status === 'ACTIVE');
  if (accounts.length === 0) {
    return (
      <>
        <PageHeader title="Deposit & Withdraw" />
        <div className="card">
          <EmptyState
            icon={Wallet}
            title="No accounts yet"
            text="Open an account first."
            action={
              <Link to="/accounts" className="btn-primary">
                <Plus className="h-4 w-4" /> Open an account
              </Link>
            }
          />
        </div>
      </>
    );
  }

  const account = active.find((a) => String(a.id) === String(selected)) ?? active[0];
  const isWithdraw = mode === 'withdraw';

  const submit = async (e) => {
    e.preventDefault();
    setApiError('');
    const problem = validateAmount(amount, isWithdraw ? { max: Number(account?.balance) } : {});
    setAmountError(problem);
    if (problem || !account) return;

    setSubmitting(true);
    try {
      const payload = { accountId: account.id, amount: Number(amount), description: description.trim() };
      const txn = isWithdraw ? await transactionService.withdraw(payload) : await transactionService.deposit(payload);
      setResult(txn);
      toast.success(isWithdraw ? 'Withdrawal successful' : 'Deposit successful');
      setAmount('');
      setDescription('');
      reload(); // refresh balances
    } catch (err) {
      setApiError(getErrorMessage(err));
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const tabClass = (active) =>
    `flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
      active ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
    }`;

  return (
    <>
      <PageHeader title="Deposit & Withdraw" subtitle="Add money to or take money out of one of your accounts." />

      <div className="mx-auto max-w-xl">
        {active.length === 0 ? (
          <InlineError>All of your accounts are inactive. Please contact the bank.</InlineError>
        ) : (
          <div className="card p-6">
            <div className="mb-6 flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800" role="tablist">
              <button type="button" role="tab" aria-selected={!isWithdraw} className={tabClass(!isWithdraw)} onClick={() => { setMode('deposit'); setResult(null); setAmountError(''); setApiError(''); }}>
                <ArrowDownToLine className="h-4 w-4" /> Deposit
              </button>
              <button type="button" role="tab" aria-selected={isWithdraw} className={tabClass(isWithdraw)} onClick={() => { setMode('withdraw'); setResult(null); setAmountError(''); setApiError(''); }}>
                <ArrowUpFromLine className="h-4 w-4" /> Withdraw
              </button>
            </div>

            {result && (
              <div className="mb-5 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-semibold">
                    {formatCurrency(result.amount)} {result.transactionType === 'DEPOSIT' ? 'deposited' : 'withdrawn'}
                  </p>
                  <p className="mt-0.5">New balance: {formatCurrency(result.balanceAfter)}</p>
                  <p className="mt-0.5 break-all font-mono text-xs opacity-80">Ref: {result.transactionReference}</p>
                </div>
              </div>
            )}

            <form onSubmit={submit} className="space-y-4" noValidate>
              <InlineError>{apiError}</InlineError>
              <Select
                label="Account"
                value={account?.id ?? ''}
                onChange={(e) => {
                  setSelected(e.target.value);
                  setResult(null);
                }}
                hint={account ? `Available balance: ${formatCurrency(account.balance)}` : undefined}
              >
                {active.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.accountNumber} ({a.accountType})
                  </option>
                ))}
              </Select>
              <Input
                label="Amount"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                error={amountError}
              />
              <Input
                label="Description (optional)"
                maxLength={255}
                placeholder={isWithdraw ? 'e.g. Cash withdrawal' : 'e.g. Salary'}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Button type="submit" loading={submitting} variant={isWithdraw ? 'secondary' : 'primary'} className="w-full py-2.5">
                {isWithdraw ? 'Withdraw money' : 'Deposit money'}
              </Button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
