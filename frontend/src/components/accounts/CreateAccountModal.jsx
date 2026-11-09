import { useState } from 'react';
import { toast } from 'react-toastify';
import { Modal } from '../common/ConfirmDialog';
import Button from '../common/Button';
import { Input, Select } from '../common/Field';
import { InlineError } from '../common/States';
import { accountService } from '../../services/accountService';
import { getErrorMessage } from '../../utils/errors';

export default function CreateAccountModal({ open, onClose, onCreated }) {
  const [accountType, setAccountType] = useState('SAVINGS');
  const [initialDeposit, setInitialDeposit] = useState('');
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setAccountType('SAVINGS');
    setInitialDeposit('');
    setError('');
    setFieldError('');
  };

  const close = () => {
    if (loading) return;
    reset();
    onClose();
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const value = initialDeposit.trim();
    if (value && !/^\d+(\.\d{1,2})?$/.test(value)) {
      setFieldError('Enter a valid amount (max 2 decimal places)');
      return;
    }
    setFieldError('');
    setLoading(true);
    try {
      const account = await accountService.create({ accountType, initialDeposit: value ? Number(value) : null });
      toast.success(`Account ${account.accountNumber} created`);
      reset();
      onCreated?.(account);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} title="Open a new account" onClose={close}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <InlineError>{error}</InlineError>
        <Select label="Account type" value={accountType} onChange={(e) => setAccountType(e.target.value)}>
          <option value="SAVINGS">Savings</option>
          <option value="CURRENT">Current</option>
        </Select>
        <Input
          label="Opening deposit (optional)"
          inputMode="decimal"
          placeholder="0.00"
          value={initialDeposit}
          onChange={(e) => setInitialDeposit(e.target.value)}
          error={fieldError}
          hint="Leave empty to open with a zero balance."
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={close} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Create account
          </Button>
        </div>
      </form>
    </Modal>
  );
}
