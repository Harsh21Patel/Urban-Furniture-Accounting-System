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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16 transition-colors duration-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Yellow Header Banner matching Excalidraw Wireframe Image 1 Header */}
        <div className="bg-amber-100 dark:bg-gradient-to-r dark:from-indigo-900/60 dark:via-purple-900/40 dark:to-slate-900 border border-amber-300 dark:border-indigo-500/20 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md dark:shadow-2xl">
          <div className="space-y-1">
            <div className="inline-block px-3 py-1 bg-amber-200/80 dark:bg-indigo-600/30 rounded-lg text-xs font-bold text-amber-900 dark:text-indigo-300 uppercase tracking-wider mb-2">
              App Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Urban Furniture Accounting</h1>
            <p className="text-sm text-slate-700 dark:text-slate-300 max-w-2xl">
              Double-entry accounting, sales invoices, vendor bills, and analytical budget control system.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/sales/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-600/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Sale Order</span>
            </Link>
            <Link
              to="/purchases/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold shadow-md shadow-violet-600/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Purchase Order</span>
            </Link>
          </div>
        </div>

        {/* Dashboard Live Financial Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-4 shadow-sm dark:shadow-lg">
            <p className="text-[11px] font-bold uppercase text-emerald-600 dark:text-emerald-400">Total Revenue</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-1 font-mono">
              ₹{loading ? '...' : financials.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Posted Sales Income</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 shadow-sm dark:shadow-lg">
            <p className="text-[11px] font-bold uppercase text-amber-600 dark:text-amber-400">Total Expenses</p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-1 font-mono">
              ₹{loading ? '...' : financials.expenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Posted Purchases & Ops</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-500/20 rounded-2xl p-4 shadow-sm dark:shadow-lg">
            <p className={`text-[11px] font-bold uppercase ${financials.profit >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600 dark:text-rose-400'}`}>
              Net Profit
            </p>
            <p className={`text-xl font-black mt-1 font-mono ${financials.profit >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600 dark:text-rose-400'}`}>
              ₹{loading ? '...' : financials.profit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Revenue - Expenses</p>
          </div>

          <Link to="/sales/invoices" className="bg-white dark:bg-slate-900 border border-sky-200 dark:border-sky-500/20 hover:border-sky-500 rounded-2xl p-4 shadow-sm dark:shadow-lg transition group">
            <p className="text-[11px] font-bold uppercase text-sky-600 dark:text-sky-400 flex items-center justify-between">
              <span>Unpaid Invoices</span>
              <span className="bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 px-1.5 py-0.2 rounded text-[10px]">
                {loading ? '...' : financials.outstandingInvoicesCount}
              </span>
            </p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-1 font-mono">
              ₹{loading ? '...' : financials.outstandingInvoicesAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 group-hover:text-sky-500 transition">View Customer Dues →</p>
          </Link>

          <Link to="/purchases/bills" className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-500/20 hover:border-rose-500 rounded-2xl p-4 shadow-sm dark:shadow-lg transition group">
            <p className="text-[11px] font-bold uppercase text-rose-600 dark:text-rose-400 flex items-center justify-between">
              <span>Unpaid Bills</span>
              <span className="bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 px-1.5 py-0.2 rounded text-[10px]">
                {loading ? '...' : financials.outstandingBillsCount}
              </span>
            </p>
            <p className="text-xl font-black text-slate-900 dark:text-white mt-1 font-mono">
              ₹{loading ? '...' : financials.outstandingBillsAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 group-hover:text-rose-500 transition">View Vendor Dues →</p>
          </Link>
        </div>

        {/* Dashboard Sections (Matching Image 1 Wireframe) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">


          {/* Sales Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl flex flex-col justify-between space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Sales</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Sales Order & Invoices</p>
                </div>
              </div>
              <Link
                to="/sales/new"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Link to="/sales" className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 text-center transition">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">All</p>
                <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{loading ? '...' : salesSummary.all}</p>
              </Link>
              <Link to="/sales" className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 text-center transition">
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Confirmed</p>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{loading ? '...' : salesSummary.confirmed}</p>
              </Link>
              <Link to="/sales" className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 text-center transition">
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Draft</p>
                <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">{loading ? '...' : salesSummary.draft}</p>
              </Link>
            </div>

            <Link to="/sales" className="flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline transition">
              <span>View All Sales Orders</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Purchase Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl flex flex-col justify-between space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Purchase</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Vendor Orders & Bills</p>
                </div>
              </div>
              <Link
                to="/purchases/new"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Link to="/purchases" className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 text-center transition">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">All</p>
                <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{loading ? '...' : purchaseSummary.all}</p>
              </Link>
              <Link to="/purchases" className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 text-center transition">
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Confirmed</p>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{loading ? '...' : purchaseSummary.confirmed}</p>
              </Link>
              <Link to="/purchases" className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 text-center transition">
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Draft</p>
                <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">{loading ? '...' : purchaseSummary.draft}</p>
              </Link>
            </div>

            <Link to="/purchases" className="flex items-center justify-between text-xs font-semibold text-violet-600 dark:text-violet-400 hover:underline transition">
              <span>View All Purchase Orders</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Budget Reports Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl flex flex-col justify-between space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                  <PieChart className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Budget Reports</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Analytical Allocations</p>
                </div>
              </div>
              <Link
                to="/reports/budget"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition shadow-sm"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Report</span>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Link to="/reports/budget" className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 text-center transition">
                <p className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">Achieved</p>
                <p className="text-xl font-black text-teal-600 dark:text-teal-400 mt-1">{loading ? '...' : budgetSummary.achievedCount}</p>
              </Link>
              <Link to="/budgets" className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 text-center transition">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Budget</p>
                <p className="text-xl font-black text-slate-900 dark:text-white mt-1">{loading ? '...' : budgetSummary.total}</p>
              </Link>
              <Link to="/budgets" className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 text-center transition">
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Committed</p>
                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-300 mt-1">₹{loading ? '...' : (budgetSummary.committedSum / 1000).toFixed(0)}k</p>
              </Link>
            </div>

            <Link to="/reports/budget" className="flex items-center justify-between text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline transition">
              <span>View Full Budget Report</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

        {/* Master Data Header Banner matching Image 2 Header */}
        <div className="space-y-4">
          <div className="bg-amber-100 border border-amber-300 rounded-xl px-4 py-2 text-center text-sm font-bold text-amber-900 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300">
            Master Data Modules
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl p-4 flex flex-col justify-between hover:scale-[1.02] transition shadow-sm dark:shadow-lg group"
                >
                  <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition">
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="mt-3">
                    <p className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">{item.label}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
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
