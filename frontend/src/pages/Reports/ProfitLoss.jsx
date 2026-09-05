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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Header Banner */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md px-4 py-2 text-center">
          <h2 className="text-sm font-bold text-amber-900 dark:text-amber-300">Profit and Loss Report</h2>
          <p className="text-xs text-amber-700 dark:text-amber-400">Field Computation: Total Income minus Total Expenses $\rightarrow$ Net Income. Click Print for PDF download.</p>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Profit & Loss Statement (P&L)</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Income minus Purchases / Expenses to compute Net Profit</p>
            </div>
          </div>

          {/* Date Filter & Print */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded bg-primary hover:bg-primary-hover dark:bg-primary-dark dark:hover:bg-primary text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>

            <div className="flex flex-wrap items-center gap-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-3 py-1.5">
              <div className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300">
                <Calendar className="w-3.5 h-3.5 text-primary dark:text-primary-dark" />
                <span>From:</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-700 dark:text-gray-300">
                <span>To:</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Sales Income</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1 font-mono">
              ₹{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Total of account type Income</p>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Expenses</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1 font-mono">
              ₹{totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Purchases & operating expenses</p>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-4">
            <p className={`text-xs font-semibold uppercase tracking-wider ${netProfit >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
              Net Income
            </p>
            <p className={`text-2xl font-bold mt-1 font-mono ${netProfit >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
              ₹{netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Difference of Income - Expenses</p>
          </div>
        </div>

        {/* Detailed Income vs Expense breakdown */}
        {loading ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">Computing P&L Report...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Income Accounts */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-5 space-y-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2 flex items-center justify-between">
                <span>Income</span>
                <span className="font-mono">₹{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </h2>

              <div className="space-y-2">
                {data?.income?.map((acc) => (
                  <div key={acc.id} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded text-xs border border-gray-100 dark:border-gray-800">
                    <span className="font-medium text-gray-800 dark:text-gray-200">{acc.name}</span>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      ₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expense Accounts */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-5 space-y-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2 flex items-center justify-between">
                <span>Expenses</span>
                <span className="font-mono">₹{totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </h2>

              <div className="space-y-2">
                {data?.expenses?.map((acc) => (
                  <div key={acc.id} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded text-xs border border-gray-100 dark:border-gray-800">
                    <span className="font-medium text-gray-800 dark:text-gray-200">{acc.name}</span>
                    <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
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
