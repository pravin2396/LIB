import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Star,
  Calendar,
  CheckCircle,
  BookmarkPlus,
  Info,
  ExternalLink,
} from 'lucide-react';
import { useBooks } from '../../context/BookContext';
import { bookService } from '../../services/bookService';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import SkeletonLoader from '../../components/common/SkeletonLoader';

const CATEGORIES = [
  { id: 'all', label: 'All Collections', query: 'literature' },
  { id: 'cs', label: 'Computer Science', query: 'programming' },
  { id: 'science', label: 'Natural Science', query: 'science' },
  { id: 'history', label: 'World History', query: 'history' },
  { id: 'philosophy', label: 'Philosophy', query: 'philosophy' },
  { id: 'psychology', label: 'Psychology', query: 'psychology' },
];

const BooksCatalogPage = () => {
  const { books, loading, searchQuery, setSearchQuery, borrowBook, borrowedBooks } = useBooks();

  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedBook, setSelectedBook] = useState(null);
  const [inputVal, setInputVal] = useState(searchQuery);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (inputVal.trim()) {
      setSearchQuery(inputVal.trim());
    }
  };

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat.id);
    setInputVal(cat.query);
    setSearchQuery(cat.query);
  };

  const isBookAlreadyBorrowed = (bookKey) => {
    return borrowedBooks.some((b) => b.bookKey === bookKey);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Library Book Catalog
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Search live across millions of volumes powered by the Open Library Third-Party API.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="purple" size="md">
            API Integrated
          </Badge>
          <Badge variant="primary" size="md">
            {books.length} Books Loaded
          </Badge>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs space-y-4">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search className="w-5 h-5 absolute left-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, author name, or subject keywords (e.g., Clean Code, Hawking, Fiction)..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="w-full pl-11 pr-28 py-3 text-sm bg-slate-50 focus:bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
          />
          <button
            type="submit"
            className="absolute right-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Search
          </button>
        </form>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Topics:</span>
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200/70 text-slate-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <SkeletonLoader type="bookCard" count={8} />
        ) : books.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-slate-200">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No books found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              We couldn't find matching titles for "{searchQuery}". Try a different keyword or topic filter.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setInputVal('technology');
                setSearchQuery('technology');
              }}
            >
              Reset to Recommended
            </Button>
          </div>
        ) : (
          books.map((book) => {
            const coverUrl = bookService.getCoverUrl(book.cover_i, 'M');
            const alreadyBorrowed = isBookAlreadyBorrowed(book.key);

            return (
              <div
                key={book.key}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden group"
              >
                {/* Book Cover Container */}
                <div className="relative aspect-3/4 bg-slate-100 flex items-center justify-center overflow-hidden border-b border-slate-100">
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="p-6 text-center flex flex-col items-center justify-center">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mb-2">
                        <BookOpen className="w-7 h-7" />
                      </div>
                      <span className="text-xs font-bold text-slate-700 line-clamp-2">
                        {book.title}
                      </span>
                    </div>
                  )}

                  {/* Status badge in top right */}
                  <div className="absolute top-2.5 right-2.5">
                    {alreadyBorrowed ? (
                      <span className="bg-amber-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                        Borrowed by You
                      </span>
                    ) : (
                      <span
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs ${
                          book.availability === 'Borrowed'
                            ? 'bg-rose-500 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {book.availability === 'Borrowed' ? 'Unavailable' : 'Available'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3
                      className="font-bold text-slate-900 text-sm line-clamp-2 group-hover:text-indigo-600 transition-colors cursor-pointer"
                      onClick={() => setSelectedBook(book)}
                    >
                      {book.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1 font-medium">
                      By {Array.isArray(book.author_name) ? book.author_name.join(', ') : book.author_name}
                    </p>

                    <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
                      <div className="flex items-center gap-1 text-amber-500 font-semibold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{book.ratings_average || 4.5}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{book.first_publish_year}</span>
                      </div>
                    </div>

                    {/* Subject Pills */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {(book.subject || []).slice(0, 2).map((sub, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md truncate max-w-[120px]"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => setSelectedBook(book)}
                      className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                      title="View Details"
                    >
                      <Info className="w-4 h-4" />
                    </button>

                    <Button
                      variant={alreadyBorrowed ? 'outline' : 'primary'}
                      size="sm"
                      fullWidth
                      disabled={alreadyBorrowed || book.availability === 'Borrowed'}
                      onClick={() => borrowBook(book)}
                      icon={alreadyBorrowed ? CheckCircle : BookmarkPlus}
                    >
                      {alreadyBorrowed ? 'On Loan' : 'Borrow Book'}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Book Details Modal */}
      {selectedBook && (
        <Modal
          isOpen={!!selectedBook}
          onClose={() => setSelectedBook(null)}
          title={selectedBook.title}
          subtitle={`By ${Array.isArray(selectedBook.author_name) ? selectedBook.author_name.join(', ') : selectedBook.author_name}`}
          maxWidth="max-w-xl"
        >
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-28 shrink-0 aspect-2/3 bg-slate-100 rounded-xl overflow-hidden shadow-xs">
                {bookService.getCoverUrl(selectedBook.cover_i, 'M') ? (
                  <img
                    src={bookService.getCoverUrl(selectedBook.cover_i, 'M')}
                    alt={selectedBook.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <BookOpen className="w-8 h-8" />
                  </div>
                )}
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400">First Published:</span>{' '}
                  <span className="font-semibold text-slate-800">
                    {selectedBook.first_publish_year}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Publisher:</span>{' '}
                  <span className="font-semibold text-slate-800">
                    {Array.isArray(selectedBook.publisher) ? selectedBook.publisher[0] : 'Academic Press'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Rating:</span>{' '}
                  <span className="font-semibold text-amber-600">
                    ★ {selectedBook.ratings_average || 4.5} / 5.0
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Circulation Status:</span>{' '}
                  <Badge
                    variant={isBookAlreadyBorrowed(selectedBook.key) ? 'warning' : 'success'}
                    size="sm"
                  >
                    {isBookAlreadyBorrowed(selectedBook.key) ? 'Borrowed by You' : 'In Stock'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Overview & Summary
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                {selectedBook.description ||
                  'No extended synopsis recorded for this title. Available for campus loan and study hall reserve.'}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <Button variant="outline" size="md" onClick={() => setSelectedBook(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="md"
                disabled={
                  isBookAlreadyBorrowed(selectedBook.key) ||
                  selectedBook.availability === 'Borrowed'
                }
                onClick={() => {
                  borrowBook(selectedBook);
                  setSelectedBook(null);
                }}
              >
                {isBookAlreadyBorrowed(selectedBook.key) ? 'Already Borrowed' : 'Confirm Borrowing'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default BooksCatalogPage;
