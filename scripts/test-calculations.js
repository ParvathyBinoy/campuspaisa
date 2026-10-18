// Automated test script to verify calculations, financial correctness, and edge cases
import assert from 'node:assert';

console.log('--- RUNNING CAMPUSPAISA FINANCIAL LOGIC TEST SUITE ---');

// Mock data
const mockCategories = [
  { id: 'inc-allowance', name: 'Family Allowance', type: 'income', icon: 'Wallet', color: '#35C9A5' },
  { id: 'exp-food', name: 'Food & Groceries', type: 'expense', icon: 'Utensils', color: '#F97316' },
  { id: 'exp-transport', name: 'Transport & Fuel', type: 'expense', icon: 'Bus', color: '#EAB308' },
  { id: 'exp-entertainment', name: 'Entertainment', type: 'expense', icon: 'Film', color: '#A855F7' },
];

const mockTransactions = [
  { id: '1', type: 'income', amount: 12000, categoryId: 'inc-allowance', description: 'Pocket Money', date: '2026-10-01', paymentMethod: 'UPI' },
  { id: '2', type: 'expense', amount: 3500, categoryId: 'exp-food', description: 'Mess Food', date: '2026-10-02', paymentMethod: 'UPI', isEssential: true },
  { id: '3', type: 'expense', amount: 500, categoryId: 'exp-transport', description: 'Metro', date: '2026-10-03', paymentMethod: 'Cash', isEssential: true },
  { id: '4', type: 'expense', amount: 1500, categoryId: 'exp-entertainment', description: 'Movie & Outing', date: '2026-10-04', paymentMethod: 'UPI', isEssential: false },
];

// 1. Total Income
const income = mockTransactions
  .filter(t => t.type === 'income')
  .reduce((s, t) => s + t.amount, 0);
assert.strictEqual(income, 12000, 'Income must match 12000');
console.log('✓ TEST 1 PASSED: Income calculation matches expected: 12000');

// 2. Total Expenses
const expenses = mockTransactions
  .filter(t => t.type === 'expense')
  .reduce((s, t) => s + t.amount, 0);
assert.strictEqual(expenses, 5500, 'Expenses must match 5500');
console.log('✓ TEST 2 PASSED: Expenses calculation matches expected: 5500');

// 3. Net Cash Flow = Income - Expenses
const netCashFlow = income - expenses;
assert.strictEqual(netCashFlow, 6500, 'Net cash flow must match 6500');
console.log('✓ TEST 3 PASSED: Net cash flow matches expected: 6500 (12000 - 5500)');

// 4. Budget Utilization & Separation from Net Cash Flow
const overallBudgetLimit = 8000;
const overallRemaining = overallBudgetLimit - expenses;
const overallUtilization = (expenses / overallBudgetLimit) * 100;
assert.strictEqual(overallRemaining, 2500, 'Remaining budget must be 2500');
assert.notStrictEqual(overallRemaining, netCashFlow, 'Remaining budget and net cash flow must be distinct concepts');
console.log(`✓ TEST 4 PASSED: Remaining Budget (${overallRemaining}) is strictly differentiated from Net Cash Flow (${netCashFlow})`);

// 5. Budget Threshold Warnings
const testUtilization = (spent, limit) => {
  const pct = (spent / limit) * 100;
  if (pct >= 100) return 'exceeded';
  if (pct >= 90) return 'warning-90';
  if (pct >= 75) return 'warning-75';
  return 'safe';
};
assert.strictEqual(testUtilization(5000, 10000), 'safe');
assert.strictEqual(testUtilization(7500, 10000), 'warning-75');
assert.strictEqual(testUtilization(9200, 10000), 'warning-90');
assert.strictEqual(testUtilization(10500, 10000), 'exceeded');
console.log('✓ TEST 5 PASSED: Budget threshold triggers accurately at safe, 75%, 90%, and 100% exceeded');

// 6. Category Breakdown percentage
const foodTotal = 3500;
const foodPct = (foodTotal / expenses) * 100;
assert.strictEqual(Math.round(foodPct * 10) / 10, 63.6);
console.log('✓ TEST 6 PASSED: Category expense percentage correctly calculates 63.6% for Food');

// 7. Needs vs Wants Essentiality Breakdown
const essential = mockTransactions.filter(t => t.type === 'expense' && t.isEssential === true).reduce((s, t) => s + t.amount, 0);
const nonEssential = mockTransactions.filter(t => t.type === 'expense' && t.isEssential === false).reduce((s, t) => s + t.amount, 0);
assert.strictEqual(essential, 4000);
assert.strictEqual(nonEssential, 1500);
console.log('✓ TEST 7 PASSED: Essential (4000) vs Non-Essential (1500) spending categorized accurately');

// 8. Recurring Date Generator
const getNextMonthlyDue = (dateStr) => {
  const parts = dateStr.split('-');
  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  d.setMonth(d.getMonth() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
assert.strictEqual(getNextMonthlyDue('2026-10-18'), '2026-11-18');
console.log('✓ TEST 8 PASSED: Recurring monthly bill advance calculates 2026-11-18 from 2026-10-18');

// 9. RFC 4180 CSV Escaping Test
function escapeCSV(val) {
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}
assert.strictEqual(escapeCSV('Canteen, Snacks'), '"Canteen, Snacks"');
assert.strictEqual(escapeCSV('Books "Algorithms"'), '"Books ""Algorithms"""');
console.log('✓ TEST 9 PASSED: RFC-4180 CSV escaping safely handles commas and quotes');

console.log('\nALL 9 FINANCIAL LOGIC & CALCULATION TESTS PASSED SUCCESSFULLY! ✓✓✓');
