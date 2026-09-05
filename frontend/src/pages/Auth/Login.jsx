import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../api/endpoints.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { Building2, Lock, User, AlertCircle, Sun, Moon } from 'lucide-react';

export default function Login() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await login({ loginId, password });
      loginUser(data.token, data.user);
      if (data.user.role === 'CONTACT_USER') {
        navigate('/portal');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid Login Id or Password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-gray-900 dark:text-gray-100">
      
      {/* Theme Switcher Button on Auth page */}
      <div className="absolute top-4 right-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-amber-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon className="w-4 h-4 text-gray-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded bg-primary dark:bg-primary-dark text-white">
          <Building2 className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Urban Furniture</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">Accounting & ERP System</p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 py-6 px-6 rounded-md sm:px-8 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded p-3 flex items-center gap-2 text-red-600 dark:text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Login ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Enter your Login ID"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded pl-9 pr-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="Enter your Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded pl-9 pr-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover dark:bg-primary-dark dark:hover:bg-primary text-white font-medium py-2 px-4 rounded text-sm disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'SIGN IN'}
            </button>
          </form>

          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
            <button
              type="button"
              onClick={() => alert('Demo Credentials:\n\nAdmin: admin / Admin@123!\nAccountant: accountant / Acc@123!\nCustomer User: nimesh / User@123!')}
              className="hover:text-primary dark:hover:text-primary-dark"
            >
              Forgot Password
            </button>
            <Link to="/signup" className="text-primary dark:text-primary-dark font-medium hover:underline">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
