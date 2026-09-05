import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { journalsApi, accountsApi } from '../../api/endpoints.js';
import Navbar from '../../components/Navbar.jsx';
import { BookOpen, Plus, ArrowLeft, AlertCircle } from 'lucide-react';

export default function Journals() {
  const [journals, setJournals] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('SALES');
  const [defaultAccountId, setDefaultAccountId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [jRes, aRes] = await Promise.all([journalsApi.list(), accountsApi.list()]);
      setJournals(jRes.data || []);
      setAccounts(aRes.data || []);
    } catch (err) {
      console.error('Error fetching journals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await journalsApi.create({ name, type, defaultAccountId: defaultAccountId || null });
      setName('');
      setDefaultAccountId('');
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create journal');
    }
  };

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
              <h1 className="text-2xl font-extrabold text-white">Journals Master (List View)</h1>
              <p className="text-xs text-slate-400">Organize accounting transactions into Sales, Purchase, Bank, and Cash registers</p>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Journal</span>
          </button>
        </div>

        {/* Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="text-center py-16 text-slate-400">Loading journals...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/80 text-xs uppercase text-slate-400 font-semibold tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Journal Name</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Default Mapped Account</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {journals.map((j) => (
                    <tr key={j.id} className="hover:bg-slate-800/50 transition">
                      <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-indigo-400" />
                        <span>{j.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                            j.type === 'SALES'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : j.type === 'PURCHASE'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : j.type === 'BANK'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : j.type === 'CASH'
                              ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {j.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-300 font-semibold">
                        {j.defaultAccount ? (
                          <span className="text-indigo-300">{j.defaultAccount.name} A/c</span>
                        ) : (
                          <span className="text-slate-500 italic">None</span>
                        )}
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
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
              <h2 className="text-xl font-bold text-white">Create New Journal</h2>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Journal Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Sales Journal, Bank Journal"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Journal Type *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  >
                    <option value="SALES">Sales</option>
                    <option value="PURCHASE">Purchase</option>
                    <option value="BANK">Bank</option>
                    <option value="CASH">Cash</option>
                    <option value="GENERAL">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Default Mapped Account (From Chart of Accounts)
                  </label>
                  <select
                    value={defaultAccountId}
                    onChange={(e) => setDefaultAccountId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  >
                    <option value="">-- Select Mapped Account --</option>
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-2.5 rounded-xl shadow-lg transition"
                  >
                    Create Journal
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 border border-slate-700 text-slate-300 hover:bg-slate-800 rounded-xl font-semibold transition"
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
