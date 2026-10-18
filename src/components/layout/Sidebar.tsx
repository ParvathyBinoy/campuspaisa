import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Target,
  CalendarCheck2,
  BarChart3,
  Settings,
  Plus,
  Coins,
  X,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { openModal, isDemoLoaded, loadDemoData } = useFinance();

  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
    { to: '/budgets', label: 'Budgets', icon: PieChart },
    { to: '/savings', label: 'Savings Goals', icon: Target },
    { to: '/bills', label: 'Bills & Reminders', icon: CalendarCheck2 },
    { to: '/reports', label: 'Reports', icon: BarChart3 },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-navy border-r border-surface-border dark:border-surface-darkBorder flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand & Add Action */}
        <div>
          <div className="h-16 px-6 flex items-center justify-between border-b border-surface-border/60 dark:border-surface-darkBorder/60">
            <NavLink to="/" onClick={onClose} className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-primary-hover flex items-center justify-center text-white shadow-md shadow-primary/20">
                <Coins className="w-5 h-5 text-mint" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-navy dark:text-white leading-tight">
                  Campus<span className="text-primary dark:text-mint">Paisa</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-ink-muted">
                  Student Finance
                </span>
              </div>
            </NavLink>
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-ink-secondary hover:text-ink-primary dark:hover:text-white"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action Button */}
          <div className="p-4">
            <button
              onClick={() => {
                openModal('transaction');
                if (window.innerWidth < 1024) onClose();
              }}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover active:scale-[0.98] text-white font-semibold text-sm shadow-md shadow-primary/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Transaction</span>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      isActive
                        ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-mint font-semibold shadow-sm'
                        : 'text-ink-secondary dark:text-ink-darkSecondary hover:text-ink-primary dark:hover:text-white hover:bg-surface-light dark:hover:bg-navy-card'
                    }`
                  }
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom helper card / Demo data banner */}
        <div className="p-4 border-t border-surface-border/60 dark:border-surface-darkBorder/60">
          {!isDemoLoaded ? (
            <div className="bg-primary-light/50 dark:bg-navy-card p-3 rounded-xl border border-primary/20">
              <div className="flex items-center space-x-2 text-primary dark:text-mint text-xs font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>Want to see it in action?</span>
              </div>
              <p className="text-[11px] text-ink-secondary dark:text-ink-darkSecondary mt-1 leading-snug">
                Load sample student pocket money, canteen & internship data.
              </p>
              <button
                onClick={() => {
                  loadDemoData();
                  if (window.innerWidth < 1024) onClose();
                }}
                className="mt-2 text-xs font-bold text-primary dark:text-mint hover:underline inline-flex items-center"
              >
                Load Demo Data &rarr;
              </button>
            </div>
          ) : (
            <div className="text-center">
              <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-mint/15 text-mint border border-mint/30">
                Demo Student Mode Active
              </span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
