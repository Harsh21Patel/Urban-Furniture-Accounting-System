import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { purchaseApi, paymentsApi } from '../../api/endpoints.js';
import Navbar from '../../components/Navbar.jsx';
import PrintLetterhead from '../../components/PrintLetterhead.jsx';
import {
  FileText,
  ArrowLeft,
  CreditCard,
  Printer,
  Eye,
  Building2,
  Search,
  Filter,
  Calendar,
  X
} from 'lucide-react';

export default function PurchaseBillList() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showPayModal, setShowPayModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('BANK');

  const navigate = useNavigate();

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await purchaseApi.listBills();
      setBills(res.data || []);
    } catch (err) {
      console.error('Error fetching vendor bills:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!selectedBill) return;
    try {
      await paymentsApi.payBill({
        vendorBillId: selectedBill.id,
        amount: parseFloat(payAmount),
        method: payMethod,
      });
      setShowPayModal(false);
      setSelectedBill(null);
      fetchBills();
    } catch (err) {
      alert(err.response?.data?.message || 'Payment failed');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const hasActiveFilters = search || statusFilter !== 'ALL' || dateFrom || dateTo;

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setDateFrom('');
    setDateTo('');
  };

  const filteredBills = bills.filter((b) => {
    const q = search.toLowerCase().trim();
    const billNumber = (b.billNumber || `BILL/${b.id}`).toLowerCase();
    const poNumber = `po/# ${b.purchaseOrderId}`.toLowerCase();
    const poNumberAlt = `po/#${b.purchaseOrderId}`.toLowerCase();
    const vendorName = (b.purchaseOrder?.contact?.name || '').toLowerCase();

    const matchesSearch =
      !q ||
      billNumber.includes(q) ||
      poNumber.includes(q) ||
      poNumberAlt.includes(q) ||
      vendorName.includes(q) ||
      String(b.id).includes(q) ||
      String(b.purchaseOrderId).includes(q);

    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;

    let matchesDate = true;
    if (dateFrom) {
      matchesDate = matchesDate && new Date(b.billDate) >= new Date(dateFrom);
    }
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      matchesDate = matchesDate && new Date(b.billDate) <= end;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 pb-16 print:bg-white print:text-black">
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-md print:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/purchases')}
              className="p-2 rounded bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Vendor Bills</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Bills created from converted Purchase Orders</p>
            </div>
          </div>
        </div>

        {/* Filter / Search Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-3 rounded-md print:hidden">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Bill #, PO #, Vendor..."
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
                <option value="UNPAID">Unpaid</option>
                <option value="PARTIALLY_PAID">Partially Paid</option>
                <option value="PAID">Paid</option>
              </select>
            </div>

            {/* Date Range Inputs */}
            <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2 py-1">
              <Calendar className="w-3.5 h-3.5 text-gray-500" />
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                title="From Bill Date"
                className="bg-transparent text-xs text-gray-700 dark:text-gray-300 focus:outline-none"
              />
              <span className="text-gray-400 text-xs">to</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                title="To Bill Date"
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
              Showing {filteredBills.length} of {bills.length}
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden print:hidden">
          {loading ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-xs">Loading vendor bills...</div>
          ) : filteredBills.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-xs">No vendor bills found matching the filter criteria.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300">
                <thead className="bg-gray-50 dark:bg-gray-800/60 text-[11px] uppercase text-gray-600 dark:text-gray-400 font-semibold tracking-wider border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-4 py-3">Bill Reference</th>
                    <th className="px-4 py-3">Purchase Order</th>
                    <th className="px-4 py-3">Vendor</th>
                    <th className="px-4 py-3">Bill Date</th>
                    <th className="px-4 py-3 text-right">Total Amount</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredBills.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary dark:text-primary-dark" />
                        <span>{b.billNumber || `BILL/${b.id}`}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">PO/# {b.purchaseOrderId}</td>
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">
                        {b.purchaseOrder?.contact?.name}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                        {new Date(b.billDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-white">
                        ₹{Number(b.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            b.status === 'UNPAID'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800'
                              : b.status === 'PARTIALLY_PAID'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedBill(b);
                              setShowViewModal(true);
                            }}
                            className="p-1.5 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                            title="View / Print Bill"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {b.status !== 'PAID' && (
                            <button
                              onClick={() => {
                                setSelectedBill(b);
                                setPayAmount(b.totalAmount);
                                setShowPayModal(true);
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 rounded bg-primary hover:bg-primary-hover dark:bg-primary-dark dark:hover:bg-primary text-white text-xs font-semibold"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Pay</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* View / Print Bill Modal */}
        {showViewModal && selectedBill && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 print:static print:bg-white print:p-0">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-6 max-w-2xl w-full space-y-6 print:border-none print:shadow-none print:bg-white print:text-black print:p-0 print:max-w-none">
              {/* ── Letterhead (print only) ── */}
              <PrintLetterhead
                title="Purchase Bill"
                reference={selectedBill.billNumber || `BILL/${selectedBill.id}`}
                subtitle="Vendor Copy"
              />

              {/* Header (screen only) */}
              <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-800 pb-4 print:hidden">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded bg-primary dark:bg-primary-dark flex items-center justify-center text-white font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Urban Furniture</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Purchase Bill — {selectedBill.billNumber || `BILL/${selectedBill.id}`}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-primary dark:text-primary-dark">
                    {selectedBill.billNumber || `BILL/${selectedBill.id}`}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Date: {new Date(selectedBill.billDate).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Vendor + Bill meta */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md border border-gray-200 dark:border-gray-800 print:bg-gray-50 print:border-gray-300 print:rounded-none">
                <div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider print:text-gray-600">Vendor:</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white print:text-black mt-0.5">
                    {selectedBill.purchaseOrder?.contact?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-600">
                    {selectedBill.purchaseOrder?.contact?.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-600">
                    {selectedBill.purchaseOrder?.contact?.mobile}
                  </p>
                  {selectedBill.purchaseOrder?.contact?.city && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-600">
                      {selectedBill.purchaseOrder.contact.city}{selectedBill.purchaseOrder.contact.state ? `, ${selectedBill.purchaseOrder.contact.state}` : ''}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="space-y-1">
                    <div>
                      <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Bill Date:</p>
                      <p className="text-xs font-semibold text-gray-900 dark:text-white print:text-black">{new Date(selectedBill.billDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</p>
                    </div>
                    {selectedBill.dueDate && (
                      <div>
                        <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Due Date:</p>
                        <p className="text-xs font-semibold text-rose-600 print:text-black">{new Date(selectedBill.dueDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Status:</p>
                      <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase border border-emerald-200 dark:border-emerald-800 print:border-gray-400 print:bg-gray-100 print:text-black">
                        {selectedBill.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300 print:text-black">
                  <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-semibold uppercase text-[10px] print:bg-gray-100 print:text-black">
                    <tr>
                      <th className="px-4 py-2">Item Description</th>
                      <th className="px-4 py-2 text-right">Qty</th>
                      <th className="px-4 py-2 text-right">Unit Price (₹)</th>
                      <th className="px-4 py-2 text-right">Subtotal (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800 print:divide-gray-200">
                    {selectedBill.purchaseOrder?.lines?.map((line) => {
                      const sub = line.quantity * line.unitPrice;
                      return (
                        <tr key={line.id}>
                          <td className="px-4 py-2 font-medium text-gray-900 dark:text-white print:text-black">{line.product?.name}</td>
                          <td className="px-4 py-2 text-right font-mono">{line.quantity}</td>
                          <td className="px-4 py-2 text-right font-mono">₹{line.unitPrice}</td>
                          <td className="px-4 py-2 text-right font-mono font-bold text-gray-900 dark:text-white print:text-black">
                            ₹{sub.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="border-t border-gray-200 dark:border-gray-800 font-bold print:border-gray-300">
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-right uppercase text-gray-500 dark:text-gray-400">Total Bill Amount:</td>
                      <td className="px-4 py-3 text-right text-sm font-extrabold text-primary dark:text-primary-dark print:text-black">
                        ₹{Number(selectedBill.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Signatory + Disclaimer (print only) */}
              <div className="hidden print:block mt-10">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p style={{ fontSize: 9, color: '#6b7280', marginBottom: 32 }}>Vendor Acknowledgement:</p>
                    <div style={{ borderTop: '1px solid #9ca3af', paddingTop: 4 }}>
                      <p style={{ fontSize: 9, color: '#6b7280' }}>Signature &amp; Date</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p style={{ fontSize: 9, color: '#6b7280', marginBottom: 32 }}>For Urban Furniture:</p>
                    <div style={{ borderTop: '1px solid #9ca3af', paddingTop: 4 }}>
                      <p style={{ fontSize: 9, color: '#6b7280' }}>Authorized Signatory</p>
                    </div>
                  </div>
                </div>
                <div className="print-disclaimer">
                  This is a computer-generated document. No physical signature is required. &nbsp;|&nbsp;
                  Urban Furniture, Ahmedabad, Gujarat &nbsp;|&nbsp; urbanSales@odoo.com
                </div>
              </div>

              {/* Actions (screen only) */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800 print:hidden">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-primary-hover dark:bg-primary-dark dark:hover:bg-primary text-white rounded text-xs font-semibold"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Bill PDF</span>
                </button>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pay Bill Modal */}
        {showPayModal && selectedBill && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-6 max-w-md w-full space-y-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Pay Vendor Bill</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Register payment for {selectedBill.billNumber || `BILL/${selectedBill.id}`} (Amount: ₹{Number(selectedBill.totalAmount).toLocaleString('en-IN')})
              </p>

              <form onSubmit={handlePaySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Payment Amount (Rs.) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-white font-bold focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary"
                  >
                    <option value="BANK">Bank Transfer (Bank Journal)</option>
                    <option value="CASH">Cash (Cash Journal)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => setShowPayModal(false)}
                    className="px-3 py-1.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-primary hover:bg-primary-hover dark:bg-primary-dark dark:hover:bg-primary text-white font-semibold rounded text-xs"
                  >
                    Confirm Payment
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
