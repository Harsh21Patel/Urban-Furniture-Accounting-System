import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import {
  Building2,
  ChevronDown,
  ShoppingBag,
  ShoppingCart,
  BookOpen,
  PieChart,
  UserPlus,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
    <nav
      ref={navRef}
      className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Logo */}
          <Link
            to={isContactUser ? '/portal' : '/dashboard'}
            onClick={closeDropdown}
            className="flex items-center gap-2 font-bold text-lg tracking-tight text-gray-900 dark:text-white hover:text-primary dark:hover:text-primary-dark"
          >
            <div className="w-8 h-8 rounded bg-primary dark:bg-primary-dark flex items-center justify-center text-white">
              <Building2 className="w-4 h-4 text-white" />
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
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium ${
                    activeDropdown === 'sales' || location.pathname.startsWith('/sales')
                      ? 'bg-primary/10 dark:bg-primary-dark/20 text-primary dark:text-primary-dark'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4 text-primary dark:text-primary-dark" />
                  <span>Sales</span>
                  <ChevronDown className={`w-3.5 h-3.5 ${activeDropdown === 'sales' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'sales' && (
                  <div className="absolute left-0 mt-1 w-48 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md py-1 z-50">
                    <Link
                      to="/sales"
                      onClick={closeDropdown}
                      className="block px-4 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary dark:hover:text-primary-dark"
                    >
                      Sales Order
                    </Link>
                    <Link
                      to="/sales/invoices"
                      onClick={closeDropdown}
                      className="block px-4 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary dark:hover:text-primary-dark"
                    >
                      Sale Invoice
                    </Link>
                    <Link
                      to="/payments"
                      onClick={closeDropdown}
                      className="block px-4 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary dark:hover:text-primary-dark"
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
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium ${
                    activeDropdown === 'purchase' || location.pathname.startsWith('/purchases')
                      ? 'bg-primary/10 dark:bg-primary-dark/20 text-primary dark:text-primary-dark'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4 text-primary dark:text-primary-dark" />
                  <span>Purchase</span>
                  <ChevronDown className={`w-3.5 h-3.5 ${activeDropdown === 'purchase' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'purchase' && (
                  <div className="absolute left-0 mt-1 w-48 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md py-1 z-50">
                    <Link
                      to="/purchases"
                      onClick={closeDropdown}
                      className="block px-4 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary dark:hover:text-primary-dark"
                    >
                      Purchase Order
                    </Link>
                    <Link
                      to="/purchases/bills"
                      onClick={closeDropdown}
                      className="block px-4 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary dark:hover:text-primary-dark"
                    >
                      Purchase Bill
                    </Link>
                    <Link
                      to="/payments"
                      onClick={closeDropdown}
                      className="block px-4 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary dark:hover:text-primary-dark"
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
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium ${
                    activeDropdown === 'account'
                      ? 'bg-primary/10 dark:bg-primary-dark/20 text-primary dark:text-primary-dark'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-primary dark:text-primary-dark" />
                  <span>Account</span>
                  <ChevronDown className={`w-3.5 h-3.5 ${activeDropdown === 'account' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'account' && (
                  <div className="absolute left-0 mt-1 w-52 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md py-1 z-50">
                    <Link
                      to="/contacts"
                      onClick={closeDropdown}
                      className="block px-4 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary dark:hover:text-primary-dark"
                    >
                      Contact
                    </Link>
                    <Link
                      to="/products"
                      onClick={closeDropdown}
                      className="block px-4 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary dark:hover:text-primary-dark"
                    >
                      Product
                    </Link>
                    <Link
                      to="/analytics"
                      onClick={closeDropdown}
                      className="block px-4 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary dark:hover:text-primary-dark"
                    >
                      Analyticals
                    </Link>
                    <Link
                      to="/budgets"
                      onClick={closeDropdown}
                      className="block px-4 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary dark:hover:text-primary-dark"
                    >
                      Analytical Budget
                    </Link>
                    <Link
                      to="/chart-of-accounts"
                      onClick={closeDropdown}
                      className="block px-4 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary dark:hover:text-primary-dark"
                    >
                      Chart of Account
                    </Link>
                    <Link
                      to="/journals"
                      onClick={closeDropdown}
                      className="block px-4 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary dark:hover:text-primary-dark"
                    >
                      Journals
                    </Link>
                    <Link
                      to="/journal-entries"
                      onClick={closeDropdown}
                      className="block px-4 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary dark:hover:text-primary-dark"
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
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium ${
                    activeDropdown === 'report' || location.pathname.startsWith('/reports')
                      ? 'bg-primary/10 dark:bg-primary-dark/20 text-primary dark:text-primary-dark'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <PieChart className="w-4 h-4 text-primary dark:text-primary-dark" />
                  <span>Report</span>
                  <ChevronDown className={`w-3.5 h-3.5 ${activeDropdown === 'report' ? 'rotate-180' : ''}`} />
                </button>
                {activeDropdown === 'report' && (
                  <div className="absolute right-0 mt-1 w-52 rounded bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md py-1 z-50">
                    <Link
                      to="/reports/balance-sheet"
                      onClick={closeDropdown}
                      className="block px-4 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary dark:hover:text-primary-dark"
                    >
                      Balancesheet
                    </Link>
                    <Link
                      to="/reports/profit-loss"
                      onClick={closeDropdown}
                      className="block px-4 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary dark:hover:text-primary-dark"
                    >
                      Profit and Loss
                    </Link>
                    <Link
                      to="/reports/budget"
                      onClick={closeDropdown}
                      className="block px-4 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary dark:hover:text-primary-dark"
                    >
                      Budget Report
                    </Link>
                    <Link
                      to="/reports/ledger"
                      onClick={closeDropdown}
                      className="block px-4 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary dark:hover:text-primary-dark"
                    >
                      General Ledger
                    </Link>
                    <Link
                      to="/reports/journal"
                      onClick={closeDropdown}
                      className="block px-4 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary dark:hover:text-primary-dark"
                    >
                      Journal Report
                    </Link>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* User Profile, Theme Toggle & Actions */}
          <div className="flex items-center gap-2">
            
            {/* Dark/Light Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-amber-400 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-gray-700" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {user && (
              <>
                {user.role === 'ADMIN' && (
                  <Link
                    to="/users/new"
                    onClick={closeDropdown}
                    className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded bg-primary hover:bg-primary-hover text-white dark:bg-primary-dark dark:hover:bg-primary text-xs font-medium"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create User</span>
                  </Link>
                )}

                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2.5 py-1 rounded">
                  <div className="w-6 h-6 rounded-full bg-primary/10 dark:bg-primary-dark/20 text-primary dark:text-primary-dark flex items-center justify-center font-bold text-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : user.loginId.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden lg:block text-left text-xs">
                    <p className="font-medium text-gray-800 dark:text-gray-100">{user.name || user.loginId}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium uppercase">{user.role}</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-1.5 rounded text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}

          </div>

        </div>
      </div>
    </nav>
  );
}
