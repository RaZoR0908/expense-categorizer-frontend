import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  getMonthComparison,
  getMonthlyInsights,
  getYearlyInsights,
} from '../api/insightApi';
import { formatCurrency } from '../utils/formatters';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const currentMonthValue = () => new Date().toISOString().slice(0, 7);
const currentYearValue = () => new Date().getFullYear();

const InsightsPage = () => {
  const [month, setMonth] = useState(currentMonthValue());
  const [year, setYear] = useState(String(currentYearValue()));
  const [comparisonMonths, setComparisonMonths] = useState({
    currentMonth: currentMonthValue(),
    previousMonth: (() => {
      const current = new Date();
      return new Date(current.getFullYear(), current.getMonth() - 1, 1).toISOString().slice(0, 7);
    })(),
  });
  const [monthlyInsights, setMonthlyInsights] = useState(null);
  const [yearlyInsights, setYearlyInsights] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadInsights = useCallback(async () => {
    setLoading(true);
    try {
      const [monthData, yearData, comparisonData] = await Promise.all([
        getMonthlyInsights(month),
        getYearlyInsights(year),
        getMonthComparison(comparisonMonths.currentMonth, comparisonMonths.previousMonth),
      ]);
      setMonthlyInsights(monthData || null);
      setYearlyInsights(yearData || null);
      setComparison(comparisonData || null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load insights');
    } finally {
      setLoading(false);
    }
  }, [comparisonMonths.currentMonth, comparisonMonths.previousMonth, month, year]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadInsights();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadInsights]);

  const chartData = useMemo(
    () => Object.entries(monthlyInsights?.categoryBreakdown || {}).map(([name, value]) => ({ name, value: Number(value) })),
    [monthlyInsights]
  );

  const handleReload = async (event) => {
    event.preventDefault();
    await loadInsights();
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-slate-900/85 p-6 shadow-lg shadow-black/10">
        <form className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end" onSubmit={handleReload}>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Monthly insights</span>
            <input type="month" value={month} onChange={(event) => setMonth(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-violet-400" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Yearly insights</span>
            <input type="number" value={year} onChange={(event) => setYear(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-violet-400" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Comparison month</span>
            <input type="month" value={comparisonMonths.currentMonth} onChange={(event) => setComparisonMonths((current) => ({ ...current, currentMonth: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-violet-400" />
          </label>
          <button type="submit" className="rounded-2xl bg-violet-500 px-5 py-3 font-medium text-white transition hover:bg-violet-400">
            Refresh
          </button>
        </form>

        <label className="mt-4 block max-w-sm">
          <span className="mb-2 block text-sm text-slate-300">Previous month for comparison</span>
          <input type="month" value={comparisonMonths.previousMonth} onChange={(event) => setComparisonMonths((current) => ({ ...current, previousMonth: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-violet-400" />
        </label>
      </section>

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-96 animate-pulse rounded-[2rem] bg-white/5" />
          <div className="h-96 animate-pulse rounded-[2rem] bg-white/5" />
        </div>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ['Monthly spent', formatCurrency(monthlyInsights?.totalSpent)],
              ['Top category', monthlyInsights?.topCategory || 'None'],
              ['Yearly spent', formatCurrency(yearlyInsights?.totalSpent)],
              ['Trend', comparison?.trend || 'Neutral'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
                <p className="text-sm text-slate-400">{label}</p>
                <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/85 p-4 shadow-lg shadow-black/10 flex flex-col">
              <h3 className="text-lg font-semibold text-white">Category breakdown</h3>
              <p className="mt-1 text-sm text-slate-400">Current month spending distribution.</p>
              <div className="mt-3 flex-1 min-h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                    <XAxis dataKey="name" tick={{ fill: '#cbd5e1', fontSize: 12 }} angle={-15} textAnchor="end" height={60} />
                    <YAxis tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        background: '#0f172a',
                        border: '1px solid rgba(148,163,184,0.15)',
                        borderRadius: 16,
                        color: '#e2e8f0',
                      }}
                      formatter={(value) => formatCurrency(value)}
                    />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[2rem] border border-white/10 bg-slate-900/85 p-6 shadow-lg shadow-black/10">
                <h3 className="text-lg font-semibold text-white">Assistant insights</h3>
                <div className="mt-4 space-y-3">
                  {(monthlyInsights?.aiInsights || []).map((insight) => (
                    <div key={insight} className="rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                      {insight}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 p-6">
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/80">Comparison</p>
                <p className="mt-3 text-2xl font-semibold text-white">
                  {comparison?.currentMonthSpent ? formatCurrency(comparison.currentMonthSpent) : '—'} vs {comparison?.previousMonthSpent ? formatCurrency(comparison.previousMonthSpent) : '—'}
                </p>
                <p className="mt-2 text-sm text-slate-200/80">
                  Difference: {comparison?.difference ? formatCurrency(comparison.difference) : '—'}
                </p>
                <p className="mt-1 text-sm text-slate-200/80">
                  Percentage change: {comparison?.percentageChange != null ? `${comparison.percentageChange.toFixed(1)}%` : '—'}
                </p>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default InsightsPage;
