import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const TILES = [
  { label: 'Sales', to: '/sales' },
  { label: 'Purchase', to: '/purchases' },
  { label: 'Contacts', to: '/contacts' },
  { label: 'Products', to: '/products' },
  { label: 'Chart of Accounts', to: '/chart-of-accounts' },
  { label: 'Journals', to: '/journals' },
  { label: 'Journal Entries', to: '/journal-entries' },
  { label: 'Analytics / Budget', to: '/budgets' },
  { label: 'Balance Sheet', to: '/reports/balance-sheet' },
  { label: 'Profit & Loss', to: '/reports/profit-loss' },
  { label: 'Budget Report', to: '/reports/budget' },
];

export default function Dashboard() {
  const { user, logoutUser } = useAuth();

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Welcome, {user?.loginId}</h1>
        <button onClick={logoutUser} className="text-sm text-red-600">Sign Out</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {TILES.map((t) => (
          <Link key={t.to} to={t.to} className="bg-white shadow rounded-lg p-6 text-center hover:shadow-md">
            {t.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
