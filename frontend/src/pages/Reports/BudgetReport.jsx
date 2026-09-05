import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportsApi } from '../../api/endpoints.js';
import Navbar from '../../components/Navbar.jsx';
import { PieChart as PieIcon, LayoutList, LayoutGrid, ArrowLeft, Calendar, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function BudgetReport() {
  const [rows, setRows] = useState([]);
  const [viewMode, setViewMode] = useState('pie'); // 'pie', 'list', 'kanban'
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await reportsApi.budgetReport();
      setRows(res.data || []);
    } catch (err) {
      console.error('Error loading Budget Report:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalCommitted = rows.reduce((s, r) => s + r.committed, 0);
  const totalAchieved = rows.reduce((s, r) => s + r.achieved, 0);
  const overallPercent = totalCommitted > 0 ? ((totalAchieved / totalCommitted) * 100).toFixed(1) : '0.0';

  const chartData = rows.map((r) => ({
    name: `${r.name} (${r.analytic})`,
    value: r.achieved || r.committed,
    achieved: r.achieved,
    committed: r.committed,
  }));

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
              <h1 className="text-2xl font-extrabold text-white">Budget Report</h1>
              <p className="text-xs text-slate-400">Provides an overview of planned budget vs real-time achieved amounts</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle per Image 5 */}
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl p-1">
              <button
                onClick={() => setViewMode('pie')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'pie' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Pie Chart View"
              >
                <PieIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'list' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="List View"
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'kanban' ? 'bg-teal-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Kanban View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => navigate('/budgets')}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition"
            >
              Manage Budgets
            </button>
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl">
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Total Committed Budget</p>
            <p className="text-3xl font-black text-white mt-2">
              ₹{totalCommitted.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Sum of all planned budget allocations</p>
          </div>

          <div className="bg-slate-900 border border-teal-500/30 rounded-2xl p-6 shadow-xl">
            <p className="text-xs font-semibold text-teal-400 uppercase tracking-wider">Total Achieved Amount</p>
            <p className="text-3xl font-black text-teal-400 mt-2">
              ₹{totalAchieved.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Real-time invoice & bill aggregations</p>
          </div>

          <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-6 shadow-xl">
            <p className="text-xs font-semibold text-purple-400 uppercase tracking-wider">Overall Achieved %</p>
            <p className="text-3xl font-black text-purple-300 mt-2">{overallPercent}%</p>
            <p className="text-[11px] text-slate-400 mt-1">Ratio of achieved vs committed</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-400">Generating Budget Report...</div>
        ) : viewMode === 'pie' ? (
          /* Pie Chart View per Image 5 */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-teal-400" />
                <span>Budget Visual Breakdown (Achieved Allocation)</span>
              </h2>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => `₹${Number(val).toLocaleString('en-IN')}`}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Side Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Budget Summary</h3>
              <div className="space-y-3">
                {rows.map((r, idx) => (
                  <div key={r.id} className="p-3 bg-slate-800/60 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-xs text-white">
                      <span>{r.name}</span>
                      <span className="text-teal-400">{r.achievedPercent}%</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Analytic: {r.analytic}</span>
                      <span>Target: ₹{r.committed.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500 rounded-full"
                        style={{ width: `${Math.min(100, r.achievedPercent)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : viewMode === 'list' ? (
          /* List View Table */
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/80 text-xs uppercase text-slate-400 font-semibold tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Budget Name</th>
                    <th className="px-6 py-4">Analytic Account</th>
                    <th className="px-6 py-4">Period</th>
                    <th className="px-6 py-4 text-right">Committed Amount</th>
                    <th className="px-6 py-4 text-right">Achieved Amount</th>
                    <th className="px-6 py-4 text-right">Achieved %</th>
                    <th className="px-6 py-4 text-right">Remaining</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {rows.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-800/50 transition">
                      <td className="px-6 py-4 font-bold text-white">{r.name}</td>
                      <td className="px-6 py-4 font-semibold text-slate-300">{r.analytic} ({r.analyticType})</td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {new Date(r.periodStart).toLocaleDateString()} - {new Date(r.periodEnd).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-white">
                        ₹{r.committed.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right font-extrabold text-teal-400">
                        ₹{r.achieved.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-indigo-400">
                        {r.achievedPercent}%
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-amber-400">
                        ₹{r.remaining.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Kanban Cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {rows.map((r) => (
              <div key={r.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-base">{r.name}</h3>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-400">
                    {r.status}
                  </span>
                </div>

                <p className="text-xs text-slate-400">Analytic: {r.analytic}</p>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Committed:</span>
                    <span className="font-bold">₹{r.committed.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-teal-400 font-bold">
                    <span>Achieved:</span>
                    <span>₹{r.achieved.toLocaleString('en-IN')} ({r.achievedPercent}%)</span>
                  </div>
                  <div className="flex justify-between text-amber-400">
                    <span>Remaining:</span>
                    <span>₹{r.remaining.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full"
                    style={{ width: `${Math.min(100, r.achievedPercent)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
