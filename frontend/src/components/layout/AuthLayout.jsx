import { Landmark, ShieldCheck, TrendingUp, Zap } from 'lucide-react';

const points = [
  { icon: ShieldCheck, text: 'JWT-secured sessions and BCrypt-hashed passwords' },
  { icon: Zap, text: 'Instant deposits, withdrawals and atomic transfers' },
  { icon: TrendingUp, text: 'Clear transaction history and spending insights' },
];

/** Split-screen shell used by the Login and Register pages. */
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-slate-900 p-12 text-slate-300 lg:flex">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Landmark className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold text-white">NovaBank</span>
        </div>
        <div>
          <h2 className="max-w-md text-3xl font-bold leading-tight text-white">Banking made simple, secure and transparent.</h2>
          <ul className="mt-8 space-y-4">
            {points.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm">
                <Icon className="h-5 w-5 text-brand-400" aria-hidden="true" /> {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-slate-500">Educational banking simulation. No real money is involved.</p>
      </div>

      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Landmark className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">NovaBank</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">{footer}</div>
        </div>
      </div>
    </div>
  );
}
