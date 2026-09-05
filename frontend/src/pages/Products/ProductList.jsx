import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsApi } from '../../api/endpoints.js';
import Navbar from '../../components/Navbar.jsx';
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
  ChevronLeft,
  ChevronRight,
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
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;
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

  const handleArchive = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to archive this product?')) return;
    try {
      await productsApi.archive(id);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to archive product');
    }
  };

  const handleUnarchive = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to restore/unarchive this product?')) return;
    try {
      await productsApi.unarchive(id);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to unarchive product');
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

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedProducts = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const getTypeBadge = (type) => {
    switch (type) {
      case 'GOODS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
            <Box className="w-3 h-3" />
            <span>Goods</span>
          </span>
        );
      case 'SERVICE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase bg-sky-100 text-sky-800 dark:bg-sky-500/10 dark:text-sky-400 border border-sky-200 dark:border-sky-500/20">
            <Wrench className="w-3 h-3" />
            <span>Service</span>
          </span>
        );
      case 'COMBO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase bg-purple-100 text-purple-800 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
            <Layers className="w-3 h-3" />
            <span>Combo</span>
          </span>
        );
      default:
        return <span className="text-xs">{type}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16 transition-colors duration-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Master Data Title Yellow Banner matching Image 2/3 */}
        <div className="bg-amber-100 border border-amber-300 rounded-xl px-6 py-2.5 text-center shadow-sm dark:bg-amber-500/10 dark:border-amber-500/30">
          <h2 className="text-base font-extrabold text-amber-900 dark:text-amber-300">Master Data: Product Master</h2>
          <p className="text-xs text-amber-800/80 dark:text-amber-400/80">
            Default List View & Kanban View toggle. Product Types: Goods (Physical Stock), Service (Non-inventory), Combo.
          </p>
        </div>

        {/* Controls Container */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm dark:shadow-xl">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Product Master</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {filtered.length} {filtered.length === 1 ? 'Product' : 'Products'} found
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search product name or category..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-44 sm:w-56 transition"
              />
            </div>

            {/* Filter by Type */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-2 py-1 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent text-slate-700 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="dark:bg-slate-900">All Types</option>
                <option value="GOODS" className="dark:bg-slate-900">Goods</option>
                <option value="SERVICE" className="dark:bg-slate-900">Service</option>
                <option value="COMBO" className="dark:bg-slate-900">Combo</option>
              </select>
            </div>

            {/* Show Archived Toggle */}
            <label className="flex items-center gap-2 cursor-pointer bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => {
                  setShowArchived(e.target.checked);
                  setPage(1);
                }}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Include Archived</span>
            </label>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'list'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="List View"
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'kanban'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Kanban View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            {/* New Button */}
            <button
              onClick={() => navigate('/products/new')}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>New</span>
            </button>
          </div>
        </div>

        {/* Content View */}
        {loading ? (
          <div className="text-center py-16 text-slate-500 dark:text-slate-400">Loading products...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 dark:text-slate-400">
            No products found matching your search.
          </div>
        ) : viewMode === 'list' ? (
          /* List View Table */
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-100 dark:bg-slate-800/80 text-xs uppercase text-slate-600 dark:text-slate-400 font-semibold tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Image</th>
                    <th className="px-6 py-4">Product Name</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Sales Price</th>
                    <th className="px-6 py-4">Cost Price</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {paginatedProducts.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => navigate(`/products/${p.id}`)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition"
                    >
                      <td className="px-6 py-3.5">
                        <img
                          src={p.imageUrl || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100'}
                          alt={p.name}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                        />
                      </td>
                      <td className="px-6 py-3.5 font-semibold text-slate-900 dark:text-white">{p.name}</td>
                      <td className="px-6 py-3.5 text-slate-600 dark:text-slate-300">{p.category}</td>
                      <td className="px-6 py-3.5">{getTypeBadge(p.type)}</td>
                      <td className="px-6 py-3.5 font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        ₹{Number(p.salesPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-3.5 text-slate-600 dark:text-slate-400 font-mono">
                        ₹{Number(p.cost).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-3.5">
                        {p.archived ? (
                          <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400">
                            Archived
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => navigate(`/products/${p.id}`)}
                          title="View / Edit Product"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {p.archived ? (
                          isAdmin && (
                            <button
                              onClick={(e) => handleUnarchive(p.id, e)}
                              title="Restore / Unarchive Product"
                              className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg transition"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )
                        ) : (
                          <button
                            onClick={(e) => handleArchive(p.id, e)}
                            title="Archive Product"
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition"
                          >
                            <Archive className="w-4 h-4" />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginatedProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/products/${p.id}`)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 rounded-2xl p-5 shadow-sm dark:shadow-xl hover:scale-[1.01] transition cursor-pointer flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="relative">
                    <img
                      src={p.imageUrl || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200'}
                      alt={p.name}
                      className="w-full h-36 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shadow-sm"
                    />
                    {p.archived && (
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-600 text-white shadow">
                        Archived
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base truncate">{p.name}</h3>
                    <div className="flex items-center justify-between mt-1 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span className="truncate">{p.category}</span>
                      </div>
                      {getTypeBadge(p.type)}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">Sales Price</p>
                    <p className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm font-mono">
                      ₹{Number(p.salesPrice).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">Cost Price</p>
                    <p className="font-bold text-slate-700 dark:text-slate-300 font-mono">
                      ₹{Number(p.cost).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-4 rounded-2xl shadow-sm">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Showing <span className="font-bold text-slate-900 dark:text-white">{(page - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-bold text-slate-900 dark:text-white">{Math.min(page * itemsPerPage, filtered.length)}</span> of{' '}
              <span className="font-bold text-slate-900 dark:text-white">{filtered.length}</span> products
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 px-2">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
