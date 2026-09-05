import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productsApi } from '../../api/endpoints.js';
import Navbar from '../../components/Navbar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  ArrowLeft,
  Tag,
  DollarSign,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Archive,
  RotateCcw,
  Box,
  Wrench,
  Layers,
  Info
} from 'lucide-react';

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
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [form, setForm] = useState(emptyForm);
  const [productData, setProductData] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isEdit) {
      fetchProductDetails();
    }
  }, [id, isEdit]);

  const fetchProductDetails = async () => {
    try {
      const res = await productsApi.get(id);
      setProductData(res.data);
      setForm({
        name: res.data.name || '',
        type: res.data.type || 'GOODS',
        category: res.data.category || '',
        salesPrice: res.data.salesPrice !== undefined ? String(res.data.salesPrice) : '',
        cost: res.data.cost !== undefined ? String(res.data.cost) : '',
        imageUrl: res.data.imageUrl || '',
      });
    } catch (err) {
      console.error('Failed to load product:', err);
      setError('Failed to load product details.');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const validateForm = () => {
    if (!form.name.trim()) return 'Product name is required.';
    if (!['GOODS', 'SERVICE', 'COMBO'].includes(form.type)) return 'Invalid product type selected.';
    if (!form.category.trim()) return 'Category is required.';

    const salesNum = Number(form.salesPrice);
    if (form.salesPrice === '' || isNaN(salesNum) || salesNum < 0) {
      return 'Sales price must be a non-negative number (>= 0).';
    }

    const costNum = Number(form.cost);
    if (form.cost === '' || isNaN(costNum) || costNum < 0) {
      return 'Cost price must be a non-negative number (>= 0).';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const valErr = validateForm();
    if (valErr) {
      setError(valErr);
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await productsApi.update(id, form);
        setSuccessMsg('Product updated successfully!');
        fetchProductDetails();
      } else {
        const res = await productsApi.create(form);
        setSuccessMsg('Product created successfully!');
        setTimeout(() => navigate(`/products/${res.data.id}`), 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!window.confirm('Are you sure you want to archive this product?')) return;
    try {
      await productsApi.archive(id);
      fetchProductDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to archive product');
    }
  };

  const handleUnarchive = async () => {
    if (!window.confirm('Are you sure you want to restore/unarchive this product?')) return;
    try {
      await productsApi.unarchive(id);
      fetchProductDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to unarchive product');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16 transition-colors duration-200">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Yellow Header Banner matching Image 2/3 style */}
        <div className="bg-amber-100 border border-amber-300 rounded-xl px-6 py-2 text-center shadow-sm dark:bg-amber-500/10 dark:border-amber-500/30">
          <h2 className="text-base font-extrabold text-amber-900 dark:text-amber-300">Master Data: Product Master Form</h2>
          <p className="text-xs text-amber-800/80 dark:text-amber-400/80">
            Define product details, category, default sales price, and default purchase cost.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-xl p-6 sm:p-10 space-y-8">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    {isEdit ? form.name || 'Edit Product' : 'New Product Master'}
                  </h1>
                  {isEdit && productData && (
                    productData.archived ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400">
                        Archived
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400">
                        Active
                      </span>
                    )
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isEdit ? 'Update product prices & configuration' : 'Enter attributes to register product'}
                </p>
              </div>
            </div>

            {isEdit && isAdmin && (
              <div className="flex items-center gap-2">
                {productData?.archived ? (
                  <button
                    type="button"
                    onClick={handleUnarchive}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 text-xs font-bold transition"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Unarchive</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleArchive}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 text-xs font-bold transition"
                  >
                    <Archive className="w-4 h-4" />
                    <span>Archive Product</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl p-4 flex items-center gap-3 text-rose-700 dark:text-rose-400 text-xs font-semibold">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 rounded-xl p-4 flex items-center gap-3 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
              <Check className="w-5 h-5 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Product Image Preview */}
              <div className="md:col-span-1 space-y-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Product Image
                </label>
                <div className="bg-slate-50 dark:bg-slate-800/60 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 text-center flex flex-col items-center justify-center min-h-[180px]">
                  {form.imageUrl ? (
                    <img
                      src={form.imageUrl}
                      alt="Product Preview"
                      className="w-full h-36 rounded-xl object-cover border border-indigo-500/50 shadow-md"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400 mb-2">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">Paste image URL below</p>
                </div>
                <input
                  name="imageUrl"
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={form.imageUrl}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              {/* Product Form Fields */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Product Name *
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="e.g. Ergonomic Office Desk, Executive Chair"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Product Type *
                    </label>
                    <select
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-medium"
                    >
                      <option value="GOODS">Goods (Physical Stock)</option>
                      <option value="SERVICE">Service (Non-inventory)</option>
                      <option value="COMBO">Combo (Bundled Item)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Category *
                    </label>
                    <input
                      name="category"
                      type="text"
                      required
                      placeholder="e.g. Office, Living Room, Storage"
                      value={form.category}
                      onChange={handleChange}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                </div>

                {/* Info Callout for Product Type Behavior */}
                <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
                  <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
                  <div>
                    {form.type === 'GOODS' && (
                      <p>
                        <strong className="text-slate-900 dark:text-white">Goods</strong> affect physical inventory stock movements upon purchase bill or customer invoice receipt.
                      </p>
                    )}
                    {form.type === 'SERVICE' && (
                      <p>
                        <strong className="text-slate-900 dark:text-white">Service</strong> products do not create physical stock movements or track warehouse inventory quantity.
                      </p>
                    )}
                    {form.type === 'COMBO' && (
                      <p>
                        <strong className="text-slate-900 dark:text-white">Combo</strong> products represent bundled packages sold or purchased together.
                      </p>
                    )}
                  </div>
                </div>

                {/* Pricing Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div>
                    <label className="block text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1.5">
                      Default Sales Price (₹) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">₹</span>
                      <input
                        name="salesPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        placeholder="100.00"
                        value={form.salesPrice}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-sm text-slate-900 dark:text-white font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Populated automatically in Sales Orders.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                      Default Cost / Purchase Price (₹) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">₹</span>
                      <input
                        name="cost"
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        placeholder="50.00"
                        value={form.cost}
                        onChange={handleChange}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-sm text-slate-900 dark:text-white font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Populated automatically in Purchase Orders.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{isEdit ? 'Save Changes' : 'Create Product'}</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="px-6 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold transition"
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
