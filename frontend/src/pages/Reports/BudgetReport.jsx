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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
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
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Budget Report</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Provides an overview of planned budget vs real-time achieved amounts</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-1">
              <button
                onClick={() => setViewMode('pie')}
                className={`p-1.5 rounded text-xs font-semibold ${
                  viewMode === 'pie' ? 'bg-primary dark:bg-primary-dark text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="Pie Chart View"
              >
                <PieIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded text-xs font-semibold ${
                  viewMode === 'list' ? 'bg-primary dark:bg-primary-dark text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="List View"
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded text-xs font-semibold ${
                  viewMode === 'kanban' ? 'bg-primary dark:bg-primary-dark text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="Kanban View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => navigate('/budgets')}
              className="px-3 py-1.5 rounded bg-primary hover:bg-primary-hover dark:bg-primary-dark dark:hover:bg-primary text-white text-xs font-semibold"
            >
              Manage Budgets
            </button>
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Committed Budget</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1 font-mono">
              ₹{totalCommitted.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Sum of all planned budget allocations</p>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Achieved Amount</p>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1 font-mono">
              ₹{totalAchieved.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Real-time invoice & bill aggregations</p>
          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Overall Achieved %</p>
            <p className="text-2xl font-bold text-primary dark:text-primary-dark mt-1 font-mono">{overallPercent}%</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Ratio of achieved vs committed</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">Generating Budget Report...</div>
        ) : viewMode === 'pie' ? (
          /* Pie Chart View */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-5 space-y-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-primary dark:text-primary-dark" />
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
                      contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '6px', color: '#fff' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Side Table */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-5 space-y-4">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Budget Summary</h3>
              <div className="space-y-3">
                {rows.map((r) => (
                  <div key={r.id} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-100 dark:border-gray-800 space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-xs text-gray-900 dark:text-white">
                      <span>{r.name}</span>
                      <span className="text-primary dark:text-primary-dark">{r.achievedPercent}%</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-500 dark:text-gray-400">
                      <span>Analytic: {r.analytic}</span>
                      <span>Target: ₹{r.committed.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary dark:bg-primary-dark rounded-full"
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
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300">
                <thead className="bg-gray-50 dark:bg-gray-800/60 text-[11px] uppercase text-gray-600 dark:text-gray-400 font-semibold tracking-wider border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-4 py-3">Budget Name</th>
                    <th className="px-4 py-3">Analytic Account</th>
                    <th className="px-4 py-3">Period</th>
                    <th className="px-4 py-3 text-right">Committed Amount</th>
                    <th className="px-4 py-3 text-right">Achieved Amount</th>
                    <th className="px-4 py-3 text-right">Achieved %</th>
                    <th className="px-4 py-3 text-right">Remaining</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {rows.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                      <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">{r.name}</td>
                      <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">{r.analytic} ({r.analyticType})</td>
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                        {new Date(r.periodStart).toLocaleDateString()} - {new Date(r.periodEnd).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">
                        ₹{r.committed.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-700 dark:text-emerald-400">
                        ₹{r.achieved.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-primary dark:text-primary-dark">
                        {r.achievedPercent}%
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-amber-700 dark:text-amber-400">
                        ₹{r.remaining.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {rows.map((r) => (
              <div key={r.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">{r.name}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
                    {r.status}
                  </span>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400">Analytic: {r.analytic}</p>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span>Committed:</span>
                    <span className="font-bold">₹{r.committed.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold">
                    <span>Achieved:</span>
                    <span>₹{r.achieved.toLocaleString('en-IN')} ({r.achievedPercent}%)</span>
                  </div>
                  <div className="flex justify-between text-amber-700 dark:text-amber-400">
                    <span>Remaining:</span>
                    <span>₹{r.remaining.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary dark:bg-primary-dark rounded-full"
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
