import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  Layers,
  Building,
  Hash,
  Copy,
  LayoutGrid,
  List,
  AlertCircle,
  RefreshCw,
  X,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { bookService } from '../../services/bookService';
import { categoryService } from '../../services/categoryService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import SkeletonLoader from '../../components/common/SkeletonLoader';

const PRESET_COVERS = [
  { label: 'Blue Library', url: bookService.DEFAULT_BOOK_COVER || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&auto=format&fit=crop&q=80' },
  { label: 'Classic Bookshelf', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80' },
  { label: 'Academic Open', url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=80' },
  { label: 'Reading Desk', url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&auto=format&fit=crop&q=80' },
  { label: 'Science & Cosmos', url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=500&auto=format&fit=crop&q=80' },
];

const BooksPage = () => {
  const navigate = useNavigate();

  // State: Initialize with stored books immediately so catalog displays on first render
  const [books, setBooks] = useState(() => bookService.getStoredBooks());
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedAuthor, setSelectedAuthor] = useState('ALL');
  const [sortBy, setSortBy] = useState('title-asc'); // 'title-asc' | 'title-desc' | 'year-desc' | 'year-asc' | 'copies-desc'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [deletingBook, setDeletingBook] = useState(null);

  // Form State for Add / Edit
  const initialFormData = {
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    category: 'Computer Science',
    publishedYear: new Date().getFullYear(),
    totalCopies: 5,
    availableCopies: 5,
    coverImage: PRESET_COVERS[0].url,
    description: '',
  };
  const [formData, setFormData] = useState(initialFormData);

  // Load books
  const loadBooks = async (force = false) => {
    if (force) {
      setIsLoading(true);
    }
    setError(null);
    try {
      const data = await bookService.getBooks(force);
      setBooks(data);
      if (force) {
        toast.success('Book catalogue synced with Third-Party API!');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch books catalogue from API/storage. Please retry.');
      toast.error('Could not load books catalogue.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  // Filter and Sort Logic
  const filteredAndSortedBooks = useMemo(() => {
    let result = [...books];

    // Search (Title, Author, ISBN)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (b) =>
          b.title?.toLowerCase().includes(q) ||
          b.author?.toLowerCase().includes(q) ||
          b.isbn?.toLowerCase().includes(q)
      );
    }

    // Filter by Category
    if (selectedCategory !== 'ALL') {
      result = result.filter((b) => b.category === selectedCategory);
    }

    // Filter by Author
    if (selectedAuthor !== 'ALL') {
      result = result.filter((b) => b.author === selectedAuthor);
    }

    // Sort by Title and others
    result.sort((a, b) => {
      if (sortBy === 'title-asc') {
        return (a.title || '').localeCompare(b.title || '');
      }
      if (sortBy === 'title-desc') {
        return (b.title || '').localeCompare(a.title || '');
      }
      if (sortBy === 'year-desc') {
        return (b.publishedYear || 0) - (a.publishedYear || 0);
      }
      if (sortBy === 'year-asc') {
        return (a.publishedYear || 0) - (b.publishedYear || 0);
      }
      if (sortBy === 'copies-desc') {
        return (b.availableCopies || 0) - (a.availableCopies || 0);
      }
      return 0;
    });

    return result;
  }, [books, searchQuery, selectedCategory, selectedAuthor, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredAndSortedBooks.length / itemsPerPage) || 1;
  const paginatedBooks = useMemo(() => {
    const validPage = Math.min(Math.max(1, currentPage), totalPages);
    const start = (validPage - 1) * itemsPerPage;
    return filteredAndSortedBooks.slice(start, start + itemsPerPage);
  }, [filteredAndSortedBooks, currentPage, itemsPerPage, totalPages]);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedAuthor, sortBy]);

  // Unique Categories and Authors
  const categories = useMemo(() => {
    const fromBooks = bookService.getCategories(books);
    const fromService = categoryService.getStoredCategories().map((c) => c.name);
    return Array.from(new Set([...fromBooks, ...fromService])).sort();
  }, [books]);
  const authors = useMemo(() => bookService.getAuthors(books), [books]);

  // Handlers for Add
  const handleOpenAdd = () => {
    setFormData({
      ...initialFormData,
      coverImage: PRESET_COVERS[Math.floor(Math.random() * PRESET_COVERS.length)].url,
    });
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.title.trim() || !formData.author.trim() || !formData.isbn.trim()) {
      toast.warning('Title, Author, and ISBN are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const total = parseInt(formData.totalCopies, 10) || 1;
      const avail = Math.min(parseInt(formData.availableCopies, 10) || total, total);

      const created = await bookService.addBook({
        ...formData,
        totalCopies: total,
        availableCopies: avail,
        publishedYear: parseInt(formData.publishedYear, 10) || new Date().getFullYear(),
      });

      setBooks((prev) => [created, ...prev]);
      setIsAddModalOpen(false);
      toast.success(`Book "${created.title}" added to library inventory!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to add book to catalog.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handlers for Edit
  const handleOpenEdit = (book, e) => {
    if (e) e.stopPropagation();
    setEditingBook(book);
    setFormData({
      title: book.title || '',
      author: book.author || '',
      isbn: book.isbn || '',
      publisher: book.publisher || '',
      category: book.category || 'Computer Science',
      publishedYear: book.publishedYear || new Date().getFullYear(),
      totalCopies: book.totalCopies || 5,
      availableCopies: book.availableCopies || 5,
      coverImage: book.coverImage || PRESET_COVERS[0].url,
      description: book.description || '',
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingBook || isSubmitting) return;

    if (!formData.title.trim() || !formData.author.trim()) {
      toast.warning('Title and Author are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const total = parseInt(formData.totalCopies, 10) || 1;
      const avail = Math.min(parseInt(formData.availableCopies, 10) || total, total);

      const updated = await bookService.updateBook(editingBook.id, {
        ...formData,
        totalCopies: total,
        availableCopies: avail,
        publishedYear: parseInt(formData.publishedYear, 10) || editingBook.publishedYear,
      });

      setBooks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      setEditingBook(null);
      toast.success(`Book "${updated.title}" updated successfully!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update book.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handlers for Delete
  const handleOpenDelete = (book, e) => {
    if (e) e.stopPropagation();
    setDeletingBook(book);
  };

  const handleConfirmDelete = async () => {
    if (!deletingBook || isDeleting) return;

    setIsDeleting(true);
    try {
      await bookService.deleteBook(deletingBook.id);
      setBooks((prev) => prev.filter((b) => b.id !== deletingBook.id));
      toast.success(`Book "${deletingBook.title}" removed from catalog.`);
      setDeletingBook(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete book.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedAuthor('ALL');
    setSortBy('title-asc');
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Banner with Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700 mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Library Catalogue System</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Book Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Display, search, filter, and manage all accessioned library volumes in real time.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="md"
            icon={RefreshCw}
            onClick={() => loadBooks(true)}
            title="Reload from API"
          >
            Sync API
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={handleOpenAdd}
          >
            Add New Book
          </Button>
        </div>
      </div>

      {/* 2. Search, Filter, Sort & View Controls */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-4">
        {/* Top Control Row: Search + View Mode */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, author name, or ISBN..."
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

          {/* View Mode Toggle Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-end sm:self-auto border border-slate-200/60">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Grid Card View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden md:inline">Grid</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Table List View"
            >
              <List className="w-4 h-4" />
              <span className="hidden md:inline">Table</span>
            </button>
          </div>
        </div>

        {/* Bottom Control Row: Category Filter + Author Filter + Sort by Title */}
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 focus:bg-white px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600"
            >
              <option value="ALL">All Categories ({categories.length})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Author Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Author
            </label>
            <select
              value={selectedAuthor}
              onChange={(e) => setSelectedAuthor(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 focus:bg-white px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600"
            >
              <option value="ALL">All Authors ({authors.length})</option>
              {authors.map((auth) => (
                <option key={auth} value={auth}>
                  {auth}
                </option>
              ))}
            </select>
          </div>

          {/* Sort by Title */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 focus:bg-white px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600"
            >
              <option value="title-asc">Title: A to Z</option>
              <option value="title-desc">Title: Z to A</option>
              <option value="year-desc">Year: Newest First</option>
              <option value="year-asc">Year: Oldest First</option>
              <option value="copies-desc">Most Available Copies</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleResetFilters}
              className="w-full py-2 px-3 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl border border-slate-200 hover:border-indigo-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* 3. Error Banner */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-rose-800 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => loadBooks(true)}
            className="font-bold underline hover:no-underline ml-4"
          >
            Retry
          </button>
        </div>
      )}

      {/* 4. Book List Content: Loading, Empty, Grid, or Table */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <SkeletonLoader type="bookCard" count={8} />
        </div>
      ) : filteredAndSortedBooks.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center">
          <BookOpen className="w-14 h-14 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No matching books found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, selecting another category, or resetting all filters.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={handleResetFilters}
          >
            Reset All Filters
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW OF BOOK CARDS */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {paginatedBooks.map((book) => {
            const isOutOfStock = (book.availableCopies || 0) <= 0;
            return (
              <div
                key={book.id}
                onClick={() => navigate(`/books/${book.id}`)}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer group"
              >
                {/* Book Cover Image */}
                <div className="relative aspect-3/4 bg-slate-100 overflow-hidden border-b border-slate-100">
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = bookService.DEFAULT_BOOK_COVER;
                    }}
                  />
                  {/* Category Pill on top left */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="text-[10px] font-bold bg-slate-900/80 backdrop-blur-md text-white px-2 py-0.5 rounded-md shadow-xs">
                      {book.category}
                    </span>
                  </div>

                  {/* Availability Badge on top right */}
                  <div className="absolute top-2.5 right-2.5">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs ${
                        isOutOfStock
                          ? 'bg-rose-500 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {isOutOfStock ? 'Out of Stock' : `${book.availableCopies} Available`}
                    </span>
                  </div>
                </div>

                {/* Book Metadata */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1 font-medium">
                      By {book.author}
                    </p>

                    {/* Publisher & Year */}
                    <div className="flex items-center gap-2 mt-2.5 text-[11px] text-slate-400">
                      <span className="truncate max-w-[120px]">{book.publisher}</span>
                      <span>•</span>
                      <span>{book.publishedYear}</span>
                    </div>

                    {/* ISBN Number */}
                    <div className="mt-2 text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100 flex items-center justify-between">
                      <span>ISBN:</span>
                      <span className="font-semibold text-slate-600">{book.isbn}</span>
                    </div>

                    {/* Copies availability bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                        <span>Circulation:</span>
                        <span className="font-semibold text-slate-700">
                          {book.availableCopies} of {book.totalCopies} copies
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isOutOfStock
                              ? 'bg-rose-500 w-full'
                              : 'bg-emerald-500'
                          }`}
                          style={{
                            width: isOutOfStock
                              ? '100%'
                              : `${Math.min(100, ((book.availableCopies || 0) / (book.totalCopies || 1)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Actions: View, Edit, Delete */}
                  <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/books/${book.id}`);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 p-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Details</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => handleOpenEdit(book, e)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Edit Book"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleOpenDelete(book, e)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Book"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Book Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">ISBN</th>
                  <th className="py-3.5 px-4">Publisher</th>
                  <th className="py-3.5 px-4">Year</th>
                  <th className="py-3.5 px-4 text-center">Available / Total</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedBooks.map((book) => {
                  const isOutOfStock = (book.availableCopies || 0) <= 0;
                  return (
                    <tr
                      key={book.id}
                      onClick={() => navigate(`/books/${book.id}`)}
                      className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                    >
                      {/* Cover & Title */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className="w-10 h-14 object-cover rounded-md shadow-2xs shrink-0"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = bookService.DEFAULT_BOOK_COVER;
                            }}
                          />
                          <div className="min-w-0 max-w-xs">
                            <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                              {book.title}
                            </h4>
                            <p className="text-xs text-slate-500 truncate mt-0.5">
                              {book.author}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <Badge variant="purple" size="sm">
                          {book.category}
                        </Badge>
                      </td>

                      {/* ISBN */}
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                        {book.isbn}
                      </td>

                      {/* Publisher */}
                      <td className="py-3.5 px-4 text-xs text-slate-600 max-w-[120px] truncate">
                        {book.publisher}
                      </td>

                      {/* Year */}
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        {book.publishedYear}
                      </td>

                      {/* Copies */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
                            isOutOfStock
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {book.availableCopies} / {book.totalCopies}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => navigate(`/books/${book.id}`)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleOpenEdit(book, e)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleOpenDelete(book, e)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Pagination Controls */}
      {filteredAndSortedBooks.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Showing <strong className="text-slate-700">{(currentPage - 1) * itemsPerPage + 1}</strong> to{' '}
            <strong className="text-slate-700">
              {Math.min(currentPage * itemsPerPage, filteredAndSortedBooks.length)}
            </strong>{' '}
            of <strong className="text-slate-700">{filteredAndSortedBooks.length}</strong> cataloged books
          </p>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>

            <div className="flex items-center gap-1">
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
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* 6. MODAL: Add New Book (Includes all 10 required fields) */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Book"
        subtitle="Catalog a new volume with complete bibliographic records"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          {/* Row 1: Title & Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Book Title"
              placeholder="e.g. Designing Data-Intensive Applications"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <Input
              label="Author Name"
              placeholder="e.g. Martin Kleppmann"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              required
            />
          </div>

          {/* Row 2: ISBN & Publisher */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="ISBN Number"
              placeholder="e.g. 978-1449373320"
              value={formData.isbn}
              onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              required
            />
            <Input
              label="Publisher"
              placeholder="e.g. O'Reilly Media"
              value={formData.publisher}
              onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
              required
            />
          </div>

          {/* Row 3: Category & Published Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 tracking-tight mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Literature">Literature</option>
                <option value="Science">Science</option>
                <option value="Engineering">Engineering</option>
                <option value="Economics">Economics</option>
                <option value="History">History</option>
                <option value="Psychology">Psychology</option>
                <option value="Philosophy">Philosophy</option>
              </select>
            </div>

            <Input
              label="Published Year"
              type="number"
              placeholder="2022"
              value={formData.publishedYear}
              onChange={(e) => setFormData({ ...formData, publishedYear: e.target.value })}
              required
            />
          </div>

          {/* Row 4: Total Copies & Available Copies */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Total Copies"
              type="number"
              min="1"
              value={formData.totalCopies}
              onChange={(e) => {
                const tot = parseInt(e.target.value, 10) || 1;
                setFormData({
                  ...formData,
                  totalCopies: tot,
                  availableCopies: Math.min(formData.availableCopies, tot),
                });
              }}
              required
            />

            <Input
              label="Available Copies"
              type="number"
              min="0"
              max={formData.totalCopies}
              value={formData.availableCopies}
              onChange={(e) => setFormData({ ...formData, availableCopies: parseInt(e.target.value, 10) || 0 })}
              required
            />
          </div>

          {/* Row 5: Book Cover Image URL & Presets */}
          <div>
            <Input
              label="Book Cover Image URL"
              placeholder="https://..."
              value={formData.coverImage}
              onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
              required
            />
            <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1 text-xs text-slate-500">
              <span className="font-semibold text-[11px] shrink-0">Presets:</span>
              {PRESET_COVERS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setFormData({ ...formData, coverImage: preset.url })}
                  className={`text-[10px] px-2 py-0.5 rounded-md border whitespace-nowrap transition-colors ${
                    formData.coverImage === preset.url
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 6: Book Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 tracking-tight mb-1.5">
              Book Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Enter comprehensive synopsis, learning outcomes, or catalog summary..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 focus:bg-white p-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all shadow-2xs"
              required
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
            <Button variant="outline" size="md" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={isSubmitting}>
              {isSubmitting ? 'Saving to Catalog...' : 'Save to Catalog'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 7. MODAL: Edit Book */}
      <Modal
        isOpen={!!editingBook}
        onClose={() => setEditingBook(null)}
        title="Edit Book Details"
        subtitle={`Updating bibliographic records for: ${editingBook?.title}`}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Book Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <Input
              label="Author Name"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="ISBN Number"
              value={formData.isbn}
              onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
              required
            />
            <Input
              label="Publisher"
              value={formData.publisher}
              onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 tracking-tight mb-1.5">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Literature">Literature</option>
                <option value="Science">Science</option>
                <option value="Engineering">Engineering</option>
                <option value="Economics">Economics</option>
                <option value="History">History</option>
                <option value="Psychology">Psychology</option>
                <option value="Philosophy">Philosophy</option>
              </select>
            </div>

            <Input
              label="Published Year"
              type="number"
              value={formData.publishedYear}
              onChange={(e) => setFormData({ ...formData, publishedYear: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Input
              label="Total Copies"
              type="number"
              min="1"
              value={formData.totalCopies}
              onChange={(e) => {
                const tot = parseInt(e.target.value, 10) || 1;
                setFormData({
                  ...formData,
                  totalCopies: tot,
                  availableCopies: Math.min(formData.availableCopies, tot),
                });
              }}
              required
            />

            <Input
              label="Available Copies"
              type="number"
              min="0"
              max={formData.totalCopies}
              value={formData.availableCopies}
              onChange={(e) => setFormData({ ...formData, availableCopies: parseInt(e.target.value, 10) || 0 })}
              required
            />
          </div>

          <Input
            label="Book Cover Image URL"
            value={formData.coverImage}
            onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 tracking-tight mb-1.5">
              Book Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 focus:bg-white p-3 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all shadow-2xs"
              required
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
            <Button variant="outline" size="md" onClick={() => setEditingBook(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={isSubmitting}>
              {isSubmitting ? 'Updating Book...' : 'Update Book'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* 8. MODAL: Delete Confirmation */}
      <Modal
        isOpen={!!deletingBook}
        onClose={() => setDeletingBook(null)}
        title="Confirm Removal"
        subtitle="This action will delete the book from the active catalogue."
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Are you sure you want to remove{' '}
            <strong className="text-slate-900 font-bold">"{deletingBook?.title}"</strong> by{' '}
            {deletingBook?.author}? All copies ({deletingBook?.totalCopies}) will be removed from circulation.
          </p>

          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-800">
            ⚠️ <strong>Warning:</strong> This modification is saved directly into local storage.
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="outline" size="md" onClick={() => setDeletingBook(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="md" onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete Book'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BooksPage;
