import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { contactsApi } from '../../api/endpoints.js';
import Navbar from '../../components/Navbar.jsx';
import { ArrowLeft, User, Mail, Phone, MapPin, Upload, Check, AlertCircle } from 'lucide-react';

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
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isEdit) {
      contactsApi.get(id).then((res) => setForm(res.data)).catch(console.error);
    }
  }, [id, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEdit) await contactsApi.update(id, form);
      else await contactsApi.create(form);
      navigate('/contacts');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save contact');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-10 space-y-8">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate('/contacts')}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-extrabold text-white">
                  {isEdit ? 'Contact Master Form View' : 'New Contact Master Form'}
                </h1>
                <p className="text-xs text-slate-400">Enter primary details for customer or vendor contact</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setForm(emptyForm)}
              className="px-3.5 py-1.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold transition"
            >
              New
            </button>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Image Preview / Upload Box */}
              <div className="md:col-span-1 space-y-3">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Profile Image
                </label>
                <div className="bg-slate-800/60 border-2 border-dashed border-slate-700 rounded-2xl p-4 text-center flex flex-col items-center justify-center min-h-[180px] relative">
                  {form.imageUrl ? (
                    <img
                      src={form.imageUrl}
                      alt="Preview"
                      className="w-24 h-24 rounded-full object-cover border-2 border-indigo-500 shadow-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center text-slate-400 mb-2">
                      <User className="w-8 h-8" />
                    </div>
                  )}
                  <p className="text-xs text-slate-400 mt-2">Enter Image URL below</p>
                </div>
                <input
                  name="imageUrl"
                  type="text"
                  placeholder="https://example.com/image.jpg"
                  value={form.imageUrl}
                  onChange={handleChange}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              {/* Main Fields */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Contact Name *
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="e.g., Azure Furniture / Nimesh Pathak"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Contact Type *
                    </label>
                    <select
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    >
                      <option value="CUSTOMER">Customer</option>
                      <option value="VENDOR">Vendor</option>
                      <option value="BOTH">Both</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Phone Number
                    </label>
                    <input
                      name="mobile"
                      type="text"
                      placeholder="+91 9876543210"
                      value={form.mobile}
                      onChange={handleChange}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Unique Email *
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="contact@example.com"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

            </div>

            {/* Address Subsection */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-400" />
                <span>Address Details</span>
              </h3>

              <div>
                <input
                  name="street"
                  type="text"
                  placeholder="Street / Building Address"
                  value={form.street}
                  onChange={handleChange}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <input
                  name="city"
                  type="text"
                  placeholder="City"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
                <input
                  name="state"
                  type="text"
                  placeholder="State"
                  value={form.state}
                  onChange={handleChange}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
                <input
                  name="country"
                  type="text"
                  placeholder="Country"
                  value={form.country}
                  onChange={handleChange}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
                <input
                  name="pincode"
                  type="text"
                  placeholder="Pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-6 border-t border-slate-800">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>Confirm</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/contacts')}
                className="px-6 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-semibold transition"
              >
                Back
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}
