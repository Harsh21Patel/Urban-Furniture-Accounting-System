import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsApi } from '../../api/endpoints.js';
import Navbar from '../../components/Navbar.jsx';
import { LayoutList, LayoutGrid, Plus, Search, ArrowLeft, Archive, Tag, DollarSign } from 'lucide-react';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productsApi.list();
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
      alert('Failed to archive product');
    }
  };

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.type.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Product Master</h1>
              <p className="text-xs text-slate-400">Goods, Services, and Combo furniture products</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search product or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-slate-800/90 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 sm:w-64 transition"
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'list' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="List View"
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-lg transition ${
                  viewMode === 'kanban' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Kanban View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            {/* New Button */}
            <button
              onClick={() => navigate('/products/new')}
              className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Product</span>
            </button>
          </div>
        </div>

        {/* Content View */}
        {loading ? (
          <div className="text-center py-16 text-slate-400">Loading products...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400">
            No products found matching your search.
          </div>
        ) : viewMode === 'list' ? (
          /* List View Table */
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/80 text-xs uppercase text-slate-400 font-semibold tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Sales Price</th>
                    <th className="px-6 py-4">Cost</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filtered.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => navigate(`/products/${p.id}`)}
                      className="hover:bg-slate-800/50 cursor-pointer transition"
                    >
                      <td className="px-6 py-3.5 flex items-center gap-3">
                        <img
                          src={p.imageUrl || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100'}
                          alt={p.name}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-700"
                        />
                        <span className="font-semibold text-white">{p.name}</span>
                      </td>
                      <td className="px-6 py-3.5 text-slate-300">{p.category}</td>
                      <td className="px-6 py-3.5">
                        <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase bg-slate-800 text-indigo-400 border border-indigo-500/20">
                          {p.type}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 font-bold text-emerald-400">
                        ₹{Number(p.salesPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-3.5 text-slate-400">
                        ₹{Number(p.cost).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button
                          onClick={(e) => handleArchive(p.id, e)}
                          title="Archive Product"
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
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
            {filtered.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/products/${p.id}`)}
                className="bg-slate-900 border border-slate-800 hover:border-indigo-500/60 rounded-2xl p-5 shadow-xl hover:scale-[1.02] transition cursor-pointer flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <img
                    src={p.imageUrl || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200'}
                    alt={p.name}
                    className="w-full h-36 rounded-xl object-cover border border-slate-800 shadow"
                  />
                  <div>
                    <h3 className="font-bold text-white text-base truncate">{p.name}</h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                      <Tag className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{p.category}</span>
                      <span>•</span>
                      <span className="font-semibold text-slate-300">{p.type}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Sales Price</p>
                    <p className="font-extrabold text-emerald-400 text-sm">
                      ₹{Number(p.salesPrice).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Cost</p>
                    <p className="font-bold text-slate-300">
                      ₹{Number(p.cost).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
