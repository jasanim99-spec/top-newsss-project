import React from 'react';
import { Search } from 'lucide-react';
import { LANGUAGE_OPTIONS, CATEGORIES } from '../../types';

interface SearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchTerm,
  onSearchChange,
  selectedLanguage,
  onLanguageChange,
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 mb-6 transition-colors">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search by title or keyword..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-slate-100 dark:focus:ring-slate-700 focus:border-slate-400 dark:focus:border-slate-600 transition-all font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Language Filter */}
        <select
          value={selectedLanguage}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="px-4 py-2.5 text-sm bg-slate-50/50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-slate-100 dark:focus:ring-slate-700 focus:border-slate-400 dark:focus:border-slate-600 transition-all font-medium text-slate-700 dark:text-slate-200"
        >
          <option value="">All Languages</option>
          {LANGUAGE_OPTIONS.map((lang) => (
            <option key={lang.code} value={lang.code} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
              {lang.name}
            </option>
          ))}
        </select>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="px-4 py-2.5 text-sm bg-slate-50/50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-slate-100 dark:focus:ring-slate-700 focus:border-slate-400 dark:focus:border-slate-600 transition-all font-medium text-slate-700 dark:text-slate-200"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100">
              {cat.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SearchAndFilter;