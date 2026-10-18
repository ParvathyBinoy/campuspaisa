import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Budget } from '../types';
import { calculateBudgetUtilization } from '../utils/calculations';
import { formatCurrency } from '../utils/currency';
import { formatMonthYear } from '../utils/dates';
import { ProgressBar } from '../components/ui/ProgressBar';
import { CategoryIcon } from '../components/ui/CategoryIcon';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import {
  PieChart,
  Plus,
  AlertTriangle,
  Edit2,
  Trash2,
  CheckCircle2,
  TrendingDown,
  Info,
} from 'lucide-react';

export const Budgets: React.FC = () => {
  const {
    budgets,
    transactions,
    categories,
    selectedMonth,
    deleteBudget,
    openModal,
    settings,
  } = useFinance();

  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);

  const budgetAnalysis = useMemo(
    () => calculateBudgetUtilization(budgets, transactions, categories, selectedMonth),
    [budgets, transactions, categories, selectedMonth]
  );

  return (
    <div className="space-y-6">
      {/* Header & New Budget */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-navy-card p-5 rounded-2xl border border-surface-border dark:border-surface-darkBorder shadow-card">
        <div>
          <h2 className="text-2xl font-extrabold text-ink-primary dark:text-white tracking-tight">
            Monthly Budgets & Limits
          </h2>
          <p className="text-xs sm:text-sm text-ink-secondary dark:text-ink-darkSecondary mt-0.5">
            Keep campus spending within bounds. Showing metrics for{' '}
            <span className="font-bold text-primary dark:text-mint">
              {formatMonthYear(selectedMonth)}
            </span>
            .
          </p>
        </div>

        <button
          onClick={() => openModal('budget')}
          className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-md shadow-primary/25 transition active:scale-[0.98] flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Set Budget Limit</span>
        </button>
      </div>

      {/* Difference Explanation Banner */}
      <div className="p-4 bg-primary-light/40 dark:bg-navy-card rounded-2xl border border-primary/20 flex items-start space-x-3 text-xs">
        <Info className="w-5 h-5 text-primary dark:text-mint flex-shrink-0 mt-0.5" />
        <div className="text-ink-secondary dark:text-ink-darkSecondary leading-relaxed">
          <strong className="text-ink-primary dark:text-white">Financial Note: </strong>
          <span className="font-semibold text-primary dark:text-mint">Remaining Budget</span> is your allocated limit minus eligible expenses, showing how much you can still spend. It is distinct from <span className="font-semibold text-mint">Net Cash Flow</span> (total income minus total expenses).
        </div>
      </div>

      {/* Overall Budget Hero Card */}
      {budgetAnalysis.overall ? (
        <div className="bg-white dark:bg-navy-card rounded-2xl p-6 border border-surface-border dark:border-surface-darkBorder shadow-card relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary dark:bg-primary/20 dark:text-mint">
                  Overall Monthly Spending Cap
                </span>
                {budgetAnalysis.overall.percentageUsed >= 100 && (
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-danger/10 text-danger flex items-center space-x-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Over Budget!</span>
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-extrabold text-ink-primary dark:text-white mt-2">
                {formatCurrency(budgetAnalysis.overall.spentAmount, settings.currency)} spent
                <span className="text-ink-secondary dark:text-ink-darkSecondary text-lg font-normal">
                  {' '}
                  of {formatCurrency(budgetAnalysis.overall.limitAmount, settings.currency)} cap
                </span>
              </h3>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => openModal('budget', budgetAnalysis.overall?.budget)}
                className="p-2 rounded-xl text-ink-secondary hover:text-ink-primary dark:hover:text-white bg-surface-light dark:bg-navy border border-surface-border dark:border-surface-darkBorder transition"
                title="Edit overall budget"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setBudgetToDelete(budgetAnalysis.overall!.budget)}
                className="p-2 rounded-xl text-ink-secondary hover:text-danger bg-surface-light dark:bg-navy border border-surface-border dark:border-surface-darkBorder transition"
                title="Delete overall budget"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <ProgressBar
            percentage={budgetAnalysis.overall.percentageUsed}
            size="lg"
            showLabel
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-4 border-t border-surface-border/60 dark:border-surface-darkBorder/60 text-xs">
            <div>
              <p className="text-ink-secondary dark:text-ink-darkSecondary uppercase font-semibold text-[10px] tracking-wider">
                Remaining Allowance
              </p>
              <p
                className={`text-lg font-bold mt-0.5 ${
                  budgetAnalysis.overall.remainingAmount < 0 ? 'text-danger' : 'text-mint'
                }`}
              >
                {formatCurrency(budgetAnalysis.overall.remainingAmount, settings.currency)}
              </p>
            </div>
            <div>
              <p className="text-ink-secondary dark:text-ink-darkSecondary uppercase font-semibold text-[10px] tracking-wider">
                Utilization Rate
              </p>
              <p className="text-lg font-bold text-ink-primary dark:text-white mt-0.5">
                {budgetAnalysis.overall.percentageUsed.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-ink-secondary dark:text-ink-darkSecondary uppercase font-semibold text-[10px] tracking-wider">
                Status
              </p>
              <p
                className={`text-lg font-bold mt-0.5 ${
                  budgetAnalysis.overall.percentageUsed >= 100
                    ? 'text-danger'
                    : budgetAnalysis.overall.percentageUsed >= 75
                    ? 'text-warning-dark'
                    : 'text-mint'
                }`}
              >
                {budgetAnalysis.overall.percentageUsed >= 100
                  ? 'Exceeded'
                  : budgetAnalysis.overall.percentageUsed >= 90
                  ? 'Critical (90%+)'
                  : budgetAnalysis.overall.percentageUsed >= 75
                  ? 'Warning (75%+)'
                  : 'Safe & On Track'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-navy-card rounded-2xl p-6 border-2 border-dashed border-surface-border dark:border-surface-darkBorder text-center">
          <PieChart className="w-10 h-10 text-primary mx-auto mb-2 opacity-60" />
          <h4 className="text-base font-bold text-ink-primary dark:text-white">
            No Overall Monthly Budget Defined
          </h4>
          <p className="text-xs text-ink-secondary dark:text-ink-darkSecondary mt-1 max-w-md mx-auto">
            Set an overall monthly limit to get alerts when your total spending approaches your student allowance.
          </p>
          <button
            onClick={() => openModal('budget')}
            className="mt-3 px-4 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-hover shadow-md shadow-primary/20 transition"
          >
            + Set Overall Limit
          </button>
        </div>
      )}

      {/* Category-Specific Budgets Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-extrabold text-lg text-ink-primary dark:text-white tracking-tight">
              Category Budgets ({budgetAnalysis.categories.length})
            </h3>
            <p className="text-xs text-ink-secondary dark:text-ink-darkSecondary">
              Individual thresholds for food, entertainment, hostel, and outings
            </p>
          </div>
        </div>

        {budgetAnalysis.categories.length === 0 ? (
          <div className="bg-white dark:bg-navy-card rounded-2xl p-8 border border-surface-border dark:border-surface-darkBorder text-center">
            <TrendingDown className="w-8 h-8 text-ink-muted mx-auto mb-2 opacity-50" />
            <p className="text-xs font-semibold text-ink-secondary dark:text-ink-darkSecondary">
              No category-specific budgets set yet.
            </p>
            <p className="text-[11px] text-ink-muted mt-0.5">
              Target individual categories like Food & Groceries or Outings to pinpoint leaks.
            </p>
            <button
              onClick={() => openModal('budget')}
              className="mt-3 px-4 py-2 rounded-xl text-xs font-bold text-primary dark:text-mint bg-primary/10 hover:bg-primary/20 transition"
            >
              + Create Category Budget
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgetAnalysis.categories.map(catItem => {
              const isOver = catItem.percentageUsed >= 100;
              const isWarning = catItem.percentageUsed >= 75 && !isOver;

              return (
                <div
                  key={catItem.budget.id}
                  className="bg-white dark:bg-navy-card rounded-2xl p-5 border border-surface-border dark:border-surface-darkBorder shadow-card flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-2xs"
                          style={{ backgroundColor: catItem.color }}
                        >
                          <CategoryIcon name={catItem.icon} size={17} />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-ink-primary dark:text-white truncate max-w-[150px]">
                            {catItem.categoryName}
                          </h4>
                          <span className="text-[10px] text-ink-muted uppercase tracking-wider font-semibold">
                            {catItem.budget.month === 'all' ? 'All Months' : catItem.budget.month}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => openModal('budget', catItem.budget)}
                          className="p-1.5 rounded-lg text-ink-secondary hover:text-ink-primary dark:hover:text-white hover:bg-surface-light dark:hover:bg-navy transition"
                          title="Edit budget"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setBudgetToDelete(catItem.budget)}
                          className="p-1.5 rounded-lg text-ink-secondary hover:text-danger hover:bg-danger/10 transition"
                          title="Delete budget"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 flex items-baseline justify-between text-xs">
                      <div>
                        <span className="text-lg font-extrabold text-ink-primary dark:text-white">
                          {formatCurrency(catItem.spentAmount, settings.currency)}
                        </span>
                        <span className="text-ink-secondary dark:text-ink-darkSecondary ml-1">
                          / {formatCurrency(catItem.limitAmount, settings.currency)}
                        </span>
                      </div>
                      <span
                        className={`text-xs font-bold ${
                          isOver ? 'text-danger' : isWarning ? 'text-warning-dark' : 'text-mint'
                        }`}
                      >
                        {catItem.percentageUsed.toFixed(0)}%
                      </span>
                    </div>

                    <div className="mt-2">
                      <ProgressBar
                        percentage={catItem.percentageUsed}
                        size="md"
                        customColor={catItem.color}
                      />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-surface-border/50 dark:border-surface-darkBorder/50 flex items-center justify-between text-[11px]">
                    <span className="text-ink-secondary dark:text-ink-darkSecondary">
                      {isOver ? 'Exceeded by:' : 'Remaining:'}
                    </span>
                    <span
                      className={`font-bold ${
                        isOver ? 'text-danger' : 'text-ink-primary dark:text-white'
                      }`}
                    >
                      {formatCurrency(Math.abs(catItem.remainingAmount), settings.currency)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!budgetToDelete}
        title="Delete Budget Limit?"
        message="Are you sure you want to remove this budget? You can recreate it anytime."
        confirmLabel="Delete Budget"
        onConfirm={() => {
          if (budgetToDelete) deleteBudget(budgetToDelete.id);
        }}
        onCancel={() => setBudgetToDelete(null)}
      />
    </div>
  );
};
