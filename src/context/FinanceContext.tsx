import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Transaction,
  Category,
  Budget,
  SavingsGoal,
  SavingsContribution,
  Bill,
  UserSettings,
  PaymentMethod,
} from '../types';
import { storageService, DEFAULT_USER_SETTINGS } from '../services/storage';
import { ALL_DEFAULT_CATEGORIES } from '../data/defaultCategories';
import {
  DEMO_SETTINGS,
  DEMO_TRANSACTIONS,
  DEMO_BUDGETS,
  DEMO_GOALS,
  DEMO_CONTRIBUTIONS,
  DEMO_BILLS,
} from '../data/demoData';
import { getCurrentMonthString, getTodayDateString, getNextDueDate } from '../utils/dates';

interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface FinanceContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  categories: Category[];
  addCategory: (cat: Omit<Category, 'id'>) => Category;
  updateCategory: (id: string, cat: Partial<Category>) => void;
  deleteCategory: (id: string, reassignCategoryId?: string) => boolean;
  transactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Transaction;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  budgets: Budget[];
  saveBudget: (budget: { id?: string; categoryId: string | null; limitAmount: number; month: string }) => void;
  deleteBudget: (id: string) => void;
  savingsGoals: SavingsGoal[];
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt'>) => SavingsGoal;
  updateSavingsGoal: (id: string, goal: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  contributions: SavingsContribution[];
  addContribution: (contribution: Omit<SavingsContribution, 'id' | 'createdAt'>) => void;
  deleteContribution: (id: string) => void;
  getGoalSavedAmount: (goalId: string) => number;
  bills: Bill[];
  addBill: (bill: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>) => Bill;
  updateBill: (id: string, bill: Partial<Bill>) => void;
  deleteBill: (id: string) => void;
  markBillPaid: (billId: string, paymentMethod?: PaymentMethod) => void;
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  loadDemoData: () => void;
  clearAllData: () => void;
  isDemoLoaded: boolean;
  activeModal: string | null;
  modalData: unknown;
  openModal: (modalName: string, data?: unknown) => void;
  closeModal: () => void;
  toasts: ToastState[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<UserSettings>(() => storageService.getSettings());
  const [categories, setCategories] = useState<Category[]>(() => storageService.getCategories());
  const [transactions, setTransactions] = useState<Transaction[]>(() => storageService.getTransactions());
  const [budgets, setBudgets] = useState<Budget[]>(() => storageService.getBudgets());
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => storageService.getSavingsGoals());
  const [contributions, setContributions] = useState<SavingsContribution[]>(() => storageService.getContributions());
  const [bills, setBills] = useState<Bill[]>(() => storageService.getBills());
  const [selectedMonth, setSelectedMonth] = useState<string>(() => getCurrentMonthString());

  // Modal manager
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalData, setModalData] = useState<unknown>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastState[]>([]);

  // Apply theme class to document
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const openModal = (modalName: string, data?: unknown) => {
    setModalData(data || null);
    setActiveModal(modalName);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalData(null);
  };

  // Settings
  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings, updatedAt: new Date().toISOString() };
      storageService.saveSettings(updated);
      return updated;
    });
    showToast('Settings saved successfully');
  };

  // Categories
  const addCategory = (cat: Omit<Category, 'id'>): Category => {
    const id = 'cat-' + Date.now();
    const newCat: Category = { ...cat, id };
    setCategories(prev => {
      const updated = [...prev, newCat];
      storageService.saveCategories(updated);
      return updated;
    });
    showToast(`Category "${newCat.name}" added`);
    return newCat;
  };

  const updateCategory = (id: string, updatedFields: Partial<Category>) => {
    setCategories(prev => {
      const updated = prev.map(c => (c.id === id ? { ...c, ...updatedFields } : c));
      storageService.saveCategories(updated);
      return updated;
    });
    showToast('Category updated');
  };

  const deleteCategory = (id: string, reassignCategoryId?: string): boolean => {
    // Check if category has transactions
    const usedCount = transactions.filter(t => t.categoryId === id).length;
    if (usedCount > 0 && !reassignCategoryId) {
      showToast('Cannot delete category: transactions exist. Choose a replacement category.', 'error');
      return false;
    }

    if (reassignCategoryId) {
      // Reassign transactions
      setTransactions(prev => {
        const updated = prev.map(t => (t.categoryId === id ? { ...t, categoryId: reassignCategoryId } : t));
        storageService.saveTransactions(updated);
        return updated;
      });
      // Reassign bills
      setBills(prev => {
        const updated = prev.map(b => (b.categoryId === id ? { ...b, categoryId: reassignCategoryId } : b));
        storageService.saveBills(updated);
        return updated;
      });
    }

    setCategories(prev => {
      const updated = prev.filter(c => c.id !== id);
      storageService.saveCategories(updated);
      return updated;
    });

    // Also remove budgets attached to this category
    setBudgets(prev => {
      const updated = prev.filter(b => b.categoryId !== id);
      storageService.saveBudgets(updated);
      return updated;
    });

    showToast('Category deleted');
    return true;
  };

  // Transactions
  const addTransaction = (tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Transaction => {
    const now = new Date().toISOString();
    const id = 'tx-' + Date.now() + Math.random().toString(36).substring(2, 6);
    const newTx: Transaction = {
      ...tx,
      id,
      amount: Number(tx.amount),
      createdAt: now,
      updatedAt: now,
    };

    setTransactions(prev => {
      const updated = [newTx, ...prev];
      storageService.saveTransactions(updated);
      return updated;
    });

    showToast(
      `${newTx.type === 'income' ? 'Income' : 'Expense'} of ${newTx.amount} added`,
      'success'
    );
    return newTx;
  };

  const updateTransaction = (id: string, updatedFields: Partial<Transaction>) => {
    setTransactions(prev => {
      const updated = prev.map(t =>
        t.id === id
          ? {
              ...t,
              ...updatedFields,
              amount: updatedFields.amount !== undefined ? Number(updatedFields.amount) : t.amount,
              updatedAt: new Date().toISOString(),
            }
          : t
      );
      storageService.saveTransactions(updated);
      return updated;
    });
    showToast('Transaction updated');
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => {
      const updated = prev.filter(t => t.id !== id);
      storageService.saveTransactions(updated);
      return updated;
    });
    showToast('Transaction removed', 'info');
  };

  // Budgets
  const saveBudget = (data: { id?: string; categoryId: string | null; limitAmount: number; month: string }) => {
    setBudgets(prev => {
      let updated: Budget[];
      const now = new Date().toISOString();
      const numAmount = Number(data.limitAmount);

      if (data.id) {
        // Edit existing
        updated = prev.map(b =>
          b.id === data.id
            ? {
                ...b,
                categoryId: data.categoryId,
                limitAmount: numAmount,
                month: data.month,
                updatedAt: now,
              }
            : b
        );
      } else {
        // Create new or update if match already exists for this category and month
        const existingIdx = prev.findIndex(
          b => b.categoryId === data.categoryId && b.month === data.month
        );
        if (existingIdx >= 0) {
          updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            limitAmount: numAmount,
            updatedAt: now,
          };
        } else {
          const newBudget: Budget = {
            id: 'bg-' + Date.now(),
            categoryId: data.categoryId,
            limitAmount: numAmount,
            month: data.month,
            createdAt: now,
            updatedAt: now,
          };
          updated = [...prev, newBudget];
        }
      }
      storageService.saveBudgets(updated);
      return updated;
    });
    showToast('Budget saved');
  };

  const deleteBudget = (id: string) => {
    setBudgets(prev => {
      const updated = prev.filter(b => b.id !== id);
      storageService.saveBudgets(updated);
      return updated;
    });
    showToast('Budget deleted', 'info');
  };

  // Savings Goals
  const addSavingsGoal = (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt'>): SavingsGoal => {
    const now = new Date().toISOString();
    const newGoal: SavingsGoal = {
      ...goal,
      id: 'goal-' + Date.now(),
      targetAmount: Number(goal.targetAmount),
      createdAt: now,
      updatedAt: now,
    };
    setSavingsGoals(prev => {
      const updated = [...prev, newGoal];
      storageService.saveSavingsGoals(updated);
      return updated;
    });
    showToast(`Savings Goal "${newGoal.name}" created`);
    return newGoal;
  };

  const updateSavingsGoal = (id: string, fields: Partial<SavingsGoal>) => {
    setSavingsGoals(prev => {
      const updated = prev.map(g =>
        g.id === id
          ? {
              ...g,
              ...fields,
              targetAmount: fields.targetAmount !== undefined ? Number(fields.targetAmount) : g.targetAmount,
              updatedAt: new Date().toISOString(),
            }
          : g
      );
      storageService.saveSavingsGoals(updated);
      return updated;
    });
    showToast('Savings goal updated');
  };

  const deleteSavingsGoal = (id: string) => {
    setSavingsGoals(prev => {
      const updated = prev.filter(g => g.id !== id);
      storageService.saveSavingsGoals(updated);
      return updated;
    });
    // Remove associated contributions
    setContributions(prev => {
      const updated = prev.filter(c => c.goalId !== id);
      storageService.saveContributions(updated);
      return updated;
    });
    showToast('Savings goal deleted', 'info');
  };

  const addContribution = (contribution: Omit<SavingsContribution, 'id' | 'createdAt'>) => {
    const newContribution: SavingsContribution = {
      ...contribution,
      id: 'cnt-' + Date.now(),
      amount: Number(contribution.amount),
      createdAt: new Date().toISOString(),
    };
    setContributions(prev => {
      const updated = [newContribution, ...prev];
      storageService.saveContributions(updated);
      return updated;
    });
    showToast(`Added contribution of ${newContribution.amount}`);
  };

  const deleteContribution = (id: string) => {
    setContributions(prev => {
      const updated = prev.filter(c => c.id !== id);
      storageService.saveContributions(updated);
      return updated;
    });
    showToast('Contribution removed', 'info');
  };

  const getGoalSavedAmount = (goalId: string): number => {
    return contributions
      .filter(c => c.goalId === goalId)
      .reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
  };

  // Bills
  const addBill = (bill: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>): Bill => {
    const now = new Date().toISOString();
    const newBill: Bill = {
      ...bill,
      id: 'bill-' + Date.now(),
      amount: Number(bill.amount),
      createdAt: now,
      updatedAt: now,
    };
    setBills(prev => {
      const updated = [...prev, newBill];
      storageService.saveBills(updated);
      return updated;
    });
    showToast(`Bill "${newBill.name}" added`);
    return newBill;
  };

  const updateBill = (id: string, fields: Partial<Bill>) => {
    setBills(prev => {
      const updated = prev.map(b =>
        b.id === id
          ? {
              ...b,
              ...fields,
              amount: fields.amount !== undefined ? Number(fields.amount) : b.amount,
              updatedAt: new Date().toISOString(),
            }
          : b
      );
      storageService.saveBills(updated);
      return updated;
    });
    showToast('Bill updated');
  };

  const deleteBill = (id: string) => {
    setBills(prev => {
      const updated = prev.filter(b => b.id !== id);
      storageService.saveBills(updated);
      return updated;
    });
    showToast('Bill removed', 'info');
  };

  const markBillPaid = (billId: string, paymentMethod: PaymentMethod = 'UPI') => {
    const targetBill = bills.find(b => b.id === billId);
    if (!targetBill) return;

    const today = getTodayDateString();
    const now = new Date().toISOString();

    // 1. Create matching expense transaction
    const txId = 'tx-' + Date.now();
    const newTx: Transaction = {
      id: txId,
      type: 'expense',
      amount: targetBill.amount,
      categoryId: targetBill.categoryId,
      description: `Bill Payment: ${targetBill.name}`,
      date: today,
      paymentMethod,
      tags: ['Bill Payment'],
      isEssential: true,
      billId: targetBill.id,
      createdAt: now,
      updatedAt: now,
    };

    setTransactions(prev => {
      const updated = [newTx, ...prev];
      storageService.saveTransactions(updated);
      return updated;
    });

    // 2. Update Bill or Create next recurrence
    if (targetBill.recurrence === 'one-time') {
      setBills(prev => {
        const updated = prev.map(b =>
          b.id === billId
            ? {
                ...b,
                status: 'paid' as const,
                paidDate: today,
                paidTransactionId: txId,
                updatedAt: now,
              }
            : b
        );
        storageService.saveBills(updated);
        return updated;
      });
    } else {
      // Recurring: mark current as paid and generate next recurring bill occurrence
      const nextDue = getNextDueDate(targetBill.dueDate, targetBill.recurrence);
      const nextBill: Bill = {
        id: 'bill-' + Date.now() + '-next',
        name: targetBill.name,
        categoryId: targetBill.categoryId,
        amount: targetBill.amount,
        dueDate: nextDue,
        recurrence: targetBill.recurrence,
        status: 'upcoming',
        notes: targetBill.notes,
        createdAt: now,
        updatedAt: now,
      };

      setBills(prev => {
        const updated = prev
          .map(b =>
            b.id === billId
              ? {
                  ...b,
                  status: 'paid' as const,
                  paidDate: today,
                  paidTransactionId: txId,
                  updatedAt: now,
                }
              : b
          )
          .concat(nextBill);
        storageService.saveBills(updated);
        return updated;
      });
    }

    showToast(`Marked "${targetBill.name}" as paid and recorded expense!`);
  };

  // Demo Data Management
  const isDemoLoaded = transactions.some(t => t.id.startsWith('demo-'));

  const loadDemoData = () => {
    storageService.saveSettings(DEMO_SETTINGS);
    storageService.saveCategories(ALL_DEFAULT_CATEGORIES);
    storageService.saveTransactions(DEMO_TRANSACTIONS);
    storageService.saveBudgets(DEMO_BUDGETS);
    storageService.saveSavingsGoals(DEMO_GOALS);
    storageService.saveContributions(DEMO_CONTRIBUTIONS);
    storageService.saveBills(DEMO_BILLS);
    storageService.setInitialized();

    setSettings(DEMO_SETTINGS);
    setCategories(ALL_DEFAULT_CATEGORIES);
    setTransactions(DEMO_TRANSACTIONS);
    setBudgets(DEMO_BUDGETS);
    setSavingsGoals(DEMO_GOALS);
    setContributions(DEMO_CONTRIBUTIONS);
    setBills(DEMO_BILLS);

    showToast('Loaded demo student data successfully!');
  };

  const clearAllData = () => {
    storageService.clearAllData();
    storageService.saveSettings(DEFAULT_USER_SETTINGS);
    storageService.saveCategories(ALL_DEFAULT_CATEGORIES);

    setSettings(DEFAULT_USER_SETTINGS);
    setCategories(ALL_DEFAULT_CATEGORIES);
    setTransactions([]);
    setBudgets([]);
    setSavingsGoals([]);
    setContributions([]);
    setBills([]);

    showToast('All app data has been reset to empty state', 'info');
  };

  return (
    <FinanceContext.Provider
      value={{
        settings,
        updateSettings,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        budgets,
        saveBudget,
        deleteBudget,
        savingsGoals,
        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        contributions,
        addContribution,
        deleteContribution,
        getGoalSavedAmount,
        bills,
        addBill,
        updateBill,
        deleteBill,
        markBillPaid,
        selectedMonth,
        setSelectedMonth,
        loadDemoData,
        clearAllData,
        isDemoLoaded,
        activeModal,
        modalData,
        openModal,
        closeModal,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
