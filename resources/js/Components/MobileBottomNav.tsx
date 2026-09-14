import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { Home, Store, ShoppingCart, Search, User, Menu, X, ArrowRight, Box } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const MobileBottomNav: React.FC = () => {
    const { cartCount, setIsCartOpen } = useCart();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isTrackOpen, setIsTrackOpen] = useState(false);
    const [trackOrderNum, setTrackOrderNum] = useState('');
    const [trackMobile, setTrackMobile] = useState('');

    const handleTrackOrder = (e: React.FormEvent) => {
        e.preventDefault();
        if (trackOrderNum.trim() && trackMobile.trim()) {
            setIsTrackOpen(false);
            router.post(route('order.track'), {
                order_number: trackOrderNum,
                mobile: trackMobile
            });
        }
    };

    const { url } = usePage();
    const isHome = url === '/' || url === '';
    const isShop = url.startsWith('/shop');

    return (
        <>
            <nav 
                className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/97 backdrop-blur-md border-t border-gray-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] flex items-center justify-around" 
                style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 8px))', paddingTop: '6px' }}
            >
                {/* Home */}
                <Link 
                    href={route('home')} 
                    prefetch 
                    className={`flex-1 flex flex-col items-center justify-center gap-0.5 pt-0.5 pb-1 transition-all active:scale-90 relative ${isHome ? 'text-[#009E49]' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    <Home className={`w-[22px] h-[22px] xs:w-6 xs:h-6 stroke-[2] ${isHome ? 'text-[#009E49]' : ''}`} />
                    <span className={`text-[10px] xs:text-[11px] font-bold font-bangla leading-none ${isHome ? 'text-[#009E49]' : 'text-gray-500'}`}>হোম</span>
                    {isHome && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[2.5px] bg-[#009E49] rounded-full" />}
                </Link>

                {/* Shop */}
                <Link 
                    href={route('shop')} 
                    prefetch 
                    className={`flex-1 flex flex-col items-center justify-center gap-0.5 pt-0.5 pb-1 transition-all active:scale-90 relative ${isShop ? 'text-[#009E49]' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    <Store className={`w-[22px] h-[22px] xs:w-6 xs:h-6 stroke-[2] ${isShop ? 'text-[#009E49]' : ''}`} />
                    <span className={`text-[10px] xs:text-[11px] font-bold font-bangla leading-none ${isShop ? 'text-[#009E49]' : 'text-gray-500'}`}>শপ</span>
                    {isShop && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[2.5px] bg-[#009E49] rounded-full" />}
                </Link>

                {/* Cart (Elevated Center) */}
                <div className="relative -top-4 xs:-top-5 shrink-0 px-1 xs:px-1.5">
                    <button 
                        onClick={() => setIsCartOpen(true)}
                        type="button"
                        className="w-13 h-13 xs:w-14 xs:h-14 rounded-full bg-[#E2231A] text-white flex items-center justify-center shadow-[0_6px_20px_rgba(226,35,26,0.45)] border-[3px] xs:border-4 border-white active:scale-90 transition-transform cursor-pointer focus:outline-none"
                        aria-label="View shopping cart"
                    >
                        <ShoppingCart className="w-5.5 h-5.5 xs:w-6 xs:h-6 stroke-[2.2]" />
                        {cartCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 bg-[#009E49] text-white text-[9px] xs:text-[10px] font-black w-4.5 h-4.5 xs:w-5 xs:h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs font-latin">
                                {cartCount > 99 ? '99+' : cartCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Track Order */}
                <button 
                    onClick={() => setIsTrackOpen(true)}
                    type="button"
                    className="flex-1 flex flex-col items-center justify-center gap-0.5 pt-0.5 pb-1 text-gray-500 hover:text-gray-900 focus:outline-none active:scale-90 transition-all cursor-pointer"
                >
                    <Box className="w-[22px] h-[22px] xs:w-6 xs:h-6 stroke-[2]" />
                    <span className="text-[10px] xs:text-[11px] font-bold font-bangla leading-none">ট্র্যাকিং</span>
                </button>

                {/* Menu */}
                <button 
                    onClick={() => setIsMenuOpen(true)}
                    type="button"
                    className="flex-1 flex flex-col items-center justify-center gap-0.5 pt-0.5 pb-1 text-gray-500 hover:text-gray-900 focus:outline-none active:scale-90 transition-all cursor-pointer"
                >
                    <Menu className="w-[22px] h-[22px] xs:w-6 xs:h-6 stroke-[2]" />
                    <span className="text-[10px] xs:text-[11px] font-bold font-bangla leading-none">মেনু</span>
                </button>
            </nav>

            {/* Mobile Categories Menu Slide-Up Drawer — Modern App Style */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-black/50">
                    <div className="bg-white rounded-t-3xl max-h-[80vh] flex flex-col animate-in slide-in-from-bottom duration-300">
                        {/* Drag handle */}
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="w-10 h-1 bg-gray-300 rounded-full" />
                        </div>
                        <div className="px-4 pb-3 border-b border-gray-100 flex items-center justify-between">
                            <span className="font-bold text-gray-900 text-base font-bangla">ক্যাটাগরি সমূহ</span>
                            <button onClick={() => setIsMenuOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 active:scale-95 transition-transform">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto py-2">
                            {[
                                { href: route('shop'), label: 'সব পণ্য', emoji: '🛍️' },
                                { href: route('shop', { category: 'home-kitchen' }), label: 'রান্নাঘর ও গৃহস্থালী', emoji: '🏠' },
                                { href: route('shop', { category: 'smart-gadgets' }), label: 'স্মার্ট গ্যাজেটস', emoji: '📱' },
                                { href: route('shop', { category: 'summer-products' }), label: 'সামার কালেকশন', emoji: '☀️' },
                                { href: route('shop', { category: 'offer-products' }), label: 'অফার প্রোডাক্টস', emoji: '🎁' },
                            ].map(item => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl w-7 text-center">{item.emoji}</span>
                                        <span className="text-[15px] font-semibold text-gray-800 font-bangla">{item.label}</span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-400" />
                                </Link>
                            ))}
                        </div>
                        <div className="px-5 py-4 bg-gray-50 flex items-center justify-around border-t border-gray-100">
                            <Link href={route('about')} onClick={() => setIsMenuOpen(false)} className="text-sm font-semibold text-gray-600 font-bangla">আমাদের সম্পর্কে</Link>
                            <span className="text-gray-300">|</span>
                            <Link href={route('terms')} onClick={() => setIsMenuOpen(false)} className="text-sm font-semibold text-gray-600 font-bangla">শর্তাবলী ও নিয়মনীতি</Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Track Order Dialog */}
            <Dialog open={isTrackOpen} onOpenChange={setIsTrackOpen}>
                <DialogContent className="bg-white max-w-sm rounded-lg">
                    <DialogHeader>
                        <DialogTitle className="text-base font-bold text-center">আপনার অর্ডার ট্র্যাক করুন</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleTrackOrder} className="space-y-4 pt-2">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 block mb-1">অর্ডার নম্বর (যেমন: CHU-123)</label>
                            <input 
                                placeholder="অর্ডার নম্বর" 
                                value={trackOrderNum}
                                onChange={e => setTrackOrderNum(e.target.value)}
                                className="w-full h-10 px-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-primary"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 block mb-1">মোবাইল নম্বর</label>
                            <input 
                                placeholder="মোবাইল নম্বর" 
                                value={trackMobile}
                                onChange={e => setTrackMobile(e.target.value)}
                                className="w-full h-10 px-3 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-primary"
                                required
                            />
                        </div>
                        <button type="submit" className="w-full h-10 bg-primary hover:bg-primary/95 text-white font-bold rounded-md text-sm transition-colors cursor-pointer">
                            ট্র্যাক করুন →
                        </button>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};
