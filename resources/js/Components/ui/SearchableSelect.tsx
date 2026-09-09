import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Search, X } from 'lucide-react';

export interface Option {
    value: string | number;
    label: string;
    searchTerms?: string;
}

interface SearchableSelectProps {
    options: Option[];
    value: string | number;
    onChange: (value: string) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    disabled?: boolean;
    className?: string;
    error?: boolean | string;
    required?: boolean;
    allowCustom?: boolean;
    icon?: React.ReactNode;
    onDisabledClick?: () => void;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
    options,
    value,
    onChange,
    placeholder = 'Select an option',
    searchPlaceholder = 'খুঁজতে টাইপ করুন...',
    disabled = false,
    className = '',
    error,
    required = false,
    allowCustom = false,
    icon,
    onDisabledClick,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Find currently selected option
    const selectedOption = options.find(opt => String(opt.value) === String(value) || opt.label === value);

    // Filter options based on search query (matches label, value, searchTerms, case-insensitive)
    const filteredOptions = options.filter(opt => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return true;
        if (opt.label.toLowerCase().includes(q)) return true;
        if (String(opt.value).toLowerCase().includes(q)) return true;
        if (opt.searchTerms && opt.searchTerms.toLowerCase().includes(q)) return true;
        return false;
    });

    // Click/touch outside listener
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchQuery('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, []);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSelect = (optValue: string | number) => {
        onChange(String(optValue));
        setIsOpen(false);
        setSearchQuery('');
    };

    return (
        <div className={`relative w-full ${className}`} ref={containerRef}>
            {/* Main Trigger Box */}
            <div
                onClick={() => {
                    if (!disabled) {
                        setIsOpen(!isOpen);
                    } else if (onDisabledClick) {
                        onDisabledClick();
                    }
                }}
                className={`w-full h-13 sm:h-14 px-3.5 sm:px-4 rounded-lg border flex items-center justify-between gap-2.5 transition-all cursor-pointer select-none bg-white shadow-xs ${
                    disabled ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200' : ''
                } ${
                    isOpen 
                        ? 'border-[#009E49] ring-4 ring-[#009E49]/12 shadow-sm' 
                        : error 
                            ? 'border-red-500 bg-red-50/20 ring-2 ring-red-500/10' 
                            : 'border-gray-300 hover:border-gray-400'
                }`}
            >
                <div className="flex-1 flex items-center gap-2.5 min-w-0">
                    {icon && <div className="text-gray-400 shrink-0 pointer-events-none">{icon}</div>}
                    {isOpen ? (
                        <div className="flex-1 flex items-center gap-2 min-w-0" onClick={e => e.stopPropagation()}>
                            <Search className="w-4.5 h-4.5 text-gray-400 shrink-0" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder={searchPlaceholder}
                                className="w-full bg-transparent border-none p-0 text-base sm:text-[16.5px] font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none font-bangla"
                                onKeyDown={e => {
                                    if (e.key === 'Escape') {
                                        setIsOpen(false);
                                        setSearchQuery('');
                                    } else if (e.key === 'Enter') {
                                        if (filteredOptions.length > 0) {
                                            handleSelect(filteredOptions[0].value);
                                        } else if (allowCustom && searchQuery.trim()) {
                                            handleSelect(searchQuery.trim());
                                        }
                                    }
                                }}
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery('')}
                                    className="p-1 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer"
                                    title="Clear search"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ) : (
                        <span className={`text-base sm:text-[16.5px] truncate font-bangla ${selectedOption || value ? 'text-gray-900 font-semibold' : 'text-gray-400 font-normal'}`}>
                            {selectedOption ? selectedOption.label : (value ? String(value) : placeholder)}
                        </span>
                    )}
                </div>

                <div className="text-gray-400 shrink-0 ml-1">
                    {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-[#009E49]" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                </div>
            </div>

            {/* Floating Dropdown List */}
            {isOpen && (
                <div 
                    className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-gray-200/90 rounded-lg shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1),0_4px_12px_-2px_rgba(0,0,0,0.05)] py-1 max-h-64 overflow-y-auto"
                    style={{ scrollbarWidth: 'thin' }}
                >
                    {searchQuery && (
                        <div className="px-4 py-2 text-xs sm:text-[13px] text-gray-500 font-bangla border-b border-gray-100 flex items-center justify-between font-medium">
                            <span>ফলাফল: {filteredOptions.length}টি পাওয়া গেছে</span>
                            <span className="text-[11px] text-gray-400">এন্টার চাপলে ১মটি সিলেক্ট হবে</span>
                        </div>
                    )}
                    {filteredOptions.length > 0 ? (
                        <>
                            {filteredOptions.map((opt, idx) => {
                                const isSelected = selectedOption && (String(selectedOption.value) === String(opt.value) || selectedOption.label === opt.label);
                                return (
                                    <div
                                        key={idx}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            handleSelect(opt.value);
                                        }}
                                        onClick={() => handleSelect(opt.value)}
                                        className={`px-4 py-3 sm:py-3.5 text-base sm:text-[16.5px] cursor-pointer transition-colors flex items-center justify-between font-bangla ${
                                            isSelected
                                                ? 'bg-emerald-50 text-[#009E49] font-bold'
                                                : 'text-gray-800 hover:bg-emerald-50/60 hover:text-[#009E49]'
                                        }`}
                                    >
                                        <span>{opt.label}</span>
                                        {isSelected && (
                                            <span className="w-2 h-2 rounded-full bg-[#009E49] shrink-0" />
                                        )}
                                    </div>
                                );
                            })}
                            {allowCustom && searchQuery.trim() && !filteredOptions.some(o => o.label.toLowerCase() === searchQuery.trim().toLowerCase() || String(o.value).toLowerCase() === searchQuery.trim().toLowerCase()) && (
                                <div
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        handleSelect(searchQuery.trim());
                                    }}
                                    className="px-4 py-2.5 text-sm sm:text-base font-semibold text-[#009E49] bg-emerald-50/70 hover:bg-emerald-100 cursor-pointer border-t border-gray-100 flex items-center justify-between font-bangla transition-colors"
                                >
                                    <span>"{searchQuery.trim()}" হিসেবে ব্যবহার করুন</span>
                                    <span className="text-xs bg-[#009E49] text-white px-2 py-0.5 rounded font-bold">সিলেক্ট</span>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="px-4 py-5 text-center text-sm text-gray-600 font-bangla space-y-2">
                            <p>"{searchQuery}" নামে কোনো ফলাফল পাওয়া যায়নি</p>
                            {allowCustom && searchQuery.trim() && (
                                <button
                                    type="button"
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        handleSelect(searchQuery.trim());
                                    }}
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#009E49] hover:bg-[#008038] px-3.5 py-2 rounded-md shadow-xs transition-colors cursor-pointer active:scale-95"
                                >
                                    <span>"{searchQuery.trim()}" এলাকা হিসেবে সিলেক্ট করুন</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
