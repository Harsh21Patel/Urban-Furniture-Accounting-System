import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productsApi } from '../../api/endpoints.js';
import Navbar from '../../components/Navbar.jsx';
import { ArrowLeft, Tag, DollarSign, Image, Check, AlertCircle } from 'lucide-react';

const emptyForm = {
  name: '',
  type: 'GOODS',
  category: 'Furniture',
  salesPrice: '',
  cost: '',
  imageUrl: '',
};

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id) && id !== 'new';
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isEdit) {
      productsApi.get(id).then((res) => setForm(res.data)).catch(console.error);
    }
  }, [id, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) await productsApi.update(id, form);
      else await productsApi.create(form);
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-10 space-y-8">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-extrabold text-white">
                  {isEdit ? 'Product Master Form View' : 'New Product Master Form'}
                </h1>
                <p className="text-xs text-slate-400">Configure product catalog, sales prices, and purchase costs</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setForm(emptyForm)}
              className="px-3.5 py-1.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold transition"
            >
              New
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Product Image Preview */}
              <div className="md:col-span-1 space-y-3">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Upload Image (URL)
                </label>
                <div className="bg-slate-800/60 border-2 border-dashed border-slate-700 rounded-2xl p-4 text-center flex flex-col items-center justify-center min-h-[180px] relative">
                  {form.imageUrl ? (
                    <img
                      src={form.imageUrl}
                      alt="Product Preview"
                      className="w-full h-32 rounded-xl object-cover border border-indigo-500/50 shadow-lg"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-slate-700/50 flex items-center justify-center text-slate-400 mb-2">
                      <Image className="w-6 h-6" />
                    </div>
                  )}
                  <p className="text-[11px] text-slate-400 mt-2">Paste image URL below</p>
                </div>
                <input
                  name="imageUrl"
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={form.imageUrl}
                  onChange={handleChange}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              {/* Product Form Fields */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Product Name *
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="e.g., Office Chair, Wooden Table, Sofa"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Product Type *
                    </label>
                    <select
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    >
                      <option value="GOODS">Goods</option>
                      <option value="SERVICE">Service</option>
                      <option value="COMBO">Combo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Category *
                    </label>
                    <input
                      name="category"
                      type="text"
                      required
                      placeholder="e.g. Furniture, Living, Electronics"
                      value={form.category}
                      onChange={handleChange}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                  <div>
                    <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">
                      Sales Price (Rs.) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">₹</span>
                      <input
                        name="salesPrice"
                        type="number"
                        step="0.01"
                        required
                        placeholder="100.00"
                        value={form.salesPrice}
                        onChange={handleChange}
                        className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white font-bold placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Cost / Purchase Price (Rs.) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">₹</span>
                      <input
                        name="cost"
                        type="number"
                        step="0.01"
                        required
                        placeholder="50.00"
                        value={form.cost}
                        onChange={handleChange}
                        className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white font-bold placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      />
                    </div>
                  </div>
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
                <span>Confirm</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="px-6 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-semibold transition"
              >
                Back
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}
