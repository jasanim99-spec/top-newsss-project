import React, { useState, KeyboardEvent } from 'react';
import { X, Plus } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

const TagInput: React.FC<TagInputProps> = ({ tags = [], onChange, placeholder = "Add..." }) => {
  const [inputValue, setInputValue] = useState('');

  const addCurrentInput = () => {
    if (!inputValue.trim()) return;

    // Split by comma in case user inputs multiple comma-separated items
    const newItems = inputValue
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0 && !tags.includes(item));

    if (newItems.length > 0) {
      onChange([...tags, ...newItems]);
    }
    setInputValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCurrentInput();
    } else if (e.key === ',') {
      e.preventDefault();
      addCurrentInput();
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="space-y-1.5">
      <div className="border border-gray-300 rounded-lg p-2.5 bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium rounded-md shadow-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1.5 text-blue-500 hover:text-blue-800 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 outline-none text-sm bg-transparent placeholder-gray-400"
          />
          <button
            type="button"
            onClick={addCurrentInput}
            disabled={!inputValue.trim()}
            className="inline-flex items-center px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-400">
        Type word and press Enter, comma (,), or click '+ Add'
      </p>
    </div>
  );
};

export default TagInput;