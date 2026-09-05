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
        return <span className="text-xs">{type}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-4">
        {/* Master Data Title Banner */}
        <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-4 py-2 text-center">
          <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Master Data: Product Master</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Default List View & Kanban View toggle. Product Types: Goods (Physical Stock), Service (Non-inventory), Combo.
          </p>
        </div>

        {/* Controls Container */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Product Master</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {filtered.length} {filtered.length === 1 ? 'Product' : 'Products'} found
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search product name or category..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded pl-8 pr-3 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-44 sm:w-56"
              />
            </div>

            {/* Filter by Type */}
            <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-xs">
              <Filter className="w-3.5 h-3.5 text-gray-500" />
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent text-gray-700 dark:text-gray-200 font-medium focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="dark:bg-gray-900">All Types</option>
                <option value="GOODS" className="dark:bg-gray-900">Goods</option>
                <option value="SERVICE" className="dark:bg-gray-900">Service</option>
                <option value="COMBO" className="dark:bg-gray-900">Combo</option>
              </select>
            </div>

            {/* Show Archived Toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2.5 py-1.5 text-xs text-gray-700 dark:text-gray-300 font-medium">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => {
                  setShowArchived(e.target.checked);
                  setPage(1);
                }}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span>Include Archived</span>
            </label>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-0.5">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1 rounded text-xs ${
                  viewMode === 'list'
                    ? 'bg-primary/10 text-primary dark:bg-primary-dark/20 dark:text-primary-dark font-medium'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="List View"
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1 rounded text-xs ${
                  viewMode === 'kanban'
                    ? 'bg-primary/10 text-primary dark:bg-primary-dark/20 dark:text-primary-dark font-medium'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                title="Kanban View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            {/* New Button */}
            <button
              onClick={() => navigate('/products/new')}
              className="flex items-center gap-1 bg-primary hover:bg-primary-hover dark:bg-primary-dark dark:hover:bg-primary text-white text-xs font-medium px-3 py-1.5 rounded"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>
        </div>

        {/* Content View */}
        {loading ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-xs">Loading products...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md text-gray-500 dark:text-gray-400 text-xs">
            No products found matching your search.
          </div>
        ) : viewMode === 'list' ? (
          /* List View Table */
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-800 dark:text-gray-200">
                <thead className="bg-gray-50 dark:bg-gray-800/60 text-xs uppercase text-gray-600 dark:text-gray-300 font-semibold tracking-wider border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-4 py-2.5">Image</th>
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
                  {paginatedProducts.map((p) => (
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
                              onClick={(e) => handleUnarchive(p.id, e)}
                              title="Restore / Unarchive Product"
                              className="p-1 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )
                        ) : (
                          <button
                            onClick={(e) => handleArchive(p.id, e)}
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
            {paginatedProducts.map((p) => (
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
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-medium">Cost Price</p>
                    <p className="font-bold text-gray-700 dark:text-gray-300 font-mono">
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
          <div className="flex items-center justify-between bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-4 py-3 rounded-md">
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Showing <span className="font-bold text-gray-900 dark:text-white">{(page - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-bold text-gray-900 dark:text-white">{Math.min(page * itemsPerPage, filtered.length)}</span> of{' '}
              <span className="font-bold text-gray-900 dark:text-white">{filtered.length}</span> products
            </div>

            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 px-2">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40"
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
