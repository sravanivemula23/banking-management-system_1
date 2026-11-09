import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import AuthLayout from '../../components/layout/AuthLayout';
import { homeFor } from '../../components/layout/ProtectedRoute';
import Button from '../../components/common/Button';
import { Input } from '../../components/common/Field';
import { InlineError } from '../../components/common/States';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/errors';
import { hasErrors, validateEmail } from '../../utils/validators';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: location.state?.email ?? '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setApiError('');
    const found = { email: validateEmail(form.email), password: form.password ? '' : 'Password is required' };
    setErrors(found);
    if (hasErrors(found)) return;

    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      // Send the user back to the page they originally wanted, if it fits their role.
      const from = location.state?.from?.pathname;
      const allowed = from && (user.role === 'ADMIN' ? from.startsWith('/admin') : !from.startsWith('/admin'));
      navigate(allowed ? from : homeFor(user), { replace: true });
    } catch (err) {
      setApiError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to manage your accounts."
      footer={
        <>
          New to NovaBank?{' '}
          <Link to="/register" className="font-medium text-brand-600 hover:underline dark:text-brand-400">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-5" noValidate>
        <InlineError>{apiError}</InlineError>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={set('email')}
          error={errors.email}
        />
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="Enter your password"
          value={form.password}
          onChange={set('password')}
          error={errors.password}
          right={
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="rounded p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />
        <Button type="submit" loading={loading} className="w-full py-2.5">
          Sign in
        </Button>
      </form>
    </AuthLayout>
  );
}
