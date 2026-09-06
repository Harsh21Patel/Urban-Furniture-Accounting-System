import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportsApi, accountsApi } from '../../api/endpoints.js';
import Navbar from '../../components/Navbar.jsx';
import PrintLetterhead from '../../components/PrintLetterhead.jsx';
import { ArrowLeft, Calendar, Filter, Printer, BookOpen } from 'lucide-react';

export default function LedgerReport() {
  const [reportData, setReportData] = useState(null);
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
      setAccounts(res.data || []);
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
      setReportData(res.data);
    } catch (err) {
      console.error('Error fetching General Ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const isSingleAccount = !!selectedAccount && reportData?.account;
  const singleLines = reportData?.lines || [];
  const accountGroups = reportData?.accountGroups || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 pb-16 print:bg-white print:text-black">
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Print Letterhead */}
        <PrintLetterhead
          title="General Ledger Report"
          subtitle={[
            isSingleAccount ? reportData?.account?.name : 'All Accounts',
            dateFrom && dateTo
              ? `${new Date(dateFrom).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })} — ${new Date(dateTo).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}`
              : 'All Dates',
          ].join(' · ')}
        />
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
              <h1 className="text-xl font-bold text-gray-900 dark:text-white print:text-black">General Ledger Report</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-600">
                Detailed account ledger statement with per-account opening, debit, credit, and running balance
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
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Select Account</label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-primary"
            >
              <option value="">All Accounts (Grouped by Account)</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.type})
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

        {/* Ledger Content */}
        {loading ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-12 text-center text-gray-500 dark:text-gray-400 text-sm">
            Loading General Ledger...
          </div>
        ) : isSingleAccount ? (
          /* Single Account View */
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden print:border-gray-300 print:bg-white space-y-0">
            <div className="bg-gray-50 dark:bg-gray-800/60 px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4 print:bg-gray-100 print:text-black">
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white print:text-black">
                  {reportData.account.name}
                </h2>
                <span className="text-xs text-primary dark:text-primary-dark font-mono font-semibold">
                  Type: {reportData.account.type}
                </span>
              </div>
              <div className="flex items-center gap-6 text-xs font-mono">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Opening Balance: </span>
                  <span className="font-bold text-gray-900 dark:text-white print:text-black">
                    ₹{Number(reportData.openingBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Closing Balance: </span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 print:text-black">
                    ₹{Number(reportData.closingBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300 print:text-black">
                <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 uppercase font-semibold text-[10px] border-b border-gray-200 dark:border-gray-800 print:bg-gray-100 print:text-black">
                  <tr>
                    <th className="px-4 py-2.5">Date</th>
                    <th className="px-4 py-2.5">Reference</th>
                    <th className="px-4 py-2.5">Journal</th>
                    <th className="px-4 py-2.5">Partner</th>
                    <th className="px-4 py-2.5 text-right">Debit (₹)</th>
                    <th className="px-4 py-2.5 text-right">Credit (₹)</th>
                    <th className="px-4 py-2.5 text-right">Running Balance (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 print:divide-gray-200">
                  {/* Opening Balance Row */}
                  <tr className="bg-gray-50/50 dark:bg-gray-800/30 italic text-gray-500 dark:text-gray-400 font-medium">
                    <td className="px-4 py-2 font-mono">{dateFrom || '-'}</td>
                    <td colSpan={3} className="px-4 py-2">Opening Balance</td>
                    <td className="px-4 py-2 text-right">-</td>
                    <td className="px-4 py-2 text-right">-</td>
                    <td className="px-4 py-2 text-right font-mono font-bold text-gray-900 dark:text-white print:text-black">
                      ₹{Number(reportData.openingBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>

                  {singleLines.map((l) => (
                    <tr key={l.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                      <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400 font-mono print:text-black">
                        {new Date(l.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-gray-900 dark:text-white print:text-black">{l.reference || '-'}</td>
                      <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300 print:text-black">{l.journal}</td>
                      <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400 print:text-black">{l.partner || '-'}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-emerald-700 dark:text-emerald-400 print:text-black">
                        {l.debit > 0 ? `₹${l.debit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-rose-700 dark:text-rose-400 print:text-black">
                        {l.credit > 0 ? `₹${l.credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold text-gray-900 dark:text-white print:text-black">
                        ₹{l.runningBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 dark:bg-gray-800/80 font-bold border-t border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white print:bg-gray-100 print:text-black">
                  <tr>
                    <td colSpan={4} className="px-4 py-2.5 text-right uppercase text-gray-500 dark:text-gray-400">
                      Total Activity / Closing Balance:
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-emerald-700 dark:text-emerald-400 print:text-black">
                      ₹{singleLines.reduce((s, l) => s + Number(l.debit || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-rose-700 dark:text-rose-400 print:text-black">
                      ₹{singleLines.reduce((s, l) => s + Number(l.credit || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-extrabold text-emerald-700 dark:text-emerald-400 print:text-black">
                      ₹{Number(reportData.closingBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ) : (
          /* All Accounts */
          <div className="space-y-6">
            {accountGroups.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-12 text-center text-gray-500 dark:text-gray-400 text-sm">
                No ledger transactions found for the selected period.
              </div>
            ) : (
              accountGroups.map((grp) => (
                <div
                  key={grp.account.id}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden print:border-gray-300 print:bg-white print:break-inside-avoid"
                >
                  <div className="bg-gray-50 dark:bg-gray-800/60 px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4 print:bg-gray-100 print:text-black">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900 dark:text-white text-sm print:text-black">
                        {grp.account.name}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {grp.account.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-6 text-xs font-mono">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Opening: </span>
                        <span className="font-bold text-gray-900 dark:text-white print:text-black">
                          ₹{Number(grp.openingBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Closing: </span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 print:text-black">
                          ₹{Number(grp.closingBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300 print:text-black">
                      <thead className="bg-gray-50/50 dark:bg-gray-800/40 text-gray-600 dark:text-gray-400 uppercase font-semibold text-[10px] border-b border-gray-200 dark:border-gray-800 print:bg-gray-100 print:text-black">
                        <tr>
                          <th className="px-4 py-2.5">Date</th>
                          <th className="px-4 py-2.5">Reference</th>
                          <th className="px-4 py-2.5">Journal</th>
                          <th className="px-4 py-2.5">Partner</th>
                          <th className="px-4 py-2.5 text-right">Debit (₹)</th>
                          <th className="px-4 py-2.5 text-right">Credit (₹)</th>
                          <th className="px-4 py-2.5 text-right">Running Balance (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {grp.lines.map((l) => (
                          <tr key={l.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                            <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400 font-mono print:text-black">
                              {new Date(l.date).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-2.5 font-semibold text-gray-900 dark:text-white print:text-black">{l.reference || '-'}</td>
                            <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300 print:text-black">{l.journal}</td>
                            <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400 print:text-black">{l.partner || '-'}</td>
                            <td className="px-4 py-2.5 text-right font-mono text-emerald-700 dark:text-emerald-400 print:text-black">
                              {l.debit > 0 ? `₹${l.debit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                            </td>
                            <td className="px-4 py-2.5 text-right font-mono text-rose-700 dark:text-rose-400 print:text-black">
                              {l.credit > 0 ? `₹${l.credit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : '-'}
                            </td>
                            <td className="px-4 py-2.5 text-right font-mono font-bold text-gray-900 dark:text-white print:text-black">
                              ₹{l.runningBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50 dark:bg-gray-800/60 font-bold border-t border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-200 print:text-black">
                        <tr>
                          <td colSpan={4} className="px-4 py-2.5 text-right uppercase text-[10px] text-gray-500 dark:text-gray-400">Total:</td>
                          <td className="px-4 py-2.5 text-right font-mono text-emerald-700 dark:text-emerald-400 print:text-black">
                            ₹{grp.totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono text-rose-700 dark:text-rose-400 print:text-black">
                            ₹{grp.totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono text-emerald-700 dark:text-emerald-400 print:text-black">
                            ₹{Number(grp.closingBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}

