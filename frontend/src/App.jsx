import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute.jsx';

import Login from './pages/Auth/Login.jsx';
import Signup from './pages/Auth/Signup.jsx';
import Dashboard from './pages/Dashboard/Dashboard.jsx';

import ContactList from './pages/Contacts/ContactList.jsx';
import ContactForm from './pages/Contacts/ContactForm.jsx';

import ProductList from './pages/Products/ProductList.jsx';
import ProductForm from './pages/Products/ProductForm.jsx';

import ChartOfAccounts from './pages/ChartOfAccounts/ChartOfAccounts.jsx';
import Journals from './pages/Journals/Journals.jsx';
import JournalEntries from './pages/JournalEntries/JournalEntries.jsx';

import SalesOrderList from './pages/Sales/SalesOrderList.jsx';
import SalesOrderForm from './pages/Sales/SalesOrderForm.jsx';

import PurchaseOrderList from './pages/Purchase/PurchaseOrderList.jsx';
import PurchaseOrderForm from './pages/Purchase/PurchaseOrderForm.jsx';

import PaymentForm from './pages/Payments/PaymentForm.jsx';

import BalanceSheet from './pages/Reports/BalanceSheet.jsx';
import ProfitLoss from './pages/Reports/ProfitLoss.jsx';
import BudgetReport from './pages/Reports/BudgetReport.jsx';

import AnalyticList from './pages/Analytics/AnalyticList.jsx';
import BudgetList from './pages/Budget/BudgetList.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

      {/* Master Data */}
      <Route path="/contacts" element={<ProtectedRoute><ContactList /></ProtectedRoute>} />
      <Route path="/contacts/new" element={<ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}><ContactForm /></ProtectedRoute>} />
      <Route path="/contacts/:id" element={<ProtectedRoute><ContactForm /></ProtectedRoute>} />

      <Route path="/products" element={<ProtectedRoute><ProductList /></ProtectedRoute>} />
      <Route path="/products/new" element={<ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}><ProductForm /></ProtectedRoute>} />
      <Route path="/products/:id" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />

      <Route path="/chart-of-accounts" element={<ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}><ChartOfAccounts /></ProtectedRoute>} />
      <Route path="/journals" element={<ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}><Journals /></ProtectedRoute>} />
      <Route path="/journal-entries" element={<ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}><JournalEntries /></ProtectedRoute>} />

      <Route path="/analytics" element={<ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}><AnalyticList /></ProtectedRoute>} />
      <Route path="/budgets" element={<ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}><BudgetList /></ProtectedRoute>} />

      {/* Transaction Flow */}
      <Route path="/sales" element={<ProtectedRoute><SalesOrderList /></ProtectedRoute>} />
      <Route path="/sales/new" element={<ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}><SalesOrderForm /></ProtectedRoute>} />

      <Route path="/purchases" element={<ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}><PurchaseOrderList /></ProtectedRoute>} />
      <Route path="/purchases/new" element={<ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}><PurchaseOrderForm /></ProtectedRoute>} />

      <Route path="/payments/new" element={<ProtectedRoute><PaymentForm /></ProtectedRoute>} />

      {/* Reports */}
      <Route path="/reports/balance-sheet" element={<ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}><BalanceSheet /></ProtectedRoute>} />
      <Route path="/reports/profit-loss" element={<ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}><ProfitLoss /></ProtectedRoute>} />
      <Route path="/reports/budget" element={<ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}><BudgetReport /></ProtectedRoute>} />
    </Routes>
  );
}
