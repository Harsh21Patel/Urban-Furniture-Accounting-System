import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar.jsx';
import { salesApi, purchaseApi, budgetsApi } from '../../api/endpoints.js';
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
} from 'lucide-react';

export default function Dashboard() {
  const [salesSummary, setSalesSummary] = useState({ all: 0, confirmed: 0, draft: 0 });
  const [purchaseSummary, setPurchaseSummary] = useState({ all: 0, confirmed: 0, draft: 0 });
  const [budgetSummary, setBudgetSummary] = useState({ total: 0, achievedCount: 0, committedSum: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [salesRes, purRes, budRes] = await Promise.all([
          salesApi.listOrders(),
          purchaseApi.listOrders(),
          budgetsApi.list(),
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
      } catch (err) {
        console.error('Error fetching dashboard summary:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 border border-indigo-500/20 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Urban Furniture Dashboard</h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Overview of core sales orders, purchase bills, double-entry ledger entries, and analytical budget allocations.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/sales/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Sale</span>
            </Link>
            <Link
              to="/purchases/new"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold shadow-lg shadow-violet-600/30 transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Purchase</span>
            </Link>
          </div>
        </div>

        {/* Dashboard Sections (Matching Image 2) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Sales Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Sales</h2>
                  <p className="text-xs text-slate-400">Customer Orders & Invoices</p>
                </div>
              </div>
              <Link
                to="/sales/new"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Link to="/sales" className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl p-3 text-center transition">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">All</p>
                <p className="text-xl font-black text-white mt-1">{loading ? '...' : salesSummary.all}</p>
              </Link>
              <Link to="/sales" className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl p-3 text-center transition">
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Confirmed</p>
                <p className="text-xl font-black text-emerald-400 mt-1">{loading ? '...' : salesSummary.confirmed}</p>
              </Link>
              <Link to="/sales" className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl p-3 text-center transition">
                <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Draft</p>
                <p className="text-xl font-black text-amber-400 mt-1">{loading ? '...' : salesSummary.draft}</p>
              </Link>
            </div>

            <Link to="/sales" className="flex items-center justify-between text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition">
              <span>View All Sales Orders</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Purchase Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Purchase</h2>
                  <p className="text-xs text-slate-400">Vendor POs & Bills</p>
                </div>
              </div>
              <Link
                to="/purchases/new"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition shadow-md shadow-violet-600/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New</span>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Link to="/purchases" className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl p-3 text-center transition">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">All</p>
                <p className="text-xl font-black text-white mt-1">{loading ? '...' : purchaseSummary.all}</p>
              </Link>
              <Link to="/purchases" className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl p-3 text-center transition">
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Confirmed</p>
                <p className="text-xl font-black text-emerald-400 mt-1">{loading ? '...' : purchaseSummary.confirmed}</p>
              </Link>
              <Link to="/purchases" className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl p-3 text-center transition">
                <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Draft</p>
                <p className="text-xl font-black text-amber-400 mt-1">{loading ? '...' : purchaseSummary.draft}</p>
              </Link>
            </div>

            <Link to="/purchases" className="flex items-center justify-between text-xs font-semibold text-violet-400 hover:text-violet-300 transition">
              <span>View All Purchase Orders</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Budget Reports Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                  <PieChart className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Budget Reports</h2>
                  <p className="text-xs text-slate-400">Analytical Allocations</p>
                </div>
              </div>
              <Link
                to="/reports/budget"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition shadow-md shadow-teal-600/20"
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Report</span>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Link to="/reports/budget" className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl p-3 text-center transition">
                <p className="text-xs font-semibold text-teal-400 uppercase tracking-wider">Achieved</p>
                <p className="text-xl font-black text-teal-400 mt-1">{loading ? '...' : budgetSummary.achievedCount}</p>
              </Link>
              <Link to="/budgets" className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl p-3 text-center transition">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Budget</p>
                <p className="text-xl font-black text-white mt-1">{loading ? '...' : budgetSummary.total}</p>
              </Link>
              <Link to="/budgets" className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl p-3 text-center transition">
                <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Committed</p>
                <p className="text-sm font-bold text-indigo-300 mt-1">₹{loading ? '...' : (budgetSummary.committedSum / 1000).toFixed(0)}k</p>
              </Link>
            </div>

            <Link to="/reports/budget" className="flex items-center justify-between text-xs font-semibold text-teal-400 hover:text-teal-300 transition">
              <span>View Full Budget Report</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

        {/* Master Data Quick Access Grid */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <span>Master Data & Accounting Modules</span>
          </h2>

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
                  className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-4 flex flex-col justify-between hover:scale-[1.02] transition shadow-lg group"
                >
                  <div className="w-9 h-9 rounded-xl bg-slate-800 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition">
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="mt-3">
                    <p className="font-bold text-sm text-slate-100 group-hover:text-indigo-400 transition">{item.label}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
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
