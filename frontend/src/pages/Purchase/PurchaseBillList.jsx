import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { purchaseApi, paymentsApi } from '../../api/endpoints.js';
import Navbar from '../../components/Navbar.jsx';
import { FileText, ArrowLeft, CreditCard, Printer, Eye, Building2 } from 'lucide-react';

export default function PurchaseBillList() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('BANK');

  const navigate = useNavigate();

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await purchaseApi.listBills();
      setBills(res.data || []);
    } catch (err) {
      console.error('Error fetching vendor bills:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!selectedBill) return;
    try {
      await paymentsApi.payBill({
        vendorBillId: selectedBill.id,
        amount: parseFloat(payAmount),
        method: payMethod,
      });
      setShowPayModal(false);
      setSelectedBill(null);
      fetchBills();
    } catch (err) {
      alert(err.response?.data?.message || 'Payment failed');
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-md print:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/purchases')}
              className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Vendor Bills</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Bills created from converted Purchase Orders</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden print:hidden">
          {loading ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">Loading vendor bills...</div>
          ) : bills.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">No vendor bills found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300">
                <thead className="bg-gray-50 dark:bg-gray-800/60 text-[11px] uppercase text-gray-600 dark:text-gray-400 font-semibold tracking-wider border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-4 py-3">Bill Reference</th>
                    <th className="px-4 py-3">Purchase Order</th>
                    <th className="px-4 py-3">Vendor</th>
                    <th className="px-4 py-3">Bill Date</th>
                    <th className="px-4 py-3 text-right">Total Amount</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {bills.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary dark:text-primary-dark" />
                        <span>{b.billNumber || `BILL/${b.id}`}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">PO/# {b.purchaseOrderId}</td>
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">
                        {b.purchaseOrder?.contact?.name}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                        {new Date(b.billDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">
                        ₹{Number(b.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            b.status === 'UNPAID'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800'
                              : b.status === 'PARTIALLY_PAID'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedBill(b);
                              setShowViewModal(true);
                            }}
                            className="p-1.5 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                            title="View / Print Bill"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {b.status !== 'PAID' && (
                            <button
                              onClick={() => {
                                setSelectedBill(b);
                                setPayAmount(b.totalAmount);
                                setShowPayModal(true);
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 rounded bg-primary hover:bg-primary-hover dark:bg-primary-dark dark:hover:bg-primary text-white text-xs font-semibold"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Pay</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* View / Print Bill Modal */}
        {showViewModal && selectedBill && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 print:static print:bg-white print:p-0">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-6 max-w-2xl w-full space-y-6 print:border-none print:shadow-none print:bg-white print:text-black">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-800 pb-4 print:border-gray-300">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded bg-primary dark:bg-primary-dark flex items-center justify-center text-white font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white print:text-black">Urban Furniture System</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-600">Official Vendor Purchase Bill</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-primary dark:text-primary-dark print:text-gray-900">
                    {selectedBill.billNumber || `BILL/${selectedBill.id}`}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-600">
                    Date: {new Date(selectedBill.billDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Vendor Details */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md border border-gray-200 dark:border-gray-800 print:bg-gray-50 print:border-gray-200">
                <div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold uppercase print:text-gray-600">Vendor:</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white print:text-black">
                    {selectedBill.purchaseOrder?.contact?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-600">
                    {selectedBill.purchaseOrder?.contact?.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-600">
                    {selectedBill.purchaseOrder?.contact?.mobile}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold uppercase print:text-gray-600">Status:</p>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase border border-emerald-200 dark:border-emerald-800">
                    {selectedBill.status}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300 print:text-black">
                  <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-semibold uppercase text-[10px] print:bg-gray-100 print:text-black">
                    <tr>
                      <th className="px-4 py-2">Item Description</th>
                      <th className="px-4 py-2 text-right">Qty</th>
                      <th className="px-4 py-2 text-right">Unit Price (₹)</th>
                      <th className="px-4 py-2 text-right">Subtotal (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800 print:divide-gray-200">
                    {selectedBill.purchaseOrder?.lines?.map((line) => {
                      const sub = line.quantity * line.unitPrice;
                      return (
                        <tr key={line.id}>
                          <td className="px-4 py-2 font-medium text-gray-900 dark:text-white print:text-black">{line.product?.name}</td>
                          <td className="px-4 py-2 text-right font-mono">{line.quantity}</td>
                          <td className="px-4 py-2 text-right font-mono">₹{line.unitPrice}</td>
                          <td className="px-4 py-2 text-right font-mono font-bold text-gray-900 dark:text-white print:text-black">
                            ₹{sub.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="border-t border-gray-200 dark:border-gray-800 font-bold print:border-gray-300">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-right uppercase text-gray-500 dark:text-gray-400">Total Bill Amount:</td>
                      <td className="px-4 py-3 text-right text-sm font-extrabold text-primary dark:text-primary-dark print:text-black">
                        ₹{Number(selectedBill.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800 print:hidden">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-primary-hover dark:bg-primary-dark dark:hover:bg-primary text-white rounded text-xs font-semibold"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Bill PDF</span>
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pay Bill Modal */}
        {showPayModal && selectedBill && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-6 max-w-md w-full space-y-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Pay Vendor Bill</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Register payment for {selectedBill.billNumber || `BILL/${selectedBill.id}`} (Amount: ₹{Number(selectedBill.totalAmount).toLocaleString('en-IN')})
              </p>

              <form onSubmit={handlePaySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Payment Amount (Rs.) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-white font-bold focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                  >
                    <option value="BANK">Bank Transfer (Bank Journal)</option>
                    <option value="CASH">Cash (Cash Journal)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => setShowPayModal(false)}
                    className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-primary hover:bg-primary-hover dark:bg-primary-dark dark:hover:bg-primary text-white font-semibold rounded text-xs"
                  >
                    Confirm Payment
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
