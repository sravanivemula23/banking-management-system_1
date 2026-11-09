import { useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Info, Plus, Send, Wallet } from 'lucide-react';
import { toast } from 'react-toastify';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Input, Select } from '../../components/common/Field';
import { PageLoader } from '../../components/common/Spinner';
import { EmptyState, ErrorState, InlineError } from '../../components/common/States';
import { useMyAccounts } from '../../hooks/useMyAccounts';
import { transferService } from '../../services/transferService';
import { getErrorMessage } from '../../utils/errors';
import { formatCurrency, formatDateTime } from '../../utils/format';
import { hasErrors, validateAmount } from '../../utils/validators';

const newKey = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export default function Transfer() {
  const [params] = useSearchParams();
  const { accounts, loading, error, reload } = useMyAccounts();

  const [fromId, setFromId] = useState(params.get('account') || '');
  const [toId, setToId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  // The idempotency key makes a retry safe: the backend returns the original transfer instead of paying twice.
  // The key only stays the same while the request details are identical; edited details get a fresh key.
  const keyRef = useRef({ fingerprint: '', key: '' });

  if (loading) return <PageLoader />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const active = accounts.filter((a) => a.status === 'ACTIVE');
  if (active.length === 0) {
    return (
      <>
        <PageHeader title="Transfer money" />
        <div className="card">
          <EmptyState
            icon={Wallet}
            title={accounts.length ? 'No active accounts' : 'No accounts yet'}
            text={accounts.length ? 'Your accounts are inactive. Please contact the bank.' : 'Open an account to send money.'}
            action={
              !accounts.length && (
                <Link to="/accounts" className="btn-primary">
                  <Plus className="h-4 w-4" /> Open an account
                </Link>
              )
            }
          />
        </div>
      </>
    );
  }

  const from = active.find((a) => String(a.id) === String(fromId)) ?? active[0];
  const ownOthers = accounts.filter((a) => a.id !== from.id && a.status === 'ACTIVE');

  const validate = () => {
    const found = {
      to: !toId.trim()
        ? 'Recipient account ID is required'
        : !/^[1-9]\d*$/.test(toId.trim())
          ? 'Enter a valid numeric account ID'
          : Number(toId) === from.id
            ? 'Sender and recipient must be different accounts'
            : '',
      amount: validateAmount(amount, { max: Number(from.balance) }),
    };
    setErrors(found);
    return !hasErrors(found);
  };

  const review = (e) => {
    e.preventDefault();
    setApiError('');
    if (validate()) setConfirming(true);
  };

  const confirm = async () => {
    const payload = {
      fromAccountId: from.id,
      toAccountId: Number(toId),
      amount: Number(amount),
      description: description.trim(),
    };
    const fingerprint = JSON.stringify(payload);
    if (keyRef.current.fingerprint !== fingerprint) keyRef.current = { fingerprint, key: newKey() };

    setSubmitting(true);
    try {
      const transfer = await transferService.transfer({ ...payload, idempotencyKey: keyRef.current.key });
      keyRef.current = { fingerprint: '', key: '' };
      setResult({ ...transfer, toAccountId: payload.toAccountId });
      toast.success('Transfer completed');
      setConfirming(false);
      reload();
    } catch (err) {
      setConfirming(false);
      setApiError(getErrorMessage(err));
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setResult(null);
    setToId('');
    setAmount('');
    setDescription('');
    setErrors({});
    setApiError('');
  };

  if (result) {
    return (
      <>
        <PageHeader title="Transfer money" />
        <div className="card mx-auto max-w-xl p-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950">
            <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
          </span>
          <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Transfer successful</h2>
          <p className="mt-1 text-3xl font-bold text-brand-600 dark:text-brand-400">{formatCurrency(result.amount)}</p>
          <dl className="mx-auto mt-6 max-w-xs space-y-2 text-left text-sm">
            <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Transfer ID</dt><dd className="font-medium">#{result.transferId}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">From account ID</dt><dd className="font-medium">{result.fromAccountId}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">To account ID</dt><dd className="font-medium">{result.toAccountId}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Status</dt><dd className="font-medium">{result.status}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500 dark:text-slate-400">Date</dt><dd className="font-medium">{formatDateTime(result.createdAt)}</dd></div>
          </dl>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button variant="secondary" onClick={reset}>Make another transfer</Button>
            <Link to={`/transactions?account=${result.fromAccountId}`} className="btn-primary">View transactions</Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Transfer money" subtitle="Send money to another account instantly." />

      <div className="mx-auto max-w-xl space-y-4">
        <div className="flex gap-3 rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-800 dark:border-sky-900 dark:bg-sky-950/50 dark:text-sky-200">
          <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            The bank identifies recipients by their <strong>account ID</strong> (shown under &ldquo;Account details&rdquo;), not
            by account number.
          </p>
        </div>

        <form onSubmit={review} className="card space-y-4 p-6" noValidate>
          <InlineError>{apiError}</InlineError>
          <Select
            label="From account"
            value={from.id}
            onChange={(e) => {
              setFromId(e.target.value);
              setErrors({});
            }}
            hint={`Available balance: ${formatCurrency(from.balance)}`}
          >
            {active.map((a) => (
              <option key={a.id} value={a.id}>
                {a.accountNumber} ({a.accountType}) - {formatCurrency(a.balance)}
              </option>
            ))}
          </Select>

          <Input
            label="Recipient account ID"
            inputMode="numeric"
            placeholder="e.g. 12"
            value={toId}
            onChange={(e) => setToId(e.target.value)}
            error={errors.to}
          />
          {ownOthers.length > 0 && (
            <Select label="...or pick one of your own accounts" value="" onChange={(e) => e.target.value && setToId(e.target.value)}>
              <option value="">Choose an account</option>
              {ownOthers.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.accountNumber} (ID {a.id})
                </option>
              ))}
            </Select>
          )}

          <Input label="Amount" inputMode="decimal" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} error={errors.amount} />
          <Input label="Description (optional)" maxLength={255} placeholder="e.g. Rent for November" value={description} onChange={(e) => setDescription(e.target.value)} />

          <Button type="submit" icon={Send} className="w-full py-2.5">
            Review transfer
          </Button>
        </form>
      </div>

      <ConfirmDialog
        open={confirming}
        title="Confirm transfer"
        confirmLabel="Send money"
        loading={submitting}
        onConfirm={confirm}
        onCancel={() => setConfirming(false)}
      >
        <p className="mb-4">Please check the details. Transfers cannot be undone.</p>
        <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
          <p className="text-center text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(Number(amount || 0))}</p>
          <div className="mt-3 flex items-center justify-center gap-3 text-xs">
            <span className="rounded bg-white px-2 py-1 font-mono dark:bg-slate-700">{from.accountNumber}</span>
            <ArrowRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
            <span className="rounded bg-white px-2 py-1 font-mono dark:bg-slate-700">Account ID {toId}</span>
          </div>
          {description.trim() && <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">&ldquo;{description.trim()}&rdquo;</p>}
        </div>
      </ConfirmDialog>
    </>
  );
}
