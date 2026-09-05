import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { salesApi, contactsApi, productsApi, analyticsApi } from '../../api/endpoints.js';
import Navbar from '../../components/Navbar.jsx';
import { ArrowLeft, Plus, Trash2, Check, ShoppingBag, AlertCircle } from 'lucide-react';

export default function SalesOrderForm() {
  const [contacts, setContacts] = useState([]);
  const [products, setProducts] = useState([]);
  const [analytics, setAnalytics] = useState([]);

  const [contactId, setContactId] = useState('');
  const [lines, setLines] = useState([
    { productId: '', quantity: 1, unitPrice: 0, taxPercent: 18, analyticId: '' },
  ]);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([contactsApi.list(), productsApi.list(), analyticsApi.list()]).then(
      ([cRes, pRes, anRes]) => {
        const custs = (cRes.data || []).filter((c) => c.type === 'CUSTOMER' || c.type === 'BOTH');
        setContacts(custs);
        setProducts(pRes.data || []);
        setAnalytics(anRes.data || []);

        if (custs.length > 0) setContactId(custs[0].id);
        if (pRes.data?.length > 0) {
          setLines([
            {
              productId: pRes.data[0].id,
              quantity: 5,
              unitPrice: Number(pRes.data[0].salesPrice),
              taxPercent: 18,
              analyticId: anRes.data?.[0]?.id || '',
            },
          ]);
        }
      }
    );
  }, []);

  const handleProductSelect = (index, prodId) => {
    const prod = products.find((p) => p.id === Number(prodId));
    const updated = [...lines];
    updated[index].productId = prodId;
    if (prod) {
      updated[index].unitPrice = Number(prod.salesPrice);
    }
    setLines(updated);
  };

  const handleLineChange = (index, field, val) => {
    const updated = [...lines];
    updated[index][field] = val;
    setLines(updated);
  };

  const addLine = () => {
    setLines([
      ...lines,
      {
        productId: products[0]?.id || '',
        quantity: 1,
        unitPrice: Number(products[0]?.salesPrice || 0),
        taxPercent: 18,
        analyticId: analytics[0]?.id || '',
      },
    ]);
  };

  const removeLine = (index) => {
    if (lines.length <= 1) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const subtotal = lines.reduce((s, l) => s + (parseFloat(l.quantity) || 0) * (parseFloat(l.unitPrice) || 0), 0);
  const taxTotal = lines.reduce(
    (s, l) =>
      s +
      (parseFloat(l.quantity) || 0) *
        (parseFloat(l.unitPrice) || 0) *
        ((parseFloat(l.taxPercent) || 0) / 100),
    0
  );
  const grandTotal = subtotal + taxTotal;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!contactId) {
      setError('Please select a customer');
      return;
    }
    setLoading(true);
    try {
      await salesApi.createOrder({
        contactId: Number(contactId),
        lines: lines.map((l) => ({
          productId: Number(l.productId),
          quantity: Number(l.quantity),
          unitPrice: parseFloat(l.unitPrice),
          taxPercent: parseFloat(l.taxPercent || 0),
          analyticId: l.analyticId ? Number(l.analyticId) : null,
        })),
      });
      navigate('/sales');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create sales order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-10 space-y-8">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate('/sales')}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-extrabold text-white">Create Sales Order</h1>
                <p className="text-xs text-slate-400">Select Customer, Products, Quantities, Unit Prices, and Taxes</p>
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
            
            {/* Customer Selection */}
            <div className="max-w-md">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Customer (Contact) *
              </label>
              <select
                required
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              >
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Line Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Order Line Items</h3>
                <button
                  type="button"
                  onClick={addLine}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product Line</span>
                </button>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800 text-slate-400 uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3 w-24">Quantity</th>
                      <th className="px-4 py-3 w-32">Unit Price (Rs.)</th>
                      <th className="px-4 py-3 w-24">Tax %</th>
                      <th className="px-4 py-3">Analytic Account</th>
                      <th className="px-4 py-3 text-right w-32">Line Total</th>
                      <th className="px-3 py-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {lines.map((l, idx) => {
                      const lineTotal =
                        (parseFloat(l.quantity) || 0) *
                        (parseFloat(l.unitPrice) || 0) *
                        (1 + (parseFloat(l.taxPercent) || 0) / 100);

                      return (
                        <tr key={idx} className="bg-slate-900">
                          <td className="p-3">
                            <select
                              required
                              value={l.productId}
                              onChange={(e) => handleProductSelect(idx, e.target.value)}
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:ring-1 focus:ring-indigo-500"
                            >
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} (₹{Number(p.salesPrice)})
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="p-3">
                            <input
                              type="number"
                              min="1"
                              required
                              value={l.quantity}
                              onChange={(e) => handleLineChange(idx, 'quantity', e.target.value)}
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold text-center focus:ring-1 focus:ring-indigo-500"
                            />
                          </td>

                          <td className="p-3">
                            <input
                              type="number"
                              step="0.01"
                              required
                              value={l.unitPrice}
                              onChange={(e) => handleLineChange(idx, 'unitPrice', e.target.value)}
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold text-right focus:ring-1 focus:ring-indigo-500"
                            />
                          </td>

                          <td className="p-3">
                            <input
                              type="number"
                              step="0.01"
                              value={l.taxPercent}
                              onChange={(e) => handleLineChange(idx, 'taxPercent', e.target.value)}
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white text-center focus:ring-1 focus:ring-indigo-500"
                            />
                          </td>

                          <td className="p-3">
                            <select
                              value={l.analyticId}
                              onChange={(e) => handleLineChange(idx, 'analyticId', e.target.value)}
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white focus:ring-1 focus:ring-indigo-500"
                            >
                              <option value="">-- None --</option>
                              {analytics.map((an) => (
                                <option key={an.id} value={an.id}>
                                  {an.name}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="p-3 text-right font-extrabold text-emerald-400">
                            ₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>

                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => removeLine(idx)}
                              className="p-1 text-slate-500 hover:text-red-400 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Calculations Summary Box */}
            <div className="flex justify-end">
              <div className="w-full sm:w-72 bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Subtotal:</span>
                  <span className="font-mono">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Tax Amount:</span>
                  <span className="font-mono">₹{taxTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-slate-700">
                  <span>Total Amount:</span>
                  <span className="text-emerald-400 font-mono">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-6 border-t border-slate-800">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>Create Sales Order</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/sales')}
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
