// Local Storage Service for BookStack LMS persistence

const USERS_KEY = 'bookstack_lib_users';
const CURRENT_USER_KEY = 'bookstack_lib_current_user';
const BORROWED_KEY = 'bookstack_lib_borrowed_books';

export const DEFAULT_USERS = [
  {
    id: 'usr_admin_1',
    name: 'Eleanor Vance',
    email: 'admin@library.com',
    password: 'Password@123',
    role: 'Admin',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    memberSince: '2023-01-15',
    membershipId: 'LIB-ADM-001',
    phone: '+1 (555) 234-5678',
    department: 'Head Administration',
  },
  {
    id: 'usr_lib_1',
    name: 'Marcus Sterling',
    email: 'librarian@library.com',
    password: 'Password@123',
    role: 'Librarian',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    memberSince: '2023-08-20',
    membershipId: 'LIB-STF-014',
    phone: '+1 (555) 345-6789',
    department: 'Archival & Cataloging',
  },
  {
    id: 'usr_std_1',
    name: 'Sophia Chen',
    email: 'student@library.com',
    password: 'Password@123',
    role: 'Student',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    memberSince: '2024-02-10',
    membershipId: 'LIB-STD-1092',
    phone: '+1 (555) 456-7890',
    department: 'Computer Science',
  },
];

// Clean all previous/legacy project data from localStorage, keeping only bookstack_*
export const cleanLegacyStorage = () => {
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      // Remove any key that does NOT start with 'bookstack_'
      if (key && !key.startsWith('bookstack_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error cleaning legacy storage:', error);
  }
};

// Initialize users in LocalStorage and remove non-bookstack project data
export const initializeStorage = () => {
  try {
    // 1. Remove all previous project data from localStorage (keeps only bookstack_ keys)
    cleanLegacyStorage();

    // 2. Initialize BookStack storage keys if not existing
    const existingUsers = localStorage.getItem(USERS_KEY);
    if (!existingUsers) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
    }

    const existingBorrowed = localStorage.getItem(BORROWED_KEY);
    if (!existingBorrowed) {
      const defaultBorrowed = [
        {
          id: 'loan_1',
          userId: 'usr_std_1',
          userEmail: 'student@library.com',
          bookKey: '/works/OL45804W',
          title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
          author: 'Robert C. Martin',
          coverId: 8231856,
          borrowDate: '2026-09-28',
          dueDate: '2026-10-18',
          status: 'Active',
        },
        {
          id: 'loan_2',
          userId: 'usr_std_1',
          userEmail: 'student@library.com',
          bookKey: '/works/OL82586W',
          title: 'The Great Gatsby',
          author: 'F. Scott Fitzgerald',
          coverId: 7452478,
          borrowDate: '2026-09-15',
          dueDate: '2026-10-05',
          status: 'Overdue',
        },
      ];
      localStorage.setItem(BORROWED_KEY, JSON.stringify(defaultBorrowed));
    }
  } catch (error) {
    console.error('Error initializing BookStack storage:', error);
  }
};

// Auto run legacy cleanup immediately upon script execution
cleanLegacyStorage();

export const storageService = {
  USERS_KEY,
  CURRENT_USER_KEY,
  BORROWED_KEY,
  cleanLegacyStorage,

  getUsers: () => {
    try {
      const users = localStorage.getItem(USERS_KEY);
      return users ? JSON.parse(users) : DEFAULT_USERS;
    } catch {
      return DEFAULT_USERS;
    }
  },

  setUsers: (users) => {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      return true;
    } catch (e) {
      console.error('Failed to update users registry', e);
      return false;
    }
  },

  saveUser: (newUser) => {
    try {
      const users = storageService.getUsers();
      const updated = [...users, newUser];
      localStorage.setItem(USERS_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Failed to save user', e);
      return [];
    }
  },

  updateUserPassword: (email, newPassword) => {
    try {
      const users = storageService.getUsers();
      const updated = users.map((u) => {
        if (u.email.toLowerCase() === email.toLowerCase()) {
          return { ...u, password: newPassword };
        }
        return u;
      });
      localStorage.setItem(USERS_KEY, JSON.stringify(updated));
      return true;
    } catch (e) {
      console.error('Failed to update password', e);
      return false;
    }
  },

  getCurrentUser: () => {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  setCurrentUser: (user) => {
    try {
      if (user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    } catch (e) {
      console.error('Failed to set current user', e);
    }
  },

  clearCurrentUser: () => {
    try {
      localStorage.removeItem(CURRENT_USER_KEY);
    } catch (e) {
      console.error('Failed to clear current user', e);
    }
  },

  getBorrowedBooks: (userId) => {
    try {
      const data = localStorage.getItem(BORROWED_KEY);
      const all = data ? JSON.parse(data) : [];
      if (!userId) return all;
      return all.filter((b) => b.userId === userId || b.userEmail === userId);
    } catch {
      return [];
    }
  },

  borrowBook: (record) => {
    try {
      const data = localStorage.getItem(BORROWED_KEY);
      const all = data ? JSON.parse(data) : [];
      const updated = [record, ...all];
      localStorage.setItem(BORROWED_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Failed to borrow book', e);
      return [];
    }
  },

  returnBook: (loanId) => {
    try {
      const data = localStorage.getItem(BORROWED_KEY);
      const all = data ? JSON.parse(data) : [];
      const updated = all.filter((item) => item.id !== loanId);
      localStorage.setItem(BORROWED_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Failed to return book', e);
      return [];
    }
  },
};
