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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Payments & Receipts Register</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">All registered Bank and Cash payments against Invoices & Vendor Bills</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/payments/new')}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover dark:bg-primary-dark dark:hover:bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded"
          >
            <Plus className="w-4 h-4" />
            <span>Register Payment</span>
          </button>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">Loading payments...</div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">No payment records found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300">
                <thead className="bg-gray-50 dark:bg-gray-800/60 text-[11px] uppercase text-gray-600 dark:text-gray-400 font-semibold tracking-wider border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-4 py-3">Payment Ref</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Linked Document</th>
                    <th className="px-4 py-3">Partner</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {payments.map((p) => {
                    const isReceipt = Boolean(p.invoice);
                    const partnerName = isReceipt
                      ? p.invoice?.salesOrder?.contact?.name
                      : p.vendorBill?.purchaseOrder?.contact?.name;
                    const docRef = isReceipt ? `INV/${p.invoiceId}` : `BILL/${p.vendorBillId}`;

                    return (
                      <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                        <td className="px-4 py-3 font-mono text-xs text-primary dark:text-primary-dark font-bold">PAY/# {p.id}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              isReceipt
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                                : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
                            }`}
                          >
                            {isReceipt ? 'Receipt (Customer)' : 'Payment (Vendor)'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-800 dark:text-gray-200 font-bold">{docRef}</td>
                        <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">{partnerName || '-'}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                            {p.method}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                          {new Date(p.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">
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
