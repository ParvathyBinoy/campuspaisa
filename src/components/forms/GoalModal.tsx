import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../ui/Modal';
import { SavingsGoal } from '../../types';
import { validateSavingsGoalForm } from '../../utils/validation';

export const GoalModal: React.FC = () => {
  const {
    activeModal,
    modalData,
    closeModal,
    addSavingsGoal,
    updateSavingsGoal,
    settings,
  } = useFinance();

  const isOpen = activeModal === 'goal';
  const editingGoal = modalData as SavingsGoal | null;

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState('Tech');
  const [notes, setNotes] = useState('');
  const [color, setColor] = useState('#635BDB');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const goalColors = [
    '#635BDB', // Indigo
    '#35C9A5', // Mint
    '#F2B84B', // Gold
    '#E85D75', // Coral
    '#06B6D4', // Cyan
    '#A855F7', // Purple
    '#F97316', // Orange
  ];

  useEffect(() => {
    if (isOpen) {
      if (editingGoal && editingGoal.id) {
        setName(editingGoal.name);
        setTargetAmount(String(editingGoal.targetAmount));
        setTargetDate(editingGoal.targetDate || '');
        setCategory(editingGoal.category || 'Personal');
        setNotes(editingGoal.notes || '');
        setColor(editingGoal.color || '#635BDB');
      } else {
        setName('');
        setTargetAmount('');
        // Default target date: 6 months ahead
        const future = new Date();
        future.setMonth(future.getMonth() + 6);
        const y = future.getFullYear();
        const m = String(future.getMonth() + 1).padStart(2, '0');
        const d = String(future.getDate()).padStart(2, '0');
        setTargetDate(`${y}-${m}-${d}`);
        setCategory('Tech');
        setNotes('');
        setColor('#635BDB');
      }
      setErrors({});
    }
  }, [isOpen, editingGoal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateSavingsGoalForm({ name, targetAmount, targetDate });
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const numAmount = parseFloat(targetAmount);

    if (editingGoal && editingGoal.id) {
      updateSavingsGoal(editingGoal.id, {
        name: name.trim(),
        targetAmount: numAmount,
        targetDate,
        category,
        notes: notes.trim(),
        color,
      });
    } else {
      addSavingsGoal({
        name: name.trim(),
        targetAmount: numAmount,
        targetDate,
        category,
        notes: notes.trim(),
        color,
      });
    }

    closeModal();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title={editingGoal ? 'Edit Savings Goal' : 'Create Savings Goal'}
      description="Plan for what matters — laptop, certifications, trips, or campus emergency cushion."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Goal Name */}
        <div>
          <label className="block text-xs font-semibold text-ink-secondary dark:text-ink-darkSecondary uppercase tracking-wider mb-1">
            Goal Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. M4 MacBook Air, AWS Certification, Goa Semester Trip"
            className={`w-full px-3.5 py-2.5 bg-surface-light dark:bg-navy border rounded-xl text-sm font-semibold text-ink-primary dark:text-white outline-none transition focus:ring-2 ${
              errors.name
                ? 'border-danger focus:ring-danger/20'
                : 'border-surface-border dark:border-surface-darkBorder focus:border-primary focus:ring-primary/20'
            }`}
            autoFocus
          />
          {errors.name && <p className="text-xs text-danger mt-1 font-medium">{errors.name}</p>}
        </div>

        {/* Target Amount & Target Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-ink-secondary dark:text-ink-darkSecondary uppercase tracking-wider mb-1">
              Target Amount ({settings.currency.symbol}) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-ink-muted">
                {settings.currency.symbol}
              </span>
              <input
                type="number"
                step="any"
                min="1"
                value={targetAmount}
                onChange={e => setTargetAmount(e.target.value)}
                placeholder="25000"
                className={`w-full pl-9 pr-4 py-2.5 bg-surface-light dark:bg-navy border rounded-xl font-bold text-base text-ink-primary dark:text-white outline-none transition focus:ring-2 ${
                  errors.targetAmount
                    ? 'border-danger focus:ring-danger/20'
                    : 'border-surface-border dark:border-surface-darkBorder focus:border-primary focus:ring-primary/20'
                }`}
              />
            </div>
            {errors.targetAmount && (
              <p className="text-xs text-danger mt-1 font-medium">{errors.targetAmount}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-secondary dark:text-ink-darkSecondary uppercase tracking-wider mb-1">
              Target Date *
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={e => setTargetDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-surface-light dark:bg-navy border border-surface-border dark:border-surface-darkBorder rounded-xl text-sm font-medium text-ink-primary dark:text-white outline-none focus:border-primary transition"
            />
            {errors.targetDate && (
              <p className="text-xs text-danger mt-1 font-medium">{errors.targetDate}</p>
            )}
          </div>
        </div>

        {/* Category & Color selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-ink-secondary dark:text-ink-darkSecondary uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-surface-light dark:bg-navy border border-surface-border dark:border-surface-darkBorder rounded-xl text-sm font-medium text-ink-primary dark:text-white outline-none focus:border-primary transition"
            >
              <option value="Tech">Electronics & Tech</option>
              <option value="Education">Career & Education</option>
              <option value="Travel">Travel & Outing</option>
              <option value="Emergency">Emergency Reserve</option>
              <option value="Vehicle">Vehicle & Bike</option>
              <option value="Personal">Personal Savings</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-secondary dark:text-ink-darkSecondary uppercase tracking-wider mb-1">
              Badge Accent Color
            </label>
            <div className="flex items-center space-x-2 pt-1.5">
              {goalColors.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-primary ring-offset-2' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-ink-secondary dark:text-ink-darkSecondary uppercase tracking-wider mb-1">
            Notes (Optional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Add motivation, research links, or timeline reminders..."
            className="w-full px-3.5 py-2 bg-surface-light dark:bg-navy border border-surface-border dark:border-surface-darkBorder rounded-xl text-xs text-ink-primary dark:text-white outline-none focus:border-primary transition resize-none"
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
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-hover shadow-md shadow-primary/25 transition active:scale-[0.98]"
          >
            {editingGoal ? 'Save Changes' : 'Create Goal'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
