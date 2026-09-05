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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 pb-12">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Welcome Header */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-5 flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Welcome, {user?.name || user?.loginId}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Customer Portal — View your statements, unpaid invoices/bills, and make direct payments.
            </p>
          </div>
          <div className="w-10 h-10 rounded bg-primary/10 dark:bg-primary-dark/20 text-primary dark:text-primary-dark flex items-center justify-center font-bold text-lg">
            {user?.name?.charAt(0) || 'U'}
          </div>
        </div>

        {/* Guard: no contactId linked */}
        {!user?.contactId && (
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-md p-5 text-center text-red-600 dark:text-red-400 text-xs">
            <p className="font-bold text-sm mb-1">Portal Not Configured</p>
            <p>Your portal account is not linked to any contact record. Please contact an administrator to set up your access.</p>
          </div>
        )}

        {/* Customer Invoices Section */}
        {user?.contactId && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-5 space-y-4">
          <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary dark:text-primary-dark" />
            <span>My Invoices & Dues</span>
          </h2>

          {loading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-xs">Loading your statements...</div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-xs">No invoices found for your account.</div>
          ) : (
            <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded">
              <table className="w-full text-left text-xs text-gray-800 dark:text-gray-200">
                <thead className="bg-gray-50 dark:bg-gray-800/60 text-xs uppercase text-gray-600 dark:text-gray-300 font-semibold tracking-wider border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-4 py-2.5">Invoice #</th>
                    <th className="px-4 py-2.5">Invoice Date</th>
                    <th className="px-4 py-2.5 text-right">Total Amount</th>
                    <th className="px-4 py-2.5 text-center">Status</th>
                    <th className="px-4 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                      <td className="px-4 py-2.5 font-bold text-gray-900 dark:text-white">INV/{inv.id}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400">
                        {new Date(inv.invoiceDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        ₹{Number(inv.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            inv.status === 'PAID'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                              : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {inv.status !== 'PAID' ? (
                          <button
                            onClick={() => {
                              setSelectedDoc({ id: inv.id, type: 'INVOICE', amount: inv.totalAmount });
                              setPayAmount(inv.totalAmount);
                              setShowPayModal(true);
                            }}
                            className="flex items-center gap-1 ml-auto px-3 py-1 rounded bg-primary hover:bg-primary-hover dark:bg-primary-dark dark:hover:bg-primary text-white text-xs font-medium"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Pay Dues</span>
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Paid</span>
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
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-5 space-y-4">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary dark:text-primary-dark" />
              <span>My Vendor Bills</span>
            </h2>

            <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded">
              <table className="w-full text-left text-xs text-gray-800 dark:text-gray-200">
                <thead className="bg-gray-50 dark:bg-gray-800/60 text-xs uppercase text-gray-600 dark:text-gray-300 font-semibold tracking-wider border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-4 py-2.5">Bill #</th>
                    <th className="px-4 py-2.5">Bill Date</th>
                    <th className="px-4 py-2.5 text-right">Total Amount</th>
                    <th className="px-4 py-2.5 text-center">Status</th>
                    <th className="px-4 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {bills.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                      <td className="px-4 py-2.5 font-bold text-gray-900 dark:text-white">BILL/{b.id}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400">
                        {new Date(b.billDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2.5 text-right font-bold text-primary dark:text-primary-dark font-mono">
                        ₹{Number(b.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            b.status === 'PAID'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                              : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {b.status !== 'PAID' ? (
                          <button
                            onClick={() => {
                              setSelectedDoc({ id: b.id, type: 'BILL', amount: b.totalAmount });
                              setPayAmount(b.totalAmount);
                              setShowPayModal(true);
                            }}
                            className="flex items-center gap-1 ml-auto px-3 py-1 rounded bg-primary hover:bg-primary-hover dark:bg-primary-dark dark:hover:bg-primary text-white text-xs font-medium"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Pay Bill</span>
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Paid</span>
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
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-6 max-w-md w-full space-y-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Pay Dues</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Direct portal payment for {selectedDoc.type === 'INVOICE' ? `INV/${selectedDoc.id}` : `BILL/${selectedDoc.id}`}
              </p>

              <form onSubmit={handlePaySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Amount (Rs.) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-white font-bold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="BANK">Bank Transfer</option>
                    <option value="CASH">Cash</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                  <button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary-hover dark:bg-primary-dark dark:hover:bg-primary text-white font-medium py-2 rounded text-sm"
                  >
                    Confirm & Pay
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPayModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded text-sm font-medium"
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
