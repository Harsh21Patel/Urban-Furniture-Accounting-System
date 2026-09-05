import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../api/endpoints.js';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Login() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await login({ loginId, password });
      loginUser(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid Login Id or Password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow w-80 space-y-4">
        <h1 className="text-xl font-semibold text-center">Urban Furniture</h1>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Login Id"
          value={loginId}
          onChange={(e) => setLoginId(e.target.value)}
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full bg-blue-600 text-white rounded py-2">Sign In</button>
        <p className="text-sm text-center">
          <Link to="/signup" className="text-blue-600">Sign Up</Link>
        </p>
      </form>
    </div>
  );
}
