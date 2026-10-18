import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../ui/Modal';
import { Bill, BillRecurrence } from '../../types';
import { validateBillForm } from '../../utils/validation';
import { getTodayDateString } from '../../utils/dates';

export const BillModal: React.FC = () => {
  const {
    activeModal,
    modalData,
    closeModal,
    addBill,
    updateBill,
    categories,
    settings,
  } = useFinance();

  const isOpen = activeModal === 'bill';
  const editingBill = modalData as Bill | null;

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(getTodayDateString());
  const [categoryId, setCategoryId] = useState('');
  const [recurrence, setRecurrence] = useState<BillRecurrence>('monthly');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const expenseCategories = categories.filter(c => c.type === 'expense');

  useEffect(() => {
    if (isOpen) {
      if (editingBill && editingBill.id) {
        setName(editingBill.name);
        setAmount(String(editingBill.amount));
        setDueDate(editingBill.dueDate || getTodayDateString());
        setCategoryId(editingBill.categoryId);
        setRecurrence(editingBill.recurrence || 'monthly');
        setNotes(editingBill.notes || '');
      } else {
        setName('');
        setAmount('');
        setDueDate(getTodayDateString());
        const defaultCat = expenseCategories.find(c => c.name.toLowerCase().includes('bill')) || expenseCategories[0];
        setCategoryId(defaultCat ? defaultCat.id : '');
        setRecurrence('monthly');
        setNotes('');
      }
      setErrors({});
    }
  }, [isOpen, editingBill, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateBillForm({ name, amount, dueDate, categoryId });
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const numAmount = parseFloat(amount);

    if (editingBill && editingBill.id) {
      updateBill(editingBill.id, {
        name: name.trim(),
        amount: numAmount,
        dueDate,
        categoryId,
        recurrence,
        notes: notes.trim(),
      });
    } else {
      addBill({
        name: name.trim(),
        amount: numAmount,
        dueDate,
        categoryId,
        recurrence,
        status: 'upcoming',
        notes: notes.trim(),
      });
    }

    closeModal();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title={editingBill ? 'Edit Bill Reminder' : 'Add Bill / Due Reminder'}
      description="Never miss mess dues, mobile recharges, room electricity shares, or hostel rent."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Bill Name */}
        <div>
          <label className="block text-xs font-semibold text-ink-secondary dark:text-ink-darkSecondary uppercase tracking-wider mb-1">
            Bill / Payment Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Hostel Mess Dues, Airtel 5G Recharge, Netflix Student"
            className={`w-full px-3.5 py-2.5 bg-surface-light dark:bg-navy border rounded-xl text-sm font-semibold text-ink-primary dark:text-white outline-none transition focus:ring-2 ${
              errors.name
                ? 'border-danger focus:ring-danger/20'
                : 'border-surface-border dark:border-surface-darkBorder focus:border-primary focus:ring-primary/20'
            }`}
            autoFocus
          />
          {errors.name && <p className="text-xs text-danger mt-1 font-medium">{errors.name}</p>}
        </div>

        {/* Amount & Due Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-ink-secondary dark:text-ink-darkSecondary uppercase tracking-wider mb-1">
              Amount ({settings.currency.symbol}) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-ink-muted">
                {settings.currency.symbol}
              </span>
              <input
                type="number"
                step="any"
                min="1"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="1500"
                className={`w-full pl-9 pr-4 py-2.5 bg-surface-light dark:bg-navy border rounded-xl font-bold text-base text-ink-primary dark:text-white outline-none transition focus:ring-2 ${
                  errors.amount
                    ? 'border-danger focus:ring-danger/20'
                    : 'border-surface-border dark:border-surface-darkBorder focus:border-primary focus:ring-primary/20'
                }`}
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-danger mt-1 font-medium">{errors.amount}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-secondary dark:text-ink-darkSecondary uppercase tracking-wider mb-1">
              Due Date *
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-surface-light dark:bg-navy border border-surface-border dark:border-surface-darkBorder rounded-xl text-sm font-medium text-ink-primary dark:text-white outline-none focus:border-primary transition"
            />
            {errors.dueDate && (
              <p className="text-xs text-danger mt-1 font-medium">{errors.dueDate}</p>
            )}
          </div>
        </div>

        {/* Category & Recurrence */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-ink-secondary dark:text-ink-darkSecondary uppercase tracking-wider mb-1">
              Category *
            </label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full px-3 py-2.5 bg-surface-light dark:bg-navy border border-surface-border dark:border-surface-darkBorder rounded-xl text-sm font-medium text-ink-primary dark:text-white outline-none focus:border-primary transition"
            >
              {expenseCategories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-xs text-danger mt-1 font-medium">{errors.categoryId}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-secondary dark:text-ink-darkSecondary uppercase tracking-wider mb-1">
              Recurrence
            </label>
            <select
              value={recurrence}
              onChange={e => setRecurrence(e.target.value as BillRecurrence)}
              className="w-full px-3 py-2.5 bg-surface-light dark:bg-navy border border-surface-border dark:border-surface-darkBorder rounded-xl text-sm font-medium text-ink-primary dark:text-white outline-none focus:border-primary transition"
            >
              <option value="monthly">Monthly Recurring</option>
              <option value="one-time">One-Time Only</option>
              <option value="weekly">Weekly</option>
              <option value="yearly">Yearly (Annual Exam/Hostel Fee)</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-ink-secondary dark:text-ink-darkSecondary uppercase tracking-wider mb-1">
            Notes / Payment Instructions (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. Split with Priya and Rahul, Pay by Google Pay before 5 PM"
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
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-hover shadow-md shadow-primary/25 transition active:scale-[0.98]"
          >
            {editingBill ? 'Update Bill' : 'Set Bill Reminder'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
