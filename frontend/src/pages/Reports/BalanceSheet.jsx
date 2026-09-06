import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportsApi } from '../../api/endpoints.js';
import Navbar from '../../components/Navbar.jsx';
import PrintLetterhead from '../../components/PrintLetterhead.jsx';
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Print Letterhead */}
        <PrintLetterhead
          title="Balance Sheet"
          subtitle={`As of ${new Date(asOf).toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' })}`}
        />
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
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Balance Sheet</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Real-time snapshot of Assets = Liabilities + Equity</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded bg-primary hover:bg-primary-hover dark:bg-primary-dark dark:hover:bg-primary text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>

            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-3 py-1.5">
              <Calendar className="w-4 h-4 text-primary dark:text-primary-dark" />
              <span className="text-xs text-gray-700 dark:text-gray-300">As of Date:</span>
              <input
                type="date"
                value={asOf}
                onChange={(e) => setAsOf(e.target.value)}
                className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Balance Check Card */}
        <div className={`border rounded-md p-4 transition ${
          isBalanced 
            ? 'bg-emerald-50/70 border-emerald-300 dark:bg-emerald-950/20 dark:border-emerald-800' 
            : 'bg-rose-50/70 border-rose-300 dark:bg-rose-950/30 dark:border-rose-800'
        }`}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {isBalanced ? (
                <div className="w-8 h-8 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
                  <AlertOctagon className="w-5 h-5" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                    Balance Check:
                  </h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    isBalanced
                      ? 'bg-emerald-700 text-white'
                      : 'bg-rose-700 text-white'
                  }`}>
                    {isBalanced ? 'Balanced' : 'Not Balanced'}
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  {isBalanced 
                    ? 'Fundamental Accounting Equation is satisfied: Assets = Liabilities + Equity' 
                    : `Balance Sheet is not balanced! Difference: ₹${Math.abs(difference).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
              <div className="bg-white dark:bg-gray-900 px-3 py-1 rounded border border-gray-200 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Assets: </span>
                <span className="font-bold text-gray-900 dark:text-white">₹{totalAssets.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="text-gray-400 font-bold">=</div>
              <div className="bg-white dark:bg-gray-900 px-3 py-1 rounded border border-gray-200 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Liabilities + Equity: </span>
                <span className="font-bold text-gray-900 dark:text-white">₹{totalLiabilitiesAndEquity.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="bg-white dark:bg-gray-900 px-3 py-1 rounded border border-gray-200 dark:border-gray-800">
                <span className="text-gray-500 dark:text-gray-400">Difference: </span>
                <span className={`font-bold ${isBalanced ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                  ₹{difference.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Balance Metric Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Assets</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1 font-mono">
              ₹{totalAssets.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Cash, Bank, Debtors</p>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Liabilities</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1 font-mono">
              ₹{totalLiabilities.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Creditors & Payables</p>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Equity</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1 font-mono">
              ₹{totalEquity.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Capital (₹{totalCapital.toFixed(2)}) + Net Income (₹{netIncome.toFixed(2)})</p>
          </div>
        </div>

        {/* Detailed Breakdown Grid (Two Columns) */}
        {loading ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">Computing Balance Sheet...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Assets Column */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-5 space-y-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2 flex items-center justify-between">
                <span>Assets</span>
                <span className="font-mono">₹{totalAssets.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </h2>

              <div className="space-y-2">
                {data?.assets?.length === 0 ? (
                  <p className="text-xs text-gray-400 p-2">No asset transactions posted.</p>
                ) : (
                  data?.assets?.map((acc) => (
                    <div key={acc.id} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded text-xs border border-gray-100 dark:border-gray-800">
                      <span className="font-medium text-gray-800 dark:text-gray-200">{acc.name}</span>
                      <span className="font-mono font-bold text-gray-900 dark:text-white">
                        ₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Liabilities & Equity Column */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-5 space-y-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2 flex items-center justify-between">
                <span>Liabilities & Equity</span>
                <span className="font-mono">₹{totalLiabilitiesAndEquity.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </h2>

              <div className="space-y-4">
                {/* Liabilities Section */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex justify-between">
                    <span>Liabilities</span>
                    <span className="font-mono font-bold text-rose-700 dark:text-rose-400">₹{totalLiabilities.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </p>
                  <div className="space-y-2">
                    {data?.liabilities?.length === 0 ? (
                      <p className="text-xs text-gray-400 p-2">No liability transactions posted.</p>
                    ) : (
                      data?.liabilities?.map((acc) => (
                        <div key={acc.id} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded text-xs border border-gray-100 dark:border-gray-800">
                          <span className="font-medium text-gray-800 dark:text-gray-200">{acc.name}</span>
                          <span className="font-mono font-bold text-gray-900 dark:text-white">
                            ₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Equity Section */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex justify-between">
                    <span>Equity & Capital</span>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">₹{totalEquity.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </p>
                  <div className="space-y-2">
                    {data?.capital?.map((acc) => (
                      <div key={acc.id} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded text-xs border border-gray-100 dark:border-gray-800">
                        <span className="font-medium text-gray-800 dark:text-gray-200">{acc.name}</span>
                        <span className="font-mono font-bold text-gray-900 dark:text-white">
                          ₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}

                    {/* Retained Earnings / Current Period Net Income */}
                    <div className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded text-xs">
                      <div>
                        <span className="font-semibold text-gray-900 dark:text-white">Current Period Net Income (Retained Earnings)</span>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">Total Income minus Total Expenses as of date</p>
                      </div>
                      <span className={`font-mono font-bold ${netIncome >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
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

