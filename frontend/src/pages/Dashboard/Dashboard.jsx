import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar.jsx';
import { salesApi, purchaseApi, budgetsApi, reportsApi } from '../../api/endpoints.js';
import {
  ShoppingBag,
  ShoppingCart,
  PieChart,
  Plus,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Building2,
  BookOpen,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

export default function Dashboard() {
  const [salesSummary, setSalesSummary] = useState({ all: 0, confirmed: 0, draft: 0 });
  const [purchaseSummary, setPurchaseSummary] = useState({ all: 0, confirmed: 0, draft: 0 });
  const [budgetSummary, setBudgetSummary] = useState({ total: 0, achievedCount: 0, committedSum: 0 });
  const [financials, setFinancials] = useState({
    revenue: 0,
    expenses: 0,
    profit: 0,
    outstandingInvoicesCount: 0,
    outstandingInvoicesAmount: 0,
    outstandingBillsCount: 0,
    outstandingBillsAmount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [salesRes, purRes, budRes, plRes, invRes, billRes] = await Promise.all([
          salesApi.listOrders(),
          purchaseApi.listOrders(),
          budgetsApi.list(),
          reportsApi.profitLoss(),
          salesApi.listInvoices(),
          purchaseApi.listBills(),
        ]);

        const sOrders = salesRes.data || [];
        setSalesSummary({
          all: sOrders.length,
          confirmed: sOrders.filter((o) => o.status === 'CONFIRMED' || o.status === 'INVOICED').length,
          draft: sOrders.filter((o) => o.status === 'DRAFT').length,
        });

        const pOrders = purRes.data || [];
        setPurchaseSummary({
          all: pOrders.length,
          confirmed: pOrders.filter((o) => o.status === 'CONFIRMED' || o.status === 'INVOICED').length,
          draft: pOrders.filter((o) => o.status === 'DRAFT').length,
        });

        const budgets = budRes.data || [];
        const achievedCount = budgets.filter((b) => Number(b.achievedAmount) > 0).length;
        const committedSum = budgets.reduce((s, b) => s + Number(b.committedAmount), 0);
        setBudgetSummary({
          total: budgets.length,
          achievedCount,
          committedSum,
        });

        const invoices = invRes.data || [];
        const unpaidInvoices = invoices.filter((i) => i.status !== 'PAID');
        const outstandingInvoicesAmount = unpaidInvoices.reduce((s, inv) => {
          const paid = (inv.payments || []).reduce((ps, p) => ps + Number(p.amount), 0);
          return s + Math.max(0, Number(inv.totalAmount) - paid);
        }, 0);

        const bills = billRes.data || [];
        const unpaidBills = bills.filter((b) => b.status !== 'PAID');
        const outstandingBillsAmount = unpaidBills.reduce((s, bill) => {
          const paid = (bill.payments || []).reduce((ps, p) => ps + Number(p.amount), 0);
          return s + Math.max(0, Number(bill.totalAmount) - paid);
        }, 0);

        setFinancials({
          revenue: plRes.data?.totals?.totalIncome || 0,
          expenses: plRes.data?.totals?.totalExpenses || 0,
          profit: plRes.data?.netProfit || 0,
          outstandingInvoicesCount: unpaidInvoices.length,
          outstandingInvoicesAmount,
          outstandingBillsCount: unpaidBills.length,
          outstandingBillsAmount,
        });
      } catch (err) {
        console.error('Error fetching dashboard summary:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Header Banner */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Urban Furniture Accounting</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-2xl">
              Double-entry accounting, sales invoices, vendor bills, and analytical budget control system.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/sales/new"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary hover:bg-primary-hover dark:bg-primary-dark dark:hover:bg-primary text-white text-xs font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Sale Order</span>
            </Link>
            <Link
              to="/purchases/new"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Purchase Order</span>
            </Link>
          </div>
        </div>

        {/* Dashboard Live Financial Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3.5">
            <p className="text-[10px] font-semibold uppercase text-gray-500 dark:text-gray-400">Total Revenue</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5 font-mono">
              ₹{loading ? '...' : financials.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Posted Sales Income</p>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3.5">
            <p className="text-[10px] font-semibold uppercase text-gray-500 dark:text-gray-400">Total Expenses</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5 font-mono">
              ₹{loading ? '...' : financials.expenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Posted Purchases & Ops</p>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-3.5">
            <p className="text-[10px] font-semibold uppercase text-gray-500 dark:text-gray-400">
              Net Profit
            </p>
            <p className={`text-lg font-bold mt-0.5 font-mono ${financials.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              ₹{loading ? '...' : financials.profit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Revenue - Expenses</p>
          </div>

          <Link to="/sales/invoices" className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-md p-3.5">
            <p className="text-[10px] font-semibold uppercase text-gray-500 dark:text-gray-400 flex items-center justify-between">
              <span>Unpaid Invoices</span>
              <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-1 py-0.2 rounded text-[10px]">
                {loading ? '...' : financials.outstandingInvoicesCount}
              </span>
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5 font-mono">
              ₹{loading ? '...' : financials.outstandingInvoicesAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-primary dark:text-primary-dark font-medium mt-0.5">View Customer Dues →</p>
          </Link>

          <Link to="/purchases/bills" className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-md p-3.5">
            <p className="text-[10px] font-semibold uppercase text-gray-500 dark:text-gray-400 flex items-center justify-between">
              <span>Unpaid Bills</span>
              <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-1 py-0.2 rounded text-[10px]">
                {loading ? '...' : financials.outstandingBillsCount}
              </span>
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5 font-mono">
              ₹{loading ? '...' : financials.outstandingBillsAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-primary dark:text-primary-dark font-medium mt-0.5">View Vendor Dues →</p>
          </Link>
        </div>

        {/* Dashboard Sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Sales Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-5 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-gray-100 dark:bg-gray-800 text-primary dark:text-primary-dark flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">Sales</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Sales Order & Invoices</p>
                </div>
              </div>
              <Link
                to="/sales/new"
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-primary hover:bg-primary-hover dark:bg-primary-dark dark:hover:bg-primary text-white text-xs font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Link to="/sales" className="bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded p-2.5 text-center">
                <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase">All</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{loading ? '...' : salesSummary.all}</p>
              </Link>
              <Link to="/sales" className="bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded p-2.5 text-center">
                <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">Confirmed</p>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{loading ? '...' : salesSummary.confirmed}</p>
              </Link>
              <Link to="/sales" className="bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded p-2.5 text-center">
                <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase">Draft</p>
                <p className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5">{loading ? '...' : salesSummary.draft}</p>
              </Link>
            </div>

            <Link to="/sales" className="flex items-center justify-between text-xs font-medium text-primary dark:text-primary-dark hover:underline">
              <span>View All Sales Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Purchase Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-5 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-gray-100 dark:bg-gray-800 text-primary dark:text-primary-dark flex items-center justify-center">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">Purchase</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Vendor Orders & Bills</p>
                </div>
              </div>
              <Link
                to="/purchases/new"
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-primary hover:bg-primary-hover dark:bg-primary-dark dark:hover:bg-primary text-white text-xs font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Link to="/purchases" className="bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded p-2.5 text-center">
                <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase">All</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{loading ? '...' : purchaseSummary.all}</p>
              </Link>
              <Link to="/purchases" className="bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded p-2.5 text-center">
                <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">Confirmed</p>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{loading ? '...' : purchaseSummary.confirmed}</p>
              </Link>
              <Link to="/purchases" className="bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded p-2.5 text-center">
                <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase">Draft</p>
                <p className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5">{loading ? '...' : purchaseSummary.draft}</p>
              </Link>
            </div>

            <Link to="/purchases" className="flex items-center justify-between text-xs font-medium text-primary dark:text-primary-dark hover:underline">
              <span>View All Purchase Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Budget Reports Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-5 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded bg-gray-100 dark:bg-gray-800 text-primary dark:text-primary-dark flex items-center justify-center">
                  <PieChart className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">Budget Reports</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Analytical Allocations</p>
                </div>
              </div>
              <Link
                to="/reports/budget"
                className="flex items-center gap-1 px-2.5 py-1 rounded border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-medium"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Report</span>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Link to="/reports/budget" className="bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded p-2.5 text-center">
                <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">Achieved</p>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{loading ? '...' : budgetSummary.achievedCount}</p>
              </Link>
              <Link to="/budgets" className="bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded p-2.5 text-center">
                <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase">Budget</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{loading ? '...' : budgetSummary.total}</p>
              </Link>
              <Link to="/budgets" className="bg-gray-50 hover:bg-gray-100 dark:bg-gray-800/50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700/60 rounded p-2.5 text-center">
                <p className="text-[10px] font-semibold text-primary dark:text-primary-dark uppercase">Committed</p>
                <p className="text-sm font-bold text-primary dark:text-primary-dark mt-0.5">₹{loading ? '...' : (budgetSummary.committedSum / 1000).toFixed(0)}k</p>
              </Link>
            </div>

            <Link to="/reports/budget" className="flex items-center justify-between text-xs font-medium text-primary dark:text-primary-dark hover:underline">
              <span>View Full Budget Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

        {/* Master Data Header Banner */}
        <div className="space-y-3">
          <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-center text-xs font-bold text-gray-700 dark:text-gray-300 py-1.5">
            Master Data Modules
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { label: 'Contacts', to: '/contacts', icon: Building2, desc: 'Customers & Vendors' },
              { label: 'Products', to: '/products', icon: ShoppingBag, desc: 'Goods & Services' },
              { label: 'Chart of Accounts', to: '/chart-of-accounts', icon: BookOpen, desc: 'Asset, Expense, Income' },
              { label: 'Journals', to: '/journals', icon: BookOpen, desc: 'Sales, Purchase, Cash' },
              { label: 'Journal Entries', to: '/journal-entries', icon: CreditCard, desc: 'Double-entry ledger' },
              { label: 'Balance Sheet', to: '/reports/balance-sheet', icon: PieChart, desc: 'Assets & Liabilities' },
              { label: 'Profit & Loss', to: '/reports/profit-loss', icon: TrendingUp, desc: 'Net Profit Report' },
              { label: 'Analytical Budget', to: '/budgets', icon: PieChart, desc: 'Project budgets' },
            ].map((item) => {
              const IconComp = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60 rounded-md p-3.5 flex flex-col justify-between"
                >
                  <div className="w-7 h-7 rounded bg-gray-100 dark:bg-gray-800 text-primary dark:text-primary-dark flex items-center justify-center">
                    <IconComp className="w-3.5 h-3.5" />
                  </div>
                  <div className="mt-2.5">
                    <p className="font-semibold text-xs text-gray-900 dark:text-gray-100">{item.label}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
}
