import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { contactsApi } from '../../api/endpoints.js';
import Navbar from '../../components/Navbar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  LayoutList,
  LayoutGrid,
  Plus,
  Search,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Archive,
  RotateCcw,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye
} from 'lucide-react';

export default function ContactList() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'kanban'
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL'); // 'ALL', 'CUSTOMER', 'VENDOR', 'BOTH'
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;
  const navigate = useNavigate();

  useEffect(() => {
    fetchContacts();
  }, [showArchived]);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await contactsApi.list({ includeArchived: showArchived });
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
      alert(err.response?.data?.message || 'Failed to archive contact');
    }
  };

  const handleUnarchive = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to restore/unarchive this contact?')) return;
    try {
      await contactsApi.unarchive(id);
      fetchContacts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to unarchive contact');
    }
  };

  const filtered = contacts.filter((c) => {
    const q = search.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.mobile && c.mobile.toLowerCase().includes(q)) ||
      (c.city && c.city.toLowerCase().includes(q));

    const matchesType = typeFilter === 'ALL' || c.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedContacts = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16 transition-colors duration-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Master Data Title Yellow Banner matching Image 2 */}
        <div className="bg-amber-100 border border-amber-300 rounded-xl px-6 py-2.5 text-center shadow-sm dark:bg-amber-500/10 dark:border-amber-500/30">
          <h2 className="text-base font-extrabold text-amber-900 dark:text-amber-300">Master Data: Contact Management</h2>
          <p className="text-xs text-amber-800/80 dark:text-amber-400/80">
            Manage Customers, Vendors, and Both. Toggle between List & Kanban views. Click New to add or select a record to edit.
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
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Contact Master</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {filtered.length} {filtered.length === 1 ? 'Contact' : 'Contacts'} found
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, email, mobile..."
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
                <option value="CUSTOMER" className="dark:bg-slate-900">Customer</option>
                <option value="VENDOR" className="dark:bg-slate-900">Vendor</option>
                <option value="BOTH" className="dark:bg-slate-900">Both</option>
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
              onClick={() => navigate('/contacts/new')}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-600/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>New</span>
            </button>
          </div>
        </div>

        {/* Content View */}
        {loading ? (
          <div className="text-center py-16 text-slate-500 dark:text-slate-400">Loading contacts...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 dark:text-slate-400">
            No contacts found matching your criteria.
          </div>
        ) : viewMode === 'list' ? (
          /* List View Table */
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-100 dark:bg-slate-800/80 text-xs uppercase text-slate-600 dark:text-slate-400 font-semibold tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Image</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">Portal User</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {paginatedContacts.map((c) => {
                    const hasPortalUser = c.users && c.users.some((u) => u.role === 'CONTACT_USER');
                    return (
                      <tr
                        key={c.id}
                        onClick={() => navigate(`/contacts/${c.id}`)}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition"
                      >
                        <td className="px-6 py-3.5">
                          <img
                            src={c.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                            alt={c.name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                        </td>
                        <td className="px-6 py-3.5 font-semibold text-slate-900 dark:text-white">{c.name}</td>
                        <td className="px-6 py-3.5">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${
                              c.type === 'CUSTOMER'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400'
                                : c.type === 'VENDOR'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400'
                                : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-400'
                            }`}
                          >
                            {c.type}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-slate-600 dark:text-slate-300">{c.email}</td>
                        <td className="px-6 py-3.5 text-slate-600 dark:text-slate-400">{c.mobile || '-'}</td>
                        <td className="px-6 py-3.5">
                          {hasPortalUser ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400">
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Portal User</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                              <UserX className="w-3.5 h-3.5" />
                              <span>No Portal</span>
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3.5">
                          {c.archived ? (
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
                            onClick={() => navigate(`/contacts/${c.id}`)}
                            title="View / Edit Contact"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {c.archived ? (
                            isAdmin && (
                              <button
                                onClick={(e) => handleUnarchive(c.id, e)}
                                title="Restore / Unarchive Contact"
                                className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg transition"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            )
                          ) : (
                            <button
                              onClick={(e) => handleArchive(c.id, e)}
                              title="Archive Contact"
                              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Kanban Card View */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginatedContacts.map((c) => {
              const hasPortalUser = c.users && c.users.some((u) => u.role === 'CONTACT_USER');
              return (
                <div
                  key={c.id}
                  onClick={() => navigate(`/contacts/${c.id}`)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 rounded-2xl p-5 shadow-sm dark:shadow-xl hover:scale-[1.01] transition cursor-pointer flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={c.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={c.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                        />
                        <div className="overflow-hidden">
                          <h3 className="font-bold text-slate-900 dark:text-white text-base truncate">{c.name}</h3>
                          <span
                            className={`inline-block px-2 py-0.5 mt-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              c.type === 'CUSTOMER'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400'
                                : c.type === 'VENDOR'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400'
                                : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-400'
                            }`}
                          >
                            {c.type}
                          </span>
                        </div>
                      </div>

                      {c.archived ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400">
                          Archived
                        </span>
                      ) : (
                        hasPortalUser && (
                          <span className="p-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" title="Portal User Active">
                            <UserCheck className="w-3.5 h-3.5" />
                          </span>
                        )
                      )}
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                        <span className="truncate">{c.email}</span>
                      </div>
                      {c.mobile && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                          <span>{c.mobile}</span>
                        </div>
                      )}
                      {c.city && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 flex-shrink-0" />
                          <span>
                            {c.city}, {c.state || c.country}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => navigate(`/contacts/${c.id}`)}
                      className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      View Details
                    </button>
                    {c.archived ? (
                      isAdmin && (
                        <button
                          onClick={(e) => handleUnarchive(c.id, e)}
                          title="Unarchive"
                          className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg transition"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )
                    ) : (
                      <button
                        onClick={(e) => handleArchive(c.id, e)}
                        title="Archive"
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Bar */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-4 rounded-2xl shadow-sm">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Showing <span className="font-bold text-slate-900 dark:text-white">{(page - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-bold text-slate-900 dark:text-white">{Math.min(page * itemsPerPage, filtered.length)}</span> of{' '}
              <span className="font-bold text-slate-900 dark:text-white">{filtered.length}</span> contacts
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
