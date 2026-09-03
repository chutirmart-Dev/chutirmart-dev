import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Phone, Mail, MapPin, Facebook, MessageCircle, ArrowRight, Instagram, Twitter } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const Footer: React.FC = () => {
    const { store_settings } = usePage().props as any;
    
    const phone = store_settings?.contact_phone || '০১৭০০-০০০০০০';
    const email = store_settings?.contact_email || 'info@chutirmart.com';
    const address = store_settings?.contact_address || 'ঢাকা, বাংলাদেশ';
    const whatsapp = store_settings?.whatsapp_number || '8801700000000';
    const facebook = store_settings?.social_facebook || 'https://facebook.com/chutirmart';
    const aboutText = store_settings?.footer_about || 'ছুটির মার্ট একটি বিশ্বস্ত বাংলাদেশী অনলাইন শপ যেখানে ট্রেন্ডিং ও মানসম্পন্ন পণ্য পাওয়া যায়।';

    return (
        <footer className="bg-white text-gray-700 pt-12 pb-20 md:pb-12 border-t border-gray-200">
            {/* Desktop grid layout — 4 equal columns filling full width */}
            <div className="container hidden md:grid grid-cols-4 gap-0 divide-x divide-gray-100">
                {/* Col 1: Logo & About */}
                <div className="space-y-4 pr-8">
                    <Link href={route('home')} className="flex items-start shrink-0 select-none no-underline">
                        {store_settings?.site_logo ? (
                            <img 
                                src={store_settings.site_logo} 
                                alt={store_settings.site_name || "ChutirMart"} 
                                className="h-10 md:h-12 w-auto object-contain" 
                            />
                        ) : (
                            <div className="flex flex-col items-start leading-none gap-0.5">
                                <div className="text-xl md:text-2xl font-black tracking-tight flex items-center">
                                    <span className="text-primary font-bangla">ছুটির</span>
                                    <span className="text-destructive font-bangla">মার্ট</span>
                                </div>
                                <span className="text-[10px] md:text-xs font-bold text-gray-400 tracking-wider font-latin">chutirmart</span>
                            </div>
                        )}
                    </Link>
                    <p className="text-sm text-gray-500 leading-relaxed font-bangla">
                        {aboutText}
                    </p>

                    {/* Contact details inline */}
                    <ul className="space-y-2.5 text-sm text-gray-500">
                        <li className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-[#009E49] shrink-0" />
                            <span className="font-bangla">{address}</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-[#009E49] shrink-0" />
                            <span>{phone}</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-[#009E49] shrink-0" />
                            <span>{email}</span>
                        </li>
                    </ul>

                    {/* Social Icons */}
                    <div className="flex gap-3 pt-1">
                        <a href={facebook} target="_blank" rel="noopener noreferrer"
                            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-[#009E49] flex items-center justify-center transition-colors group">
                            <Facebook className="w-4.5 h-4.5 text-gray-500 group-hover:text-white transition-colors" />
                        </a>
                        <a href="#" className="w-9 h-9 rounded-full bg-gray-100 hover:bg-[#009E49] flex items-center justify-center transition-colors group">
                            <Twitter className="w-4.5 h-4.5 text-gray-500 group-hover:text-white transition-colors" />
                        </a>
                        <a href="#" className="w-9 h-9 rounded-full bg-gray-100 hover:bg-[#009E49] flex items-center justify-center transition-colors group">
                            <Instagram className="w-4.5 h-4.5 text-gray-500 group-hover:text-white transition-colors" />
                        </a>
                        <a
                            href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 rounded-full bg-gray-100 hover:bg-[#25D366] flex items-center justify-center transition-colors group"
                        >
                            <MessageCircle className="w-4.5 h-4.5 text-gray-500 group-hover:text-white transition-colors" />
                        </a>
                    </div>
                </div>

                {/* Col 2: Useful Links */}
                <div className="space-y-4 px-8">
                    <h4 className="text-base font-black text-gray-800 tracking-wide">Useful Links</h4>
                    <div className="w-8 h-0.5 bg-[#009E49] rounded-full mb-3" />
                    <ul className="space-y-3 text-sm text-gray-500 font-bangla">
                        {[
                            { href: route('about'), label: 'আমাদের সম্পর্কে' },
                            { href: route('shop'), label: 'সকল পণ্য' },
                            { href: route('terms'), label: 'শর্তাবলী ও নিয়মনীতি' },
                            { href: route('terms'), label: 'রিটার্ন পলিসি' },
                            { href: route('terms'), label: 'প্রাইভেসি পলিসি' },
                        ].map(link => (
                            <li key={link.label}>
                                <Link href={link.href}
                                    className="hover:text-[#009E49] transition-colors flex items-center gap-1.5 group">
                                    <ArrowRight className="w-3 h-3 text-[#009E49] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Col 3: Shop By Category */}
                <div className="space-y-4 px-8">
                    <h4 className="text-base font-black text-gray-800 tracking-wide">Shop By</h4>
                    <div className="w-8 h-0.5 bg-[#009E49] rounded-full mb-3" />
                    <ul className="space-y-3 text-sm text-gray-500 font-bangla">
                        {[
                            { href: route('shop'), label: 'নতুন পণ্য' },
                            { href: route('shop'), label: 'অফার পণ্য' },
                            { href: route('shop'), label: 'বেস্ট সেলার' },
                            { href: route('shop'), label: 'ফিচার পণ্য' },
                        ].map(link => (
                            <li key={link.label}>
                                <Link href={link.href}
                                    className="hover:text-[#009E49] transition-colors flex items-center gap-1.5 group">
                                    <ArrowRight className="w-3 h-3 text-[#009E49] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Col 4: Customer Support */}
                <div className="space-y-4 px-8">
                    <h4 className="text-base font-black text-gray-800 tracking-wide">Support</h4>
                    <div className="w-8 h-0.5 bg-[#009E49] rounded-full mb-3" />
                    <ul className="space-y-3 text-sm text-gray-500 font-bangla">
                        {[
                            { href: route('terms'), label: 'অর্ডার ট্র্যাকিং' },
                            { href: route('terms'), label: 'কিভাবে অর্ডার করবেন' },
                            { href: route('terms'), label: 'পেমেন্ট পদ্ধতি' },
                            { href: route('terms'), label: 'ডেলিভারি তথ্য' },
                            { href: route('terms'), label: 'FAQ' },
                        ].map(link => (
                            <li key={link.label}>
                                <Link href={link.href}
                                    className="hover:text-[#009E49] transition-colors flex items-center gap-1.5 group">
                                    <ArrowRight className="w-3 h-3 text-[#009E49] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Mobile Accordion Layout */}
            <div className="container md:hidden px-4">
                {/* Mobile logo */}
                <div className="mb-5">
                    <Link href={route('home')} className="flex items-start shrink-0 select-none no-underline">
                        {store_settings?.site_logo ? (
                            <img src={store_settings.site_logo} alt={store_settings.site_name || "ChutirMart"} className="h-10 w-auto object-contain" />
                        ) : (
                            <div className="flex flex-col items-start leading-none gap-0.5">
                                <div className="text-xl font-black tracking-tight flex items-center">
                                    <span className="text-primary font-bangla">ছুটির</span>
                                    <span className="text-destructive font-bangla">মার্ট</span>
                                </div>
                            </div>
                        )}
                    </Link>
                </div>

                <Accordion className="w-full">
                    <AccordionItem value="about" className="border-gray-200">
                        <AccordionTrigger className="text-xs font-bold text-gray-700">আমাদের সম্পর্কে</AccordionTrigger>
                        <AccordionContent className="text-xs text-gray-500 leading-relaxed font-bangla">
                            {aboutText}
                        </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="contact" className="border-gray-200">
                        <AccordionTrigger className="text-xs font-bold text-gray-700">যোগাযোগ</AccordionTrigger>
                        <AccordionContent className="space-y-2 text-xs text-gray-500">
                            <p className="flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5 text-primary" /> {phone}
                            </p>
                            <p className="flex items-center gap-2">
                                <Mail className="w-3.5 h-3.5 text-primary" /> {email}
                            </p>
                            <p className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-primary" /> <span className="font-bangla">{address}</span>
                            </p>
                        </AccordionContent>
                    </AccordionItem>
 
                    <AccordionItem value="links" className="border-gray-200">
                        <AccordionTrigger className="text-xs font-bold text-gray-700">পলিসি ও লিংক</AccordionTrigger>
                        <AccordionContent className="space-y-2 text-xs text-gray-500 font-bangla">
                            <Link href={route('about')} className="block hover:text-primary">আমাদের সম্পর্কে</Link>
                            <Link href={route('terms')} className="block hover:text-primary">শর্তাবলী ও নিয়মনীতি</Link>
                            <Link href={route('terms')} className="block hover:text-primary">রিটার্ন পলিসি</Link>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
 
                <div className="pt-5 flex items-center gap-3">
                    <a href={facebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <Facebook className="w-4 h-4 text-gray-500" />
                    </a>
                    <a href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-xl text-xs font-bold font-latin">
                        <MessageCircle className="w-3.5 h-3.5 fill-white" />
                        WhatsApp
                    </a>
                </div>
            </div>

            {/* Bottom copyright bar */}
            <div className="container mt-8 pt-4 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-gray-400">
                <span>© {new Date().getFullYear()} ChutirMart. সর্বস্বত্ব সংরক্ষিত।</span>
                <span className="font-latin">Designed with ❤️ in Bangladesh</span>
            </div>
        </footer>
    );
};
