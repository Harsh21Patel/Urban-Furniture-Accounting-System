import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportsApi } from '../../api/endpoints.js';
import Navbar from '../../components/Navbar.jsx';
import { TrendingUp, ArrowLeft, Calendar, Printer } from 'lucide-react';

export default function ProfitLoss() {
  const [data, setData] = useState(null);
  const [fromDate, setFromDate] = useState('2026-01-01');
  const [toDate, setToDate] = useState('2026-12-31');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReport();
  }, [fromDate, toDate]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await reportsApi.profitLoss(fromDate, toDate);
      setData(res.data);
    } catch (err) {
      console.error('Error loading Profit & Loss:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalIncome = data?.totals?.totalIncome || 0;
  const totalExpenses = data?.totals?.totalExpenses || 0;
  const netProfit = data?.netProfit || 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16 transition-colors duration-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* Yellow Header Banner matching Image 13 Wireframe */}
        <div className="bg-amber-100 border border-amber-300 rounded-xl px-6 py-2.5 text-center shadow-sm dark:bg-amber-500/10 dark:border-amber-500/30">
          <h2 className="text-base font-extrabold text-amber-900 dark:text-amber-300">Profit and Loss Report</h2>
          <p className="text-xs text-amber-800/80 dark:text-amber-400/80">Field Computation: Total Income minus Total Expenses $\rightarrow$ Net Income. Click Print for PDF download.</p>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm dark:shadow-xl">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Profit & Loss Statement (P&L)</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total Income minus Purchases / Expenses to compute Net Profit</p>
            </div>
          </div>

          {/* Date Filter & Print */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>

            <div className="flex flex-wrap items-center gap-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>From:</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                <span>To:</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl p-6 shadow-sm dark:shadow-xl">
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Total Sales Income</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-2 font-mono">
              ₹{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Total of account type Income</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-500/30 rounded-2xl p-6 shadow-sm dark:shadow-xl">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Total Expenses</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-2 font-mono">
              ₹{totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Purchases & operating expenses</p>
          </div>

          <div className={`bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-sm dark:shadow-xl ${netProfit >= 0 ? 'border-teal-300 dark:border-teal-500/40' : 'border-rose-300 dark:border-rose-500/40'}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider ${netProfit >= 0 ? 'text-teal-700 dark:text-teal-400' : 'text-rose-700 dark:text-rose-400'}`}>
              Net Income
            </p>
            <p className={`text-3xl font-black mt-2 font-mono ${netProfit >= 0 ? 'text-teal-700 dark:text-teal-400' : 'text-rose-700 dark:text-rose-400'}`}>
              ₹{netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Difference of Income - Expenses</p>
          </div>
        </div>

        {/* Detailed Income vs Expense breakdown (Matching Image 13 Wireframe) */}
        {loading ? (
          <div className="text-center py-16 text-slate-500 dark:text-slate-400">Computing P&L Report...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Income Accounts */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-4">
              <h2 className="text-lg font-bold text-emerald-700 dark:text-emerald-400 border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
                <span>Income</span>
                <span className="font-mono">₹{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </h2>

              <div className="space-y-2">
                {data?.income?.map((acc) => (
                  <div key={acc.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-sm">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{acc.name}</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expense Accounts */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-4">
              <h2 className="text-lg font-bold text-amber-700 dark:text-amber-400 border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
                <span>Expenses</span>
                <span className="font-mono">₹{totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </h2>

              <div className="space-y-2">
                {data?.expenses?.map((acc) => (
                  <div key={acc.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-sm">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{acc.name}</span>
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                      ₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
