import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Users,
  Calendar,
  Clock,
  ArrowRightLeft,
  CheckCircle,
  AlertTriangle,
  Search,
  Plus,
  RotateCcw,
  ShieldAlert,
  IdCard,
  Hash,
  X,
  Eye,
  Check,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { issueService } from '../../services/issueService';
import { bookService } from '../../services/bookService';
import { memberService } from '../../services/memberService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

const IssueReturnPage = () => {
  // Master lists
  const [issues, setIssues] = useState(() => issueService.getIssues());
  const [books, setBooks] = useState(() => bookService.getStoredBooks());
  const [members, setMembers] = useState(() => memberService.getStoredMembers());

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'Issued' | 'Overdue' | 'Returned'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Submitting states
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals state
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [returningIssue, setReturningIssue] = useState(null);
  const [viewingIssue, setViewingIssue] = useState(null);

  // Issue Book Form State
  const defaultIssueDate = new Date().toISOString().split('T')[0];
  const defaultDueDate = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];

  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('');
  const [issueDate, setIssueDate] = useState(defaultIssueDate);
  const [dueDate, setDueDate] = useState(defaultDueDate);

  // Return Book Form State
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookCondition, setBookCondition] = useState('Good');

  // Reload issues and linked entities
  const reloadData = () => {
    setIssues(issueService.getIssues());
    setBooks(bookService.getStoredBooks());
    setMembers(memberService.getStoredMembers());
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Compute stats
  const stats = useMemo(() => {
    let active = 0;
    let overdue = 0;
    let returned = 0;

    issues.forEach((item) => {
      if (item.computedStatus === 'Returned') {
        returned += 1;
      } else if (item.computedStatus === 'Overdue') {
        overdue += 1;
      } else {
        active += 1;
      }
    });

    return {
      total: issues.length,
      active,
      overdue,
      returned,
    };
  }, [issues]);

  // Selected member & book details in Issue modal
  const selectedMember = useMemo(
    () => members.find((m) => String(m.id) === String(selectedMemberId)),
    [members, selectedMemberId]
  );

  const selectedBook = useMemo(
    () => books.find((b) => String(b.id) === String(selectedBookId)),
    [books, selectedBookId]
  );

  // Check for duplicate issue in real time
  const isDuplicateIssue = useMemo(() => {
    if (!selectedMemberId || !selectedBookId) return false;
    return issueService.hasActiveBookIssue(selectedMemberId, selectedBookId);
  }, [selectedMemberId, selectedBookId, issues]);

  // Check if book has available copies
  const isBookOutOfStock = useMemo(() => {
    if (!selectedBook) return false;
    return (selectedBook.availableCopies || 0) <= 0;
  }, [selectedBook]);

  // Filtered issues calculation
  const filteredIssues = useMemo(() => {
    let list = [...issues];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (iss) =>
          iss.bookTitle?.toLowerCase().includes(q) ||
          iss.memberName?.toLowerCase().includes(q) ||
          iss.isbn?.toLowerCase().includes(q) ||
          iss.issueCode?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'ALL') {
      list = list.filter((iss) => iss.computedStatus === statusFilter);
    }

    // Sort: newest issues first
    list.sort((a, b) => new Date(b.issueDate || 0) - new Date(a.issueDate || 0));

    return list;
  }, [issues, searchQuery, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredIssues.length / itemsPerPage) || 1;
  const paginatedIssues = useMemo(() => {
    const validPage = Math.min(Math.max(1, currentPage), totalPages);
    const start = (validPage - 1) * itemsPerPage;
    return filteredIssues.slice(start, start + itemsPerPage);
  }, [filteredIssues, currentPage, itemsPerPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Open Issue Modal
  const handleOpenIssueModal = () => {
    setSelectedMemberId(members[0]?.id || '');
    setSelectedBookId(books.find((b) => (b.availableCopies || 0) > 0)?.id || books[0]?.id || '');
    setIssueDate(new Date().toISOString().split('T')[0]);
    setDueDate(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
    setIsIssueModalOpen(true);
  };

  // Submit Issue Book
  const handleSaveIssue = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!selectedMemberId || !selectedBookId) {
      toast.warning('Please select both a Member and a Book.');
      return;
    }

    if (isBookOutOfStock) {
      toast.error('The selected book is out of stock. Cannot issue.');
      return;
    }

    if (isDuplicateIssue) {
      toast.error('Duplicate issue prevented! Member already holds an active copy.');
      return;
    }

    setIsSubmitting(true);
    try {
      const newTransaction = await issueService.issueBook({
        memberId: selectedMemberId,
        bookId: selectedBookId,
        issueDate,
        dueDate,
      });

      toast.success(
        `"${newTransaction.bookTitle}" successfully issued to ${newTransaction.memberName}!`
      );
      setIsIssueModalOpen(false);
      reloadData();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to issue book.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Return Modal
  const handleOpenReturnModal = (issue, e) => {
    if (e) e.stopPropagation();
    setReturningIssue(issue);
    setReturnDate(new Date().toISOString().split('T')[0]);
    setBookCondition('Good');
  };

  // Submit Return Book
  const handleSaveReturn = async (e) => {
    e.preventDefault();
    if (!returningIssue || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const updated = await issueService.returnBook(returningIssue.id, {
        returnDate,
        condition: bookCondition,
      });

      toast.success(
        `"${updated.bookTitle}" returned by ${updated.memberName}. Availability updated!`
      );
      setReturningIssue(null);
      reloadData();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to process book return.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preset Due Date Helpers
  const setDueDays = (days) => {
    const start = new Date(issueDate);
    const target = new Date(start.getTime() + days * 86400000);
    setDueDate(target.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700 mb-2">
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Circulation & Checkouts</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Issue / Return Books
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track book loans, issue copies to registered patrons, enforce due dates, and update inventory.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={handleOpenIssueModal}
          >
            Issue Book
          </Button>
        </div>
      </div>

      {/* 2. Circulation Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Transactions
            </span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
              {stats.total}
            </span>
            <span className="text-xs text-slate-500 mt-0.5 block">Recorded checkouts</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Hash className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Currently Issued
            </span>
            <span className="text-2xl font-extrabold text-indigo-600 mt-1 block">
              {stats.active}
            </span>
            <span className="text-xs text-slate-500 mt-0.5 block">In patron custody</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Overdue Loans
            </span>
            <span className="text-2xl font-extrabold text-rose-600 mt-1 block">
              {stats.overdue}
            </span>
            <span className="text-xs text-rose-500 font-medium mt-0.5 block">Requires follow-up</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Returned Safely
            </span>
            <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">
              {stats.returned}
            </span>
            <span className="text-xs text-slate-500 mt-0.5 block">Check-ins completed</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Search & Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by book title, author, patron name, or transaction code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/90 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 focus:bg-white px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600"
          >
            <option value="ALL">All Records ({issues.length})</option>
            <option value="Issued">Active Issues ({stats.active})</option>
            <option value="Overdue">Overdue Books ({stats.overdue})</option>
            <option value="Returned">Returned Books ({stats.returned})</option>
          </select>
        </div>
      </div>

      {/* 4. Issue History Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">Issue & Loan History</h2>
          </div>
          <span className="text-xs font-medium text-slate-400">
            {filteredIssues.length} transactions match filters
          </span>
        </div>

        {filteredIssues.length === 0 ? (
          <div className="p-12 text-center">
            <ArrowRightLeft className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No circulation records found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No transactions match your current search or filter. Try clearing filters or issue a book.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Transaction & Book</th>
                  <th className="py-3.5 px-4">Patron / Member</th>
                  <th className="py-3.5 px-4">Issue Date</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Return Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedIssues.map((issue) => {
                  const isReturned = issue.computedStatus === 'Returned';
                  const isOverdue = issue.computedStatus === 'Overdue';

                  return (
                    <tr
                      key={issue.id}
                      onClick={() => setViewingIssue(issue)}
                      className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                    >
                      {/* Book & Code */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={issue.bookCover}
                            alt={issue.bookTitle}
                            className="w-10 h-14 object-cover rounded-md shadow-2xs shrink-0"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = bookService.DEFAULT_BOOK_COVER;
                            }}
                          />
                          <div className="min-w-0 max-w-xs">
                            <span className="font-mono text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-bold inline-block mb-0.5">
                              {issue.issueCode}
                            </span>
                            <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                              {issue.bookTitle}
                            </h4>
                            <p className="text-[11px] text-slate-500 truncate">
                              By {issue.bookAuthor}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Member */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={issue.memberAvatar || memberService.DEFAULT_MEMBER_AVATAR}
                            alt={issue.memberName}
                            className="w-8 h-8 rounded-full object-cover shrink-0"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = memberService.DEFAULT_MEMBER_AVATAR;
                            }}
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {issue.memberName}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              {issue.memberRole || 'Student'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Issue Date */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{issue.issueDate}</span>
                        </div>
                      </td>

                      {/* Return Due Date */}
                      <td className="py-3.5 px-4 font-semibold whitespace-nowrap">
                        <span
                          className={
                            isOverdue
                              ? 'text-rose-600 font-bold flex items-center gap-1'
                              : 'text-slate-700 flex items-center gap-1'
                          }
                        >
                          <Clock className="w-3.5 h-3.5" />
                          {issue.dueDate}
                        </span>
                      </td>

                      {/* Return Date */}
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {issue.returnDate ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            {issue.returnDate}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono italic">Pending</span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isReturned ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle className="w-3 h-3" />
                            Returned
                          </span>
                        ) : isOverdue ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3 h-3" />
                            Overdue
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                            <Clock className="w-3 h-3" />
                            Issued
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {!isReturned ? (
                          <Button
                            variant="primary"
                            size="sm"
                            icon={RotateCcw}
                            onClick={(e) => handleOpenReturnModal(issue, e)}
                          >
                            Return Book
                          </Button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setViewingIssue(issue)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                            title="View Transaction Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200/80 px-4 py-3 shadow-xs">
          <div className="text-xs text-slate-500">
            Showing <span className="font-semibold text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-semibold text-slate-800">
              {Math.min(currentPage * itemsPerPage, filteredIssues.length)}
            </span>{' '}
            of <span className="font-semibold text-slate-800">{filteredIssues.length}</span> records
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                  currentPage === page
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {page}
              </button>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* 6. MODAL: Issue Book */}
      <Modal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        title="Issue Book to Member"
        subtitle="Select a patron and an available volume to record a new loan."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveIssue} className="space-y-4">
          {/* Select Member */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 tracking-tight mb-1.5">
              Select Member <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600"
              required
            >
              <option value="" disabled>-- Choose a Library Member --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName} ({m.membershipId}) — {m.role} ({m.status})
                </option>
              ))}
            </select>
          </div>

          {/* Member preview card */}
          {selectedMember && (
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={selectedMember.avatar || memberService.DEFAULT_MEMBER_AVATAR}
                  alt={selectedMember.fullName}
                  className="w-9 h-9 rounded-full object-cover shadow-2xs"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = memberService.DEFAULT_MEMBER_AVATAR;
                  }}
                />
                <div>
                  <span className="font-bold text-slate-900 block">{selectedMember.fullName}</span>
                  <span className="text-slate-500 text-[11px] block">{selectedMember.email}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-slate-400 text-[10px] block font-mono">ID: {selectedMember.membershipId}</span>
                <span className="text-indigo-600 font-bold text-[11px]">
                  {selectedMember.booksIssuedCount || 0} active loans
                </span>
              </div>
            </div>
          )}

          {/* Select Book */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 tracking-tight mb-1.5">
              Select Book <span className="text-rose-500">*</span>
            </label>
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600"
              required
            >
              <option value="" disabled>-- Choose an Accessioned Book --</option>
              {books.map((b) => (
                <option key={b.id} value={b.id} disabled={(b.availableCopies || 0) <= 0}>
                  {b.title} — {b.availableCopies} of {b.totalCopies} copies available {(b.availableCopies || 0) <= 0 ? '(OUT OF STOCK)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Book preview card */}
          {selectedBook && (
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={selectedBook.coverImage}
                  alt={selectedBook.title}
                  className="w-8 h-11 object-cover rounded shadow-2xs shrink-0"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = bookService.DEFAULT_BOOK_COVER;
                  }}
                />
                <div className="min-w-0">
                  <span className="font-bold text-slate-900 block truncate">{selectedBook.title}</span>
                  <span className="text-slate-500 text-[11px] block">By {selectedBook.author}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] text-slate-400 block font-mono">ISBN: {selectedBook.isbn}</span>
                <span
                  className={`text-[11px] font-bold ${
                    isBookOutOfStock ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {selectedBook.availableCopies} Copies Available
                </span>
              </div>
            </div>
          )}

          {/* DUPLICATE BOOK ISSUE WARNING */}
          {isDuplicateIssue && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs animate-shake">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Duplicate Book Issue Prevented:</p>
                <p className="mt-0.5 text-rose-700 leading-relaxed">
                  <strong className="font-semibold">{selectedMember?.fullName}</strong> already has an active, unreturned checkout of <strong className="font-semibold">"{selectedBook?.title}"</strong>. The system does not allow duplicate copies of the same book to be issued to the same patron simultaneously.
                </p>
              </div>
            </div>
          )}

          {/* Dates: Issue Date & Return Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 tracking-tight mb-1.5">
                Issue Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 tracking-tight mb-1.5">
                Return Due Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={issueDate}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600"
                required
              />
            </div>
          </div>

          {/* Due date presets */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-medium text-[11px]">Quick Due Presets:</span>
            <button
              type="button"
              onClick={() => setDueDays(7)}
              className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded-md font-semibold text-slate-700"
            >
              +7 Days
            </button>
            <button
              type="button"
              onClick={() => setDueDays(14)}
              className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-md font-bold"
            >
              +14 Days (Default)
            </button>
            <button
              type="button"
              onClick={() => setDueDays(30)}
              className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded-md font-semibold text-slate-700"
            >
              +30 Days
            </button>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
            <Button variant="outline" size="md" onClick={() => setIsIssueModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting || isDuplicateIssue || isBookOutOfStock}
            >
              {isSubmitting ? 'Recording Issue...' : 'Confirm Book Issue'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 7. MODAL: Return Book */}
      <Modal
        isOpen={!!returningIssue}
        onClose={() => setReturningIssue(null)}
        title="Process Book Return"
        subtitle={`Check-in transaction ${returningIssue?.issueCode}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveReturn} className="space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center gap-3">
              <img
                src={returningIssue?.bookCover}
                alt={returningIssue?.bookTitle}
                className="w-10 h-14 object-cover rounded shadow-2xs shrink-0"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = bookService.DEFAULT_BOOK_COVER;
                }}
              />
              <div>
                <h4 className="font-bold text-slate-900 text-sm leading-snug">{returningIssue?.bookTitle}</h4>
                <p className="text-slate-500 text-[11px] mt-0.5">Patron: <strong className="text-slate-800">{returningIssue?.memberName}</strong></p>
                <p className="text-slate-400 text-[10px] font-mono mt-0.5">Due Date: {returningIssue?.dueDate}</p>
              </div>
            </div>
          </div>

          {/* Return Date input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 tracking-tight mb-1.5">
              Actual Return Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600"
              required
            />
          </div>

          {/* Overdue indicator */}
          {returningIssue?.dueDate && returnDate > returningIssue.dueDate && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                This book is returned past its due date ({returningIssue.dueDate}). Overdue return will be noted.
              </span>
            </div>
          )}

          {/* Book Condition */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 tracking-tight mb-1.5">
              Book Condition
            </label>
            <select
              value={bookCondition}
              onChange={(e) => setBookCondition(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600"
            >
              <option value="Good">Good / Like New</option>
              <option value="Fair">Fair / Minor Wear</option>
              <option value="Damaged">Damaged (Assessment Required)</option>
            </select>
          </div>

          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-800">
            ℹ️ <strong>Inventory Update:</strong> Confirming return increments available copies for this book in catalog inventory automatically.
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
            <Button variant="outline" size="md" onClick={() => setReturningIssue(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={isSubmitting}>
              {isSubmitting ? 'Checking In...' : 'Confirm Return'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 8. MODAL: Transaction Details View */}
      <Modal
        isOpen={!!viewingIssue}
        onClose={() => setViewingIssue(null)}
        title="Circulation Record Details"
        subtitle={`Transaction ${viewingIssue?.issueCode}`}
        maxWidth="max-w-md"
      >
        {viewingIssue && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <img
                src={viewingIssue.bookCover}
                alt={viewingIssue.bookTitle}
                className="w-12 h-16 object-cover rounded shadow-xs"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = bookService.DEFAULT_BOOK_COVER;
                }}
              />
              <div className="min-w-0 flex-1">
                <span className="font-bold text-slate-900 block text-sm leading-snug">{viewingIssue.bookTitle}</span>
                <span className="text-slate-500 text-[11px] block mt-0.5">Author: {viewingIssue.bookAuthor}</span>
                <span className="font-mono text-slate-400 text-[10px] block mt-0.5">ISBN: {viewingIssue.isbn}</span>
              </div>
            </div>

            <div className="space-y-2 border-t border-b border-slate-100 py-3">
              <div className="flex justify-between">
                <span className="text-slate-400">Patron Name:</span>
                <span className="font-bold text-slate-800">{viewingIssue.memberName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Patron Role:</span>
                <span className="font-semibold text-slate-700">{viewingIssue.memberRole || 'Student'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Issue Date:</span>
                <span className="font-medium text-slate-800">{viewingIssue.issueDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Return Due Date:</span>
                <span className="font-semibold text-indigo-600">{viewingIssue.dueDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Actual Return Date:</span>
                <span className="font-medium text-slate-800">{viewingIssue.returnDate || 'Pending check-in'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Current Status:</span>
                <span className="font-bold text-slate-800">{viewingIssue.computedStatus}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setViewingIssue(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default IssueReturnPage;
