import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { contactsApi } from '../../api/endpoints.js';
import Navbar from '../../components/Navbar.jsx';

const emptyForm = {
  name: '', type: 'CUSTOMER', email: '', mobile: '',
  street: '', city: '', state: '', country: '', pincode: '',
};

export default function ContactForm() {
  const { id } = useParams();
  const isEdit = Boolean(id) && id !== 'new';
  const [form, setForm] = useState(emptyForm);
  const navigate = useNavigate();

  useEffect(() => {
    if (isEdit) contactsApi.get(id).then((res) => setForm(res.data));
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEdit) await contactsApi.update(id, form);
    else await contactsApi.create(form);
    navigate('/contacts');
  };

  return (
    <div>
      <Navbar />
      <form onSubmit={handleSubmit} className="p-8 max-w-lg space-y-3">
        <h1 className="text-xl font-semibold mb-4">{isEdit ? 'Edit Contact' : 'New Contact'}</h1>

        <input name="name" placeholder="Contact Name" value={form.name} onChange={handleChange} className="w-full border rounded px-3 py-2" />

        <select name="type" value={form.type} onChange={handleChange} className="w-full border rounded px-3 py-2">
          <option value="CUSTOMER">Customer</option>
          <option value="VENDOR">Vendor</option>
          <option value="BOTH">Both</option>
        </select>

        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        <input name="mobile" placeholder="Phone" value={form.mobile} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        <input name="street" placeholder="Street" value={form.street} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        <input name="city" placeholder="City" value={form.city} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        <input name="state" placeholder="State" value={form.state} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        <input name="country" placeholder="Country" value={form.country} onChange={handleChange} className="w-full border rounded px-3 py-2" />
        <input name="pincode" placeholder="Pincode" value={form.pincode} onChange={handleChange} className="w-full border rounded px-3 py-2" />

        <div className="flex gap-3 pt-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Confirm</button>
          <button type="button" onClick={() => navigate('/contacts')} className="px-4 py-2 rounded border">Back</button>
        </div>
      </form>
    </div>
  );
}
