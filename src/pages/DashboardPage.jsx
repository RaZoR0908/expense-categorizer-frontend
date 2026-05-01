import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllBudgets, getBudgetStatus } from '../api/budgetApi';
import { getAllTransactions } from '../api/transactionApi';
import { getMonthlyInsights } from '../api/insightApi';
import { formatCurrency, formatDate } from '../utils/formatters';

const statCard = (label, value, subtext) => ({ label, value, subtext });

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [monthlyInsights, setMonthlyInsights] = useState(null);
  const [budgetStatus, setBudgetStatus] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [txnData, budgetData, insightData, statusData] = await Promise.all([
          getAllTransactions(),
          getAllBudgets(),
          getMonthlyInsights(),
          getBudgetStatus(),
        ]);
        setTransactions(txnData || []);
        setBudgets(budgetData || []);
        setMonthlyInsights(insightData || null);
        setBudgetStatus(statusData || null);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const totalSpent = monthlyInsights?.totalSpent ?? transactions.reduce((sum, txn) => sum + Number(txn.amount || 0), 0);
    const topCategory = monthlyInsights?.topCategory || 'No data yet';
    const warningCount = budgetStatus?.warningCount ?? 0;
    const exceededCount = budgetStatus?.exceededCount ?? 0;

    return [
      statCard('Monthly spend', formatCurrency(totalSpent), `${transactions.length} transactions`),
      statCard('Budgets', `${budgets.length}`, `${warningCount} warning · ${exceededCount} exceeded`),
      statCard('Top category', topCategory, 'Based on current month insight'),
      statCard('Budget remaining', formatCurrency(budgetStatus?.totalRemaining ?? 0), 'Across all categories'),
    ];
  }, [budgetStatus, budgets.length, monthlyInsights, transactions]);

  const breakdownEntries = Object.entries(monthlyInsights?.categoryBreakdown || {})
    .sort(([, a], [, b]) => Number(b) - Number(a))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-28 animate-pulse rounded-[2rem] bg-white/5" />
        <div className="grid gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-28 animate-pulse rounded-[1.75rem] bg-white/5" />
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
          <div className="h-96 animate-pulse rounded-[2rem] bg-white/5" />
          <div className="h-96 animate-pulse rounded-[2rem] bg-white/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-violet-300/80">Workspace overview</p>
            <h2 className="mt-3 text-3xl font-semibold text-white lg:text-5xl">
              Your expense activity at a glance.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 lg:text-base">
              Review spending patterns, monitor budgets, and move quickly into upload, insights, or chat when you need to investigate something.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Link to="/upload" className="rounded-2xl border border-white/10 bg-violet-500/10 px-4 py-3 text-sm font-medium text-violet-200 transition hover:bg-violet-500/20">
              Upload a new statement
            </Link>
            <Link to="/chat" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10">
              Ask the finance assistant
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        {stats.map((card) => (
          <div key={card.label} className="rounded-[1.75rem] border border-white/10 bg-slate-900/80 p-5 shadow-lg shadow-black/10">
            <p className="text-sm text-slate-400">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-white">{card.value}</p>
            <p className="mt-2 text-sm text-slate-500">{card.subtext}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/85 p-6 shadow-lg shadow-black/10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Recent transactions</h3>
              <p className="text-sm text-slate-400">Latest entries saved in the backend.</p>
            </div>
            <Link to="/transactions" className="text-sm font-medium text-violet-300 hover:text-violet-200">View all</Link>
          </div>

          <div className="mt-5 space-y-3">
            {transactions.slice(0, 6).map((transaction) => (
              <div key={transaction.id} className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-white">{transaction.merchant}</p>
                  <p className="text-sm text-slate-400">{formatDate(transaction.date)} · {transaction.category || 'Uncategorized'}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-white">{formatCurrency(transaction.amount)}</p>
                  <p className="text-xs text-slate-500">Confidence {Number(transaction.confidenceScore || 0).toFixed(2)}</p>
                </div>
              </div>
            ))}

            {transactions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-slate-500">
                No transactions yet. Upload a statement to start populating the dashboard.
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/85 p-6 shadow-lg shadow-black/10">
            <h3 className="text-lg font-semibold text-white">Category breakdown</h3>
            <p className="text-sm text-slate-400">Top categories for the current month.</p>

            <div className="mt-5 space-y-4">
              {breakdownEntries.length > 0 ? breakdownEntries.map(([category, value]) => (
                <div key={category}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-300">{category}</span>
                    <span className="text-slate-500">{formatCurrency(value)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                      style={{ width: `${Math.min(100, (Number(value) / (monthlyInsights?.totalSpent || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              )) : (
                <p className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-sm text-slate-500">
                  No monthly insights available yet.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-violet-200/80">Budget health</p>
            <p className="mt-3 text-2xl font-semibold text-white">
              {budgetStatus ? `${budgetStatus.onTrackCount} on track` : 'Connect budgets to see status'}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-200/80">
              Use budgets to get warnings before a category goes over the limit and keep the assistant context meaningful.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
