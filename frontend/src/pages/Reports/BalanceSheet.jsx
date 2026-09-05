import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportsApi } from '../../api/endpoints.js';
import Navbar from '../../components/Navbar.jsx';
import { ArrowLeft, Calendar, Printer, CheckCircle2, AlertOctagon } from 'lucide-react';

export default function BalanceSheet() {
  const [data, setData] = useState(null);
  const [asOf, setAsOf] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReport();
  }, [asOf]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await reportsApi.balanceSheet(asOf);
      setData(res.data);
    } catch (err) {
      console.error('Error loading Balance Sheet:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalAssets = data?.totals?.totalAssets || 0;
  const totalLiabilities = data?.totals?.totalLiabilities || 0;
  const totalCapital = data?.totals?.totalCapital || 0;
  const netIncome = data?.totals?.netIncome ?? (data?.netIncome || 0);
  const totalEquity = data?.totals?.totalEquity ?? (totalCapital + netIncome);
  const totalLiabilitiesAndEquity = data?.totals?.totalLiabilitiesAndCapital ?? (totalLiabilities + totalEquity);
  const difference = data?.totals?.difference !== undefined ? data.totals.difference : (totalAssets - totalLiabilitiesAndEquity);
  const isBalanced = data?.totals?.isBalanced !== undefined ? data.totals.isBalanced : (Math.abs(difference) < 0.01);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16 transition-colors duration-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* Yellow Header Banner matching Wireframe */}
        <div className="bg-amber-100 border border-amber-300 rounded-xl px-6 py-2.5 text-center shadow-sm dark:bg-amber-500/10 dark:border-amber-500/30">
          <h2 className="text-base font-extrabold text-amber-900 dark:text-amber-300">Balance Sheet</h2>
          <p className="text-xs text-amber-800/80 dark:text-amber-400/80">Assets (Bank, Cash, Debtors) vs Liabilities & Equity (Creditors, Capital, Retained Earnings). Click Print for PDF download.</p>
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
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Balance Sheet</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Real-time snapshot of Assets = Liabilities + Equity</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>

            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5">
              <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs text-slate-700 dark:text-slate-300">As of Date:</span>
              <input
                type="date"
                value={asOf}
                onChange={(e) => setAsOf(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Balance Check Card */}
        <div className={`border-2 rounded-2xl p-5 shadow-sm dark:shadow-xl transition ${
          isBalanced 
            ? 'bg-emerald-50/70 border-emerald-500/40 dark:bg-emerald-950/20 dark:border-emerald-500/30' 
            : 'bg-rose-50/70 border-rose-500/50 dark:bg-rose-950/30 dark:border-rose-500/40'
        }`}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {isBalanced ? (
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
                  <AlertOctagon className="w-6 h-6" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    Balance Check:
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                    isBalanced
                      ? 'bg-emerald-600 text-white'
                      : 'bg-rose-600 text-white'
                  }`}>
                    {isBalanced ? 'Balanced' : 'Not Balanced'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                  {isBalanced 
                    ? 'Fundamental Accounting Equation is satisfied: Assets = Liabilities + Equity' 
                    : `Balance Sheet is not balanced! Difference: ₹${Math.abs(difference).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
              <div className="bg-white/80 dark:bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Assets: </span>
                <span className="font-bold text-blue-600 dark:text-blue-400">₹{totalAssets.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="text-slate-400 font-bold">=</div>
              <div className="bg-white/80 dark:bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Liabilities + Equity: </span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400">₹{totalLiabilitiesAndEquity.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Difference: </span>
                <span className={`font-bold ${isBalanced ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  ₹{difference.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Balance Metric Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-500/30 rounded-2xl p-6 shadow-sm dark:shadow-xl">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Total Assets</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-2 font-mono">
              ₹{totalAssets.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Cash, Bank, Debtors</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-500/30 rounded-2xl p-6 shadow-sm dark:shadow-xl">
            <p className="text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Total Liabilities</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-2 font-mono">
              ₹{totalLiabilities.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Creditors & Payables</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-500/30 rounded-2xl p-6 shadow-sm dark:shadow-xl">
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Total Equity</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white mt-2 font-mono">
              ₹{totalEquity.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Capital (₹{totalCapital.toFixed(2)}) + Net Income (₹{netIncome.toFixed(2)})</p>
          </div>
        </div>

        {/* Detailed Breakdown Grid (Two Columns) */}
        {loading ? (
          <div className="text-center py-16 text-slate-500 dark:text-slate-400">Computing Balance Sheet...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Assets Column */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-4">
              <h2 className="text-lg font-bold text-blue-700 dark:text-blue-400 border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
                <span>Assets</span>
                <span className="font-mono">₹{totalAssets.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </h2>

              <div className="space-y-2">
                {data?.assets?.length === 0 ? (
                  <p className="text-xs text-slate-400 p-2">No asset transactions posted.</p>
                ) : (
                  data?.assets?.map((acc) => (
                    <div key={acc.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-sm">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{acc.name}</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        ₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Liabilities & Equity Column */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-4">
              <h2 className="text-lg font-bold text-indigo-700 dark:text-indigo-400 border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
                <span>Liabilities & Equity</span>
                <span className="font-mono">₹{totalLiabilitiesAndEquity.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </h2>

              <div className="space-y-4">
                {/* Liabilities Section */}
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex justify-between">
                    <span>Liabilities</span>
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400">₹{totalLiabilities.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </p>
                  <div className="space-y-2">
                    {data?.liabilities?.length === 0 ? (
                      <p className="text-xs text-slate-400 p-2">No liability transactions posted.</p>
                    ) : (
                      data?.liabilities?.map((acc) => (
                        <div key={acc.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-sm">
                          <span className="font-semibold text-slate-700 dark:text-slate-200">{acc.name}</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            ₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Equity Section */}
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex justify-between">
                    <span>Equity & Capital</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">₹{totalEquity.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </p>
                  <div className="space-y-2">
                    {data?.capital?.map((acc) => (
                      <div key={acc.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-sm">
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{acc.name}</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">
                          ₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}

                    {/* Retained Earnings / Current Period Net Income */}
                    <div className="flex items-center justify-between p-3 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/20 rounded-xl text-sm">
                      <div>
                        <span className="font-semibold text-indigo-900 dark:text-indigo-200">Current Period Net Income (Retained Earnings)</span>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Total Income minus Total Expenses as of date</p>
                      </div>
                      <span className={`font-mono font-bold ${netIncome >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        ₹{netIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}

