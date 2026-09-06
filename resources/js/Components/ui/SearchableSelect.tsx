import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Search, X } from 'lucide-react';

export interface Option {
    value: string | number;
    label: string;
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
    onDisabledClick?: () => void;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
    options,
    value,
    onChange,
    placeholder = 'Select an option',
    searchPlaceholder = 'Type to search...',
    disabled = false,
    className = '',
    error,
    required = false,
    onDisabledClick,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Find currently selected option
    const selectedOption = options.find(opt => String(opt.value) === String(value) || opt.label === value);

    // Filter options based on search query
    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Click outside listener
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchQuery('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
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
                className={`w-full h-12 px-4 rounded-xl border flex items-center justify-between gap-2 transition-all cursor-pointer select-none bg-white ${
                    disabled ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200' : ''
                } ${
                    isOpen 
                        ? 'border-[#009E49] ring-2 ring-[#009E49]/15 shadow-sm' 
                        : error 
                            ? 'border-red-500 bg-red-50/20' 
                            : 'border-gray-300 hover:border-gray-400'
                }`}
            >
                {isOpen ? (
                    <div className="flex-1 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder={searchPlaceholder}
                            className="w-full bg-transparent border-none p-0 text-[15px] text-gray-900 placeholder:text-gray-500 focus:outline-none font-bangla"
                            onKeyDown={e => {
                                if (e.key === 'Escape') {
                                    setIsOpen(false);
                                    setSearchQuery('');
                                }
                            }}
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery('')}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-full"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                ) : (
                    <span className={`text-[15px] truncate font-bangla ${selectedOption ? 'text-gray-900 font-semibold' : 'text-gray-600 font-normal'}`}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                )}

                <div className="text-gray-500 shrink-0">
                    {isOpen ? (
                        <ChevronUp className="w-4.5 h-4.5 text-[#009E49]" />
                    ) : (
                        <ChevronDown className="w-4.5 h-4.5 text-gray-500" />
                    )}
                </div>
            </div>

            {/* Floating Dropdown List */}
            {isOpen && (
                <div 
                    className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-gray-200/90 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.08)] py-1.5 max-h-60 overflow-y-auto"
                    style={{ scrollbarWidth: 'thin' }}
                >
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((opt, idx) => {
                            const isSelected = selectedOption && (String(selectedOption.value) === String(opt.value) || selectedOption.label === opt.label);
                            return (
                                <div
                                    key={idx}
                                    onClick={() => handleSelect(opt.value)}
                                    className={`px-4 py-2.5 text-[15px] cursor-pointer transition-colors flex items-center justify-between font-bangla ${
                                        isSelected
                                            ? 'bg-emerald-50 text-[#009E49] font-bold'
                                            : 'text-gray-700 hover:bg-emerald-50/60 hover:text-[#009E49]'
                                    }`}
                                >
                                    <span>{opt.label}</span>
                                    {isSelected && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#009E49] shrink-0" />
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <div className="px-4 py-4 text-center text-xs text-gray-400 font-bangla">
                            কোনো ফলাফল পাওয়া যায়নি
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
