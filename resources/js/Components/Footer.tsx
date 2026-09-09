import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Phone, Mail, MapPin, Facebook, MessageCircle, ArrowRight, Instagram, Twitter } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const Footer: React.FC = () => {
    const { store_settings } = usePage().props as any;
    
    const phone = store_settings?.contact_phone || '০১৭০৫-১০৫৮৮৯';
    const email = store_settings?.contact_email || 'info@chutirmart.com';
    const address = store_settings?.contact_address || 'ঢাকা, বাংলাদেশ';
    const whatsapp = store_settings?.whatsapp_number || '8801705105889';
    const facebook = store_settings?.social_facebook || 'https://facebook.com/chutirmart';
    const aboutText = store_settings?.footer_about || 'ছুটির মার্ট একটি বিশ্বস্ত বাংলাদেশী অনলাইন শপ যেখানে নিত্যদিনের সেরা ট্রেন্ডিং ও মানসম্পন্ন পণ্য সবচেয়ে সুলভ মূল্যে পাওয়া যায়।';

    return (
        <footer className="bg-white text-gray-800 pt-10 sm:pt-14 pb-24 md:pb-12 border-t border-gray-200/90 shadow-[0_-2px_15px_rgba(0,0,0,0.03)]">
            {/* Desktop Grid Layout — Balanced 12-column layout justified edge-to-edge */}
            <div className="container hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-start">
                {/* Col 1: Brand Logo, About & Contact Info (Span 4) */}
                <div className="lg:col-span-4 space-y-4.5">
                    <Link href={route('home')} className="flex items-start shrink-0 select-none no-underline">
                        {store_settings?.site_logo ? (
                            <img 
                                src={store_settings.site_logo} 
                                alt={store_settings.site_name || "ChutirMart"} 
                                className="h-10 md:h-12 w-auto object-contain" 
                                onError={e => {
                                    (e.target as HTMLImageElement).src = '/storage/defaults/default-logo.svg';
                                }}
                            />
                        ) : (
                            <div className="flex flex-col items-start leading-none gap-0.5">
                                <div className="text-xl md:text-2xl font-black tracking-tight flex items-center">
                                    <span className="text-[#009E49] font-bangla">ছুটির</span>
                                    <span className="text-[#E2231A] font-bangla">মার্ট</span>
                                </div>
                                <span className="text-[10px] md:text-xs font-bold text-gray-400 tracking-wider font-latin">chutirmart</span>
                            </div>
                        )}
                    </Link>

                    <p className="text-sm sm:text-[15px] text-gray-600 leading-relaxed font-bangla pr-2">
                        {aboutText}
                    </p>

                    {/* Contact Details with Modern Icons */}
                    <ul className="space-y-3 pt-1 text-sm sm:text-[15px] text-gray-700">
                        <li className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100/70 text-[#009E49] flex items-center justify-center shrink-0 mt-0.5">
                                <MapPin className="w-4 h-4" />
                            </div>
                            <span className="font-bangla leading-snug pt-1">{address}</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100/70 text-[#009E49] flex items-center justify-center shrink-0">
                                <Phone className="w-4 h-4" />
                            </div>
                            <a href={`tel:${phone}`} className="font-latin font-bold hover:text-[#009E49] transition-colors">
                                {phone}
                            </a>
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100/70 text-[#009E49] flex items-center justify-center shrink-0">
                                <Mail className="w-4 h-4" />
                            </div>
                            <a href={`mailto:${email}`} className="font-latin font-medium hover:text-[#009E49] transition-colors">
                                {email}
                            </a>
                        </li>
                    </ul>

                    {/* Social Media Buttons */}
                    <div className="flex items-center gap-2.5 pt-2">
                        <a 
                            href={facebook} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            aria-label="Facebook"
                            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-[#1877F2] text-gray-600 hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-105 active:scale-95"
                        >
                            <Facebook className="w-4.5 h-4.5" />
                        </a>
                        <a 
                            href="#" 
                            aria-label="Twitter"
                            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-[#1DA1F2] text-gray-600 hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-105 active:scale-95"
                        >
                            <Twitter className="w-4.5 h-4.5" />
                        </a>
                        <a 
                            href="#" 
                            aria-label="Instagram"
                            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gradient-to-tr hover:from-[#F58529] hover:via-[#DD2A7B] hover:to-[#8134AF] text-gray-600 hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-105 active:scale-95"
                        >
                            <Instagram className="w-4.5 h-4.5" />
                        </a>
                        <a
                            href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="WhatsApp"
                            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-[#25D366] text-gray-600 hover:text-white flex items-center justify-center transition-all duration-200 shadow-2xs hover:scale-105 active:scale-95"
                        >
                            <MessageCircle className="w-4.5 h-4.5" />
                        </a>
                    </div>
                </div>

                {/* Col 2: Useful Links (Span 3) */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-4.5 bg-[#009E49] rounded-full" />
                        <h4 className="text-base sm:text-lg font-extrabold text-gray-900 tracking-tight font-latin">
                            Useful Links
                        </h4>
                    </div>
                    <ul className="space-y-3 font-bangla">
                        {[
                            { href: route('about'), label: 'আমাদের সম্পর্কে' },
                            { href: route('shop'), label: 'সকল পণ্য' },
                            { href: route('terms'), label: 'শর্তাবলী ও নিয়মনীতি' },
                            { href: route('terms'), label: 'রিটার্ন পলিসি' },
                            { href: route('terms'), label: 'প্রাইভেসি পলিসি' },
                        ].map(link => (
                            <li key={link.label}>
                                <Link 
                                    href={link.href}
                                    className="text-sm sm:text-[15px] font-semibold text-gray-600 hover:text-[#009E49] hover:translate-x-1.5 transition-all inline-flex items-center gap-2 group py-0.5"
                                >
                                    <ArrowRight className="w-3.5 h-3.5 text-[#009E49] shrink-0 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all stroke-[2.5]" />
                                    <span>{link.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Col 3: Shop By (Span 2) */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-4.5 bg-[#009E49] rounded-full" />
                        <h4 className="text-base sm:text-lg font-extrabold text-gray-900 tracking-tight font-latin">
                            Shop By
                        </h4>
                    </div>
                    <ul className="space-y-3 font-bangla">
                        {[
                            { href: route('shop'), label: 'নতুন পণ্য' },
                            { href: route('shop', { category: 'offer-products' }), label: 'অফার পণ্য' },
                            { href: route('shop'), label: 'বেস্ট সেলার' },
                            { href: route('shop', { category: 'featured-products' }), label: 'ফিচার পণ্য' },
                        ].map(link => (
                            <li key={link.label}>
                                <Link 
                                    href={link.href}
                                    className="text-sm sm:text-[15px] font-semibold text-gray-600 hover:text-[#009E49] hover:translate-x-1.5 transition-all inline-flex items-center gap-2 group py-0.5"
                                >
                                    <ArrowRight className="w-3.5 h-3.5 text-[#009E49] shrink-0 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all stroke-[2.5]" />
                                    <span>{link.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Col 4: Support & Order Help (Span 3) */}
                <div className="lg:col-span-3 space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-4.5 bg-[#009E49] rounded-full" />
                        <h4 className="text-base sm:text-lg font-extrabold text-gray-900 tracking-tight font-latin">
                            Support
                        </h4>
                    </div>
                    <ul className="space-y-3 font-bangla">
                        {[
                            { href: route('terms'), label: 'অর্ডার ট্র্যাকিং' },
                            { href: route('terms'), label: 'কিভাবে অর্ডার করবেন' },
                            { href: route('terms'), label: 'পেমেন্ট পদ্ধতি' },
                            { href: route('terms'), label: 'ডেলিভারি তথ্য' },
                            { href: route('terms'), label: 'FAQ / সাধারণ জিজ্ঞাসা' },
                        ].map(link => (
                            <li key={link.label}>
                                <Link 
                                    href={link.href}
                                    className="text-sm sm:text-[15px] font-semibold text-gray-600 hover:text-[#009E49] hover:translate-x-1.5 transition-all inline-flex items-center gap-2 group py-0.5"
                                >
                                    <ArrowRight className="w-3.5 h-3.5 text-[#009E49] shrink-0 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all stroke-[2.5]" />
                                    <span>{link.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Mobile View with Enhanced Accordion */}
            <div className="container md:hidden px-4 space-y-4">
                {/* Mobile Logo & Tagline */}
                <div>
                    <Link href={route('home')} className="flex items-start shrink-0 select-none no-underline">
                        {store_settings?.site_logo ? (
                            <img 
                                src={store_settings.site_logo} 
                                alt={store_settings.site_name || "ChutirMart"} 
                                className="h-10 w-auto object-contain" 
                                onError={e => {
                                    (e.target as HTMLImageElement).src = '/storage/defaults/default-logo.svg';
                                }}
                            />
                        ) : (
                            <div className="flex flex-col items-start leading-none gap-0.5">
                                <div className="text-xl font-black tracking-tight flex items-center">
                                    <span className="text-[#009E49] font-bangla">ছুটির</span>
                                    <span className="text-[#E2231A] font-bangla">মার্ট</span>
                                </div>
                            </div>
                        )}
                    </Link>
                    <p className="text-sm text-gray-600 font-bangla mt-2.5 leading-relaxed">
                        {aboutText}
                    </p>
                </div>

                <Accordion className="w-full">
                    <AccordionItem value="contact" className="border-gray-200">
                        <AccordionTrigger className="text-sm font-bold text-gray-800 hover:no-underline font-bangla">
                            যোগাযোগ ও ঠিকানা
                        </AccordionTrigger>
                        <AccordionContent className="space-y-3 text-sm text-gray-600 font-bangla pt-1">
                            <p className="flex items-start gap-2.5">
                                <MapPin className="w-4 h-4 text-[#009E49] shrink-0 mt-0.5" />
                                <span>{address}</span>
                            </p>
                            <p className="flex items-center gap-2.5">
                                <Phone className="w-4 h-4 text-[#009E49] shrink-0" />
                                <a href={`tel:${phone}`} className="font-latin font-bold text-gray-800">{phone}</a>
                            </p>
                            <p className="flex items-center gap-2.5">
                                <Mail className="w-4 h-4 text-[#009E49] shrink-0" />
                                <a href={`mailto:${email}`} className="font-latin text-gray-700">{email}</a>
                            </p>
                        </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="useful" className="border-gray-200">
                        <AccordionTrigger className="text-sm font-bold text-gray-800 hover:no-underline font-bangla">
                            প্রয়োজনীয় লিংক (Useful Links)
                        </AccordionTrigger>
                        <AccordionContent className="space-y-2.5 text-sm text-gray-700 font-bangla pt-1">
                            <Link href={route('about')} className="block py-1 hover:text-[#009E49]">আমাদের সম্পর্কে</Link>
                            <Link href={route('shop')} className="block py-1 hover:text-[#009E49]">সকল পণ্য</Link>
                            <Link href={route('terms')} className="block py-1 hover:text-[#009E49]">শর্তাবলী ও নিয়মনীতি</Link>
                            <Link href={route('terms')} className="block py-1 hover:text-[#009E49]">রিটার্ন পলিসি</Link>
                            <Link href={route('terms')} className="block py-1 hover:text-[#009E49]">প্রাইভেসি পলিসি</Link>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="support" className="border-gray-200">
                        <AccordionTrigger className="text-sm font-bold text-gray-800 hover:no-underline font-bangla">
                            কাস্টমার সাপোর্ট (Support)
                        </AccordionTrigger>
                        <AccordionContent className="space-y-2.5 text-sm text-gray-700 font-bangla pt-1">
                            <Link href={route('terms')} className="block py-1 hover:text-[#009E49]">অর্ডার ট্র্যাকিং</Link>
                            <Link href={route('terms')} className="block py-1 hover:text-[#009E49]">কিভাবে অর্ডার করবেন</Link>
                            <Link href={route('terms')} className="block py-1 hover:text-[#009E49]">পেমেন্ট পদ্ধতি</Link>
                            <Link href={route('terms')} className="block py-1 hover:text-[#009E49]">ডেলিভারি তথ্য</Link>
                            <Link href={route('terms')} className="block py-1 hover:text-[#009E49]">FAQ / সাধারণ জিজ্ঞাসা</Link>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

                {/* Mobile Social Buttons */}
                <div className="pt-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <a href={facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#1877F2] hover:text-white transition-colors">
                            <Facebook className="w-4 h-4" />
                        </a>
                        <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-pink-600 hover:text-white transition-colors">
                            <Instagram className="w-4 h-4" />
                        </a>
                    </div>
                    <a 
                        href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-xl text-xs font-bold font-latin shadow-sm active:scale-95 transition-transform"
                    >
                        <MessageCircle className="w-4 h-4 fill-white" />
                        WhatsApp Chat
                    </a>
                </div>
            </div>

            {/* Bottom Copyright Bar */}
            <div className="container mt-10 pt-5 border-t border-gray-200/90 flex flex-col md:flex-row items-center justify-between gap-2.5 text-xs sm:text-sm font-medium text-gray-500">
                <span className="font-bangla">© {new Date().getFullYear()} ChutirMart. সর্বস্বত্ব সংরক্ষিত।</span>
                <span className="font-latin flex items-center gap-1 text-gray-600">
                    Designed with <span className="text-[#E2231A]">❤️</span> in Bangladesh
                </span>
            </div>
        </footer>
    );
};
