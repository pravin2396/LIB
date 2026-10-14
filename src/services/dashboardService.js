// Dashboard Service for BookStack LMS with robust LocalStorage persistence
import { storageService } from './storageService';

const DASHBOARD_DATA_KEY = 'bookstack_dashboard_data';

export const INITIAL_DASHBOARD_DATA = {
  totalBooks: 2850,
  baseMemberCount: 340,
  booksIssued: 385,
  overdueBooks: 24,
  totalCategories: 18,
  fineCollected: 1485.50,
  recentActivities: [
    {
      id: 'act_1',
      user: 'Sophia Chen',
      role: 'Student',
      action: 'Issued Book',
      detail: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      category: 'Computer Science',
      timestamp: '12 mins ago',
      type: 'issue',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'act_2',
      user: 'Marcus Sterling',
      role: 'Librarian',
      action: 'Processed Return',
      detail: 'Design Patterns: Elements of Reusable Object-Oriented Software',
      category: 'Software Engineering',
      timestamp: '45 mins ago',
      type: 'return',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'act_3',
      user: 'David Miller',
      role: 'Student',
      action: 'Fine Collected',
      detail: 'Late return charge paid ($12.00)',
      category: 'Circulation Desk',
      timestamp: '2 hours ago',
      type: 'fine',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'act_4',
      user: 'Eleanor Vance',
      role: 'Admin',
      action: 'Catalog Accession',
      detail: 'Added 25 new volumes to Artificial Intelligence shelf',
      category: 'Inventory',
      timestamp: '4 hours ago',
      type: 'catalog',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'act_5',
      user: 'Liam Patel',
      role: 'Faculty',
      action: 'New Membership',
      detail: 'Registered membership card LIB-FAC-2041',
      category: 'Accounts',
      timestamp: 'Today, 09:30 AM',
      type: 'member',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80',
    },
    {
      id: 'act_6',
      user: 'Aria Montgomery',
      role: 'Student',
      action: 'Issued Book',
      detail: 'Introduction to Algorithms (CLRS)',
      category: 'Mathematics',
      timestamp: 'Yesterday, 04:15 PM',
      type: 'issue',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    },
  ],
};

export const dashboardService = {
  DASHBOARD_DATA_KEY,

  // Get raw stored data or initialize if not present
  getRawData: () => {
    try {
      const stored = localStorage.getItem(DASHBOARD_DATA_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      // Initialize on first access
      localStorage.setItem(DASHBOARD_DATA_KEY, JSON.stringify(INITIAL_DASHBOARD_DATA));
      return INITIAL_DASHBOARD_DATA;
    } catch (e) {
      console.error('Error reading dashboard storage:', e);
      return INITIAL_DASHBOARD_DATA;
    }
  },

  // Save raw data directly to LocalStorage
  saveRawData: (data) => {
    try {
      localStorage.setItem(DASHBOARD_DATA_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Failed to save dashboard data to localStorage:', e);
      return false;
    }
  },

  // Computed data for presentation
  getDashboardData: () => {
    const raw = dashboardService.getRawData();
    const registeredUsers = storageService.getUsers();
    const calculatedMembers = (raw.baseMemberCount || 340) + registeredUsers.length;
    const booksAvailable = Math.max(0, (raw.totalBooks || 0) - (raw.booksIssued || 0));

    return {
      ...raw,
      totalMembers: calculatedMembers,
      booksAvailable,
    };
  },

  // 1. Issue Book: increments booksIssued, decrements booksAvailable, adds activity, persists in localStorage
  issueBook: (details, currentUser) => {
    const current = dashboardService.getRawData();
    const newIssued = (current.booksIssued || 0) + 1;

    const newActivity = {
      id: 'act_' + Date.now(),
      timestamp: 'Just now',
      user: details.memberName || currentUser?.name || 'Member',
      role: details.memberRole || 'Student',
      action: 'Issued Book',
      detail: details.bookTitle,
      category: details.category || 'General Circulation',
      type: 'issue',
      avatar: currentUser?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(details.memberName || 'User')}`,
    };

    const updated = {
      ...current,
      booksIssued: newIssued,
      recentActivities: [newActivity, ...(current.recentActivities || [])].slice(0, 10),
    };

    dashboardService.saveRawData(updated);
    return dashboardService.getDashboardData();
  },

  // 2. Return Book: decrements booksIssued, increments booksAvailable, decrements overdueBooks if applicable, persists in localStorage
  returnBook: (details, currentUser) => {
    const current = dashboardService.getRawData();
    const newIssued = Math.max(0, (current.booksIssued || 0) - 1);
    const newOverdue = details.wasOverdue
      ? Math.max(0, (current.overdueBooks || 0) - 1)
      : (current.overdueBooks || 0);

    const newActivity = {
      id: 'act_' + Date.now(),
      timestamp: 'Just now',
      user: details.memberName || currentUser?.name || 'Member',
      role: details.memberRole || 'Student',
      action: 'Processed Return',
      detail: `${details.bookTitle} (Condition: ${details.condition || 'Good'}${details.wasOverdue ? ' - Overdue cleared' : ''})`,
      category: 'Circulation Return',
      type: 'return',
      avatar: currentUser?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(details.memberName || 'User')}`,
    };

    const updated = {
      ...current,
      booksIssued: newIssued,
      overdueBooks: newOverdue,
      recentActivities: [newActivity, ...(current.recentActivities || [])].slice(0, 10),
    };

    dashboardService.saveRawData(updated);
    return dashboardService.getDashboardData();
  },

  // 3. Collect Fine: increments fineCollected, clears overdue count, adds activity, persists in localStorage
  collectFine: (details, currentUser) => {
    const current = dashboardService.getRawData();
    const amount = parseFloat(details.amount) || 0;
    const newFineTotal = Math.round(((parseFloat(current.fineCollected) || 0) + amount) * 100) / 100;
    const newOverdue = Math.max(0, (current.overdueBooks || 0) - 1);

    const newActivity = {
      id: 'act_' + Date.now(),
      timestamp: 'Just now',
      user: details.memberName || 'Member',
      role: 'Student',
      action: 'Fine Collected',
      detail: `Penalty received $${amount.toFixed(2)} - ${details.reason || 'Overdue settlement'}`,
      category: 'Fine Receipts',
      type: 'fine',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(details.memberName || 'User')}`,
    };

    const updated = {
      ...current,
      fineCollected: newFineTotal,
      overdueBooks: newOverdue,
      recentActivities: [newActivity, ...(current.recentActivities || [])].slice(0, 10),
    };

    dashboardService.saveRawData(updated);
    return dashboardService.getDashboardData();
  },

  // 4. Add New Title: increments totalBooks, increments booksAvailable, adds activity, persists in localStorage
  addNewBook: (details, currentUser) => {
    const current = dashboardService.getRawData();
    const count = parseInt(details.copies) || 1;
    const newTotalBooks = (current.totalBooks || 0) + count;

    const newActivity = {
      id: 'act_' + Date.now(),
      timestamp: 'Just now',
      user: currentUser?.name || 'Cataloging Desk',
      role: currentUser?.role || 'Staff',
      action: 'Catalog Accession',
      detail: `${details.title} by ${details.author} (+${count} ${count === 1 ? 'copy' : 'copies'})`,
      category: details.category || 'General',
      type: 'catalog',
      avatar: currentUser?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser?.name || 'Admin')}`,
    };

    const updated = {
      ...current,
      totalBooks: newTotalBooks,
      recentActivities: [newActivity, ...(current.recentActivities || [])].slice(0, 10),
    };

    dashboardService.saveRawData(updated);
    return dashboardService.getDashboardData();
  },

  // 5. Add Category: increments totalCategories, adds activity, persists in localStorage
  addNewCategory: (categoryName, code, currentUser) => {
    const current = dashboardService.getRawData();
    const newCategories = (current.totalCategories || 0) + 1;

    const newActivity = {
      id: 'act_' + Date.now(),
      timestamp: 'Just now',
      user: currentUser?.name || 'Administrator',
      role: currentUser?.role || 'Staff',
      action: 'Category Added',
      detail: `New academic section: ${categoryName}${code ? ` (${code})` : ''}`,
      category: 'Taxonomy',
      type: 'category',
      avatar: currentUser?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser?.name || 'Admin')}`,
    };

    const updated = {
      ...current,
      totalCategories: newCategories,
      recentActivities: [newActivity, ...(current.recentActivities || [])].slice(0, 10),
    };

    dashboardService.saveRawData(updated);
    return dashboardService.getDashboardData();
  },

  // 6. Register New Member: increments baseMemberCount, adds activity, persists in localStorage
  registerMember: (details, currentUser) => {
    const current = dashboardService.getRawData();
    const newBase = (current.baseMemberCount || 340) + 1;

    const newActivity = {
      id: 'act_' + Date.now(),
      timestamp: 'Just now',
      user: details.name || 'New Member',
      role: details.role || 'Student',
      action: 'Member Enrolled',
      detail: `Assigned ID ${details.membershipId || `LIB-${(details.role || 'STD').substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`}`,
      category: 'Accounts',
      type: 'member',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(details.name || 'Member')}`,
    };

    const updated = {
      ...current,
      baseMemberCount: newBase,
      recentActivities: [newActivity, ...(current.recentActivities || [])].slice(0, 10),
    };

    dashboardService.saveRawData(updated);
    return dashboardService.getDashboardData();
  },

  // Reset to default data if needed
  resetDashboardData: () => {
    dashboardService.saveRawData(INITIAL_DASHBOARD_DATA);
    return dashboardService.getDashboardData();
  },
};
