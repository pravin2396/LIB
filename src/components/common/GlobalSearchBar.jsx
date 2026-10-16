import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, BookOpen, User, Hash, ArrowRight, CornerDownLeft } from 'lucide-react';
import { bookService } from '../../services/bookService';
import Badge from './Badge';

const GlobalSearchBar = ({ className = '' }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState([]);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Listen for Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search logic across Title, Author, and ISBN
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase().trim();
    const allBooks = bookService.getStoredBooks();

    const matches = allBooks.filter((book) => {
      const matchTitle = book.title?.toLowerCase().includes(q);
      const matchAuthor = book.author?.toLowerCase().includes(q);
      const matchIsbn = book.isbn?.toLowerCase().includes(q);
      const matchCategory = book.category?.toLowerCase().includes(q);
      return matchTitle || matchAuthor || matchIsbn || matchCategory;
    });

    setResults(matches.slice(0, 6)); // Top 6 instant matches
  }, [query]);

  const handleSelectBook = (bookId) => {
    setIsOpen(false);
    setQuery('');
    navigate(`/books/${bookId}`);
  };

  const handleViewAllResults = () => {
    if (!query.trim()) return;
    setIsOpen(false);
    navigate(`/categories?q=${encodeURIComponent(query)}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (results.length === 1) {
        handleSelectBook(results[0].id);
      } else {
        handleViewAllResults();
      }
    }
  };

  return (
    <div ref={containerRef} className={`relative max-w-md w-full ${className}`}>
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Global search by Title, Author, or ISBN..."
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-20 py-2 text-xs sm:text-sm bg-slate-100/90 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-indigo-500 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-2xs"
        />

        {/* Clear X Button */}
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setResults([]);
              inputRef.current?.focus();
            }}
            className="absolute right-10 p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Shortcut Pill */}
        <kbd className="hidden sm:inline-flex items-center gap-0.5 absolute right-2.5 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-white border border-slate-200 rounded-md shadow-2xs pointer-events-none select-none">
          <span className="text-[11px]">⌘</span>K
        </kbd>
      </div>

      {/* Instant Dropdown Results */}
      {isOpen && query.trim() && (
        <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in duration-150">
          <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
            <span>Instant Matches ({results.length})</span>
            <span className="text-[10px] text-slate-400">Search Title • Author • ISBN</span>
          </div>

          {results.length === 0 ? (
            <div className="py-8 px-4 text-center">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">No books found matching &quot;{query}&quot;</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Try searching with a different title, author, or ISBN number.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {results.map((book) => {
                const isOutOfStock = (book.availableCopies || 0) <= 0;
                return (
                  <button
                    key={book.id}
                    onClick={() => handleSelectBook(book.id)}
                    className="w-full px-3.5 py-2.5 text-left hover:bg-indigo-50/50 flex items-center gap-3 transition-colors group cursor-pointer"
                  >
                    <img
                      src={book.coverImage || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&auto=format&fit=crop&q=80'}
                      alt={book.title}
                      className="w-8 h-11 object-cover rounded shadow-2xs border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                          {book.title}
                        </span>
                        <Badge variant={isOutOfStock ? 'danger' : 'primary'} size="sm" className="shrink-0 text-[10px]">
                          {isOutOfStock ? 'Out of Stock' : `${book.availableCopies} available`}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                        <span className="truncate flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          {book.author}
                        </span>
                        <span>•</span>
                        <span className="truncate font-mono text-[10px] text-slate-400 flex items-center gap-0.5">
                          <Hash className="w-3 h-3 text-slate-400" />
                          {book.isbn}
                        </span>
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors shrink-0" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Bottom Footer: View all results */}
          <div className="p-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={handleViewAllResults}
              className="w-full py-1.5 px-3 rounded-lg text-indigo-600 hover:bg-indigo-100/60 font-semibold text-center transition-colors flex items-center justify-center gap-1.5"
            >
              <span>View full results in Search & Categories</span>
              <CornerDownLeft className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalSearchBar;
