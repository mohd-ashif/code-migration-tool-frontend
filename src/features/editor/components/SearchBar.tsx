import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = 'Search files...' }: SearchBarProps) {
  return (
    <div className="relative flex items-center shrink-0">
      <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 bg-[#0B0B12] border border-border text-white placeholder-gray-600 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-[11px] transition-all font-mono"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2.5 p-0.5 text-gray-500 hover:text-white rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
