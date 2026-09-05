import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportsApi, journalsApi } from '../../api/endpoints.js';
import Navbar from '../../components/Navbar.jsx';
import { ArrowLeft, Calendar, Printer, BookOpen } from 'lucide-react';

export default function JournalReport() {
  const [entries, setEntries] = useState([]);
  const [journals, setJournals] = useState([]);
  const [selectedJournal, setSelectedJournal] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadJournals();
  }, []);

  useEffect(() => {
    fetchJournals();
  }, [selectedJournal, dateFrom, dateTo]);

  const loadJournals = async () => {
    try {
      const res = await journalsApi.list();
      setJournals(res.data);
    } catch (err) {
      console.error('Error fetching journals:', err);
    }
  };

  const fetchJournals = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedJournal) params.journalId = selectedJournal;
      if (dateFrom) params.from = dateFrom;
      if (dateTo) params.to = dateTo;

      const res = await reportsApi.journalReport(params);
      setEntries(res.data);
    } catch (err) {
      console.error('Error fetching Journal Report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16 print:bg-white print:text-black">
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl print:bg-transparent print:border-none print:shadow-none print:p-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition print:hidden"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-white print:text-black">Journal Report</h1>
              <p className="text-xs text-slate-400 print:text-slate-600">
                Audited report of all posted journal entries across Sales, Purchase, Bank & Cash journals
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 print:hidden">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl print:hidden">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Filter Journal</label>
            <select
              value={selectedJournal}
              onChange={(e) => setSelectedJournal(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Journals</option>
              {journals.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.name} ({j.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Journal Entries List */}
        {loading ? (
          <div className="text-center py-16 text-slate-400">Loading Journal Report...</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-16 text-slate-400">No journal entries found.</div>
        ) : (
          <div className="space-y-6">
            {entries.map((entry) => {
              const entryTotalDebit = entry.lines.reduce((s, l) => s + Number(l.debit || 0), 0);
              const entryTotalCredit = entry.lines.reduce((s, l) => s + Number(l.credit || 0), 0);

              return (
                <div
                  key={entry.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl print:border-black print:bg-white print:break-inside-avoid"
                >
                  <div className="bg-slate-950/80 px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 print:bg-slate-100 print:text-black">
                    <div className="flex items-center gap-3">
                      <div className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-mono font-bold text-xs">
                        {entry.journal?.name || 'General Journal'}
                      </div>
                      <span className="font-bold text-white text-sm print:text-black">
                        Ref: {entry.reference || `JE-${entry.id}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400 print:text-black">
                      <span>Date: {new Date(entry.date).toLocaleDateString()}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold text-[10px] uppercase">
                        {entry.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300 print:text-black">
                      <thead className="text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800/60">
                        <tr>
                          <th className="py-2 px-3">Account</th>
                          <th className="py-2 px-3">Partner</th>
                          <th className="py-2 px-3">Analytic Account</th>
                          <th className="py-2 px-3 text-right">Debit (₹)</th>
                          <th className="py-2 px-3 text-right">Credit (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40">
                        {entry.lines.map((l) => (
                          <tr key={l.id}>
                            <td className="py-2 px-3 font-semibold text-slate-200 print:text-black">{l.account?.name}</td>
                            <td className="py-2 px-3 text-slate-400 print:text-black">{l.partner?.name || '-'}</td>
                            <td className="py-2 px-3 text-slate-400 print:text-black">{l.analytic?.name || '-'}</td>
                            <td className="py-2 px-3 text-right font-mono text-emerald-400 print:text-black">
                              {l.debit > 0 ? `₹${Number(l.debit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-rose-400 print:text-black">
                              {l.credit > 0 ? `₹${Number(l.credit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="font-bold border-t border-slate-800/60 text-slate-200 print:text-black">
                        <tr>
                          <td colSpan={3} className="py-2 px-3 text-right uppercase text-[10px]">Total Entry:</td>
                          <td className="py-2 px-3 text-right font-mono text-emerald-400 print:text-black">
                            ₹{entryTotalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-rose-400 print:text-black">
                            ₹{entryTotalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
