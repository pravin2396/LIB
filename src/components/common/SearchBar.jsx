import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({
  placeholder = 'Search books by title, author, topic...',
  onSearch,
  defaultValue = '',
  className = '',
}) => {
  const [term, setTerm] = useState(defaultValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(term.trim());
  };

  const handleClear = () => {
    setTerm('');
    if (onSearch) onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className={`relative flex items-center ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
        <Search className="w-4.5 h-4.5" />
      </div>

      <input
        type="text"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-20 py-2.5 text-sm bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
      />

      <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
        {term && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          type="submit"
          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
