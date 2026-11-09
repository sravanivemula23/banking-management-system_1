import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCurrency } from '../../utils/format';

const compact = new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 });

/** data: [{ month: 'Jan', In: 1200, Out: 300 }, ...] */
export default function MonthlyChart({ data }) {
  return (
    <div className="h-72 w-full text-slate-500 dark:text-slate-400">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.2} vertical={false} />
          <XAxis dataKey="month" tick={{ fill: 'currentColor', fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis
            tick={{ fill: 'currentColor', fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => compact.format(v)}
          />
          <Tooltip
            formatter={(value) => formatCurrency(value)}
            cursor={{ fill: 'currentColor', fillOpacity: 0.08 }}
            contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13 }}
          />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="In" name="Money in" fill="#0d9488" radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar dataKey="Out" name="Money out" fill="#e11d48" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
