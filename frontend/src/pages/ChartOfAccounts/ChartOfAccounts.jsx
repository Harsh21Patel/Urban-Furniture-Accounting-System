import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { accountsApi } from '../../api/endpoints.js';
import Navbar from '../../components/Navbar.jsx';
import ConfirmModal from '../../components/ConfirmModal.jsx';
import { BookOpen, Plus, ArrowLeft, AlertCircle, Archive } from 'lucide-react';

export default function ChartOfAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('ASSET');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    account: null,
    loading: false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await accountsApi.list();
      setAccounts(res.data || []);
    } catch (err) {
      console.error('Error fetching accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await accountsApi.create({ name, type });
      setName('');
      setShowModal(false);
      fetchAccounts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account');
    }
  };

  const openArchiveModal = (acc) => {
    setConfirmModal({
      isOpen: true,
      account: acc,
      loading: false,
    });
  };

  const handleConfirmArchive = async () => {
    if (!confirmModal.account) return;
    setConfirmModal((prev) => ({ ...prev, loading: true }));
    try {
      await accountsApi.archive(confirmModal.account.id);
      setConfirmModal({ isOpen: false, account: null, loading: false });
      fetchAccounts();
    } catch (err) {
      alert('Failed to archive account');
      setConfirmModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const getReportCategory = (accType) => {
    if (['ASSET', 'LIABILITY', 'CAPITAL'].includes(accType)) return 'Balancesheet';
    return 'Profit and Loss';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-4">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Chart of Accounts Master</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Master ledger accounts for double-entry financial reporting</p>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover dark:bg-primary-dark text-white text-xs font-semibold px-3 py-2 rounded transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Account</span>
          </button>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-xs text-gray-500 dark:text-gray-400">Loading accounts...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300">
                <thead className="bg-gray-50 dark:bg-gray-800/60 uppercase text-[11px] text-gray-600 dark:text-gray-400 font-semibold border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-4 py-3">Account ID</th>
                    <th className="px-4 py-3">Account Name</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Financial Report Target</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {accounts.map((acc) => (
                    <tr key={acc.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 font-mono">#{acc.id}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-primary dark:text-primary-dark" />
                        <span>{acc.name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                            acc.type === 'ASSET'
                              ? 'bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                              : acc.type === 'LIABILITY'
                              ? 'bg-rose-50 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                              : acc.type === 'INCOME'
                              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                              : acc.type === 'EXPENSE'
                              ? 'bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                              : 'bg-purple-50 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800'
                          }`}
                        >
                          {acc.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-300 font-medium">
                        {getReportCategory(acc.type)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => openArchiveModal(acc)}
                          title="Archive Account"
                          className="p-1 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 rounded"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-6 max-w-md w-full space-y-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Create New Account</h2>

              {error && (
                <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-md p-3 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Account Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Purchase Expense A/c, Sales Income A/c"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Account Type (Select from Balancesheet / P&L) *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <optgroup label="Balancesheet Accounts">
                      <option value="ASSET">Asset / Cash / Bank / Debtors</option>
                      <option value="LIABILITY">Liability / Creditors</option>
                      <option value="CAPITAL">Capital / Equity</option>
                    </optgroup>
                    <optgroup label="Profit & Loss Accounts">
                      <option value="INCOME">Income / Sales</option>
                      <option value="EXPENSE">Expenses / Purchase Expense</option>
                    </optgroup>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                  <button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary-hover dark:bg-primary-dark text-white font-semibold text-xs py-2 rounded transition"
                  >
                    Create Account
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

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, account: null, loading: false })}
        onConfirm={handleConfirmArchive}
        loading={confirmModal.loading}
        title="Archive Account"
        message={`Are you sure you want to archive "${confirmModal.account?.name}"?`}
        confirmText="Archive"
        variant="danger"
        icon={Archive}
      />
    </div>
  );
}
