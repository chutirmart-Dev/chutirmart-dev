import React, { useState, useRef, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { AdminCard, CardHead, PageHeader, StatusPill, AdminPagination, IconBtn, PrimaryBtn } from '@/components/admin/ui';
import { 
    Star, 
    MessageSquare, 
    Home, 
    CheckCircle2, 
    Plus, 
    Pencil, 
    Trash2, 
    Upload, 
    X, 
    Eye, 
    EyeOff, 
    Search, 
    ShieldCheck, 
    Store,
    ChevronDown,
    Check,
    Package
} from 'lucide-react';
import { toast } from 'sonner';

interface ReviewItem {
    id: number;
    product_id: number | null;
    customer_name: string;
    customer_designation?: string | null;
    customer_avatar?: string | null;
    avatar_url?: string | null;
    rating: number;
    review_text: string;
    status: 'pending' | 'approved' | 'rejected';
    verified: boolean;
    show_on_home: boolean;
    sort_order: number;
    created_at: string;
    product?: { id: number; name: string } | null;
}

interface ReviewsProps {
    reviews: {
        data: ReviewItem[];
        links: any[];
        total: number;
        current_page: number;
    };
    stats: {
        total: number;
        approved: number;
        on_home: number;
        avg_rating: number;
    };
    products: Array<{ id: number; name: string }>;
    filters: { q?: string; status?: string };
}

interface ModernProductDropdownProps {
    value: string;
    onChange: (val: string) => void;
    products: Array<{ id: number; name: string }>;
}

const ModernProductDropdown: React.FC<ModernProductDropdownProps> = ({ value, onChange, products }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedProduct = products.find(p => String(p.id) === String(value));

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full h-11 sm:h-12 px-3.5 rounded-xl border-2 bg-white text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                    isOpen 
                        ? 'border-[#009E49] ring-4 ring-[#009E49]/12 shadow-xs' 
                        : 'border-slate-200 hover:border-[#009E49]/60'
                }`}
            >
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        selectedProduct ? 'bg-slate-100 text-slate-700' : 'bg-emerald-50 text-[#009E49]'
                    }`}>
                        {selectedProduct ? <Package className="w-4 h-4 text-[#009E49]" /> : <Store className="w-4 h-4 text-[#009E49]" />}
                    </div>
                    <span className="text-sm font-semibold text-slate-900 truncate">
                        {selectedProduct ? selectedProduct.name : '-- সাধারণ স্টোর রিভিউ (কোনো পণ্য ছাড়া) --'}
                    </span>
                </div>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#009E49]' : 'text-slate-400'}`} />
            </button>

            {isOpen && (
                <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl shadow-slate-900/10 border border-slate-200 p-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    {products.length > 5 && (
                        <div className="relative mb-2">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="পণ্য খুঁজুন..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onClick={e => e.stopPropagation()}
                                className="w-full h-8 pl-8 pr-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#009E49] focus:ring-1 focus:ring-[#009E49]"
                            />
                        </div>
                    )}

                    <div className="max-h-52 overflow-y-auto space-y-1 divide-y-0">
                        {/* Option 1: General Store Review */}
                        <button
                            type="button"
                            onClick={() => {
                                onChange('');
                                setIsOpen(false);
                                setSearch('');
                            }}
                            className={`w-full p-2.5 rounded-lg text-left flex items-center justify-between gap-2.5 transition-colors cursor-pointer border ${
                                !value 
                                    ? 'bg-emerald-50/80 border-emerald-200 text-[#009E49] font-bold' 
                                    : 'hover:bg-slate-50 border-transparent text-slate-800'
                            }`}
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${!value ? 'bg-[#009E49] text-white' : 'bg-emerald-50 text-[#009E49]'}`}>
                                    <Store className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">সাধারণ স্টোর রিভিউ</p>
                                    <p className="text-[11px] text-slate-500">কোনো নির্দিষ্ট পণ্য ছাড়া সার্বিক স্টোর সার্ভিস রিভিউ</p>
                                </div>
                            </div>
                            {!value && <Check className="w-4 h-4 text-[#009E49] shrink-0" />}
                        </button>

                        {/* Product list */}
                        {filteredProducts.map(p => {
                            const isSelected = String(value) === String(p.id);
                            return (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => {
                                        onChange(String(p.id));
                                        setIsOpen(false);
                                        setSearch('');
                                    }}
                                    className={`w-full p-2.5 rounded-lg text-left flex items-center justify-between gap-2.5 transition-colors cursor-pointer border ${
                                        isSelected 
                                            ? 'bg-emerald-50/80 border-emerald-200 text-[#009E49] font-bold' 
                                            : 'hover:bg-slate-50 border-transparent text-slate-800'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#009E49] text-white' : 'bg-slate-100 text-slate-600'}`}>
                                            <Package className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0 truncate">
                                            <p className="text-xs sm:text-sm font-bold text-slate-900 truncate leading-snug">{p.name}</p>
                                            <p className="text-[11px] text-slate-500">পণ্য আইডি: #{p.id}</p>
                                        </div>
                                    </div>
                                    {isSelected && <Check className="w-4 h-4 text-[#009E49] shrink-0" />}
                                </button>
                            );
                        })}

                        {filteredProducts.length === 0 && (
                            <p className="text-center py-4 text-xs text-slate-400">কোনো পণ্য পাওয়া যায়নি</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

interface ModernStatusDropdownProps {
    value: 'approved' | 'pending' | 'rejected';
    onChange: (val: 'approved' | 'pending' | 'rejected') => void;
}

const statusDropdownOptions = [
    {
        value: 'approved' as const,
        label: 'Approved (অনুমোদিত - দৃশ্যমান হবে)',
        desc: 'হোমপেজ ও পণ্য পেজে সরাসরি প্রদর্শিত হবে',
        dotColor: 'bg-[#009E49]',
    },
    {
        value: 'pending' as const,
        label: 'Pending (অপেক্ষমাণ)',
        desc: 'অ্যাডমিনের সিদ্ধান্তের অপেক্ষায় থাকবে',
        dotColor: 'bg-amber-500',
    },
    {
        value: 'rejected' as const,
        label: 'Rejected (বাতিল)',
        desc: 'গ্রাহকদের কাছে অপ্রদর্শিত থাকবে',
        dotColor: 'bg-rose-500',
    },
];

const ModernStatusDropdown: React.FC<ModernStatusDropdownProps> = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const activeOption = statusDropdownOptions.find(opt => opt.value === value) || statusDropdownOptions[0];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full h-11 sm:h-12 px-3.5 rounded-xl border-2 bg-white text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${
                    isOpen 
                        ? 'border-[#009E49] ring-4 ring-[#009E49]/12 shadow-xs' 
                        : 'border-slate-200 hover:border-[#009E49]/60'
                }`}
            >
                <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${activeOption.dotColor}`} />
                    <span className="text-sm font-bold text-slate-900 truncate">
                        {activeOption.label}
                    </span>
                </div>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#009E49]' : 'text-slate-400'}`} />
            </button>

            {isOpen && (
                <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl shadow-slate-900/10 border border-slate-200 p-1.5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="space-y-1">
                        {statusDropdownOptions.map(opt => {
                            const isSelected = opt.value === value;
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(opt.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full p-2.5 rounded-lg text-left flex items-center justify-between gap-2.5 transition-colors cursor-pointer border ${
                                        isSelected 
                                            ? 'bg-emerald-50/80 border-emerald-200 text-[#009E49] font-bold' 
                                            : 'hover:bg-slate-50 border-transparent text-slate-800'
                                    }`}
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                            isSelected ? 'bg-[#009E49] text-white' : 'bg-slate-100'
                                        }`}>
                                            <span className={`w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-white' : opt.dotColor}`} />
                                        </div>
                                        <div>
                                            <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">{opt.label}</p>
                                            <p className="text-[11px] text-slate-500">{opt.desc}</p>
                                        </div>
                                    </div>
                                    {isSelected && <Check className="w-4 h-4 text-[#009E49] shrink-0" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export const Reviews: React.FC<ReviewsProps> = ({ reviews, stats, products, filters }) => {
    const [searchQuery, setSearchQuery] = useState(filters.q || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReview, setEditingReview] = useState<ReviewItem | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form fields
    const [customerName, setCustomerName] = useState('');
    const [customerDesignation, setCustomerDesignation] = useState('ভেরিফাইড ক্রেতা');
    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState('');
    const [productId, setProductId] = useState<string>('');
    const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('approved');
    const [verified, setVerified] = useState(true);
    const [showOnHome, setShowOnHome] = useState(true);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [removeAvatar, setRemoveAvatar] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Search filter trigger
    const handleFilterChange = (newStatus: string, query: string = searchQuery) => {
        setSelectedStatus(newStatus);
        router.get(route('admin.reviews.index'), {
            q: query || undefined,
            status: newStatus !== 'all' ? newStatus : undefined,
        }, { preserveState: true, replace: true });
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleFilterChange(selectedStatus, searchQuery);
    };

    // Open Add modal
    const handleOpenAdd = () => {
        setEditingReview(null);
        setCustomerName('');
        setCustomerDesignation('ভেরিফাইড ক্রেতা');
        setRating(5);
        setReviewText('');
        setProductId('');
        setStatus('approved');
        setVerified(true);
        setShowOnHome(true);
        setAvatarFile(null);
        setAvatarPreview(null);
        setRemoveAvatar(false);
        setIsModalOpen(true);
    };

    // Open Edit modal
    const handleOpenEdit = (review: ReviewItem) => {
        setEditingReview(review);
        setCustomerName(review.customer_name);
        setCustomerDesignation(review.customer_designation || 'ভেরিফাইড ক্রেতা');
        setRating(review.rating);
        setReviewText(review.review_text);
        setProductId(review.product_id ? String(review.product_id) : '');
        setStatus(review.status);
        setVerified(Boolean(review.verified));
        setShowOnHome(Boolean(review.show_on_home));
        setAvatarFile(null);
        setAvatarPreview(review.avatar_url || null);
        setRemoveAvatar(false);
        setIsModalOpen(true);
    };

    // Handle avatar file upload change
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setRemoveAvatar(false);
            const reader = new FileReader();
            reader.onload = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleClearAvatar = () => {
        setAvatarFile(null);
        setAvatarPreview(null);
        setRemoveAvatar(true);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Form submit
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customerName.trim()) {
            toast.error('অনুগ্রহ করে গ্রাহকের নাম লিখুন।');
            return;
        }
        if (!reviewText.trim()) {
            toast.error('অনুগ্রহ করে রিভিউ মন্তব্য লিখুন।');
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('customer_name', customerName);
        formData.append('customer_designation', customerDesignation);
        formData.append('rating', String(rating));
        formData.append('review_text', reviewText);
        if (productId) formData.append('product_id', productId);
        formData.append('status', status);
        formData.append('verified', verified ? '1' : '0');
        formData.append('show_on_home', showOnHome ? '1' : '0');

        if (avatarFile) {
            formData.append('avatar', avatarFile);
        }

        if (editingReview) {
            if (removeAvatar) {
                formData.append('remove_avatar', '1');
            }
            formData.append('_method', 'PUT');

            router.post(route('admin.reviews.update', { id: editingReview.id }), formData, {
                onSuccess: () => {
                    toast.success('রিভিউ সফলভাবে আপডেট করা হয়েছে।');
                    setIsModalOpen(false);
                },
                onError: () => {
                    toast.error('রিভিউ আপডেট করতে সমস্যা হয়েছে।');
                },
                onFinish: () => setIsSubmitting(false)
            });
        } else {
            router.post(route('admin.reviews.store'), formData, {
                onSuccess: () => {
                    toast.success('নতুন রিভিউ সফলভাবে যুক্ত করা হয়েছে।');
                    setIsModalOpen(false);
                },
                onError: () => {
                    toast.error('রিভিউ যোগ করতে সমস্যা হয়েছে।');
                },
                onFinish: () => setIsSubmitting(false)
            });
        }
    };

    // Instant Home Page Toggle
    const handleToggleHome = (id: number) => {
        router.post(route('admin.reviews.toggle-home', { id }), {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('হোমপেজ প্রদর্শন স্ট্যাটাস পরিবর্তন করা হয়েছে।'),
            onError: () => toast.error('স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।')
        });
    };

    // Instant Status Toggle
    const handleToggleStatus = (id: number) => {
        router.post(route('admin.reviews.toggle-status', { id }), {}, {
            preserveScroll: true,
            onSuccess: () => toast.success('রিভিউ স্ট্যাটাস পরিবর্তন করা হয়েছে।'),
            onError: () => toast.error('স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।')
        });
    };

    // Delete review
    const handleDelete = (id: number, name: string) => {
        if (confirm(`আপনি কি নিশ্চিত যে "${name}"-এর রিভিউটি মুছে ফেলতে চান?`)) {
            router.delete(route('admin.reviews.destroy', { id }), {
                preserveScroll: true,
                onSuccess: () => toast.success('রিভিউটি মুছে ফেলা হয়েছে।'),
                onError: () => toast.error('রিভিউ মুছতে সমস্যা হয়েছে।')
            });
        }
    };

    return (
        <AdminLayout>
            <Head title="Customer Reviews" />

            {/* Page Header */}
            <PageHeader 
                title="Customer Reviews (গ্রাহকদের মতামত ও রিভিউ)" 
                subtitle="হোম পেজে প্রদর্শিত কাস্টমার রিভিউ নিয়ন্ত্রণ ও সম্পূর্ণ ম্যানেজ করুন" 
                action={
                    <PrimaryBtn onClick={handleOpenAdd} className="h-11 sm:h-12 px-5">
                        <Plus className="w-5 h-5" />
                        <span>নতুন রিভিউ যোগ করুন</span>
                    </PrimaryBtn>
                }
            />

            {/* 1. Summary Statistics Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6">
                <div className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                        <p className="text-xs sm:text-sm font-semibold text-slate-500 font-bangla">সর্বমোট রিভিউ</p>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900">{stats.total}</h3>
                    </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-[#009E49] flex items-center justify-center shrink-0">
                        <Home className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                        <p className="text-xs sm:text-sm font-semibold text-slate-500 font-bangla">হোম পেজে সক্রিয়</p>
                        <h3 className="text-xl sm:text-2xl font-black text-[#009E49]">{stats.on_home}</h3>
                    </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                        <p className="text-xs sm:text-sm font-semibold text-slate-500 font-bangla">অনুমোদিত রিভিউ</p>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900">{stats.approved}</h3>
                    </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-5 shadow-xs flex items-center gap-3.5">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                        <Star className="w-5 h-5 sm:w-6 sm:h-6 fill-amber-400" />
                    </div>
                    <div>
                        <p className="text-xs sm:text-sm font-semibold text-slate-500 font-bangla">গড় রেটিং</p>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900">{stats.avg_rating} <span className="text-xs font-normal text-slate-400">/ ৫.০</span></h3>
                    </div>
                </div>
            </div>

            {/* 2. Action Bar: Filter Tabs & Search */}
            <div className="bg-white border border-slate-200/80 rounded-xl p-3 sm:p-4 mb-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 font-bangla">
                {/* Status Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                    {[
                        { key: 'all', label: 'সকল রিভিউ' },
                        { key: 'home', label: '🌟 হোমপেজ রিভিউ' },
                        { key: 'approved', label: 'অনুমোদিত' },
                        { key: 'pending', label: 'অপেক্ষমাণ' },
                        { key: 'rejected', label: 'বাতিল' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => handleFilterChange(tab.key)}
                            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
                                selectedStatus === tab.key
                                    ? 'bg-[#009E49] text-white border-[#009E49] shadow-xs'
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="গ্রাহকের নাম বা মন্তব্য খুঁজুন..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:outline-none focus:border-[#009E49] focus:ring-2 focus:ring-[#009E49]/15 font-bangla transition-all"
                    />
                </form>
            </div>

            {/* 3. Reviews Table Card */}
            <AdminCard className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/60 font-bangla">
                                <th className="text-left text-xs font-bold text-slate-500 uppercase px-5 py-3.5">গ্রাহক ও পরিচিতি</th>
                                <th className="text-left text-xs font-bold text-slate-500 uppercase px-5 py-3.5">পণ্য / উৎস</th>
                                <th className="text-left text-xs font-bold text-slate-500 uppercase px-5 py-3.5">রেটিং</th>
                                <th className="text-left text-xs font-bold text-slate-500 uppercase px-5 py-3.5">মন্তব্য</th>
                                <th className="text-center text-xs font-bold text-slate-500 uppercase px-5 py-3.5">হোমপেজে প্রদর্শন</th>
                                <th className="text-center text-xs font-bold text-slate-500 uppercase px-5 py-3.5">স্ট্যাটাস</th>
                                <th className="text-right text-xs font-bold text-slate-500 uppercase px-5 py-3.5">অ্যাকশন</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-bangla">
                            {reviews.data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-16 text-slate-400 text-sm">
                                        <Star className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                                        <p className="font-bold text-base text-slate-700">কোনো রিভিউ খুঁজে পাওয়া যায়নি</p>
                                        <p className="text-xs text-slate-400 mt-1">নতুন রিভিউ যোগ করতে উপরের বোতামে ক্লিক করুন।</p>
                                    </td>
                                </tr>
                            ) : (
                                reviews.data.map(review => {
                                    const initials = review.customer_name 
                                        ? review.customer_name.slice(0, 2).toUpperCase() 
                                        : 'CM';

                                    return (
                                        <tr key={review.id} className="hover:bg-slate-50/80 transition-colors">
                                            {/* Reviewer info: Avatar + Name + Subtitle */}
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    {review.avatar_url ? (
                                                        <img 
                                                            src={review.avatar_url} 
                                                            alt={review.customer_name} 
                                                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0" 
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#009E49] to-[#007F3B] text-white font-bold text-xs flex items-center justify-center shadow-2xs shrink-0">
                                                            {initials}
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                                                            <span>{review.customer_name}</span>
                                                            {review.verified && (
                                                                <span title="ভেরিফাইড ক্রেতা">
                                                                    <ShieldCheck className="w-4 h-4 text-[#009E49] inline shrink-0" />
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-slate-500 font-medium">
                                                            {review.customer_designation || 'ভেরিফাইড ক্রেতা'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Product */}
                                            <td className="px-5 py-3.5 text-xs">
                                                {review.product ? (
                                                    <span className="font-semibold text-slate-800 max-w-[150px] truncate block" title={review.product.name}>
                                                        {review.product.name}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-[#009E49] font-bold text-[11px]">
                                                        <Store className="w-3.5 h-3.5" />
                                                        <span>স্টোর রিভিউ</span>
                                                    </span>
                                                )}
                                            </td>

                                            {/* Rating */}
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-0.5 text-amber-400">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star 
                                                            key={i} 
                                                            className={`w-4 h-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} 
                                                        />
                                                    ))}
                                                </div>
                                            </td>

                                            {/* Comment */}
                                            <td className="px-5 py-3.5 text-xs text-slate-700 max-w-xs">
                                                <p className="line-clamp-2 leading-relaxed" title={review.review_text}>
                                                    "{review.review_text}"
                                                </p>
                                            </td>

                                            {/* Show on Homepage Toggle */}
                                            <td className="px-5 py-3.5 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleHome(review.id)}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                                                        review.show_on_home
                                                            ? 'bg-emerald-50 text-[#009E49] border-emerald-200 hover:bg-emerald-100'
                                                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                                                    }`}
                                                    title="হোমপেজে দেখাতে বা লুকাতে ক্লিক করুন"
                                                >
                                                    {review.show_on_home ? (
                                                        <>
                                                            <Eye className="w-3.5 h-3.5" />
                                                            <span>হোমপেজে সক্রিয়</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <EyeOff className="w-3.5 h-3.5" />
                                                            <span>লুকানো</span>
                                                        </>
                                                    )}
                                                </button>
                                            </td>

                                            {/* Status */}
                                            <td className="px-5 py-3.5 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleStatus(review.id)}
                                                    className="cursor-pointer border-none bg-transparent p-0"
                                                    title="স্ট্যাটাস পরিবর্তন করতে ক্লিক করুন"
                                                >
                                                    <StatusPill status={review.status} />
                                                </button>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-3.5 text-right">
                                                <div className="flex items-center gap-1.5 justify-end">
                                                    <IconBtn 
                                                        color="blue" 
                                                        onClick={() => handleOpenEdit(review)} 
                                                        title="এডিট করুন"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </IconBtn>
                                                    <IconBtn 
                                                        color="red" 
                                                        onClick={() => handleDelete(review.id, review.customer_name)} 
                                                        title="মুছে ফেলুন"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </IconBtn>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <AdminPagination links={reviews.links} />
            </AdminCard>

            {/* 4. Add / Edit Review Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs font-bangla animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    {editingReview ? 'রিভিউ এডিট করুন' : 'নতুন কাস্টমার রিভিউ যোগ করুন'}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    হোমপেজে প্রদর্শনের জন্য সঠিক তথ্য প্রদান করুন
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 flex items-center justify-center cursor-pointer transition-colors border-none"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 pb-16 font-bangla">
                            {/* Avatar / Photo Upload */}
                            <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                                <div className="relative shrink-0">
                                    {avatarPreview ? (
                                        <img 
                                            src={avatarPreview} 
                                            alt="Preview" 
                                            className="w-16 h-16 rounded-full object-cover border-2 border-[#009E49] shadow-sm" 
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-slate-200 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                                            <Upload className="w-6 h-6" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        গ্রাহকের ছবি (ঐচ্ছিক)
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs"
                                        >
                                            ছবি সিলেক্ট করুন
                                        </button>
                                        {avatarPreview && (
                                            <button
                                                type="button"
                                                onClick={handleClearAvatar}
                                                className="px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg font-bold transition-colors cursor-pointer border-none"
                                            >
                                                ছবি মুছুন
                                            </button>
                                        )}
                                    </div>
                                    <input 
                                        ref={fileInputRef} 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleAvatarChange} 
                                        className="hidden" 
                                    />
                                    <p className="text-[11px] text-slate-400 mt-1">ছবি না দিলে নামের আদ্যক্ষর স্বয়ংক্রিয়ভাবে ব্যবহৃত হবে।</p>
                                </div>
                            </div>

                            {/* Customer Name */}
                            <div>
                                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                                    গ্রাহকের নাম <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="যেমন: নাসির উদ্দিন"
                                    value={customerName}
                                    onChange={e => setCustomerName(e.target.value)}
                                    className="w-full h-11 sm:h-12 px-3.5 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-[#009E49] focus:ring-4 focus:ring-[#009E49]/12 transition-all bg-white"
                                    required
                                />
                            </div>

                            {/* Customer Designation / Location */}
                            <div>
                                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                                    পদবি / অবস্থান (সাবটাইটেল)
                                </label>
                                <input
                                    type="text"
                                    placeholder="যেমন: ভেরিফাইড ক্রেতা, উত্তরা, ঢাকা"
                                    value={customerDesignation}
                                    onChange={e => setCustomerDesignation(e.target.value)}
                                    className="w-full h-11 sm:h-12 px-3.5 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-[#009E49] focus:ring-4 focus:ring-[#009E49]/12 transition-all bg-white"
                                />
                            </div>

                            {/* Rating (1-5 Star Picker) */}
                            <div>
                                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                                    রেটিং স্টার <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center gap-1.5">
                                    {[1, 2, 3, 4, 5].map(starNum => (
                                        <button
                                            key={starNum}
                                            type="button"
                                            onClick={() => setRating(starNum)}
                                            className="p-1 hover:scale-110 transition-transform cursor-pointer border-none bg-transparent"
                                        >
                                            <Star 
                                                className={`w-7 h-7 ${starNum <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} 
                                            />
                                        </button>
                                    ))}
                                    <span className="ml-2 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">
                                        {rating} স্টার ({rating === 5 ? 'চমৎকার!' : rating === 4 ? 'খুব ভালো' : 'সন্তোষজনক'})
                                    </span>
                                </div>
                            </div>

                            {/* Review Text */}
                            <div>
                                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                                    রিভিউ মন্তব্য <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="দাম অনুযায়ী অত্যন্ত ভালো কোয়ালিটি। দ্রুত হাতে পেয়েছি..."
                                    value={reviewText}
                                    onChange={e => setReviewText(e.target.value)}
                                    className="w-full p-3.5 rounded-xl border-2 border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:border-[#009E49] focus:ring-4 focus:ring-[#009E49]/12 transition-all resize-none bg-white"
                                    required
                                />
                            </div>

                            {/* Optional Associated Product (Modern Branded Dropdown) */}
                            <div>
                                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                                    নির্দিষ্ট পণ্য (ঐচ্ছিক)
                                </label>
                                <ModernProductDropdown
                                    value={productId}
                                    onChange={setProductId}
                                    products={products}
                                />
                            </div>

                            {/* Toggles: Show on Home, Verified */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                <label className="flex items-center gap-3 p-3.5 rounded-xl border-2 border-slate-200 hover:border-[#009E49]/40 bg-slate-50/60 cursor-pointer select-none transition-all">
                                    <input
                                        type="checkbox"
                                        checked={showOnHome}
                                        onChange={e => setShowOnHome(e.target.checked)}
                                        className="w-4.5 h-4.5 text-[#009E49] rounded border-slate-300 focus:ring-[#009E49] accent-[#009E49]"
                                    />
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">হোম পেজে দেখান</p>
                                        <p className="text-[11px] text-slate-500">হোম পেজ সেকশনে সরাসরি প্রদর্শিত হবে</p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 p-3.5 rounded-xl border-2 border-slate-200 hover:border-[#009E49]/40 bg-slate-50/60 cursor-pointer select-none transition-all">
                                    <input
                                        type="checkbox"
                                        checked={verified}
                                        onChange={e => setVerified(e.target.checked)}
                                        className="w-4.5 h-4.5 text-[#009E49] rounded border-slate-300 focus:ring-[#009E49] accent-[#009E49]"
                                    />
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">ভেরিফাইড ক্রেতা</p>
                                        <p className="text-[11px] text-slate-500">সবুজ টিক ব্যাজ প্রদর্শন করবে</p>
                                    </div>
                                </label>
                            </div>

                            {/* Status (Modern Branded Dropdown) */}
                            <div>
                                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                                    অনুমোদন স্ট্যাটাস
                                </label>
                                <ModernStatusDropdown
                                    value={status}
                                    onChange={setStatus}
                                />
                            </div>

                            {/* Modal Footer Buttons */}
                            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-5 h-11 rounded-xl border border-slate-300 text-slate-700 text-sm font-bold hover:bg-slate-100 transition-colors cursor-pointer bg-white"
                                >
                                    বাতিল
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 h-11 rounded-xl bg-[#009E49] text-white text-sm font-bold hover:bg-[#007F3B] transition-all shadow-xs hover:shadow-md cursor-pointer border-none disabled:opacity-50"
                                >
                                    {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : editingReview ? 'আপডেট করুন' : 'রিভিউ সংরক্ষণ করুন'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default Reviews;
