import React, { useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateNetCashFlow,
  calculateCategoryBreakdown,
  calculateBudgetUtilization,
  filterTransactionsByMonth,
} from '../utils/calculations';
import { formatCurrency } from '../utils/currency';
import { formatDateDisplay, formatMonthYear, isOverdue, isUpcoming } from '../utils/dates';
import { StatCard } from '../components/ui/StatCard';
import { ProgressBar } from '../components/ui/ProgressBar';
import { CategoryIcon } from '../components/ui/CategoryIcon';
import {
  TrendingUp,
  TrendingDown,
  Scale,
  PieChart as PieIcon,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CalendarCheck2,
  Target,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
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
import { Link } from 'react-router-dom';

export const Overview: React.FC = () => {
  const {
    transactions,
    categories,
    budgets,
    savingsGoals,
    bills,
    settings,
    selectedMonth,
    openModal,
    loadDemoData,
    clearAllData,
    isDemoLoaded,
    markBillPaid,
    getGoalSavedAmount,
  } = useFinance();

  // Filter transactions for selected month
  const monthTransactions = useMemo(
    () => filterTransactionsByMonth(transactions, selectedMonth),
    [transactions, selectedMonth]
  );

  const totalIncome = useMemo(
    () => calculateTotalIncome(monthTransactions),
    [monthTransactions]
  );
  const totalExpenses = useMemo(
    () => calculateTotalExpenses(monthTransactions),
    [monthTransactions]
  );
  const netCashFlow = useMemo(
    () => calculateNetCashFlow(monthTransactions),
    [monthTransactions]
  );

  // Budget calculations
  const budgetData = useMemo(
    () => calculateBudgetUtilization(budgets, transactions, categories, selectedMonth),
    [budgets, transactions, categories, selectedMonth]
  );

  // Category breakdown for donut chart
  const expenseBreakdown = useMemo(
    () => calculateCategoryBreakdown(monthTransactions, categories, 'expense'),
    [monthTransactions, categories]
  );

  // Trend data for past 6 months
  const monthlyTrendData = useMemo(() => {
    const months: string[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push(ym);
    }

    return months.map(m => {
      const txs = filterTransactionsByMonth(transactions, m);
      const inc = calculateTotalIncome(txs);
      const exp = calculateTotalExpenses(txs);
      const shortName = new Date(m + '-01').toLocaleDateString('en-US', { month: 'short' });
      return {
        month: shortName,
        fullMonth: m,
        Income: inc,
        Expenses: exp,
      };
    });
  }, [transactions]);

  // Upcoming / Overdue bills
  const pendingBills = useMemo(() => {
    return bills
      .filter(b => b.status !== 'paid')
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 4);
  }, [bills]);

  // Recent transactions (last 5)
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  // Financial Insight calculation
  const insight = useMemo(() => {
    if (monthTransactions.length === 0) {
      return {
        title: 'Start Tracking Your Money',
        description: 'Log your first stipend or expense to unlock personalized financial insights and habit analysis.',
        type: 'info' as const,
      };
    }

    if (totalExpenses > totalIncome && totalIncome > 0) {
      return {
        title: 'Expenses Exceeding Income This Month',
        description: `You've spent ${formatCurrency(totalExpenses - totalIncome, settings.currency)} more than your income in ${formatMonthYear(selectedMonth)}. Check your discretionary expenses.`,
        type: 'warning' as const,
      };
    }

    if (expenseBreakdown.length > 0) {
      const top = expenseBreakdown[0];
      return {
        title: `Highest Spending in ${top.categoryName}`,
        description: `${top.categoryName} accounts for ${top.percentage}% of your expenses (${formatCurrency(top.totalAmount, settings.currency)}). Setting a category budget could help save more.`,
        type: 'insight' as const,
      };
    }

    return {
      title: 'Healthy Financial Balance',
      description: 'Your income exceeds your expenses. Consider allocating the surplus to your savings envelopes.',
      type: 'success' as const,
    };
  }, [monthTransactions, totalIncome, totalExpenses, expenseBreakdown, selectedMonth, settings.currency]);

  const catMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);

  // Empty State if no transactions at all
  if (transactions.length === 0) {
    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary via-primary-dark to-navy p-6 lg:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md mb-3 text-mint">
              Welcome to CampusPaisa 🎓
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight">
              Your money, your way.
            </h2>
            <p className="mt-2 text-white/80 text-sm lg:text-base leading-relaxed">
              Understand your spending. Build better habits. Track college allowances, canteens,
              exam fees, and tech savings in one private, offline-first dashboard.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => openModal('transaction')}
                className="px-5 py-3 rounded-xl bg-mint hover:bg-mint-dark text-navy font-bold text-sm shadow-md transition flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Your First Transaction</span>
              </button>
              <button
                onClick={loadDemoData}
                className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-md border border-white/20 transition flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-warning" />
                <span>Load Sample Student Data</span>
              </button>
            </div>
          </div>
          {/* Subtle decorative circles */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 rounded-full filter blur-3xl pointer-events-none" />
        </div>

        {/* Clean Onboarding Guide Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white dark:bg-navy-card rounded-2xl p-6 border border-surface-border dark:border-surface-darkBorder shadow-card">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <ArrowDownLeft className="w-6 h-6 text-danger" />
            </div>
            <h3 className="font-bold text-base text-ink-primary dark:text-white">Track All Expenses</h3>
            <p className="text-xs text-ink-secondary dark:text-ink-darkSecondary mt-1 leading-relaxed">
              From hostel mess fees and textbooks to daily chai, auto fares, and Netflix subscriptions.
            </p>
          </div>

          <div className="bg-white dark:bg-navy-card rounded-2xl p-6 border border-surface-border dark:border-surface-darkBorder shadow-card">
            <div className="w-12 h-12 rounded-xl bg-mint/15 text-mint flex items-center justify-center mb-4">
              <PieIcon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-ink-primary dark:text-white">Set Smart Budgets</h3>
            <p className="text-xs text-ink-secondary dark:text-ink-darkSecondary mt-1 leading-relaxed">
              Get notified when you hit 75%, 90%, or 100% of your allowance limit before the month ends.
            </p>
          </div>

          <div className="bg-white dark:bg-navy-card rounded-2xl p-6 border border-surface-border dark:border-surface-darkBorder shadow-card">
            <div className="w-12 h-12 rounded-xl bg-warning/15 text-warning-dark flex items-center justify-center mb-4">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-ink-primary dark:text-white">Achieve Savings Goals</h3>
            <p className="text-xs text-ink-secondary dark:text-ink-darkSecondary mt-1 leading-relaxed">
              Save up for an M4 MacBook, semester Goa trip, or AWS certification exams envelope by envelope.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-navy-card p-5 rounded-2xl border border-surface-border dark:border-surface-darkBorder shadow-card">
        <div>
          <h2 className="text-2xl font-extrabold text-ink-primary dark:text-white tracking-tight">
            Your money, your way.
          </h2>
          <p className="text-xs sm:text-sm text-ink-secondary dark:text-ink-darkSecondary mt-0.5">
            Understand your spending. Build better habits. Showing financial activity for{' '}
            <span className="font-bold text-primary dark:text-mint">
              {formatMonthYear(selectedMonth)}
            </span>
            .
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {isDemoLoaded && (
            <button
              onClick={clearAllData}
              className="px-3 py-2 text-xs font-semibold rounded-xl bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20 transition"
              title="Remove sample demo records"
            >
              Reset Demo
            </button>
          )}
          <button
            onClick={() => openModal('transaction')}
            className="px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-primary hover:bg-primary-hover text-white shadow-md shadow-primary/20 transition active:scale-[0.98] flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Transaction</span>
          </button>
        </div>
      </div>

      {/* 4 Core Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Income"
          amount={formatCurrency(totalIncome, settings.currency)}
          subtitle={`${monthTransactions.filter(t => t.type === 'income').length} deposits`}
          icon={<TrendingUp className="w-5 h-5 text-mint" />}
          badge={{ text: 'Inflow', variant: 'success' }}
        />

        <StatCard
          title="Total Expenses"
          amount={formatCurrency(totalExpenses, settings.currency)}
          subtitle={`${monthTransactions.filter(t => t.type === 'expense').length} payments`}
          icon={<TrendingDown className="w-5 h-5 text-danger" />}
          badge={{ text: 'Outflow', variant: 'danger' }}
        />

        <StatCard
          title="Net Cash Flow"
          amount={formatCurrency(netCashFlow, settings.currency)}
          subtitle="Income minus expenses"
          icon={<Scale className="w-5 h-5 text-primary" />}
          badge={{
            text: netCashFlow >= 0 ? 'Surplus' : 'Deficit',
            variant: netCashFlow >= 0 ? 'success' : 'danger',
          }}
        />

        <StatCard
          title="Remaining Budget"
          amount={
            budgetData.totalBudgeted > 0
              ? formatCurrency(budgetData.overallRemaining, settings.currency)
              : 'No Limit'
          }
          subtitle={
            budgetData.totalBudgeted > 0
              ? `${budgetData.totalSpentOnBudgets > budgetData.totalBudgeted ? 'Exceeded by ' : 'Left of '}${formatCurrency(
                  budgetData.totalBudgeted,
                  settings.currency
                )}`
              : 'Set a budget to track limit'
          }
          icon={<PieIcon className="w-5 h-5 text-warning-dark" />}
          badge={{
            text:
              budgetData.totalBudgeted === 0
                ? 'Uncapped'
                : budgetData.overallRemaining >= 0
                ? 'On Track'
                : 'Over Budget',
            variant:
              budgetData.totalBudgeted === 0
                ? 'neutral'
                : budgetData.overallRemaining >= 0
                ? 'success'
                : 'danger',
          }}
          onClick={() => openModal('budget')}
        />
      </div>

      {/* Insight Banner */}
      <div
        className={`p-4 rounded-2xl border flex items-start space-x-3.5 transition ${
          insight.type === 'warning'
            ? 'bg-danger/5 border-danger/30 text-ink-primary dark:text-white'
            : insight.type === 'success'
            ? 'bg-mint/10 border-mint/30 text-ink-primary dark:text-white'
            : 'bg-primary-light/60 dark:bg-navy-card border-primary/20 text-ink-primary dark:text-white'
        }`}
      >
        <div
          className={`p-2 rounded-xl flex-shrink-0 ${
            insight.type === 'warning'
              ? 'bg-danger/20 text-danger'
              : insight.type === 'success'
              ? 'bg-mint/20 text-mint-dark'
              : 'bg-primary/20 text-primary dark:text-mint'
          }`}
        >
          {insight.type === 'warning' ? (
            <AlertTriangle className="w-5 h-5" />
          ) : (
            <Lightbulb className="w-5 h-5" />
          )}
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold tracking-tight">{insight.title}</h4>
          <p className="text-xs text-ink-secondary dark:text-ink-darkSecondary mt-0.5 leading-relaxed">
            {insight.description}
          </p>
        </div>
      </div>

      {/* Charts Section: Income vs Expense Trend & Category Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expenses Bar Chart (2 columns on lg) */}
        <div className="lg:col-span-2 bg-white dark:bg-navy-card rounded-2xl p-5 border border-surface-border dark:border-surface-darkBorder shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-ink-primary dark:text-white">
                Income vs Expenses Trend
              </h3>
              <p className="text-xs text-ink-secondary dark:text-ink-darkSecondary">
                6-month overview of inflows and student spending
              </p>
            </div>
            <Link
              to="/reports"
              className="text-xs font-semibold text-primary dark:text-mint hover:underline inline-flex items-center space-x-1"
            >
              <span>Full Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Donut (1 column on lg) */}
        <div className="bg-white dark:bg-navy-card rounded-2xl p-5 border border-surface-border dark:border-surface-darkBorder shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-base text-ink-primary dark:text-white">
                Category Breakdown
              </h3>
              <span className="text-xs font-semibold text-ink-secondary">
                {expenseBreakdown.length} Categories
              </span>
            </div>
            <p className="text-xs text-ink-secondary dark:text-ink-darkSecondary mb-3">
              Where your money went in {formatMonthYear(selectedMonth)}
            </p>

            {expenseBreakdown.length === 0 ? (
              <div className="py-12 text-center text-ink-secondary dark:text-ink-darkSecondary">
                <PieIcon className="w-10 h-10 mx-auto text-ink-muted mb-2 opacity-50" />
                <p className="text-xs font-medium">No expenses recorded for this month</p>
              </div>
            ) : (
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseBreakdown.slice(0, 5)}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="totalAmount"
                    >
                      {expenseBreakdown.slice(0, 5).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: number) => [formatCurrency(val, settings.currency), 'Amount']}
                      contentStyle={{
                        backgroundColor: '#171A35',
                        borderRadius: '12px',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Top 3 categories list */}
          {expenseBreakdown.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-surface-border/60 dark:border-surface-darkBorder/60">
              {expenseBreakdown.slice(0, 3).map(c => (
                <div key={c.categoryId} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="text-ink-primary dark:text-white font-medium truncate max-w-[120px]">
                      {c.categoryName}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-ink-primary dark:text-white">
                      {formatCurrency(c.totalAmount, settings.currency)}
                    </span>
                    <span className="text-[10px] text-ink-muted ml-1.5">({c.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lower Grid: Budgets & Upcoming Bills & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budgets Progress (1 col) */}
        <div className="bg-white dark:bg-navy-card rounded-2xl p-5 border border-surface-border dark:border-surface-darkBorder shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-ink-primary dark:text-white">
                Budget Limits
              </h3>
              <p className="text-xs text-ink-secondary dark:text-ink-darkSecondary">
                Monthly threshold tracking
              </p>
            </div>
            <button
              onClick={() => openModal('budget')}
              className="text-xs font-semibold text-primary dark:text-mint hover:underline"
            >
              + Set Budget
            </button>
          </div>

          {budgetData.categories.length === 0 && !budgetData.overall ? (
            <div className="py-8 text-center text-ink-secondary dark:text-ink-darkSecondary">
              <p className="text-xs">No budgets set for this period.</p>
              <button
                onClick={() => openModal('budget')}
                className="mt-2 text-xs font-bold text-primary dark:text-mint hover:underline"
              >
                Create your first budget &rarr;
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {budgetData.overall && (
                <div className="p-3 bg-surface-light dark:bg-navy rounded-xl border border-surface-border dark:border-surface-darkBorder">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-ink-primary dark:text-white">
                      Overall Monthly
                    </span>
                    <span className="font-bold text-ink-primary dark:text-white">
                      {formatCurrency(budgetData.overall.spentAmount, settings.currency)} /{' '}
                      {formatCurrency(budgetData.overall.limitAmount, settings.currency)}
                    </span>
                  </div>
                  <ProgressBar percentage={budgetData.overall.percentageUsed} size="md" showLabel />
                </div>
              )}

              {budgetData.categories.slice(0, 3).map(item => (
                <div key={item.budget.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-ink-primary dark:text-white">
                        {item.categoryName}
                      </span>
                    </div>
                    <span className="text-ink-secondary dark:text-ink-darkSecondary">
                      {formatCurrency(item.spentAmount, settings.currency)} /{' '}
                      {formatCurrency(item.limitAmount, settings.currency)}
                    </span>
                  </div>
                  <ProgressBar percentage={item.percentageUsed} size="sm" />
                </div>
              ))}

              <div className="pt-2 text-center">
                <Link
                  to="/budgets"
                  className="text-xs font-semibold text-primary dark:text-mint hover:underline"
                >
                  Manage all budgets &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Upcoming Bills & Dues (1 col) */}
        <div className="bg-white dark:bg-navy-card rounded-2xl p-5 border border-surface-border dark:border-surface-darkBorder shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-ink-primary dark:text-white">
                Upcoming Bills
              </h3>
              <p className="text-xs text-ink-secondary dark:text-ink-darkSecondary">
                Pending mess dues, recharges, rent
              </p>
            </div>
            <button
              onClick={() => openModal('bill')}
              className="text-xs font-semibold text-primary dark:text-mint hover:underline"
            >
              + Add Bill
            </button>
          </div>

          {pendingBills.length === 0 ? (
            <div className="py-8 text-center text-ink-secondary dark:text-ink-darkSecondary">
              <CheckCircle2 className="w-8 h-8 text-mint mx-auto mb-2 opacity-80" />
              <p className="text-xs font-medium">All dues and bills are paid!</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {pendingBills.map(b => {
                const overdue = isOverdue(b.dueDate);
                return (
                  <div
                    key={b.id}
                    className="p-3 bg-surface-light dark:bg-navy rounded-xl border border-surface-border dark:border-surface-darkBorder flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-bold text-ink-primary dark:text-white">
                          {b.name}
                        </span>
                        {overdue && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-danger/10 text-danger">
                            Overdue
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-ink-secondary dark:text-ink-darkSecondary mt-0.5">
                        Due {formatDateDisplay(b.dueDate)}
                      </p>
                    </div>

                    <div className="text-right flex items-center space-x-2">
                      <span className="text-xs font-bold text-ink-primary dark:text-white">
                        {formatCurrency(b.amount, settings.currency)}
                      </span>
                      <button
                        onClick={() => markBillPaid(b.id)}
                        className="px-2 py-1 rounded-lg text-[11px] font-bold bg-mint/15 text-mint-dark hover:bg-mint hover:text-white transition"
                        title="Mark paid and create expense transaction"
                      >
                        Pay
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="pt-2 text-center">
                <Link
                  to="/bills"
                  className="text-xs font-semibold text-primary dark:text-mint hover:underline"
                >
                  View all bills & reminders &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Savings Goals Snapshot (1 col) */}
        <div className="bg-white dark:bg-navy-card rounded-2xl p-5 border border-surface-border dark:border-surface-darkBorder shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-ink-primary dark:text-white">
                Savings Goals
              </h3>
              <p className="text-xs text-ink-secondary dark:text-ink-darkSecondary">
                Your campus milestones
              </p>
            </div>
            <button
              onClick={() => openModal('goal')}
              className="text-xs font-semibold text-primary dark:text-mint hover:underline"
            >
              + New Goal
            </button>
          </div>

          {savingsGoals.length === 0 ? (
            <div className="py-8 text-center text-ink-secondary dark:text-ink-darkSecondary">
              <Target className="w-8 h-8 text-primary mx-auto mb-2 opacity-50" />
              <p className="text-xs">No active savings goals.</p>
              <button
                onClick={() => openModal('goal')}
                className="mt-2 text-xs font-bold text-primary dark:text-mint hover:underline"
              >
                Set your first milestone &rarr;
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {savingsGoals.slice(0, 3).map(g => {
                const saved = getGoalSavedAmount(g.id);
                const pct = g.targetAmount > 0 ? (saved / g.targetAmount) * 100 : 0;
                return (
                  <div key={g.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-ink-primary dark:text-white truncate max-w-[130px]">
                        {g.name}
                      </span>
                      <span className="text-ink-secondary dark:text-ink-darkSecondary">
                        {formatCurrency(saved, settings.currency)} /{' '}
                        {formatCurrency(g.targetAmount, settings.currency)}
                      </span>
                    </div>
                    <ProgressBar percentage={pct} size="sm" customColor={g.color || '#635BDB'} />
                  </div>
                );
              })}

              <div className="pt-2 text-center">
                <Link
                  to="/savings"
                  className="text-xs font-semibold text-primary dark:text-mint hover:underline"
                >
                  Manage goals & contributions &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white dark:bg-navy-card rounded-2xl p-5 border border-surface-border dark:border-surface-darkBorder shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-ink-primary dark:text-white">
              Recent Transactions
            </h3>
            <p className="text-xs text-ink-secondary dark:text-ink-darkSecondary">
              Latest financial activity logged on this device
            </p>
          </div>
          <Link
            to="/transactions"
            className="text-xs font-semibold text-primary dark:text-mint hover:underline inline-flex items-center space-x-1"
          >
            <span>View All ({transactions.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-surface-border/80 dark:border-surface-darkBorder/80 text-ink-secondary dark:text-ink-darkSecondary uppercase tracking-wider font-semibold">
                <th className="pb-3 pl-2">Category</th>
                <th className="pb-3">Description</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Payment</th>
                <th className="pb-3 text-right pr-2">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/40 dark:divide-surface-darkBorder/40">
              {recentTransactions.map(t => {
                const cat = catMap.get(t.categoryId);
                const isIncome = t.type === 'income';

                return (
                  <tr
                    key={t.id}
                    className="hover:bg-surface-light dark:hover:bg-navy/50 transition"
                  >
                    <td className="py-3 pl-2">
                      <div className="flex items-center space-x-2.5">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0 shadow-2xs"
                          style={{ backgroundColor: cat ? cat.color : '#635BDB' }}
                        >
                          <CategoryIcon name={cat ? cat.icon : 'Tag'} size={15} />
                        </div>
                        <span className="font-semibold text-ink-primary dark:text-white truncate max-w-[140px]">
                          {cat ? cat.name : 'Other'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-ink-primary dark:text-ink-darkPrimary font-medium">
                      {t.description}
                      {t.tags && t.tags.length > 0 && (
                        <span className="ml-2 inline-block px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-navy text-ink-muted">
                          #{t.tags[0]}
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-ink-secondary dark:text-ink-darkSecondary whitespace-nowrap">
                      {formatDateDisplay(t.date)}
                    </td>
                    <td className="py-3 text-ink-secondary dark:text-ink-darkSecondary whitespace-nowrap">
                      {t.paymentMethod}
                    </td>
                    <td
                      className={`py-3 text-right pr-2 font-bold whitespace-nowrap ${
                        isIncome ? 'text-mint dark:text-mint' : 'text-danger'
                      }`}
                    >
                      {isIncome ? '+' : '-'}
                      {formatCurrency(t.amount, settings.currency)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
