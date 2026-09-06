import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { salesApi, purchaseApi, paymentsApi } from '../../api/endpoints.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Navbar from '../../components/Navbar.jsx';
import PrintLetterhead from '../../components/PrintLetterhead.jsx';
import { FileText, CreditCard, Eye, Printer, Building2, CheckCircle2, X } from 'lucide-react';

export default function ContactPortal() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pay Modal State
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('BANK');

  // View / Print PDF Modal State
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedViewDoc, setSelectedViewDoc] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    if (!user.contactId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [iRes, bRes] = await Promise.all([
        salesApi.listInvoices({ contactId: user.contactId }),
        purchaseApi.listBills({ contactId: user.contactId }),
      ]);
      setInvoices(iRes.data || []);
      setBills(bRes.data || []);
    } catch (err) {
      console.error('Error fetching portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoc) return;
    try {
      if (selectedDoc.type === 'INVOICE') {
        await paymentsApi.payInvoice({
          invoiceId: selectedDoc.id,
          amount: parseFloat(payAmount),
          method: payMethod,
        });
      } else {
        await paymentsApi.payBill({
          vendorBillId: selectedDoc.id,
          amount: parseFloat(payAmount),
          method: payMethod,
        });
      }
      setShowPayModal(false);
      setSelectedDoc(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Payment failed');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const showInvoicesSection = invoices.length > 0 || bills.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 pb-12 print:bg-white print:text-black">
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Welcome Header */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-5 flex items-center justify-between print:hidden">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Welcome, {user?.name || user?.loginId}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              User Portal — View your statements, invoices & bills, download PDFs, and make direct payments.
            </p>
          </div>
          <div className="w-10 h-10 rounded bg-primary/10 dark:bg-primary-dark/20 text-primary dark:text-primary-dark flex items-center justify-center font-bold text-lg">
            {user?.name?.charAt(0) || 'U'}
          </div>
        </div>

        {/* Guard: no contactId linked */}
        {!user?.contactId && (
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-md p-5 text-center text-red-600 dark:text-red-400 text-xs print:hidden">
            <p className="font-bold text-sm mb-1">Portal Not Configured</p>
            <p>Your portal account is not linked to any contact record. Please contact an administrator to set up your access.</p>
          </div>
        )}

        {/* Customer Invoices Section */}
        {user?.contactId && showInvoicesSection && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-5 space-y-4 print:hidden">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary dark:text-primary-dark" />
              <span>My Invoices & Dues</span>
            </h2>

            {loading ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-xs">Loading your statements...</div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-xs">No invoices found for your account.</div>
            ) : (
              <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded">
                <table className="w-full text-left text-xs text-gray-800 dark:text-gray-200">
                  <thead className="bg-gray-50 dark:bg-gray-800/60 text-xs uppercase text-gray-600 dark:text-gray-300 font-semibold tracking-wider border-b border-gray-200 dark:border-gray-800">
                    <tr>
                      <th className="px-4 py-2.5">Invoice #</th>
                      <th className="px-4 py-2.5">Invoice Date</th>
                      <th className="px-4 py-2.5 text-right">Total Amount</th>
                      <th className="px-4 py-2.5 text-center">Status</th>
                      <th className="px-4 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                        <td className="px-4 py-2.5 font-bold text-gray-900 dark:text-white">{inv.invoiceNumber || `INV/${inv.id}`}</td>
                        <td className="px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400">
                          {new Date(inv.invoiceDate).toLocaleDateString('en-IN')}
                        </td>
                        <td className="px-4 py-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          ₹{Number(inv.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              inv.status === 'PAID'
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                                : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedViewDoc({ ...inv, docType: 'INVOICE' });
                                setShowViewModal(true);
                              }}
                              className="p-1.5 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition"
                              title="View / Download PDF Invoice"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {inv.status !== 'PAID' ? (
                              <button
                                onClick={() => {
                                  setSelectedDoc({ id: inv.id, type: 'INVOICE', amount: inv.totalAmount });
                                  setPayAmount(inv.totalAmount);
                                  setShowPayModal(true);
                                }}
                                className="flex items-center gap-1 px-3 py-1 rounded bg-primary hover:bg-primary-hover dark:bg-primary-dark text-white text-xs font-medium transition"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>Pay Dues</span>
                              </button>
                            ) : (
                              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5">Paid</span>
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
        )}

        {/* Vendor Bills Section */}
        {user?.contactId && bills.length > 0 && (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-5 space-y-4 print:hidden">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary dark:text-primary-dark" />
              <span>My Vendor Invoices</span>
            </h2>

            <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded">
              <table className="w-full text-left text-xs text-gray-800 dark:text-gray-200">
                <thead className="bg-gray-50 dark:bg-gray-800/60 text-xs uppercase text-gray-600 dark:text-gray-300 font-semibold tracking-wider border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-4 py-2.5">Invoice #</th>
                    <th className="px-4 py-2.5">Date</th>
                    <th className="px-4 py-2.5 text-right">Total Amount</th>
                    <th className="px-4 py-2.5 text-center">Status</th>
                    <th className="px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {bills.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                      <td className="px-4 py-2.5 font-bold text-gray-900 dark:text-white">{b.billNumber || `BILL/${b.id}`}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400">
                        {new Date(b.billDate).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 py-2.5 text-right font-bold text-primary dark:text-primary-dark font-mono">
                        ₹{Number(b.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            b.status === 'PAID'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                              : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedViewDoc({ ...b, docType: 'BILL' });
                              setShowViewModal(true);
                            }}
                            className="p-1.5 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition"
                            title="View / Download PDF Invoice"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* View / Download PDF Modal */}
        {showViewModal && selectedViewDoc && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 print:static print:bg-white print:p-0">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-6 max-w-2xl w-full space-y-4 print:border-none print:shadow-none print:bg-white print:text-black print:p-0 print:max-w-none">
              
              {/* Printable Letterhead */}
              <PrintLetterhead
                title={selectedViewDoc.docType === 'INVOICE' ? 'Tax Invoice' : 'Purchase Bill'}
                reference={
                  selectedViewDoc.docType === 'INVOICE'
                    ? selectedViewDoc.invoiceNumber || `INV/${selectedViewDoc.id}`
                    : selectedViewDoc.billNumber || `BILL/${selectedViewDoc.id}`
                }
                subtitle={selectedViewDoc.docType === 'INVOICE' ? 'Customer Copy' : 'Vendor Copy'}
              />

              {/* Header (screen only) */}
              <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-800 pb-3 print:hidden">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-primary text-white flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900 dark:text-white">Urban Furniture</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedViewDoc.docType === 'INVOICE' ? 'Sales Invoice' : 'Purchase Bill'} —{' '}
                      {selectedViewDoc.docType === 'INVOICE'
                        ? selectedViewDoc.invoiceNumber || `INV/${selectedViewDoc.id}`
                        : selectedViewDoc.billNumber || `BILL/${selectedViewDoc.id}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-primary dark:text-primary-dark">
                    {selectedViewDoc.docType === 'INVOICE'
                      ? selectedViewDoc.invoiceNumber || `INV/${selectedViewDoc.id}`
                      : selectedViewDoc.billNumber || `BILL/${selectedViewDoc.id}`}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Date:{' '}
                    {new Date(
                      selectedViewDoc.docType === 'INVOICE' ? selectedViewDoc.invoiceDate : selectedViewDoc.billDate
                    ).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Partner + Meta Info */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/60 p-3 rounded-md border border-gray-200 dark:border-gray-800 print:bg-gray-50 print:border print:border-gray-300 print:rounded-none">
                <div>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                    {selectedViewDoc.docType === 'INVOICE' ? 'Billed To:' : 'Vendor:'}
                  </p>
                  <p className="text-xs font-bold text-gray-900 dark:text-white print:text-black mt-0.5">
                    {selectedViewDoc.docType === 'INVOICE'
                      ? selectedViewDoc.salesOrder?.contact?.name
                      : selectedViewDoc.purchaseOrder?.contact?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-600">
                    {selectedViewDoc.docType === 'INVOICE'
                      ? selectedViewDoc.salesOrder?.contact?.email
                      : selectedViewDoc.purchaseOrder?.contact?.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-600">
                    {selectedViewDoc.docType === 'INVOICE'
                      ? selectedViewDoc.salesOrder?.contact?.mobile
                      : selectedViewDoc.purchaseOrder?.contact?.mobile}
                  </p>
                  {((selectedViewDoc.docType === 'INVOICE'
                    ? selectedViewDoc.salesOrder?.contact?.city
                    : selectedViewDoc.purchaseOrder?.contact?.city)) && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 print:text-gray-600">
                      {selectedViewDoc.docType === 'INVOICE'
                        ? selectedViewDoc.salesOrder?.contact?.city
                        : selectedViewDoc.purchaseOrder?.contact?.city}
                    </p>
                  )}
                </div>
                <div className="text-right space-y-1">
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                      {selectedViewDoc.docType === 'INVOICE' ? 'Invoice Date:' : 'Bill Date:'}
                    </p>
                    <p className="text-xs font-semibold text-gray-900 dark:text-white print:text-black">
                      {new Date(
                        selectedViewDoc.docType === 'INVOICE' ? selectedViewDoc.invoiceDate : selectedViewDoc.billDate
                      ).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  {selectedViewDoc.dueDate && (
                    <div>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Due Date:</p>
                      <p className="text-xs font-semibold text-rose-600 print:text-black">
                        {new Date(selectedViewDoc.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Status:</p>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-semibold text-xs uppercase print:border-gray-400 print:bg-gray-100 print:text-black">
                      {selectedViewDoc.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded-md">
                <table className="w-full text-left text-xs text-gray-700 dark:text-gray-300 print:text-black">
                  <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 font-semibold uppercase text-[10px] print:bg-gray-100 print:text-black">
                    <tr>
                      <th className="px-3 py-2">Item Description</th>
                      <th className="px-3 py-2 text-right">Qty</th>
                      <th className="px-3 py-2 text-right">Unit Price (₹)</th>
                      {selectedViewDoc.docType === 'INVOICE' && <th className="px-3 py-2 text-right">Tax (%)</th>}
                      <th className="px-3 py-2 text-right">Subtotal (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800 print:divide-gray-200">
                    {(selectedViewDoc.docType === 'INVOICE'
                      ? selectedViewDoc.salesOrder?.lines
                      : selectedViewDoc.purchaseOrder?.lines
                    )?.map((line) => {
                      const taxRate = selectedViewDoc.docType === 'INVOICE' ? (line.taxPercent || 0) : 0;
                      const sub = line.quantity * line.unitPrice * (1 + taxRate / 100);
                      return (
                        <tr key={line.id}>
                          <td className="px-3 py-2 font-medium text-gray-900 dark:text-white print:text-black">{line.product?.name}</td>
                          <td className="px-3 py-2 text-right font-mono">{line.quantity}</td>
                          <td className="px-3 py-2 text-right font-mono">₹{line.unitPrice}</td>
                          {selectedViewDoc.docType === 'INVOICE' && (
                            <td className="px-3 py-2 text-right font-mono">{line.taxPercent || 0}%</td>
                          )}
                          <td className="px-3 py-2 text-right font-mono font-bold text-gray-900 dark:text-white print:text-black">
                            ₹{sub.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="border-t border-gray-200 dark:border-gray-800 font-bold print:border-gray-300">
                    <tr>
                      <td colSpan={selectedViewDoc.docType === 'INVOICE' ? 4 : 3} className="px-3 py-2 text-right uppercase text-gray-500 dark:text-gray-400">
                        Total {selectedViewDoc.docType === 'INVOICE' ? 'Invoice' : 'Bill'} Amount:
                      </td>
                      <td className="px-3 py-2 text-right text-xs font-bold text-emerald-600 dark:text-emerald-400 print:text-black">
                        ₹{Number(selectedViewDoc.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Signatory + Disclaimer (print only) */}
              <div className="hidden print:block mt-10">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p style={{ fontSize: 9, color: '#6b7280', marginBottom: 32 }}>
                      {selectedViewDoc.docType === 'INVOICE' ? 'Customer Acknowledgement:' : 'Vendor Acknowledgement:'}
                    </p>
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
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-800 print:hidden">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-hover dark:bg-primary-dark text-white rounded text-xs font-semibold transition"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Download / Print PDF</span>
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

        {/* Pay Modal */}
        {showPayModal && selectedDoc && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 print:hidden">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-6 max-w-md w-full space-y-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Pay Dues</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Direct portal payment for {selectedDoc.type === 'INVOICE' ? `INV/${selectedDoc.id}` : `BILL/${selectedDoc.id}`}
              </p>

              <form onSubmit={handlePaySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Amount (Rs.) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-white font-bold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  >
                    <option value="BANK">Bank Transfer</option>
                    <option value="CASH">Cash</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                  <button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary-hover dark:bg-primary-dark dark:hover:bg-primary text-white font-medium py-2 rounded text-sm"
                  >
                    Confirm & Pay
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPayModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded text-sm font-medium"
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

