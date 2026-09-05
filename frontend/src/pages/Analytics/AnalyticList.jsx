import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsApi } from '../../api/endpoints.js';
import Navbar from '../../components/Navbar.jsx';
import { PieChart, Plus, ArrowLeft, AlertCircle } from 'lucide-react';

export default function AnalyticList() {
  const [analytics, setAnalytics] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('EXPENSE');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await analyticsApi.list();
      setAnalytics(res.data || []);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await analyticsApi.create({ name, type });
      setName('');
      setShowModal(false);
      fetchAnalytics();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create analytic account');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-4">
        
        {/* Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-md px-4 py-2 text-center dark:bg-amber-900/20 dark:border-amber-800/40">
          <h2 className="text-xs font-bold text-amber-900 dark:text-amber-300">Analyticals Form & Master View</h2>
          <p className="text-xs text-amber-800/80 dark:text-amber-400/80">Analytic Accounts (Income / Expense) linked to budget tracking line items.</p>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Analytic Accounts Master</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Financial markers to group expenses or income by project or department</p>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover dark:bg-primary-dark text-white text-xs font-semibold px-3 py-2 rounded transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Analytic Account</span>
          </button>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-xs text-gray-500 dark:text-gray-400">Loading analytic accounts...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300">
                <thead className="bg-gray-50 dark:bg-gray-800/60 uppercase text-[11px] text-gray-600 dark:text-gray-400 font-semibold border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Analytic Account Name</th>
                    <th className="px-4 py-3">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {analytics.map((an) => (
                    <tr key={an.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                      <td className="px-4 py-3 text-xs font-mono text-gray-500 dark:text-gray-400">#{an.id}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <PieChart className="w-4 h-4 text-primary dark:text-primary-dark" />
                        <span>{an.name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                            an.type === 'INCOME'
                              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                          }`}
                        >
                          {an.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-6 max-w-md w-full space-y-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Create Analytic Account</h2>

              {error && (
                <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-md p-3 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Analytic Account Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Furniture Project, Office Setup"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Type *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="INCOME">Income</option>
                    <option value="EXPENSE">Expense</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                  <button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary-hover dark:bg-primary-dark text-white font-semibold text-xs py-2 rounded transition"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
