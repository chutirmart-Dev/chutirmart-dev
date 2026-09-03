import React, { useState, useEffect, useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { AdminCard, PageHeader } from '@/components/admin/ui';
import { 
    Send, Search, Phone, ShoppingBag, 
    Sparkles, Check, CheckCheck
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
        }, 3500);
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
        }, 1500);

        simulateReply(activeId);
    };

    const selectConversation = (id: number) => {
        setActiveId(id);
        setConversations(prev => prev.map(c => c.id === id ? { ...c, unreadCount: 0 } : c));
    };

    const filteredConversations = conversations.filter(c => 
        c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.mobile.includes(searchQuery)
    );

    return (
        <AdminLayout>
            <Head title="Live Chat Messages" />
            
            <PageHeader title="Live Customer Support" subtitle="Reply to your customer queries in real-time." />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-210px)] min-h-[500px]">
                
                {/* Left: Conversations List */}
                <AdminCard className="lg:col-span-4 overflow-hidden flex flex-col h-full">
                    <div className="p-4 border-b border-[#F0EFFE] bg-[#FBFAFF]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C0C6D8]" />
                            <input 
                                type="text"
                                placeholder="Search by name, mobile..." 
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full h-10 pl-9 pr-4 rounded-xl border border-[#E6F5EC] bg-[#FAFDFB] text-sm text-[#1A1A2E] placeholder-[#C0C6D8] focus:outline-none focus:border-[#009E49] focus:ring-2 focus:ring-[#009E49]/10 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto divide-y divide-[#F8F7FF] scrollbar-thin">
                        {filteredConversations.length === 0 ? (
                            <div className="p-8 text-center text-[#9096B0] text-xs font-bold">
                                No conversations found
                            </div>
                        ) : (
                            filteredConversations.map(convo => {
                                const isActive = convo.id === activeId;
                                return (
                                    <button
                                        key={convo.id}
                                        onClick={() => selectConversation(convo.id)}
                                        className={`w-full text-left p-4 flex gap-3 transition-colors border-none cursor-pointer ${isActive ? 'bg-[#F0EFFE]' : 'bg-transparent hover:bg-[#FAF9FF]'}`}
                                    >
                                        <div className="relative shrink-0">
                                            <div className="w-10 h-10 rounded-xl bg-[#E6F5EC] text-[#009E49] flex items-center justify-center font-black text-sm">
                                                {convo.avatar}
                                            </div>
                                            {convo.status === 'online' && (
                                                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#16A34A] border-2 border-white" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-0.5">
                                                <h4 className="text-[13px] font-black text-[#1A1A2E] truncate">{convo.customerName}</h4>
                                                <span className="text-[10px] text-[#9096B0] font-bold whitespace-nowrap">{convo.lastMessageTime}</span>
                                            </div>
                                            <p className="text-[10px] text-[#9096B0] font-bold mb-1">{convo.mobile}</p>
                                            <p className={`text-xs truncate ${convo.unreadCount > 0 ? 'text-[#009E49] font-black' : 'text-gray-500'}`}>
                                                {convo.lastMessage}
                                            </p>
                                        </div>
                                        {convo.unreadCount > 0 && (
                                            <div className="shrink-0 flex items-center">
                                                <span className="bg-[#DC2626] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
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

                {/* Right: Active Chat View */}
                <AdminCard className="lg:col-span-8 overflow-hidden flex flex-col h-full bg-[#FBFAFF]">
                    
                    {/* Header */}
                    <div className="p-4 border-b border-[#F0EFFE] bg-white flex justify-between items-center no-print">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-xl bg-[#E6F5EC] text-[#009E49] flex items-center justify-center font-black text-sm">
                                    {activeConversation.avatar}
                                </div>
                                {activeConversation.status === 'online' && (
                                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#16A34A] border-2 border-white" />
                                )}
                            </div>
                            <div>
                                <h3 className="text-[13px] font-black text-[#1A1A2E] flex items-center gap-1.5">
                                    {activeConversation.customerName}
                                    {activeConversation.status === 'online' ? (
                                        <span className="text-[10px] text-[#16A34A] font-bold">• Online</span>
                                    ) : (
                                        <span className="text-[10px] text-[#9096B0] font-bold">• Offline</span>
                                    )}
                                </h3>
                                <p className="text-[10px] text-[#9096B0] font-bold">{activeConversation.lastActive}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link href={route('admin.orders.index', { status: 'all' })} className="no-underline">
                                <button className="h-8 px-3 rounded-xl border border-[#E6F5EC] text-[11px] font-bold text-[#2D3048] bg-white hover:border-[#009E49] hover:text-[#009E49] flex items-center gap-1.5 transition-all cursor-pointer">
                                    <ShoppingBag className="w-3.5 h-3.5 text-[#009E49]" /> {activeConversation.orderCount} Orders
                                </button>
                            </Link>
                            <a href={`tel:${activeConversation.mobile}`} className="no-underline">
                                <button className="h-8 px-3 rounded-xl border border-[#E6F5EC] text-[11px] font-bold text-[#2D3048] bg-white hover:border-[#009E49] hover:text-[#009E49] flex items-center gap-1.5 transition-all cursor-pointer">
                                    <Phone className="w-3.5 h-3.5 text-[#16A34A]" /> Call Customer
                                </button>
                            </a>
                        </div>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-grow overflow-y-auto p-5 space-y-4 scrollbar-thin">
                        {activeConversation.messages.map(message => {
                            const isAdmin = message.sender === 'admin';
                            return (
                                <div key={message.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] rounded-2xl p-3.5 px-4 shadow-[0_2px_8px_rgba(0,158,73,0.03)] text-[13px] font-semibold leading-relaxed ${isAdmin ? 'bg-[#009E49] text-white rounded-tr-none' : 'bg-white text-[#1A1A2E] border border-[#E6F5EC] rounded-tl-none'}`}>
                                        <p className="whitespace-pre-line">{message.text}</p>
                                        <div className="flex items-center justify-end gap-1 mt-1 text-[9px] opacity-75">
                                            <span>{message.timestamp}</span>
                                            {isAdmin && (
                                                <span>
                                                    {message.status === 'read' ? (
                                                        <CheckCheck className="w-3.5 h-3.5 text-sky-200" />
                                                    ) : (
                                                        <Check className="w-3.5 h-3.5" />
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
                    <div className="p-3 border-t border-[#F0EFFE] bg-white flex gap-2 overflow-x-auto scrollbar-hide no-print">
                        <span className="text-[10px] text-[#9096B0] font-black uppercase flex items-center gap-1.5 shrink-0 px-2 select-none">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Quick Replies:
                        </span>
                        {quickTemplates.map((template, idx) => (
                            <button
                                key={idx}
                                onClick={() => setInputMessage(template)}
                                className="bg-[#FAFDFB] border border-[#E6F5EC] hover:border-[#009E49] text-gray-700 hover:text-[#009E49] transition-all rounded-xl p-2 px-3.5 text-[11px] font-bold shrink-0 cursor-pointer shadow-xs"
                            >
                                {template.substring(0, 30)}...
                            </button>
                        ))}
                    </div>

                    {/* Footer Chat Input */}
                    <div className="p-4 border-t border-[#E6F5EC] bg-white no-print">
                        <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                            <input 
                                type="text"
                                placeholder="Type a message or click a quick reply template..." 
                                value={inputMessage}
                                onChange={e => setInputMessage(e.target.value)}
                                className="flex-grow h-11 px-4 rounded-xl border border-[#E6F5EC] bg-[#FAFDFB] text-sm text-[#1A1A2E] placeholder-[#C0C6D8] focus:outline-none focus:border-[#009E49] focus:ring-2 focus:ring-[#009E49]/10 transition-all"
                            />
                            <button 
                                type="submit" 
                                disabled={!inputMessage.trim()}
                                className="h-11 w-11 rounded-xl bg-[#009E49] hover:bg-[#007F3B] text-white flex items-center justify-center border-none shrink-0 cursor-pointer disabled:opacity-50 transition-colors shadow-sm"
                            >
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
