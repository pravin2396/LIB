// Fine Calculation & Payment Management Service for BookStack LMS
// Handles automatic fine computation for overdue books, payment tracking (UI only), history, and persistence

import api from './api';
import { issueService } from './issueService';
import { dashboardService } from './dashboardService';

export const FINES_STORAGE_KEY = 'bookstack_fines_data';
export const DAILY_FINE_RATE = 1.50; // $1.50 per day overdue

// Helper: Calculate overdue days
export const calculateOverdueDays = (dueDate, returnDate = null) => {
  if (!dueDate) return 0;
  
  const endPoint = returnDate ? new Date(returnDate) : new Date();
  const due = new Date(dueDate);
  
  // Set to midnight for accurate day comparison
  endPoint.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const diffMs = endPoint.getTime() - due.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
};

// Helper: Calculate fine amount based on days overdue
export const calculateFineAmount = (daysOverdue, rate = DAILY_FINE_RATE) => {
  if (!daysOverdue || daysOverdue <= 0) return 0;
  return parseFloat((daysOverdue * rate).toFixed(2));
};

// Initial seed history of fines
export const SEED_FINES = [
  {
    id: 'fine_101',
    fineCode: 'FINE-2026-001',
    issueId: 'iss_105',
    issueCode: 'TXN-ISS-905',
    memberId: 'mem_7',
    memberName: 'Chloe Bennett',
    memberEmail: 'chloe.bennett@law.edu',
    memberRole: 'Student',
    memberAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    bookId: 'bk_9',
    bookTitle: 'Thinking, Fast and Slow',
    bookAuthor: 'Daniel Kahneman',
    isbn: '978-0374533557',
    bookCover: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=500&auto=format&fit=crop&q=80',
    dueDate: '2026-09-29',
    returnDate: null,
    dailyRate: DAILY_FINE_RATE,
    daysOverdue: 17,
    fineAmount: 25.50,
    status: 'Unpaid',
    paymentMethod: null,
    paidDate: null,
    receiptNumber: null,
    reason: 'Overdue Loan (17 days past due date)',
    createdAt: '2026-09-30',
  },
  {
    id: 'fine_102',
    fineCode: 'FINE-2026-002',
    issueId: 'iss_102',
    issueCode: 'TXN-ISS-902',
    memberId: 'mem_4',
    memberName: 'Liam Patel',
    memberEmail: 'liam.patel@tech.edu',
    memberRole: 'Researcher',
    memberAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    bookId: 'bk_8',
    bookTitle: 'Introduction to Algorithms (4th Edition)',
    bookAuthor: 'Thomas H. Cormen, Charles E. Leiserson',
    isbn: '978-0262046305',
    bookCover: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500&auto=format&fit=crop&q=80',
    dueDate: '2026-10-15',
    returnDate: null,
    dailyRate: DAILY_FINE_RATE,
    daysOverdue: 1,
    fineAmount: 1.50,
    status: 'Unpaid',
    paymentMethod: null,
    paidDate: null,
    receiptNumber: null,
    reason: 'Overdue Loan (1 day past due date)',
    createdAt: '2026-10-16',
  },
  {
    id: 'fine_103',
    fineCode: 'FINE-2026-003',
    issueId: 'iss_103',
    issueCode: 'TXN-ISS-903',
    memberId: 'mem_2',
    memberName: 'David Miller',
    memberEmail: 'david.miller@campus.edu',
    memberRole: 'Faculty',
    memberAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    bookId: 'bk_2',
    bookTitle: 'The Great Gatsby',
    bookAuthor: 'F. Scott Fitzgerald',
    isbn: '978-0743273565',
    bookCover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80',
    dueDate: '2026-09-25',
    returnDate: '2026-10-03',
    dailyRate: DAILY_FINE_RATE,
    daysOverdue: 8,
    fineAmount: 12.00,
    status: 'Paid',
    paymentMethod: 'Credit Card',
    paidDate: '2026-10-04',
    receiptNumber: 'RCP-892104',
    reason: 'Late return settlement paid in full',
    createdAt: '2026-09-26',
  },
  {
    id: 'fine_104',
    fineCode: 'FINE-2026-004',
    issueId: 'iss_99',
    issueCode: 'TXN-ISS-884',
    memberId: 'mem_5',
    memberName: 'Emma Watson',
    memberEmail: 'emma.watson@literature.org',
    memberRole: 'Student',
    memberAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    bookId: 'bk_4',
    bookTitle: 'To Kill a Mockingbird',
    bookAuthor: 'Harper Lee',
    isbn: '978-0061120084',
    bookCover: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&auto=format&fit=crop&q=80',
    dueDate: '2026-09-10',
    returnDate: '2026-09-14',
    dailyRate: DAILY_FINE_RATE,
    daysOverdue: 4,
    fineAmount: 6.00,
    status: 'Paid',
    paymentMethod: 'Cash',
    paidDate: '2026-09-14',
    receiptNumber: 'RCP-781920',
    reason: 'Overdue return penalty cleared',
    createdAt: '2026-09-11',
  },
  {
    id: 'fine_105',
    fineCode: 'FINE-2026-005',
    issueId: 'iss_95',
    issueCode: 'TXN-ISS-871',
    memberId: 'mem_3',
    memberName: 'Lucas Vance',
    memberEmail: 'lucas.vance@techcorp.io',
    memberRole: 'Researcher',
    memberAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    bookId: 'bk_6',
    bookTitle: 'The Pragmatic Programmer: Your Journey To Mastery',
    bookAuthor: 'David Thomas, Andrew Hunt',
    isbn: '978-0135957059',
    bookCover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=80',
    dueDate: '2026-08-15',
    returnDate: '2026-08-20',
    dailyRate: DAILY_FINE_RATE,
    daysOverdue: 5,
    fineAmount: 7.50,
    status: 'Paid',
    paymentMethod: 'Online UPI',
    paidDate: '2026-08-21',
    receiptNumber: 'RCP-672014',
    reason: 'Overdue circulation fee',
    createdAt: '2026-08-16',
  },
];

export const fineService = {
  FINES_STORAGE_KEY,
  DAILY_FINE_RATE,

  // Get raw fines from storage or seed
  getStoredFines: () => {
    try {
      const cached = localStorage.getItem(FINES_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      localStorage.setItem(FINES_STORAGE_KEY, JSON.stringify(SEED_FINES));
      return SEED_FINES;
    } catch {
      return SEED_FINES;
    }
  },

  // Save fines list
  saveFines: (fines) => {
    try {
      localStorage.setItem(FINES_STORAGE_KEY, JSON.stringify(fines));
    } catch (e) {
      console.error('Failed to save fines to localStorage:', e);
    }
  },

  // Automatically recalculate fines for active overdue loans & return synchronized ledger
  getFines: () => {
    const storedFines = fineService.getStoredFines();
    const allIssues = issueService.getIssues();

    // Find all currently active overdue loans
    const overdueIssues = allIssues.filter((i) => i.computedStatus === 'Overdue');
    let updatedFines = [...storedFines];
    let hasChanges = false;

    // Synchronize active overdue loans into fines
    overdueIssues.forEach((issue) => {
      const existingIndex = updatedFines.findIndex(
        (f) => String(f.issueId) === String(issue.id) || String(f.issueCode) === String(issue.issueCode)
      );

      const daysOverdue = calculateOverdueDays(issue.dueDate);
      const fineAmount = calculateFineAmount(daysOverdue, DAILY_FINE_RATE);

      if (existingIndex >= 0) {
        // If fine exists and is still Unpaid, update live days & fine amount
        const existing = updatedFines[existingIndex];
        if (existing.status === 'Unpaid' && (existing.daysOverdue !== daysOverdue || existing.fineAmount !== fineAmount)) {
          updatedFines[existingIndex] = {
            ...existing,
            daysOverdue,
            fineAmount,
            reason: `Overdue Loan (${daysOverdue} ${daysOverdue === 1 ? 'day' : 'days'} past due date)`,
          };
          hasChanges = true;
        }
      } else {
        // Automatically create a new fine record for this overdue book!
        const newFine = {
          id: 'fine_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
          fineCode: 'FINE-2026-' + Math.floor(100 + Math.random() * 900),
          issueId: issue.id,
          issueCode: issue.issueCode,
          memberId: issue.memberId,
          memberName: issue.memberName,
          memberEmail: issue.memberEmail,
          memberRole: issue.memberRole || 'Student',
          memberAvatar: issue.memberAvatar,
          bookId: issue.bookId,
          bookTitle: issue.bookTitle,
          bookAuthor: issue.bookAuthor,
          isbn: issue.isbn,
          bookCover: issue.bookCover,
          dueDate: issue.dueDate,
          returnDate: null,
          dailyRate: DAILY_FINE_RATE,
          daysOverdue,
          fineAmount,
          status: 'Unpaid',
          paymentMethod: null,
          paidDate: null,
          receiptNumber: null,
          reason: `Overdue Loan (${daysOverdue} ${daysOverdue === 1 ? 'day' : 'days'} past due date)`,
          createdAt: new Date().toISOString().split('T')[0],
        };
        updatedFines.unshift(newFine);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      fineService.saveFines(updatedFines);
    }

    return updatedFines;
  },

  // Get list of currently overdue books with live calculated days & fine amounts
  getOverdueBooks: () => {
    const allIssues = issueService.getIssues();
    const overdueIssues = allIssues.filter((i) => i.computedStatus === 'Overdue');
    const fines = fineService.getStoredFines();

    return overdueIssues.map((issue) => {
      const daysOverdue = calculateOverdueDays(issue.dueDate);
      const fineAmount = calculateFineAmount(daysOverdue, DAILY_FINE_RATE);
      const linkedFine = fines.find(
        (f) => String(f.issueId) === String(issue.id) || String(f.issueCode) === String(issue.issueCode)
      );

      return {
        ...issue,
        daysOverdue,
        dailyRate: DAILY_FINE_RATE,
        fineAmount,
        fineStatus: linkedFine ? linkedFine.status : 'Unpaid',
        fineId: linkedFine ? linkedFine.id : null,
      };
    });
  },

  // Fine Payment Status (UI Only): Pay fine or toggle status
  payFine: async (fineId, { paymentMethod = 'Cash', customAmount = null, notes = '' } = {}) => {
    const fines = fineService.getStoredFines();
    const fineIndex = fines.findIndex((f) => String(f.id) === String(fineId));

    if (fineIndex === -1) {
      throw new Error('Fine record not found.');
    }

    const fine = fines[fineIndex];
    if (fine.status === 'Paid') {
      throw new Error('This fine has already been marked as Paid.');
    }

    const paidAmount = customAmount !== null ? parseFloat(customAmount) : fine.fineAmount;
    const paidDate = new Date().toISOString().split('T')[0];
    const receiptNumber = 'RCP-' + Math.floor(100000 + Math.random() * 900000);

    // 1. Replicate in Network Tab (Third-Party API simulation)
    try {
      await api.post('/posts/add', {
        title: `Fine Payment: ${fine.fineCode}`,
        body: `Receipt ${receiptNumber}: Paid $${paidAmount.toFixed(2)} via ${paymentMethod} by ${fine.memberName} for "${fine.bookTitle}".`,
        userId: 1,
      });
    } catch (e) {
      console.warn('Network fine payment simulation caught error, persisting locally:', e.message);
    }

    // 2. Update Fine record in Local Storage
    const updatedFine = {
      ...fine,
      status: 'Paid',
      fineAmount: paidAmount,
      paymentMethod,
      paidDate,
      receiptNumber,
      paymentNotes: notes || 'Settled at circulation desk',
    };

    fines[fineIndex] = updatedFine;
    fineService.saveFines(fines);

    // 3. Update Dashboard Service metrics & live activities
    dashboardService.collectFine(
      {
        memberName: fine.memberName,
        amount: paidAmount,
        reason: `Late return fee for "${fine.bookTitle}" (${receiptNumber})`,
      },
      null
    );

    return updatedFine;
  },

  // Toggle Fine Status (UI Only): Direct toggle between Paid and Unpaid
  togglePaymentStatus: async (fineId) => {
    const fines = fineService.getStoredFines();
    const fineIndex = fines.findIndex((f) => String(f.id) === String(fineId));

    if (fineIndex === -1) {
      throw new Error('Fine record not found.');
    }

    const fine = fines[fineIndex];
    const isCurrentlyPaid = fine.status === 'Paid';
    const newStatus = isCurrentlyPaid ? 'Unpaid' : 'Paid';

    let updatedFine;
    if (newStatus === 'Paid') {
      updatedFine = {
        ...fine,
        status: 'Paid',
        paidDate: new Date().toISOString().split('T')[0],
        paymentMethod: fine.paymentMethod || 'Cash',
        receiptNumber: fine.receiptNumber || ('RCP-' + Math.floor(100000 + Math.random() * 900000)),
      };

      // Also register in dashboard
      dashboardService.collectFine({
        memberName: fine.memberName,
        amount: fine.fineAmount,
        reason: `Fine marked as Paid for "${fine.bookTitle}"`,
      });
    } else {
      updatedFine = {
        ...fine,
        status: 'Unpaid',
        paidDate: null,
        paymentMethod: null,
        receiptNumber: null,
      };
    }

    fines[fineIndex] = updatedFine;
    fineService.saveFines(fines);

    return updatedFine;
  },

  // Summary Metrics for Fine Management
  getFineMetrics: () => {
    const fines = fineService.getFines();
    const overdueBooks = fineService.getOverdueBooks();

    let totalFineAmount = 0;
    let paidAmount = 0;
    let unpaidAmount = 0;
    let paidCount = 0;
    let unpaidCount = 0;

    fines.forEach((f) => {
      const amt = parseFloat(f.fineAmount) || 0;
      totalFineAmount += amt;
      if (f.status === 'Paid') {
        paidAmount += amt;
        paidCount += 1;
      } else {
        unpaidAmount += amt;
        unpaidCount += 1;
      }
    });

    return {
      totalRecords: fines.length,
      overdueBooksCount: overdueBooks.length,
      totalFineAmount: parseFloat(totalFineAmount.toFixed(2)),
      paidAmount: parseFloat(paidAmount.toFixed(2)),
      unpaidAmount: parseFloat(unpaidAmount.toFixed(2)),
      paidCount,
      unpaidCount,
      dailyRate: DAILY_FINE_RATE,
    };
  },
};
