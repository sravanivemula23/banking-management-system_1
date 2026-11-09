import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import AuthLayout from '../../components/layout/AuthLayout';
import Button from '../../components/common/Button';
import { Input } from '../../components/common/Field';
import { InlineError } from '../../components/common/States';
import { authService } from '../../services/authService';
import { getErrorMessage } from '../../utils/errors';
import { hasErrors, validateEmail, validateName, validatePassword } from '../../utils/validators';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setApiError('');
    const found = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      confirm: !form.confirm ? 'Please confirm your password' : form.confirm !== form.password ? 'Passwords do not match' : '',
    };
    setErrors(found);
    if (hasErrors(found)) return;

    setLoading(true);
    try {
      await authService.register(form);
      toast.success('Account created. Please sign in.');
      navigate('/login', { replace: true, state: { email: form.email.trim() } });
    } catch (err) {
      setApiError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const toggle = (
    <button
      type="button"
      onClick={() => setShowPassword((s) => !s)}
      className="rounded p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
      aria-label={showPassword ? 'Hide password' : 'Show password'}
    >
      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Register as a customer to open bank accounts."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:underline dark:text-brand-400">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <InlineError>{apiError}</InlineError>
        <Input label="Full name" autoComplete="name" placeholder="Asha Verma" value={form.name} onChange={set('name')} error={errors.name} />
        <Input label="Email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={set('email')} error={errors.email} />
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={form.password}
          onChange={set('password')}
          error={errors.password}
          hint="8-72 characters, with letters and digits."
          right={toggle}
        />
        <Input
          label="Confirm password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Re-enter your password"
          value={form.confirm}
          onChange={set('confirm')}
          error={errors.confirm}
        />
        <Button type="submit" loading={loading} className="w-full py-2.5">
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
