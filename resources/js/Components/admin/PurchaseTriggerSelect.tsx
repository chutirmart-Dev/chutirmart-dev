import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, Zap, ChevronDown, Check, Sparkles } from 'lucide-react';

export type PurchaseTriggerValue = 'admin_confirmed' | 'instant_checkout';

export interface PurchaseTriggerOption {
    id: PurchaseTriggerValue;
    title: string;
    subtitle: string;
    badge: string;
    tagline: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    isRecommended?: boolean;
}

export const PURCHASE_TRIGGER_OPTIONS: PurchaseTriggerOption[] = [
    {
        id: 'admin_confirmed',
        title: 'এডমিন প্যানেল থেকে কনফার্ম/Completed করলে',
        subtitle: 'Admin Confirmed / Completed Event',
        badge: 'Recommended for COD',
        tagline: 'সেরা ও সুরক্ষিত (Best & Safe)',
        description: 'ক্যাশ অন ডেলিভারিতে ফেক বা ক্যান্সেল অর্ডার ফিল্টার করতে সেরা। ডেলিভারি টিম বা অ্যাডমিন যখন অর্ডার Confirm বা Complete করবেন, তখনই CAPI দিয়ে মেটাতে Purchase ইভেন্ট পাঠানো হবে।',
        icon: ShieldCheck,
        isRecommended: true,
    },
    {
        id: 'instant_checkout',
        title: 'ওয়েবসাইটে প্লেস করার সাথে সাথে তাৎক্ষণিক',
        subtitle: 'Instant Checkout Placement Trigger',
        badge: 'Instant Tracking',
        tagline: 'রিয়েল-টাইম (Real-Time)',
        description: 'কাস্টমার চেকআউটে অর্ডার প্লেস করার মুহূর্তে সাথে সাথে ব্রাউজার পিক্সেল ও সার্ভার CAPI উভয়েই মেটাতে Purchase ইভেন্ট পাঠাবে। ইনস্ট্যান্ট রিপোর্টিং ও পেইড প্রিপেইড ক্যাম্পেইনের জন্য কার্যকর।',
        icon: Zap,
        isRecommended: false,
    },
];

interface PurchaseTriggerSelectProps {
    value: string;
    onChange: (value: PurchaseTriggerValue) => void;
    id?: string;
    name?: string;
    className?: string;
}

export const PurchaseTriggerSelect: React.FC<PurchaseTriggerSelectProps> = ({
    value,
    onChange,
    id = 'facebook_purchase_trigger',
    name = 'facebook_purchase_trigger',
    className = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption =
        PURCHASE_TRIGGER_OPTIONS.find((opt) => opt.id === value) ||
        PURCHASE_TRIGGER_OPTIONS[0];

    const SelectedIcon = selectedOption.icon;

    // Handle outside click to close
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    return (
        <div ref={containerRef} className={`relative w-full ${className}`}>
            {/* Custom Interactive Modern Trigger Button */}
            <button
                type="button"
                id={id}
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
                className={`w-full min-h-[52px] sm:min-h-[54px] px-4 py-2.5 bg-white hover:bg-[#F9FCFA] border rounded-xl transition-all duration-200 flex items-center justify-between gap-3 text-left cursor-pointer outline-none select-none ${
                    isOpen
                        ? 'border-[#009E49] ring-2 ring-[#009E49]/20 shadow-xs bg-[#F9FCFA]'
                        : 'border-gray-200 hover:border-[#009E49]/60 shadow-2xs'
                }`}
            >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Branded Icon Container */}
                    <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            selectedOption.id === 'admin_confirmed'
                                ? 'bg-emerald-50 text-[#009E49] border border-emerald-200/80'
                                : 'bg-blue-50 text-blue-600 border border-blue-200/80'
                        }`}
                    >
                        <SelectedIcon className="w-5 h-5 stroke-[2.2]" />
                    </div>

                    {/* Text and Badge */}
                    <div className="truncate min-w-0 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="text-sm sm:text-[15px] font-black text-gray-900 font-bangla truncate">
                                {selectedOption.title}
                            </span>
                            <span
                                className={`text-[11px] sm:text-[12px] font-bold px-2.5 py-0.5 rounded-md border shrink-0 ${
                                    selectedOption.id === 'admin_confirmed'
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                        : 'bg-blue-50 text-blue-800 border-blue-200'
                                }`}
                            >
                                {selectedOption.badge}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Chevron icon with smooth rotation */}
                <div className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-50/80 text-[#009E49]">
                    <ChevronDown
                        className={`w-5 h-5 stroke-[2.5] transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                        }`}
                    />
                </div>
            </button>

            {/* Custom Modern Floating Dropdown Menu with ChutirMart Branding */}
            {isOpen && (
                <div
                    role="listbox"
                    aria-label="Purchase Event Trigger Mode"
                    className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border-2 border-emerald-500/20 shadow-[0_20px_50px_rgba(0,158,73,0.16),0_6px_20px_rgba(0,0,0,0.06)] p-3 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-2.5"
                >
                    {/* Dropdown Header */}
                    <div className="px-2.5 py-2 flex items-center justify-between border-b border-gray-100 select-none">
                        <span className="text-[11.5px] sm:text-[12.5px] font-black uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-[#009E49]" />
                            ট্রিগার মোড নির্বাচন করুন (Trigger Selection)
                        </span>
                        <span className="text-[11px] font-bold text-[#009E49] bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-full">
                            {PURCHASE_TRIGGER_OPTIONS.length} টি মোড
                        </span>
                    </div>

                    {/* Option Cards */}
                    <div className="space-y-2.5">
                        {PURCHASE_TRIGGER_OPTIONS.map((option) => {
                            const isSelected = option.id === value;
                            const OptionIcon = option.icon;

                            return (
                                <button
                                    key={option.id}
                                    type="button"
                                    role="option"
                                    aria-selected={isSelected}
                                    onClick={() => {
                                        onChange(option.id);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full p-4 rounded-xl text-left transition-all duration-150 cursor-pointer border group select-none ${
                                        isSelected
                                            ? 'bg-gradient-to-r from-[#009E49] to-[#00873E] text-white border-[#009E49] shadow-sm'
                                            : 'bg-white hover:bg-emerald-50/60 border-gray-200/90 hover:border-[#009E49]/50 text-gray-800'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3 min-w-0">
                                            {/* Icon */}
                                            <div
                                                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                                                    isSelected
                                                        ? 'bg-white/20 text-white shadow-2xs'
                                                        : option.id === 'admin_confirmed'
                                                        ? 'bg-emerald-100/70 text-[#009E49] group-hover:bg-[#009E49] group-hover:text-white'
                                                        : 'bg-blue-100/70 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
                                                }`}
                                            >
                                                <OptionIcon className="w-5 h-5 stroke-[2.3]" />
                                            </div>

                                            {/* Title & Tagline */}
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2.5 flex-wrap">
                                                    <h4
                                                        className={`text-sm sm:text-[15.5px] font-black font-bangla ${
                                                            isSelected
                                                                ? 'text-white'
                                                                : 'text-gray-900 group-hover:text-[#009E49]'
                                                        }`}
                                                    >
                                                        {option.title}
                                                    </h4>
                                                    <span
                                                        className={`text-[10.5px] sm:text-[11.5px] font-black px-2.5 py-0.5 rounded-md border ${
                                                            isSelected
                                                                ? 'bg-white text-[#009E49] border-white/40 shadow-xs'
                                                                : option.id === 'admin_confirmed'
                                                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                                                : 'bg-blue-100 text-blue-800 border-blue-200'
                                                        }`}
                                                    >
                                                        {option.badge}
                                                    </span>
                                                </div>
                                                <p
                                                    className={`text-[11px] sm:text-[12px] font-semibold mt-1 ${
                                                        isSelected ? 'text-white/80' : 'text-gray-400'
                                                    }`}
                                                >
                                                    {option.subtitle} • {option.tagline}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Selection Checkmark / Radio Indicator */}
                                        <div className="shrink-0 pt-0.5">
                                            {isSelected ? (
                                                <div className="w-6 h-6 rounded-full bg-white text-[#009E49] flex items-center justify-center shadow-xs">
                                                    <Check className="w-4 h-4 stroke-[3]" />
                                                </div>
                                            ) : (
                                                <div className="w-6 h-6 rounded-full border-2 border-gray-300 group-hover:border-[#009E49] flex items-center justify-center transition-colors" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Detailed Bengali Description */}
                                    <p
                                        className={`text-[12px] sm:text-[13px] leading-relaxed mt-3 pt-2.5 font-bangla transition-colors border-t ${
                                            isSelected
                                                ? 'text-emerald-50/95 border-white/20 font-normal'
                                                : 'text-gray-600 border-gray-100 group-hover:text-gray-700 font-normal'
                                        }`}
                                    >
                                        {option.description}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Hidden native input for forms / compatibility */}
            <input type="hidden" name={name} value={value} />
        </div>
    );
};
