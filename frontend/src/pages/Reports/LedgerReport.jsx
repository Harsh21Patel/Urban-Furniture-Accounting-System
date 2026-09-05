import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportsApi, accountsApi } from '../../api/endpoints.js';
import Navbar from '../../components/Navbar.jsx';
import { ArrowLeft, Calendar, Filter, Printer, BookOpen } from 'lucide-react';

export default function LedgerReport() {
  const [lines, setLines] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    fetchLedger();
  }, [selectedAccount, dateFrom, dateTo]);

  const loadAccounts = async () => {
    try {
      const res = await accountsApi.list();
      setAccounts(res.data);
    } catch (err) {
      console.error('Error fetching accounts:', err);
    }
  };

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedAccount) params.accountId = selectedAccount;
      if (dateFrom) params.from = dateFrom;
      if (dateTo) params.to = dateTo;

      const res = await reportsApi.ledgerReport(params);
      setLines(res.data);
    } catch (err) {
      console.error('Error fetching General Ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const totalDebit = lines.reduce((s, l) => s + Number(l.debit || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + Number(l.credit || 0), 0);

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
              <h1 className="text-2xl font-extrabold text-white print:text-black">General Ledger Report</h1>
              <p className="text-xs text-slate-400 print:text-slate-600">
                Detailed account ledger statement with debit, credit, and running balance
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
            <label className="block text-xs font-semibold text-slate-400 mb-1">Select Account</label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">All Accounts</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.type})
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

        {/* Ledger Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl print:border-black print:bg-white">
          {loading ? (
            <div className="text-center py-16 text-slate-400">Loading General Ledger...</div>
          ) : lines.length === 0 ? (
            <div className="text-center py-16 text-slate-400">No ledger entries found for selected criteria.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 print:text-black">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-800 print:bg-slate-100 print:text-black">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Journal</th>
                    <th className="px-4 py-3">Account</th>
                    <th className="px-4 py-3">Partner</th>
                    <th className="px-4 py-3 text-right">Debit (₹)</th>
                    <th className="px-4 py-3 text-right">Credit (₹)</th>
                    <th className="px-4 py-3 text-right">Balance (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 print:divide-slate-200">
                  {lines.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-800/30 transition">
                      <td className="px-4 py-3 text-slate-400 font-mono print:text-black">
                        {new Date(l.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-semibold text-white print:text-black">{l.reference || '-'}</td>
                      <td className="px-4 py-3 text-slate-300 print:text-black">{l.journal}</td>
                      <td className="px-4 py-3 font-medium text-indigo-400 print:text-black">{l.account}</td>
                      <td className="px-4 py-3 text-slate-400 print:text-black">{l.partner || '-'}</td>
                      <td className="px-4 py-3 text-right font-mono text-emerald-400 print:text-black">
                        {l.debit > 0 ? `₹${l.debit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-rose-400 print:text-black">
                        {l.credit > 0 ? `₹${l.credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-white print:text-black">
                        ₹{l.runningBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-950 font-bold border-t border-slate-800 text-white print:bg-slate-100 print:text-black">
                  <tr>
                    <td colSpan={5} className="px-4 py-3 text-right uppercase text-slate-400">Total:</td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-400 print:text-black">
                      ₹{totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-rose-400 print:text-black">
                      ₹{totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
