import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentsApi } from '../../api/endpoints.js';
import Navbar from '../../components/Navbar.jsx';
import { CreditCard, Plus, ArrowLeft } from 'lucide-react';

export default function PaymentList() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await paymentsApi.list();
      setPayments(res.data || []);
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
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
              <h1 className="text-2xl font-extrabold text-white">Payments & Receipts Register</h1>
              <p className="text-xs text-slate-400">All registered Bank and Cash payments against Invoices & Vendor Bills</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/payments/new')}
            className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Register Payment</span>
          </button>
        </div>

        {/* Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="text-center py-16 text-slate-400">Loading payments...</div>
          ) : payments.length === 0 ? (
            <div className="text-center py-16 text-slate-400">No payment records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/80 text-xs uppercase text-slate-400 font-semibold tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Payment Ref</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Linked Document</th>
                    <th className="px-6 py-4">Partner</th>
                    <th className="px-6 py-4">Method</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {payments.map((p) => {
                    const isReceipt = Boolean(p.invoice);
                    const partnerName = isReceipt
                      ? p.invoice?.salesOrder?.contact?.name
                      : p.vendorBill?.purchaseOrder?.contact?.name;
                    const docRef = isReceipt ? `INV/${p.invoiceId}` : `BILL/${p.vendorBillId}`;

                    return (
                      <tr key={p.id} className="hover:bg-slate-800/50 transition">
                        <td className="px-6 py-4 font-mono text-xs text-indigo-400 font-bold">PAY/#{p.id}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase ${
                              isReceipt
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {isReceipt ? 'Receipt (Customer)' : 'Payment (Vendor)'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-300 font-bold">{docRef}</td>
                        <td className="px-6 py-4 font-bold text-white">{partnerName || '-'}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-xs font-semibold text-indigo-300">
                            {p.method}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400">
                          {new Date(p.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right font-extrabold text-emerald-400">
                          ₹{Number(p.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
