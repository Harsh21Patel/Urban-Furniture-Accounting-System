import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar.jsx';
import { authApi, contactsApi } from '../../api/endpoints.js';
import { Building2, AlertCircle, CheckCircle2, ShieldCheck, UserCheck, CreditCard } from 'lucide-react';

export default function CreateUser() {
  const [form, setForm] = useState({
    name: '',
    loginId: '',
    email: '',
    role: 'ACCOUNTANT',
    password: '',
    confirmPassword: '',
    contactId: '',
  });
  const [contacts, setContacts] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    contactsApi.list().then((res) => setContacts(res.data)).catch(console.error);
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await authApi.createUser(form);
      setSuccess(`User '${res.data.loginId}' created successfully with role ${res.data.role}!`);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-6 space-y-6">
          
          {/* Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-gray-800">
            <div className="w-10 h-10 rounded bg-primary dark:bg-primary-dark text-white flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Create User</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Admin management console to provision user accounts and roles</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded p-3 flex items-center gap-2 text-red-600 dark:text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded p-3 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Name
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Full Name (e.g., Nimesh Pathak)"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Login ID
                </label>
                <input
                  name="loginId"
                  type="text"
                  required
                  placeholder="Unique ID (6-12 characters)"
                  value={form.loginId}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  E-Mail ID
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="Unique email address"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                  Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'ADMIN', label: 'Administrator', desc: 'All Rights' },
                    { id: 'ACCOUNTANT', label: 'Accountant', desc: 'Invoicing & Reports' },
                    { id: 'CONTACT_USER', label: 'User', desc: 'Contact Portal' },
                  ].map((r) => (
                    <button
                      type="button"
                      key={r.id}
                      onClick={() => setForm({ ...form, role: r.id })}
                      className={`p-2.5 rounded border text-left ${
                        form.role === r.id
                          ? 'bg-primary/10 border-primary text-primary dark:bg-primary-dark/20 dark:border-primary-dark dark:text-primary-dark font-medium'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <p className="text-xs font-semibold">{r.label}</p>
                      <p className="text-[10px] opacity-80 mt-0.5">{r.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {form.role === 'CONTACT_USER' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Link Contact Master (Optional)
                  </label>
                  <select
                    name="contactId"
                    value={form.contactId}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Create / Link automatically by Email</option>
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.type}) — {c.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="Must contain uppercase, lowercase, special char and >8 chars"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Re-Enter Password
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-primary hover:bg-primary-hover dark:bg-primary-dark dark:hover:bg-primary text-white font-medium py-2 px-4 rounded text-sm disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>

            {/* Sidebar Guide */}
            <div className="bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 rounded-md p-4 space-y-4">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Role Definitions</h3>
              
              <div className="space-y-3 text-xs">
                <div className="flex gap-2.5 items-start">
                  <ShieldCheck className="w-4 h-4 text-primary dark:text-primary-dark flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Administrator (Admin)</p>
                    <p className="text-gray-500 dark:text-gray-400 mt-0.5">Has all access rights. Creates, modifies, archives master data, records transactions, and views reports.</p>
                  </div>
                </div>

                <div className="flex gap-2.5 items-start">
                  <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Accountant (Invoicing User)</p>
                    <p className="text-gray-500 dark:text-gray-400 mt-0.5">Creates master data, records sales/purchases/journals, registers payments, and views financial reports.</p>
                  </div>
                </div>

                <div className="flex gap-2.5 items-start">
                  <CreditCard className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">User (Contact User)</p>
                    <p className="text-gray-500 dark:text-gray-400 mt-0.5">Can only view their own invoices/bills in paid/unpaid status and directly pay dues from portal.</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 dark:border-gray-700/60 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p className="font-semibold text-gray-700 dark:text-gray-300">Validation Checks:</p>
                <p>1. Login Id: 6-12 characters, unique.</p>
                <p>2. Email: Unique in database.</p>
                <p>3. Password: &gt;8 chars with uppercase, lowercase, special char.</p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
