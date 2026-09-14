import React, { useState, useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { AdminCard, PageHeader } from '@/components/admin/ui';
import { 
    Send, Search, Phone, ShoppingBag, 
    Sparkles, Check, CheckCheck, MessageSquare,
    ArrowLeft, RotateCcw
} from 'lucide-react';

interface Message {
    id: number;
    sender: 'customer' | 'admin';
    text: string;
    timestamp: string;
    status: 'sent' | 'delivered' | 'read';
}

interface Conversation {
    id: number;
    customerName: string;
    mobile: string;
    avatar: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    status: 'online' | 'offline';
    lastActive: string;
    orderCount: number;
    messages: Message[];
}

const mockConversations: Conversation[] = [
    {
        id: 1,
        customerName: "Humayun Kabir",
        mobile: "01712345678",
        avatar: "H",
        lastMessage: "Is the product in stock?",
        lastMessageTime: "10:30 AM",
        unreadCount: 2,
        status: "online",
        lastActive: "Active now",
        orderCount: 3,
        messages: [
            { id: 101, sender: 'customer', text: "Hello, I wanted to ask about the Mini Portable Fan.", timestamp: "10:15 AM", status: 'read' },
            { id: 102, sender: 'admin', text: "Hello! Sure, how can I help you today?", timestamp: "10:17 AM", status: 'read' },
            { id: 103, sender: 'customer', text: "Is the product in stock? And how many days does inside-Dhaka delivery take?", timestamp: "10:20 AM", status: 'read' },
        ]
    },
    {
        id: 2,
        customerName: "Anika Tasnim",
        mobile: "01987654321",
        avatar: "A",
        lastMessage: "Thank you for the quick support!",
        lastMessageTime: "Yesterday",
        unreadCount: 0,
        status: "offline",
        lastActive: "Last active 2 hours ago",
        orderCount: 1,
        messages: [
            { id: 201, sender: 'customer', text: "Hi, I placed an order but typed the wrong address.", timestamp: "Yesterday 3:00 PM", status: 'read' },
            { id: 202, sender: 'admin', text: "No worries! Please share your order number and updated address here.", timestamp: "Yesterday 3:05 PM", status: 'read' },
            { id: 203, sender: 'customer', text: "Order #10423. New address: House 23, Road 4, Dhanmondi, Dhaka.", timestamp: "Yesterday 3:10 PM", status: 'read' },
            { id: 204, sender: 'admin', text: "Got it! We have updated the shipping details for order #10423.", timestamp: "Yesterday 3:15 PM", status: 'read' },
            { id: 205, sender: 'customer', text: "Thank you for the quick support!", timestamp: "Yesterday 3:17 PM", status: 'read' },
        ]
    },
    {
        id: 3,
        customerName: "Sajid Hasan",
        mobile: "01855667788",
        avatar: "S",
        lastMessage: "I sent the payment proof via bKash.",
        lastMessageTime: "2 days ago",
        unreadCount: 0,
        status: "offline",
        lastActive: "Last active 1 day ago",
        orderCount: 5,
        messages: [
            { id: 301, sender: 'customer', text: "Is COD available for Chittagong?", timestamp: "2 days ago", status: 'read' },
            { id: 302, sender: 'admin', text: "Yes! Cash on Delivery is available nationwide. Shipping is 130 BDT outside Dhaka.", timestamp: "2 days ago", status: 'read' },
            { id: 303, sender: 'customer', text: "Perfect. I ordered and sent the payment proof via bKash.", timestamp: "2 days ago", status: 'read' },
        ]
    }
];

const quickTemplates = [
    "Hello! Welcome to ChutirMart support. How can I help you today?",
    "Your order is verified and is being prepared for dispatch.",
    "Your order has been shipped! It will arrive in 2-3 business days.",
    "We have processed your refund. It should reflect in your account in 48 hours."
];

export const Message: React.FC = () => {
    const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
    const [activeId, setActiveId] = useState<number>(1);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'online'>('all');
    const [showMobileChat, setShowMobileChat] = useState<boolean>(false);
    const [inputMessage, setInputMessage] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const activeConversation = conversations.find(c => c.id === activeId) || conversations[0];

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeId, activeConversation.messages.length]);

    const simulateReply = (convoId: number) => {
        setTimeout(() => {
            const replies = [
                "Understood. Thanks for updating me!",
                "Great! I will wait for your confirmation.",
                "Okay, let me know if you need anything else.",
                "Thank you so much!"
            ];
            const randomReply = replies[Math.floor(Math.random() * replies.length)];

            setConversations(prev => prev.map(c => {
                if (c.id === convoId) {
                    const newMsg: Message = {
                        id: Date.now() + 1,
                        sender: 'customer',
                        text: randomReply,
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        status: 'read'
                    };
                    return {
                        ...c,
                        lastMessage: randomReply,
                        lastMessageTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        unreadCount: convoId === activeId ? 0 : c.unreadCount + 1,
                        messages: [...c.messages, newMsg]
                    };
                }
                return c;
            }));
        }, 3000);
    };

    const handleSendMessage = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!inputMessage.trim()) return;

        const currentInput = inputMessage;
        setInputMessage('');

        const newMessage: Message = {
            id: Date.now(),
            sender: 'admin',
            text: currentInput,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'sent'
        };

        setConversations(prev => prev.map(c => {
            if (c.id === activeId) {
                return {
                    ...c,
                    lastMessage: currentInput,
                    lastMessageTime: "Just now",
                    messages: [...c.messages, newMessage]
                };
            }
            return c;
        }));

        setTimeout(() => {
            setConversations(prev => prev.map(c => {
                if (c.id === activeId) {
                    return {
                        ...c,
                        messages: c.messages.map(m => m.id === newMessage.id ? { ...m, status: 'read' as const } : m)
                    };
                }
                return c;
            }));
        }, 1200);

        simulateReply(activeId);
    };

    const selectConversation = (id: number) => {
        setActiveId(id);
        setConversations(prev => prev.map(c => c.id === id ? { ...c, unreadCount: 0 } : c));
    };

    const filteredConversations = conversations.filter(c => {
        const matchesSearch = c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
            c.mobile.includes(searchQuery);
        if (!matchesSearch) return false;
        if (activeFilter === 'unread') return c.unreadCount > 0;
        if (activeFilter === 'online') return c.status === 'online';
        return true;
    });

    const formatCleanPhone = (phone: string) => {
        const clean = phone.replace(/\D/g, '');
        return clean.startsWith('88') ? clean : clean.startsWith('0') ? `88${clean}` : `880${clean}`;
    };

    return (
        <AdminLayout>
            <Head title="Live Customer Support | ChutirMart" />
            
            <PageHeader 
                title="Live Customer Support" 
                subtitle="Real-time messaging, order queries, and multi-channel customer assistance." 
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-215px)] min-h-[560px]">
                
                {/* ── Left: Conversations List ── */}
                <AdminCard className={`lg:col-span-4 overflow-hidden flex flex-col h-full border border-slate-200/80 shadow-2xs rounded-2xl ${showMobileChat ? 'hidden lg:flex' : 'flex'}`}>
                    
                    {/* Header & Search */}
                    <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-white space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h3 className="text-[14.5px] sm:text-[15px] font-black text-slate-800">Inbox</h3>
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-[#009E49] border border-emerald-200/80">
                                    {conversations.length} Active
                                </span>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="Search by name, mobile..." 
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 bg-slate-50/70 text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#009E49] focus:bg-white focus:ring-2 focus:ring-[#009E49]/15 transition-all"
                            />
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex items-center gap-1.5 pt-0.5">
                            <button
                                type="button"
                                onClick={() => setActiveFilter('all')}
                                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all border cursor-pointer ${
                                    activeFilter === 'all'
                                        ? 'bg-[#009E49] text-white border-[#009E49] shadow-xs'
                                        : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100'
                                }`}
                            >
                                All ({conversations.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveFilter('unread')}
                                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all border cursor-pointer ${
                                    activeFilter === 'unread'
                                        ? 'bg-[#009E49] text-white border-[#009E49] shadow-xs'
                                        : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100'
                                }`}
                            >
                                Unread ({conversations.filter(c => c.unreadCount > 0).length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveFilter('online')}
                                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all border cursor-pointer ${
                                    activeFilter === 'online'
                                        ? 'bg-[#009E49] text-white border-[#009E49] shadow-xs'
                                        : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100'
                                }`}
                            >
                                Online ({conversations.filter(c => c.status === 'online').length})
                            </button>
                        </div>
                    </div>

                    {/* Conversations List */}
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-100 bg-white scrollbar-thin">
                        {filteredConversations.length === 0 ? (
                            <div className="p-10 text-center text-slate-400">
                                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                <p className="text-xs font-semibold">কোনো মেসেজ পাওয়া যায়নি</p>
                            </div>
                        ) : (
                            filteredConversations.map(convo => {
                                const isActive = convo.id === activeId;
                                return (
                                    <button
                                        key={convo.id}
                                        type="button"
                                        onClick={() => {
                                            selectConversation(convo.id);
                                            setShowMobileChat(true);
                                        }}
                                        className={`w-full text-left p-3.5 sm:p-4 flex gap-3 transition-all border-none cursor-pointer ${
                                            isActive 
                                                ? 'bg-gradient-to-r from-emerald-50/90 to-emerald-100/30 border-l-[3.5px] border-l-[#009E49] shadow-2xs' 
                                                : 'bg-white hover:bg-slate-50/80 border-l-[3.5px] border-l-transparent'
                                        }`}
                                    >
                                        <div className="relative shrink-0">
                                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm shadow-2xs transition-transform ${
                                                isActive 
                                                    ? 'bg-gradient-to-br from-[#009E49] to-[#007F3B] text-white scale-102' 
                                                    : 'bg-emerald-50 text-[#009E49] border border-emerald-200/60'
                                            }`}>
                                                {convo.avatar}
                                            </div>
                                            {convo.status === 'online' && (
                                                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-500/20" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-0.5">
                                                <h4 className={`text-[13.5px] truncate font-bold ${isActive ? 'text-[#009E49]' : 'text-slate-900'}`}>
                                                    {convo.customerName}
                                                </h4>
                                                <span className="text-[10.5px] text-slate-400 font-semibold whitespace-nowrap ml-1">
                                                    {convo.lastMessageTime}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-400 font-mono mb-1">{convo.mobile}</p>
                                            <p className={`text-xs truncate ${convo.unreadCount > 0 ? 'text-slate-900 font-extrabold' : 'text-slate-500'}`}>
                                                {convo.lastMessage}
                                            </p>
                                        </div>
                                        {convo.unreadCount > 0 && (
                                            <div className="shrink-0 flex items-center pl-1">
                                                <span className="bg-[#009E49] text-white text-[10px] font-black min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center shadow-xs">
                                                    {convo.unreadCount}
                                                </span>
                                            </div>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </AdminCard>

                {/* ── Right: Active Chat Room ── */}
                <AdminCard className={`lg:col-span-8 overflow-hidden flex flex-col h-full bg-slate-50/60 border border-slate-200/80 shadow-2xs rounded-2xl ${!showMobileChat ? 'hidden lg:flex' : 'flex'}`}>
                    
                    {/* Active Header */}
                    <div className="p-3 sm:p-4 border-b border-slate-100 bg-white flex justify-between items-center gap-3 no-print">
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                            {/* Mobile Back Button */}
                            <button
                                type="button"
                                onClick={() => setShowMobileChat(false)}
                                className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-[#009E49] hover:bg-emerald-50 border-none bg-transparent cursor-pointer shrink-0 transition-colors"
                                title="Back to inbox"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>

                            <div className="relative shrink-0">
                                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#009E49] to-[#007F3B] text-white flex items-center justify-center font-black text-sm sm:text-base shadow-xs">
                                    {activeConversation.avatar}
                                </div>
                                {activeConversation.status === 'online' && (
                                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-600/20" />
                                )}
                            </div>

                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-[13.5px] sm:text-[14.5px] font-black text-slate-900 truncate">
                                        {activeConversation.customerName}
                                    </h3>
                                    {activeConversation.status === 'online' ? (
                                        <span className="inline-flex items-center gap-1 text-[10.5px] text-[#009E49] font-bold bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#009E49] animate-pulse" />
                                            Online
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-[10.5px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-full">
                                            Offline
                                        </span>
                                    )}
                                </div>
                                <p className="text-[11px] sm:text-[11.5px] text-slate-500 font-medium truncate mt-0.5 flex items-center gap-2">
                                    <span className="font-mono text-slate-600 font-bold">{activeConversation.mobile}</span>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-slate-400">{activeConversation.lastActive}</span>
                                </p>
                            </div>
                        </div>

                        {/* Customer Quick Actions */}
                        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                            <Link href={route('admin.orders.index', { status: 'all' })} className="no-underline">
                                <button className="h-8.5 sm:h-9 px-2.5 sm:px-3 rounded-xl border border-slate-200 text-[11px] sm:text-[12px] font-bold text-slate-700 bg-white hover:border-[#009E49] hover:text-[#009E49] hover:bg-emerald-50/50 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs">
                                    <ShoppingBag className="w-3.5 h-3.5 text-[#009E49]" />
                                    <span className="hidden sm:inline">{activeConversation.orderCount} Orders</span>
                                    <span className="sm:hidden">{activeConversation.orderCount}</span>
                                </button>
                            </Link>
                            <a href={`tel:${activeConversation.mobile}`} className="no-underline">
                                <button className="h-8.5 sm:h-9 px-2.5 sm:px-3 rounded-xl border border-emerald-200/80 text-[11px] sm:text-[12px] font-bold text-[#009E49] bg-emerald-50 hover:bg-emerald-100 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs">
                                    <Phone className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Call</span>
                                </button>
                            </a>
                            <a 
                                href={`https://wa.me/${formatCleanPhone(activeConversation.mobile)}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="no-underline"
                            >
                                <button 
                                    className="h-8.5 sm:h-9 px-2.5 sm:px-3 rounded-xl border border-[#25D366]/40 text-[11px] sm:text-[12px] font-bold text-[#128C7E] bg-[#25D366]/10 hover:bg-[#25D366]/20 flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs" 
                                    title="WhatsApp এ চ্যাট করুন"
                                >
                                    <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
                                    <span className="hidden md:inline">WhatsApp</span>
                                </button>
                            </a>
                        </div>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-grow overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin">
                        <div className="flex justify-center my-1">
                            <span className="text-[10.5px] font-bold text-slate-500 bg-white border border-slate-200/80 px-3 py-1 rounded-full shadow-2xs select-none">
                                Live Customer Support Session
                            </span>
                        </div>

                        {activeConversation.messages.map(message => {
                            const isAdmin = message.sender === 'admin';
                            return (
                                <div key={message.id} className={`flex items-end gap-2 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                    {!isAdmin && (
                                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#009E49] flex items-center justify-center font-bold text-xs shrink-0 mb-1 border border-emerald-200/60 shadow-2xs">
                                            {activeConversation.avatar}
                                        </div>
                                    )}
                                    <div 
                                        className={`max-w-[85%] sm:max-w-[70%] p-3.5 px-4 text-[13px] font-medium leading-relaxed shadow-sm transition-all ${
                                            isAdmin 
                                                ? 'bg-gradient-to-r from-[#009E49] to-[#00873E] text-white rounded-2xl rounded-tr-xs shadow-[0_3px_12px_rgba(0,158,73,0.2)]' 
                                                : 'bg-white text-slate-800 border border-slate-200/90 rounded-2xl rounded-tl-xs shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
                                        }`}
                                    >
                                        <p className="whitespace-pre-line">{message.text}</p>
                                        <div className={`flex items-center justify-end gap-1.5 mt-1.5 text-[10px] ${isAdmin ? 'text-emerald-100/90' : 'text-slate-400'}`}>
                                            <span>{message.timestamp}</span>
                                            {isAdmin && (
                                                <span>
                                                    {message.status === 'read' ? (
                                                        <CheckCheck className="w-3.5 h-3.5 text-emerald-200" />
                                                    ) : (
                                                        <Check className="w-3.5 h-3.5 text-emerald-200" />
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Replies Panel */}
                    <div className="p-2.5 px-3.5 sm:px-4 border-t border-slate-100 bg-white flex items-center gap-2 overflow-x-auto scrollbar-hide no-print">
                        <span className="text-[10px] text-slate-400 font-black uppercase flex items-center gap-1 shrink-0 select-none">
                            <Sparkles className="w-3.5 h-3.5 text-[#009E49]" /> Quick Reply:
                        </span>
                        {quickTemplates.map((template, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => setInputMessage(template)}
                                className="bg-emerald-50/60 hover:bg-emerald-100/90 text-emerald-800 hover:text-[#009E49] border border-emerald-200/70 hover:border-emerald-300 transition-all rounded-full py-1 px-3 text-[11px] font-bold shrink-0 cursor-pointer shadow-2xs active:scale-95 whitespace-nowrap"
                            >
                                {template.substring(0, 32)}...
                            </button>
                        ))}
                    </div>

                    {/* Footer Chat Input */}
                    <div className="p-3 sm:p-4 border-t border-slate-100 bg-white no-print">
                        <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                            <div className="flex-grow flex items-center bg-slate-50 hover:bg-slate-100/60 focus-within:bg-white focus-within:border-[#009E49] focus-within:ring-2 focus-within:ring-[#009E49]/15 border border-slate-200 rounded-xl px-3.5 transition-all">
                                <input 
                                    type="text"
                                    placeholder="Type a reply to customer..." 
                                    value={inputMessage}
                                    onChange={e => setInputMessage(e.target.value)}
                                    className="w-full h-11 bg-transparent border-none text-[13.5px] sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={!inputMessage.trim()}
                                className="h-11 px-4 sm:px-5 rounded-xl bg-gradient-to-r from-[#009E49] to-[#00873E] hover:from-[#00873E] hover:to-[#007435] text-white font-bold flex items-center justify-center gap-1.5 border-none shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow-md hover:shadow-[#009E49]/20 active:scale-95 transition-all"
                            >
                                <span className="hidden sm:inline text-[13px]">Send</span>
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>

                </AdminCard>
            </div>
        </AdminLayout>
    );
};

export default Message;
