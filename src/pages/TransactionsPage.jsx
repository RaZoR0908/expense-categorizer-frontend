import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { correctTransaction, getAllTransactions, getTransactionsByCategory, getTransactionsByMonth } from '../api/transactionApi';
import { CATEGORIES } from '../utils/categories';
import DropdownSelect from '../components/common/DropdownSelect';
import { formatCurrency, formatDate } from '../utils/formatters';

const TransactionsPage = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState({ month: '', category: '' });
  const [pendingCorrections, setPendingCorrections] = useState({});

  const loadTransactions = useCallback(async (currentFilters = filters) => {
    setLoading(true);
    try {
      let data;
      if (currentFilters.month) {
        data = await getTransactionsByMonth(currentFilters.month);
      } else if (currentFilters.category) {
        data = await getTransactionsByCategory(currentFilters.category);
      } else {
        data = await getAllTransactions();
      }
      setTransactions(data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadTransactions();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadTransactions]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const applyFilters = async (event) => {
    event.preventDefault();
    await loadTransactions(filters);
  };

  const resetFilters = async () => {
    const next = { month: '', category: '' };
    setFilters(next);
    await loadTransactions(next);
  };

  const handleCorrection = async (transactionId) => {
    const newCategory = pendingCorrections[transactionId];
    if (!newCategory) {
      toast.error('Choose a new category first');
      return;
    }

    try {
      await correctTransaction(transactionId, newCategory);
      toast.success('Transaction updated');
      await loadTransactions(filters);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update transaction');
    }
  };

  const transactionSummary = useMemo(() => {
    const total = transactions.reduce((sum, txn) => sum + Number(txn.amount || 0), 0);
    return { total, count: transactions.length };
  }, [transactions]);

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-slate-900/85 p-6 shadow-lg shadow-black/10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">Transactions</h2>
            <p className="mt-2 text-sm text-slate-400">Review categorized expenses and correct anything the model missed.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:w-[42rem] lg:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Count</p>
              <p className="mt-2 text-xl font-semibold text-white">{transactionSummary.count}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Total spend</p>
              <p className="mt-2 text-xl font-semibold text-white">{formatCurrency(transactionSummary.total)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Filters</p>
              <p className="mt-2 text-xl font-semibold text-white">{filters.month || filters.category || 'None'}</p>
            </div>
          </div>
        </div>

        <form className="mt-6 grid gap-3 md:grid-cols-[1fr_1fr_auto_auto]" onSubmit={applyFilters}>
          <input
            type="month"
            name="month"
            value={filters.month}
            onChange={handleFilterChange}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-violet-400"
          />
          <DropdownSelect
            options={CATEGORIES}
            value={filters.category}
            onChange={handleFilterChange}
            placeholder="All categories"
            className="w-full sm:w-auto"
          />
          <button type="submit" className="rounded-2xl bg-violet-500 px-5 py-3 font-medium text-white transition hover:bg-violet-400">
            Apply
          </button>
          <button type="button" onClick={resetFilters} className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-medium text-slate-200 transition hover:bg-white/10">
            Reset
          </button>
        </form>
      </section>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((row) => (
            <div key={row} className="h-24 animate-pulse rounded-[1.75rem] bg-white/5" />
          ))}
        </div>
      ) : (
        <section className="space-y-3">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="rounded-[1.75rem] border border-white/10 bg-slate-900/85 p-5 shadow-lg shadow-black/10 overflow-visible">
              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_auto] lg:items-center">
                <div>
                  <h3 className="text-lg font-semibold text-white break-words" title={transaction.merchant || 'Unknown merchant'}>
                    {transaction.merchant || 'Unknown merchant'}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {transaction.isCorrected ? (
                      <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-300">Corrected</span>
                    ) : (
                      <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-medium text-amber-200">AI suggested</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-400">{formatDate(transaction.date)} · {transaction.category || 'Uncategorized'}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/5 bg-white/5 px-3 py-3 min-w-[5.5rem] sm:min-w-[7rem]">
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-300 font-semibold">Amount</p>
                    <p className="mt-2 text-lg font-bold text-white truncate">{formatCurrency(transaction.amount)}</p>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-white/5 px-3 py-3 min-w-[5.5rem] sm:min-w-[6.5rem]">
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-300 font-semibold">Confidence</p>
                    <p className="mt-2 text-lg font-bold text-white truncate">{Number(transaction.confidenceScore || 0).toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 lg:w-72 w-full overflow-visible">
                  <DropdownSelect
                    options={CATEGORIES}
                    value={pendingCorrections[transaction.id] || ''}
                    onChange={(e) => setPendingCorrections((current) => ({ ...current, [transaction.id]: e.target.value }))}
                    placeholder="Correct category"
                    className="w-full"
                  />
                  <button
                    type="button"
                    onClick={() => handleCorrection(transaction.id)}
                    className="rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-3 text-sm font-medium text-white transition hover:scale-[1.01]"
                  >
                    Save correction
                  </button>
                </div>
              </div>
            </div>
          ))}

          {transactions.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-slate-900/70 px-6 py-12 text-center text-slate-400">
              No transactions match the current filters.
            </div>
          ) : null}
        </section>
      )}
    </div>
  );
};

export default TransactionsPage;
