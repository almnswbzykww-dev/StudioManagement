import React, { useState, useEffect, useRef } from 'react';
import { Search, Check, ChevronDown, X } from 'lucide-react';

export interface AutoCompleteOption<T = any> {
  id: string;
  label: string;
  subLabel?: string;
  badge?: string;
  data?: T;
}

interface AutoCompleteProps<T = any> {
  placeholder?: string;
  options: AutoCompleteOption<T>[];
  value?: string;
  onSelect: (option: AutoCompleteOption<T>) => void;
  onClear?: () => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function AutoComplete<T = any>({
  placeholder = 'ابحث هنا بالاسم أو الرقم...',
  options,
  value,
  onSelect,
  onClear,
  label,
  required,
  disabled,
  className = ''
}: AutoCompleteProps<T>) {
  const [searchTerm, setSearchTerm] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value !== undefined) {
      setSearchTerm(value);
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      opt.label.toLowerCase().includes(term) ||
      (opt.subLabel && opt.subLabel.toLowerCase().includes(term)) ||
      (opt.badge && opt.badge.toLowerCase().includes(term))
    );
  });

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
      )}

      <div className="relative">
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>

        <input
          type="text"
          value={searchTerm}
          disabled={disabled}
          onChange={e => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pr-9 pl-9 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50"
        />

        <div className="absolute inset-y-0 left-0 flex items-center pl-2.5 gap-1">
          {searchTerm && onClear && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                onClear();
                setIsOpen(false);
              }}
              className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto backdrop-blur-md">
          {filteredOptions.length === 0 ? (
            <div className="p-3 text-xs text-slate-400 text-center">لا توجد نتائج مطابقة</div>
          ) : (
            filteredOptions.map(opt => {
              const isSelected = opt.label === searchTerm;
              return (
                <div
                  key={opt.id}
                  onClick={() => {
                    setSearchTerm(opt.label);
                    onSelect(opt);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between px-3.5 py-2.5 text-sm cursor-pointer border-b border-slate-800/60 last:border-b-0 hover:bg-blue-600/20 transition-all ${
                    isSelected ? 'bg-blue-600/30 text-blue-300 font-medium' : 'text-slate-200'
                  }`}
                >
                  <div className="flex flex-col text-right">
                    <span className="font-medium">{opt.label}</span>
                    {opt.subLabel && <span className="text-xs text-slate-400 mt-0.5">{opt.subLabel}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    {opt.badge && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                        {opt.badge}
                      </span>
                    )}
                    {isSelected && <Check className="w-4 h-4 text-blue-400" />}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
