import React, { useState, useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Bill, BillStatus, PaymentMethod } from '../types';
import { formatCurrency } from '../utils/currency';
import { formatDateDisplay, isOverdue, isUpcoming } from '../utils/dates';
import { CategoryIcon } from '../components/ui/CategoryIcon';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import {
  CalendarCheck2,
  Plus,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Trash2,
  Edit2,
  RotateCcw,
  Calendar,
  Filter,
} from 'lucide-react';

export const Bills: React.FC = () => {
  const {
    bills,
    categories,
    deleteBill,
    updateBill,
    markBillPaid,
    openModal,
    settings,
  } = useFinance();

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'overdue' | 'paid'>('all');
  const [billToDelete, setBillToDelete] = useState<Bill | null>(null);
  const [payingBill, setPayingBill] = useState<Bill | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('UPI');

  const catMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);

  // Process status dynamically
  const processedBills = useMemo(() => {
    return bills.map(b => {
      let dynamicStatus: BillStatus = b.status;
      if (b.status !== 'paid') {
        if (isOverdue(b.dueDate)) {
          dynamicStatus = 'overdue';
        } else {
          dynamicStatus = 'upcoming';
        }
      }
      return {
        ...b,
        computedStatus: dynamicStatus,
      };
    });
  }, [bills]);

  // Filter bills
  const filteredBills = useMemo(() => {
    return processedBills.filter(b => {
      if (statusFilter === 'pending') return b.computedStatus !== 'paid';
      if (statusFilter === 'overdue') return b.computedStatus === 'overdue';
      if (statusFilter === 'paid') return b.computedStatus === 'paid';
      return true;
    }).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [processedBills, statusFilter]);

  // Overdue count and pending amount
  const overdueCount = processedBills.filter(b => b.computedStatus === 'overdue').length;
  const upcomingTotal = processedBills
    .filter(b => b.computedStatus !== 'paid')
    .reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

  const handleConfirmPay = () => {
    if (payingBill) {
      markBillPaid(payingBill.id, selectedPaymentMethod);
      setPayingBill(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-navy-card p-5 rounded-2xl border border-surface-border dark:border-surface-darkBorder shadow-card">
        <div>
          <h2 className="text-2xl font-extrabold text-ink-primary dark:text-white tracking-tight">
            Bills & Due Reminders
          </h2>
          <p className="text-xs sm:text-sm text-ink-secondary dark:text-ink-darkSecondary mt-0.5">
            Never miss campus mess dues, electricity splits, mobile packs, or library fines.
          </p>
        </div>

        <button
          onClick={() => openModal('bill')}
          className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-md shadow-primary/25 transition active:scale-[0.98] flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Bill Reminder</span>
        </button>
      </div>

      {/* Bill Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-navy-card p-4 rounded-xl border border-surface-border dark:border-surface-darkBorder shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-ink-secondary dark:text-ink-darkSecondary uppercase tracking-wider">
              Total Pending Dues
            </p>
            <p className="text-2xl font-extrabold text-ink-primary dark:text-white mt-1">
              {formatCurrency(upcomingTotal, settings.currency)}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-navy-card p-4 rounded-xl border border-surface-border dark:border-surface-darkBorder shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-ink-secondary dark:text-ink-darkSecondary uppercase tracking-wider">
              Overdue Alerts
            </p>
            <p className="text-2xl font-extrabold text-danger mt-1">
              {overdueCount} {overdueCount === 1 ? 'bill' : 'bills'}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-danger/10 text-danger">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-navy-card p-4 rounded-xl border border-surface-border dark:border-surface-darkBorder shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-ink-secondary dark:text-ink-darkSecondary uppercase tracking-wider">
              Paid Records
            </p>
            <p className="text-2xl font-extrabold text-mint mt-1">
              {processedBills.filter(b => b.computedStatus === 'paid').length} cleared
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-mint/15 text-mint">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-surface-border dark:border-surface-darkBorder pb-2 overflow-x-auto">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            statusFilter === 'all'
              ? 'bg-primary text-white shadow-sm'
              : 'text-ink-secondary hover:text-ink-primary dark:hover:text-white'
          }`}
        >
          All Bills ({processedBills.length})
        </button>
        <button
          onClick={() => setStatusFilter('pending')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            statusFilter === 'pending'
              ? 'bg-warning-dark text-white shadow-sm'
              : 'text-ink-secondary hover:text-ink-primary dark:hover:text-white'
          }`}
        >
          Unpaid Pending ({processedBills.filter(b => b.computedStatus !== 'paid').length})
        </button>
        <button
          onClick={() => setStatusFilter('overdue')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            statusFilter === 'overdue'
              ? 'bg-danger text-white shadow-sm'
              : 'text-ink-secondary hover:text-ink-primary dark:hover:text-white'
          }`}
        >
          Overdue ({overdueCount})
        </button>
        <button
          onClick={() => setStatusFilter('paid')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            statusFilter === 'paid'
              ? 'bg-mint text-navy font-extrabold shadow-sm'
              : 'text-ink-secondary hover:text-ink-primary dark:hover:text-white'
          }`}
        >
          Paid ({processedBills.filter(b => b.computedStatus === 'paid').length})
        </button>
      </div>

      {/* Bills List / Cards */}
      {filteredBills.length === 0 ? (
        <div className="bg-white dark:bg-navy-card rounded-2xl p-12 border border-surface-border dark:border-surface-darkBorder text-center">
          <CalendarCheck2 className="w-12 h-12 text-mint mx-auto mb-3 opacity-80" />
          <h4 className="text-base font-bold text-ink-primary dark:text-white">
            No Bills in this View
          </h4>
          <p className="text-xs text-ink-secondary dark:text-ink-darkSecondary mt-1 max-w-sm mx-auto">
            You don't have any bills matching this filter criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBills.map(bill => {
            const cat = catMap.get(bill.categoryId);
            const isPaid = bill.computedStatus === 'paid';
            const isLate = bill.computedStatus === 'overdue';

            return (
              <div
                key={bill.id}
                className={`bg-white dark:bg-navy-card rounded-2xl p-5 border shadow-card flex flex-col justify-between transition ${
                  isLate
                    ? 'border-danger/40 ring-1 ring-danger/20'
                    : 'border-surface-border dark:border-surface-darkBorder'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-2xs"
                        style={{ backgroundColor: cat ? cat.color : '#635BDB' }}
                      >
                        <CategoryIcon name={cat ? cat.icon : 'Receipt'} size={17} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-ink-primary dark:text-white leading-tight">
                          {bill.name}
                        </h4>
                        <span className="text-[10px] text-ink-muted uppercase tracking-wider font-semibold">
                          {cat ? cat.name : 'Bill'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => openModal('bill', bill)}
                        className="p-1.5 rounded-lg text-ink-secondary hover:text-ink-primary dark:hover:text-white hover:bg-surface-light dark:hover:bg-navy transition"
                        title="Edit bill"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setBillToDelete(bill)}
                        className="p-1.5 rounded-lg text-ink-secondary hover:text-danger hover:bg-danger/10 transition"
                        title="Delete bill"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Amount & Status Badge */}
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xl font-extrabold text-ink-primary dark:text-white">
                      {formatCurrency(bill.amount, settings.currency)}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        isPaid
                          ? 'bg-mint/15 text-mint-dark'
                          : isLate
                          ? 'bg-danger/10 text-danger'
                          : 'bg-warning/15 text-warning-dark'
                      }`}
                    >
                      {isPaid ? 'PAID' : isLate ? 'OVERDUE' : 'UPCOMING'}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="mt-3 space-y-1 text-xs text-ink-secondary dark:text-ink-darkSecondary">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-ink-muted" />
                      <span>Due: {formatDateDisplay(bill.dueDate)}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <RotateCcw className="w-3.5 h-3.5 text-ink-muted" />
                      <span className="capitalize">
                        Recurrence: {bill.recurrence}
                      </span>
                    </div>
                    {bill.notes && (
                      <p className="text-[11px] text-ink-muted pt-1 italic line-clamp-2">
                        "{bill.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-5 pt-3 border-t border-surface-border/60 dark:border-surface-darkBorder/60 flex items-center justify-between">
                  {isPaid ? (
                    <span className="text-[11px] text-mint font-semibold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Cleared {bill.paidDate ? formatDateDisplay(bill.paidDate) : ''}</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => setPayingBill(bill)}
                      className="w-full py-2 rounded-xl text-xs font-bold text-white bg-mint hover:bg-mint-dark text-navy font-extrabold shadow-sm transition flex items-center justify-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-navy" />
                      <span>Mark Paid & Record Expense</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Payment Confirmation & Method Selector Modal */}
      {payingBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-navy-card rounded-2xl p-6 max-w-sm w-full border border-surface-border dark:border-surface-darkBorder shadow-modal space-y-4">
            <h3 className="font-bold text-base text-ink-primary dark:text-white">
              Confirm Bill Payment
            </h3>
            <p className="text-xs text-ink-secondary dark:text-ink-darkSecondary leading-relaxed">
              Marking <strong className="text-ink-primary dark:text-white">"{payingBill.name}"</strong> as paid will record an expense transaction of{' '}
              <strong className="text-danger font-bold">
                {formatCurrency(payingBill.amount, settings.currency)}
              </strong>
              . If recurring, the next due occurrence will be automatically generated.
            </p>

            <div>
              <label className="block text-xs font-semibold text-ink-secondary dark:text-ink-darkSecondary uppercase tracking-wider mb-1">
                Payment Method Used
              </label>
              <select
                value={selectedPaymentMethod}
                onChange={e => setSelectedPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2.5 bg-surface-light dark:bg-navy border border-surface-border dark:border-surface-darkBorder rounded-xl text-xs font-medium text-ink-primary dark:text-white outline-none focus:border-primary transition"
              >
                <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
                <option value="Cash">Cash</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>

            <div className="flex justify-end space-x-2 pt-3 border-t border-surface-border dark:border-surface-darkBorder">
              <button
                type="button"
                onClick={() => setPayingBill(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-ink-secondary hover:text-ink-primary dark:hover:text-white bg-surface-light dark:bg-navy transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmPay}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-mint hover:bg-mint-dark text-navy font-extrabold shadow-sm transition"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!billToDelete}
        title="Delete Bill Reminder?"
        message={`Are you sure you want to delete "${billToDelete?.name}"?`}
        confirmLabel="Delete Bill"
        onConfirm={() => {
          if (billToDelete) deleteBill(billToDelete.id);
        }}
        onCancel={() => setBillToDelete(null)}
      />
    </div>
  );
};
