import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearchChange: (value: string) => void;
}

export default function SearchBar({ onSearchChange, className = '', ...props }: SearchBarProps) {
  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
      <input
        type="text"
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2 bg-[#12131F] border border-[#1E1F35] text-white placeholder-gray-500 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-xs transition-all"
        {...props}
      />
    </div>
  );
}
