import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Layers,
  Search,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  Filter,
  X,
  Tag,
  Hash,
  User,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  FolderPlus,
  Palette,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { categoryService, SEED_CATEGORIES } from '../../services/categoryService';
import { bookService } from '../../services/bookService';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

const COLOR_OPTIONS = [
  { id: 'indigo', label: 'Indigo', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  { id: 'emerald', label: 'Emerald', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  { id: 'blue', label: 'Blue', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  { id: 'purple', label: 'Purple', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  { id: 'amber', label: 'Amber', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  { id: 'teal', label: 'Teal', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  { id: 'cyan', label: 'Cyan', bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
  { id: 'rose', label: 'Rose', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
];

const CategoriesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State: Categories & Books
  const [categories, setCategories] = useState([]);
  const [books, setBooks] = useState([]);

  // Search & Filter state
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = searchParams.get('category') || 'ALL';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchMode, setSearchMode] = useState('ALL'); // 'ALL' | 'title' | 'author' | 'isbn'
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Pagination for books
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    color: 'indigo',
  });

  // Reload categories & books
  const reloadData = () => {
    setCategories(categoryService.getCategoriesWithStats());
    setBooks(bookService.getStoredBooks());
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Update query when searchParams change
  useEffect(() => {
    const qParam = searchParams.get('q');
    if (qParam !== null && qParam !== searchQuery) {
      setSearchQuery(qParam);
    }
    const catParam = searchParams.get('category');
    if (catParam !== null && catParam !== selectedCategory) {
      setSelectedCategory(catParam);
    }
  }, [searchParams]);

  // Synchronize URL search params
  const updateParams = (newQuery, newCategory) => {
    const params = {};
    if (newQuery) params.q = newQuery;
    if (newCategory && newCategory !== 'ALL') params.category = newCategory;
    setSearchParams(params, { replace: true });
  };

  // Filter books matching search mode, query, and selected category
  const filteredBooks = useMemo(() => {
    return categoryService.searchBooks(searchQuery, searchMode, selectedCategory);
  }, [searchQuery, searchMode, selectedCategory, books]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / itemsPerPage));
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBooks.slice(start, start + itemsPerPage);
  }, [filteredBooks, currentPage, itemsPerPage]);

  // Handle Add Category Open
  const handleOpenAdd = () => {
    setFormData({
      name: '',
      code: 'CAT-' + Math.floor(100 + Math.random() * 900),
      description: '',
      color: 'indigo',
    });
    setIsAddModalOpen(true);
  };

  // Handle Edit Category Open
  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      code: cat.code || '',
      description: cat.description || '',
      color: cat.color || 'indigo',
    });
  };

  // Submit Add Category
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.warning('Category name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await categoryService.addCategory(formData, user);
      toast.success(`Category "${created.name}" created successfully!`);
      setIsAddModalOpen(false);
      reloadData();
    } catch (err) {
      toast.error(err.message || 'Failed to add category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit Category
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingCategory || !formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      const updated = await categoryService.updateCategory(editingCategory.id, formData, user);
      toast.success(`Category "${updated.name}" updated successfully!`);
      setEditingCategory(null);
      reloadData();
    } catch (err) {
      toast.error(err.message || 'Failed to update category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Delete Category
  const handleDeleteSubmit = async () => {
    if (!deletingCategory) return;

    setIsSubmitting(true);
    try {
      await categoryService.deleteCategory(deletingCategory.id);
      toast.success(`Category "${deletingCategory.name}" deleted.`);
      if (selectedCategory === deletingCategory.name) {
        setSelectedCategory('ALL');
        updateParams(searchQuery, 'ALL');
      }
      setDeletingCategory(null);
      reloadData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper for color styles
  const getColorStyle = (colorId) => {
    return COLOR_OPTIONS.find((c) => c.id === colorId) || COLOR_OPTIONS[0];
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-700 mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Search & Category Taxonomy</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Search & Categories
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Global search across title, author, or ISBN, manage classification shelves, and filter catalog books.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={handleOpenAdd}
          >
            Add Category
          </Button>
        </div>
      </div>

      {/* 2. Global & Multi-Field Search Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Multi-field search modes */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs text-slate-400 font-semibold mr-1 flex items-center gap-1 shrink-0">
              <Search className="w-3.5 h-3.5" />
              <span>Search By:</span>
            </span>
            {[
              { id: 'ALL', label: 'Global (All Fields)' },
              { id: 'title', label: 'Book Title' },
              { id: 'author', label: 'Author' },
              { id: 'isbn', label: 'ISBN' },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => {
                  setSearchMode(mode.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  searchMode === mode.id
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400 self-end sm:self-auto">
            {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'} matched
          </span>
        </div>

        {/* Search Input Box with Clear X Button */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder={
              searchMode === 'title'
                ? 'Enter book title to search...'
                : searchMode === 'author'
                ? 'Enter author name to search...'
                : searchMode === 'isbn'
                ? 'Enter ISBN number (e.g. 978-0132350884)...'
                : 'Search catalog by Book Title, Author, ISBN, or Publisher...'
            }
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
              updateParams(e.target.value, selectedCategory);
            }}
            className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setCurrentPage(1);
                updateParams('', selectedCategory);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Category Management Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Category Management ({categories.length})
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Click any category card to filter books below
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
            const color = getColorStyle(cat.color);

            return (
              <div
                key={cat.id}
                onClick={() => {
                  const newCat = isSelected ? 'ALL' : cat.name;
                  setSelectedCategory(newCat);
                  setCurrentPage(1);
                  updateParams(searchQuery, newCat);
                }}
                className={`bg-white rounded-2xl border p-4 shadow-xs hover:shadow-md transition-all cursor-pointer relative flex flex-col justify-between group ${
                  isSelected
                    ? 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/10'
                    : 'border-slate-200/80 hover:border-indigo-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${color.bg} ${color.text} ${color.border}`}
                    >
                      {cat.code || 'CAT'}
                    </span>

                    <div
                      className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleOpenEdit(cat)}
                        title="Edit Category"
                        className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingCategory(cat)}
                        title="Delete Category"
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {cat.description || 'General category shelf.'}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span>{cat.bookCount || 0} Titles</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {cat.availableCopies || 0} in stock
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Filter Books by Category Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Filter Books by Category:
            </h3>
          </div>

          {selectedCategory !== 'ALL' && (
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setCurrentPage(1);
                updateParams(searchQuery, 'ALL');
              }}
              className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1"
            >
              <span>Clear category filter</span>
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Scrollable category chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => {
              setSelectedCategory('ALL');
              setCurrentPage(1);
              updateParams(searchQuery, 'ALL');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              selectedCategory === 'ALL'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories ({books.length})
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.name);
                  setCurrentPage(1);
                  updateParams(searchQuery, cat.name);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {cat.bookCount || 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Filtered Books Results (Grid or Table view) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Catalog Results ({filteredBooks.length})
            </h3>
            <p className="text-xs text-slate-400">
              {selectedCategory !== 'ALL' ? `Filtered by ${selectedCategory}` : 'Showing all disciplines'}
              {searchQuery ? ` matching "${searchQuery}"` : ''}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg border transition-colors ${
                viewMode === 'grid'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg border transition-colors ${
                viewMode === 'table'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {paginatedBooks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No books found</p>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search keywords or switching category filters.
            </p>
            {(searchQuery || selectedCategory !== 'ALL') && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                  updateParams('', 'ALL');
                }}
              >
                Reset Search & Filters
              </Button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {paginatedBooks.map((book) => {
              const isOut = (book.availableCopies || 0) <= 0;
              return (
                <div
                  key={book.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="relative aspect-3/4 mb-3 overflow-hidden rounded-xl bg-slate-100">
                      <img
                        src={
                          book.coverImage ||
                          'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&auto=format&fit=crop&q=80'
                        }
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge variant={isOut ? 'danger' : 'primary'} size="sm">
                          {isOut ? 'Out of Stock' : `${book.availableCopies} Left`}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 block">
                        {book.category || 'General'}
                      </span>
                      <h4
                        className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-indigo-600 transition-colors"
                        title={book.title}
                      >
                        {book.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-1 flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{book.author}</span>
                      </p>
                      <p className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                        <Hash className="w-3 h-3 text-slate-400" />
                        <span>{book.isbn}</span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {book.publishedYear || 'Recent'}
                    </span>
                    <Link
                      to={`/books/${book.id}`}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      <span>Details</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Book Details</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">ISBN</th>
                    <th className="px-5 py-3">Publisher</th>
                    <th className="px-5 py-3 text-center">Stock</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedBooks.map((book) => {
                    const isOut = (book.availableCopies || 0) <= 0;
                    return (
                      <tr key={book.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                book.coverImage ||
                                'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&auto=format&fit=crop&q=80'
                              }
                              alt={book.title}
                              className="w-8 h-11 object-cover rounded shadow-2xs border border-slate-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="font-bold text-slate-900 block truncate max-w-xs">
                                {book.title}
                              </span>
                              <span className="text-xs text-slate-400 block truncate">
                                {book.author}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          <Badge variant="purple" size="sm">
                            {book.category}
                          </Badge>
                        </td>

                        <td className="px-5 py-3.5 font-mono text-xs text-slate-500">
                          {book.isbn}
                        </td>

                        <td className="px-5 py-3.5 text-xs text-slate-500">
                          {book.publisher || 'N/A'} ({book.publishedYear || '-'})
                        </td>

                        <td className="px-5 py-3.5 text-center">
                          <Badge variant={isOut ? 'danger' : 'success'} size="sm">
                            {isOut ? 'Out of Stock' : `${book.availableCopies} / ${book.totalCopies}`}
                          </Badge>
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          <Link
                            to={`/books/${book.id}`}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
                          >
                            <span>View</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. Books Pagination */}
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
      </div>

      {/* MODAL 1: ADD CATEGORY */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Category"
        subtitle="Create an accession shelf classification for library cataloguing"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Artificial Intelligence, Data Science"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Category Code *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. AI-101"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl font-mono uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Brief summary of books catalogued under this genre..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-slate-400" />
              <span>Badge Color Accent</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: c.id })}
                  className={`py-1.5 px-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1 transition-all ${
                    formData.color === c.id
                      ? `${c.bg} ${c.text} ${c.border} ring-2 ring-indigo-500/30`
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${c.text === 'text-indigo-700' ? 'bg-indigo-600' : 'bg-slate-400'}`}></span>
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={Plus}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: EDIT CATEGORY */}
      <Modal
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        title="Edit Category"
        subtitle={`Update details for ${editingCategory?.name}`}
        maxWidth="max-w-md"
      >
        {editingCategory && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category Code *
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl font-mono uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-slate-400" />
                <span>Badge Color Accent</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: c.id })}
                    className={`py-1.5 px-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1 transition-all ${
                      formData.color === c.id
                        ? `${c.bg} ${c.text} ${c.border} ring-2 ring-indigo-500/30`
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setEditingCategory(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                icon={CheckCircle2}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* MODAL 3: DELETE CATEGORY CONFIRMATION */}
      <Modal
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        title="Delete Category"
        subtitle="This action removes the classification from the library system"
        maxWidth="max-w-md"
      >
        {deletingCategory && (
          <div className="space-y-4">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-xs text-rose-900">
                  Are you sure you want to delete &quot;{deletingCategory.name}&quot;?
                </h4>
                <p className="text-xs text-rose-700/90 mt-1 leading-relaxed">
                  Deleting this category does not delete the physical books, but will remove this taxonomy shelf.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => setDeletingCategory(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                icon={Trash2}
                disabled={isSubmitting}
                onClick={handleDeleteSubmit}
              >
                {isSubmitting ? 'Deleting...' : 'Confirm Delete'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CategoriesPage;
