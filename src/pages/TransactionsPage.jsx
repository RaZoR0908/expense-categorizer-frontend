import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { correctTransaction, getAllTransactions, getTransactionsByCategory, getTransactionsByMonth } from '../api/transactionApi';
import { CATEGORIES } from '../utils/categories';
import DropdownSelect from '../components/common/DropdownSelect';
import { formatCurrency, formatDate, formatMonthLabel } from '../utils/formatters';

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const TransactionsPage = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [filters, setFilters] = useState({ month: '', category: '' });
  const [pendingCorrections, setPendingCorrections] = useState({});
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(new Date().getMonth() + 1);
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());

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

      if (currentFilters.category && currentFilters.month) {
        data = (data || []).filter((transaction) => transaction.category === currentFilters.category);
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

  const handleMonthSelect = () => {
    const nextMonth = `${String(pickerYear).padStart(4, '0')}-${String(pickerMonth).padStart(2, '0')}`;
    setFilters((current) => ({ ...current, month: nextMonth }));
    setShowPicker(false);
  };

  const handlePrevMonth = () => {
    if (pickerMonth === 1) {
      setPickerMonth(12);
      setPickerYear((y) => y - 1);
    } else {
      setPickerMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (pickerMonth === 12) {
      setPickerMonth(1);
      setPickerYear((y) => y + 1);
    } else {
      setPickerMonth((m) => m + 1);
    }
  };

  const resetFilters = async () => {
    const next = { month: '', category: '' };
    setFilters(next);
    await loadTransactions(next);
  };

  const applyFilters = async (event) => {
    event.preventDefault();
    await loadTransactions(filters);
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

  const pickerYearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 7 }, (_, index) => currentYear - 3 + index);
  }, []);

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
              <p className="mt-2 text-xl font-semibold text-white">{filters.month ? formatMonthLabel(filters.month) : filters.category || 'None'}</p>
            </div>
          </div>
        </div>

        <form className="mt-6 grid gap-3 md:grid-cols-[1fr_1fr_auto_auto]" onSubmit={applyFilters}>
          <button
            type="button"
            onClick={() => setShowPicker(!showPicker)}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-white outline-none transition hover:bg-white/10 focus:border-violet-400"
          >
            <span className="truncate">{filters.month ? formatMonthLabel(filters.month) : 'Select month and year'}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="ml-3 h-4 w-4 shrink-0 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 2v4M16 2v4M3 9h18M5 5h14a2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
            </svg>
          </button>
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

        {showPicker && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 max-w-xs">
            <div className="flex items-center justify-between gap-2 mb-4">
              <button type="button" onClick={handlePrevMonth} className="p-1 rounded hover:bg-white/10 text-slate-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <select
                value={pickerYear}
                onChange={(e) => setPickerYear(Number(e.target.value))}
                className="rounded border border-white/10 bg-white/5 px-2 py-1 text-sm text-white outline-none"
              >
                {pickerYearOptions.map((year) => (
                  <option key={year} value={year} className="bg-slate-900">
                    {year}
                  </option>
                ))}
              </select>
              <select
                value={pickerMonth}
                onChange={(e) => setPickerMonth(Number(e.target.value))}
                className="rounded border border-white/10 bg-white/5 px-2 py-1 text-sm text-white outline-none"
              >
                {MONTH_NAMES.map((label, index) => (
                  <option key={index} value={index + 1} className="bg-slate-900">
                    {label}
                  </option>
                ))}
              </select>
              <button type="button" onClick={handleNextMonth} className="p-1 rounded hover:bg-white/10 text-slate-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <button
              type="button"
              onClick={handleMonthSelect}
              className="w-full rounded-lg bg-violet-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-violet-400"
            >
              Apply month
            </button>
          </div>
        )}
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
