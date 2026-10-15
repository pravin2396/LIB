// Issue & Return Books Service with Third-Party API Integration (DummyJSON) and LocalStorage Persistence
import api from './api';
import { bookService } from './bookService';
import { memberService } from './memberService';
import { dashboardService } from './dashboardService';

export const ISSUES_STORAGE_KEY = 'bookstack_issues_data';

// Initial seed history of issue transactions
export const SEED_ISSUES = [
  {
    id: 'iss_101',
    issueCode: 'TXN-ISS-901',
    memberId: 'mem_1',
    memberName: 'Sophia Chen',
    memberEmail: 'sophia.chen@library.com',
    memberRole: 'Student',
    memberAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bookId: 'bk_1',
    bookTitle: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    bookAuthor: 'Robert C. Martin',
    isbn: '978-0132350884',
    bookCover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&auto=format&fit=crop&q=80',
    category: 'Computer Science',
    issueDate: '2026-10-04',
    dueDate: '2026-10-18',
    returnDate: null,
    status: 'Issued',
    condition: null,
  },
  {
    id: 'iss_102',
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
    category: 'Engineering',
    issueDate: '2026-10-01',
    dueDate: '2026-10-15',
    returnDate: null,
    status: 'Issued',
    condition: null,
  },
  {
    id: 'iss_103',
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
    category: 'Literature',
    issueDate: '2026-09-20',
    dueDate: '2026-10-04',
    returnDate: '2026-10-03',
    status: 'Returned',
    condition: 'Good',
  },
  {
    id: 'iss_104',
    issueCode: 'TXN-ISS-904',
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
    category: 'Literature',
    issueDate: '2026-09-25',
    dueDate: '2026-10-09',
    returnDate: '2026-10-08',
    status: 'Returned',
    condition: 'Good',
  },
  {
    id: 'iss_105',
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
    category: 'Economics',
    issueDate: '2026-09-15',
    dueDate: '2026-09-29',
    returnDate: null,
    status: 'Issued', // Past due date => Overdue
    condition: null,
  },
];

// Helper to calculate live overdue status
export const getIssueLiveStatus = (issue) => {
  if (issue.status === 'Returned') return 'Returned';
  const todayStr = new Date().toISOString().split('T')[0];
  if (issue.dueDate && issue.dueDate < todayStr) {
    return 'Overdue';
  }
  return 'Issued';
};

export const issueService = {
  ISSUES_STORAGE_KEY,

  // Synchronous accessor ensuring issue history is available on frame 1
  getStoredIssues: () => {
    try {
      const cached = localStorage.getItem(ISSUES_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      localStorage.setItem(ISSUES_STORAGE_KEY, JSON.stringify(SEED_ISSUES));
      return SEED_ISSUES;
    } catch {
      return SEED_ISSUES;
    }
  },

  // Get all issues with live computed statuses
  getIssues: () => {
    const list = issueService.getStoredIssues();
    return list.map((item) => ({
      ...item,
      computedStatus: getIssueLiveStatus(item),
    }));
  },

  // PREVENT DUPLICATE BOOK ISSUE: Check if member currently has an active issue of this book
  hasActiveBookIssue: (memberId, bookId) => {
    const list = issueService.getStoredIssues();
    return list.some(
      (iss) =>
        String(iss.memberId) === String(memberId) &&
        String(iss.bookId) === String(bookId) &&
        iss.status !== 'Returned'
    );
  },

  // ISSUE BOOK: Validates, updates book availability, updates member count, registers network call & storage
  issueBook: async ({ memberId, bookId, issueDate, dueDate }) => {
    const members = memberService.getStoredMembers();
    const books = bookService.getStoredBooks();

    const member = members.find((m) => String(m.id) === String(memberId));
    if (!member) {
      throw new Error('Selected member not found in directory.');
    }

    const book = books.find((b) => String(b.id) === String(bookId));
    if (!book) {
      throw new Error('Selected book not found in catalog.');
    }

    // 1. Availability Check
    if ((book.availableCopies || 0) <= 0) {
      throw new Error(`"${book.title}" is currently out of stock. No copies available for issue.`);
    }

    // 2. Prevent Duplicate Book Issue Check
    if (issueService.hasActiveBookIssue(memberId, bookId)) {
      throw new Error(
        `Duplicate Issue Prevented: "${member.fullName}" already holds an active copy of "${book.title}". Patrons cannot borrow duplicate copies simultaneously.`
      );
    }

    // 3. Network Tab Replication via DummyJSON POST /posts/add
    try {
      await api.post('/posts/add', {
        title: `Book Issue: ${book.title}`,
        body: `Issued ISBN ${book.isbn} to ${member.fullName} (${member.membershipId}) with due date ${dueDate}`,
        userId: 1,
      });
    } catch (e) {
      console.warn('Network POST simulation caught error, persisting locally:', e.message);
    }

    // 4. Create Issue Record
    const newIssue = {
      id: 'iss_' + Date.now(),
      issueCode: 'TXN-ISS-' + Math.floor(1000 + Math.random() * 9000),
      memberId: member.id,
      memberName: member.fullName,
      memberEmail: member.email,
      memberRole: member.role || 'Student',
      memberAvatar: member.avatar,
      bookId: book.id,
      bookTitle: book.title,
      bookAuthor: book.author,
      isbn: book.isbn,
      bookCover: book.coverImage,
      category: book.category,
      issueDate: issueDate || new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      returnDate: null,
      status: 'Issued',
      condition: null,
    };

    // 5. Update Book Availability (-1)
    await bookService.updateBook(book.id, {
      availableCopies: Math.max(0, (book.availableCopies || 1) - 1),
    });

    // 6. Update Member Issued Count (+1)
    await memberService.updateMember(member.id, {
      booksIssuedCount: (member.booksIssuedCount || 0) + 1,
    });

    // 7. Update Dashboard Activity and Metrics
    dashboardService.issueBook({
      memberName: member.fullName,
      memberRole: member.role,
      bookTitle: book.title,
      category: book.category,
    });

    // 8. Persist to Local Storage
    const currentList = issueService.getStoredIssues();
    const updatedList = [newIssue, ...currentList];
    localStorage.setItem(ISSUES_STORAGE_KEY, JSON.stringify(updatedList));

    return {
      ...newIssue,
      computedStatus: 'Issued',
    };
  },

  // RETURN BOOK: Validates, updates book availability (+1), updates member count (-1), records return date
  returnBook: async (issueId, { returnDate, condition = 'Good' } = {}) => {
    const list = issueService.getStoredIssues();
    const issue = list.find((i) => String(i.id) === String(issueId));

    if (!issue) {
      throw new Error('Issue transaction record not found.');
    }

    if (issue.status === 'Returned') {
      throw new Error('This book has already been marked as returned.');
    }

    const actualReturnDate = returnDate || new Date().toISOString().split('T')[0];
    const wasOverdue = issue.dueDate ? actualReturnDate > issue.dueDate : false;

    // 1. Network Tab Replication via DummyJSON PUT /posts/1
    try {
      await api.put('/posts/1', {
        title: `Book Return: ${issue.bookTitle}`,
        body: `Returned by ${issue.memberName} on ${actualReturnDate}. Overdue: ${wasOverdue}. Condition: ${condition}`,
      });
    } catch (e) {
      console.warn('Network PUT simulation caught error, persisting locally:', e.message);
    }

    // 2. Update Book Availability (+1)
    const book = bookService.getBookById(issue.bookId);
    if (book) {
      await bookService.updateBook(book.id, {
        availableCopies: Math.min(book.totalCopies || 999, (book.availableCopies || 0) + 1),
      });
    }

    // 3. Update Member Borrowed Count (-1)
    const member = memberService.getMemberById(issue.memberId);
    if (member) {
      await memberService.updateMember(member.id, {
        booksIssuedCount: Math.max(0, (member.booksIssuedCount || 1) - 1),
      });
    }

    // 4. Update Dashboard Activity & Metrics
    dashboardService.returnBook({
      memberName: issue.memberName,
      memberRole: issue.memberRole,
      bookTitle: issue.bookTitle,
      wasOverdue,
      condition,
    });

    // 5. Update Issue Record in Local Storage
    const updatedList = list.map((item) => {
      if (String(item.id) === String(issueId)) {
        return {
          ...item,
          status: 'Returned',
          returnDate: actualReturnDate,
          condition,
          wasOverdue,
        };
      }
      return item;
    });

    localStorage.setItem(ISSUES_STORAGE_KEY, JSON.stringify(updatedList));

    return {
      ...issue,
      status: 'Returned',
      returnDate: actualReturnDate,
      condition,
      wasOverdue,
      computedStatus: 'Returned',
    };
  },
};
