import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { journalEntriesApi, journalsApi, accountsApi, contactsApi, analyticsApi } from '../../api/endpoints.js';
import Navbar from '../../components/Navbar.jsx';
import { BookOpen, Plus, ArrowLeft, AlertTriangle, Check, Trash2, ShieldAlert } from 'lucide-react';

export default function JournalEntries() {
  const [entries, setEntries] = useState([]);
  const [journals, setJournals] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [analytics, setAnalytics] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  // New Journal Entry Form state
  const [journalId, setJournalId] = useState('');
  const [reference, setReference] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [lines, setLines] = useState([
    { accountId: '', partnerId: '', analyticId: '', debit: '', credit: '' },
    { accountId: '', partnerId: '', analyticId: '', debit: '', credit: '' },
  ]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eRes, jRes, aRes, cRes, anRes] = await Promise.all([
        journalEntriesApi.list(),
        journalsApi.list(),
        accountsApi.list(),
        contactsApi.list(),
        analyticsApi.list(),
      ]);
      setEntries(eRes.data || []);
      setJournals(jRes.data || []);
      setAccounts(aRes.data || []);
      setContacts(cRes.data || []);
      setAnalytics(anRes.data || []);

      if (jRes.data?.length > 0) {
        setJournalId(jRes.data[0].id);
      }
    } catch (err) {
      console.error('Error fetching journal entry data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLineChange = (index, field, value) => {
    const updated = [...lines];
    updated[index][field] = value;
    setLines(updated);
  };

  const addLine = () => {
    setLines([...lines, { accountId: '', partnerId: '', analyticId: '', debit: '', credit: '' }]);
  };

  const removeLine = (index) => {
    if (lines.length <= 2) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  // Debit/Credit balance computation
  const totalDebit = lines.reduce((s, l) => s + (parseFloat(l.debit) || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  const handlePost = async (e) => {
    e.preventDefault();
    setError('');

    if (!isBalanced) {
      setError(`Blocking Warning: Total Debit (Rs. ${totalDebit.toFixed(2)}) does not match Total Credit (Rs. ${totalCredit.toFixed(2)}). Accounting rules require equal debits and credits.`);
      return;
    }

    setPosting(true);
    try {
      await journalEntriesApi.create({
        journalId: Number(journalId),
        reference,
        date,
        lines: lines.map((l) => ({
          accountId: Number(l.accountId),
          partnerId: l.partnerId ? Number(l.partnerId) : null,
          analyticId: l.analyticId ? Number(l.analyticId) : null,
          debit: parseFloat(l.debit) || 0,
          credit: parseFloat(l.credit) || 0,
        })),
      });

      setShowModal(false);
      fetchData();
      // Reset form
      setReference('');
      setLines([
        { accountId: '', partnerId: '', analyticId: '', debit: '', credit: '' },
        { accountId: '', partnerId: '', analyticId: '', debit: '', credit: '' },
      ]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post journal entry');
    } finally {
      setPosting(false);
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
              <h1 className="text-2xl font-extrabold text-white">Journal Entries (Double-Entry Ledger)</h1>
              <p className="text-xs text-slate-400">Recorded accounting transactions enforcing double-entry rules</p>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Journal Entry</span>
          </button>
        </div>

        {/* List View Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="text-center py-16 text-slate-400">Loading journal entries...</div>
          ) : entries.length === 0 ? (
            <div className="text-center py-16 text-slate-400">No journal entries recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/80 text-xs uppercase text-slate-400 font-semibold tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Number / Reference</th>
                    <th className="px-6 py-4">Journal</th>
                    <th className="px-6 py-4">Partner</th>
                    <th className="px-6 py-4 text-right">Total Debit</th>
                    <th className="px-6 py-4 text-right">Total Credit</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {entries.map((e) => {
                    const entryDebit = e.lines?.reduce((s, l) => s + Number(l.debit), 0) || 0;
                    const entryCredit = e.lines?.reduce((s, l) => s + Number(l.credit), 0) || 0;
                    const partnerName = e.lines?.find((l) => l.partner)?.partner?.name || '-';

                    return (
                      <tr key={e.id} className="hover:bg-slate-800/50 transition">
                        <td className="px-6 py-4 text-xs font-mono text-slate-400">
                          {new Date(e.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 font-bold text-white">
                          {e.reference || `ENTRY/#${e.id}`}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-800 text-indigo-300 border border-indigo-500/20">
                            {e.journal?.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-300">{partnerName}</td>
                        <td className="px-6 py-4 text-right font-bold text-emerald-400">
                          ₹{entryDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-indigo-400">
                          ₹{entryCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {e.status || 'POSTED'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create Form Modal (Matching Image 4) */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-4xl w-full shadow-2xl space-y-6 animate-in fade-in zoom-in-95 my-8">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-xl font-extrabold text-white">New Journal Entry</h2>
                  <p className="text-xs text-slate-400">Record debit and credit lines following double-entry accounting</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePost}
                    disabled={!isBalanced || posting}
                    className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold px-5 py-2 rounded-xl text-sm shadow-lg shadow-emerald-600/30 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Check className="w-4 h-4" />
                    <span>Post Entry</span>
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-slate-700 text-slate-300 hover:bg-slate-800 rounded-xl text-sm font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* Blocking Warning Banner per Image 4 */}
              {!isBalanced && (
                <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-xl p-4 flex items-start gap-3 text-amber-300 text-xs">
                  <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-200">Blocking Warning: Unbalanced Entry!</p>
                    <p className="mt-0.5">
                      Total Debit (₹{totalDebit.toFixed(2)}) must equal Total Credit (₹{totalCredit.toFixed(2)}).
                      Difference: ₹{Math.abs(totalDebit - totalCredit).toFixed(2)}. Please adjust line amounts before posting.
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handlePost} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Accounting Date
                    </label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Journal (Many to One)
                    </label>
                    <select
                      value={journalId}
                      onChange={(e) => setJournalId(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 transition"
                    >
                      {journals.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.name} ({j.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Reference Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. MISC/2026/001"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                </div>

                {/* Journal Items Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Journal Items</h3>
                    <button
                      type="button"
                      onClick={addLine}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Line</span>
                    </button>
                  </div>

                  <div className="border border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-800 text-slate-400 uppercase font-semibold">
                        <tr>
                          <th className="px-3 py-2.5">Account (From CoA)</th>
                          <th className="px-3 py-2.5">Partner (Contact)</th>
                          <th className="px-3 py-2.5">Analytic</th>
                          <th className="px-3 py-2.5 text-right w-28">Debit (Rs.)</th>
                          <th className="px-3 py-2.5 text-right w-28">Credit (Rs.)</th>
                          <th className="px-2 py-2.5 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {lines.map((line, idx) => (
                          <tr key={idx} className="bg-slate-900">
                            <td className="p-2">
                              <select
                                required
                                value={line.accountId}
                                onChange={(e) => handleLineChange(idx, 'accountId', e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:ring-1 focus:ring-indigo-500"
                              >
                                <option value="">-- Select Account --</option>
                                {accounts.map((a) => (
                                  <option key={a.id} value={a.id}>
                                    {a.name} ({a.type})
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td className="p-2">
                              <select
                                value={line.partnerId}
                                onChange={(e) => handleLineChange(idx, 'partnerId', e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:ring-1 focus:ring-indigo-500"
                              >
                                <option value="">-- Select Partner --</option>
                                {contacts.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.name}
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td className="p-2">
                              <select
                                value={line.analyticId}
                                onChange={(e) => handleLineChange(idx, 'analyticId', e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:ring-1 focus:ring-indigo-500"
                              >
                                <option value="">-- Analytic Account --</option>
                                {analytics.map((an) => (
                                  <option key={an.id} value={an.id}>
                                    {an.name}
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td className="p-2">
                              <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={line.debit}
                                onChange={(e) => handleLineChange(idx, 'debit', e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-right text-emerald-400 font-bold focus:ring-1 focus:ring-emerald-500"
                              />
                            </td>

                            <td className="p-2">
                              <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={line.credit}
                                onChange={(e) => handleLineChange(idx, 'credit', e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-right text-indigo-400 font-bold focus:ring-1 focus:ring-indigo-500"
                              />
                            </td>

                            <td className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => removeLine(idx)}
                                className="p-1 text-slate-500 hover:text-red-400 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-slate-800/80 font-bold text-xs">
                        <tr>
                          <td colSpan={3} className="px-3 py-2.5 text-right uppercase text-slate-400">Total:</td>
                          <td className="px-3 py-2.5 text-right text-emerald-400 font-mono text-sm">
                            ₹{totalDebit.toFixed(2)}
                          </td>
                          <td className="px-3 py-2.5 text-right text-indigo-400 font-mono text-sm">
                            ₹{totalCredit.toFixed(2)}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
