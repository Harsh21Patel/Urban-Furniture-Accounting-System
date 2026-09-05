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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-10 space-y-8">
          
          {/* Header */}
          <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-lg">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Create User</h1>
              <p className="text-sm text-slate-400">Admin management console to provision user accounts and roles</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3 text-emerald-400 text-sm">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Name
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Full Name (e.g., Nimesh Pathak)"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Login ID
                </label>
                <input
                  name="loginId"
                  type="text"
                  required
                  placeholder="Unique ID (6-12 characters)"
                  value={form.loginId}
                  onChange={handleChange}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  E-Mail ID
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="Unique email address"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Role
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'ADMIN', label: 'Administrator', desc: 'All Rights' },
                    { id: 'ACCOUNTANT', label: 'Accountant', desc: 'Invoicing & Reports' },
                    { id: 'CONTACT_USER', label: 'User', desc: 'Contact Portal' },
                  ].map((r) => (
                    <button
                      type="button"
                      key={r.id}
                      onClick={() => setForm({ ...form, role: r.id })}
                      className={`p-3 rounded-xl border text-left transition ${
                        form.role === r.id
                          ? 'bg-indigo-600/20 border-indigo-500 text-white'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <p className="text-xs font-bold text-slate-200">{r.label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{r.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {form.role === 'CONTACT_USER' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Link Contact Master (Optional)
                  </label>
                  <select
                    name="contactId"
                    value={form.contactId}
                    onChange={handleChange}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
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
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="Must contain uppercase, lowercase, special char and >8 chars"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Re-Enter Password
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div className="flex items-center gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-2.5 border border-slate-700 text-slate-300 hover:bg-slate-800 rounded-xl font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </form>

            {/* Sidebar Guide */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Role Definitions</h3>
              
              <div className="space-y-4 text-xs">
                <div className="flex gap-3 items-start">
                  <ShieldCheck className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-indigo-300">Administrator (Admin)</p>
                    <p className="text-slate-400 mt-0.5">Has all access rights. Creates, modifies, archives master data, records transactions, and views reports.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <UserCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-emerald-300">Accountant (Invoicing User)</p>
                    <p className="text-slate-400 mt-0.5">Creates master data, records sales/purchases/journals, registers payments, and views financial reports.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <CreditCard className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-300">User (Contact User)</p>
                    <p className="text-slate-400 mt-0.5">Can only view their own invoices/bills in paid/unpaid status and directly pay dues from portal.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700/60 text-xs text-slate-400 space-y-1">
                <p className="font-semibold text-slate-300">Validation Checks:</p>
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
