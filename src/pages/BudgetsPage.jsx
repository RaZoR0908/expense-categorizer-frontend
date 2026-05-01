import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { createBudget, deleteBudget, getAllBudgets, getBudgetStatus } from '../api/budgetApi';
import DropdownSelect from '../components/common/DropdownSelect';
import { CATEGORIES } from '../utils/categories';
import { formatCurrency } from '../utils/formatters';

const BudgetsPage = () => {
  const [loading, setLoading] = useState(true);
  const [budgets, setBudgets] = useState([]);
  const [status, setStatus] = useState(null);
  const [form, setForm] = useState({ category: '', monthlyLimit: '' });
  const [submitting, setSubmitting] = useState(false);

  const loadBudgets = useCallback(async () => {
    setLoading(true);
    try {
      const [budgetData, statusData] = await Promise.all([
        getAllBudgets(),
        getBudgetStatus(),
      ]);
      setBudgets(budgetData || []);
      setStatus(statusData || null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load budgets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadBudgets();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadBudgets]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.category || !form.monthlyLimit) {
      toast.error('Choose a category and limit');
      return;
    }

    setSubmitting(true);
    try {
      await createBudget(form.category, form.monthlyLimit);
      toast.success('Budget created');
      setForm({ category: '', monthlyLimit: '' });
      await loadBudgets();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create budget');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBudget(id);
      toast.success('Budget deleted');
      await loadBudgets();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete budget');
    }
  };

  const totals = useMemo(() => ({
    budgeted: status?.totalBudgeted ?? budgets.reduce((sum, budget) => sum + Number(budget.monthlyLimit || 0), 0),
    spent: status?.totalSpent ?? 0,
    remaining: status?.totalRemaining ?? 0,
  }), [budgets, status]);

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="h-72 animate-pulse rounded-[2rem] bg-white/5" />
          <div className="h-72 animate-pulse rounded-[2rem] bg-white/5" />
        </div>
      ) : null}
      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border border-white/10 bg-slate-900/85 p-6 shadow-lg shadow-black/10">
          <h2 className="text-2xl font-semibold text-white">Budgets</h2>
          <p className="mt-2 text-sm text-slate-400">Create monthly limits and monitor category usage across the current month.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <DropdownSelect
              name="category"
              value={form.category}
              onChange={handleChange}
              options={CATEGORIES}
              placeholder="Select category"
              emptyOptionLabel="Select category"
              className="w-full"
            />
            <input
              type="number"
              name="monthlyLimit"
              value={form.monthlyLimit}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-violet-400"
              placeholder="Monthly limit"
            />
            <button
              type="submit"
              disabled={submitting}
              className="rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-3 font-medium text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? 'Saving...' : 'Create budget'}
            </button>
          </form>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ['Budgeted', formatCurrency(totals.budgeted)],
            ['Spent', formatCurrency(totals.spent)],
            ['Remaining', formatCurrency(totals.remaining)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[2rem] border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-slate-400">{label}</p>
              <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-slate-900/85 p-6 shadow-lg shadow-black/10">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white">Budget status</h3>
            <p className="text-sm text-slate-400">Track progress for each category in the current month.</p>
          </div>
          <div className="text-right text-sm text-slate-400">
            <p>{status?.warningCount ?? 0} warnings</p>
            <p>{status?.exceededCount ?? 0} exceeded</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {(status?.budgets || budgets).map((budget) => {
            const usage = budget.percentageUsed ?? 0;
            const progressColor = budget.status === 'EXCEEDED'
              ? 'from-rose-500 to-red-500'
              : budget.status === 'WARNING'
                ? 'from-amber-500 to-orange-500'
                : 'from-violet-500 to-fuchsia-500';

            return (
              <div key={budget.id} className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-base font-semibold text-white">{budget.category}</p>
                      <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-slate-300">{budget.status || 'UNTRACKED'}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">Limit {formatCurrency(budget.monthlyLimit)} · Spent {formatCurrency(budget.actualSpent || 0)}</p>
                  </div>

                  {'actualSpent' in budget ? null : (
                    <button
                      type="button"
                      onClick={() => handleDelete(budget.id)}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:bg-rose-500/10 hover:text-rose-300"
                    >
                      Delete
                    </button>
                  )}
                </div>

                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between text-sm text-slate-400">
                    <span>{usage.toFixed(1)}% used</span>
                    <span>{formatCurrency(budget.remaining || 0)} remaining</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5">
                    <div className={`h-2 rounded-full bg-gradient-to-r ${progressColor}`} style={{ width: `${Math.min(100, usage)}%` }} />
                  </div>
                </div>
              </div>
            );
          })}

          {budgets.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-white/10 px-6 py-12 text-center text-slate-400">
              No budgets created yet.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
};

export default BudgetsPage;
