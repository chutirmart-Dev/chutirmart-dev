import React, { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { CartSheet } from '@/components/CartSheet';
import { Toaster } from '@/components/ui/sonner';
import { useCart } from '@/context/CartContext';
import { usePage } from '@inertiajs/react';
import { ShoppingBag, ChevronUp, MessageSquare, X, Send, Phone } from 'lucide-react';

interface StorefrontLayoutProps {
    children: React.ReactNode;
}

export const StorefrontLayout: React.FC<StorefrontLayoutProps> = ({ children }) => {
    const { cartCount, cartSubtotal, setIsCartOpen } = useCart();
    const { store_settings } = usePage().props as any;
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatMessage, setChatMessage] = useState('');
    const [isContactOpen, setIsContactOpen] = useState(false);

    // WhatsApp Configuration from settings
    const rawNumber = store_settings?.whatsapp_number || '8801700000000';
    // Ensure country code formatting for wa.me link
    const whatsappNumber = rawNumber.replace(/\D/g, '');

    useEffect(() => {
        document.documentElement.classList.remove('dark');

        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
            
            // Calculate scroll progress percentage
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            setScrollProgress(progress);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSendWhatsapp = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatMessage.trim()) return;
        const encodedText = encodeURIComponent(chatMessage);
        window.open(`https://wa.me/${whatsappNumber}?text=${encodedText}`, '_blank');
        setChatMessage('');
        setIsChatOpen(false);
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#F5F3EE]">
            {/* Header */}
            <Header />

            {/* Main Content Area */}
            <main className="flex-grow pb-24 md:pb-0">
                {children}
            </main>

            {/* Footer */}
            <Footer />

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav />

            {/* Persistent Cart Sheet Drawer */}
            <CartSheet />

            {/* ── FLOATING WIDGETS ────────────────────────────────────── */}

            {/* 1. Floating Cart Sidebar Button (Right Edge) */}
            <div 
                onClick={() => setIsCartOpen(true)}
                className="fixed right-0 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center bg-white shadow-[-4px_4px_20px_rgba(0,158,73,0.15)] rounded-l-2xl border border-r-0 border-[#009E49]/20 overflow-hidden cursor-pointer select-none transition-all duration-300 hover:translate-x-[-4px]"
            >
                {/* Top: Red background with bag icon & count */}
                <div className="w-16 py-3 bg-[#E2231A] text-white flex flex-col items-center justify-center gap-1">
                    <ShoppingBag className="w-5 h-5" />
                    <span className="text-[10px] font-black tracking-wide leading-none">{cartCount} Items</span>
                </div>
                {/* Bottom: White background with subtotal */}
                <div className="w-16 py-2 flex items-center justify-center bg-white text-[#E2231A] text-[11px] font-black">
                    ৳{cartSubtotal}
                </div>
            </div>

            {/* 2. Scroll-To-Top Button with Circular Progress */}
            {showScrollTop && (
                <div 
                    onClick={scrollToTop}
                    className="fixed right-4 bottom-24 md:bottom-8 z-40 w-12 h-12 flex items-center justify-center cursor-pointer select-none active:scale-95 transition-transform duration-200"
                    title="Scroll to Top"
                >
                    {/* SVG Progress Circle */}
                    <svg className="w-full h-full transform -rotate-90">
                        {/* Background track circle */}
                        <circle
                            cx="24"
                            cy="24"
                            r="21"
                            fill="none"
                            stroke="rgba(0, 0, 0, 0.08)"
                            strokeWidth="3"
                        />
                        {/* Foreground animated progress circle */}
                        <circle
                            cx="24"
                            cy="24"
                            r="21"
                            fill="none"
                            stroke="#E2231A" /* Brand Red Progress */
                            strokeWidth="3"
                            strokeDasharray="132"
                            strokeDashoffset={132 - (132 * scrollProgress) / 100}
                            strokeLinecap="round"
                            className="transition-all duration-75"
                        />
                    </svg>
                    
                    {/* Centered Solid Green Circle Arrow Button */}
                    <div className="absolute w-[36px] h-[36px] bg-[#009E49] hover:bg-[#007F3B] text-white rounded-full flex items-center justify-center shadow-md transition-colors">
                        <ChevronUp className="w-5.5 h-5.5 stroke-[3px]" />
                    </div>
                </div>
            )}

            {/* 3. Left-side Floating Contact Speed-Dial */}
            <div className="fixed left-4 bottom-24 md:bottom-8 z-40 flex flex-col-reverse items-center gap-3">

                {/* Expanded contact buttons — WhatsApp, Messenger, Phone */}
                <div
                    className={`flex flex-col-reverse items-center gap-3 transition-all duration-300 overflow-hidden ${
                        isContactOpen
                            ? 'opacity-100 max-h-[240px] translate-y-0'
                            : 'opacity-0 max-h-0 pointer-events-none translate-y-4'
                    }`}
                >
                    {/* WhatsApp */}
                    <a
                        href={`https://wa.me/${whatsappNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="WhatsApp"
                        className="w-12 h-12 bg-[#25D366] hover:bg-[#20ba56] text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
                    >
                        {/* WhatsApp SVG */}
                        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                    </a>

                    {/* Messenger */}
                    <a
                        href="https://m.me/chutirmart"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Messenger"
                        className="w-12 h-12 bg-[#0084FF] hover:bg-[#0070dd] text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
                    >
                        {/* Messenger SVG */}
                        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                            <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.652V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.974 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8.1l3.131 3.26L19.752 8.1l-6.561 6.863z"/>
                        </svg>
                    </a>

                    {/* Phone Call */}
                    <a
                        href={`tel:${store_settings?.contact_phone || '01700000000'}`}
                        title="Call Us"
                        className="w-12 h-12 bg-[#009E49] hover:bg-[#007F3B] text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
                    >
                        <Phone className="w-6 h-6" />
                    </a>
                </div>

                {/* Main Toggle Button */}
                <button
                    onClick={() => setIsContactOpen(!isContactOpen)}
                    className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl border-none cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 ${
                        isContactOpen
                            ? 'bg-gray-700 hover:bg-gray-800 rotate-0'
                            : 'bg-[#E2231A] hover:bg-[#c61e16]'
                    }`}
                    title="Contact Us"
                >
                    <div className={`transition-transform duration-300 ${isContactOpen ? 'rotate-45' : 'rotate-0'}`}>
                        {isContactOpen ? (
                            <X className="w-6 h-6 text-white" />
                        ) : (
                            <MessageSquare className="w-6 h-6 text-white fill-white" />
                        )}
                    </div>
                </button>
            </div>

            {/* Toast Notifications */}
            <Toaster position="top-center" richColors />
        </div>
    );
};

export default StorefrontLayout;
