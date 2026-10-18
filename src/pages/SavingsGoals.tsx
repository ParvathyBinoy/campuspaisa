import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { SavingsGoal, SavingsContribution } from '../types';
import { formatCurrency } from '../utils/currency';
import { formatDateDisplay } from '../utils/dates';
import { ProgressBar } from '../components/ui/ProgressBar';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import {
  Target,
  Plus,
  Coins,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit2,
  ArrowUpRight,
  Sparkles,
  Trophy,
} from 'lucide-react';

export const SavingsGoals: React.FC = () => {
  const {
    savingsGoals,
    contributions,
    getGoalSavedAmount,
    deleteSavingsGoal,
    deleteContribution,
    openModal,
    settings,
  } = useFinance();

  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [goalToDelete, setGoalToDelete] = useState<SavingsGoal | null>(null);
  const [selectedGoalForHistory, setSelectedGoalForHistory] = useState<SavingsGoal | null>(null);

  // Classify goals
  const processedGoals = savingsGoals.map(g => {
    const saved = getGoalSavedAmount(g.id);
    const remaining = Math.max(0, g.targetAmount - saved);
    const percentage = g.targetAmount > 0 ? (saved / g.targetAmount) * 100 : 0;
    const isCompleted = percentage >= 100;
    return {
      ...g,
      saved,
      remaining,
      percentage: Math.min(100, Math.round(percentage * 10) / 10),
      rawPercentage: percentage,
      isCompleted,
    };
  });

  const displayedGoals = processedGoals.filter(g =>
    activeTab === 'completed' ? g.isCompleted : !g.isCompleted
  );

  const totalSavedAcrossAll = processedGoals.reduce((sum, g) => sum + g.saved, 0);
  const totalTargetAcrossAll = processedGoals.reduce((sum, g) => sum + g.targetAmount, 0);

  // Contributions for selected goal
  const goalContributions = selectedGoalForHistory
    ? contributions.filter(c => c.goalId === selectedGoalForHistory.id)
    : [];

  return (
    <div className="space-y-6">
      {/* Top Header & New Goal Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-navy-card p-5 rounded-2xl border border-surface-border dark:border-surface-darkBorder shadow-card">
        <div>
          <h2 className="text-2xl font-extrabold text-ink-primary dark:text-white tracking-tight">
            Savings Goals & Envelopes
          </h2>
          <p className="text-xs sm:text-sm text-ink-secondary dark:text-ink-darkSecondary mt-0.5">
            Set aside funds for laptops, travel, placement courses, and unexpected college needs.
          </p>
        </div>

        <button
          onClick={() => openModal('goal')}
          className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-md shadow-primary/25 transition active:scale-[0.98] flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New Goal</span>
        </button>
      </div>

      {/* Aggregate Savings Progress Banner */}
      <div className="bg-gradient-to-r from-navy via-navy-light to-primary p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div>
            <div className="flex items-center space-x-2 text-mint text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Campus Wealth Stash</span>
            </div>
            <h3 className="text-3xl font-extrabold tracking-tight">
              {formatCurrency(totalSavedAcrossAll, settings.currency)}
            </h3>
            <p className="text-xs text-white/70 mt-1">
              Total accumulated across {processedGoals.length} goal envelopes
            </p>
          </div>

          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center justify-between text-xs text-white/90 font-medium">
              <span>Overall Goal Portfolio Progress</span>
              <span>
                {totalTargetAcrossAll > 0
                  ? ((totalSavedAcrossAll / totalTargetAcrossAll) * 100).toFixed(1)
                  : '0'}
                % of {formatCurrency(totalTargetAcrossAll, settings.currency)}
              </span>
            </div>
            <ProgressBar
              percentage={
                totalTargetAcrossAll > 0 ? (totalSavedAcrossAll / totalTargetAcrossAll) * 100 : 0
              }
              size="lg"
              customColor="#35C9A5"
            />
          </div>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-white/5 rounded-full filter blur-2xl pointer-events-none" />
      </div>

      {/* Tabs: Active vs Completed */}
      <div className="flex items-center space-x-2 border-b border-surface-border dark:border-surface-darkBorder pb-2">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'active'
              ? 'bg-primary text-white shadow-sm'
              : 'text-ink-secondary dark:text-ink-darkSecondary hover:text-ink-primary dark:hover:text-white'
          }`}
        >
          Active Goals ({processedGoals.filter(g => !g.isCompleted).length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition ${
            activeTab === 'completed'
              ? 'bg-mint text-navy font-extrabold shadow-sm'
              : 'text-ink-secondary dark:text-ink-darkSecondary hover:text-ink-primary dark:hover:text-white'
          }`}
        >
          Completed Milestones ({processedGoals.filter(g => g.isCompleted).length})
        </button>
      </div>

      {/* Goals Grid */}
      {displayedGoals.length === 0 ? (
        <div className="bg-white dark:bg-navy-card rounded-2xl p-12 border border-surface-border dark:border-surface-darkBorder text-center">
          {activeTab === 'completed' ? (
            <>
              <Trophy className="w-12 h-12 text-warning mx-auto mb-3 opacity-80" />
              <h4 className="text-base font-bold text-ink-primary dark:text-white">
                No Completed Goals Yet
              </h4>
              <p className="text-xs text-ink-secondary dark:text-ink-darkSecondary mt-1 max-w-sm mx-auto">
                Keep depositing your monthly stipend surplus! Once a goal reaches 100%, it will appear here.
              </p>
            </>
          ) : (
            <>
              <Target className="w-12 h-12 text-primary mx-auto mb-3 opacity-60" />
              <h4 className="text-base font-bold text-ink-primary dark:text-white">
                No Active Savings Goals
              </h4>
              <p className="text-xs text-ink-secondary dark:text-ink-darkSecondary mt-1 max-w-sm mx-auto">
                Create a savings goal for a laptop, certification, hostel reserve, or semester trip.
              </p>
              <button
                onClick={() => openModal('goal')}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-hover shadow-md transition"
              >
                + Create Your First Goal
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayedGoals.map(goal => (
            <div
              key={goal.id}
              className="bg-white dark:bg-navy-card rounded-2xl p-5 border border-surface-border dark:border-surface-darkBorder shadow-card flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-2xs"
                      style={{ backgroundColor: goal.color || '#635BDB' }}
                    >
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-ink-primary dark:text-white leading-tight">
                        {goal.name}
                      </h4>
                      {goal.category && (
                        <span className="text-[10px] text-ink-muted uppercase tracking-wider font-semibold">
                          {goal.category}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openModal('goal', goal)}
                      className="p-1.5 rounded-lg text-ink-secondary hover:text-ink-primary dark:hover:text-white hover:bg-surface-light dark:hover:bg-navy transition"
                      title="Edit goal"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setGoalToDelete(goal)}
                      className="p-1.5 rounded-lg text-ink-secondary hover:text-danger hover:bg-danger/10 transition"
                      title="Delete goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Amounts & Progress */}
                <div className="mt-5">
                  <div className="flex items-baseline justify-between text-xs mb-1.5">
                    <div>
                      <span className="text-xl font-extrabold text-ink-primary dark:text-white">
                        {formatCurrency(goal.saved, settings.currency)}
                      </span>
                      <span className="text-ink-secondary dark:text-ink-darkSecondary text-xs ml-1">
                        / {formatCurrency(goal.targetAmount, settings.currency)}
                      </span>
                    </div>
                    <span className="font-bold text-primary dark:text-mint text-xs">
                      {goal.percentage}%
                    </span>
                  </div>

                  <ProgressBar
                    percentage={goal.rawPercentage}
                    size="md"
                    customColor={goal.color || '#635BDB'}
                  />
                </div>

                {/* Metadata */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-ink-secondary dark:text-ink-darkSecondary">
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-ink-muted" />
                    <span>Target: {formatDateDisplay(goal.targetDate)}</span>
                  </div>
                  <div className="text-right">
                    <span>
                      {goal.remaining === 0
                        ? 'Completed! 🎉'
                        : `${formatCurrency(goal.remaining, settings.currency)} left`}
                    </span>
                  </div>
                </div>

                {goal.notes && (
                  <p className="mt-3 text-[11px] text-ink-secondary dark:text-ink-darkSecondary italic line-clamp-2">
                    "{goal.notes}"
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-surface-border/60 dark:border-surface-darkBorder/60 flex items-center justify-between">
                <button
                  onClick={() => setSelectedGoalForHistory(goal)}
                  className="text-xs font-semibold text-ink-secondary hover:text-ink-primary dark:hover:text-white underline"
                >
                  History ({contributions.filter(c => c.goalId === goal.id).length})
                </button>

                <button
                  onClick={() => openModal('contribution', goal)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-mint hover:bg-mint-dark text-navy font-extrabold shadow-sm transition flex items-center space-x-1"
                >
                  <Coins className="w-3.5 h-3.5 text-navy" />
                  <span>+ Deposit</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contribution History Drawer/Modal */}
      {selectedGoalForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-navy-card rounded-2xl p-6 max-w-md w-full border border-surface-border dark:border-surface-darkBorder shadow-modal space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border dark:border-surface-darkBorder">
              <div>
                <h3 className="font-bold text-base text-ink-primary dark:text-white">
                  Contribution History
                </h3>
                <p className="text-xs text-ink-secondary dark:text-ink-darkSecondary">
                  {selectedGoalForHistory.name}
                </p>
              </div>
              <button
                onClick={() => setSelectedGoalForHistory(null)}
                className="text-xs font-semibold text-ink-secondary hover:text-ink-primary dark:hover:text-white p-1"
              >
                Close
              </button>
            </div>

            {goalContributions.length === 0 ? (
              <p className="text-xs text-center py-6 text-ink-muted">
                No contributions deposited into this goal yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {goalContributions.map(c => (
                  <div
                    key={c.id}
                    className="p-2.5 rounded-xl bg-surface-light dark:bg-navy border border-surface-border dark:border-surface-darkBorder flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-mint block">
                        +{formatCurrency(c.amount, settings.currency)}
                      </span>
                      <span className="text-[10px] text-ink-muted">
                        {formatDateDisplay(c.date)}
                        {c.notes ? ` • ${c.notes}` : ''}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteContribution(c.id)}
                      className="p-1 text-ink-muted hover:text-danger rounded"
                      title="Delete contribution"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => {
                  const target = selectedGoalForHistory;
                  setSelectedGoalForHistory(null);
                  openModal('contribution', target);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-hover transition"
              >
                + Add Another Contribution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Goal Confirmation */}
      <ConfirmDialog
        isOpen={!!goalToDelete}
        title="Delete Savings Goal?"
        message={`Are you sure you want to delete "${goalToDelete?.name}"? All related contribution history will also be removed.`}
        confirmLabel="Delete Goal"
        onConfirm={() => {
          if (goalToDelete) deleteSavingsGoal(goalToDelete.id);
        }}
        onCancel={() => setGoalToDelete(null)}
      />
    </div>
  );
};
