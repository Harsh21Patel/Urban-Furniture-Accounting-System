import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../../api/endpoints.js';

export default function Signup() {
  const [form, setForm] = useState({ loginId: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signup(form);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow w-80 space-y-4">
        <h1 className="text-xl font-semibold text-center">Sign Up</h1>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <input name="loginId" placeholder="Login Id (6-12 chars)" className="w-full border rounded px-3 py-2" onChange={handleChange} />
        <input name="email" placeholder="Email" className="w-full border rounded px-3 py-2" onChange={handleChange} />
        <input name="password" type="password" placeholder="Password" className="w-full border rounded px-3 py-2" onChange={handleChange} />
        <input name="confirmPassword" type="password" placeholder="Re-enter Password" className="w-full border rounded px-3 py-2" onChange={handleChange} />
        <button className="w-full bg-blue-600 text-white rounded py-2">Create Account</button>
        <p className="text-sm text-center">
          <Link to="/login" className="text-blue-600">Back to Sign In</Link>
        </p>
      </form>
    </div>
  );
}
