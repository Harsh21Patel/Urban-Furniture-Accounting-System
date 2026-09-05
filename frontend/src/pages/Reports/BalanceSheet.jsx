import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportsApi } from '../../api/endpoints.js';
import Navbar from '../../components/Navbar.jsx';
import { PieChart, ArrowLeft, Calendar, ShieldCheck, Scale } from 'lucide-react';

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
  const totalLiabilitiesAndCapital = totalLiabilities + totalCapital;

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
              <h1 className="text-2xl font-extrabold text-white">Balance Sheet</h1>
              <p className="text-xs text-slate-400">Real-time snapshot of Assets = Liabilities + Capital</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <span className="text-xs text-slate-300">As of Date:</span>
            <input
              type="date"
              value={asOf}
              onChange={(e) => setAsOf(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Summary Balance Metric Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-6 shadow-xl">
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Total Assets</p>
            <p className="text-3xl font-black text-white mt-2">
              ₹{totalAssets.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Cash, Bank, Debtors</p>
          </div>

          <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-6 shadow-xl">
            <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Total Liabilities</p>
            <p className="text-3xl font-black text-white mt-2">
              ₹{totalLiabilities.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Creditors & Payables</p>
          </div>

          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-xl">
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Total Capital</p>
            <p className="text-3xl font-black text-white mt-2">
              ₹{totalCapital.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Owner's Equity & Capital</p>
          </div>
        </div>

        {/* Detailed Breakdown Grid */}
        {loading ? (
          <div className="text-center py-16 text-slate-400">Computing Balance Sheet...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Assets Column */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h2 className="text-lg font-bold text-blue-400 border-b border-slate-800 pb-3 flex items-center justify-between">
                <span>ASSETS</span>
                <span>₹{totalAssets.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </h2>

              <div className="space-y-2">
                {data?.assets?.map((acc) => (
                  <div key={acc.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl text-sm">
                    <span className="font-semibold text-slate-200">{acc.name}</span>
                    <span className="font-mono font-bold text-white">
                      ₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Liabilities & Capital Column */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h2 className="text-lg font-bold text-rose-400 border-b border-slate-800 pb-3 flex items-center justify-between">
                <span>LIABILITIES & CAPITAL</span>
                <span>₹{totalLiabilitiesAndCapital.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Liabilities</p>
                  <div className="space-y-2">
                    {data?.liabilities?.map((acc) => (
                      <div key={acc.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl text-sm">
                        <span className="font-semibold text-slate-200">{acc.name}</span>
                        <span className="font-mono font-bold text-white">
                          ₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Capital / Equity</p>
                  <div className="space-y-2">
                    {data?.capital?.map((acc) => (
                      <div key={acc.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl text-sm">
                        <span className="font-semibold text-slate-200">{acc.name}</span>
                        <span className="font-mono font-bold text-white">
                          ₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
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
