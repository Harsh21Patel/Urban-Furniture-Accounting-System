import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { budgetsApi, analyticsApi, contactsApi } from '../../api/endpoints.js';
import Navbar from '../../components/Navbar.jsx';
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
  const [budgetTransactions, setBudgetTransactions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [periodStart, setPeriodStart] = useState('2026-01-01');
  const [periodEnd, setPeriodEnd] = useState('2026-12-31');
  const [responsiblePerson, setResponsiblePerson] = useState('');
  const [analyticId, setAnalyticId] = useState('');
  const [committedAmount, setCommittedAmount] = useState('');

  // Revision State
  const [revisedAmount, setRevisedAmount] = useState('');

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

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this budget?')) return;
    try {
      await budgetsApi.cancel(id);
      fetchData();
    } catch (err) {
      alert('Failed to cancel budget');
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16 transition-colors duration-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* Yellow Header Banner matching Images 8 & 9 */}
        <div className="bg-amber-100 border border-amber-300 rounded-xl px-6 py-2.5 text-center shadow-sm dark:bg-amber-500/10 dark:border-amber-500/30">
          <h2 className="text-base font-extrabold text-amber-900 dark:text-amber-300">Budget Flow (Form View & Lifecycle)</h2>
          <p className="text-xs text-amber-800/80 dark:text-amber-400/80">Menu & Stage Mapping: Draft $\rightarrow$ Confirm $\rightarrow$ Revise $\rightarrow$ Cancelled. Achieved amount computed dynamically.</p>
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
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Analytical Budget Lifecycle</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Planned vs Achieved tracking with Draft, Confirmed, Revised, and Cancelled stage flow</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/reports/budget')}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <PieIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>Budget Report</span>
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Fresh Budget</span>
            </button>
          </div>
        </div>

        {/* Budgets Cards / Table */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-16 text-slate-500 dark:text-slate-400">Loading budgets...</div>
          ) : budgets.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 dark:text-slate-400">
              No budgets created yet. Click "New Fresh Budget" to create one.
            </div>
          ) : (
            budgets.map((b) => (
              <div
                key={b.id}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-sm dark:shadow-xl space-y-6 transition ${
                  b.status === 'REVISED'
                    ? 'border-slate-200 dark:border-slate-800 opacity-70'
                    : b.status === 'CANCELLED'
                    ? 'border-red-200 dark:border-red-900/40 opacity-60'
                    : 'border-slate-200 dark:border-slate-800 hover:border-indigo-500'
                }`}
              >
                {/* Card Top Info */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">{b.name}</h2>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                          b.status === 'DRAFT'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30'
                            : b.status === 'CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
                            : b.status === 'REVISED'
                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30'
                            : 'bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/30'
                        }`}
                      >
                        {b.status}
                      </span>
                      {b.revisedFrom && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 italic">
                          (Revision of: #{b.revisedFrom.id} {b.revisedFrom.name})
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>
                          {new Date(b.periodStart).toLocaleDateString()} to {new Date(b.periodEnd).toLocaleDateString()}
                        </span>
                      </div>
                      {b.responsiblePerson && (
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                          <span>Resp: {b.responsiblePerson}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stage Flow Action Buttons (Matching Image 8 Wireframe) */}
                  <div className="flex items-center gap-2">
                    {b.status === 'DRAFT' && (
                      <button
                        onClick={() => handleConfirm(b.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
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
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Revise</span>
                      </button>
                    )}

                    {b.status !== 'CANCELLED' && b.status !== 'REVISED' && (
                      <button
                        onClick={() => handleCancel(b.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-600 dark:hover:bg-red-600 text-slate-700 dark:text-slate-300 hover:text-white text-xs font-semibold transition"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Analytic Line Calculation Table (Image 8 & 9) */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                    <thead className="bg-slate-100 dark:bg-slate-800/60 uppercase text-slate-600 dark:text-slate-400 font-semibold">
                      <tr>
                        <th className="px-4 py-2.5">Analytic Account</th>
                        <th className="px-4 py-2.5">Type</th>
                        <th className="px-4 py-2.5 text-right">Committed Amount</th>
                        <th className="px-4 py-2.5 text-right">Achieved Amount</th>
                        <th className="px-4 py-2.5 text-right">Achieved %</th>
                        <th className="px-4 py-2.5 text-right">Amount to Achieve</th>
                        <th className="px-4 py-2.5 text-center">Drill-Down</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-slate-50 dark:bg-slate-800/30">
                        <td className="px-4 py-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <PieIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          <span>{b.analytic?.name}</span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">{b.analytic?.type}</td>
                        <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white font-mono">
                          ₹{Number(b.committedAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-right font-extrabold text-teal-600 dark:text-teal-400 font-mono">
                          ₹{Number(b.achievedAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                          {b.achievedPercent}%
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-amber-600 dark:text-amber-400 font-mono">
                          ₹{Number(b.remainingAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleViewTransactions(b)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-100 dark:bg-indigo-600/30 hover:bg-indigo-600 text-indigo-700 dark:text-indigo-300 hover:text-white text-[11px] font-bold transition"
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
                  <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                    <span>Progress to Target</span>
                    <span>{b.achievedPercent}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-indigo-500 rounded-full transition-all duration-500"
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
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create New Fresh Budget</h2>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Budget Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., January 2026 / Project A"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      required
                      value={periodStart}
                      onChange={(e) => setPeriodStart(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      required
                      value={periodEnd}
                      onChange={(e) => setPeriodEnd(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Responsible Person
                  </label>
                  <select
                    value={responsiblePerson}
                    onChange={(e) => setResponsiblePerson(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
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
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Analytic Account *
                  </label>
                  <select
                    value={analyticId}
                    onChange={(e) => setAnalyticId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  >
                    {analytics.map((an) => (
                      <option key={an.id} value={an.id}>
                        {an.name} ({an.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Committed Target Amount (Rs.) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="200000.00"
                    value={committedAmount}
                    onChange={(e) => setCommittedAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl shadow-md transition"
                  >
                    Create Fresh Budget
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-semibold transition"
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
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Revise Budget: {selectedBudget.name}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Revising will mark original budget as REVISED and create a new confirmed budget entry named '{selectedBudget.name.endsWith('Revised') ? selectedBudget.name : `${selectedBudget.name} Revised`}'.
              </p>

              <form onSubmit={handleReviseSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    New Committed Amount (Rs.) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={revisedAmount}
                    onChange={(e) => setRevisedAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl shadow-md transition"
                  >
                    Confirm Revision
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReviseModal(false)}
                    className="px-4 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-semibold transition"
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
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Achieved Transactions Drill-Down</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Invoices & Bills linked to '{selectedBudget.analytic?.name}' during budget period
                  </p>
                </div>
                <button
                  onClick={() => setShowTransModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
                >
                  Close
                </button>
              </div>

              {budgetTransactions.length === 0 ? (
                <div className="text-center py-10 text-slate-500 dark:text-slate-400 text-xs">
                  No posted invoices or bills linked to this analytic account during the budget period.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                    <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase font-semibold">
                      <tr>
                        <th className="px-4 py-2.5">Document Type</th>
                        <th className="px-4 py-2.5">Reference</th>
                        <th className="px-4 py-2.5">Partner</th>
                        <th className="px-4 py-2.5">Date</th>
                        <th className="px-4 py-2.5 text-right">Total Amount</th>
                        <th className="px-4 py-2.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {budgetTransactions.map((tx, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{tx.type}</td>
                          <td className="px-4 py-3 font-mono text-indigo-600 dark:text-indigo-300">{tx.reference}</td>
                          <td className="px-4 py-3">{tx.partner}</td>
                          <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                            {new Date(tx.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-teal-600 dark:text-teal-400 font-mono">
                            ₹{tx.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
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
    </div>
  );
}
