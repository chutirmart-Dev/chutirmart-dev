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
                className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200/80 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] flex items-center justify-around py-1 px-1" 
                style={{ paddingBottom: 'max(0.35rem, env(safe-area-inset-bottom, 6px))' }}
            >
                {/* Home */}
                <Link 
                    href={route('home')} 
                    prefetch 
                    className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-90 ${isHome ? 'text-[#009E49] font-bold' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    <Home className={`w-4.5 h-4.5 xs:w-5 xs:h-5 stroke-[2] ${isHome ? 'text-[#009E49]' : ''}`} />
                    <span className="text-[9px] xs:text-[10px] mt-0.5 font-semibold font-bangla leading-none">হোম</span>
                </Link>

                {/* Shop */}
                <Link 
                    href={route('shop')} 
                    prefetch 
                    className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-90 ${isShop ? 'text-[#009E49] font-bold' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    <Store className={`w-4.5 h-4.5 xs:w-5 xs:h-5 stroke-[2] ${isShop ? 'text-[#009E49]' : ''}`} />
                    <span className="text-[9px] xs:text-[10px] mt-0.5 font-semibold font-bangla leading-none">শপ</span>
                </Link>

                {/* Cart (Elevated Center) */}
                <div className="relative -top-3.5 sm:-top-4 shrink-0 px-1">
                    <button 
                        onClick={() => setIsCartOpen(true)}
                        type="button"
                        className="w-12 h-12 xs:w-13 xs:h-13 rounded-full bg-[#E2231A] text-white flex items-center justify-center shadow-lg shadow-red-500/30 border-[3px] border-white active:scale-90 transition-transform cursor-pointer focus:outline-none"
                        aria-label="View shopping cart"
                    >
                        <ShoppingCart className="w-5 h-5 xs:w-5.5 xs:h-5.5 stroke-[2.2]" />
                        {cartCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 bg-[#009E49] text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white shadow-2xs font-latin">
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Track Order */}
                <button 
                    onClick={() => setIsTrackOpen(true)}
                    type="button"
                    className="flex-1 flex flex-col items-center justify-center py-1 text-gray-500 hover:text-gray-900 focus:outline-none active:scale-90 transition-all cursor-pointer"
                >
                    <Box className="w-4.5 h-4.5 xs:w-5 xs:h-5 stroke-[2]" />
                    <span className="text-[9px] xs:text-[10px] mt-0.5 font-semibold font-bangla leading-none">ট্র্যাকিং</span>
                </button>

                {/* Menu */}
                <button 
                    onClick={() => setIsMenuOpen(true)}
                    type="button"
                    className="flex-1 flex flex-col items-center justify-center py-1 text-gray-500 hover:text-gray-900 focus:outline-none active:scale-90 transition-all cursor-pointer"
                >
                    <Menu className="w-4.5 h-4.5 xs:w-5 xs:h-5 stroke-[2]" />
                    <span className="text-[9px] xs:text-[10px] mt-0.5 font-semibold font-bangla leading-none">মেনু</span>
                </button>
            </nav>

            {/* Mobile Categories Menu Slide-Up Drawer */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-black/40">
                    <div className="bg-white rounded-t-2xl max-h-[75vh] flex flex-col animate-in slide-in-from-bottom duration-300">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <span className="font-bold text-gray-800">ক্যাটাগরি সমূহ</span>
                            <button onClick={() => setIsMenuOpen(false)} className="text-gray-400 p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                            <Link 
                                href={route('shop')} 
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center justify-between py-2 text-sm text-gray-700 font-medium border-b border-gray-50"
                            >
                                সব পণ্য
                                <ArrowRight className="w-4 h-4 text-gray-400" />
                            </Link>
                            <Link 
                                href={route('shop', { category: 'home-kitchen' })} 
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center justify-between py-2 text-sm text-gray-700 font-medium border-b border-gray-50"
                            >
                                রান্নাঘর ও গৃহস্থালী
                                <ArrowRight className="w-4 h-4 text-gray-400" />
                            </Link>
                            <Link 
                                href={route('shop', { category: 'smart-gadgets' })} 
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center justify-between py-2 text-sm text-gray-700 font-medium border-b border-gray-50"
                            >
                                স্মার্ট গ্যাজেটস
                                <ArrowRight className="w-4 h-4 text-gray-400" />
                            </Link>
                            <Link 
                                href={route('shop', { category: 'summer-products' })} 
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center justify-between py-2 text-sm text-gray-700 font-medium border-b border-gray-50"
                            >
                                সামার কালেকশন ☀️
                                <ArrowRight className="w-4 h-4 text-gray-400" />
                            </Link>
                            <Link 
                                href={route('shop', { category: 'offer-products' })} 
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center justify-between py-2 text-sm text-gray-700 font-medium border-b border-gray-50"
                            >
                                অফার প্রোডাক্টস 🎁
                                <ArrowRight className="w-4 h-4 text-gray-400" />
                            </Link>
                        </div>
                        <div className="p-4 bg-gray-50 flex items-center justify-around border-t border-gray-100">
                            <Link href={route('about')} onClick={() => setIsMenuOpen(false)} className="text-xs font-semibold text-gray-600">আমাদের সম্পর্কে</Link>
                            <span className="text-gray-300">|</span>
                            <Link href={route('terms')} onClick={() => setIsMenuOpen(false)} className="text-xs font-semibold text-gray-600">শর্তাবলী ও নিয়মনীতি</Link>
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
                            <label className="text-xs font-semibold text-gray-500 block mb-1">অর্ডার নম্বর (যেমন: CHU-10245)</label>
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
