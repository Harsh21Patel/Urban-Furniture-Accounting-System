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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 pb-16">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-md px-4 py-2 text-center dark:bg-amber-900/20 dark:border-amber-800/40">
          <h2 className="text-sm font-bold text-amber-900 dark:text-amber-300">Master Data: Product Master Form</h2>
          <p className="text-xs text-amber-800/80 dark:text-amber-400/80">
            Define product details, category, default sales price, and default purchase cost.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-6 space-y-6">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="p-2 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    {isEdit ? form.name || 'Edit Product' : 'New Product Master'}
                  </h1>
                  {isEdit && productData && (
                    productData.archived ? (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400">
                        Archived
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                        Active
                      </span>
                    )
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
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
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 text-xs font-semibold"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Unarchive</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleArchive}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 text-xs font-semibold"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>Archive Product</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-md p-3 flex items-center gap-2.5 text-rose-700 dark:text-rose-400 text-xs font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-md p-3 flex items-center gap-2.5 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Product Image Preview */}
              <div className="md:col-span-1 space-y-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Product Image
                </label>
                <div className="bg-gray-50 dark:bg-gray-800/60 border border-dashed border-gray-300 dark:border-gray-700 rounded-md p-4 text-center flex flex-col items-center justify-center min-h-[160px]">
                  {form.imageUrl ? (
                    <img
                      src={form.imageUrl}
                      alt="Product Preview"
                      className="w-full h-32 rounded object-cover border border-gray-200 dark:border-gray-700"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 mb-2">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                  )}
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-2">Paste image URL below</p>
                </div>
                <input
                  name="imageUrl"
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={form.imageUrl}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Product Form Fields */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Product Name *
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="e.g. Ergonomic Office Desk, Executive Chair"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      Product Type *
                    </label>
                    <select
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                    >
                      <option value="GOODS">Goods (Physical Stock)</option>
                      <option value="SERVICE">Service (Non-inventory)</option>
                      <option value="COMBO">Combo (Bundled Item)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      Category *
                    </label>
                    <input
                      name="category"
                      type="text"
                      required
                      placeholder="e.g. Office, Living Room, Storage"
                      value={form.category}
                      onChange={handleChange}
                      className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Info Callout */}
                <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 rounded-md p-3 flex items-start gap-2.5 text-xs text-gray-600 dark:text-gray-400">
                  <Info className="w-4 h-4 text-primary dark:text-primary-dark flex-shrink-0 mt-0.5" />
                  <div>
                    {form.type === 'GOODS' && (
                      <p>
                        <strong className="text-gray-900 dark:text-white">Goods</strong> affect physical inventory stock movements upon purchase bill or customer invoice receipt.
                      </p>
                    )}
                    {form.type === 'SERVICE' && (
                      <p>
                        <strong className="text-gray-900 dark:text-white">Service</strong> products do not create physical stock movements or track warehouse inventory quantity.
                      </p>
                    )}
                    {form.type === 'COMBO' && (
                      <p>
                        <strong className="text-gray-900 dark:text-white">Combo</strong> products represent bundled packages sold or purchased together.
                      </p>
                    )}
                  </div>
                </div>

                {/* Pricing Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-800">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      Default Sales Price (₹) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">₹</span>
                      <input
                        name="salesPrice"
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        placeholder="100.00"
                        value={form.salesPrice}
                        onChange={handleChange}
                        className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded pl-7 pr-3 py-2 text-sm text-gray-900 dark:text-white font-bold placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Populated automatically in Sales Orders.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      Default Cost / Purchase Price (₹) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">₹</span>
                      <input
                        name="cost"
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        placeholder="50.00"
                        value={form.cost}
                        onChange={handleChange}
                        className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded pl-7 pr-3 py-2 text-sm text-gray-900 dark:text-white font-bold placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Populated automatically in Purchase Orders.</p>
                  </div>
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
                <span>{isEdit ? 'Save Changes' : 'Create Product'}</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="px-4 py-2 rounded border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-medium"
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
