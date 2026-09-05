import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportsApi } from '../../api/endpoints.js';
import Navbar from '../../components/Navbar.jsx';
import { TrendingUp, ArrowLeft, Calendar } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Profit & Loss Account (P&L)</h1>
              <p className="text-xs text-slate-400">Total Income minus Purchases / Expenses to compute Net Profit</p>
            </div>
          </div>

          {/* Date Filter */}
          <div className="flex flex-wrap items-center gap-3 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>From:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
              />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <span>To:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl">
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Total Sales Income</p>
            <p className="text-3xl font-black text-white mt-2">
              ₹{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Revenue from product sales</p>
          </div>

          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-xl">
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Total Expenses</p>
            <p className="text-3xl font-black text-white mt-2">
              ₹{totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Purchases & operating costs</p>
          </div>

          <div className={`bg-slate-900 border rounded-2xl p-6 shadow-xl ${netProfit >= 0 ? 'border-teal-500/40' : 'border-rose-500/40'}`}>
            <p className={`text-xs font-semibold uppercase tracking-wider ${netProfit >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
              Net Profit / Loss
            </p>
            <p className={`text-3xl font-black mt-2 ${netProfit >= 0 ? 'text-teal-400' : 'text-rose-400'}`}>
              ₹{netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Income minus Expenses</p>
          </div>
        </div>

        {/* Detailed Income vs Expense breakdown */}
        {loading ? (
          <div className="text-center py-16 text-slate-400">Computing P&L Report...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Income Accounts */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h2 className="text-lg font-bold text-emerald-400 border-b border-slate-800 pb-3 flex items-center justify-between">
                <span>INCOME ACCOUNTS</span>
                <span>₹{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </h2>

              <div className="space-y-2">
                {data?.income?.map((acc) => (
                  <div key={acc.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl text-sm">
                    <span className="font-semibold text-slate-200">{acc.name}</span>
                    <span className="font-mono font-bold text-emerald-400">
                      ₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expense Accounts */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h2 className="text-lg font-bold text-amber-400 border-b border-slate-800 pb-3 flex items-center justify-between">
                <span>EXPENSE ACCOUNTS</span>
                <span>₹{totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </h2>

              <div className="space-y-2">
                {data?.expenses?.map((acc) => (
                  <div key={acc.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl text-sm">
                    <span className="font-semibold text-slate-200">{acc.name}</span>
                    <span className="font-mono font-bold text-amber-400">
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
