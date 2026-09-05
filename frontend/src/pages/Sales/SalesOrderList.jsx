import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { salesApi, paymentsApi } from '../../api/endpoints.js';
import Navbar from '../../components/Navbar.jsx';
import { ShoppingBag, Plus, ArrowLeft, CheckCircle2, FileText, CreditCard, DollarSign } from 'lucide-react';

export default function SalesOrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('BANK');

  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await salesApi.listOrders();
      setOrders(res.data || []);
    } catch (err) {
      console.error('Error fetching sales orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id) => {
    try {
      await salesApi.confirmOrder(id);
      fetchOrders();
    } catch (err) {
      alert('Failed to confirm sales order');
    }
  };

  const handleGenerateInvoice = async (id) => {
    try {
      await salesApi.generateInvoice(id, {});
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate invoice');
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
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Payment failed');
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
              <h1 className="text-2xl font-extrabold text-white">Sales Orders (SO)</h1>
              <p className="text-xs text-slate-400">Order processing: Create SO → Confirm → Generate Invoice → Payment</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/sales/invoices')}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Customer Invoices</span>
            </button>

            <button
              onClick={() => navigate('/sales/new')}
              className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Sales Order</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="text-center py-16 text-slate-400">Loading sales orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 text-slate-400">No sales orders found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/80 text-xs uppercase text-slate-400 font-semibold tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Order Items</th>
                    <th className="px-6 py-4 text-right">Total Amount</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {orders.map((o) => {
                    const totalAmt = o.lines?.reduce(
                      (s, l) => s + Number(l.unitPrice) * l.quantity * (1 + Number(l.taxPercent) / 100),
                      0
                    ) || 0;

                    return (
                      <tr key={o.id} className="hover:bg-slate-800/50 transition">
                        <td className="px-6 py-4 font-mono text-xs text-indigo-400 font-bold">SO/#{o.id}</td>
                        <td className="px-6 py-4 font-bold text-white flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-indigo-400" />
                          <span>{o.contact?.name}</span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400">
                          {new Date(o.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-300">
                          {o.lines?.map((l) => `${l.product?.name} (x${l.quantity})`).join(', ')}
                        </td>
                        <td className="px-6 py-4 text-right font-extrabold text-emerald-400">
                          ₹{totalAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                              o.status === 'DRAFT'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                : o.status === 'CONFIRMED'
                                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {o.status === 'DRAFT' && (
                              <button
                                onClick={() => handleConfirm(o.id)}
                                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow"
                              >
                                Confirm
                              </button>
                            )}

                            {o.status === 'CONFIRMED' && (
                              <button
                                onClick={() => handleGenerateInvoice(o.id)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow"
                              >
                                Generate Invoice
                              </button>
                            )}

                            {o.status === 'INVOICED' && o.invoice && (
                              o.invoice.status === 'PAID' ? (
                                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                                  PAID (INV/{o.invoice.id})
                                </span>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedInvoice(o.invoice);
                                    setPayAmount(o.invoice.totalAmount);
                                    setShowPayModal(true);
                                  }}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition shadow"
                                >
                                  <CreditCard className="w-3.5 h-3.5" />
                                  <span>Pay Invoice</span>
                                </button>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payment Modal */}
        {showPayModal && selectedInvoice && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-in fade-in zoom-in-95">
              <h2 className="text-xl font-bold text-white">Receive Customer Payment</h2>
              <p className="text-xs text-slate-400">
                Register payment against Customer Invoice INV/{selectedInvoice.id} (Total: ₹{Number(selectedInvoice.totalAmount).toLocaleString('en-IN')})
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
                    Payment Method (Journal Target) *
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
                    Register Payment
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
