import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../ui/Modal';
import { Budget } from '../../types';
import { validateBudgetForm } from '../../utils/validation';
import { getMonthOptions } from '../../utils/dates';

export const BudgetModal: React.FC = () => {
  const {
    activeModal,
    modalData,
    closeModal,
    categories,
    saveBudget,
    selectedMonth,
    settings,
  } = useFinance();

  const isOpen = activeModal === 'budget';
  const editingBudget = modalData as Budget | null;

  const [categoryId, setCategoryId] = useState<string>('overall');
  const [limitAmount, setLimitAmount] = useState<string>('');
  const [month, setMonth] = useState<string>(selectedMonth || 'all');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const expenseCategories = categories.filter(c => c.type === 'expense');
  const monthOptions = getMonthOptions();

  useEffect(() => {
    if (isOpen) {
      if (editingBudget && editingBudget.id) {
        setCategoryId(editingBudget.categoryId === null ? 'overall' : editingBudget.categoryId);
        setLimitAmount(String(editingBudget.limitAmount));
        setMonth(editingBudget.month || 'all');
      } else {
        setCategoryId('overall');
        setLimitAmount('');
        setMonth(selectedMonth || 'all');
      }
      setErrors({});
    }
  }, [isOpen, editingBudget, selectedMonth]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateBudgetForm({ limitAmount, month });
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const targetCategory = categoryId === 'overall' ? null : categoryId;
    const numLimit = parseFloat(limitAmount);

    saveBudget({
      id: editingBudget?.id,
      categoryId: targetCategory,
      limitAmount: numLimit,
      month,
    });

    closeModal();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title={editingBudget ? 'Edit Budget' : 'Set Budget Limit'}
      description="Define spending limits to prevent overspending and stay in control of your campus finances."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Scope: Overall vs Category */}
        <div>
          <label className="block text-xs font-semibold text-ink-secondary dark:text-ink-darkSecondary uppercase tracking-wider mb-1">
            Budget Scope *
          </label>
          <select
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-surface-light dark:bg-navy border border-surface-border dark:border-surface-darkBorder rounded-xl text-sm font-medium text-ink-primary dark:text-white outline-none focus:border-primary transition"
          >
            <option value="overall">🌐 Overall Monthly Budget (All Expenses)</option>
            <optgroup label="Specific Categories">
              {expenseCategories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Limit Amount */}
        <div>
          <label className="block text-xs font-semibold text-ink-secondary dark:text-ink-darkSecondary uppercase tracking-wider mb-1">
            Budget Limit ({settings.currency.symbol}) *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-ink-muted">
              {settings.currency.symbol}
            </span>
            <input
              type="number"
              step="any"
              min="1"
              value={limitAmount}
              onChange={e => setLimitAmount(e.target.value)}
              placeholder="e.g. 5000"
              className={`w-full pl-9 pr-4 py-2.5 bg-surface-light dark:bg-navy border rounded-xl font-bold text-lg text-ink-primary dark:text-white outline-none transition focus:ring-2 ${
                errors.limitAmount
                  ? 'border-danger focus:ring-danger/20'
                  : 'border-surface-border dark:border-surface-darkBorder focus:border-primary focus:ring-primary/20'
              }`}
              autoFocus
            />
          </div>
          {errors.limitAmount && (
            <p className="text-xs text-danger mt-1 font-medium">{errors.limitAmount}</p>
          )}
        </div>

        {/* Month applicability */}
        <div>
          <label className="block text-xs font-semibold text-ink-secondary dark:text-ink-darkSecondary uppercase tracking-wider mb-1">
            Applicable Period
          </label>
          <select
            value={month}
            onChange={e => setMonth(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-surface-light dark:bg-navy border border-surface-border dark:border-surface-darkBorder rounded-xl text-sm font-medium text-ink-primary dark:text-white outline-none focus:border-primary transition"
          >
            <option value="all">Every Month (Standard Recurring)</option>
            {monthOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                Specific: {opt.label}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-ink-secondary dark:text-ink-darkSecondary mt-1">
            "Every Month" applies automatically to every calendar month.
          </p>
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
            {editingBudget ? 'Update Budget' : 'Save Budget'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
