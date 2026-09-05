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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 pb-16">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-6 sm:p-8 space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/payments')}
                className="p-2 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Register Payment / Receipt</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Post bank or cash payment against customer invoice or vendor bill</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded p-3 flex items-center gap-3 text-red-700 dark:text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Target Type Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Transaction Target *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleTypeChange('INVOICE')}
                  className={`p-3 rounded-md border text-left ${
                    targetType === 'INVOICE'
                      ? 'bg-primary-light dark:bg-primary/20 border-primary text-primary dark:text-primary-dark font-semibold'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-750'
                  }`}
                >
                  <p className="font-bold text-sm">Customer Invoice Receipt</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Debit Cash/Bank, Credit Debtors</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleTypeChange('BILL')}
                  className={`p-3 rounded-md border text-left ${
                    targetType === 'BILL'
                      ? 'bg-primary-light dark:bg-primary/20 border-primary text-primary dark:text-primary-dark font-semibold'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-750'
                  }`}
                >
                  <p className="font-bold text-sm">Vendor Bill Payment</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Debit Creditors, Credit Cash/Bank</p>
                </button>
              </div>
            </div>

            {/* Document Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Select {targetType === 'INVOICE' ? 'Customer Invoice' : 'Vendor Bill'} *
              </label>
              {targetType === 'INVOICE' ? (
                <select
                  required
                  value={selectedId}
                  onChange={(e) => handleSelectChange(e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary"
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
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary"
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
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Payment Amount (Rs.) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-white font-bold focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Payment Method (Journal Target) *
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                >
                  <option value="BANK">Bank Transfer (Bank Journal)</option>
                  <option value="CASH">Cash Payment (Cash Journal)</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
              <button
                type="button"
                onClick={() => navigate('/payments')}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover dark:bg-primary-dark dark:hover:bg-primary text-white text-xs font-semibold px-4 py-1.5 rounded disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>Confirm Payment</span>
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}
