import React, { useState, useRef, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { AdminCard, AdminPagination, PageHeader } from '@/components/admin/ui';
import {
    Users, ShoppingBag, Search, History, X,
    CheckCircle2, XCircle, Clock, Package,
    TrendingUp, Phone, Mail, MapPin, ChevronRight,
    Loader2, ShoppingCart
} from 'lucide-react';

interface Customer {
    id: number;
    name: string;
    mobile?: string;
    email?: string;
    district?: string;
    created_at: string;
    orders_count: number;
    complete_orders: number;
    cancelled_orders: number;
    total_spent: number;
}

interface OrderItem {
    id: number;
    product_name: string;
    quantity: number;
    price: number;
}

interface OrderHistory {
    id: number;
    order_number: string;
    status: string;
    payment_status: string;
    total: number;
    created_at: string;
    items?: OrderItem[];
}

interface IndexProps {
    customers: { data: Customer[]; links: any[]; total: number; };
    filters: { q?: string; };
}

/* ── Status helpers ── */
const statusColor: Record<string, string> = {
    complete:   'bg-emerald-100 text-emerald-700',
    processing: 'bg-blue-100 text-blue-700',
    on_hold:    'bg-amber-100 text-amber-700',
    cancelled:  'bg-red-100 text-red-700',
    cancel:     'bg-red-100 text-red-700',
    trash:      'bg-gray-100 text-gray-500',
    incomplete: 'bg-orange-100 text-orange-700',
};
const statusIcon: Record<string, React.ReactNode> = {
    complete:   <CheckCircle2 className="w-3.5 h-3.5" />,
    processing: <Clock className="w-3.5 h-3.5" />,
    on_hold:    <Clock className="w-3.5 h-3.5" />,
    cancelled:  <XCircle className="w-3.5 h-3.5" />,
    cancel:     <XCircle className="w-3.5 h-3.5" />,
    trash:      <XCircle className="w-3.5 h-3.5" />,
};

/* ────────────────────────────────────────
 *  Customer History Slideover Panel
 * ──────────────────────────────────────── */
const CustomerHistoryPanel: React.FC<{
    customer: Customer | null;
    onClose: () => void;
}> = ({ customer, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState<OrderHistory[]>([]);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!customer) { setOrders([]); return; }
        setLoading(true);
        fetch(route('admin.customers.purchases', { id: customer.id }))
            .then(r => r.json())
            .then(data => { setOrders(data.orders || []); setLoading(false); })
            .catch(() => setLoading(false));
    }, [customer?.id]);

    // Close on backdrop click
    const handleBackdrop = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) { onClose(); }
    };

    if (!customer) return null;

    const completedOrders = orders.filter(o => o.status === 'complete').length;
    const cancelledOrders = orders.filter(o => ['cancelled', 'cancel', 'trash'].includes(o.status)).length;
    const totalSpent = orders
        .filter(o => ['complete', 'processing', 'on_hold'].includes(o.status))
        .reduce((sum, o) => sum + Number(o.total), 0);

    return (
        <div
            className="fixed inset-0 z-50 flex justify-end"
            onClick={handleBackdrop}
            style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(3px)' }}
        >
            <div
                ref={panelRef}
                className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300"
            >
                {/* ── Header ── */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-[#009E49]/5 to-white">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#009E49] to-[#00C95F] text-white flex items-center justify-center font-black text-[16px] shadow-md shadow-[#009E49]/30">
                            {customer.name?.charAt(0).toUpperCase() || 'C'}
                        </div>
                        <div>
                            <p className="text-[15px] font-black text-[#1A1A2E]">{customer.name}</p>
                            <p className="text-[12px] text-gray-400 font-mono">{customer.mobile || '—'}</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 border-none cursor-pointer transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* ── Stats Row ── */}
                <div className="grid grid-cols-3 gap-3 px-6 py-4 border-b border-gray-50">
                    <div className="text-center p-3 rounded-2xl bg-[#009E49]/6">
                        <div className="text-[20px] font-black text-[#009E49]">{orders.length}</div>
                        <div className="text-[10px] font-bold text-gray-400 mt-0.5">মোট অর্ডার</div>
                    </div>
                    <div className="text-center p-3 rounded-2xl bg-emerald-50">
                        <div className="text-[20px] font-black text-emerald-600">{completedOrders}</div>
                        <div className="text-[10px] font-bold text-gray-400 mt-0.5">সম্পন্ন</div>
                    </div>
                    <div className="text-center p-3 rounded-2xl bg-red-50">
                        <div className="text-[20px] font-black text-red-500">{cancelledOrders}</div>
                        <div className="text-[10px] font-bold text-gray-400 mt-0.5">বাতিল</div>
                    </div>
                </div>

                {/* Total Spent Banner */}
                <div className="mx-6 mt-4 px-4 py-3 rounded-2xl bg-gradient-to-r from-[#009E49] to-[#00C95F] flex items-center justify-between shadow-md shadow-[#009E49]/20">
                    <div className="flex items-center gap-2 text-white">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-[12px] font-bold">মোট কেনাকাটা</span>
                    </div>
                    <span className="text-[18px] font-black text-white">৳{totalSpent.toLocaleString()}</span>
                </div>

                {/* ── Order List ── */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">অর্ডার হিস্ট্রি</p>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <Loader2 className="w-8 h-8 text-[#009E49] animate-spin" />
                            <p className="text-[13px] text-gray-400 font-medium">লোড হচ্ছে...</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <ShoppingCart className="w-12 h-12 text-gray-200" />
                            <p className="text-[14px] text-gray-400 font-semibold">কোনো অর্ডার নেই</p>
                        </div>
                    ) : orders.map(order => {
                        const isCancelled = ['cancelled', 'cancel', 'trash'].includes(order.status);
                        const isComplete  = order.status === 'complete';
                        const colorClass  = statusColor[order.status] || 'bg-gray-100 text-gray-600';
                        const icon        = statusIcon[order.status] || <Package className="w-3.5 h-3.5" />;

                        return (
                            <div
                                key={order.id}
                                className={`rounded-2xl border p-4 transition-all ${
                                    isComplete  ? 'border-emerald-100 bg-emerald-50/40'  :
                                    isCancelled ? 'border-red-100 bg-red-50/30'          :
                                    'border-gray-100 bg-gray-50/50'
                                }`}
                            >
                                {/* Order Header */}
                                <div className="flex items-center justify-between mb-2.5">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-[13px] font-black text-[#1A1A2E]">
                                            #{order.order_number}
                                        </span>
                                        <span className={`flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-lg ${colorClass}`}>
                                            {icon}
                                            {order.status?.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="text-[15px] font-black text-[#1A1A2E]">৳{Number(order.total).toLocaleString()}</span>
                                </div>

                                {/* Items */}
                                {order.items && order.items.length > 0 && (
                                    <div className="space-y-1.5 mb-2.5">
                                        {order.items.slice(0, 3).map(item => (
                                            <div key={item.id} className="flex items-center justify-between text-[12px]">
                                                <span className="text-gray-600 font-medium truncate max-w-[200px]">
                                                    📦 {item.product_name}
                                                </span>
                                                <span className="text-gray-400 font-mono shrink-0 ml-2">
                                                    ×{item.quantity} · ৳{Number(item.price).toLocaleString()}
                                                </span>
                                            </div>
                                        ))}
                                        {order.items.length > 3 && (
                                            <p className="text-[11px] text-gray-400 font-medium">
                                                +{order.items.length - 3}টি আইটেম আরও
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Date */}
                                <p className="text-[11px] text-gray-400">
                                    {new Date(order.created_at).toLocaleDateString('bn-BD', {
                                        day: 'numeric', month: 'long', year: 'numeric'
                                    })}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

/* ────────────────────────────────────────
 *  Main Page
 * ──────────────────────────────────────── */
export const Index: React.FC<IndexProps> = ({ customers, filters }) => {
    const [q, setQ] = useState(filters.q || '');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    return (
        <AdminLayout>
            <Head title="Customers" />
            <div className="space-y-6">

                <PageHeader
                    title="Customers"
                    subtitle={`${customers.total} জন রেজিস্টার্ড কাস্টমার`}
                />

                {/* ── Search ── */}
                <AdminCard className="p-4">
                    <form
                        onSubmit={e => {
                            e.preventDefault();
                            router.get(route('admin.customers.index'), { q }, { preserveState: true });
                        }}
                        className="relative"
                    >
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C0C6D8]" />
                        <input
                            type="text"
                            placeholder="নাম, মোবাইল বা ইমেইল দিয়ে খুঁজুন..."
                            value={q}
                            onChange={e => setQ(e.target.value)}
                            className="w-full h-11 pl-11 pr-4 rounded-xl border border-[#EBEDF2] bg-[#F7F8FA] text-[14px] text-[#2D3048] placeholder-[#C0C6D8] focus:outline-none focus:border-[#009E49] focus:ring-2 focus:ring-[#009E49]/10 transition-all"
                        />
                    </form>
                </AdminCard>

                {/* ── Table ── */}
                <AdminCard className="overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-[#EBEDF2]">
                        <h3 className="text-[15px] font-black text-[#1A1A2E]">Customer List</h3>
                        <span className="text-[12px] text-[#9096B0] bg-[#F7F8FA] px-3 py-1 rounded-full font-semibold">
                            {customers.total} customers
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-[#EBEDF2] bg-[#F7F8FA]">
                                    {['Customer', 'Contact', 'Orders', 'Complete', 'Cancelled', 'Total Spent', 'History'].map(h => (
                                        <th key={h} className="text-left text-[11px] font-bold text-[#9096B0] uppercase tracking-wider px-5 py-3.5 whitespace-nowrap">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {customers.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-20 text-[#9096B0]">
                                            <Users className="w-12 h-12 mx-auto mb-3 text-[#EBEDF2]" />
                                            <p className="text-[15px] font-semibold">কোনো কাস্টমার পাওয়া যায়নি</p>
                                        </td>
                                    </tr>
                                ) : customers.data.map(c => (
                                    <tr key={c.id} className="border-b border-[#F7F8FA] hover:bg-[#FAFBFC] transition-colors">

                                        {/* Customer Name */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#009E49] to-[#00C95F] text-white flex items-center justify-center font-black text-[14px] shrink-0 shadow-sm shadow-[#009E49]/20">
                                                    {c.name?.charAt(0).toUpperCase() || 'C'}
                                                </div>
                                                <div>
                                                    <p className="text-[14px] font-bold text-[#1A1A2E]">{c.name}</p>
                                                    <p className="text-[11px] text-gray-400">
                                                        {new Date(c.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Contact */}
                                        <td className="px-5 py-4">
                                            <div className="space-y-1">
                                                {c.mobile && (
                                                    <div className="flex items-center gap-1.5 text-[12px] font-mono font-semibold text-[#555E7A]">
                                                        <Phone className="w-3 h-3 text-[#009E49]" /> {c.mobile}
                                                    </div>
                                                )}
                                                {c.email && (
                                                    <div className="flex items-center gap-1.5 text-[12px] text-[#9096B0]">
                                                        <Mail className="w-3 h-3 text-gray-300" /> {c.email}
                                                    </div>
                                                )}
                                                {c.district && (
                                                    <div className="flex items-center gap-1.5 text-[11px] text-[#9096B0]">
                                                        <MapPin className="w-3 h-3 text-gray-300" /> {c.district}
                                                    </div>
                                                )}
                                            </div>
                                        </td>

                                        {/* Total Orders */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-8 h-8 rounded-xl bg-[#009E49]/10 flex items-center justify-center">
                                                    <ShoppingBag className="w-3.5 h-3.5 text-[#009E49]" />
                                                </div>
                                                <span className="text-[15px] font-black text-[#1A1A2E]">{c.orders_count ?? 0}</span>
                                            </div>
                                        </td>

                                        {/* Completed */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                                </div>
                                                <span className="text-[15px] font-black text-emerald-600">{c.complete_orders ?? 0}</span>
                                            </div>
                                        </td>

                                        {/* Cancelled */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
                                                    <XCircle className="w-3.5 h-3.5 text-red-400" />
                                                </div>
                                                <span className="text-[15px] font-black text-red-500">{c.cancelled_orders ?? 0}</span>
                                            </div>
                                        </td>

                                        {/* Total Spent */}
                                        <td className="px-5 py-4">
                                            <span className="text-[15px] font-black text-[#1A1A2E]">৳{Number(c.total_spent ?? 0).toLocaleString()}</span>
                                        </td>

                                        {/* History Button */}
                                        <td className="px-5 py-4">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedCustomer(c)}
                                                className="
                                                    flex items-center gap-1.5 h-9 px-3.5 rounded-xl
                                                    bg-white border-2 border-[#009E49]/25
                                                    text-[#009E49] text-[11px] font-black
                                                    shadow-[0_2px_8px_rgba(0,158,73,0.1)]
                                                    hover:bg-[#009E49] hover:text-white hover:border-[#009E49]
                                                    hover:shadow-[0_4px_12px_rgba(0,158,73,0.3)]
                                                    transition-all duration-150
                                                    cursor-pointer whitespace-nowrap border-none
                                                "
                                                title="অর্ডার হিস্ট্রি দেখুন"
                                            >
                                                <History className="w-3.5 h-3.5" />
                                                <span>History</span>
                                                <ChevronRight className="w-3 h-3 opacity-60" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <AdminPagination links={customers.links} />
                </AdminCard>
            </div>

            {/* ── Customer History Slideover ── */}
            <CustomerHistoryPanel
                customer={selectedCustomer}
                onClose={() => setSelectedCustomer(null)}
            />
        </AdminLayout>
    );
};

export default Index;
