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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 pb-16 print:bg-white print:text-black">
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-md print:bg-transparent print:border-none print:p-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 print:hidden"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white print:text-black">Journal Report</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-600">
                Audited report of all posted journal entries across Sales, Purchase, Bank & Cash journals
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 print:hidden">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-hover dark:bg-primary-dark dark:hover:bg-primary text-white rounded text-xs font-semibold"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-md print:hidden">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Filter Journal</label>
            <select
              value={selectedJournal}
              onChange={(e) => setSelectedJournal(e.target.value)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-primary"
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
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Journal Entries List */}
        {loading ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">Loading Journal Report...</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">No journal entries found.</div>
        ) : (
          <div className="space-y-6">
            {entries.map((entry) => {
              const entryTotalDebit = entry.lines.reduce((s, l) => s + Number(l.debit || 0), 0);
              const entryTotalCredit = entry.lines.reduce((s, l) => s + Number(l.credit || 0), 0);

              return (
                <div
                  key={entry.id}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden print:border-gray-300 print:bg-white print:break-inside-avoid"
                >
                  <div className="bg-gray-50 dark:bg-gray-800/60 px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4 print:bg-gray-100 print:text-black">
                    <div className="flex items-center gap-3">
                      <div className="px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-mono font-bold text-xs">
                        {entry.journal?.name || 'General Journal'}
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white text-sm print:text-black">
                        Ref: {entry.reference || `JE-${entry.id}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 print:text-black">
                      <span>Date: {new Date(entry.date).toLocaleDateString()}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 font-bold text-[10px] uppercase">
                        {entry.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300 print:text-black">
                      <thead className="text-gray-600 dark:text-gray-400 uppercase font-semibold text-[10px] border-b border-gray-200 dark:border-gray-800">
                        <tr>
                          <th className="py-2 px-3">Account</th>
                          <th className="py-2 px-3">Partner</th>
                          <th className="py-2 px-3">Analytic Account</th>
                          <th className="py-2 px-3 text-right">Debit (₹)</th>
                          <th className="py-2 px-3 text-right">Credit (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {entry.lines.map((l) => (
                          <tr key={l.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                            <td className="py-2 px-3 font-semibold text-gray-900 dark:text-white print:text-black">{l.account?.name}</td>
                            <td className="py-2 px-3 text-gray-500 dark:text-gray-400 print:text-black">{l.partner?.name || '-'}</td>
                            <td className="py-2 px-3 text-gray-500 dark:text-gray-400 print:text-black">{l.analytic?.name || '-'}</td>
                            <td className="py-2 px-3 text-right font-mono text-emerald-700 dark:text-emerald-400 print:text-black">
                              {l.debit > 0 ? `₹${Number(l.debit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                            </td>
                            <td className="py-2 px-3 text-right font-mono text-rose-700 dark:text-rose-400 print:text-black">
                              {l.credit > 0 ? `₹${Number(l.credit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="font-bold border-t border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white print:text-black">
                        <tr>
                          <td colSpan={3} className="py-2 px-3 text-right uppercase text-[10px] text-gray-500 dark:text-gray-400">Total Entry:</td>
                          <td className="py-2 px-3 text-right font-mono text-emerald-700 dark:text-emerald-400 print:text-black">
                            ₹{entryTotalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-rose-700 dark:text-rose-400 print:text-black">
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
