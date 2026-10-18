/**
 * Validation utilities for CampusPaisa forms
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateTransactionForm(data: {
  amount: number | string;
  type: string;
  categoryId: string;
  date: string;
  description: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  const numAmount = Number(data.amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    errors.amount = 'Amount must be greater than 0';
  }

  if (!data.categoryId || data.categoryId.trim() === '') {
    errors.categoryId = 'Please select a category';
  }

  if (!data.date || !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
    errors.date = 'Please provide a valid date (YYYY-MM-DD)';
  }

  if (!data.description || data.description.trim().length === 0) {
    errors.description = 'Please provide a short description';
  } else if (data.description.length > 120) {
    errors.description = 'Description must be under 120 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateBudgetForm(data: {
  limitAmount: number | string;
  month: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  const num = Number(data.limitAmount);
  if (isNaN(num) || num <= 0) {
    errors.limitAmount = 'Budget limit must be greater than 0';
  }

  if (!data.month) {
    errors.month = 'Please select an applicable month or "All Time"';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateSavingsGoalForm(data: {
  name: string;
  targetAmount: number | string;
  targetDate: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Goal name is required';
  }

  const num = Number(data.targetAmount);
  if (isNaN(num) || num <= 0) {
    errors.targetAmount = 'Target amount must be greater than 0';
  }

  if (!data.targetDate || !/^\d{4}-\d{2}-\d{2}$/.test(data.targetDate)) {
    errors.targetDate = 'Please select a valid target date';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateBillForm(data: {
  name: string;
  amount: number | string;
  dueDate: string;
  categoryId: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Bill name is required';
  }

  const num = Number(data.amount);
  if (isNaN(num) || num <= 0) {
    errors.amount = 'Amount must be greater than 0';
  }

  if (!data.dueDate || !/^\d{4}-\d{2}-\d{2}$/.test(data.dueDate)) {
    errors.dueDate = 'Due date is required';
  }

  if (!data.categoryId) {
    errors.categoryId = 'Please select a category for this bill';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
