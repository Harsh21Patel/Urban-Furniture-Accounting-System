import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { purchaseApi, contactsApi, productsApi, analyticsApi } from '../../api/endpoints.js';
import Navbar from '../../components/Navbar.jsx';
import { ArrowLeft, Plus, Trash2, Check, ShoppingCart, AlertCircle } from 'lucide-react';

export default function PurchaseOrderForm() {
  const [vendors, setVendors] = useState([]);
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
        const vends = (cRes.data || []).filter((c) => c.type === 'VENDOR' || c.type === 'BOTH');
        setVendors(vends);
        setProducts(pRes.data || []);
        setAnalytics(anRes.data || []);

        if (vends.length > 0) setContactId(vends[0].id);
        if (pRes.data?.length > 0) {
          setLines([
            {
              productId: pRes.data[0].id,
              quantity: 2,
              unitPrice: Number(pRes.data[0].cost),
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
      updated[index].unitPrice = Number(prod.cost);
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
        unitPrice: Number(products[0]?.cost || 0),
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
      setError('Please select a vendor');
      return;
    }
    setLoading(true);
    try {
      await purchaseApi.createOrder({
        contactId: Number(contactId),
        lines: lines.map((l) => ({
          productId: Number(l.productId),
          quantity: Number(l.quantity),
          unitPrice: parseFloat(l.unitPrice),
          taxPercent: parseFloat(l.taxPercent || 0),
          analyticId: l.analyticId ? Number(l.analyticId) : null,
        })),
      });
      navigate('/purchases');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create purchase order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 pb-16">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-6 space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/purchases')}
                className="p-2 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Create Purchase Order</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Select Vendor, Products, Quantities, and Purchase Unit Costs</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-md p-3 flex items-center gap-2.5 text-rose-700 dark:text-rose-400 text-xs font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Vendor Selection */}
            <div className="max-w-md">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Vendor (Contact) *
              </label>
              <select
                required
                value={contactId}
                onChange={(e) => setContactId(e.target.value)}
                className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
              >
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Line Items */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Purchase Order Items</h3>
                <button
                  type="button"
                  onClick={addLine}
                  className="text-xs font-semibold text-primary dark:text-primary-dark hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Purchase Line</span>
                </button>
              </div>

              <div className="border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden">
                <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300">
                  <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 uppercase font-semibold text-[11px]">
                    <tr>
                      <th className="px-3 py-2">Product</th>
                      <th className="px-3 py-2 w-24">Quantity</th>
                      <th className="px-3 py-2 w-32">Unit Cost (Rs.)</th>
                      <th className="px-3 py-2 w-20">Tax %</th>
                      <th className="px-3 py-2">Analytic Account</th>
                      <th className="px-3 py-2 text-right w-32">Line Total</th>
                      <th className="px-2 py-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {lines.map((l, idx) => {
                      const lineTotal =
                        (parseFloat(l.quantity) || 0) *
                        (parseFloat(l.unitPrice) || 0) *
                        (1 + (parseFloat(l.taxPercent) || 0) / 100);

                      return (
                        <tr key={idx} className="bg-white dark:bg-gray-900">
                          <td className="p-1.5">
                            <select
                              required
                              value={l.productId}
                              onChange={(e) => handleProductSelect(idx, e.target.value)}
                              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                            >
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} (Cost: ₹{Number(p.cost)})
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="p-1.5">
                            <input
                              type="number"
                              min="1"
                              required
                              value={l.quantity}
                              onChange={(e) => handleLineChange(idx, 'quantity', e.target.value)}
                              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-xs text-gray-900 dark:text-white font-bold text-center focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                          </td>

                          <td className="p-1.5">
                            <input
                              type="number"
                              step="0.01"
                              required
                              value={l.unitPrice}
                              onChange={(e) => handleLineChange(idx, 'unitPrice', e.target.value)}
                              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-xs text-gray-900 dark:text-white font-bold text-right focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                          </td>

                          <td className="p-1.5">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={l.taxPercent}
                              onChange={(e) => handleLineChange(idx, 'taxPercent', e.target.value)}
                              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-xs text-gray-900 dark:text-white text-center focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                          </td>

                          <td className="p-1.5">
                            <select
                              value={l.analyticId}
                              onChange={(e) => handleLineChange(idx, 'analyticId', e.target.value)}
                              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            >
                              <option value="">-- None --</option>
                              {analytics.map((an) => (
                                <option key={an.id} value={an.id}>
                                  {an.name}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="px-3 py-2 text-right font-bold text-primary dark:text-primary-dark font-mono">
                            ₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>

                          <td className="p-1.5 text-center">
                            <button
                              type="button"
                              onClick={() => removeLine(idx)}
                              className="p-1 text-gray-400 hover:text-rose-600 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
              <div className="w-full sm:w-72 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-800 rounded-md p-3 space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Subtotal:</span>
                  <span className="font-mono">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500 dark:text-gray-400">
                  <span>Tax Amount:</span>
                  <span className="font-mono">₹{taxTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-gray-900 dark:text-white pt-1.5 border-t border-gray-200 dark:border-gray-700">
                  <span>Grand Total (Billable):</span>
                  <span className="text-primary dark:text-primary-dark font-mono font-extrabold">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover dark:bg-primary-dark text-white text-xs font-semibold px-4 py-2 rounded transition disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Create Purchase Order</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/purchases')}
                className="px-4 py-2 rounded border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-medium"
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
