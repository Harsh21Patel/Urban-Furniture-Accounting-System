import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { salesApi, purchaseApi, paymentsApi } from '../../api/endpoints.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Navbar from '../../components/Navbar.jsx';
import { FileText, CreditCard, DollarSign, LogOut, Building2, CheckCircle2 } from 'lucide-react';

export default function ContactPortal() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('BANK');

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    // If there is no contactId linked, the server will return 403 — we don't fall back to all records.
    if (!user.contactId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Always send contactId from the authenticated user object.
      // The server ignores this param for CONTACT_USER and enforces its own filter,
      // but sending it keeps Admin/Accountant portal previews correct too.
      const [iRes, bRes] = await Promise.all([
        salesApi.listInvoices({ contactId: user.contactId }),
        purchaseApi.listBills({ contactId: user.contactId }),
      ]);
      setInvoices(iRes.data || []);
      setBills(bRes.data || []);
    } catch (err) {
      console.error('Error fetching portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoc) return;
    try {
      if (selectedDoc.type === 'INVOICE') {
        await paymentsApi.payInvoice({
          invoiceId: selectedDoc.id,
          amount: parseFloat(payAmount),
          method: payMethod,
        });
      } else {
        await paymentsApi.payBill({
          vendorBillId: selectedDoc.id,
          amount: parseFloat(payAmount),
          method: payMethod,
        });
      }
      setShowPayModal(false);
      setSelectedDoc(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Payment failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 border border-indigo-500/20 rounded-3xl p-6 sm:p-8 flex items-center justify-between shadow-2xl">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome, {user?.name || user?.loginId}
            </h1>
            <p className="text-sm text-slate-300">
              Customer Portal — View your statements, unpaid invoices/bills, and make direct payments.
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-extrabold text-xl shadow">
            {user?.name?.charAt(0) || 'U'}
          </div>
        </div>

        {/* Guard: no contactId linked */}
        {!user?.contactId && (
          <div className="bg-rose-900/30 border border-rose-500/30 rounded-2xl p-6 text-center text-rose-300 text-sm">
            <p className="font-bold text-rose-200 text-base mb-1">Portal Not Configured</p>
            <p>Your portal account is not linked to any contact record. Please contact an administrator to set up your access.</p>
          </div>
        )}

        {/* Customer Invoices Section */}
        {user?.contactId && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <span>My Invoices & Dues</span>
          </h2>

          {loading ? (
            <div className="text-center py-10 text-slate-400">Loading your statements...</div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">No invoices found for your account.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/80 text-xs uppercase text-slate-400 font-semibold tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-3.5">Invoice #</th>
                    <th className="px-6 py-3.5">Invoice Date</th>
                    <th className="px-6 py-3.5 text-right">Total Amount</th>
                    <th className="px-6 py-3.5 text-center">Status</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-800/50">
                      <td className="px-6 py-4 font-bold text-white">INV/{inv.id}</td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {new Date(inv.invoiceDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right font-extrabold text-emerald-400">
                        ₹{Number(inv.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            inv.status === 'PAID'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {inv.status !== 'PAID' ? (
                          <button
                            onClick={() => {
                              setSelectedDoc({ id: inv.id, type: 'INVOICE', amount: inv.totalAmount });
                              setPayAmount(inv.totalAmount);
                              setShowPayModal(true);
                            }}
                            className="flex items-center gap-1 ml-auto px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Pay Dues</span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Paid</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        )}

        {/* Vendor Bills Section (if vendor) */}
        {user?.contactId && bills.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-violet-400" />
              <span>My Vendor Bills</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/80 text-xs uppercase text-slate-400 font-semibold tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-3.5">Bill #</th>
                    <th className="px-6 py-3.5">Bill Date</th>
                    <th className="px-6 py-3.5 text-right">Total Amount</th>
                    <th className="px-6 py-3.5 text-center">Status</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {bills.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-800/50">
                      <td className="px-6 py-4 font-bold text-white">BILL/{b.id}</td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {new Date(b.billDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right font-extrabold text-violet-400">
                        ₹{Number(b.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            b.status === 'PAID'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {b.status !== 'PAID' ? (
                          <button
                            onClick={() => {
                              setSelectedDoc({ id: b.id, type: 'BILL', amount: b.totalAmount });
                              setPayAmount(b.totalAmount);
                              setShowPayModal(true);
                            }}
                            className="flex items-center gap-1 ml-auto px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition shadow"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Pay Bill</span>
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Paid</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal */}
        {showPayModal && selectedDoc && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
              <h2 className="text-xl font-bold text-white">Pay Dues</h2>
              <p className="text-xs text-slate-400">
                Direct portal payment for {selectedDoc.type === 'INVOICE' ? `INV/${selectedDoc.id}` : `BILL/${selectedDoc.id}`}
              </p>

              <form onSubmit={handlePaySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Amount (Rs.) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-bold focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 transition"
                  >
                    <option value="BANK">Bank Transfer</option>
                    <option value="CASH">Cash</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2.5 rounded-xl shadow-lg transition"
                  >
                    Confirm & Pay
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPayModal(false)}
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
