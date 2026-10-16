// Category Management & Search Service for BookStack LMS
// Handles categories CRUD, network replication, localStorage persistence, and catalog filtering

import api from './api';
import { bookService } from './bookService';
import { dashboardService } from './dashboardService';

export const CATEGORIES_STORAGE_KEY = 'bookstack_categories_data';

// Standard Seed Categories mapped to the initial library catalogue
export const SEED_CATEGORIES = [
  {
    id: 'cat_1',
    name: 'Computer Science',
    code: 'CS-101',
    description: 'Algorithms, software engineering, architecture, and programming paradigms.',
    color: 'indigo',
    icon: 'Laptop',
    createdAt: '2024-01-15',
  },
  {
    id: 'cat_2',
    name: 'Literature',
    code: 'LIT-201',
    description: 'Classic and contemporary prose, drama, poetry, and world fiction.',
    color: 'emerald',
    icon: 'BookOpen',
    createdAt: '2024-01-20',
  },
  {
    id: 'cat_3',
    name: 'Science',
    code: 'SCI-301',
    description: 'Physics, astronomy, biology, cosmology, and natural sciences.',
    color: 'blue',
    icon: 'Atom',
    createdAt: '2024-02-01',
  },
  {
    id: 'cat_4',
    name: 'Psychology',
    code: 'PSY-401',
    description: 'Human behavior, cognitive habits, mental models, and decision-making.',
    color: 'purple',
    icon: 'Brain',
    createdAt: '2024-02-10',
  },
  {
    id: 'cat_5',
    name: 'Engineering',
    code: 'ENG-501',
    description: 'Systems design, structural mechanics, data structures, and computing systems.',
    color: 'amber',
    icon: 'Wrench',
    createdAt: '2024-02-15',
  },
  {
    id: 'cat_6',
    name: 'Economics',
    code: 'ECO-601',
    description: 'Macroeconomics, behavioral economics, finance, and global markets.',
    color: 'teal',
    icon: 'TrendingUp',
    createdAt: '2024-02-25',
  },
  {
    id: 'cat_7',
    name: 'Philosophy',
    code: 'PHI-701',
    description: 'Ethics, epistemology, logic, and intellectual thought throughout human history.',
    color: 'cyan',
    icon: 'Compass',
    createdAt: '2024-03-01',
  },
  {
    id: 'cat_8',
    name: 'History',
    code: 'HIS-801',
    description: 'Civilizations, historical milestones, revolutions, and geopolitical accounts.',
    color: 'rose',
    icon: 'Landmark',
    createdAt: '2024-03-10',
  },
];

export const categoryService = {
  CATEGORIES_STORAGE_KEY,

  // Synchronous accessor for stored categories
  getStoredCategories: () => {
    try {
      const cached = localStorage.getItem(CATEGORIES_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(SEED_CATEGORIES));
      return SEED_CATEGORIES;
    } catch {
      return SEED_CATEGORIES;
    }
  },

  // Save categories to LocalStorage
  saveCategories: (categories) => {
    try {
      localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to save categories to localStorage:', e);
    }
  },

  // Get categories with live book counts computed from bookService
  getCategoriesWithStats: () => {
    const categories = categoryService.getStoredCategories();
    const books = bookService.getStoredBooks();

    return categories.map((cat) => {
      const matchingBooks = books.filter(
        (b) => b.category?.toLowerCase() === cat.name?.toLowerCase()
      );
      const totalCopies = matchingBooks.reduce((sum, b) => sum + (b.totalCopies || 0), 0);
      const availableCopies = matchingBooks.reduce((sum, b) => sum + (b.availableCopies || 0), 0);

      return {
        ...cat,
        bookCount: matchingBooks.length,
        totalCopies,
        availableCopies,
      };
    });
  },

  // Get single category by ID
  getCategoryById: (id) => {
    const list = categoryService.getStoredCategories();
    return list.find((c) => String(c.id) === String(id));
  },

  // CREATE: Add Category
  addCategory: async (categoryData, currentUser = null) => {
    const currentList = categoryService.getStoredCategories();

    // Check duplicate name
    const nameExists = currentList.some(
      (c) => c.name.toLowerCase() === categoryData.name.trim().toLowerCase()
    );
    if (nameExists) {
      throw new Error(`Category "${categoryData.name.trim()}" already exists.`);
    }

    // 1. Replicate in Network Tab via DummyJSON POST /posts/add
    try {
      await api.post('/posts/add', {
        title: `New Category: ${categoryData.name}`,
        body: `Created category ${categoryData.code || 'CAT'} with description: ${categoryData.description || 'General'}`,
        userId: 1,
      });
    } catch (e) {
      console.warn('Network category POST simulation caught error, persisting locally:', e.message);
    }

    const newCategory = {
      id: 'cat_' + Date.now(),
      name: categoryData.name.trim(),
      code: (categoryData.code || ('CAT-' + Math.floor(100 + Math.random() * 900))).toUpperCase().trim(),
      description: categoryData.description?.trim() || 'General discipline shelf and accession category.',
      color: categoryData.color || 'indigo',
      icon: categoryData.icon || 'BookOpen',
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updatedList = [...currentList, newCategory];
    categoryService.saveCategories(updatedList);

    // Update dashboard metrics and activities
    dashboardService.addNewCategory(newCategory.name, newCategory.code, currentUser);

    return newCategory;
  },

  // UPDATE: Edit Category
  updateCategory: async (id, updatedFields, currentUser = null) => {
    const currentList = categoryService.getStoredCategories();
    const existingIndex = currentList.findIndex((c) => String(c.id) === String(id));

    if (existingIndex === -1) {
      throw new Error('Category not found.');
    }

    const oldCategory = currentList[existingIndex];
    const newName = updatedFields.name ? updatedFields.name.trim() : oldCategory.name;

    // Check duplicate name on rename
    if (newName.toLowerCase() !== oldCategory.name.toLowerCase()) {
      const nameExists = currentList.some(
        (c) => String(c.id) !== String(id) && c.name.toLowerCase() === newName.toLowerCase()
      );
      if (nameExists) {
        throw new Error(`Category name "${newName}" is already in use.`);
      }
    }

    // 1. Replicate in Network Tab via DummyJSON PUT /posts/1
    try {
      await api.put('/posts/1', {
        title: `Updated Category: ${newName}`,
        body: `Category ${id} updated with code ${updatedFields.code || oldCategory.code}`,
      });
    } catch (e) {
      console.warn('Network category PUT simulation caught error, persisting locally:', e.message);
    }

    const updatedCategory = {
      ...oldCategory,
      ...updatedFields,
      name: newName,
      code: (updatedFields.code || oldCategory.code).toUpperCase().trim(),
    };

    currentList[existingIndex] = updatedCategory;
    categoryService.saveCategories(currentList);

    // If category name was renamed, update all existing books that used old name
    if (newName !== oldCategory.name) {
      const storedBooks = bookService.getStoredBooks();
      let booksModified = false;
      const updatedBooks = storedBooks.map((b) => {
        if (b.category?.toLowerCase() === oldCategory.name.toLowerCase()) {
          booksModified = true;
          return { ...b, category: newName };
        }
        return b;
      });

      if (booksModified) {
        localStorage.setItem(bookService.BOOKS_STORAGE_KEY, JSON.stringify(updatedBooks));
      }
    }

    return updatedCategory;
  },

  // DELETE: Delete Category
  deleteCategory: async (id) => {
    const currentList = categoryService.getStoredCategories();
    const existing = currentList.find((c) => String(c.id) === String(id));

    if (!existing) {
      throw new Error('Category not found.');
    }

    // 1. Replicate in Network Tab via DummyJSON DELETE /posts/1
    try {
      await api.delete('/posts/1');
    } catch (e) {
      console.warn('Network category DELETE simulation caught error, persisting locally:', e.message);
    }

    const updatedList = currentList.filter((c) => String(c.id) !== String(id));
    categoryService.saveCategories(updatedList);

    // Update dashboard metrics
    try {
      const rawData = dashboardService.getRawData();
      const updatedDash = {
        ...rawData,
        totalCategories: Math.max(1, (rawData.totalCategories || 1) - 1),
      };
      dashboardService.saveRawData(updatedDash);
    } catch (e) {
      console.error(e);
    }

    return true;
  },

  // SEARCH: Multi-field search across Book Title, Author, ISBN, Category
  searchBooks: (query, mode = 'ALL', category = 'ALL') => {
    const allBooks = bookService.getStoredBooks();
    const q = (query || '').toLowerCase().trim();

    return allBooks.filter((book) => {
      // 1. Category Filter
      if (category !== 'ALL' && book.category?.toLowerCase() !== category.toLowerCase()) {
        return false;
      }

      if (!q) return true;

      // 2. Search Mode Filter
      if (mode === 'title') {
        return book.title?.toLowerCase().includes(q);
      }
      if (mode === 'author') {
        return book.author?.toLowerCase().includes(q);
      }
      if (mode === 'isbn') {
        return book.isbn?.toLowerCase().includes(q);
      }

      // Default: ALL (Global Search matching Title, Author, ISBN, Publisher)
      return (
        book.title?.toLowerCase().includes(q) ||
        book.author?.toLowerCase().includes(q) ||
        book.isbn?.toLowerCase().includes(q) ||
        book.category?.toLowerCase().includes(q) ||
        book.publisher?.toLowerCase().includes(q)
      );
    });
  },
};
