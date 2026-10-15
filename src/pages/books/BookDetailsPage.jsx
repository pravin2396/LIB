import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Layers,
  Building,
  Hash,
  Copy,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Sparkles,
  Share2,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { bookService } from '../../services/bookService';
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

const BookDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(() => bookService.getBookById(id));
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [copiedIsbn, setCopiedIsbn] = useState(false);

  // Form State for editing
  const [formData, setFormData] = useState(() => {
    const initial = bookService.getBookById(id);
    return {
      title: initial?.title || '',
      author: initial?.author || '',
      isbn: initial?.isbn || '',
      publisher: initial?.publisher || '',
      category: initial?.category || 'Computer Science',
      publishedYear: initial?.publishedYear || new Date().getFullYear(),
      totalCopies: initial?.totalCopies || 5,
      availableCopies: initial?.availableCopies || 5,
      coverImage: initial?.coverImage || PRESET_COVERS[0].url,
      description: initial?.description || '',
    };
  });

  const loadBookDetails = () => {
    setIsLoading(true);
    try {
      const data = bookService.getBookById(id);
      if (data) {
        setBook(data);
        setFormData({
          title: data.title || '',
          author: data.author || '',
          isbn: data.isbn || '',
          publisher: data.publisher || '',
          category: data.category || 'Computer Science',
          publishedYear: data.publishedYear || new Date().getFullYear(),
          totalCopies: data.totalCopies || 5,
          availableCopies: data.availableCopies || 5,
          coverImage: data.coverImage || PRESET_COVERS[0].url,
          description: data.description || '',
        });
      } else {
        setBook(null);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load book record.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBookDetails();
  }, [id]);

  const handleCopyIsbn = () => {
    if (!book?.isbn) return;
    navigator.clipboard.writeText(book.isbn);
    setCopiedIsbn(true);
    toast.info('ISBN copied to clipboard!');
    setTimeout(() => setCopiedIsbn(false), 2000);
  };

  const handleSaveEdit = async (e) => {
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

      const updated = await bookService.updateBook(id, {
        ...formData,
        totalCopies: total,
        availableCopies: avail,
        publishedYear: parseInt(formData.publishedYear, 10) || book.publishedYear,
      });

      setBook(updated);
      setIsEditModalOpen(false);
      toast.success('Book information updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update book.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      await bookService.deleteBook(id);
      toast.success(`Book "${book.title}" was successfully deleted.`);
      navigate('/books');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete book.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-36 bg-slate-200 rounded-lg"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="h-96 bg-slate-200 rounded-3xl"></div>
          <div className="lg:col-span-2 space-y-4">
            <div className="h-8 bg-slate-200 rounded-lg w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded-lg w-1/2"></div>
            <div className="h-32 bg-slate-200 rounded-2xl"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-20 bg-slate-200 rounded-xl"></div>
              <div className="h-20 bg-slate-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-lg mx-auto shadow-xs">
        <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Book Not Found</h2>
        <p className="text-sm text-slate-500 mt-2 mb-6">
          The requested book item does not exist in the BookStack database or may have been removed.
        </p>
        <Link to="/books">
          <Button variant="primary" icon={ArrowLeft}>
            Back to Book List
          </Button>
        </Link>
      </div>
    );
  }

  const isOutOfStock = (book.availableCopies || 0) <= 0;
  const availabilityPercentage = Math.round(
    ((book.availableCopies || 0) / (book.totalCopies || 1)) * 100
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Navigation & Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/books"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors w-fit group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Book Catalogue</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={Edit2}
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit Book
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Main Details Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8 lg:p-10">
          {/* Left Column: Book Cover Image & Quick Status */}
          <div className="lg:col-span-4 flex flex-col items-center">
            <div className="relative w-full max-w-xs sm:max-w-sm aspect-3/4 rounded-2xl overflow-hidden shadow-xl border border-slate-200/90 group">
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = bookService.DEFAULT_BOOK_COVER;
                }}
              />
              <div className="absolute top-3 left-3">
                <span className="text-xs font-bold bg-slate-900/80 backdrop-blur-md text-white px-3 py-1 rounded-lg shadow-sm">
                  {book.category}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full shadow-sm ${
                    isOutOfStock
                      ? 'bg-rose-500 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {isOutOfStock ? 'Out of Stock' : `${book.availableCopies} Available`}
                </span>
              </div>
            </div>

            {/* Quick Action under cover */}
            <div className="w-full max-w-xs sm:max-w-sm mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Hash className="w-4 h-4 text-indigo-500" />
                <span className="font-mono font-medium truncate">{book.isbn}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyIsbn}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline"
              >
                {copiedIsbn ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIsbn ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Full Details */}
          <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
            <div>
              {/* Category Pill and Year */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 border border-indigo-100 text-indigo-700">
                  {book.category}
                </span>
                <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Published {book.publishedYear}
                </span>
                <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  {book.publisher}
                </span>
              </div>

              {/* Title & Author */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight leading-snug">
                {book.title}
              </h1>
              <p className="text-base sm:text-lg text-slate-600 font-medium mt-1">
                By <span className="text-indigo-600 font-semibold">{book.author}</span>
              </p>

              {/* Availability Meter Card */}
              <div className="mt-6 p-5 rounded-2xl bg-slate-50 border border-slate-100/90">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Stock & Availability
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    {book.availableCopies} of {book.totalCopies} copies in stock ({availabilityPercentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      availabilityPercentage === 0
                        ? 'bg-rose-500'
                        : availabilityPercentage < 30
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, availabilityPercentage))}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-200/60">
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Available Copies</span>
                    <span className="text-base font-extrabold text-slate-900">{book.availableCopies}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Total Inventory</span>
                    <span className="text-base font-extrabold text-slate-900">{book.totalCopies}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-[11px] text-slate-400 block font-medium">Circulating (Issued)</span>
                    <span className="text-base font-extrabold text-indigo-600">
                      {Math.max(0, (book.totalCopies || 0) - (book.availableCopies || 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Book Description */}
              <div className="mt-6">
                <h3 className="text-sm font-bold text-slate-900 mb-2">Book Description</h3>
                <div className="text-sm text-slate-600 leading-relaxed bg-white p-4 rounded-2xl border border-slate-100 whitespace-pre-line">
                  {book.description || 'No detailed synopsis or summary has been provided for this book.'}
                </div>
              </div>
            </div>

            {/* Complete Specification Grid (All 10 required fields covered) */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3">Specification Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Book Title</span>
                  <span className="font-semibold text-slate-800 text-right truncate max-w-[180px]">{book.title}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Author Name</span>
                  <span className="font-semibold text-slate-800 text-right truncate max-w-[180px]">{book.author}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">ISBN Number</span>
                  <span className="font-mono font-semibold text-slate-800">{book.isbn}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Publisher</span>
                  <span className="font-semibold text-slate-800 text-right truncate max-w-[180px]">{book.publisher}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Category</span>
                  <span className="font-semibold text-indigo-600">{book.category}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Published Year</span>
                  <span className="font-semibold text-slate-800">{book.publishedYear}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Available Copies</span>
                  <span className="font-bold text-emerald-600">{book.availableCopies} Units</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Total Copies</span>
                  <span className="font-bold text-slate-800">{book.totalCopies} Units</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Book Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Book Details"
        subtitle="Modify information for this book in the library catalogue."
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Book Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Author Name *
              </label>
              <input
                type="text"
                required
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ISBN Number *
              </label>
              <input
                type="text"
                required
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Publisher
              </label>
              <input
                type="text"
                value={formData.publisher}
                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Literature">Literature</option>
                <option value="Science">Science</option>
                <option value="Psychology">Psychology</option>
                <option value="Philosophy">Philosophy</option>
                <option value="History">History</option>
                <option value="Business & Economics">Business & Economics</option>
                <option value="Fiction">Fiction</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Published Year
              </label>
              <input
                type="number"
                min="1800"
                max="2100"
                value={formData.publishedYear}
                onChange={(e) => setFormData({ ...formData, publishedYear: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Total Copies
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                value={formData.totalCopies}
                onChange={(e) => setFormData({ ...formData, totalCopies: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Available Copies
              </label>
              <input
                type="number"
                min="0"
                max={formData.totalCopies || 1000}
                value={formData.availableCopies}
                onChange={(e) => setFormData({ ...formData, availableCopies: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Cover Image URL
              </label>
              <input
                type="url"
                value={formData.coverImage}
                onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Book Description
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Synopsis or description of the book..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={isSubmitting}>
              {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Book Record"
        subtitle="This action will permanently delete this book entry from the catalogue."
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-xs">
            <p className="font-bold">Warning:</p>
            <p className="mt-1">
              You are about to delete <span className="font-bold">"{book.title}"</span>. This will remove all copies and records for this book from local storage.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Book'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BookDetailsPage;
