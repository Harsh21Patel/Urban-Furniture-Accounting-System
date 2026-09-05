import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { salesApi, purchaseApi, paymentsApi } from '../../api/endpoints.js';
import Navbar from '../../components/Navbar.jsx';
import { ArrowLeft, CreditCard, Check, AlertCircle } from 'lucide-react';

export default function PaymentForm() {
  const [targetType, setTargetType] = useState('INVOICE'); // 'INVOICE' or 'BILL'
  const [invoices, setInvoices] = useState([]);
  const [bills, setBills] = useState([]);

  const [selectedId, setSelectedId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('BANK');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([salesApi.listInvoices(), purchaseApi.listBills()]).then(([iRes, bRes]) => {
      const unpaidInvoices = (iRes.data || []).filter((i) => i.status !== 'PAID');
      const unpaidBills = (bRes.data || []).filter((b) => b.status !== 'PAID');

      setInvoices(unpaidInvoices);
      setBills(unpaidBills);

      if (unpaidInvoices.length > 0) {
        setSelectedId(unpaidInvoices[0].id);
        setAmount(unpaidInvoices[0].totalAmount);
      }
    });
  }, []);

  const handleTypeChange = (type) => {
    setTargetType(type);
    if (type === 'INVOICE' && invoices.length > 0) {
      setSelectedId(invoices[0].id);
      setAmount(invoices[0].totalAmount);
    } else if (type === 'BILL' && bills.length > 0) {
      setSelectedId(bills[0].id);
      setAmount(bills[0].totalAmount);
    }
  };

  const handleSelectChange = (id) => {
    setSelectedId(id);
    if (targetType === 'INVOICE') {
      const inv = invoices.find((i) => i.id === Number(id));
      if (inv) setAmount(inv.totalAmount);
    } else {
      const b = bills.find((item) => item.id === Number(id));
      if (b) setAmount(b.totalAmount);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedId) {
      setError('Please select an invoice or bill to pay');
      return;
    }
    setLoading(true);
    try {
      if (targetType === 'INVOICE') {
        await paymentsApi.payInvoice({
          invoiceId: Number(selectedId),
          amount: parseFloat(amount),
          method,
        });
      } else {
        await paymentsApi.payBill({
          vendorBillId: Number(selectedId),
          amount: parseFloat(amount),
          method,
        });
      }
      navigate('/payments');
    } catch (err) {
      setError(err.response?.data?.message || 'Payment registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-10 space-y-8">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate('/payments')}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-extrabold text-white">Register Payment / Receipt</h1>
                <p className="text-xs text-slate-400">Post bank or cash payment against customer invoice or vendor bill</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Target Type Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Transaction Target *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleTypeChange('INVOICE')}
                  className={`p-4 rounded-xl border text-left transition ${
                    targetType === 'INVOICE'
                      ? 'bg-emerald-600/20 border-emerald-500 text-white'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <p className="font-bold text-sm text-emerald-300">Customer Invoice Receipt</p>
                  <p className="text-xs text-slate-400 mt-1">Debit Cash/Bank, Credit Debtors</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleTypeChange('BILL')}
                  className={`p-4 rounded-xl border text-left transition ${
                    targetType === 'BILL'
                      ? 'bg-violet-600/20 border-violet-500 text-white'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <p className="font-bold text-sm text-violet-300">Vendor Bill Payment</p>
                  <p className="text-xs text-slate-400 mt-1">Debit Creditors, Credit Cash/Bank</p>
                </button>
              </div>
            </div>

            {/* Document Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Select {targetType === 'INVOICE' ? 'Customer Invoice' : 'Vendor Bill'} *
              </label>
              {targetType === 'INVOICE' ? (
                <select
                  required
                  value={selectedId}
                  onChange={(e) => handleSelectChange(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 transition"
                >
                  {invoices.length === 0 ? (
                    <option value="">-- No Unpaid Invoices --</option>
                  ) : (
                    invoices.map((i) => (
                      <option key={i.id} value={i.id}>
                        INV/{i.id} — {i.salesOrder?.contact?.name} (₹{Number(i.totalAmount).toLocaleString('en-IN')})
                      </option>
                    ))
                  )}
                </select>
              ) : (
                <select
                  required
                  value={selectedId}
                  onChange={(e) => handleSelectChange(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 transition"
                >
                  {bills.length === 0 ? (
                    <option value="">-- No Unpaid Bills --</option>
                  ) : (
                    bills.map((b) => (
                      <option key={b.id} value={b.id}>
                        BILL/{b.id} — {b.purchaseOrder?.contact?.name} (₹{Number(b.totalAmount).toLocaleString('en-IN')})
                      </option>
                    ))
                  )}
                </select>
              )}
            </div>

            {/* Amount & Method */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Payment Amount (Rs.) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-bold focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Payment Method (Journal Target) *
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 transition"
                >
                  <option value="BANK">Bank Transfer (Bank Journal)</option>
                  <option value="CASH">Cash Payment (Cash Journal)</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-6 border-t border-slate-800">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>Confirm Payment</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/payments')}
                className="px-6 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-semibold transition"
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}
