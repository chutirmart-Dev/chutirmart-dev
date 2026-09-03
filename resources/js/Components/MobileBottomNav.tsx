import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
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

    return (
        <>
            <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-gray-100 shadow-lg flex items-center justify-around py-1.5 pb-safe" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
                {/* Home */}
                <Link href={route('home')} prefetch className="flex flex-col items-center justify-center text-gray-500 hover:text-primary">
                    <Home className="w-5 h-5" />
                    <span className="text-[10px] mt-0.5 font-medium">হোম</span>
                </Link>

                {/* Shop */}
                <Link href={route('shop')} prefetch className="flex flex-col items-center justify-center text-gray-500 hover:text-primary">
                    <Store className="w-5 h-5" />
                    <span className="text-[10px] mt-0.5 font-medium">শপ</span>
                </Link>

                {/* Cart (Elevated Center) */}
                <div className="relative -top-4">
                    <button 
                        onClick={() => setIsCartOpen(true)}
                        className="w-13 h-13 rounded-full bg-primary text-white flex items-center justify-center shadow-lg border-4 border-white focus:outline-none"
                    >
                        <ShoppingCart className="w-5.5 h-5.5" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-destructive text-white text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center">
                                {cartCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Track Order */}
                <button 
                    onClick={() => setIsTrackOpen(true)}
                    className="flex flex-col items-center justify-center text-gray-500 hover:text-primary focus:outline-none"
                >
                    <Box className="w-5 h-5" />
                    <span className="text-[10px] mt-0.5 font-medium">ট্র্যাকিং</span>
                </button>

                {/* Menu */}
                <button 
                    onClick={() => setIsMenuOpen(true)}
                    className="flex flex-col items-center justify-center text-gray-500 hover:text-primary focus:outline-none"
                >
                    <Menu className="w-5 h-5" />
                    <span className="text-[10px] mt-0.5 font-medium">মেনু</span>
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
                <DialogContent className="bg-white max-w-sm rounded-2xl">
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
                                className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-500 block mb-1">মোবাইল নম্বর</label>
                            <input 
                                placeholder="মোবাইল নম্বর" 
                                value={trackMobile}
                                onChange={e => setTrackMobile(e.target.value)}
                                className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary"
                                required
                            />
                        </div>
                        <button type="submit" className="w-full h-10 bg-primary hover:bg-primary/95 text-white font-bold rounded-lg text-sm transition-colors">
                            ট্র্যাক করুন →
                        </button>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};
