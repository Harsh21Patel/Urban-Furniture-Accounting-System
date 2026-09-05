import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { contactsApi, authApi } from '../../api/endpoints.js';
import Navbar from '../../components/Navbar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Check,
  AlertCircle,
  ShieldCheck,
  UserPlus,
  Key,
  Archive,
  RotateCcw
} from 'lucide-react';

const emptyForm = {
  name: '',
  type: 'CUSTOMER',
  email: '',
  mobile: '',
  street: '',
  city: '',
  state: '',
  country: 'India',
  pincode: '',
  imageUrl: '',
};

export default function ContactForm() {
  const { id } = useParams();
  const isEdit = Boolean(id) && id !== 'new';
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [form, setForm] = useState(emptyForm);
  const [contactData, setContactData] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Portal user creation state
  const [showCreatePortalUser, setShowCreatePortalUser] = useState(false);
  const [portalForm, setPortalForm] = useState({
    loginId: '',
    password: '',
    confirmPassword: '',
  });
  const [portalError, setPortalError] = useState('');
  const [portalSuccess, setPortalSuccess] = useState('');
  const [portalLoading, setPortalLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (isEdit) {
      fetchContactDetails();
    }
  }, [id, isEdit]);

  const fetchContactDetails = async () => {
    try {
      const res = await contactsApi.get(id);
      setContactData(res.data);
      setForm({
        name: res.data.name || '',
        type: res.data.type || 'CUSTOMER',
        email: res.data.email || '',
        mobile: res.data.mobile || '',
        street: res.data.street || '',
        city: res.data.city || '',
        state: res.data.state || '',
        country: res.data.country || 'India',
        pincode: res.data.pincode || '',
        imageUrl: res.data.imageUrl || '',
      });
    } catch (err) {
      console.error('Failed to load contact:', err);
      setError('Failed to load contact details.');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const validateForm = () => {
    if (!form.name.trim()) return 'Contact name is required.';
    if (!['CUSTOMER', 'VENDOR', 'BOTH'].includes(form.type)) return 'Invalid contact type selected.';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email || !emailRegex.test(form.email)) return 'Please enter a valid email address.';

    // Mobile validation (if provided)
    if (form.mobile && !/^[0-9+\-\s]{7,15}$/.test(form.mobile)) {
      return 'Mobile number must contain between 7 and 15 valid digits/characters.';
    }

    // Pincode validation (if provided)
    if (form.pincode && !/^[0-9a-zA-Z\s\-]{3,10}$/.test(form.pincode)) {
      return 'Pincode must be between 3 and 10 alphanumeric characters.';
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
        await contactsApi.update(id, form);
        setSuccessMsg('Contact updated successfully!');
        fetchContactDetails();
      } else {
        const res = await contactsApi.create(form);
        setSuccessMsg('Contact created successfully!');
        setTimeout(() => navigate(`/contacts/${res.data.id}`), 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save contact');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!window.confirm('Are you sure you want to archive this contact?')) return;
    try {
      await contactsApi.archive(id);
      fetchContactDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to archive contact');
    }
  };

  const handleUnarchive = async () => {
    if (!window.confirm('Are you sure you want to unarchive/restore this contact?')) return;
    try {
      await contactsApi.unarchive(id);
      fetchContactDetails();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to unarchive contact');
    }
  };

  const handleCreatePortalUser = async (e) => {
    e.preventDefault();
    setPortalError('');
    setPortalSuccess('');

    if (!portalForm.loginId || portalForm.loginId.length < 6 || portalForm.loginId.length > 12) {
      setPortalError('Login ID must be between 6 and 12 characters.');
      return;
    }

    if (portalForm.password !== portalForm.confirmPassword) {
      setPortalError('Passwords do not match.');
      return;
    }

    setPortalLoading(true);
    try {
      await authApi.createUser({
        name: form.name,
        loginId: portalForm.loginId,
        email: form.email,
        role: 'CONTACT_USER',
        password: portalForm.password,
        confirmPassword: portalForm.confirmPassword,
        contactId: id,
      });

      setPortalSuccess('Portal User created and linked successfully!');
      setShowCreatePortalUser(false);
      setPortalForm({ loginId: '', password: '', confirmPassword: '' });
      fetchContactDetails();
    } catch (err) {
      setPortalError(err.response?.data?.message || 'Failed to create portal user.');
    } finally {
      setPortalLoading(false);
    }
  };

  const existingPortalUser = contactData?.users?.find((u) => u.role === 'CONTACT_USER');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 pb-12">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Master Data Title Banner */}
        <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded px-4 py-2 text-center">
          <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Master Data: Contact Form View</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Define customer/vendor attributes and provision portal authentication access.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-6 space-y-6">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/contacts')}
                className="p-2 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    {isEdit ? form.name || 'Edit Contact' : 'New Contact Master'}
                  </h1>
                  {isEdit && contactData && (
                    contactData.archived ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800/60">
                        Archived
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                        Active
                      </span>
                    )
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isEdit ? 'Update primary contact information & portal authorization' : 'Fill required fields to create contact'}
                </p>
              </div>
            </div>

            {isEdit && isAdmin && (
              <div className="flex items-center gap-2">
                {contactData?.archived ? (
                  <button
                    type="button"
                    onClick={handleUnarchive}
                    className="flex items-center gap-1 px-3 py-1.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-xs font-medium"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Unarchive</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleArchive}
                    className="flex items-center gap-1 px-3 py-1.5 rounded bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300 border border-red-200 dark:border-red-800/60 text-xs font-medium"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>Archive Contact</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded p-3 flex items-center gap-2 text-red-600 dark:text-red-400 text-xs font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded p-3 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
              <Check className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Profile Image Column */}
              <div className="md:col-span-1 space-y-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Profile Image
                </label>
                <div className="bg-gray-50 dark:bg-gray-800/40 border border-gray-300 dark:border-gray-700 rounded-md p-3 text-center flex flex-col items-center justify-center min-h-[160px]">
                  {form.imageUrl ? (
                    <img
                      src={form.imageUrl}
                      alt="Preview"
                      className="w-20 h-20 rounded-full object-cover border border-gray-300 dark:border-gray-700"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400 mb-1">
                      <User className="w-7 h-7" />
                    </div>
                  )}
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Specify direct Image URL</p>
                </div>
                <input
                  name="imageUrl"
                  type="text"
                  placeholder="https://example.com/photo.jpg"
                  value={form.imageUrl}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-1.5 text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Main Attributes */}
              <div className="md:col-span-2 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Contact Name *
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="e.g. Azure Interior Systems / Rahul Sharma"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      Contact Type *
                    </label>
                    <select
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-medium"
                    >
                      <option value="CUSTOMER">Customer</option>
                      <option value="VENDOR">Vendor</option>
                      <option value="BOTH">Both (Customer & Vendor)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        name="mobile"
                        type="text"
                        placeholder="+91 9876543210"
                        value={form.mobile}
                        onChange={handleChange}
                        className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded pl-8 pr-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="contact@company.com"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded pl-8 pr-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Address Details Subsection */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
              <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary dark:text-primary-dark" />
                <span>Address Details</span>
              </h3>

              <div>
                <input
                  name="street"
                  type="text"
                  placeholder="Street / Premises / Building Address"
                  value={form.street}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <input
                  name="city"
                  type="text"
                  placeholder="City"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-1.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <input
                  name="state"
                  type="text"
                  placeholder="State"
                  value={form.state}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-1.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <input
                  name="country"
                  type="text"
                  placeholder="Country"
                  value={form.country}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-1.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <input
                  name="pincode"
                  type="text"
                  placeholder="Pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-1.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Confirm & Save Button */}
            <div className="flex items-center gap-3 pt-3 border-t border-gray-200 dark:border-gray-800">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover dark:bg-primary-dark dark:hover:bg-primary text-white text-xs font-medium px-4 py-2 rounded disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isEdit ? 'Save Changes' : 'Create Contact'}</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/contacts')}
                className="px-4 py-2 rounded border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-medium"
              >
                Back
              </button>
            </div>
          </form>

          {/* CONTACT USER / PORTAL ACCESS SECTION */}
          {isEdit && (
            <div className="pt-6 border-t border-gray-200 dark:border-gray-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-primary dark:text-primary-dark" />
                    <span>Contact Portal Access</span>
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Manage portal user credentials linked to this contact record.
                  </p>
                </div>

                {!existingPortalUser && isAdmin && !showCreatePortalUser && (
                  <button
                    type="button"
                    onClick={() => setShowCreatePortalUser(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary dark:bg-primary-dark/20 dark:text-primary-dark rounded text-xs font-medium"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Link Portal User</span>
                  </button>
                )}
              </div>

              {/* Status Display if Portal User Exists */}
              {existingPortalUser ? (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="font-bold uppercase text-emerald-800 dark:text-emerald-300">
                        Portal User Linked
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Login ID: <code className="bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded text-primary dark:text-primary-dark">{existingPortalUser.loginId}</code>
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Email: {existingPortalUser.email}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded text-emerald-700 dark:text-emerald-300 self-start sm:self-center font-medium">
                    Role: CONTACT_USER
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 rounded-md p-3.5 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
                  <span>No portal account linked to this contact.</span>
                  {!isAdmin && <span className="italic">Contact an Admin to create portal credentials.</span>}
                </div>
              )}

              {/* Inline Form to Create Portal User */}
              {showCreatePortalUser && !existingPortalUser && (
                <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-md p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                    <h4 className="text-xs font-bold uppercase text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-amber-500" />
                      <span>Provision New Portal Credentials</span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowCreatePortalUser(false)}
                      className="text-xs font-medium text-gray-500 hover:text-gray-800 dark:hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>

                  {portalError && (
                    <div className="bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-medium p-2.5 rounded border border-red-200 dark:border-red-800/60">
                      {portalError}
                    </div>
                  )}

                  {portalSuccess && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium p-2.5 rounded border border-emerald-200 dark:border-emerald-800/60">
                      {portalSuccess}
                    </div>
                  )}

                  <form onSubmit={handleCreatePortalUser} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                          Login ID * (6-12 chars)
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. portal_azure"
                          value={portalForm.loginId}
                          onChange={(e) => setPortalForm({ ...portalForm, loginId: e.target.value })}
                          className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2.5 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                          Password * (&gt;8 chars, upper, lower, special)
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={portalForm.password}
                          onChange={(e) => setPortalForm({ ...portalForm, password: e.target.value })}
                          className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2.5 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                          Confirm Password *
                        </label>
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={portalForm.confirmPassword}
                          onChange={(e) => setPortalForm({ ...portalForm, confirmPassword: e.target.value })}
                          className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2.5 py-1.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={portalLoading}
                      className="bg-primary hover:bg-primary-hover dark:bg-primary-dark dark:hover:bg-primary text-white text-xs font-medium px-3 py-1.5 rounded disabled:opacity-50"
                    >
                      {portalLoading ? 'Creating User...' : 'Create & Link Portal User'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
