import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { budgetsApi, analyticsApi, contactsApi } from '../../api/endpoints.js';
import Navbar from '../../components/Navbar.jsx';
import ConfirmModal from '../../components/ConfirmModal.jsx';
import {
  PieChart as PieIcon,
  Plus,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  XCircle,
  Eye,
  Calendar,
  User,
  AlertCircle,
} from 'lucide-react';

export default function BudgetList() {
  const [budgets, setBudgets] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [contacts, setContacts] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [showTransModal, setShowTransModal] = useState(false);
  const [showReviseModal, setShowReviseModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [revisedAmount, setRevisedAmount] = useState('');
  const [budgetTransactions, setBudgetTransactions] = useState([]);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    budget: null,
    loading: false,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [periodStart, setPeriodStart] = useState('2026-01-01');
  const [periodEnd, setPeriodEnd] = useState('2026-12-31');
  const [responsiblePerson, setResponsiblePerson] = useState('');
  const [analyticId, setAnalyticId] = useState('');
  const [committedAmount, setCommittedAmount] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bRes, anRes, cRes] = await Promise.all([
        budgetsApi.list(),
        analyticsApi.list(),
        contactsApi.list(),
      ]);
      setBudgets(bRes.data || []);
      setAnalytics(anRes.data || []);
      setContacts(cRes.data || []);
      if (anRes.data?.length > 0) setAnalyticId(anRes.data[0].id);
      if (cRes.data?.length > 0) setResponsiblePerson(cRes.data[0].name);
    } catch (err) {
      console.error('Error fetching budget data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await budgetsApi.create({
        name,
        periodStart,
        periodEnd,
        responsiblePerson,
        analyticId: Number(analyticId),
        committedAmount: parseFloat(committedAmount) || 0,
      });
      setShowModal(false);
      setName('');
      setCommittedAmount('');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create budget');
    }
  };

  const handleConfirm = async (id) => {
    try {
      await budgetsApi.confirm(id);
      fetchData();
    } catch (err) {
      alert('Failed to confirm budget');
    }
  };

  const handleReviseSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBudget) return;
    try {
      await budgetsApi.revise(selectedBudget.id, { committedAmount: parseFloat(revisedAmount) });
      setShowReviseModal(false);
      setSelectedBudget(null);
      fetchData();
    } catch (err) {
      alert('Failed to revise budget');
    }
  };

  const openCancelModal = (b) => {
    setConfirmModal({
      isOpen: true,
      budget: b,
      loading: false,
    });
  };

  const handleConfirmCancel = async () => {
    if (!confirmModal.budget) return;
    setConfirmModal((prev) => ({ ...prev, loading: true }));
    try {
      await budgetsApi.cancel(confirmModal.budget.id);
      setConfirmModal({ isOpen: false, budget: null, loading: false });
      fetchData();
    } catch (err) {
      alert('Failed to cancel budget');
      setConfirmModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleViewTransactions = async (b) => {
    setSelectedBudget(b);
    try {
      const res = await budgetsApi.getTransactions(b.id);
      setBudgetTransactions(res.data || []);
      setShowTransModal(true);
    } catch (err) {
      console.error('Error loading budget transactions:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-4">
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
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Analytical Budget Lifecycle</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Planned vs Achieved tracking with Draft, Confirmed, Revised, and Cancelled stage flow</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/reports/budget')}
              className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <PieIcon className="w-4 h-4 text-primary dark:text-primary-dark" />
              <span>Budget Report</span>
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover dark:bg-primary-dark text-white text-xs font-semibold px-3 py-2 rounded transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Fresh Budget</span>
            </button>
          </div>
        </div>

        {/* Budgets Cards / Table */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-xs text-gray-500 dark:text-gray-400">Loading budgets...</div>
          ) : budgets.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md text-xs text-gray-500 dark:text-gray-400">
              No budgets created yet. Click "New Fresh Budget" to create one.
            </div>
          ) : (
            budgets.map((b) => (
              <div
                key={b.id}
                className={`bg-white dark:bg-gray-900 border rounded-md p-4 space-y-4 ${
                  b.status === 'REVISED'
                    ? 'border-gray-200 dark:border-gray-800 opacity-70'
                    : b.status === 'CANCELLED'
                    ? 'border-rose-200 dark:border-rose-900/40 opacity-60'
                    : 'border-gray-200 dark:border-gray-800'
                }`}
              >
                {/* Card Top Info */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-gray-200 dark:border-gray-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h2 className="text-base font-bold text-gray-900 dark:text-white">{b.name}</h2>
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                          b.status === 'DRAFT'
                            ? 'bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                            : b.status === 'CONFIRMED'
                            ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : b.status === 'REVISED'
                            ? 'bg-primary-light text-primary dark:bg-primary-dark/20 dark:text-primary-dark border border-primary/20 dark:border-primary-dark/30'
                            : 'bg-rose-50 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        {b.status}
                      </span>
                      {b.revisedFrom && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                          (Revision of: #{b.revisedFrom.id} {b.revisedFrom.name})
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary dark:text-primary-dark" />
                        <span>
                          {new Date(b.periodStart).toLocaleDateString()} to {new Date(b.periodEnd).toLocaleDateString()}
                        </span>
                      </div>
                      {b.responsiblePerson && (
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                          <span>Resp: {b.responsiblePerson}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stage Flow Action Buttons */}
                  <div className="flex items-center gap-2">
                    {b.status === 'DRAFT' && (
                      <button
                        onClick={() => handleConfirm(b.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm</span>
                      </button>
                    )}

                    {b.status === 'CONFIRMED' && (
                      <button
                        onClick={() => {
                          setSelectedBudget(b);
                          setRevisedAmount(b.committedAmount);
                          setShowReviseModal(true);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded bg-primary hover:bg-primary-hover dark:bg-primary-dark text-white text-xs font-semibold"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Revise</span>
                      </button>
                    )}

                    {b.status !== 'CANCELLED' && b.status !== 'REVISED' && (
                      <button
                        onClick={() => openCancelModal(b)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs font-semibold"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300">
                    <thead className="bg-gray-50 dark:bg-gray-800/60 uppercase text-[11px] text-gray-600 dark:text-gray-400 font-semibold border-b border-gray-200 dark:border-gray-800">
                      <tr>
                        <th className="px-3 py-2">Analytic Account</th>
                        <th className="px-3 py-2">Type</th>
                        <th className="px-3 py-2 text-right">Committed Amount</th>
                        <th className="px-3 py-2 text-right">Achieved Amount</th>
                        <th className="px-3 py-2 text-right">Achieved %</th>
                        <th className="px-3 py-2 text-right">Amount to Achieve</th>
                        <th className="px-3 py-2 text-center">Drill-Down</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white dark:bg-gray-900">
                        <td className="px-3 py-2 font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <PieIcon className="w-4 h-4 text-primary dark:text-primary-dark" />
                          <span>{b.analytic?.name}</span>
                        </td>
                        <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-300">{b.analytic?.type}</td>
                        <td className="px-3 py-2 text-right font-bold text-gray-900 dark:text-white font-mono">
                          ₹{Number(b.committedAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          ₹{Number(b.achievedAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-primary dark:text-primary-dark font-mono">
                          {b.achievedPercent}%
                        </td>
                        <td className="px-3 py-2 text-right font-semibold text-amber-600 dark:text-amber-400 font-mono">
                          ₹{Number(b.remainingAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            onClick={() => handleViewTransactions(b)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary-light text-primary dark:bg-primary-dark/20 dark:text-primary-dark hover:bg-primary hover:text-white dark:hover:bg-primary-dark text-[11px] font-semibold transition"
                            title="View Invoices/Bills contributing to Achieved Amount"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Invoices</span>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-gray-500 dark:text-gray-400 font-semibold">
                    <span>Progress to Target</span>
                    <span>{b.achievedPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary dark:bg-primary-dark rounded-full"
                      style={{ width: `${Math.min(100, b.achievedPercent)}%` }}
                    />
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

        {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-6 max-w-lg w-full space-y-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Create New Fresh Budget</h2>

              {error && (
                <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-md p-3 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Budget Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., January 2026 / Project A"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      required
                      value={periodStart}
                      onChange={(e) => setPeriodStart(e.target.value)}
                      className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      required
                      value={periodEnd}
                      onChange={(e) => setPeriodEnd(e.target.value)}
                      className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Responsible Person
                  </label>
                  <select
                    value={responsiblePerson}
                    onChange={(e) => setResponsiblePerson(e.target.value)}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="">-- Select Responsible Person --</option>
                    {contacts.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Analytic Account *
                  </label>
                  <select
                    value={analyticId}
                    onChange={(e) => setAnalyticId(e.target.value)}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    {analytics.map((an) => (
                      <option key={an.id} value={an.id}>
                        {an.name} ({an.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Committed Target Amount (Rs.) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="200000.00"
                    value={committedAmount}
                    onChange={(e) => setCommittedAmount(e.target.value)}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-1.5 text-xs text-gray-900 dark:text-white font-bold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                  <button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary-hover dark:bg-primary-dark text-white font-semibold text-xs py-2 rounded transition"
                  >
                    Create Fresh Budget
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

        {/* Revise Modal */}
        {showReviseModal && selectedBudget && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-6 max-w-md w-full space-y-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Revise Budget: {selectedBudget.name}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Revising will mark original budget as REVISED and create a new confirmed budget entry named '{selectedBudget.name.endsWith('Revised') ? selectedBudget.name : `${selectedBudget.name} Revised`}'.
              </p>

              <form onSubmit={handleReviseSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    New Committed Amount (Rs.) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={revisedAmount}
                    onChange={(e) => setRevisedAmount(e.target.value)}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-1.5 text-xs text-gray-900 dark:text-white font-bold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                  <button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary-hover dark:bg-primary-dark text-white font-semibold text-xs py-2 rounded transition"
                  >
                    Confirm Revision
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReviseModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Drill-Down Transactions Modal */}
        {showTransModal && selectedBudget && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-6 max-w-2xl w-full space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">Achieved Transactions Drill-Down</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Invoices & Bills linked to '{selectedBudget.analytic?.name}' during budget period
                  </p>
                </div>
                <button
                  onClick={() => setShowTransModal(false)}
                  className="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-medium"
                >
                  Close
                </button>
              </div>

              {budgetTransactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-xs">
                  No posted invoices or bills linked to this analytic account during the budget period.
                </div>
              ) : (
                <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-md">
                  <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300">
                    <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 uppercase font-semibold text-[11px]">
                      <tr>
                        <th className="px-3 py-2">Document Type</th>
                        <th className="px-3 py-2">Reference</th>
                        <th className="px-3 py-2">Partner</th>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2 text-right">Total Amount</th>
                        <th className="px-3 py-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      {budgetTransactions.map((tx, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                          <td className="px-3 py-2 font-semibold text-gray-900 dark:text-white">{tx.type}</td>
                          <td className="px-3 py-2 font-mono text-primary dark:text-primary-dark">{tx.reference}</td>
                          <td className="px-3 py-2">{tx.partner}</td>
                          <td className="px-3 py-2 text-gray-500 dark:text-gray-400">
                            {new Date(tx.date).toLocaleDateString()}
                          </td>
                          <td className="px-3 py-2 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                            ₹{tx.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, budget: null, loading: false })}
        onConfirm={handleConfirmCancel}
        loading={confirmModal.loading}
        title="Cancel Budget"
        message={`Are you sure you want to cancel the budget "${confirmModal.budget?.name}"?`}
        confirmText="Cancel Budget"
        variant="danger"
        icon={XCircle}
      />
    </div>
  );
}
