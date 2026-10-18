import {
  Transaction,
  Category,
  Budget,
  SavingsGoal,
  SavingsContribution,
  Bill,
  UserSettings,
} from '../types';
import { ALL_DEFAULT_CATEGORIES } from '../data/defaultCategories';
import { DEFAULT_CURRENCY } from '../utils/currency';

const STORAGE_KEYS = {
  SETTINGS: 'campuspaisa_settings_v1',
  CATEGORIES: 'campuspaisa_categories_v1',
  TRANSACTIONS: 'campuspaisa_transactions_v1',
  BUDGETS: 'campuspaisa_budgets_v1',
  SAVINGS_GOALS: 'campuspaisa_savings_goals_v1',
  CONTRIBUTIONS: 'campuspaisa_contributions_v1',
  BILLS: 'campuspaisa_bills_v1',
  INIT_FLAG: 'campuspaisa_initialized_v1',
};

export const DEFAULT_USER_SETTINGS: UserSettings = {
  currency: DEFAULT_CURRENCY,
  theme: 'light',
  userName: 'Student Explorer',
  collegeName: 'Campus',
  openingBalance: 0,
  enableOpeningBalance: false,
  updatedAt: new Date().toISOString(),
};

/**
 * In-memory fallback if localStorage is disabled or throws an exception
 */
const memoryCache: Record<string, string> = {};

function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key);
    }
  } catch (err) {
    console.warn(`LocalStorage read failed for ${key}, using memory cache`, err);
  }
  return memoryCache[key] || null;
}

function safeSetItem(key: string, value: string): boolean {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
      return true;
    }
  } catch (err) {
    console.warn(`LocalStorage write failed for ${key}, using memory cache`, err);
    memoryCache[key] = value;
  }
  return false;
}

function safeRemoveItem(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(key);
    }
  } catch (err) {
    console.warn(`LocalStorage remove failed for ${key}`, err);
  }
  delete memoryCache[key];
}

// STORAGE API
export const storageService = {
  getSettings(): UserSettings {
    const raw = safeGetItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_USER_SETTINGS;
    try {
      return { ...DEFAULT_USER_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_USER_SETTINGS;
    }
  },

  saveSettings(settings: UserSettings): void {
    safeSetItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  getCategories(): Category[] {
    const raw = safeGetItem(STORAGE_KEYS.CATEGORIES);
    if (!raw) return ALL_DEFAULT_CATEGORIES;
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : ALL_DEFAULT_CATEGORIES;
    } catch {
      return ALL_DEFAULT_CATEGORIES;
    }
  },

  saveCategories(categories: Category[]): void {
    safeSetItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  },

  getTransactions(): Transaction[] {
    const raw = safeGetItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  saveTransactions(transactions: Transaction[]): void {
    safeSetItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

  getBudgets(): Budget[] {
    const raw = safeGetItem(STORAGE_KEYS.BUDGETS);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  saveBudgets(budgets: Budget[]): void {
    safeSetItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  },

  getSavingsGoals(): SavingsGoal[] {
    const raw = safeGetItem(STORAGE_KEYS.SAVINGS_GOALS);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  saveSavingsGoals(goals: SavingsGoal[]): void {
    safeSetItem(STORAGE_KEYS.SAVINGS_GOALS, JSON.stringify(goals));
  },

  getContributions(): SavingsContribution[] {
    const raw = safeGetItem(STORAGE_KEYS.CONTRIBUTIONS);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  saveContributions(contributions: SavingsContribution[]): void {
    safeSetItem(STORAGE_KEYS.CONTRIBUTIONS, JSON.stringify(contributions));
  },

  getBills(): Bill[] {
    const raw = safeGetItem(STORAGE_KEYS.BILLS);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  saveBills(bills: Bill[]): void {
    safeSetItem(STORAGE_KEYS.BILLS, JSON.stringify(bills));
  },

  isInitialized(): boolean {
    return safeGetItem(STORAGE_KEYS.INIT_FLAG) === 'true';
  },

  setInitialized(): void {
    safeSetItem(STORAGE_KEYS.INIT_FLAG, 'true');
  },

  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(k => safeRemoveItem(k));
  },
};
