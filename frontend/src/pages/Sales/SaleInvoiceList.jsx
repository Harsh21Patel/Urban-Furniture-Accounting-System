import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { salesApi, paymentsApi } from '../../api/endpoints.js';
import Navbar from '../../components/Navbar.jsx';
import { FileText, ArrowLeft, CreditCard, Printer, Eye, Building2 } from 'lucide-react';

export default function SaleInvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('BANK');

  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await salesApi.listInvoices();
      setInvoices(res.data || []);
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    try {
      await paymentsApi.payInvoice({
        invoiceId: selectedInvoice.id,
        amount: parseFloat(payAmount),
        method: payMethod,
      });
      setShowPayModal(false);
      setSelectedInvoice(null);
      fetchInvoices();
    } catch (err) {
      alert(err.response?.data?.message || 'Payment failed');
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl print:hidden">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/sales')}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Customer Sale Invoices</h1>
              <p className="text-xs text-slate-400">Generated invoices from confirmed Sales Orders</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl print:hidden">
          {loading ? (
            <div className="text-center py-16 text-slate-400">Loading invoices...</div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-16 text-slate-400">No invoices generated yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/80 text-xs uppercase text-slate-400 font-semibold tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Invoice Number</th>
                    <th className="px-6 py-4">Sales Order</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Invoice Date</th>
                    <th className="px-6 py-4 text-right">Total Amount</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-800/50 transition">
                      <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-400" />
                        <span>{inv.invoiceNumber || `INV/${inv.id}`}</span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-400">SO/#{inv.salesOrderId}</td>
                      <td className="px-6 py-4 font-semibold text-slate-200">
                        {inv.salesOrder?.contact?.name}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {new Date(inv.invoiceDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right font-extrabold text-emerald-400">
                        ₹{Number(inv.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            inv.status === 'UNPAID'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                              : inv.status === 'PARTIALLY_PAID'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setShowViewModal(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                            title="View / Print Invoice"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {inv.status !== 'PAID' && (
                            <button
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setPayAmount(inv.totalAmount);
                                setShowPayModal(true);
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition shadow"
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

        {/* View / Print Invoice Modal */}
        {showViewModal && selectedInvoice && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 print:static print:bg-white print:p-0">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 print:border-none print:shadow-none print:bg-white print:text-black">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-800 pb-4 print:border-slate-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white print:text-black">Urban Furniture System</h2>
                    <p className="text-xs text-slate-400 print:text-slate-600">Official Customer Sales Invoice</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-indigo-400 print:text-indigo-700">
                    {selectedInvoice.invoiceNumber || `INV/${selectedInvoice.id}`}
                  </span>
                  <p className="text-xs text-slate-400 print:text-slate-600">
                    Date: {new Date(selectedInvoice.invoiceDate).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Customer Details */}
              <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl print:bg-slate-50 print:border print:border-slate-200">
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase print:text-slate-600">Billed To:</p>
                  <p className="text-sm font-bold text-white print:text-black">
                    {selectedInvoice.salesOrder?.contact?.name}
                  </p>
                  <p className="text-xs text-slate-400 print:text-slate-600">
                    {selectedInvoice.salesOrder?.contact?.email}
                  </p>
                  <p className="text-xs text-slate-400 print:text-slate-600">
                    {selectedInvoice.salesOrder?.contact?.mobile}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase print:text-slate-600">Status:</p>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-xs uppercase">
                    {selectedInvoice.status}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300 print:text-black">
                  <thead className="bg-slate-800 text-slate-400 font-semibold uppercase text-[10px] print:bg-slate-100 print:text-black">
                    <tr>
                      <th className="px-4 py-2">Item Description</th>
                      <th className="px-4 py-2 text-right">Qty</th>
                      <th className="px-4 py-2 text-right">Unit Price (₹)</th>
                      <th className="px-4 py-2 text-right">Tax (%)</th>
                      <th className="px-4 py-2 text-right">Subtotal (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 print:divide-slate-200">
                    {selectedInvoice.salesOrder?.lines?.map((line) => {
                      const sub = line.quantity * line.unitPrice * (1 + line.taxPercent / 100);
                      return (
                        <tr key={line.id}>
                          <td className="px-4 py-2 font-medium text-white print:text-black">{line.product?.name}</td>
                          <td className="px-4 py-2 text-right font-mono">{line.quantity}</td>
                          <td className="px-4 py-2 text-right font-mono">₹{line.unitPrice}</td>
                          <td className="px-4 py-2 text-right font-mono">{line.taxPercent}%</td>
                          <td className="px-4 py-2 text-right font-mono font-bold text-white print:text-black">
                            ₹{sub.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="border-t border-slate-700 font-bold print:border-slate-300">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-right uppercase text-slate-400">Total Invoice Amount:</td>
                      <td className="px-4 py-3 text-right text-sm font-extrabold text-emerald-400 print:text-black">
                        ₹{Number(selectedInvoice.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 print:hidden">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Invoice PDF</span>
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 border border-slate-700 text-slate-300 hover:bg-slate-800 rounded-xl text-xs font-semibold transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Receive Payment Modal */}
        {showPayModal && selectedInvoice && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
              <h2 className="text-xl font-bold text-white">Receive Customer Payment</h2>
              <p className="text-xs text-slate-400">
                Register payment for {selectedInvoice.invoiceNumber || `INV/${selectedInvoice.id}`} (Amount: ₹{Number(selectedInvoice.totalAmount).toLocaleString('en-IN')})
              </p>

              <form onSubmit={handlePaySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Payment Amount (Rs.) *
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
                    <option value="BANK">Bank Transfer (Bank Journal)</option>
                    <option value="CASH">Cash (Cash Journal)</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-2.5 rounded-xl shadow-lg transition"
                  >
                    Confirm Payment
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
