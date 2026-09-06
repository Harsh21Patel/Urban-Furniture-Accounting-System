import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsApi } from '../../api/endpoints.js';
import Navbar from '../../components/Navbar.jsx';
import ConfirmModal from '../../components/ConfirmModal.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  LayoutList,
  LayoutGrid,
  Plus,
  Search,
  ArrowLeft,
  Archive,
  RotateCcw,
  Tag,
  Filter,
  Eye,
  Box,
  Wrench,
  Layers
} from 'lucide-react';

export default function ProductList() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [products, setProducts] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL'); // 'ALL', 'GOODS', 'SERVICE', 'COMBO'
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    product: null,
    actionType: 'archive',
    loading: false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, [showArchived]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productsApi.list({ includeArchived: showArchived });
      setProducts(res.data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const openArchiveModal = (product, e) => {
    if (e) e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      product,
      actionType: 'archive',
      loading: false,
    });
  };

  const openUnarchiveModal = (product, e) => {
    if (e) e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      product,
      actionType: 'unarchive',
      loading: false,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmModal.product) return;
    setConfirmModal((prev) => ({ ...prev, loading: true }));
    try {
      if (confirmModal.actionType === 'archive') {
        await productsApi.archive(confirmModal.product.id);
      } else {
        await productsApi.unarchive(confirmModal.product.id);
      }
      setConfirmModal({ isOpen: false, product: null, actionType: 'archive', loading: false });
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${confirmModal.actionType} product`);
      setConfirmModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.type.toLowerCase().includes(q);

    const matchesType = typeFilter === 'ALL' || p.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTypeBadge = (type) => {
    switch (type) {
      case 'GOODS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
            <Box className="w-3 h-3" />
            <span>Goods</span>
          </span>
        );
      case 'SERVICE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-primary/10 text-primary dark:bg-primary-dark/20 dark:text-primary-dark border border-primary/20">
            <Wrench className="w-3 h-3" />
            <span>Service</span>
          </span>
        );
      case 'COMBO':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
            <Layers className="w-3 h-3" />
            <span>Combo</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-4">
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Product Master</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Manage catalog goods, prices, categories, and services</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => navigate('/products/new')}
                className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover dark:bg-primary-dark text-white text-xs font-semibold px-3 py-2 rounded transition"
              >
                <Plus className="w-4 h-4" />
                <span>New Product</span>
              </button>
            )}

            <div className="flex items-center bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-1">
              <button
                onClick={() => setViewMode('list')}
                title="List View"
                className={`p-1.5 rounded text-xs transition ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-700 text-primary dark:text-primary-dark shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                title="Kanban View"
                className={`p-1.5 rounded text-xs transition ${
                  viewMode === 'kanban'
                    ? 'bg-white dark:bg-gray-700 text-primary dark:text-primary-dark shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter / Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 rounded-md">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2 py-1">
              <Filter className="w-3.5 h-3.5 text-gray-500" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-transparent text-xs text-gray-700 dark:text-gray-300 focus:outline-none"
              >
                <option value="ALL">All Types</option>
                <option value="GOODS">Goods Only</option>
                <option value="SERVICE">Service Only</option>
                <option value="COMBO">Combo Only</option>
              </select>
            </div>

            <label className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 cursor-pointer select-none bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2.5 py-1">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
                className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
              />
              <span>Show Archived</span>
            </label>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-12 text-center text-xs text-gray-500 dark:text-gray-400">
            Loading products...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-12 text-center text-xs text-gray-500 dark:text-gray-400">
            No products found.
          </div>
        ) : viewMode === 'list' ? (
          /* List View Table */
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300">
                <thead className="bg-gray-50 dark:bg-gray-800/60 uppercase text-[11px] text-gray-600 dark:text-gray-400 font-semibold border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-4 py-2.5 w-12">Image</th>
                    <th className="px-4 py-2.5">Product Name</th>
                    <th className="px-4 py-2.5">Category</th>
                    <th className="px-4 py-2.5">Type</th>
                    <th className="px-4 py-2.5">Sales Price</th>
                    <th className="px-4 py-2.5">Cost Price</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {filtered.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => navigate(`/products/${p.id}`)}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/40 cursor-pointer"
                    >
                      <td className="px-4 py-2">
                        <img
                          src={p.imageUrl || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100'}
                          alt={p.name}
                          className="w-7 h-7 rounded object-cover border border-gray-200 dark:border-gray-700"
                        />
                      </td>
                      <td className="px-4 py-2 font-bold text-gray-900 dark:text-white">{p.name}</td>
                      <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{p.category}</td>
                      <td className="px-4 py-2">{getTypeBadge(p.type)}</td>
                      <td className="px-4 py-2 font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        ₹{Number(p.salesPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-2 text-gray-600 dark:text-gray-400 font-mono">
                        ₹{Number(p.cost).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-2">
                        {p.archived ? (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800/60">
                            Archived
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/products/${p.id}`)}
                          title="View / Edit Product"
                          className="p-1 text-gray-400 hover:text-primary dark:hover:text-primary-dark rounded"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {p.archived ? (
                          isAdmin && (
                            <button
                              onClick={(e) => openUnarchiveModal(p, e)}
                              title="Restore / Unarchive Product"
                              className="p-1 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )
                        ) : (
                          <button
                            onClick={(e) => openArchiveModal(p, e)}
                            title="Archive Product"
                            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Kanban View Cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/products/${p.id}`)}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-md p-4 cursor-pointer flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2.5">
                  <div className="relative">
                    <img
                      src={p.imageUrl || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200'}
                      alt={p.name}
                      className="w-full h-32 rounded object-cover border border-gray-200 dark:border-gray-800"
                    />
                    {p.archived && (
                      <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase bg-red-600 text-white">
                        Archived
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">{p.name}</h3>
                    <div className="flex items-center justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 text-primary dark:text-primary-dark" />
                        <span className="truncate">{p.category}</span>
                      </div>
                      {getTypeBadge(p.type)}
                    </div>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs">
                  <div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-medium">Sales Price</p>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm font-mono">
                      ₹{Number(p.salesPrice).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <div>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-medium">Cost Price</p>
                      <p className="font-bold text-gray-700 dark:text-gray-300 font-mono">
                        ₹{Number(p.cost).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      {p.archived ? (
                        isAdmin && (
                          <button
                            onClick={(e) => openUnarchiveModal(p, e)}
                            title="Unarchive Product"
                            className="p-1 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )
                      ) : (
                        <button
                          onClick={(e) => openArchiveModal(p, e)}
                          title="Archive Product"
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, product: null, actionType: 'archive', loading: false })}
        onConfirm={handleConfirmAction}
        loading={confirmModal.loading}
        title={confirmModal.actionType === 'archive' ? 'Archive Product' : 'Restore Product'}
        message={
          confirmModal.actionType === 'archive'
            ? `Are you sure you want to archive "${confirmModal.product?.name}"? You can view or restore archived products at any time.`
            : `Are you sure you want to restore "${confirmModal.product?.name}"?`
        }
        confirmText={confirmModal.actionType === 'archive' ? 'Archive' : 'Restore'}
        variant={confirmModal.actionType === 'archive' ? 'danger' : 'info'}
        icon={confirmModal.actionType === 'archive' ? Archive : RotateCcw}
      />
    </div>
  );
}
