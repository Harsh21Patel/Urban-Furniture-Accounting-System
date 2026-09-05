import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Building2,
  ChevronDown,
  ShoppingBag,
  ShoppingCart,
  BookOpen,
  PieChart,
  UserPlus,
  LogOut,
  UserCheck,
} from 'lucide-react';

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const navRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (menu) => {
    setActiveDropdown((prev) => (prev === menu ? null : menu));
  };

  const closeDropdown = () => setActiveDropdown(null);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const isContactUser = user?.role === 'CONTACT_USER';

  return (
    <nav ref={navRef} className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link
            to={isContactUser ? '/portal' : '/dashboard'}
            onClick={closeDropdown}
            className="flex items-center gap-2.5 font-bold text-xl tracking-tight text-white hover:text-indigo-400 transition"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span>Urban Furniture</span>
          </Link>

          {/* Navigation Dropdown Menus (Admin & Accountant) */}
          {!isContactUser && (
            <div className="hidden md:flex items-center space-x-1">
              
              {/* Sales Menu */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('sales')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                    activeDropdown === 'sales' || location.pathname.startsWith('/sales')
                      ? 'bg-slate-800 text-indigo-400'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Sales</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'sales' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'sales' && (
                  <div className="absolute left-0 mt-2 w-48 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                    <Link
                      to="/sales"
                      onClick={closeDropdown}
                      className="block px-4 py-2 text-sm text-slate-200 hover:bg-indigo-600 hover:text-white transition"
                    >
                      Sales Order
                    </Link>
                    <Link
                      to="/sales/invoices"
                      onClick={closeDropdown}
                      className="block px-4 py-2 text-sm text-slate-200 hover:bg-indigo-600 hover:text-white transition"
                    >
                      Sale Invoice
                    </Link>
                    <Link
                      to="/payments"
                      onClick={closeDropdown}
                      className="block px-4 py-2 text-sm text-slate-200 hover:bg-indigo-600 hover:text-white transition"
                    >
                      Receipt
                    </Link>
                  </div>
                )}
              </div>

              {/* Purchase Menu */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('purchase')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                    activeDropdown === 'purchase' || location.pathname.startsWith('/purchases')
                      ? 'bg-slate-800 text-indigo-400'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Purchase</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'purchase' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'purchase' && (
                  <div className="absolute left-0 mt-2 w-48 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                    <Link
                      to="/purchases"
                      onClick={closeDropdown}
                      className="block px-4 py-2 text-sm text-slate-200 hover:bg-indigo-600 hover:text-white transition"
                    >
                      Purchase Order
                    </Link>
                    <Link
                      to="/purchases/bills"
                      onClick={closeDropdown}
                      className="block px-4 py-2 text-sm text-slate-200 hover:bg-indigo-600 hover:text-white transition"
                    >
                      Purchase Bill
                    </Link>
                    <Link
                      to="/payments"
                      onClick={closeDropdown}
                      className="block px-4 py-2 text-sm text-slate-200 hover:bg-indigo-600 hover:text-white transition"
                    >
                      Payment
                    </Link>
                  </div>
                )}
              </div>

              {/* Account Master Menu */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('account')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                    activeDropdown === 'account'
                      ? 'bg-slate-800 text-indigo-400'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Account</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'account' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'account' && (
                  <div className="absolute left-0 mt-2 w-52 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                    <Link
                      to="/contacts"
                      onClick={closeDropdown}
                      className="block px-4 py-2 text-sm text-slate-200 hover:bg-indigo-600 hover:text-white transition"
                    >
                      Contact
                    </Link>
                    <Link
                      to="/products"
                      onClick={closeDropdown}
                      className="block px-4 py-2 text-sm text-slate-200 hover:bg-indigo-600 hover:text-white transition"
                    >
                      Product
                    </Link>
                    <Link
                      to="/analytics"
                      onClick={closeDropdown}
                      className="block px-4 py-2 text-sm text-slate-200 hover:bg-indigo-600 hover:text-white transition"
                    >
                      Analyticals
                    </Link>
                    <Link
                      to="/budgets"
                      onClick={closeDropdown}
                      className="block px-4 py-2 text-sm text-slate-200 hover:bg-indigo-600 hover:text-white transition"
                    >
                      Analytical Budget
                    </Link>
                    <Link
                      to="/chart-of-accounts"
                      onClick={closeDropdown}
                      className="block px-4 py-2 text-sm text-slate-200 hover:bg-indigo-600 hover:text-white transition"
                    >
                      Chart of Account
                    </Link>
                    <Link
                      to="/journals"
                      onClick={closeDropdown}
                      className="block px-4 py-2 text-sm text-slate-200 hover:bg-indigo-600 hover:text-white transition"
                    >
                      Journals
                    </Link>
                    <Link
                      to="/journal-entries"
                      onClick={closeDropdown}
                      className="block px-4 py-2 text-sm text-slate-200 hover:bg-indigo-600 hover:text-white transition"
                    >
                      Journal Entries
                    </Link>
                  </div>
                )}
              </div>

              {/* Report Menu */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('report')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition ${
                    activeDropdown === 'report' || location.pathname.startsWith('/reports')
                      ? 'bg-slate-800 text-indigo-400'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <PieChart className="w-4 h-4" />
                  <span>Report</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'report' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'report' && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl bg-slate-800 border border-slate-700 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                    <Link
                      to="/reports/balance-sheet"
                      onClick={closeDropdown}
                      className="block px-4 py-2 text-sm text-slate-200 hover:bg-indigo-600 hover:text-white transition"
                    >
                      Balancesheet
                    </Link>
                    <Link
                      to="/reports/profit-loss"
                      onClick={closeDropdown}
                      className="block px-4 py-2 text-sm text-slate-200 hover:bg-indigo-600 hover:text-white transition"
                    >
                      Profit and Loss
                    </Link>
                    <Link
                      to="/reports/budget"
                      onClick={closeDropdown}
                      className="block px-4 py-2 text-sm text-slate-200 hover:bg-indigo-600 hover:text-white transition"
                    >
                      Budget Report
                    </Link>
                    <Link
                      to="/reports/ledger"
                      onClick={closeDropdown}
                      className="block px-4 py-2 text-sm text-slate-200 hover:bg-indigo-600 hover:text-white transition"
                    >
                      General Ledger
                    </Link>
                    <Link
                      to="/reports/journal"
                      onClick={closeDropdown}
                      className="block px-4 py-2 text-sm text-slate-200 hover:bg-indigo-600 hover:text-white transition"
                    >
                      Journal Report
                    </Link>
                  </div>
                )}
              </div>


            </div>
          )}

          {/* User Profile & Actions */}
          {user && (
            <div className="flex items-center gap-3">
              {user.role === 'ADMIN' && (
                <Link
                  to="/users/new"
                  onClick={closeDropdown}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create User</span>
                </Link>
              )}

              <div className="flex items-center gap-2.5 bg-slate-800/90 border border-slate-700/60 px-3 py-1.5 rounded-xl">
                <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 flex items-center justify-center font-bold text-xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : user.loginId.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block text-left text-xs">
                  <p className="font-semibold text-slate-100">{user.name || user.loginId}</p>
                  <p className="text-[10px] text-indigo-400 font-medium uppercase tracking-wider">{user.role}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </nav>
  );
}
