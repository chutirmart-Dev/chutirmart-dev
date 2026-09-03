import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

// ── Card ──────────────────────────────────────────────────────────────────────
export const AdminCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,158,73,0.03),0_8px_28px_rgba(0,0,0,0.04)] ${className}`}>
        {children}
    </div>
);

// ── Section Header inside a card ───────────────────────────────────────────
export const CardHead: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode }> = ({ title, subtitle, action }) => (
    <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBEDF2]">
        <div>
            <h3 className="text-[15px] font-black text-[#1A1A2E]">{title}</h3>
            {subtitle && <p className="text-[12px] text-[#9096B0] mt-0.5">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
    </div>
);

// ── Page header (title + subtitle + optional action) ───────────────────────
export const PageHeader: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode }> = ({ title, subtitle, action }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
            <h2 className="text-[22px] font-black text-[#1A1A2E]">{title}</h2>
            {subtitle && <p className="text-[13px] text-[#9096B0] mt-0.5">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
    </div>
);

// ── Primary button (Green branding) ────────────────────────────────────────
export const PrimaryBtn: React.FC<{ children: React.ReactNode; onClick?: () => void; type?: 'button' | 'submit'; disabled?: boolean; className?: string }> = ({ children, onClick, type = 'button', disabled, className = '' }) => (
    <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#009E49] text-white text-[13px] font-bold hover:bg-[#007F3B] transition-all shadow-[0_4px_14px_rgba(0,158,73,0.2)] border-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
        {children}
    </button>
);

// ── Save button (ChutirMart Red branding gradient) ─────────────────────────
export const SaveBtn: React.FC<{ children: React.ReactNode; type?: 'button' | 'submit'; disabled?: boolean; className?: string }> = ({ children, type = 'submit', disabled, className = '' }) => (
    <button
        type={type}
        disabled={disabled}
        className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white text-[13px] font-bold transition-all border-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
        style={{ background: 'linear-gradient(135deg,#E2231A 0%,#B8150D 100%)', boxShadow: '0 4px 14px rgba(226,35,26,0.25)' }}
    >
        {children}
    </button>
);

// ── Text Input ─────────────────────────────────────────────────────────────
export const AdminInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { error?: string }> = ({ error, className = '', ...props }) => (
    <div>
        <input
            {...props}
            className={`w-full h-11 px-3.5 rounded-xl border ${error ? 'border-red-400 bg-red-50' : 'border-[#EBEDF2] bg-[#F7F8FA]'} text-[14px] text-[#1A1A2E] placeholder-[#C0C6D8] focus:outline-none focus:border-[#009E49] focus:ring-2 focus:ring-[#009E49]/15 hover:border-[#009E49]/40 transition-all ${className}`}
        />
        {error && <p className="text-[12px] text-red-500 mt-1">{error}</p>}
    </div>
);

// ── Textarea ───────────────────────────────────────────────────────────────
export const AdminTextarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }> = ({ error, className = '', ...props }) => (
    <div>
        <textarea
            {...props}
            className={`w-full px-3.5 py-3 rounded-xl border ${error ? 'border-red-400 bg-red-50' : 'border-[#EBEDF2] bg-[#F7F8FA]'} text-[14px] text-[#1A1A2E] placeholder-[#C0C6D8] focus:outline-none focus:border-[#009E49] focus:ring-2 focus:ring-[#009E49]/15 hover:border-[#009E49]/40 transition-all resize-none ${className}`}
        />
        {error && <p className="text-[12px] text-red-500 mt-1">{error}</p>}
    </div>
);

// ── Select Helper & Branded Custom Dropdown ────────────────────────────────
interface OptionItem {
    value: string | number;
    label: string | React.ReactNode;
    disabled?: boolean;
}

const extractOptions = (children: React.ReactNode): OptionItem[] => {
    const items: OptionItem[] = [];
    React.Children.forEach(children, (child) => {
        if (!React.isValidElement(child)) return;
        if (child.type === 'option' || (child.props && ('value' in child.props || 'children' in child.props))) {
            items.push({
                value: child.props.value !== undefined ? child.props.value : '',
                label: child.props.children !== undefined ? child.props.children : (child.props.value ?? ''),
                disabled: child.props.disabled,
            });
        } else if (child.props && child.props.children) {
            items.push(...extractOptions(child.props.children));
        }
    });
    return items;
};

export const AdminSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({
    className = '',
    children,
    value,
    defaultValue,
    onChange,
    disabled,
    name,
    id,
    ...props
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const options = extractOptions(children);

    const currentValue = value !== undefined ? value : defaultValue;
    const selectedOption = options.find((opt) => String(opt.value) === String(currentValue)) || options[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleSelect = (opt: OptionItem) => {
        if (opt.disabled) return;
        if (onChange) {
            const syntheticEvent = {
                target: { value: String(opt.value), name: name || '' },
                currentTarget: { value: String(opt.value), name: name || '' },
                preventDefault: () => {},
                stopPropagation: () => {},
            } as unknown as React.ChangeEvent<HTMLSelectElement>;
            onChange(syntheticEvent);
        }
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} className={`relative select-none ${className}`}>
            {/* Custom Interactive Trigger Button */}
            <button
                type="button"
                id={id}
                disabled={disabled}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full h-11 px-3.5 pr-9 rounded-xl border text-[14px] font-semibold text-[#1A1A2E] text-left flex items-center justify-between transition-all cursor-pointer ${
                    disabled
                        ? 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed'
                        : isOpen
                        ? 'bg-white border-[#009E49] ring-2 ring-[#009E49]/15 shadow-sm'
                        : 'border-[#EBEDF2] bg-[#F7F8FA] hover:border-[#009E49]/40 hover:bg-[#FAFDFB]'
                }`}
            >
                <span className="truncate block">
                    {selectedOption ? selectedOption.label : 'Select...'}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#009E49]">
                    <ChevronDown
                        className={`w-4 h-4 stroke-[2.5] transition-transform duration-200 ${
                            isOpen ? 'rotate-180 text-[#009E49]' : 'text-[#009E49]'
                        }`}
                    />
                </span>
            </button>

            {/* Floating Branded Dropdown Menu */}
            {isOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 p-1.5 bg-white border border-[#E6F5EC] rounded-2xl shadow-[0_12px_32px_rgba(0,158,73,0.14),0_4px_12px_rgba(0,0,0,0.06)] z-50 max-h-60 overflow-y-auto scrollbar-thin animate-in fade-in zoom-in-95 duration-100">
                    {options.map((opt, idx) => {
                        const isSelected = String(opt.value) === String(currentValue);
                        return (
                            <button
                                key={idx}
                                type="button"
                                disabled={opt.disabled}
                                onClick={() => handleSelect(opt)}
                                className={`w-full px-3 py-2.5 rounded-xl text-[13px] text-left flex items-center justify-between transition-all cursor-pointer border-none mb-0.5 last:mb-0 ${
                                    opt.disabled
                                        ? 'opacity-40 cursor-not-allowed'
                                        : isSelected
                                        ? 'bg-[#009E49] text-white font-bold shadow-2xs'
                                        : 'text-[#1A1A2E] hover:bg-[#F0FDF4] hover:text-[#009E49] font-medium'
                                }`}
                            >
                                <span className="truncate">{opt.label}</span>
                                {isSelected && (
                                    <Check className="w-4 h-4 text-white stroke-[2.5] shrink-0 ml-2" />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Hidden native select for form submit / test harness compatibility */}
            <select
                name={name}
                value={currentValue}
                onChange={onChange}
                disabled={disabled}
                className="hidden"
                tabIndex={-1}
                aria-hidden="true"
                {...props}
            >
                {children}
            </select>
        </div>
    );
};

// ── Field label ────────────────────────────────────────────────────────────
export const FieldLabel: React.FC<{ children: React.ReactNode; htmlFor?: string; required?: boolean }> = ({ children, htmlFor, required }) => (
    <label htmlFor={htmlFor} className="block text-[12px] font-bold text-[#555E7A] mb-2">
        {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
);

// ── Table wrapper ──────────────────────────────────────────────────────────
export const AdminTable: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,158,73,0.03)] overflow-hidden">
        <table className="w-full border-collapse">{children}</table>
    </div>
);

export const THead: React.FC<{ cols: string[] }> = ({ cols }) => (
    <thead>
        <tr className="border-b border-[#EBEDF2] bg-[#F7F8FA]">
            {cols.map((c, i) => (
                <th key={i} className="text-left text-[11px] font-bold text-[#9096B0] uppercase tracking-[0.08em] px-5 py-3.5">
                    {c}
                </th>
            ))}
        </tr>
    </thead>
);

// ── Status pill ────────────────────────────────────────────────────────────
export const StatusPill: React.FC<{ status: string }> = ({ status }) => {
    const map: Record<string, string> = {
        active: 'bg-[#E3FAF0] text-[#16A34A]',
        inactive: 'bg-[#FAFDFB] text-[#9096B0]',
        draft: 'bg-[#FFF8E6] text-[#D97706]',
        archived: 'bg-[#FAFDFB] text-[#9096B0]',
        processing: 'bg-[#E6F5EC] text-[#009E49]',
        on_hold: 'bg-[#FFF8E6] text-[#D97706]',
        complete: 'bg-[#E3FAF0] text-[#16A34A]',
        cancelled: 'bg-[#FFECEC] text-[#DC2626]',
        pending: 'bg-[#FFF4EC] text-[#EA7C2B]',
        paid: 'bg-[#E3FAF0] text-[#16A34A]',
    };
    const cls = map[status] ?? 'bg-[#FAFDFB] text-[#9096B0]';
    const label = status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-bold ${cls}`}>{label}</span>
    );
};

// ── Pagination ─────────────────────────────────────────────────────────────
import { Link } from '@inertiajs/react';
export const AdminPagination: React.FC<{ links: any[] }> = ({ links }) => {
    if (links.length <= 3) return null;
    return (
        <div className="flex justify-center items-center gap-1.5 px-6 py-4 border-t border-[#EBEDF2]">
            {links.map((link, idx) => {
                if (link.url === null) return null;
                return (
                    <Link
                        key={idx}
                        href={link.url}
                        className={`px-3.5 py-2 rounded-lg text-[13px] font-bold transition-all ${link.active ? 'bg-[#009E49] text-white shadow-[0_2px_8px_rgba(0,158,73,0.2)]' : 'bg-[#F7F8FA] text-[#555E7A] hover:bg-[#009E49] hover:text-white border border-[#EBEDF2]'}`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                );
            })}
        </div>
    );
};

// ── Action icon buttons ────────────────────────────────────────────────────
export const IconBtn: React.FC<{ color?: 'purple' | 'green' | 'red' | 'orange' | 'blue'; onClick?: () => void; children: React.ReactNode; title?: string; className?: string }> = ({ color = 'purple', onClick, children, title, className = '' }) => {
    const map = {
        purple: 'bg-[#E6F5EC] text-[#009E49] hover:bg-[#009E49] hover:text-white',
        green: 'bg-[#E3FAF0] text-[#16A34A] hover:bg-[#16A34A] hover:text-white',
        red: 'bg-[#FFECEC] text-[#DC2626] hover:bg-[#DC2626] hover:text-white',
        orange: 'bg-[#FFF4EC] text-[#EA7C2B] hover:bg-[#EA7C2B] hover:text-white',
        blue: 'bg-[#EEF2FF] text-[#6C47FF] hover:bg-[#6C47FF] hover:text-white',
    };
    return (
        <button
            title={title}
            onClick={onClick}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all border-none cursor-pointer ${map[color]} ${className}`}
        >
            {children}
        </button>
    );
};

// ── Search bar ─────────────────────────────────────────────────────────────
export const AdminSearchBar: React.FC<{ placeholder?: string; value: string; onChange: (v: string) => void; onSubmit: () => void }> = ({ placeholder = 'Search...', value, onChange, onSubmit }) => (
    <form onSubmit={e => { e.preventDefault(); onSubmit(); }} className="relative flex-1">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C0C6D8]">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
        </svg>
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#EBEDF2] bg-[#F7F8FA] text-[14px] text-[#2D3048] placeholder-[#C0C6D8] focus:outline-none focus:border-[#009E49] focus:ring-2 focus:ring-[#009E49]/10 transition-all"
        />
    </form>
);
