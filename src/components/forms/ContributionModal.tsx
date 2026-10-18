import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../ui/Modal';
import { SavingsGoal } from '../../types';
import { getTodayDateString } from '../../utils/dates';

export const ContributionModal: React.FC = () => {
  const {
    activeModal,
    modalData,
    closeModal,
    addContribution,
    settings,
    savingsGoals,
  } = useFinance();

  const isOpen = activeModal === 'contribution';
  const initialGoal = modalData as SavingsGoal | null;

  const [goalId, setGoalId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (initialGoal && initialGoal.id) {
        setGoalId(initialGoal.id);
      } else if (savingsGoals.length > 0) {
        setGoalId(savingsGoals[0].id);
      }
      setAmount('');
      setDate(getTodayDateString());
      setNotes('');
      setError('');
    }
  }, [isOpen, initialGoal, savingsGoals]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setError('Please enter a contribution amount greater than 0');
      return;
    }
    if (!goalId) {
      setError('Please select a goal');
      return;
    }

    addContribution({
      goalId,
      amount: num,
      date,
      notes: notes.trim() || undefined,
    });

    closeModal();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title="Add Savings Contribution"
      description="Deposit money into your goal envelope to stay disciplined towards your milestone."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Goal selection */}
        <div>
          <label className="block text-xs font-semibold text-ink-secondary dark:text-ink-darkSecondary uppercase tracking-wider mb-1">
            Savings Goal *
          </label>
          <select
            value={goalId}
            onChange={e => setGoalId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-surface-light dark:bg-navy border border-surface-border dark:border-surface-darkBorder rounded-xl text-sm font-semibold text-ink-primary dark:text-white outline-none focus:border-primary transition"
          >
            {savingsGoals.map(g => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-semibold text-ink-secondary dark:text-ink-darkSecondary uppercase tracking-wider mb-1">
            Contribution Amount ({settings.currency.symbol}) *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-ink-muted">
              {settings.currency.symbol}
            </span>
            <input
              type="number"
              step="any"
              min="1"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="e.g. 2000"
              className={`w-full pl-9 pr-4 py-2.5 bg-surface-light dark:bg-navy border rounded-xl font-bold text-lg text-ink-primary dark:text-white outline-none transition focus:ring-2 ${
                error
                  ? 'border-danger focus:ring-danger/20'
                  : 'border-surface-border dark:border-surface-darkBorder focus:border-primary focus:ring-primary/20'
              }`}
              autoFocus
            />
          </div>
          {error && <p className="text-xs text-danger mt-1 font-medium">{error}</p>}
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-semibold text-ink-secondary dark:text-ink-darkSecondary uppercase tracking-wider mb-1">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-surface-light dark:bg-navy border border-surface-border dark:border-surface-darkBorder rounded-xl text-sm font-medium text-ink-primary dark:text-white outline-none focus:border-primary transition"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-ink-secondary dark:text-ink-darkSecondary uppercase tracking-wider mb-1">
            Notes / Source of Funds
          </label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. Saved from stipend, Gift money from grandparents"
            className="w-full px-3.5 py-2.5 bg-surface-light dark:bg-navy border border-surface-border dark:border-surface-darkBorder rounded-xl text-xs text-ink-primary dark:text-white outline-none focus:border-primary transition"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-surface-border/60 dark:border-surface-darkBorder/60">
          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-ink-secondary hover:text-ink-primary dark:hover:text-white bg-surface-light dark:bg-navy transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-mint hover:bg-mint-dark text-navy font-extrabold shadow-md shadow-mint/25 transition active:scale-[0.98]"
          >
            Add Contribution
          </button>
        </div>
      </form>
    </Modal>
  );
};
