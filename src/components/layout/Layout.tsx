import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastContainer } from '../ui/Toast';
import { TransactionModal } from '../forms/TransactionModal';
import { BudgetModal } from '../forms/BudgetModal';
import { GoalModal } from '../forms/GoalModal';
import { ContributionModal } from '../forms/ContributionModal';
import { BillModal } from '../forms/BillModal';
import { CategoryModal } from '../forms/CategoryModal';

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Determine current page title
  const getPageTitle = (pathname: string): string => {
    switch (pathname) {
      case '/':
        return 'Overview Dashboard';
      case '/transactions':
        return 'Transactions & Cash Flow';
      case '/budgets':
        return 'Monthly Budgets';
      case '/savings':
        return 'Savings Goals';
      case '/bills':
        return 'Bills & Reminders';
      case '/reports':
        return 'Reports & Analytics';
      case '/settings':
        return 'Settings & Data Backup';
      default:
        return 'CampusPaisa';
    }
  };

  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-darkBg text-ink-primary dark:text-ink-darkPrimary transition-colors duration-200 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Sticky Header */}
        <Header pageTitle={pageTitle} onMenuClick={() => setSidebarOpen(true)} />

        {/* Page View Body */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* Global Modals */}
      <TransactionModal />
      <BudgetModal />
      <GoalModal />
      <ContributionModal />
      <BillModal />
      <CategoryModal />

      {/* Floating Toasts */}
      <ToastContainer />
    </div>
  );
};
