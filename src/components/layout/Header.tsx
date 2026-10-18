import React, { useState } from 'react';
import { Menu, Sun, Moon, Bell, Calendar, ChevronDown, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { getMonthOptions, isOverdue, isUpcoming, formatDateDisplay } from '../../utils/dates';
import { formatCurrency } from '../../utils/currency';
import { Link } from 'react-router-dom';

interface HeaderProps {
  pageTitle: string;
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ pageTitle, onMenuClick }) => {
  const {
    settings,
    updateSettings,
    selectedMonth,
    setSelectedMonth,
    bills,
    openModal,
  } = useFinance();

  const [showNotifications, setShowNotifications] = useState(false);
  const monthOptions = getMonthOptions();

  // Calculate bill reminders: overdue or due in next 5 days
  const pendingBills = bills.filter(b => b.status !== 'paid');
  const alertBills = pendingBills.filter(
    b => isOverdue(b.dueDate) || isUpcoming(b.dueDate, 7)
  );

  const toggleTheme = () => {
    const next = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: next });
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-navy/90 backdrop-blur-md border-b border-surface-border dark:border-surface-darkBorder px-4 lg:px-8 py-3.5 transition-colors">
      <div className="flex items-center justify-between">
        {/* Left: Mobile hamburger & Page Title */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl text-ink-secondary hover:text-ink-primary dark:hover:text-white hover:bg-surface-light dark:hover:bg-navy-card transition"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-ink-primary dark:text-white tracking-tight">
              {pageTitle}
            </h1>
            <p className="text-xs text-ink-secondary dark:text-ink-darkSecondary hidden sm:block">
              Welcome back, {settings.userName || 'Student'}! {settings.collegeName ? `• ${settings.collegeName}` : ''}
            </p>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Month Selector Dropdown */}
          <div className="relative">
            <div className="flex items-center space-x-1.5 bg-surface-light dark:bg-navy-card border border-surface-border dark:border-surface-darkBorder rounded-xl px-3 py-1.5 text-xs font-semibold text-ink-primary dark:text-ink-darkPrimary shadow-sm hover:border-primary/50 transition">
              <Calendar className="w-3.5 h-3.5 text-primary dark:text-mint flex-shrink-0" />
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(e.target.value)}
                className="bg-transparent border-none outline-none cursor-pointer pr-2 font-medium"
                aria-label="Select finance month"
              >
                <option value="all" className="dark:bg-navy-card dark:text-white">
                  All Time
                </option>
                {monthOptions.map(opt => (
                  <option key={opt.value} value={opt.value} className="dark:bg-navy-card dark:text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-ink-muted pointer-events-none" />
            </div>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-ink-secondary hover:text-ink-primary dark:hover:text-white bg-surface-light dark:bg-navy-card border border-surface-border dark:border-surface-darkBorder transition shadow-sm"
            aria-label={`Switch to ${settings.theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${settings.theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-warning" />
            ) : (
              <Moon className="w-4 h-4 text-primary" />
            )}
          </button>

          {/* Notification / Reminders Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-ink-secondary hover:text-ink-primary dark:hover:text-white bg-surface-light dark:bg-navy-card border border-surface-border dark:border-surface-darkBorder transition shadow-sm"
              aria-label="View notifications and bill reminders"
            >
              <Bell className="w-4 h-4" />
              {alertBills.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {alertBills.length}
                </span>
              )}
            </button>

            {/* Notification Menu */}
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-navy-card rounded-2xl shadow-modal border border-surface-border dark:border-surface-darkBorder p-4 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-surface-border dark:border-surface-darkBorder">
                    <span className="font-bold text-sm text-ink-primary dark:text-white">
                      Bills & Reminders
                    </span>
                    <span className="text-[11px] text-ink-secondary dark:text-ink-darkSecondary">
                      {alertBills.length} alerts
                    </span>
                  </div>

                  {alertBills.length === 0 ? (
                    <div className="py-6 text-center text-ink-secondary dark:text-ink-darkSecondary">
                      <CheckCircle2 className="w-8 h-8 text-mint mx-auto mb-2 opacity-80" />
                      <p className="font-medium">All caught up!</p>
                      <p className="text-[11px] text-ink-muted mt-0.5">No overdue or urgent bills due this week.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {alertBills.map(bill => {
                        const overdue = isOverdue(bill.dueDate);
                        return (
                          <div
                            key={bill.id}
                            className={`p-2.5 rounded-xl border flex items-center justify-between ${
                              overdue
                                ? 'bg-danger/5 border-danger/30 dark:bg-danger/10'
                                : 'bg-warning/5 border-warning/30 dark:bg-warning/10'
                            }`}
                          >
                            <div className="flex items-start space-x-2">
                              {overdue ? (
                                <AlertTriangle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
                              ) : (
                                <Clock className="w-4 h-4 text-warning-dark flex-shrink-0 mt-0.5" />
                              )}
                              <div>
                                <p className="font-semibold text-ink-primary dark:text-white">
                                  {bill.name}
                                </p>
                                <p className="text-[11px] text-ink-secondary dark:text-ink-darkSecondary">
                                  {overdue ? 'Overdue since ' : 'Due '}{formatDateDisplay(bill.dueDate)}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-ink-primary dark:text-white block">
                                {formatCurrency(bill.amount, settings.currency)}
                              </span>
                              <Link
                                to="/bills"
                                onClick={() => setShowNotifications(false)}
                                className="text-[10px] text-primary dark:text-mint font-bold hover:underline"
                              >
                                View &rarr;
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-3 pt-2 border-t border-surface-border dark:border-surface-darkBorder flex justify-between items-center text-[11px]">
                    <Link
                      to="/bills"
                      onClick={() => setShowNotifications(false)}
                      className="text-primary dark:text-mint font-semibold hover:underline"
                    >
                      Manage All Bills
                    </Link>
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        openModal('bill');
                      }}
                      className="text-ink-secondary hover:text-ink-primary dark:hover:text-white"
                    >
                      + Add Bill
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Settings Shortcut */}
          <Link
            to="/settings"
            className="p-2 rounded-xl text-ink-secondary hover:text-ink-primary dark:hover:text-white bg-surface-light dark:bg-navy-card border border-surface-border dark:border-surface-darkBorder transition shadow-sm"
            aria-label="Settings and Profile"
            title="Settings and Profile"
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-primary to-mint flex items-center justify-center text-white text-[10px] font-extrabold uppercase">
              {settings.userName ? settings.userName.charAt(0) : 'S'}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};
