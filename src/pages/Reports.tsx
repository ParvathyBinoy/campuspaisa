import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateNetCashFlow,
  calculateCategoryBreakdown,
  calculateEssentialBreakdown,
  calculatePaymentMethodBreakdown,
  filterTransactionsByMonth,
} from '../utils/calculations';
import { formatCurrency } from '../utils/currency';
import { formatMonthYear, formatDateDisplay } from '../utils/dates';
import { exportTransactionsToCSV } from '../utils/export';
import {
  BarChart3,
  Download,
  Calendar,
  PieChart as PieIcon,
  TrendingUp,
  TrendingDown,
  Scale,
  ShieldCheck,
  CreditCard,
  Lightbulb,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const Reports: React.FC = () => {
  const { transactions, categories, selectedMonth, settings } = useFinance();

  const [dateFilterMode, setDateFilterMode] = useState<'month' | 'custom'>('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Active transaction pool
  const activeTransactions = useMemo(() => {
    if (dateFilterMode === 'month') {
      return filterTransactionsByMonth(transactions, selectedMonth);
    }
    return transactions.filter(t => {
      if (customStart && t.date < customStart) return false;
      if (customEnd && t.date > customEnd) return false;
      return true;
    });
  }, [transactions, selectedMonth, dateFilterMode, customStart, customEnd]);

  const totalIncome = useMemo(() => calculateTotalIncome(activeTransactions), [activeTransactions]);
  const totalExpenses = useMemo(() => calculateTotalExpenses(activeTransactions), [activeTransactions]);
  const netCashFlow = useMemo(() => calculateNetCashFlow(activeTransactions), [activeTransactions]);

  const categoryBreakdown = useMemo(
    () => calculateCategoryBreakdown(activeTransactions, categories, 'expense'),
    [activeTransactions, categories]
  );

  const essentialBreakdown = useMemo(
    () => calculateEssentialBreakdown(activeTransactions),
    [activeTransactions]
  );

  const paymentBreakdown = useMemo(
    () => calculatePaymentMethodBreakdown(activeTransactions),
    [activeTransactions]
  );

  // Month-by-month trend for past 6 months
  const monthlyTrends = useMemo(() => {
    const list: string[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      list.push(ym);
    }

    return list.map(m => {
      const monthTxs = filterTransactionsByMonth(transactions, m);
      const inc = calculateTotalIncome(monthTxs);
      const exp = calculateTotalExpenses(monthTxs);
      return {
        month: new Date(m + '-01').toLocaleDateString('en-US', { month: 'short' }),
        Income: inc,
        Expenses: exp,
        Savings: inc - exp,
      };
    });
  }, [transactions]);

  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0;

  const handleExportCSV = () => {
    exportTransactionsToCSV(
      activeTransactions,
      categories,
      `campuspaisa-analytics-${dateFilterMode === 'month' ? selectedMonth : 'custom'}`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Date Scope Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-navy-card p-5 rounded-2xl border border-surface-border dark:border-surface-darkBorder shadow-card">
        <div>
          <h2 className="text-2xl font-extrabold text-ink-primary dark:text-white tracking-tight">
            Financial Reports & Analytics
          </h2>
          <p className="text-xs sm:text-sm text-ink-secondary dark:text-ink-darkSecondary mt-0.5">
            Holistic breakdown of your college finances, essential spending ratios, and payment habits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-surface-light dark:bg-navy p-1 rounded-xl border border-surface-border dark:border-surface-darkBorder text-xs font-semibold">
            <button
              onClick={() => setDateFilterMode('month')}
              className={`px-3 py-1.5 rounded-lg transition ${
                dateFilterMode === 'month'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-ink-secondary hover:text-ink-primary dark:hover:text-white'
              }`}
            >
              Current Period ({formatMonthYear(selectedMonth)})
            </button>
            <button
              onClick={() => setDateFilterMode('custom')}
              className={`px-3 py-1.5 rounded-lg transition ${
                dateFilterMode === 'custom'
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-ink-secondary hover:text-ink-primary dark:hover:text-white'
              }`}
            >
              Custom Dates
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl border border-surface-border dark:border-surface-darkBorder bg-surface-light dark:bg-navy text-xs sm:text-sm font-semibold text-ink-primary dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center space-x-1.5 shadow-2xs"
          >
            <Download className="w-4 h-4 text-primary dark:text-mint" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Custom Date Filter Row if active */}
      {dateFilterMode === 'custom' && (
        <div className="bg-white dark:bg-navy-card p-4 rounded-xl border border-surface-border dark:border-surface-darkBorder shadow-2xs flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-ink-secondary">Start Date:</span>
            <input
              type="date"
              value={customStart}
              onChange={e => setCustomStart(e.target.value)}
              className="px-3 py-1.5 bg-surface-light dark:bg-navy border border-surface-border dark:border-surface-darkBorder rounded-lg font-medium text-ink-primary dark:text-white outline-none"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-ink-secondary">End Date:</span>
            <input
              type="date"
              value={customEnd}
              onChange={e => setCustomEnd(e.target.value)}
              className="px-3 py-1.5 bg-surface-light dark:bg-navy border border-surface-border dark:border-surface-darkBorder rounded-lg font-medium text-ink-primary dark:text-white outline-none"
            />
          </div>
          <button
            onClick={() => {
              setCustomStart('');
              setCustomEnd('');
            }}
            className="text-primary dark:text-mint font-semibold hover:underline"
          >
            Clear Custom Range
          </button>
        </div>
      )}

      {/* Core KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-navy-card p-5 rounded-2xl border border-surface-border dark:border-surface-darkBorder shadow-card">
          <p className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">
            Total Inflow
          </p>
          <p className="text-2xl font-extrabold text-mint mt-1">
            {formatCurrency(totalIncome, settings.currency)}
          </p>
          <p className="text-[11px] text-ink-muted mt-1">All allowances, scholarships & stipends</p>
        </div>

        <div className="bg-white dark:bg-navy-card p-5 rounded-2xl border border-surface-border dark:border-surface-darkBorder shadow-card">
          <p className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">
            Total Outflow
          </p>
          <p className="text-2xl font-extrabold text-danger mt-1">
            {formatCurrency(totalExpenses, settings.currency)}
          </p>
          <p className="text-[11px] text-ink-muted mt-1">Across all college categories</p>
        </div>

        <div className="bg-white dark:bg-navy-card p-5 rounded-2xl border border-surface-border dark:border-surface-darkBorder shadow-card">
          <p className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">
            Net Surplus / Deficit
          </p>
          <p
            className={`text-2xl font-extrabold mt-1 ${
              netCashFlow >= 0 ? 'text-mint' : 'text-danger'
            }`}
          >
            {netCashFlow >= 0 ? '+' : ''}
            {formatCurrency(netCashFlow, settings.currency)}
          </p>
          <p className="text-[11px] text-ink-muted mt-1">
            {netCashFlow >= 0 ? 'Positive cash flow retained' : 'Deficit spent from previous balance'}
          </p>
        </div>

        <div className="bg-white dark:bg-navy-card p-5 rounded-2xl border border-surface-border dark:border-surface-darkBorder shadow-card">
          <p className="text-xs font-semibold text-ink-secondary uppercase tracking-wider">
            Savings Rate
          </p>
          <p
            className={`text-2xl font-extrabold mt-1 ${
              savingsRate >= 20 ? 'text-mint' : savingsRate > 0 ? 'text-primary dark:text-mint' : 'text-ink-muted'
            }`}
          >
            {savingsRate}%
          </p>
          <p className="text-[11px] text-ink-muted mt-1">
            {savingsRate >= 20 ? 'Exceptional student habit!' : 'Aim for 10-20% surplus'}
          </p>
        </div>
      </div>

      {/* Month-by-Month Trend & Income vs Expense Chart */}
      <div className="bg-white dark:bg-navy-card rounded-2xl p-6 border border-surface-border dark:border-surface-darkBorder shadow-card">
        <h3 className="font-extrabold text-base text-ink-primary dark:text-white mb-1">
          Historical Cash Flow & Savings Trend
        </h3>
        <p className="text-xs text-ink-secondary dark:text-ink-darkSecondary mb-4">
          Compare student inflows against total expenses over recent months
        </p>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="month" stroke="#7B8197" fontSize={11} tickLine={false} />
              <YAxis stroke="#7B8197" fontSize={11} tickLine={false} />
              <Tooltip
                formatter={(val: number) => [formatCurrency(val, settings.currency), '']}
                contentStyle={{
                  backgroundColor: '#171A35',
                  borderRadius: '12px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="Income" fill="#35C9A5" radius={[6, 6, 0, 0]} maxBarSize={32} />
              <Bar dataKey="Expenses" fill="#635BDB" radius={[6, 6, 0, 0]} maxBarSize={32} />
              <Bar dataKey="Savings" fill="#F2B84B" radius={[6, 6, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Essential vs Non-Essential & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Essential vs Non-Essential Spending Analysis */}
        <div className="bg-white dark:bg-navy-card rounded-2xl p-6 border border-surface-border dark:border-surface-darkBorder shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-extrabold text-base text-ink-primary dark:text-white flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span>Needs vs Wants (Essentiality)</span>
              </h3>
            </div>
            <p className="text-xs text-ink-secondary dark:text-ink-darkSecondary mb-4">
              Understanding needs (food, academics, hostel) vs wants (outings, shopping, subscriptions)
            </p>

            <div className="space-y-4">
              {/* Needs */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-semibold">
                  <span className="text-blue-600 dark:text-blue-400">
                    Essential (Needs): {formatCurrency(essentialBreakdown.essential, settings.currency)}
                  </span>
                  <span>{essentialBreakdown.essentialPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-navy rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${essentialBreakdown.essentialPercent}%` }}
                  />
                </div>
              </div>

              {/* Wants */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-semibold">
                  <span className="text-purple-600 dark:text-purple-400">
                    Non-Essential (Wants):{' '}
                    {formatCurrency(essentialBreakdown.nonEssential, settings.currency)}
                  </span>
                  <span>{essentialBreakdown.nonEssentialPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-navy rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-purple-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${essentialBreakdown.nonEssentialPercent}%` }}
                  />
                </div>
              </div>

              {essentialBreakdown.unclassified > 0 && (
                <div>
                  <div className="flex justify-between text-xs mb-1 font-semibold text-ink-muted">
                    <span>
                      Unclassified: {formatCurrency(essentialBreakdown.unclassified, settings.currency)}
                    </span>
                    <span>{essentialBreakdown.unclassifiedPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-navy rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-slate-400 h-3 rounded-full"
                      style={{ width: `${essentialBreakdown.unclassifiedPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 p-3 rounded-xl bg-surface-light dark:bg-navy border border-surface-border dark:border-surface-darkBorder text-xs text-ink-secondary dark:text-ink-darkSecondary flex items-start space-x-2">
            <Lightbulb className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
            <span>
              <strong>Rule of Thumb:</strong> Keeping your non-essential discretionary expenses under 30% of your total allowance makes it easier to save for your goals.
            </span>
          </div>
        </div>

        {/* Payment Methods Distribution */}
        <div className="bg-white dark:bg-navy-card rounded-2xl p-6 border border-surface-border dark:border-surface-darkBorder shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-extrabold text-base text-ink-primary dark:text-white flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-mint" />
                <span>Payment Methods</span>
              </h3>
            </div>
            <p className="text-xs text-ink-secondary dark:text-ink-darkSecondary mb-4">
              Breakdown of transactions by UPI, Cash, Cards, and Net Banking
            </p>

            <div className="space-y-3">
              {paymentBreakdown.map(item => {
                const total = paymentBreakdown.reduce((s, p) => s + p.amount, 0);
                const pct = total > 0 ? Math.round((item.amount / total) * 100) : 0;

                return (
                  <div key={item.method} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-ink-primary dark:text-white">{item.method}</span>
                      <span className="text-ink-secondary dark:text-ink-darkSecondary">
                        {formatCurrency(item.amount, settings.currency)} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-navy rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-mint h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 text-xs text-ink-muted">
            Tracking payment modes helps avoid the illusion of spending invisible money over UPI scan-and-pay apps.
          </div>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="bg-white dark:bg-navy-card rounded-2xl p-6 border border-surface-border dark:border-surface-darkBorder shadow-card">
        <h3 className="font-extrabold text-base text-ink-primary dark:text-white mb-1">
          Detailed Expense Category Breakdown
        </h3>
        <p className="text-xs text-ink-secondary dark:text-ink-darkSecondary mb-4">
          All categories sorted by highest expenditure
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-surface-border dark:border-surface-darkBorder text-ink-secondary dark:text-ink-darkSecondary uppercase tracking-wider font-semibold">
                <th className="pb-3 pl-2">Category</th>
                <th className="pb-3 text-center">Transactions</th>
                <th className="pb-3 text-right">Total Spent</th>
                <th className="pb-3 text-right pr-2">Share of Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50 dark:divide-surface-darkBorder/50">
              {categoryBreakdown.map(cat => (
                <tr key={cat.categoryId} className="hover:bg-surface-light dark:hover:bg-navy/50 transition">
                  <td className="py-3 pl-2">
                    <div className="flex items-center space-x-2">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-bold text-ink-primary dark:text-white">
                        {cat.categoryName}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-center text-ink-secondary dark:text-ink-darkSecondary">
                    {cat.transactionCount}
                  </td>
                  <td className="py-3 text-right font-bold text-ink-primary dark:text-white">
                    {formatCurrency(cat.totalAmount, settings.currency)}
                  </td>
                  <td className="py-3 text-right pr-2 font-semibold text-ink-secondary dark:text-ink-darkSecondary">
                    {cat.percentage}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
