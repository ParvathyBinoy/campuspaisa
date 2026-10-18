import { Transaction, Budget, Category } from '../types';

/**
 * Filter transactions for a given month (format: 'YYYY-MM' or 'all')
 */
export function filterTransactionsByMonth(
  transactions: Transaction[],
  month: string
): Transaction[] {
  if (!month || month === 'all') return transactions;
  return transactions.filter(t => t.date.startsWith(month));
}

/**
 * Calculate total income from transactions
 */
export function calculateTotalIncome(transactions: Transaction[]): number {
  return transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
}

/**
 * Calculate total expenses from transactions
 */
export function calculateTotalExpenses(transactions: Transaction[]): number {
  return transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
}

/**
 * Net Cash Flow = Total Income - Total Expenses
 */
export function calculateNetCashFlow(transactions: Transaction[]): number {
  const income = calculateTotalIncome(transactions);
  const expenses = calculateTotalExpenses(transactions);
  return income - expenses;
}

/**
 * Calculate category-wise expense breakdown
 */
export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  color: string;
  icon: string;
  totalAmount: number;
  percentage: number;
  transactionCount: number;
}

export function calculateCategoryBreakdown(
  transactions: Transaction[],
  categories: Category[],
  type: 'expense' | 'income' = 'expense'
): CategoryBreakdown[] {
  const filtered = transactions.filter(t => t.type === type);
  const total = filtered.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const categoryMap = new Map<string, { amount: number; count: number }>();

  filtered.forEach(t => {
    const prev = categoryMap.get(t.categoryId) || { amount: 0, count: 0 };
    categoryMap.set(t.categoryId, {
      amount: prev.amount + (Number(t.amount) || 0),
      count: prev.count + 1,
    });
  });

  const catLookup = new Map<string, Category>(categories.map(c => [c.id, c]));

  const result: CategoryBreakdown[] = [];

  categoryMap.forEach((data, categoryId) => {
    const cat = catLookup.get(categoryId);
    const categoryName = cat ? cat.name : 'Uncategorized';
    const color = cat ? cat.color : '#7B8197';
    const icon = cat ? cat.icon : 'MoreHorizontal';
    const percentage = total > 0 ? (data.amount / total) * 100 : 0;

    result.push({
      categoryId,
      categoryName,
      color,
      icon,
      totalAmount: data.amount,
      percentage: Math.round(percentage * 10) / 10,
      transactionCount: data.count,
    });
  });

  // Sort descending by amount
  return result.sort((a, b) => b.totalAmount - a.totalAmount);
}

/**
 * Budget Analysis Result
 */
export interface BudgetAnalysis {
  budget: Budget;
  categoryName: string;
  color: string;
  icon: string;
  limitAmount: number;
  spentAmount: number;
  remainingAmount: number; // limitAmount - spentAmount
  percentageUsed: number;
  status: 'safe' | 'warning-75' | 'warning-90' | 'exceeded';
}

/**
 * Calculates budget utilization for overall and specific category budgets
 */
export function calculateBudgetUtilization(
  budgets: Budget[],
  transactions: Transaction[],
  categories: Category[],
  selectedMonth: string
): {
  overall: BudgetAnalysis | null;
  categories: BudgetAnalysis[];
  totalBudgeted: number;
  totalSpentOnBudgets: number;
  overallRemaining: number;
} {
  const monthTransactions = filterTransactionsByMonth(transactions, selectedMonth);
  const expenseTransactions = monthTransactions.filter(t => t.type === 'expense');

  // Find active budgets for the selected month or 'all'
  const activeBudgets = budgets.filter(
    b => b.month === 'all' || b.month === selectedMonth
  );

  let overallBudgetAnalysis: BudgetAnalysis | null = null;
  const categoryAnalyses: BudgetAnalysis[] = [];
  const catLookup = new Map<string, Category>(categories.map(c => [c.id, c]));

  activeBudgets.forEach(b => {
    if (b.categoryId === null) {
      // Overall monthly budget
      const totalSpent = expenseTransactions.reduce(
        (sum, t) => sum + (Number(t.amount) || 0),
        0
      );
      const remaining = b.limitAmount - totalSpent;
      const pct = b.limitAmount > 0 ? (totalSpent / b.limitAmount) * 100 : 0;

      let status: BudgetAnalysis['status'] = 'safe';
      if (pct >= 100) status = 'exceeded';
      else if (pct >= 90) status = 'warning-90';
      else if (pct >= 75) status = 'warning-75';

      overallBudgetAnalysis = {
        budget: b,
        categoryName: 'Overall Monthly Budget',
        color: '#635BDB',
        icon: 'PieChart',
        limitAmount: b.limitAmount,
        spentAmount: totalSpent,
        remainingAmount: remaining,
        percentageUsed: Math.round(pct * 10) / 10,
        status,
      };
    } else {
      // Category-specific budget
      const cat = catLookup.get(b.categoryId);
      const spent = expenseTransactions
        .filter(t => t.categoryId === b.categoryId)
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      const remaining = b.limitAmount - spent;
      const pct = b.limitAmount > 0 ? (spent / b.limitAmount) * 100 : 0;

      let status: BudgetAnalysis['status'] = 'safe';
      if (pct >= 100) status = 'exceeded';
      else if (pct >= 90) status = 'warning-90';
      else if (pct >= 75) status = 'warning-75';

      categoryAnalyses.push({
        budget: b,
        categoryName: cat ? cat.name : 'Unknown Category',
        color: cat ? cat.color : '#7B8197',
        icon: cat ? cat.icon : 'Tag',
        limitAmount: b.limitAmount,
        spentAmount: spent,
        remainingAmount: remaining,
        percentageUsed: Math.round(pct * 10) / 10,
        status,
      });
    }
  });

  const totalBudgeted = (overallBudgetAnalysis ? (overallBudgetAnalysis as BudgetAnalysis).limitAmount : 0) ||
    categoryAnalyses.reduce((s, c) => s + c.limitAmount, 0);

  const totalSpentOnBudgets = overallBudgetAnalysis
    ? (overallBudgetAnalysis as BudgetAnalysis).spentAmount
    : categoryAnalyses.reduce((s, c) => s + c.spentAmount, 0);

  const overallRemaining = totalBudgeted - totalSpentOnBudgets;

  return {
    overall: overallBudgetAnalysis,
    categories: categoryAnalyses,
    totalBudgeted,
    totalSpentOnBudgets,
    overallRemaining,
  };
}

/**
 * Calculates essential vs non-essential spending breakdown
 */
export function calculateEssentialBreakdown(transactions: Transaction[]) {
  const expenses = transactions.filter(t => t.type === 'expense');
  let essential = 0;
  let nonEssential = 0;
  let unclassified = 0;

  expenses.forEach(t => {
    const amt = Number(t.amount) || 0;
    if (t.isEssential === true) {
      essential += amt;
    } else if (t.isEssential === false) {
      nonEssential += amt;
    } else {
      unclassified += amt;
    }
  });

  const total = essential + nonEssential + unclassified;

  return {
    essential,
    nonEssential,
    unclassified,
    essentialPercent: total > 0 ? Math.round((essential / total) * 100) : 0,
    nonEssentialPercent: total > 0 ? Math.round((nonEssential / total) * 100) : 0,
    unclassifiedPercent: total > 0 ? Math.round((unclassified / total) * 100) : 0,
    total,
  };
}

/**
 * Calculates payment method distribution
 */
export function calculatePaymentMethodBreakdown(transactions: Transaction[]) {
  const methodMap: Record<string, number> = {};

  transactions.forEach(t => {
    const method = t.paymentMethod || 'Other';
    methodMap[method] = (methodMap[method] || 0) + (Number(t.amount) || 0);
  });

  return Object.entries(methodMap).map(([method, amount]) => ({
    method,
    amount,
  })).sort((a, b) => b.amount - a.amount);
}
