import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { journalEntriesApi, journalsApi, accountsApi, contactsApi, analyticsApi } from '../../api/endpoints.js';
import Navbar from '../../components/Navbar.jsx';
import { Plus, ArrowLeft, AlertTriangle, Check, Trash2, ShieldAlert } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-4">
        
        {/* Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-md px-4 py-2 text-center dark:bg-amber-900/20 dark:border-amber-800/40">
          <h2 className="text-xs font-bold text-amber-900 dark:text-amber-300">Journals & Journal Entries (List View)</h2>
          <p className="text-xs text-amber-800/80 dark:text-amber-400/80">Double-entry accounting log. Blocking warning enforced if Debit and Credit totals do not match.</p>
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
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Journal Entries</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Recorded accounting transactions enforcing double-entry rules</p>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover dark:bg-primary-dark text-white text-xs font-semibold px-3 py-2 rounded transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Journal Entry</span>
          </button>
        </div>

        {/* List View Table */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-xs text-gray-500 dark:text-gray-400">Loading journal entries...</div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-500 dark:text-gray-400">No journal entries recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300">
                <thead className="bg-gray-50 dark:bg-gray-800/60 uppercase text-[11px] text-gray-600 dark:text-gray-400 font-semibold border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Number / Reference</th>
                    <th className="px-4 py-3">Journal</th>
                    <th className="px-4 py-3">Partner</th>
                    <th className="px-4 py-3 text-right">Total Debit</th>
                    <th className="px-4 py-3 text-right">Total Credit</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {entries.map((e) => {
                    const entryDebit = e.lines?.reduce((s, l) => s + Number(l.debit), 0) || 0;
                    const entryCredit = e.lines?.reduce((s, l) => s + Number(l.credit), 0) || 0;
                    const partnerName = e.lines?.find((l) => l.partner)?.partner?.name || '-';

                    return (
                      <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                        <td className="px-4 py-3 font-mono text-gray-500 dark:text-gray-400">
                          {new Date(e.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                          {e.reference || `ENTRY/#${e.id}`}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-primary dark:bg-gray-800 dark:text-primary-dark border border-gray-200 dark:border-gray-700">
                            {e.journal?.name}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-medium">{partnerName}</td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          ₹{entryDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-primary dark:text-primary-dark font-mono">
                          ₹{entryCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
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

        {/* Create Form Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-6 max-w-4xl w-full space-y-4 my-8">
              
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white">New Journal Entry</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Record debit and credit lines following double-entry accounting</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePost}
                    disabled={!isBalanced || posting}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-1.5 rounded text-xs transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Post Entry</span>
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* Blocking Warning Banner */}
              {!isBalanced && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-800/40 rounded-md p-3 flex items-start gap-2.5 text-amber-900 dark:text-amber-300 text-xs">
                  <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-950 dark:text-amber-200">Blocking warning if the debit and credit amount don't match!</p>
                    <p className="mt-0.5">
                      Total Debit (₹{totalDebit.toFixed(2)}) must equal Total Credit (₹{totalCredit.toFixed(2)}).
                      Difference: ₹{Math.abs(totalDebit - totalCredit).toFixed(2)}.
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-md p-3 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handlePost} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      Accounting Date
                    </label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      Journal (Many to One)
                    </label>
                    <select
                      value={journalId}
                      onChange={(e) => setJournalId(e.target.value)}
                      className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    >
                      {journals.map((j) => (
                        <option key={j.id} value={j.id}>
                          {j.name} ({j.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      Reference Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. MISC/2026/001"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                      className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Journal Items Table */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Journal Items</h3>
                    <button
                      type="button"
                      onClick={addLine}
                      className="text-xs font-semibold text-primary dark:text-primary-dark hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Line</span>
                    </button>
                  </div>

                  <div className="border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden">
                    <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300">
                      <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 uppercase font-semibold text-[11px]">
                        <tr>
                          <th className="px-3 py-2">Account (From CoA)</th>
                          <th className="px-3 py-2">Partner (Contact)</th>
                          <th className="px-3 py-2">Analytic</th>
                          <th className="px-3 py-2 text-right w-28">Debit (Rs.)</th>
                          <th className="px-3 py-2 text-right w-28">Credit (Rs.)</th>
                          <th className="px-2 py-2 w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {lines.map((line, idx) => (
                          <tr key={idx} className="bg-white dark:bg-gray-900">
                            <td className="p-1.5">
                              <select
                                required
                                value={line.accountId}
                                onChange={(e) => handleLineChange(idx, 'accountId', e.target.value)}
                                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                              >
                                <option value="">-- Select Account --</option>
                                {accounts.map((a) => (
                                  <option key={a.id} value={a.id}>
                                    {a.name} ({a.type})
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td className="p-1.5">
                              <select
                                value={line.partnerId}
                                onChange={(e) => handleLineChange(idx, 'partnerId', e.target.value)}
                                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                              >
                                <option value="">-- Select Partner --</option>
                                {contacts.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.name}
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td className="p-1.5">
                              <select
                                value={line.analyticId}
                                onChange={(e) => handleLineChange(idx, 'analyticId', e.target.value)}
                                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                              >
                                <option value="">-- Analytic Account --</option>
                                {analytics.map((an) => (
                                  <option key={an.id} value={an.id}>
                                    {an.name}
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td className="p-1.5">
                              <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={line.debit}
                                onChange={(e) => handleLineChange(idx, 'debit', e.target.value)}
                                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-xs text-right text-emerald-600 dark:text-emerald-400 font-bold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                              />
                            </td>

                            <td className="p-1.5">
                              <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={line.credit}
                                onChange={(e) => handleLineChange(idx, 'credit', e.target.value)}
                                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-xs text-right text-primary dark:text-primary-dark font-bold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                              />
                            </td>

                            <td className="p-1.5 text-center">
                              <button
                                type="button"
                                onClick={() => removeLine(idx)}
                                className="p-1 text-gray-400 hover:text-rose-600 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50 dark:bg-gray-800/60 font-bold text-xs">
                        <tr>
                          <td colSpan={3} className="px-3 py-2 text-right uppercase text-gray-500 dark:text-gray-400">Total:</td>
                          <td className="px-3 py-2 text-right text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold">
                            ₹{totalDebit.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-right text-primary dark:text-primary-dark font-mono text-xs font-bold">
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
