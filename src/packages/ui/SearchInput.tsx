import React from 'react';
import { Search, X } from 'lucide-react';
import { Input, InputProps } from './Input';

export interface SearchInputProps extends Omit<InputProps, 'leftElement' | 'rightElement'> {
  shortcut?: string;
  onClear?: () => void;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, onClear, shortcut = '/', placeholder = 'Search components...', ...props }, ref) => {
    return (
      <Input
        ref={ref}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        leftElement={<Search className="w-3.5 h-3.5" />}
        rightElement={
          Boolean(value) && onClear ? (
            <button
              type="button"
              onClick={onClear}
              className="text-[#737373] hover:text-[#FFFFFF] transition-colors p-0.5"
              aria-label="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          ) : shortcut ? (
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-[#737373] bg-[#161616] border border-[#262626] rounded">
              {shortcut}
            </kbd>
          ) : undefined
        }
        {...props}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';
