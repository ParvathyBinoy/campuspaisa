import React, { useState, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Modal } from '../ui/Modal';
import { Category, TransactionType } from '../../types';
import { CategoryIcon, AVAILABLE_CATEGORY_ICONS } from '../ui/CategoryIcon';

export const CategoryModal: React.FC = () => {
  const {
    activeModal,
    modalData,
    closeModal,
    addCategory,
    updateCategory,
  } = useFinance();

  const isOpen = activeModal === 'category';
  const editingCategory = modalData as Category | null;

  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [icon, setIcon] = useState('Tag');
  const [color, setColor] = useState('#635BDB');
  const [error, setError] = useState('');

  const paletteColors = [
    '#635BDB',
    '#35C9A5',
    '#F2B84B',
    '#E85D75',
    '#F97316',
    '#3B82F6',
    '#8B5CF6',
    '#EC4899',
    '#10B981',
    '#06B6D4',
    '#64748B',
  ];

  useEffect(() => {
    if (isOpen) {
      if (editingCategory && editingCategory.id) {
        setName(editingCategory.name);
        setType(editingCategory.type);
        setIcon(editingCategory.icon || 'Tag');
        setColor(editingCategory.color || '#635BDB');
      } else {
        setName('');
        setType('expense');
        setIcon('Tag');
        setColor('#635BDB');
      }
      setError('');
    }
  }, [isOpen, editingCategory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    if (editingCategory && editingCategory.id) {
      updateCategory(editingCategory.id, {
        name: name.trim(),
        type,
        icon,
        color,
      });
    } else {
      addCategory({
        name: name.trim(),
        type,
        icon,
        color,
        isDefault: false,
      });
    }

    closeModal();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title={editingCategory ? 'Edit Category' : 'Create Custom Category'}
      description="Personalize your campus budget categories with custom icons and colors."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-surface-light dark:bg-navy rounded-xl border border-surface-border dark:border-surface-darkBorder">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`py-2 rounded-lg text-xs font-bold transition ${
              type === 'expense'
                ? 'bg-danger text-white shadow-sm'
                : 'text-ink-secondary dark:text-ink-darkSecondary'
            }`}
          >
            Expense Category
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`py-2 rounded-lg text-xs font-bold transition ${
              type === 'income'
                ? 'bg-mint text-navy shadow-sm'
                : 'text-ink-secondary dark:text-ink-darkSecondary'
            }`}
          >
            Income Category
          </button>
        </div>

        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-ink-secondary dark:text-ink-darkSecondary uppercase tracking-wider mb-1">
            Category Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Campus Printing & Photocopy, Gym Membership"
            className={`w-full px-3.5 py-2.5 bg-surface-light dark:bg-navy border rounded-xl text-sm font-semibold text-ink-primary dark:text-white outline-none transition focus:ring-2 ${
              error
                ? 'border-danger focus:ring-danger/20'
                : 'border-surface-border dark:border-surface-darkBorder focus:border-primary focus:ring-primary/20'
            }`}
            autoFocus
          />
          {error && <p className="text-xs text-danger mt-1 font-medium">{error}</p>}
        </div>

        {/* Color picker palette */}
        <div>
          <label className="block text-xs font-semibold text-ink-secondary dark:text-ink-darkSecondary uppercase tracking-wider mb-1">
            Theme Color
          </label>
          <div className="flex flex-wrap gap-2 pt-1">
            {paletteColors.map(c => (
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

        {/* Icon selector */}
        <div>
          <label className="block text-xs font-semibold text-ink-secondary dark:text-ink-darkSecondary uppercase tracking-wider mb-1">
            Select Icon
          </label>
          <div className="grid grid-cols-6 sm:grid-cols-7 gap-2 p-2 max-h-40 overflow-y-auto bg-surface-light dark:bg-navy rounded-xl border border-surface-border dark:border-surface-darkBorder">
            {AVAILABLE_CATEGORY_ICONS.map(iconName => (
              <button
                key={iconName}
                type="button"
                onClick={() => setIcon(iconName)}
                className={`p-2.5 rounded-lg flex items-center justify-center transition ${
                  icon === iconName
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-ink-secondary hover:text-ink-primary dark:hover:text-white hover:bg-white dark:hover:bg-navy-card'
                }`}
                title={iconName}
              >
                <CategoryIcon name={iconName} size={18} />
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="p-3 bg-surface-light dark:bg-navy rounded-xl border border-surface-border dark:border-surface-darkBorder flex items-center space-x-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
            style={{ backgroundColor: color }}
          >
            <CategoryIcon name={icon} size={20} />
          </div>
          <div>
            <p className="text-xs text-ink-secondary dark:text-ink-darkSecondary uppercase font-bold tracking-wider">
              Preview
            </p>
            <p className="text-sm font-bold text-ink-primary dark:text-white">
              {name.trim() || 'Untitled Category'} ({type})
            </p>
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
            {editingCategory ? 'Update Category' : 'Create Category'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
