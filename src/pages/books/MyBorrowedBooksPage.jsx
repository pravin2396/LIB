import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookmarkCheck,
  Calendar,
  Clock,
  RotateCcw,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  Search,
} from 'lucide-react';
import { useBooks } from '../../context/BookContext';
import { bookService } from '../../services/bookService';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

const MyBorrowedBooksPage = () => {
  const { borrowedBooks, returnBook } = useBooks();
  const navigate = useNavigate();

  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredBooks = borrowedBooks.filter((item) => {
    const matchesFilter =
      filter === 'all'
        ? true
        : filter === 'active'
        ? item.status === 'Active'
        : item.status === 'Overdue';

    const matchesSearch =
      !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.author.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Borrowed Books
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track active circulation loans, return dates, and history under your student/staff ID.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={BookOpen}
          onClick={() => navigate('/books')}
        >
          Explore More Books
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Loans ({borrowedBooks.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === 'active'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('overdue')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === 'overdue'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Overdue
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search loans..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Loans Grid / Cards */}
      {filteredBooks.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center">
          <BookmarkCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800">No matching borrowed books</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {borrowedBooks.length === 0
              ? 'You have not checked out any books from the library yet.'
              : 'No books matching the selected filter/search.'}
          </p>
          <Button
            variant="primary"
            size="md"
            className="mt-5"
            onClick={() => navigate('/books')}
          >
            Browse Library Catalog
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((item) => {
            const coverUrl = bookService.getCoverUrl(item.coverId, 'M');
            const isOverdue = item.status === 'Overdue';

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-4">
                    <div className="w-20 aspect-2/3 bg-slate-100 rounded-xl overflow-hidden shrink-0 shadow-2xs">
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <BookOpen className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <Badge variant={isOverdue ? 'danger' : 'success'} size="sm">
                          {item.status}
                        </Badge>
                      </div>

                      <h3 className="font-bold text-slate-900 text-sm line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{item.author}</p>
                    </div>
                  </div>

                  {/* Dates Box */}
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Borrowed Date:</span>
                      </span>
                      <span className="font-mono text-slate-700">{item.borrowDate}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Due Date:</span>
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          isOverdue ? 'text-rose-600' : 'text-slate-800'
                        }`}
                      >
                        {item.dueDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Return Button */}
                <div className="pt-4 mt-4 border-t border-slate-100">
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    icon={RotateCcw}
                    onClick={() => returnBook(item.id, item.title)}
                  >
                    Return Book to Library
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBorrowedBooksPage;
