import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { salesApi, paymentsApi } from '../../api/endpoints.js';
import Navbar from '../../components/Navbar.jsx';
import {
  ShoppingBag,
  Plus,
  ArrowLeft,
  CheckCircle2,
  FileText,
  CreditCard,
  DollarSign,
  Search,
  Filter,
  Calendar,
  X
} from 'lucide-react';

export default function SalesOrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('BANK');

  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await salesApi.listOrders();
      setOrders(res.data || []);
    } catch (err) {
      console.error('Error fetching sales orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id) => {
    try {
      await salesApi.confirmOrder(id);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to confirm sales order');
    }
  };

  const handleGenerateInvoice = async (id) => {
    try {
      await salesApi.generateInvoice(id, {});
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate invoice');
    }
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    try {
      await paymentsApi.payInvoice({
        invoiceId: selectedInvoice.id,
        amount: parseFloat(payAmount),
        method: payMethod,
      });
      setShowPayModal(false);
      setSelectedInvoice(null);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Payment failed');
    }
  };

  const hasActiveFilters = search || statusFilter !== 'ALL' || dateFrom || dateTo;

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setDateFrom('');
    setDateTo('');
  };

  const filteredOrders = orders.filter((o) => {
    const q = search.toLowerCase().trim();
    const orderIdStr = `so/#${o.id}`.toLowerCase();
    const customerName = (o.contact?.name || '').toLowerCase();
    const itemsStr = (o.lines || []).map((l) => l.product?.name || '').join(' ').toLowerCase();

    const matchesSearch =
      !q ||
      orderIdStr.includes(q) ||
      customerName.includes(q) ||
      itemsStr.includes(q) ||
      String(o.id).includes(q);

    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;

    let matchesDate = true;
    if (dateFrom) {
      matchesDate = matchesDate && new Date(o.date) >= new Date(dateFrom);
    }
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      matchesDate = matchesDate && new Date(o.date) <= end;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-4">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Sales Orders (SO)</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Order processing: Create SO → Confirm → Generate Invoice → Payment</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/sales/invoices')}
              className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <FileText className="w-4 h-4 text-primary dark:text-primary-dark" />
              <span>Customer Invoices</span>
            </button>

            <button
              onClick={() => navigate('/sales/new')}
              className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover dark:bg-primary-dark text-white text-xs font-semibold px-3 py-2 rounded transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Sales Order</span>
            </button>
          </div>
        </div>

        {/* Filter / Search Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 rounded-md">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by SO #, Customer, Product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Dropdown */}
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2.5 py-1.5">
              <Filter className="w-3.5 h-3.5 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs text-gray-700 dark:text-gray-300 focus:outline-none font-medium"
              >
                <option value="ALL">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="INVOICED">Invoiced</option>
              </select>
            </div>

            {/* Date Range Inputs */}
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2 py-1">
              <Calendar className="w-3.5 h-3.5 text-gray-500" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                title="From Date"
                className="bg-transparent text-xs text-gray-700 dark:text-gray-300 focus:outline-none"
              />
              <span className="text-gray-400 text-xs">to</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                title="To Date"
                className="bg-transparent text-xs text-gray-700 dark:text-gray-300 focus:outline-none"
              />
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded transition"
                title="Clear Filters"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}

            {/* Results Count Badge */}
            <span className="text-xs text-gray-500 dark:text-gray-400 px-1 font-medium">
              Showing {filteredOrders.length} of {orders.length}
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden">
          {loading ? (
            <div className="text-center py-12 text-xs text-gray-500 dark:text-gray-400">Loading sales orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-500 dark:text-gray-400">No sales orders found matching the filter criteria.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300">
                <thead className="bg-gray-50 dark:bg-gray-800/60 uppercase text-[11px] text-gray-600 dark:text-gray-400 font-semibold border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Order Items</th>
                    <th className="px-4 py-3 text-right">Total Amount</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredOrders.map((o) => {
                    const totalAmt = o.lines?.reduce(
                      (s, l) => s + Number(l.unitPrice) * l.quantity * (1 - Number(l.discountPercent || 0) / 100) * (1 + Number(l.taxPercent) / 100),
                      0
                    ) || 0;

                    return (
                      <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                        <td className="px-4 py-3 font-mono font-bold text-primary dark:text-primary-dark">SO/#{o.id}</td>
                        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-primary dark:text-primary-dark" />
                          <span>{o.contact?.name}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 font-mono">
                          {new Date(o.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                          {o.lines?.map((l) => `${l.product?.name} (x${l.quantity})`).join(', ')}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          ₹{totalAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              o.status === 'DRAFT'
                                ? 'bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                : o.status === 'CONFIRMED'
                                ? 'bg-primary-light text-primary dark:bg-primary-dark/20 dark:text-primary-dark border border-primary/20 dark:border-primary-dark/30'
                                : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {o.status === 'DRAFT' && (
                              <button
                                onClick={() => handleConfirm(o.id)}
                                className="px-3 py-1.5 rounded bg-primary hover:bg-primary-hover dark:bg-primary-dark text-white text-xs font-semibold"
                              >
                                Confirm
                              </button>
                            )}

                            {o.status === 'CONFIRMED' && (
                              <button
                                onClick={() => handleGenerateInvoice(o.id)}
                                className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                              >
                                Generate Invoice
                              </button>
                            )}

                            {o.status === 'INVOICED' && o.invoice && (
                              o.invoice.status === 'PAID' ? (
                                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-2 py-1 rounded">
                                  PAID (INV/{o.invoice.id})
                                </span>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedInvoice(o.invoice);
                                    setPayAmount(o.invoice.totalAmount);
                                    setShowPayModal(true);
                                  }}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                                >
                                  <CreditCard className="w-3.5 h-3.5" />
                                  <span>Pay Invoice</span>
                                </button>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payment Modal */}
        {showPayModal && selectedInvoice && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-6 max-w-md w-full space-y-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Receive Customer Payment</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Register payment against Customer Invoice INV/{selectedInvoice.id} (Total: ₹{Number(selectedInvoice.totalAmount).toLocaleString('en-IN')})
              </p>

              <form onSubmit={handlePaySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Payment Amount (Rs.) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-xs text-gray-900 dark:text-white font-bold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Payment Method (Journal Target) *
                  </label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="BANK">Bank Transfer (Bank Journal)</option>
                    <option value="CASH">Cash (Cash Journal)</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-2 rounded transition"
                  >
                    Register Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPayModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
