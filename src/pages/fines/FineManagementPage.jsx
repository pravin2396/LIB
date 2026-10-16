import React, { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  Receipt,
  CreditCard,
  Banknote,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Check,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { fineService, DAILY_FINE_RATE } from '../../services/fineService';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

const FineManagementPage = () => {
  // Main data states
  const [fines, setFines] = useState([]);
  const [metrics, setMetrics] = useState({
    totalRecords: 0,
    overdueBooksCount: 0,
    totalFineAmount: 0,
    paidAmount: 0,
    unpaidAmount: 0,
    paidCount: 0,
    unpaidCount: 0,
    dailyRate: DAILY_FINE_RATE,
  });

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'Unpaid' | 'Overdue' | 'Paid'

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal states
  const [paymentModalFine, setPaymentModalFine] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [customAmount, setCustomAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Receipt Modal state
  const [receiptModalData, setReceiptModalData] = useState(null);

  // Load and synchronize data from service
  const reloadData = () => {
    const synchronizedFines = fineService.getFines();
    const summaryMetrics = fineService.getFineMetrics();

    setFines(synchronizedFines);
    setMetrics(summaryMetrics);
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Filtered fines list for History Ledger
  const filteredFines = useMemo(() => {
    return fines.filter((item) => {
      // 1. Status Filter
      if (statusFilter === 'Overdue') {
        if (item.status === 'Paid' || (item.daysOverdue || 0) <= 0) {
          return false;
        }
      } else if (statusFilter !== 'ALL' && item.status !== statusFilter) {
        return false;
      }

      // 2. Search Query (Member Name, Member Email, Book Title, Fine Code, ISBN)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const memberMatch = item.memberName?.toLowerCase().includes(q);
        const emailMatch = item.memberEmail?.toLowerCase().includes(q);
        const bookMatch = item.bookTitle?.toLowerCase().includes(q);
        const codeMatch = item.fineCode?.toLowerCase().includes(q);
        const issueCodeMatch = item.issueCode?.toLowerCase().includes(q);
        const isbnMatch = item.isbn?.toLowerCase().includes(q);

        return memberMatch || emailMatch || bookMatch || codeMatch || issueCodeMatch || isbnMatch;
      }

      return true;
    });
  }, [fines, statusFilter, searchQuery]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredFines.length / itemsPerPage));
  const paginatedList = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredFines.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredFines, currentPage, itemsPerPage]);

  // Handle open payment modal
  const handleOpenPayment = (fine) => {
    setPaymentModalFine(fine);
    setCustomAmount(fine.fineAmount.toString());
    setPaymentMethod('Cash');
    setPaymentNotes('');
  };

  // Submit payment
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentModalFine) return;
    if (isSubmitting) return;

    const amountVal = parseFloat(customAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
      toast.warning('Please enter a valid fine amount to pay.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await fineService.payFine(paymentModalFine.id, {
        paymentMethod,
        customAmount: amountVal,
        notes: paymentNotes,
      });

      toast.success(
        `Fine of $${amountVal.toFixed(2)} recorded as PAID for ${updated.memberName}! Receipt ${updated.receiptNumber} generated.`
      );

      setPaymentModalFine(null);
      reloadData();

      // Show receipt view
      setReceiptModalData(updated);
    } catch (err) {
      toast.error(err.message || 'Failed to process fine payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle fine status (UI Only feature)
  const handleToggleStatus = async (fineId) => {
    try {
      const updated = await fineService.togglePaymentStatus(fineId);
      toast.info(`Payment status updated to "${updated.status}" for ${updated.fineCode}.`);
      reloadData();
    } catch (err) {
      toast.error(err.message || 'Failed to toggle status.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800 mb-2">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Circulation Billing & Penalty Desk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Fine Calculation & Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Automatically calculate overdue fines, record payments, monitor fee history, and manage outstanding patron liabilities.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>
              Standard Fine Rate: <strong className="text-slate-900 font-bold">${DAILY_FINE_RATE.toFixed(2)}/day</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div
          onClick={() => {
            setStatusFilter('ALL');
            setCurrentPage(1);
          }}
          className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex items-center justify-between cursor-pointer hover:border-indigo-300 transition-colors"
          title="Click to view all fines"
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Fines Assessed
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 block">
              ${metrics.totalFineAmount.toFixed(2)}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              {metrics.totalRecords} total transactions
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => {
            setStatusFilter('Paid');
            setCurrentPage(1);
          }}
          className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex items-center justify-between cursor-pointer hover:border-emerald-300 transition-colors"
          title="Click to view paid fines"
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Fines Collected (Paid)
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-1 block">
              ${metrics.paidAmount.toFixed(2)}
            </span>
            <span className="text-[11px] text-emerald-700/80 mt-0.5 block">
              {metrics.paidCount} payments settled
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => {
            setStatusFilter('Unpaid');
            setCurrentPage(1);
          }}
          className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex items-center justify-between cursor-pointer hover:border-rose-300 transition-colors"
          title="Click to view unpaid fines"
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Outstanding Unpaid
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-600 mt-1 block">
              ${metrics.unpaidAmount.toFixed(2)}
            </span>
            <span className="text-[11px] text-rose-700/80 mt-0.5 block">
              {metrics.unpaidCount} pending payments
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => {
            setStatusFilter('Overdue');
            setCurrentPage(1);
          }}
          className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex items-center justify-between cursor-pointer hover:border-amber-300 transition-colors"
          title="Click to filter active overdue loans"
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Overdue Books
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-1 block">
              {metrics.overdueBooksCount}
            </span>
            <span className="text-[11px] text-amber-700/80 mt-0.5 block">
              Active loans past deadline
            </span>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Controls Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search by Member / Book with Clear X Button */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by member name, email, or book title..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors"
              title="Clear search"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter by Paid / Unpaid / Overdue */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1 mr-1 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </span>
          {[
            { id: 'ALL', label: 'All Fines' },
            { id: 'Unpaid', label: 'Unpaid' },
            { id: 'Overdue', label: 'Overdue' },
            { id: 'Paid', label: 'Paid' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => {
                setStatusFilter(st.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st.id
                  ? st.id === 'Unpaid'
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : st.id === 'Overdue'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : st.id === 'Paid'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Fine Transaction Records Table (Fixed width layout - No horizontal scrolling needed) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Fine Transaction Records
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Showing {paginatedList.length} of {filteredFines.length} entries
          </span>
        </div>

        {paginatedList.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-3">
              <Receipt className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">No fine records found</p>
            <p className="text-xs text-slate-400 mt-1">
              {searchQuery ? 'Try clearing your search query.' : 'Try selecting another status filter.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs table-fixed">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="w-[14%] px-3.5 py-3">Fine ID</th>
                  <th className="w-[21%] px-3 py-3">Member</th>
                  <th className="w-[23%] px-3 py-3">Book Details</th>
                  <th className="w-[11%] px-2.5 py-3 text-center">Overdue</th>
                  <th className="w-[10%] px-2.5 py-3 text-right">Amount</th>
                  <th className="w-[10%] px-2.5 py-3 text-center">Status</th>
                  <th className="w-[11%] px-3.5 py-3 text-right sticky right-0 bg-slate-50/95 backdrop-blur-xs z-10 border-l border-slate-200/40">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                    {/* Fine ID & Date */}
                    <td className="px-3.5 py-3 align-middle">
                      <span className="font-mono font-bold text-slate-900 block truncate text-xs">
                        {item.fineCode}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                        {item.createdAt || 'Recent'}
                      </span>
                    </td>

                    {/* Member */}
                    <td className="px-3 py-3 align-middle">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={
                            item.memberAvatar ||
                            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                              item.memberName || 'User'
                            )}`
                          }
                          alt={item.memberName}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <span
                            className="font-semibold text-slate-900 block truncate"
                            title={item.memberName}
                          >
                            {item.memberName}
                          </span>
                          <span
                            className="text-[11px] text-slate-400 block truncate"
                            title={item.memberEmail}
                          >
                            {item.memberEmail}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Book */}
                    <td className="px-3 py-3 align-middle">
                      <div className="min-w-0">
                        <span
                          className="font-semibold text-slate-900 block truncate"
                          title={item.bookTitle}
                        >
                          {item.bookTitle}
                        </span>
                        <span
                          className="text-[11px] text-slate-400 block truncate"
                          title={item.bookAuthor || ('ISBN: ' + item.isbn)}
                        >
                          {item.bookAuthor || ('ISBN: ' + item.isbn)}
                        </span>
                      </div>
                    </td>

                    {/* Days Overdue */}
                    <td className="px-2.5 py-3 align-middle text-center">
                      <span className="font-extrabold text-rose-600 block">
                        {item.daysOverdue} {item.daysOverdue === 1 ? 'day' : 'days'}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Due {item.dueDate?.slice(5) || 'N/A'}
                      </span>
                    </td>

                    {/* Fine Amount */}
                    <td className="px-2.5 py-3 align-middle text-right">
                      <span className="font-extrabold text-slate-900 text-sm block">
                        ${parseFloat(item.fineAmount || 0).toFixed(2)}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        ${parseFloat(item.dailyRate || DAILY_FINE_RATE).toFixed(2)}/d
                      </span>
                    </td>

                    {/* Payment Status (UI Only) */}
                    <td className="px-2.5 py-3 align-middle text-center">
                      {item.status === 'Paid' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-2.5 h-2.5 text-emerald-600" />
                          <span>Paid</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <Clock className="w-2.5 h-2.5 text-rose-600" />
                          <span>Unpaid</span>
                        </span>
                      )}
                    </td>

                    {/* Actions - Sticky column guaranteed visible */}
                    <td className="px-3.5 py-3 align-middle text-right sticky right-0 bg-white group-hover:bg-slate-50/80 transition-colors border-l border-slate-200/40">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.status === 'Unpaid' ? (
                          <>
                            <button
                              onClick={() => handleOpenPayment(item)}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs transition-colors flex items-center gap-1"
                              title="Pay Fine"
                            >
                              <CreditCard className="w-3 h-3" />
                              <span>Pay</span>
                            </button>

                            <button
                              onClick={() => handleToggleStatus(item.id)}
                              title="Mark as Paid (UI Only)"
                              className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setReceiptModalData(item)}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors flex items-center gap-1"
                              title="View Receipt"
                            >
                              <Eye className="w-3 h-3 text-slate-500" />
                              <span>Receipt</span>
                            </button>

                            <button
                              onClick={() => handleToggleStatus(item.id)}
                              title="Mark as Unpaid (UI Only)"
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          </>
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

      {/* 5. Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-5 py-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs text-slate-500">
            Page <strong className="text-slate-900">{currentPage}</strong> of{' '}
            <strong className="text-slate-900">{totalPages}</strong>
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={ChevronLeft}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* MODAL 1: COLLECT / PAY FINE (UI ONLY) */}
      <Modal
        isOpen={!!paymentModalFine}
        onClose={() => setPaymentModalFine(null)}
        title="Collect Fine Payment"
        subtitle={`Settle overdue penalty for ${paymentModalFine?.memberName || 'Member'}`}
        maxWidth="max-w-md"
      >
        {paymentModalFine && (
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            {/* Fine Summary Box */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Fine Transaction:</span>
                <span className="text-xs font-mono font-bold text-slate-900">
                  {paymentModalFine.fineCode}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Book Title:</span>
                <span className="text-xs font-semibold text-slate-900 truncate max-w-[200px]">
                  {paymentModalFine.bookTitle}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Days Overdue:</span>
                <span className="text-xs font-bold text-rose-600">
                  {paymentModalFine.daysOverdue} days
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">Computed Fine:</span>
                <span className="text-lg font-extrabold text-indigo-600">
                  ${parseFloat(paymentModalFine.fineAmount).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Amount Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Amount Paid ($) *
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0.50"
                  required
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-slate-900"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Payment Method *
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Cash', label: 'Cash', icon: Banknote },
                  { id: 'Credit Card', label: 'Card', icon: CreditCard },
                  { id: 'Online UPI', label: 'Online UPI', icon: Smartphone },
                ].map((method) => {
                  const Icon = method.icon;
                  const isSelected = paymentMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span>{method.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Receipt Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Cleared at circulation counter"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setPaymentModalFine(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                icon={CheckCircle}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Recording...' : 'Record Payment (Paid)'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL 2: DIGITAL RECEIPT VIEW */}
      <Modal
        isOpen={!!receiptModalData}
        onClose={() => setReceiptModalData(null)}
        title="Fine Payment Receipt"
        subtitle="Official BookStack LMS circulation fee clearance acknowledgment"
        maxWidth="max-w-md"
      >
        {receiptModalData && (
          <div className="space-y-4">
            {/* Printable Digital Receipt Card */}
            <div className="bg-slate-50/75 border border-dashed border-slate-300 rounded-2xl p-5 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-sm">
                    BS
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 tracking-tight">
                      BookStack Library Portal
                    </h4>
                    <span className="text-[10px] text-slate-400 block">Circulation Fee Receipt</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-indigo-600 block">
                    {receiptModalData.receiptNumber || ('RCP-' + Math.floor(100000 + Math.random() * 900000))}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {receiptModalData.paidDate || 'Today'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block">Patron:</span>
                  <strong className="text-slate-900 block truncate">{receiptModalData.memberName}</strong>
                  <span className="text-slate-500 text-[10px]">{receiptModalData.memberEmail}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Payment Method:</span>
                  <strong className="text-slate-900 block">{receiptModalData.paymentMethod || 'Cash'}</strong>
                  <span className="text-emerald-600 text-[10px] font-semibold flex items-center gap-0.5">
                    <CheckCircle className="w-3 h-3" /> Fully Settled
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Book:</span>
                  <span className="font-semibold text-slate-900 text-right truncate max-w-[200px]">
                    {receiptModalData.bookTitle}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Overdue Duration:</span>
                  <span className="font-medium text-rose-600">{receiptModalData.daysOverdue} days</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Fine Rate:</span>
                  <span>${DAILY_FINE_RATE.toFixed(2)}/day</span>
                </div>
              </div>

              <div className="pt-3 border-t-2 border-slate-300 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">Total Paid:</span>
                <span className="text-xl font-extrabold text-emerald-600">
                  ${parseFloat(receiptModalData.fineAmount).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  window.print();
                }}
              >
                Print Receipt
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => setReceiptModalData(null)}
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FineManagementPage;
