import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { TRANSACTION_TYPES, TYPE_LABELS } from '../../utils/format';

/** counts: { DEPOSIT: 4, WITHDRAWAL: 2, ... } */
export default function TypeChart({ counts }) {
  const data = TRANSACTION_TYPES.map((t) => ({ name: TYPE_LABELS[t], count: counts[t] || 0 }));
  return (
    <div className="h-64 w-full text-slate-500 dark:text-slate-400">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.2} vertical={false} />
          <XAxis dataKey="name" tick={{ fill: 'currentColor', fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis allowDecimals={false} tick={{ fill: 'currentColor', fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip cursor={{ fill: 'currentColor', fillOpacity: 0.08 }} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }} />
          <Bar dataKey="count" name="Transactions" fill="#0d9488" radius={[4, 4, 0, 0]} maxBarSize={44} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
