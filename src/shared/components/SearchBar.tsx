import React from 'react';
import Input from '../../components/ui/Input';

interface SearchBarProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onSearchChange: (value: string) => void;
}

export default function SearchBar({ onSearchChange, className = '', ...props }: SearchBarProps) {
  return (
    <Input
      type="search"
      onChange={(e) => onSearchChange(e.target.value)}
      containerClassName={className}
      {...props}
    />
  );
}
