import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { contactsApi } from '../../api/endpoints.js';
import Navbar from '../../components/Navbar.jsx';
import { LayoutList, LayoutGrid, Plus, Search, ArrowLeft, Mail, Phone, MapPin, User, Archive } from 'lucide-react';

export default function ContactList() {
  const [contacts, setContacts] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await contactsApi.list();
      setContacts(res.data || []);
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to archive this contact?')) return;
    try {
      await contactsApi.archive(id);
      fetchContacts();
    } catch (err) {
      alert('Failed to archive contact');
    }
  };

  const filtered = contacts.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.mobile && c.mobile.toLowerCase().includes(q)) ||
      (c.city && c.city.toLowerCase().includes(q))
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
              <h1 className="text-2xl font-extrabold text-white">Contact Master</h1>
              <p className="text-xs text-slate-400">Manage Customers, Vendors, and Partners</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search contact..."
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
              onClick={() => navigate('/contacts/new')}
              className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Contact</span>
            </button>
          </div>
        </div>

        {/* Content View */}
        {loading ? (
          <div className="text-center py-16 text-slate-400">Loading contacts...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400">
            No contacts found matching your criteria.
          </div>
        ) : viewMode === 'list' ? (
          /* List View Table */
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-800/80 text-xs uppercase text-slate-400 font-semibold tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Image</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Mobile</th>
                    <th className="px-6 py-4">City</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filtered.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => navigate(`/contacts/${c.id}`)}
                      className="hover:bg-slate-800/50 cursor-pointer transition"
                    >
                      <td className="px-6 py-3.5">
                        <img
                          src={c.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={c.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-700"
                        />
                      </td>
                      <td className="px-6 py-3.5 font-semibold text-white">{c.name}</td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${
                            c.type === 'CUSTOMER'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : c.type === 'VENDOR'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          }`}
                        >
                          {c.type}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-slate-300">{c.email}</td>
                      <td className="px-6 py-3.5 text-slate-400">{c.mobile || '-'}</td>
                      <td className="px-6 py-3.5 text-slate-400">{c.city || '-'}</td>
                      <td className="px-6 py-3.5 text-right">
                        <button
                          onClick={(e) => handleArchive(c.id, e)}
                          title="Archive Contact"
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
          /* Kanban Card View */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((c) => (
              <div
                key={c.id}
                onClick={() => navigate(`/contacts/${c.id}`)}
                className="bg-slate-900 border border-slate-800 hover:border-indigo-500/60 rounded-2xl p-5 shadow-xl hover:scale-[1.02] transition cursor-pointer flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={c.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={c.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-700 shadow"
                  />
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-white text-base truncate">{c.name}</h3>
                    <span
                      className={`inline-block px-2 py-0.5 mt-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        c.type === 'CUSTOMER'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : c.type === 'VENDOR'
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'bg-indigo-500/10 text-indigo-400'
                      }`}
                    >
                      {c.type}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    <span className="truncate">{c.email}</span>
                  </div>
                  {c.mobile && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>{c.mobile}</span>
                    </div>
                  )}
                  {c.city && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                      <span>{c.city}, {c.state || c.country}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
