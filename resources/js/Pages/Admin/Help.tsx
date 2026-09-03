import React from 'react';
import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { AdminCard, PageHeader } from '@/components/admin/ui';
import { 
    BookOpen, Package, ShoppingCart, HelpCircle, 
    Settings, MessageSquare, Plus, ArrowRight 
} from 'lucide-react';

export const Help: React.FC = () => {
    const guides = [
        {
            title: 'Order Management',
            icon: <ShoppingCart className="w-5 h-5 text-[#009E49]" />,
            description: 'Learn how to manage customer orders, track payments, print invoices, and update delivery statuses.',
            steps: [
                'Orders are received in "Processing" status.',
                'Use "On Hold" for custom queries or stock checks.',
                'Mark as "Complete" when delivered via courier.',
                'Always input accurate shipping charges.'
            ]
        },
        {
            title: 'Product Catalog',
            icon: <Package className="w-5 h-5 text-[#009E49]" />,
            description: 'Manage items, set prices, assign categories, tag attributes, and upload square 1:1 image thumbnails.',
            steps: [
                'Upload images with a strict 1:1 square ratio.',
                'Create Categories, Brands, and Tags first.',
                'Assign Specifications inside Attributes panel.',
                'Use "Compare At Price" to show discount badges.'
            ]
        },
        {
            title: 'Store Settings & Customization',
            icon: <Settings className="w-5 h-5 text-[#009E49]" />,
            description: 'Update shop branding details, upload mobile/desktop logo files, adjust delivery fees, and configure policies.',
            steps: [
                'Set logos in "Logo Management" under Settings.',
                'Upload high-quality Home Slider Banners.',
                'Create high-converting landing pages for campaigns.',
                'Configure cash on delivery (COD) configurations.'
            ]
        },
        {
            title: 'Message Inbox',
            icon: <MessageSquare className="w-5 h-5 text-[#009E49]" />,
            description: 'Communicate with customers in real-time, view their active orders, and send quick replies.',
            steps: [
                'Active conversation displays online status.',
                'Quick replies help respond in one click.',
                'Order panel displays purchase history.',
                'Send product guidelines directly via chat.'
            ]
        }
    ];

    return (
        <AdminLayout>
            <Head title="Help Center" />

            <PageHeader 
                title="Help Center" 
                subtitle="Guidelines, reference documentation and operational helper guides for ChutirMart." 
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {guides.map((guide, idx) => (
                    <AdminCard key={idx} className="p-6 hover:shadow-[0_10px_30px_rgba(0,158,73,0.06)] transition-all border border-[#E6F5EC]">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-[#E6F5EC] flex items-center justify-center">
                                {guide.icon}
                            </div>
                            <h3 className="text-sm font-black text-[#1A1A2E]">{guide.title}</h3>
                        </div>
                        
                        <p className="text-xs text-gray-500 font-semibold mb-5 leading-relaxed">{guide.description}</p>
                        
                        <div className="space-y-2.5">
                            <h4 className="text-[10px] font-black text-[#C0C6D8] uppercase tracking-wider">Quick Steps</h4>
                            <ul className="space-y-2">
                                {guide.steps.map((step, sIdx) => (
                                    <li key={sIdx} className="flex items-start gap-2 text-xs font-semibold text-[#2D3048]">
                                        <ArrowRight className="w-3.5 h-3.5 text-[#E2231A] shrink-0 mt-0.5" />
                                        <span>{step}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </AdminCard>
                ))}
            </div>

            {/* Support section */}
            <AdminCard className="p-6 bg-gradient-to-br from-[#E6F5EC] to-[#FAFDFB] border border-[#E6F5EC] flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h3 className="text-sm font-black text-[#1A1A2E] mb-1">Need Urgent Technical Support?</h3>
                    <p className="text-xs text-gray-500 font-semibold">Our technical help desk is available 24/7 to solve server or operational issues.</p>
                </div>
                <div className="flex gap-2">
                    <a href="tel:01700000000" className="no-underline">
                        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#009E49] hover:bg-[#007F3B] text-white text-xs font-bold transition-all border-none shadow-sm cursor-pointer">
                            Call Support Desk
                        </button>
                    </a>
                </div>
            </AdminCard>
        </AdminLayout>
    );
};

export default Help;
