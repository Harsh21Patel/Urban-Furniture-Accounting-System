import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute.jsx';

import Login from './pages/Auth/Login.jsx';
import Signup from './pages/Auth/Signup.jsx';
import CreateUser from './pages/Auth/CreateUser.jsx';
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import ContactPortal from './pages/ContactPortal/ContactPortal.jsx';

import ContactList from './pages/Contacts/ContactList.jsx';
import ContactForm from './pages/Contacts/ContactForm.jsx';

import ProductList from './pages/Products/ProductList.jsx';
import ProductForm from './pages/Products/ProductForm.jsx';

import ChartOfAccounts from './pages/ChartOfAccounts/ChartOfAccounts.jsx';
import Journals from './pages/Journals/Journals.jsx';
import JournalEntries from './pages/JournalEntries/JournalEntries.jsx';

import SalesOrderList from './pages/Sales/SalesOrderList.jsx';
import SalesOrderForm from './pages/Sales/SalesOrderForm.jsx';
import SaleInvoiceList from './pages/Sales/SaleInvoiceList.jsx';

import PurchaseOrderList from './pages/Purchase/PurchaseOrderList.jsx';
import PurchaseOrderForm from './pages/Purchase/PurchaseOrderForm.jsx';
import PurchaseBillList from './pages/Purchase/PurchaseBillList.jsx';

import PaymentList from './pages/Payments/PaymentList.jsx';
import PaymentForm from './pages/Payments/PaymentForm.jsx';

import BalanceSheet from './pages/Reports/BalanceSheet.jsx';
import ProfitLoss from './pages/Reports/ProfitLoss.jsx';
import BudgetReport from './pages/Reports/BudgetReport.jsx';
import LedgerReport from './pages/Reports/LedgerReport.jsx';
import JournalReport from './pages/Reports/JournalReport.jsx';

import AnalyticList from './pages/Analytics/AnalyticList.jsx';
import BudgetList from './pages/Budget/BudgetList.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Admin User Provisioning */}
      <Route
        path="/users/new"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <CreateUser />
          </ProtectedRoute>
        }
      />

      {/* Main Dashboards */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/portal"
        element={
          <ProtectedRoute roles={['ADMIN', 'ACCOUNTANT', 'CONTACT_USER']}>
            <ContactPortal />
          </ProtectedRoute>
        }
      />

      {/* Master Data */}
      <Route
        path="/contacts"
        element={
          <ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}>
            <ContactList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contacts/new"
        element={
          <ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}>
            <ContactForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contacts/:id"
        element={
          <ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}>
            <ContactForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/products"
        element={
          <ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}>
            <ProductList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products/new"
        element={
          <ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}>
            <ProductForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products/:id"
        element={
          <ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}>
            <ProductForm />
          </ProtectedRoute>
        }
      />

      <Route
        path="/chart-of-accounts"
        element={
          <ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}>
            <ChartOfAccounts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/journals"
        element={
          <ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}>
            <Journals />
          </ProtectedRoute>
        }
      />
      <Route
        path="/journal-entries"
        element={
          <ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}>
            <JournalEntries />
          </ProtectedRoute>
        }
      />

      <Route
        path="/analytics"
        element={
          <ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}>
            <AnalyticList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/budgets"
        element={
          <ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}>
            <BudgetList />
          </ProtectedRoute>
        }
      />

      {/* Transaction Flow */}
      <Route
        path="/sales"
        element={
          <ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}>
            <SalesOrderList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/new"
        element={
          <ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}>
            <SalesOrderForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales/invoices"
        element={
          <ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}>
            <SaleInvoiceList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/purchases"
        element={
          <ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}>
            <PurchaseOrderList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/purchases/new"
        element={
          <ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}>
            <PurchaseOrderForm />
          </ProtectedRoute>
        }
      />
      <Route
        path="/purchases/bills"
        element={
          <ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}>
            <PurchaseBillList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/payments"
        element={
          <ProtectedRoute roles={['ADMIN', 'ACCOUNTANT', 'CONTACT_USER']}>
            <PaymentList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments/new"
        element={
          <ProtectedRoute roles={['ADMIN', 'ACCOUNTANT', 'CONTACT_USER']}>
            <PaymentForm />
          </ProtectedRoute>
        }
      />

      {/* Reports */}
      <Route
        path="/reports/balance-sheet"
        element={
          <ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}>
            <BalanceSheet />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/profit-loss"
        element={
          <ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}>
            <ProfitLoss />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/budget"
        element={
          <ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}>
            <BudgetReport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/ledger"
        element={
          <ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}>
            <LedgerReport />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/journal"
        element={
          <ProtectedRoute roles={['ADMIN', 'ACCOUNTANT']}>
            <JournalReport />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

