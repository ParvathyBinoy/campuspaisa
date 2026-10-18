export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 
  | 'Cash' 
  | 'UPI' 
  | 'Debit Card' 
  | 'Credit Card' 
  | 'Bank Transfer' 
  | 'Other';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  subCategory?: string;
  description: string;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  tags: string[];
  isEssential?: boolean;
  billId?: string; // If paid from a bill
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  categoryId: string | null; // null represents overall monthly budget
  limitAmount: number;
  month: string; // 'all' or 'YYYY-MM'
  createdAt: string;
  updatedAt: string;
}

export interface SavingsContribution {
  id: string;
  goalId: string;
  amount: number;
  date: string; // YYYY-MM-DD
  notes?: string;
  createdAt: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  targetDate: string; // YYYY-MM-DD
  category?: string;
  notes?: string;
  color?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
}

export type BillRecurrence = 'one-time' | 'weekly' | 'monthly' | 'yearly';
export type BillStatus = 'upcoming' | 'overdue' | 'paid';

export interface Bill {
  id: string;
  name: string;
  categoryId: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  recurrence: BillRecurrence;
  status: BillStatus;
  paidDate?: string;
  paidTransactionId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
  locale: string;
}

export interface UserSettings {
  currency: CurrencyConfig;
  theme: 'light' | 'dark' | 'system';
  userName: string;
  collegeName?: string;
  openingBalance: number;
  enableOpeningBalance: boolean;
  updatedAt: string;
}

export interface BackupData {
  version: number;
  exportedAt: string;
  appName: 'CampusPaisa';
  settings: UserSettings;
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  contributions: SavingsContribution[];
  bills: Bill[];
}

export interface MonthlyFinancialSummary {
  month: string; // 'YYYY-MM'
  totalIncome: number;
  totalExpenses: number;
  netSavings: number; // Income - Expenses
  savingsRate: number; // Percentage
  topExpenseCategory: { name: string; amount: number; percentage: number } | null;
  budgetUtilization: {
    budgeted: number;
    spent: number;
    percentage: number;
    status: 'within' | 'warning' | 'exceeded';
  } | null;
}
