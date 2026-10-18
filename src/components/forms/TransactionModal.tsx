import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../ui/Modal';
import { Transaction, TransactionType, PaymentMethod } from '../../types';
import { validateTransactionForm } from '../../utils/validation';
import { getTodayDateString } from '../../utils/dates';
import { CategoryIcon } from '../ui/CategoryIcon';
import { ArrowUpRight, ArrowDownLeft, Tag as TagIcon } from 'lucide-react';

export const TransactionModal: React.FC = () => {
  const {
    activeModal,
    modalData,
    closeModal,
    categories,
    addTransaction,
    updateTransaction,
    settings,
  } = useFinance();

  const isOpen = activeModal === 'transaction';
  const editingTx = modalData as Transaction | null;

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [subCategory, setSubCategory] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(getTodayDateString());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [tagInput, setTagInput] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [isEssential, setIsEssential] = useState<boolean>(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableCategories = categories.filter(c => c.type === type);

  // Sync state when editing or opening
  useEffect(() => {
    if (isOpen) {
      if (editingTx && editingTx.id) {
        setType(editingTx.type);
        setAmount(String(editingTx.amount));
        setCategoryId(editingTx.categoryId);
        setSubCategory(editingTx.subCategory || '');
        setDescription(editingTx.description || '');
        setDate(editingTx.date || getTodayDateString());
        setPaymentMethod(editingTx.paymentMethod || 'UPI');
        setTags(editingTx.tags || []);
        setIsEssential(editingTx.isEssential ?? true);
      } else {
        setType('expense');
        setAmount('');
        const defaultCat = categories.find(c => c.type === 'expense');
        setCategoryId(defaultCat ? defaultCat.id : '');
        setSubCategory('');
        setDescription('');
        setDate(getTodayDateString());
        setPaymentMethod('UPI');
        setTags([]);
        setIsEssential(true);
      }
      setTagInput('');
      setErrors({});
    }
  }, [isOpen, editingTx, categories]);

  // When type changes, ensure category matches the current type
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const validCats = categories.filter(c => c.type === newType);
    if (!validCats.some(c => c.id === categoryId)) {
      setCategoryId(validCats.length > 0 ? validCats[0].id : '');
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const clean = tagInput.trim().replace(/^#/, '');
      if (clean && !tags.includes(clean)) {
        setTags([...tags, clean]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateTransactionForm({
      amount,
      type,
      categoryId,
      date,
      description,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const numAmount = parseFloat(amount);

    if (editingTx && editingTx.id) {
      updateTransaction(editingTx.id, {
        type,
        amount: numAmount,
        categoryId,
        subCategory: subCategory.trim() || undefined,
        description: description.trim(),
        date,
        paymentMethod,
        tags,
        isEssential,
      });
    } else {
      addTransaction({
        type,
        amount: numAmount,
        categoryId,
        subCategory: subCategory.trim() || undefined,
        description: description.trim(),
        date,
        paymentMethod,
        tags,
        isEssential,
      });
    }

    closeModal();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title={editingTx ? 'Edit Transaction' : 'Record Transaction'}
      description="Keep your finances organized. Log every stipend, food order, or course fee."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Toggle: Income vs Expense */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-surface-light dark:bg-navy rounded-xl border border-surface-border dark:border-surface-darkBorder">
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={`flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
              type === 'expense'
                ? 'bg-danger text-white shadow-sm'
                : 'text-ink-secondary dark:text-ink-darkSecondary hover:text-ink-primary dark:hover:text-white'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Expense</span>
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={`flex items-center justify-center space-x-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
              type === 'income'
                ? 'bg-mint text-navy font-extrabold shadow-sm'
                : 'text-ink-secondary dark:text-ink-darkSecondary hover:text-ink-primary dark:hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Income</span>
          </button>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-xs font-semibold text-ink-secondary dark:text-ink-darkSecondary uppercase tracking-wider mb-1">
            Amount ({settings.currency.symbol}) *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-bold text-ink-muted">
              {settings.currency.symbol}
            </span>
            <input
              type="number"
              step="any"
              min="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className={`w-full pl-9 pr-4 py-2.5 bg-surface-light dark:bg-navy border rounded-xl font-bold text-lg text-ink-primary dark:text-white outline-none transition focus:ring-2 ${
                errors.amount
                  ? 'border-danger focus:ring-danger/20'
                  : 'border-surface-border dark:border-surface-darkBorder focus:border-primary focus:ring-primary/20'
              }`}
              autoFocus
            />
          </div>
          {errors.amount && (
            <p className="text-xs text-danger mt-1 font-medium">{errors.amount}</p>
          )}
        </div>

        {/* Category & Date in 2 columns */}
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
              {availableCategories.map(cat => (
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
              Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2.5 bg-surface-light dark:bg-navy border border-surface-border dark:border-surface-darkBorder rounded-xl text-sm font-medium text-ink-primary dark:text-white outline-none focus:border-primary transition"
            />
            {errors.date && (
              <p className="text-xs text-danger mt-1 font-medium">{errors.date}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-ink-secondary dark:text-ink-darkSecondary uppercase tracking-wider mb-1">
            Description or Note *
          </label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder={
              type === 'expense'
                ? 'e.g. Canteen lunch, Python bootcamp, Bus pass'
                : 'e.g. Monthly allowance, Web dev stipend'
            }
            className={`w-full px-3.5 py-2.5 bg-surface-light dark:bg-navy border rounded-xl text-sm text-ink-primary dark:text-white outline-none transition focus:ring-2 ${
              errors.description
                ? 'border-danger focus:ring-danger/20'
                : 'border-surface-border dark:border-surface-darkBorder focus:border-primary focus:ring-primary/20'
            }`}
          />
          {errors.description && (
            <p className="text-xs text-danger mt-1 font-medium">{errors.description}</p>
          )}
        </div>

        {/* Payment Method & Subcategory */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-ink-secondary dark:text-ink-darkSecondary uppercase tracking-wider mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-3 py-2.5 bg-surface-light dark:bg-navy border border-surface-border dark:border-surface-darkBorder rounded-xl text-sm font-medium text-ink-primary dark:text-white outline-none focus:border-primary transition"
            >
              <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
              <option value="Cash">Cash</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-secondary dark:text-ink-darkSecondary uppercase tracking-wider mb-1">
              Subcategory (Optional)
            </label>
            <input
              type="text"
              value={subCategory}
              onChange={e => setSubCategory(e.target.value)}
              placeholder="e.g. Snacks, Stationery, Diesel"
              className="w-full px-3 py-2.5 bg-surface-light dark:bg-navy border border-surface-border dark:border-surface-darkBorder rounded-xl text-sm text-ink-primary dark:text-white outline-none focus:border-primary transition"
            />
          </div>
        </div>

        {/* Essential vs Non-essential Classification for Expenses */}
        {type === 'expense' && (
          <div className="pt-1">
            <label className="block text-xs font-semibold text-ink-secondary dark:text-ink-darkSecondary uppercase tracking-wider mb-1">
              Classification
            </label>
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2 cursor-pointer text-xs font-medium text-ink-primary dark:text-ink-darkPrimary">
                <input
                  type="radio"
                  name="essential"
                  checked={isEssential === true}
                  onChange={() => setIsEssential(true)}
                  className="text-primary focus:ring-primary h-4 w-4"
                />
                <span>Essential (Needs: Food, Academics, Rent, Health)</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer text-xs font-medium text-ink-primary dark:text-ink-darkPrimary">
                <input
                  type="radio"
                  name="essential"
                  checked={isEssential === false}
                  onChange={() => setIsEssential(false)}
                  className="text-primary focus:ring-primary h-4 w-4"
                />
                <span>Non-Essential (Wants: Outings, Shopping, Movies)</span>
              </label>
            </div>
          </div>
        )}

        {/* Tags */}
        <div>
          <label className="block text-xs font-semibold text-ink-secondary dark:text-ink-darkSecondary uppercase tracking-wider mb-1">
            Tags (Press Enter to add)
          </label>
          <div className="flex flex-wrap items-center gap-1.5 p-2 bg-surface-light dark:bg-navy border border-surface-border dark:border-surface-darkBorder rounded-xl min-h-[42px]">
            {tags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-white dark:bg-navy-card border border-surface-border dark:border-surface-darkBorder text-xs font-medium text-ink-primary dark:text-white shadow-2xs"
              >
                <TagIcon className="w-3 h-3 text-primary" />
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-ink-muted hover:text-danger ml-1"
                >
                  &times;
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder={tags.length === 0 ? 'Type tag and press enter...' : 'Add another tag...'}
              className="bg-transparent border-none outline-none text-xs flex-1 min-w-[120px] text-ink-primary dark:text-white"
            />
          </div>
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
            {editingTx ? 'Save Changes' : 'Record Transaction'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
