import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Transaction, TransactionType, PaymentMethod } from '../types';
import { formatCurrency } from '../utils/currency';
import { formatDateDisplay } from '../utils/dates';
import { CategoryIcon } from '../components/ui/CategoryIcon';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { exportTransactionsToCSV } from '../utils/export';
import {
  Plus,
  Search,
  Filter,
  Download,
  Edit2,
  Trash2,
  ArrowUpDown,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronLeft,
  ChevronRight,
  Tag,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export const Transactions: React.FC = () => {
  const {
    transactions,
    categories,
    deleteTransaction,
    openModal,
    settings,
  } = useFinance();

  // Search & Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Deletion state
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);

  const catMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const descMatch = t.description.toLowerCase().includes(query);
        const cat = catMap.get(t.categoryId);
        const catMatch = cat ? cat.name.toLowerCase().includes(query) : false;
        const subCatMatch = t.subCategory ? t.subCategory.toLowerCase().includes(query) : false;
        const tagMatch = t.tags ? t.tags.some(tag => tag.toLowerCase().includes(query)) : false;

        if (!descMatch && !catMatch && !subCatMatch && !tagMatch) {
          return false;
        }
      }

      // Type
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;

      // Category
      if (categoryFilter !== 'all' && t.categoryId !== categoryFilter) return false;

      // Payment
      if (paymentFilter !== 'all' && t.paymentMethod !== paymentFilter) return false;

      // Date Range
      if (startDate && t.date < startDate) return false;
      if (endDate && t.date > endDate) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'amount-desc') return b.amount - a.amount;
      if (sortBy === 'amount-asc') return a.amount - b.amount;
      return 0;
    });
  }, [
    transactions,
    searchQuery,
    typeFilter,
    categoryFilter,
    paymentFilter,
    startDate,
    endDate,
    sortBy,
    catMap,
  ]);

  // Financial totals for the currently filtered set
  const filteredTotals = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredTransactions.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'income') income += amt;
      else expense += amt;
    });
    return {
      income,
      expense,
      net: income - expense,
      count: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  // Pagination slice
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(start, start + itemsPerPage);
  }, [filteredTransactions, currentPage]);

  const handleExportCSV = () => {
    exportTransactionsToCSV(filteredTransactions, categories, 'campuspaisa-filtered-transactions');
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setCategoryFilter('all');
    setPaymentFilter('all');
    setStartDate('');
    setEndDate('');
    setSortBy('date-desc');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-navy-card p-5 rounded-2xl border border-surface-border dark:border-surface-darkBorder shadow-card">
        <div>
          <h2 className="text-2xl font-extrabold text-ink-primary dark:text-white tracking-tight">
            Transaction History
          </h2>
          <p className="text-xs sm:text-sm text-ink-secondary dark:text-ink-darkSecondary mt-0.5">
            Log, filter, and audit every rupee coming in and going out.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl border border-surface-border dark:border-surface-darkBorder bg-surface-light dark:bg-navy text-xs sm:text-sm font-semibold text-ink-primary dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center space-x-1.5 shadow-2xs"
            title="Download CSV spreadsheet"
          >
            <Download className="w-4 h-4 text-primary dark:text-mint" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => openModal('transaction')}
            className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-md shadow-primary/25 transition active:scale-[0.98] flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Filtered Results Quick Totals Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-navy-card p-4 rounded-xl border border-surface-border dark:border-surface-darkBorder shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-ink-secondary dark:text-ink-darkSecondary uppercase tracking-wider">
              Filtered Income
            </p>
            <p className="text-xl font-bold text-mint mt-1">
              +{formatCurrency(filteredTotals.income, settings.currency)}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-mint/10 text-mint">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-navy-card p-4 rounded-xl border border-surface-border dark:border-surface-darkBorder shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-ink-secondary dark:text-ink-darkSecondary uppercase tracking-wider">
              Filtered Expenses
            </p>
            <p className="text-xl font-bold text-danger mt-1">
              -{formatCurrency(filteredTotals.expense, settings.currency)}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-danger/10 text-danger">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-navy-card p-4 rounded-xl border border-surface-border dark:border-surface-darkBorder shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-ink-secondary dark:text-ink-darkSecondary uppercase tracking-wider">
              Net Flow ({filteredTotals.count} records)
            </p>
            <p
              className={`text-xl font-bold mt-1 ${
                filteredTotals.net >= 0 ? 'text-mint' : 'text-danger'
              }`}
            >
              {filteredTotals.net >= 0 ? '+' : ''}
              {formatCurrency(filteredTotals.net, settings.currency)}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Filter className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Comprehensive Filter Controls */}
      <div className="bg-white dark:bg-navy-card p-4 rounded-2xl border border-surface-border dark:border-surface-darkBorder shadow-card space-y-3">
        {/* Row 1: Search & Type */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by description, tag, or note..."
              className="w-full pl-9 pr-4 py-2.5 bg-surface-light dark:bg-navy border border-surface-border dark:border-surface-darkBorder rounded-xl text-xs sm:text-sm text-ink-primary dark:text-white outline-none focus:border-primary transition"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={typeFilter}
              onChange={e => {
                setTypeFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 bg-surface-light dark:bg-navy border border-surface-border dark:border-surface-darkBorder rounded-xl text-xs sm:text-sm font-medium text-ink-primary dark:text-white outline-none focus:border-primary transition"
            >
              <option value="all">All Types (Income & Expenses)</option>
              <option value="expense">Expenses Only</option>
              <option value="income">Income Only</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={categoryFilter}
              onChange={e => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 bg-surface-light dark:bg-navy border border-surface-border dark:border-surface-darkBorder rounded-xl text-xs sm:text-sm font-medium text-ink-primary dark:text-white outline-none focus:border-primary transition"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Payment, Date Range, Sort */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1 border-t border-surface-border/50 dark:border-surface-darkBorder/50">
          <div className="sm:col-span-3">
            <select
              value={paymentFilter}
              onChange={e => {
                setPaymentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 bg-surface-light dark:bg-navy border border-surface-border dark:border-surface-darkBorder rounded-xl text-xs font-medium text-ink-primary dark:text-white outline-none focus:border-primary transition"
            >
              <option value="all">All Payment Methods</option>
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="sm:col-span-3 flex items-center space-x-1.5">
            <span className="text-[11px] text-ink-muted">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={e => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2 py-2 bg-surface-light dark:bg-navy border border-surface-border dark:border-surface-darkBorder rounded-xl text-xs font-medium text-ink-primary dark:text-white outline-none focus:border-primary transition"
            />
          </div>

          <div className="sm:col-span-3 flex items-center space-x-1.5">
            <span className="text-[11px] text-ink-muted">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={e => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2 py-2 bg-surface-light dark:bg-navy border border-surface-border dark:border-surface-darkBorder rounded-xl text-xs font-medium text-ink-primary dark:text-white outline-none focus:border-primary transition"
            />
          </div>

          <div className="sm:col-span-2">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 bg-surface-light dark:bg-navy border border-surface-border dark:border-surface-darkBorder rounded-xl text-xs font-medium text-ink-primary dark:text-white outline-none focus:border-primary transition"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
            </select>
          </div>

          <div className="sm:col-span-1 flex items-center justify-end">
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-primary dark:text-mint hover:underline"
              title="Reset all filters"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table & Mobile Card View */}
      <div className="bg-white dark:bg-navy-card rounded-2xl border border-surface-border dark:border-surface-darkBorder shadow-card overflow-hidden">
        {paginatedTransactions.length === 0 ? (
          <div className="py-16 text-center text-ink-secondary dark:text-ink-darkSecondary">
            <Filter className="w-10 h-10 mx-auto text-ink-muted mb-3 opacity-50" />
            <h4 className="text-base font-bold text-ink-primary dark:text-white">
              No transactions match your filters
            </h4>
            <p className="text-xs text-ink-muted mt-1 max-w-sm mx-auto">
              Try adjusting your search query, date range, or category filter to find the transaction.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-primary dark:text-mint bg-primary/10 hover:bg-primary/20 transition"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-surface-light/60 dark:bg-navy/60 border-b border-surface-border dark:border-surface-darkBorder text-ink-secondary dark:text-ink-darkSecondary uppercase tracking-wider font-semibold">
                    <th className="py-3.5 pl-4">Category</th>
                    <th className="py-3.5 px-3">Description</th>
                    <th className="py-3.5 px-3">Date</th>
                    <th className="py-3.5 px-3">Payment</th>
                    <th className="py-3.5 px-3">Tags & Class</th>
                    <th className="py-3.5 px-3 text-right">Amount</th>
                    <th className="py-3.5 pr-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/50 dark:divide-surface-darkBorder/50">
                  {paginatedTransactions.map(tx => {
                    const cat = catMap.get(tx.categoryId);
                    const isIncome = tx.type === 'income';

                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-surface-light/50 dark:hover:bg-navy/40 transition group"
                      >
                        {/* Category */}
                        <td className="py-3.5 pl-4">
                          <div className="flex items-center space-x-2.5">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0 shadow-2xs"
                              style={{ backgroundColor: cat ? cat.color : '#635BDB' }}
                            >
                              <CategoryIcon name={cat ? cat.icon : 'Tag'} size={15} />
                            </div>
                            <div>
                              <p className="font-bold text-ink-primary dark:text-white truncate max-w-[130px]">
                                {cat ? cat.name : 'Other'}
                              </p>
                              {tx.subCategory && (
                                <p className="text-[10px] text-ink-muted truncate max-w-[130px]">
                                  {tx.subCategory}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Description */}
                        <td className="py-3.5 px-3 font-medium text-ink-primary dark:text-ink-darkPrimary max-w-[200px] truncate">
                          {tx.description}
                          {tx.billId && (
                            <span className="ml-1.5 inline-block text-[10px] font-bold text-primary dark:text-mint">
                              [Bill Payment]
                            </span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-3 text-ink-secondary dark:text-ink-darkSecondary whitespace-nowrap">
                          {formatDateDisplay(tx.date)}
                        </td>

                        {/* Payment Method */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className="px-2 py-1 rounded-md bg-surface-light dark:bg-navy text-[11px] font-medium text-ink-secondary dark:text-ink-darkSecondary border border-surface-border dark:border-surface-darkBorder">
                            {tx.paymentMethod}
                          </span>
                        </td>

                        {/* Tags & Essentiality */}
                        <td className="py-3.5 px-3">
                          <div className="flex flex-wrap gap-1 items-center max-w-[180px]">
                            {tx.type === 'expense' && tx.isEssential !== undefined && (
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  tx.isEssential
                                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                                    : 'bg-purple-500/10 text-purple-600 dark:text-purple-400'
                                }`}
                              >
                                {tx.isEssential ? 'Essential' : 'Non-Essential'}
                              </span>
                            )}
                            {tx.tags &&
                              tx.tags.slice(0, 2).map(tag => (
                                <span
                                  key={tag}
                                  className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-navy text-ink-muted"
                                >
                                  #{tag}
                                </span>
                              ))}
                          </div>
                        </td>

                        {/* Amount */}
                        <td
                          className={`py-3.5 px-3 text-right font-bold text-sm whitespace-nowrap ${
                            isIncome ? 'text-mint dark:text-mint' : 'text-danger'
                          }`}
                        >
                          {isIncome ? '+' : '-'}
                          {formatCurrency(tx.amount, settings.currency)}
                        </td>

                        {/* Action buttons */}
                        <td className="py-3.5 pr-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center space-x-1.5">
                            <button
                              onClick={() => openModal('transaction', tx)}
                              className="p-1.5 rounded-lg text-ink-secondary hover:text-primary dark:hover:text-mint hover:bg-surface-light dark:hover:bg-navy transition"
                              title="Edit transaction"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setTxToDelete(tx)}
                              className="p-1.5 rounded-lg text-ink-secondary hover:text-danger hover:bg-danger/10 transition"
                              title="Delete transaction"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 border-t border-surface-border dark:border-surface-darkBorder flex items-center justify-between text-xs text-ink-secondary dark:text-ink-darkSecondary">
              <span>
                Showing {(currentPage - 1) * itemsPerPage + 1} -{' '}
                {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of{' '}
                {filteredTransactions.length} transactions
              </span>

              <div className="flex items-center space-x-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-surface-border dark:border-surface-darkBorder disabled:opacity-40 hover:bg-surface-light dark:hover:bg-navy transition"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-semibold text-ink-primary dark:text-white">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-surface-border dark:border-surface-darkBorder disabled:opacity-40 hover:bg-surface-light dark:hover:bg-navy transition"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!txToDelete}
        title="Delete Transaction?"
        message={`Are you sure you want to permanently delete "${txToDelete?.description}" for ${
          txToDelete ? formatCurrency(txToDelete.amount, settings.currency) : ''
        }? This will remove it from your budget, category, and cash flow calculations.`}
        confirmLabel="Delete Transaction"
        onConfirm={() => {
          if (txToDelete) deleteTransaction(txToDelete.id);
        }}
        onCancel={() => setTxToDelete(null)}
      />
    </div>
  );
};
