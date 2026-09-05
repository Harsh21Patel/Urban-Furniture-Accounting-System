import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="flex justify-between items-center px-6 py-3 bg-white shadow">
      <Link to="/dashboard" className="font-semibold">Urban Furniture</Link>
      {user && (
        <button
          onClick={() => {
            logoutUser();
            navigate('/login');
          }}
          className="text-sm text-red-600"
        >
          Sign Out
        </button>
      )}
    </nav>
  );
}
