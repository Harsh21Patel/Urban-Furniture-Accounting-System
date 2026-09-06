import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { contactsApi } from '../../api/endpoints.js';
import Navbar from '../../components/Navbar.jsx';
import ConfirmModal from '../../components/ConfirmModal.jsx';
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
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    contact: null,
    actionType: 'archive',
    loading: false,
  });
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

  const openArchiveModal = (contact, e) => {
    if (e) e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      contact,
      actionType: 'archive',
      loading: false,
    });
  };

  const openUnarchiveModal = (contact, e) => {
    if (e) e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      contact,
      actionType: 'unarchive',
      loading: false,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmModal.contact) return;
    setConfirmModal((prev) => ({ ...prev, loading: true }));
    try {
      if (confirmModal.actionType === 'archive') {
        await contactsApi.archive(confirmModal.contact.id);
      } else {
        await contactsApi.unarchive(confirmModal.contact.id);
      }
      setConfirmModal({ isOpen: false, contact: null, actionType: 'archive', loading: false });
      fetchContacts();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${confirmModal.actionType} contact`);
      setConfirmModal((prev) => ({ ...prev, loading: false }));
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

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-4">
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
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Contact Master</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {filtered.length} {filtered.length === 1 ? 'Contact' : 'Contacts'} found
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, email, phone, city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded pl-8 pr-3 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-48 sm:w-60"
              />
            </div>

            {/* Filter by Type */}
            <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-xs">
              <Filter className="w-3.5 h-3.5 text-gray-500" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-transparent text-gray-700 dark:text-gray-200 font-medium focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="dark:bg-gray-900">All Types</option>
                <option value="CUSTOMER" className="dark:bg-gray-900">Customers</option>
                <option value="VENDOR" className="dark:bg-gray-900">Vendors</option>
                <option value="BOTH" className="dark:bg-gray-900">Both</option>
              </select>
            </div>

            {/* Show Archived Toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2.5 py-1.5 text-xs text-gray-700 dark:text-gray-300 font-medium">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
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
              onClick={() => navigate('/contacts/new')}
              className="flex items-center gap-1 bg-primary hover:bg-primary-hover dark:bg-primary-dark dark:hover:bg-primary text-white text-xs font-medium px-3 py-1.5 rounded"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>
        </div>

        {/* Content View */}
        {loading ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-xs">Loading contacts...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md text-gray-500 dark:text-gray-400 text-xs">
            No contacts found matching your search.
          </div>
        ) : viewMode === 'list' ? (
          /* List View Table */
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-800 dark:text-gray-200">
                <thead className="bg-gray-50 dark:bg-gray-800/60 text-xs uppercase text-gray-600 dark:text-gray-300 font-semibold tracking-wider border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-4 py-2.5">Image</th>
                    <th className="px-4 py-2.5">Name</th>
                    <th className="px-4 py-2.5">Type</th>
                    <th className="px-4 py-2.5">Email</th>
                    <th className="px-4 py-2.5">Phone</th>
                    <th className="px-4 py-2.5">Portal User</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {filtered.map((c) => {
                    const hasPortalUser = c.users && c.users.some((u) => u.role === 'CONTACT_USER');
                    return (
                      <tr
                        key={c.id}
                        onClick={() => navigate(`/contacts/${c.id}`)}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/40 cursor-pointer"
                      >
                        <td className="px-4 py-2">
                          <img
                            src={c.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                            alt={c.name}
                            className="w-7 h-7 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                          />
                        </td>
                        <td className="px-4 py-2 font-bold text-gray-900 dark:text-white">{c.name}</td>
                        <td className="px-4 py-2">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              c.type === 'CUSTOMER'
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                                : c.type === 'VENDOR'
                                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
                                : 'bg-primary/10 text-primary dark:bg-primary-dark/20 dark:text-primary-dark border border-primary/20'
                            }`}
                          >
                            {c.type}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-gray-600 dark:text-gray-300">{c.email}</td>
                        <td className="px-4 py-2 text-gray-600 dark:text-gray-400">{c.mobile || '-'}</td>
                        <td className="px-4 py-2">
                          {hasPortalUser ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                              <UserCheck className="w-3 h-3" />
                              <span>Portal User</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                              <UserX className="w-3 h-3" />
                              <span>No Portal</span>
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {c.archived ? (
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
                            onClick={() => navigate(`/contacts/${c.id}`)}
                            title="View / Edit Contact"
                            className="p-1 text-gray-400 hover:text-primary dark:hover:text-primary-dark rounded"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {c.archived ? (
                            isAdmin && (
                              <button
                                onClick={(e) => openUnarchiveModal(c, e)}
                                title="Restore / Unarchive Contact"
                                className="p-1 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                              </button>
                            )
                          ) : (
                            <button
                              onClick={(e) => openArchiveModal(c, e)}
                              title="Archive Contact"
                              className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded"
                            >
                              <Archive className="w-3.5 h-3.5" />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((c) => {
              const hasPortalUser = c.users && c.users.some((u) => u.role === 'CONTACT_USER');
              return (
                <div
                  key={c.id}
                  onClick={() => navigate(`/contacts/${c.id}`)}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-md p-4 cursor-pointer flex flex-col justify-between space-y-3 min-w-0"
                >
                  <div className="space-y-2.5 min-w-0">
                    <div className="flex items-start justify-between gap-2 min-w-0">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <img
                          src={c.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={c.name}
                          className="w-10 h-10 rounded object-cover border border-gray-200 dark:border-gray-700 flex-shrink-0"
                        />
                        <div className="overflow-hidden min-w-0 flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate" title={c.name}>{c.name}</h3>
                          <span
                            className={`inline-block px-1.5 py-0.5 mt-0.5 rounded text-[10px] font-semibold uppercase ${
                              c.type === 'CUSTOMER'
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                                : c.type === 'VENDOR'
                                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
                                : 'bg-primary/10 text-primary dark:bg-primary-dark/20 dark:text-primary-dark border border-primary/20'
                            }`}
                          >
                            {c.type}
                          </span>
                        </div>
                      </div>

                      {c.archived && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase bg-red-600 text-white flex-shrink-0">
                          Archived
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300 pt-1 min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{c.email}</span>
                      </div>
                      {c.mobile && (
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{c.mobile}</span>
                        </div>
                      )}
                      {c.city && (
                        <div className="flex items-center gap-1.5 min-w-0">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{c.city}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-1">
                      {hasPortalUser ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                          <UserCheck className="w-3 h-3" />
                          <span>Portal User</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                          <UserX className="w-3 h-3" />
                          <span>No Portal</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2.5 border-t border-gray-200 dark:border-gray-800" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => navigate(`/contacts/${c.id}`)}
                      className="text-xs font-medium text-primary dark:text-primary-dark hover:underline"
                    >
                      View Details
                    </button>
                    {c.archived ? (
                      isAdmin && (
                        <button
                          onClick={(e) => openUnarchiveModal(c, e)}
                          title="Unarchive"
                          className="p-1 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )
                    ) : (
                      <button
                        onClick={(e) => openArchiveModal(c, e)}
                        title="Archive"
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, contact: null, actionType: 'archive', loading: false })}
        onConfirm={handleConfirmAction}
        loading={confirmModal.loading}
        title={confirmModal.actionType === 'archive' ? 'Archive Contact' : 'Restore Contact'}
        message={
          confirmModal.actionType === 'archive'
            ? `Are you sure you want to archive "${confirmModal.contact?.name}"? You can view or restore archived contacts at any time.`
            : `Are you sure you want to restore "${confirmModal.contact?.name}"?`
        }
        confirmText={confirmModal.actionType === 'archive' ? 'Archive' : 'Restore'}
        variant={confirmModal.actionType === 'archive' ? 'danger' : 'info'}
        icon={confirmModal.actionType === 'archive' ? Archive : RotateCcw}
      />
    </div>
  );
}
