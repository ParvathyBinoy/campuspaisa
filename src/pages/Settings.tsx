import React, { useState, useRef } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Category, TransactionType } from '../types';
import { SUPPORTED_CURRENCIES, formatCurrency } from '../utils/currency';
import { exportBackupToFile, validateBackupData, restoreBackup } from '../services/backup';
import { CategoryIcon } from '../components/ui/CategoryIcon';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import {
  Settings as SettingsIcon,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Plus,
  Edit2,
  Shield,
  Moon,
  Sun,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  User,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export const Settings: React.FC = () => {
  const {
    settings,
    updateSettings,
    categories,
    deleteCategory,
    openModal,
    loadDemoData,
    clearAllData,
    showToast,
  } = useFinance();

  const [userName, setUserName] = useState(settings.userName || '');
  const [collegeName, setCollegeName] = useState(settings.collegeName || '');
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState(settings.currency.code);
  const [categoryTypeTab, setCategoryTypeTab] = useState<TransactionType>('expense');
  
  // Modals & Confirmation states
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [reassignCatId, setReassignCatId] = useState<string>('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayedCategories = categories.filter(c => c.type === categoryTypeTab);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const curr = SUPPORTED_CURRENCIES.find(c => c.code === selectedCurrencyCode) || settings.currency;
    updateSettings({
      userName: userName.trim(),
      collegeName: collegeName.trim(),
      currency: curr,
    });
  };

  const handleBackupExport = () => {
    exportBackupToFile();
    showToast('CampusPaisa JSON backup generated and downloaded!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (!validateBackupData(parsed)) {
          showToast('Invalid backup file. Format not recognized as CampusPaisa JSON.', 'error');
          return;
        }

        restoreBackup(parsed);
        showToast('Backup restored successfully! Refreshing view...', 'success');
        setTimeout(() => {
          window.location.reload();
        }, 800);
      } catch (err) {
        showToast('Error parsing JSON backup file.', 'error');
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConfirmDeleteCategory = () => {
    if (categoryToDelete) {
      deleteCategory(categoryToDelete.id, reassignCatId || undefined);
      setCategoryToDelete(null);
      setReassignCatId('');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="bg-white dark:bg-navy-card p-5 rounded-2xl border border-surface-border dark:border-surface-darkBorder shadow-card">
        <h2 className="text-2xl font-extrabold text-ink-primary dark:text-white tracking-tight">
          Settings & Local Data Management
        </h2>
        <p className="text-xs sm:text-sm text-ink-secondary dark:text-ink-darkSecondary mt-0.5">
          Configure currency, student profile, categories, offline JSON backups, and privacy controls.
        </p>
      </div>

      {/* 1. Profile & Preferences */}
      <div className="bg-white dark:bg-navy-card rounded-2xl p-6 border border-surface-border dark:border-surface-darkBorder shadow-card">
        <h3 className="font-extrabold text-base text-ink-primary dark:text-white mb-4 flex items-center space-x-2">
          <User className="w-5 h-5 text-primary" />
          <span>Student Profile & Regional Preferences</span>
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink-secondary dark:text-ink-darkSecondary uppercase tracking-wider mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                placeholder="e.g. Aarav Sharma"
                className="w-full px-3.5 py-2.5 bg-surface-light dark:bg-navy border border-surface-border dark:border-surface-darkBorder rounded-xl text-sm font-semibold text-ink-primary dark:text-white outline-none focus:border-primary transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-secondary dark:text-ink-darkSecondary uppercase tracking-wider mb-1">
                College / University
              </label>
              <input
                type="text"
                value={collegeName}
                onChange={e => setCollegeName(e.target.value)}
                placeholder="e.g. IIT Delhi, BITS Pilani, Delhi University"
                className="w-full px-3.5 py-2.5 bg-surface-light dark:bg-navy border border-surface-border dark:border-surface-darkBorder rounded-xl text-sm font-semibold text-ink-primary dark:text-white outline-none focus:border-primary transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-ink-secondary dark:text-ink-darkSecondary uppercase tracking-wider mb-1">
                Currency & Number System
              </label>
              <select
                value={selectedCurrencyCode}
                onChange={e => setSelectedCurrencyCode(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-surface-light dark:bg-navy border border-surface-border dark:border-surface-darkBorder rounded-xl text-sm font-semibold text-ink-primary dark:text-white outline-none focus:border-primary transition"
              >
                {SUPPORTED_CURRENCIES.map(curr => (
                  <option key={curr.code} value={curr.code}>
                    {curr.name} ({curr.symbol})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-ink-muted mt-1">
                Default: INR (₹) with Indian Lakhs/Crores numbering system.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-secondary dark:text-ink-darkSecondary uppercase tracking-wider mb-1">
                Theme Mode
              </label>
              <div className="flex items-center space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => updateSettings({ theme: 'light' })}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border flex items-center justify-center space-x-1.5 transition ${
                    settings.theme === 'light'
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-surface-light dark:bg-navy text-ink-secondary border-surface-border dark:border-surface-darkBorder'
                  }`}
                >
                  <Sun className="w-4 h-4 text-warning" />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateSettings({ theme: 'dark' })}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border flex items-center justify-center space-x-1.5 transition ${
                    settings.theme === 'dark'
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-surface-light dark:bg-navy text-ink-secondary border-surface-border dark:border-surface-darkBorder'
                  }`}
                >
                  <Moon className="w-4 h-4 text-primary-light" />
                  <span>Dark</span>
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-primary hover:bg-primary-hover shadow-md shadow-primary/25 transition active:scale-[0.98]"
            >
              Save Profile Preferences
            </button>
          </div>
        </form>
      </div>

      {/* 2. Category Management */}
      <div className="bg-white dark:bg-navy-card rounded-2xl p-6 border border-surface-border dark:border-surface-darkBorder shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-extrabold text-base text-ink-primary dark:text-white">
              Category Customization
            </h3>
            <p className="text-xs text-ink-secondary dark:text-ink-darkSecondary">
              Add custom categories, edit labels, and select custom Lucide icons.
            </p>
          </div>

          <button
            onClick={() => openModal('category')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-hover shadow-sm transition flex items-center space-x-1 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Category</span>
          </button>
        </div>

        {/* Tab Toggle: Expense vs Income */}
        <div className="flex items-center space-x-2 border-b border-surface-border dark:border-surface-darkBorder pb-2 mb-4">
          <button
            onClick={() => setCategoryTypeTab('expense')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              categoryTypeTab === 'expense'
                ? 'bg-danger text-white'
                : 'text-ink-secondary hover:text-ink-primary dark:hover:text-white'
            }`}
          >
            Expense Categories ({categories.filter(c => c.type === 'expense').length})
          </button>
          <button
            onClick={() => setCategoryTypeTab('income')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
              categoryTypeTab === 'income'
                ? 'bg-mint text-navy font-extrabold'
                : 'text-ink-secondary hover:text-ink-primary dark:hover:text-white'
            }`}
          >
            Income Categories ({categories.filter(c => c.type === 'income').length})
          </button>
        </div>

        {/* Categories List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
          {displayedCategories.map(cat => (
            <div
              key={cat.id}
              className="p-3 rounded-xl bg-surface-light dark:bg-navy border border-surface-border dark:border-surface-darkBorder flex items-center justify-between group"
            >
              <div className="flex items-center space-x-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-2xs"
                  style={{ backgroundColor: cat.color }}
                >
                  <CategoryIcon name={cat.icon} size={15} />
                </div>
                <div>
                  <p className="font-bold text-xs text-ink-primary dark:text-white truncate max-w-[130px]">
                    {cat.name}
                  </p>
                  <span className="text-[10px] text-ink-muted">
                    {cat.isDefault ? 'Default' : 'Custom'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => openModal('category', cat)}
                  className="p-1.5 rounded-lg text-ink-secondary hover:text-primary dark:hover:text-mint hover:bg-white dark:hover:bg-navy-card transition"
                  title="Edit category"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                {!cat.isDefault && (
                  <button
                    onClick={() => {
                      setCategoryToDelete(cat);
                      // default reassign to another category of the same type
                      const replacement = displayedCategories.find(c => c.id !== cat.id);
                      setReassignCatId(replacement ? replacement.id : '');
                    }}
                    className="p-1.5 rounded-lg text-ink-secondary hover:text-danger hover:bg-danger/10 transition"
                    title="Delete category"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Backup, Restore, and Reset */}
      <div className="bg-white dark:bg-navy-card rounded-2xl p-6 border border-surface-border dark:border-surface-darkBorder shadow-card space-y-6">
        <div>
          <h3 className="font-extrabold text-base text-ink-primary dark:text-white mb-1 flex items-center space-x-2">
            <Download className="w-5 h-5 text-primary" />
            <span>Data Portability & Offline Backup</span>
          </h3>
          <p className="text-xs text-ink-secondary dark:text-ink-darkSecondary">
            Your data is stored exclusively in your browser. Download full JSON snapshots to backup or migrate between devices.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-surface-light dark:bg-navy border border-surface-border dark:border-surface-darkBorder flex flex-col justify-between space-y-3">
            <div>
              <h4 className="font-bold text-sm text-ink-primary dark:text-white">
                Export Full Backup (JSON)
              </h4>
              <p className="text-xs text-ink-secondary dark:text-ink-darkSecondary mt-1">
                Exports all transactions, budgets, goals, contributions, bills, and custom categories into a portable schema-versioned file.
              </p>
            </div>
            <button
              onClick={handleBackupExport}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-hover shadow-md transition flex items-center justify-center space-x-2 self-start"
            >
              <Download className="w-4 h-4" />
              <span>Download JSON Backup</span>
            </button>
          </div>

          <div className="p-4 rounded-xl bg-surface-light dark:bg-navy border border-surface-border dark:border-surface-darkBorder flex flex-col justify-between space-y-3">
            <div>
              <h4 className="font-bold text-sm text-ink-primary dark:text-white">
                Restore from Backup
              </h4>
              <p className="text-xs text-ink-secondary dark:text-ink-darkSecondary mt-1">
                Upload a valid CampusPaisa JSON file to restore your transactions and envelope records.
              </p>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
                id="backup-upload"
              />
              <label
                htmlFor="backup-upload"
                className="px-4 py-2 rounded-xl text-xs font-bold text-ink-primary dark:text-white bg-white dark:bg-navy-card border border-surface-border dark:border-surface-darkBorder hover:bg-slate-100 dark:hover:bg-slate-700 shadow-sm transition inline-flex items-center space-x-2 cursor-pointer"
              >
                <Upload className="w-4 h-4 text-primary dark:text-mint" />
                <span>Select JSON File & Restore</span>
              </label>
            </div>
          </div>
        </div>

        {/* Demo Data & Danger Zone */}
        <div className="pt-4 border-t border-surface-border dark:border-surface-darkBorder flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-sm text-ink-primary dark:text-white">
              Reset or Reload Sample Data
            </h4>
            <p className="text-xs text-ink-secondary dark:text-ink-darkSecondary mt-0.5">
              Useful for demonstrations, portfolio showcases, or starting over with a clean slate.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={loadDemoData}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-primary dark:text-mint bg-primary/10 hover:bg-primary/20 transition flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-warning" />
              <span>Load Demo Data</span>
            </button>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-danger bg-danger/10 hover:bg-danger/20 transition flex items-center space-x-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset All Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Privacy & Architecture Notice */}
      <div className="bg-surface-light dark:bg-navy-card rounded-2xl p-6 border border-surface-border dark:border-surface-darkBorder text-xs text-ink-secondary dark:text-ink-darkSecondary space-y-3">
        <div className="flex items-center space-x-2 text-ink-primary dark:text-white font-bold text-sm">
          <Shield className="w-4 h-4 text-mint" />
          <span>Privacy & Data Sovereignty Guarantee</span>
        </div>
        <p className="leading-relaxed">
          CampusPaisa is completely <strong>local-first</strong>. All transactions, budget limits, savings goals, and bill alerts reside directly in your browser's private Web Storage. No data is ever transmitted to remote trackers or external databases. Clearing your browser cache or site data will delete local files unless you maintain regular JSON backups.
        </p>
      </div>

      {/* Category Reassignment & Deletion Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-navy-card rounded-2xl p-6 max-w-md w-full border border-surface-border dark:border-surface-darkBorder shadow-modal space-y-4">
            <h3 className="font-bold text-base text-ink-primary dark:text-white">
              Delete Category "{categoryToDelete.name}"?
            </h3>
            <p className="text-xs text-ink-secondary dark:text-ink-darkSecondary leading-relaxed">
              If this category is attached to existing transactions, choose a replacement category to safely reassign them so your financial totals remain intact:
            </p>

            <div>
              <label className="block text-xs font-semibold text-ink-secondary uppercase mb-1">
                Reassign Transactions To:
              </label>
              <select
                value={reassignCatId}
                onChange={e => setReassignCatId(e.target.value)}
                className="w-full px-3 py-2 bg-surface-light dark:bg-navy border border-surface-border dark:border-surface-darkBorder rounded-xl text-xs font-medium text-ink-primary dark:text-white outline-none"
              >
                {categories
                  .filter(c => c.id !== categoryToDelete.id && c.type === categoryToDelete.type)
                  .map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-surface-border dark:border-surface-darkBorder">
              <button
                onClick={() => setCategoryToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-ink-secondary hover:text-ink-primary dark:hover:text-white bg-surface-light dark:bg-navy"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteCategory}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-danger hover:bg-danger-dark shadow-sm"
              >
                Reassign & Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        title="Reset All CampusPaisa Data?"
        message="This action will completely erase all stored transactions, budgets, goals, and bills from this browser. This cannot be undone unless you have a JSON backup file."
        confirmLabel="Erase Everything"
        onConfirm={clearAllData}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
};
