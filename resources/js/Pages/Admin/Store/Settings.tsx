import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { AdminCard, CardHead, PageHeader, SaveBtn, AdminInput, AdminTextarea, AdminSelect, FieldLabel } from '@/components/admin/ui';
import { Save, Settings as SettingsIcon, Image, CreditCard, AlignLeft } from 'lucide-react';
import { toast } from 'sonner';

interface SettingsProps {
    settings: Record<string, string>;
    preview_urls?: Record<string, string>;
}

export const Settings: React.FC<SettingsProps> = ({ settings, preview_urls }) => {
    const [activeTab, setActiveTab] = useState<'general' | 'logos' | 'payments' | 'footer'>('general');

    const getPreviewUrl = (value?: string, field?: string) => {
        if (!value) return '';
        if (value.startsWith('data:') || value.startsWith('blob:')) {
            return value;
        }
        if (field && preview_urls && preview_urls[field] && value === settings[field]) {
            return preview_urls[field];
        }
        if (value.startsWith('http://') || value.startsWith('https://')) {
            return value;
        }
        const clean = value.replace(/^\/+/, '');
        if (clean.startsWith('public/storage/')) {
            return `/${clean}`;
        }
        if (clean.startsWith('storage/')) {
            return `/${clean}`;
        }
        return `/storage/${clean}`;
    };

    const { data, setData, put, processing } = useForm({
        site_name: settings.site_name || 'ChutirMart',
        contact_phone: settings.contact_phone || '01700-000000',
        contact_email: settings.contact_email || 'info@chutirmart.com',
        contact_address: settings.contact_address || 'ঢাকা, বাংলাদেশ',
        whatsapp_number: settings.whatsapp_number || '8801700000000',
        social_facebook: settings.social_facebook || 'https://facebook.com/chutirmart',
        delivery_inside_dhaka: settings.delivery_inside_dhaka || '80',
        delivery_outside_dhaka: settings.delivery_outside_dhaka || '130',
        footer_about: settings.footer_about || '',
        terms_conditions: settings.terms_conditions || '',
        refund_policy: settings.refund_policy || '',
        payment_cod_enabled: settings.payment_cod_enabled || 'true',
        site_logo: settings.site_logo || '',
        favicon: settings.favicon || '',
        site_logo_mobile: settings.site_logo_mobile || '',
        copyright_text: settings.copyright_text || '© 2026 ChutirMart. সর্বস্বত্ব সংরক্ষিত।',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.settings.update'), {
            onSuccess: () => toast.success('Settings saved successfully! 🎉'),
            onError: () => toast.error('Failed to save settings.')
        });
    };

    return (
        <AdminLayout>
            <Head title="Store Settings" />
            
            <PageHeader title="Store Settings" subtitle="Configure store parameters, logos, fees and legal pages." />

            {/* Tab navigation card */}
            <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(91,79,233,0.06)] px-4 mb-6 overflow-x-auto scrollbar-hide">
                <div className="flex gap-1 min-w-max">
                    {[
                        { id: 'general', label: 'General Settings', icon: <SettingsIcon className="w-4 h-4" /> },
                        { id: 'logos', label: 'Logo Management', icon: <Image className="w-4 h-4" /> },
                        { id: 'payments', label: 'Payment Settings', icon: <CreditCard className="w-4 h-4" /> },
                        { id: 'footer', label: 'Footer & Policies', icon: <AlignLeft className="w-4 h-4" /> },
                    ].map(tab => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-4 py-4 text-[13px] font-bold whitespace-nowrap border-b-2 transition-all border-none bg-transparent cursor-pointer ${
                                    isActive
                                        ? 'border-[#009E49] text-[#009E49] border-b-2 border-solid'
                                        : 'border-transparent text-[#9096B0] hover:text-[#2D3048]'
                                }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {activeTab === 'general' && (
                    <div className="space-y-6">
                        <AdminCard className="p-6">
                            <h3 className="text-[14px] font-black text-[#1A1A2E] mb-5">General Info & Contacts</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <FieldLabel required>Store Name</FieldLabel>
                                    <AdminInput value={data.site_name} onChange={e => setData('site_name', e.target.value)} required />
                                </div>
                                <div>
                                    <FieldLabel required>Contact Phone</FieldLabel>
                                    <AdminInput value={data.contact_phone} onChange={e => setData('contact_phone', e.target.value)} required />
                                </div>
                                <div>
                                    <FieldLabel required>Contact Email</FieldLabel>
                                    <AdminInput type="email" value={data.contact_email} onChange={e => setData('contact_email', e.target.value)} required />
                                </div>
                                <div>
                                    <FieldLabel required>WhatsApp Number (With country code)</FieldLabel>
                                    <AdminInput placeholder="e.g. 8801700000000" value={data.whatsapp_number} onChange={e => setData('whatsapp_number', e.target.value)} required />
                                </div>
                            </div>
                        </AdminCard>

                        <AdminCard className="p-6">
                            <h3 className="text-[14px] font-black text-[#1A1A2E] mb-5">Delivery & Courier Charges (BDT)</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <FieldLabel required>Inside Dhaka Shipping Charge</FieldLabel>
                                    <AdminInput type="number" value={data.delivery_inside_dhaka} onChange={e => setData('delivery_inside_dhaka', e.target.value)} required />
                                </div>
                                <div>
                                    <FieldLabel required>Outside Dhaka Shipping Charge</FieldLabel>
                                    <AdminInput type="number" value={data.delivery_outside_dhaka} onChange={e => setData('delivery_outside_dhaka', e.target.value)} required />
                                </div>
                            </div>
                        </AdminCard>
                    </div>
                )}

                {activeTab === 'logos' && (
                    <AdminCard className="p-6">
                        <h3 className="text-[14px] font-black text-[#1A1A2E] mb-5">Logo & Favicon Customization</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Desktop Logo */}
                            <div className="space-y-3">
                                <FieldLabel>Desktop Main Logo</FieldLabel>
                                <div className="border border-dashed border-[#E6F5EC] rounded-2xl p-4 flex flex-col items-center justify-center bg-[#FAFDFB]">
                                    {data.site_logo ? (
                                        <div className="mb-3 h-20 w-full flex items-center justify-center p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                                            <img 
                                                src={getPreviewUrl(data.site_logo, 'site_logo')} 
                                                className="max-h-14 max-w-[200px] object-contain" 
                                                alt="Desktop Logo Preview"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    if (!target.dataset.triedFallback) {
                                                        target.dataset.triedFallback = '1';
                                                        target.src = `/storage/${data.site_logo.replace(/^\/+/, '')}`;
                                                    }
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-20 w-full rounded-xl bg-[#FAFDFB] border border-[#E6F5EC] flex items-center justify-center text-[#9096B0] mb-3 text-xs font-bold">
                                            No Logo
                                        </div>
                                    )}
                                    <label className="px-4 py-2 rounded-xl bg-white border border-[#E6F5EC] text-xs font-bold text-[#009E49] hover:bg-[#E6F5EC] cursor-pointer transition-all shadow-2xs">
                                        Upload Desktop Logo
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            className="hidden" 
                                            onChange={e => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => setData('site_logo', reader.result as string);
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                                <AdminInput placeholder="Or enter logo URL path" value={data.site_logo} onChange={e => setData('site_logo', e.target.value)} />
                            </div>

                            {/* Mobile Logo */}
                            <div className="space-y-3">
                                <FieldLabel>Mobile Main Logo</FieldLabel>
                                <div className="border border-dashed border-[#E6F5EC] rounded-2xl p-4 flex flex-col items-center justify-center bg-[#FAFDFB]">
                                    {data.site_logo_mobile ? (
                                        <div className="mb-3 h-20 w-full flex items-center justify-center p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                                            <img 
                                                src={getPreviewUrl(data.site_logo_mobile, 'site_logo_mobile')} 
                                                className="max-h-14 max-w-[200px] object-contain" 
                                                alt="Mobile Logo Preview"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    if (!target.dataset.triedFallback) {
                                                        target.dataset.triedFallback = '1';
                                                        target.src = `/storage/${data.site_logo_mobile.replace(/^\/+/, '')}`;
                                                    }
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-20 w-full rounded-xl bg-[#FAFDFB] border border-[#E6F5EC] flex items-center justify-center text-[#9096B0] mb-3 text-xs font-bold">
                                            No Logo
                                        </div>
                                    )}
                                    <label className="px-4 py-2 rounded-xl bg-white border border-[#E6F5EC] text-xs font-bold text-[#009E49] hover:bg-[#E6F5EC] cursor-pointer transition-all shadow-2xs">
                                        Upload Mobile Logo
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            className="hidden" 
                                            onChange={e => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => setData('site_logo_mobile', reader.result as string);
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                                <AdminInput placeholder="Or enter mobile logo URL path" value={data.site_logo_mobile} onChange={e => setData('site_logo_mobile', e.target.value)} />
                            </div>

                            {/* Favicon */}
                            <div className="space-y-3">
                                <FieldLabel>Favicon Icon</FieldLabel>
                                <div className="border border-dashed border-[#E6F5EC] rounded-2xl p-4 flex flex-col items-center justify-center bg-[#FAFDFB]">
                                    {data.favicon ? (
                                        <div className="mb-3 h-20 w-full flex items-center justify-center p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
                                            <img 
                                                src={getPreviewUrl(data.favicon, 'favicon')} 
                                                className="w-10 h-10 object-contain" 
                                                alt="Favicon Preview"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    if (!target.dataset.triedFallback) {
                                                        target.dataset.triedFallback = '1';
                                                        target.src = `/storage/${data.favicon.replace(/^\/+/, '')}`;
                                                    }
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-20 w-full rounded-xl bg-[#FAFDFB] border border-[#E6F5EC] flex items-center justify-center text-[#9096B0] mb-3 text-xs font-bold">
                                            No Icon
                                        </div>
                                    )}
                                    <label className="px-4 py-2 rounded-xl bg-white border border-[#E6F5EC] text-xs font-bold text-[#009E49] hover:bg-[#E6F5EC] cursor-pointer transition-all shadow-2xs">
                                        Upload Favicon File
                                        <input 
                                            type="file" 
                                            accept="image/*,image/x-icon,image/vnd.microsoft.icon" 
                                            className="hidden" 
                                            onChange={e => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => setData('favicon', reader.result as string);
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                                <AdminInput placeholder="Or enter favicon URL path" value={data.favicon} onChange={e => setData('favicon', e.target.value)} />
                            </div>
                        </div>
                    </AdminCard>
                )}

                {activeTab === 'payments' && (
                    <AdminCard className="p-6">
                        <h3 className="text-[14px] font-black text-[#1A1A2E] mb-5">Payment Method Settings</h3>
                        <div className="space-y-4">
                            <div>
                                <FieldLabel>Cash on Delivery (COD) Status</FieldLabel>
                                <AdminSelect value={data.payment_cod_enabled} onChange={e => setData('payment_cod_enabled', e.target.value)}>
                                    <option value="true">Enabled</option>
                                    <option value="false">Disabled</option>
                                </AdminSelect>
                            </div>
                            <div className="bg-[#E6F5EC] border border-[#E6F5EC] text-[#009E49] rounded-xl p-4 text-xs font-semibold leading-relaxed">
                                Note: Online payment gateway API credentials are managed securely via backend configuration parameters.
                            </div>
                        </div>
                    </AdminCard>
                )}

                {activeTab === 'footer' && (
                    <AdminCard className="p-6">
                        <h3 className="text-[14px] font-black text-[#1A1A2E] mb-5">Footer Configuration & Legal Policies</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <FieldLabel>Facebook Page URL</FieldLabel>
                                    <AdminInput type="url" placeholder="https://facebook.com/..." value={data.social_facebook} onChange={e => setData('social_facebook', e.target.value)} />
                                </div>
                                <div>
                                    <FieldLabel>Store Contact Address</FieldLabel>
                                    <AdminInput value={data.contact_address} onChange={e => setData('contact_address', e.target.value)} />
                                </div>
                                <div className="sm:col-span-2">
                                    <FieldLabel>Footer Copyright Text</FieldLabel>
                                    <AdminInput value={data.copyright_text} onChange={e => setData('copyright_text', e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <FieldLabel required>Footer About Us Intro Text</FieldLabel>
                                <AdminTextarea value={data.footer_about} onChange={e => setData('footer_about', e.target.value)} rows={3} required />
                            </div>
                            <div>
                                <FieldLabel>Terms & Conditions Page Content (HTML supported)</FieldLabel>
                                <AdminTextarea value={data.terms_conditions} onChange={e => setData('terms_conditions', e.target.value)} rows={5} />
                            </div>
                            <div>
                                <FieldLabel>Refund and Return Policy Content (HTML supported)</FieldLabel>
                                <AdminTextarea value={data.refund_policy} onChange={e => setData('refund_policy', e.target.value)} rows={5} />
                            </div>
                        </div>
                    </AdminCard>
                )}

                <div className="flex justify-end">
                    <SaveBtn type="submit" disabled={processing} className="px-8 py-3 text-sm">
                        <Save className="w-4.5 h-4.5" />
                        {processing ? 'Saving Settings...' : 'Save Settings'}
                    </SaveBtn>
                </div>
            </form>
        </AdminLayout>
    );
};

export default Settings;
