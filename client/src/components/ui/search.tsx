import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void; 
}

const Search: React.FC<SearchProps> = ({ 
  placeholder = 'Search for groceries...', 
  className = '',
  onSearch
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [_, navigate] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchQuery.trim()) {
      if (onSearch) {
        onSearch(searchQuery.trim());
      } else {
        // Default behavior: navigate to home with search query
        navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  return (
    <form onSubmit={handleSearch} className={className}>
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full py-2 px-4 pr-10 rounded-lg border border-gray-300"
        />
        <Button 
          type="submit"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-500"
        >
          <i className='bx bx-search text-xl'></i>
        </Button>
      </div>
    </form>
  );
};

export default Search;