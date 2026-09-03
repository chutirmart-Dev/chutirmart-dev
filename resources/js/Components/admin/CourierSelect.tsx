import React, { useState, useRef, useEffect } from 'react';
import { Truck, ChevronDown, Check } from 'lucide-react';

export interface CourierOption {
    id: string;
    name: string;
    badge: string;
    badgeColor: string;
    dotColor: string;
    desc: string;
}

export const COURIER_OPTIONS: CourierOption[] = [
    {
        id: 'steadfast',
        name: 'Steadfast Courier',
        badge: 'Top Partner',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        dotColor: 'bg-[#009E49]',
        desc: 'Auto booking across all 64 districts',
    },
    {
        id: 'paperfly',
        name: 'Paperfly Courier',
        badge: 'Wings API',
        badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
        dotColor: 'bg-sky-500',
        desc: 'Doorstep parcel tracking',
    },
    {
        id: 'carrybee',
        name: 'Carrybee Courier',
        badge: 'Express',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
        dotColor: 'bg-amber-500',
        desc: 'Fast digital dispatch',
    },
    {
        id: 'pathao',
        name: 'Pathao Courier',
        badge: 'Aladdin',
        badgeColor: 'bg-red-100 text-red-800 border-red-200',
        dotColor: 'bg-[#E2231A]',
        desc: 'Aladdin OAuth & auto fees',
    },
    {
        id: 'redx',
        name: 'RedX Courier',
        badge: 'Logistics',
        badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
        dotColor: 'bg-rose-600',
        desc: 'Doorstep enterprise logistics',
    },
    {
        id: 'custom',
        name: 'Custom / Manual Courier',
        badge: 'In-House',
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
        dotColor: 'bg-purple-500',
        desc: 'Manual or custom delivery service',
    },
];

interface CourierSelectProps {
    value: string;
    onChange: (courierId: string) => void;
    label?: string;
    showLabel?: boolean;
    compact?: boolean;
    className?: string;
    dropdownAlign?: 'left' | 'right';
}

export const CourierSelect: React.FC<CourierSelectProps> = ({
    value,
    onChange,
    label = "Default Courier:",
    showLabel = true,
    compact = false,
    className = "",
    dropdownAlign = "right",
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selected = COURIER_OPTIONS.find(c => c.id === value) || COURIER_OPTIONS[0];

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
            <div className={`flex items-center gap-2 bg-emerald-50/90 hover:bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/90 shadow-2xs hover:border-[#009E49] transition-all duration-200 ${
                isOpen ? 'ring-2 ring-[#009E49]/20 border-[#009E49]' : ''
            }`}>
                {showLabel && (
                    <span className="text-xs font-black text-emerald-900 whitespace-nowrap flex items-center gap-1.5 select-none">
                        <Truck className="w-3.5 h-3.5 text-[#009E49]" />
                        {label}
                    </span>
                )}

                {/* Custom Trigger Button */}
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`px-3 rounded-lg bg-white hover:bg-emerald-50/50 border transition-all flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-800 outline-none select-none ${
                        compact ? 'h-7 text-[11px] px-2' : 'h-8'
                    } ${
                        isOpen 
                            ? 'border-[#009E49] text-[#009E49] shadow-2xs' 
                            : 'border-emerald-300/80 hover:border-[#009E49]'
                    }`}
                >
                    <span className={`w-2 h-2 rounded-full ${selected.dotColor} shrink-0 ring-1 ring-black/10`} />
                    <span className="truncate max-w-[150px] font-bold text-gray-900">{selected.name}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-[#009E49] stroke-[2.5] transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                    }`} />
                </button>
            </div>

            {/* Custom Modern Floating Dropdown Menu */}
            {isOpen && (
                <div 
                    className={`absolute top-full mt-2 w-72 bg-white rounded-2xl shadow-[0_16px_40px_rgba(0,158,73,0.14),0_4px_16px_rgba(0,0,0,0.06)] border border-emerald-100/90 p-2 z-50 animate-in fade-in zoom-in-95 duration-150 ${
                        dropdownAlign === 'right' ? 'right-0' : 'left-0'
                    }`}
                >
                    <div className="px-2.5 py-1.5 mb-1 text-[10px] font-extrabold uppercase tracking-wider text-gray-400 flex items-center justify-between border-b border-gray-100 select-none">
                        <span>Courier Partners</span>
                        <span className="text-[#009E49] text-[9px] font-bold">{COURIER_OPTIONS.length} Partners</span>
                    </div>

                    <div className="space-y-1">
                        {COURIER_OPTIONS.map((courier) => {
                            const isSelected = courier.id === value;
                            return (
                                <button
                                    key={courier.id}
                                    type="button"
                                    onClick={() => {
                                        onChange(courier.id);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between transition-all cursor-pointer border-none group ${
                                        isSelected
                                            ? 'bg-[#009E49] text-white shadow-xs font-bold'
                                            : 'hover:bg-emerald-50 text-gray-700 hover:text-emerald-950 font-medium'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isSelected ? 'bg-white' : courier.dotColor}`} />
                                        <div className="truncate">
                                            <div className={`text-xs ${isSelected ? 'text-white font-bold' : 'text-gray-900 font-semibold group-hover:text-[#009E49]'}`}>
                                                {courier.name}
                                            </div>
                                            <div className={`text-[10px] truncate ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                                                {courier.desc}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${
                                            isSelected 
                                                ? 'bg-white/20 text-white border-white/30' 
                                                : courier.badgeColor
                                        }`}>
                                            {courier.badge}
                                        </span>
                                        {isSelected && (
                                            <Check className="w-3.5 h-3.5 text-white stroke-[3] shrink-0" />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
