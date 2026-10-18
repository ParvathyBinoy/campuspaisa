import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FinanceProvider } from './context/FinanceContext';
import { Layout } from './components/layout/Layout';
import { Overview } from './pages/Overview';
import { Transactions } from './pages/Transactions';
import { Budgets } from './pages/Budgets';
import { SavingsGoals } from './pages/SavingsGoals';
import { Bills } from './pages/Bills';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

export const App: React.FC = () => {
  return (
    <FinanceProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Overview />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="budgets" element={<Budgets />} />
            <Route path="savings" element={<SavingsGoals />} />
            <Route path="bills" element={<Bills />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </FinanceProvider>
  );
};

export default App;
