import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { AdminCard, PageHeader, SaveBtn, AdminInput, FieldLabel } from '@/components/admin/ui';
import { CourierSelect } from '@/components/admin/CourierSelect';
import { 
    Save, Facebook, Truck, MessageSquare, ShieldCheck, 
    CheckCircle2, AlertCircle, RefreshCw, Key, ExternalLink, 
    Zap, Sparkles, Building, Globe, Check, Layers
} from 'lucide-react';
import { toast, Toaster } from 'sonner';
import axios from 'axios';

interface IntegrationsProps {
    settings: Record<string, string>;
    couriers?: Array<{
        id: string;
        name: string;
        logo: string;
        description: string;
        is_enabled: boolean;
        is_default: boolean;
    }>;
}

export const Integrations: React.FC<IntegrationsProps> = ({ settings, couriers = [] }) => {
    const [activeCourierTab, setActiveCourierTab] = useState<string>('steadfast');
    const [testingCourier, setTestingCourier] = useState<string | null>(null);
    const [testResult, setTestResult] = useState<{ courier: string; success: boolean; message: string } | null>(null);
    const [isTestingCapi, setIsTestingCapi] = useState(false);
    const [capiTestResult, setCapiTestResult] = useState<{ success: boolean; message: string; fbtrace_id?: string } | null>(null);

    const { data, setData, put, processing } = useForm({
        // General settings
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
        
        // Meta & Tracking & SMS
        facebook_pixel_id: settings.facebook_pixel_id || '',
        facebook_access_token: settings.facebook_access_token || '',
        facebook_test_event_code: settings.facebook_test_event_code || '',
        facebook_purchase_trigger: settings.facebook_purchase_trigger || 'admin_confirmed',
        gtm_container_id: settings.gtm_container_id || '',
        sms_api_key: settings.sms_api_key || '',
        sms_sender_id: settings.sms_sender_id || '',

        // Courier default
        default_courier: settings.default_courier || 'steadfast',

        // Steadfast
        steadfast_api_key: settings.steadfast_api_key || '',
        steadfast_client_id: settings.steadfast_client_id || '',
        steadfast_base_url: settings.steadfast_base_url || 'https://portal.packzy.com/api/v1',
        steadfast_enabled: settings.steadfast_enabled || 'true',

        // Paperfly
        paperfly_username: settings.paperfly_username || '',
        paperfly_password: settings.paperfly_password || '',
        paperfly_key: settings.paperfly_key || '',
        paperfly_base_url: settings.paperfly_base_url || 'https://api.paperfly.com.bd',
        paperfly_enabled: settings.paperfly_enabled || 'false',

        // Carrybee
        carrybee_api_key: settings.carrybee_api_key || '',
        carrybee_secret_key: settings.carrybee_secret_key || '',
        carrybee_base_url: settings.carrybee_base_url || 'https://api.carrybee.com/api/v1',
        carrybee_enabled: settings.carrybee_enabled || 'false',

        // Pathao
        pathao_client_id: settings.pathao_client_id || '',
        pathao_client_secret: settings.pathao_client_secret || '',
        pathao_username: settings.pathao_username || '',
        pathao_password: settings.pathao_password || '',
        pathao_store_id: settings.pathao_store_id || '',
        pathao_base_url: settings.pathao_base_url || 'https://api-hermes.pathao.com',
        pathao_enabled: settings.pathao_enabled || 'false',

        // RedX
        redx_api_token: settings.redx_api_token || '',
        redx_base_url: settings.redx_base_url || 'https://openapi.redx.com.bd/v1.0.0-beta',
        redx_enabled: settings.redx_enabled || 'false',

        // Custom Courier
        custom_courier_name: settings.custom_courier_name || 'SA Paribahan / Sundarban',
        custom_courier_tracking_url: settings.custom_courier_tracking_url || '',
        custom_courier_enabled: settings.custom_courier_enabled || 'true',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.settings.update'), {
            onSuccess: () => toast.success('Integrations updated successfully! 🎉'),
            onError: () => toast.error('Failed to save integration settings.')
        });
    };

    const handleTestMetaCapi = async () => {
        if (!data.facebook_pixel_id || !data.facebook_access_token) {
            toast.error('প্রথমে Facebook Pixel ID এবং Conversions API Access Token ইনপুট করুন।');
            return;
        }
        setIsTestingCapi(true);
        setCapiTestResult(null);
        try {
            const res = await axios.post(route('admin.integrations.test-meta-capi'), {
                pixel_id: data.facebook_pixel_id,
                access_token: data.facebook_access_token,
                test_event_code: data.facebook_test_event_code,
            });
            setCapiTestResult(res.data);
            if (res.data.success) {
                toast.success(res.data.message || 'Meta CAPI সফলভাবে সংযুক্ত হয়েছে! 🎉');
            } else {
                toast.error(res.data.message || 'Meta CAPI কানেকশন এরর');
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || 'কানেকশন টেস্টে ত্রুটি ঘটেছে';
            setCapiTestResult({ success: false, message: msg });
            toast.error(msg);
        } finally {
            setIsTestingCapi(false);
        }
    };

    const handleTestConnection = async (courierId: string) => {
        setTestingCourier(courierId);
        setTestResult(null);

        try {
            const csrfToken = (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';
            const res = await fetch(route('admin.courier.test-connection'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ courier: courierId })
            });
            const data = await res.json();
            
            setTestResult({
                courier: courierId,
                success: data.success,
                message: data.message || (data.success ? 'Connection Successful!' : 'Connection Failed')
            });

            if (data.success) {
                toast.success(data.message || 'Connection verified!');
            } else {
                toast.error(data.message || 'Connection test failed.');
            }
        } catch (err: any) {
            setTestResult({
                courier: courierId,
                success: false,
                message: err.message || 'Failed to connect.'
            });
            toast.error('Network error testing connection.');
        } finally {
            setTestingCourier(null);
        }
    };

    const courierList = [
        { id: 'steadfast', name: 'Steadfast Courier', desc: 'Auto booking across all 64 districts in Bangladesh.' },
        { id: 'paperfly', name: 'Paperfly Courier', desc: 'Wings API integration with doorstep parcel tracking.' },
        { id: 'carrybee', name: 'Carrybee Courier', desc: 'Fast digital dispatch and instant consignment tracking.' },
        { id: 'pathao', name: 'Pathao Courier', desc: 'Aladdin API with OAuth token & auto delivery fee syncing.' },
        { id: 'redx', name: 'RedX Courier', desc: 'Doorstep pickup & enterprise logistics API.' },
        { id: 'custom', name: 'Custom / In-House Courier', desc: 'Manual or custom delivery service with custom tracking URL.' },
    ];

    return (
        <AdminLayout>
            <Toaster position="top-center" richColors />
            <Head title="Integrations & Courier APIs | ChutirMart" />

            <PageHeader 
                title="Integrations & Courier API Channels" 
                subtitle="Configure and automate parcel bookings with Steadfast, Paperfly, Carrybee, Pathao, RedX, and custom courier networks." 
            />

            <form onSubmit={handleSubmit} className="space-y-8 pb-12">
                
                {/* ─────────────────────────────────────────────────────────────
                 * COURIER INTEGRATIONS HUB
                 * ───────────────────────────────────────────────────────────── */}
                <AdminCard className="p-6 border-2 border-emerald-500/20 bg-gradient-to-b from-white to-[#F9FDFB]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#E6F5EC]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-[#009E49] text-white flex items-center justify-center shadow-md">
                                <Truck className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-[#1A1A2E]">Universal Courier Integration Hub</h3>
                                <p className="text-xs text-gray-400 font-semibold">1-Click parcel booking, automatic consignment generation, and real-time status tracking.</p>
                            </div>
                        </div>

                        {/* Modern Branded Default Courier Partner Selector */}
                        <CourierSelect
                            value={data.default_courier}
                            onChange={val => {
                                setData('default_courier', val);
                                setActiveCourierTab(val);
                            }}
                            label="Default Courier:"
                        />
                    </div>

                    {/* Courier Tabs Navigation */}
                    <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-100">
                        {courierList.map(c => (
                            <button
                                key={c.id}
                                type="button"
                                onClick={() => setActiveCourierTab(c.id)}
                                className={`px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-2 border-none cursor-pointer ${
                                    activeCourierTab === c.id 
                                        ? 'bg-[#009E49] text-white shadow-sm' 
                                        : 'bg-gray-100/80 hover:bg-gray-200/80 text-gray-600'
                                }`}
                            >
                                <span>{c.name}</span>
                                {data.default_courier === c.id && (
                                    <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${
                                        activeCourierTab === c.id ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                                    }`}>
                                        DEFAULT
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* ── Tab 1: Steadfast Courier ── */}
                    {activeCourierTab === 'steadfast' && (
                        <div className="mt-6 space-y-4 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                                <div>
                                    <h4 className="text-xs font-black text-emerald-900">Steadfast Courier Partner (Packzy)</h4>
                                    <p className="text-[11px] text-emerald-700 mt-0.5">
                                        ✅ Official API Endpoint: <code className="bg-emerald-100 px-1 py-0.5 rounded text-[10px]">https://portal.packzy.com/api/v1</code>
                                    </p>
                                    <p className="text-[10px] text-gray-500 mt-1">
                                        API Key ও Secret Key পেতে: portal.packzy.com → Developer / API Settings
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleTestConnection('steadfast')}
                                        disabled={testingCourier === 'steadfast'}
                                        className="px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold transition-colors flex items-center gap-1.5 border-none cursor-pointer"
                                    >
                                        <RefreshCw className={`w-3.5 h-3.5 ${testingCourier === 'steadfast' ? 'animate-spin' : ''}`} />
                                        <span>{testingCourier === 'steadfast' ? 'Testing...' : 'Check Balance / Test'}</span>
                                    </button>
                                </div>
                            </div>

                            {testResult && testResult.courier === 'steadfast' && (
                                <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                                    testResult.success ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    {testResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                    <span>{testResult.message}</span>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <FieldLabel>API Key (Api-Key header) <span className="text-red-500">*</span></FieldLabel>
                                    <AdminInput 
                                        type="password"
                                        placeholder="Steadfast API Key" 
                                        value={data.steadfast_api_key} 
                                        onChange={e => setData('steadfast_api_key', e.target.value)} 
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">portal.packzy.com এ লগইন করে API Key কপি করুন।</p>
                                </div>
                                <div>
                                    <FieldLabel>Secret Key (Secret-Key header) <span className="text-red-500">*</span></FieldLabel>
                                    <AdminInput 
                                        type="password"
                                        placeholder="Steadfast Secret Key" 
                                        value={data.steadfast_client_id} 
                                        onChange={e => setData('steadfast_client_id', e.target.value)} 
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">API Key এর পাশে Secret Key পাবেন।</p>
                                </div>
                            </div>

                            {/* What happens when you click Send */}
                            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-[10px] text-gray-500">
                                <p className="font-bold text-gray-700 mb-1">📦 কীভাবে কাজ করে:</p>
                                <ul className="space-y-0.5 list-disc list-inside">
                                    <li>Admin → Orders পেজে প্রতিটি অর্ডারে কুরিয়ার ড্রপডাউন থেকে <strong>Steadfast</strong> সিলেক্ট করে <strong>Send</strong> ক্লিক করুন।</li>
                                    <li>অর্ডারের তথ্য (নাম, ফোন, ঠিকানা, COD amount) সরাসরি Steadfast API-তে পাঠানো হবে।</li>
                                    <li>Consignment ID এবং Tracking Code অটোমেটিক সেভ হবে।</li>
                                    <li>Delivery Status <strong>Refresh</strong> বাটনে ক্লিক করে আপডেট করুন।</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* ── Tab 2: Paperfly Courier ── */}
                    {activeCourierTab === 'paperfly' && (
                        <div className="mt-6 space-y-4 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                                <div>
                                    <h4 className="text-xs font-black text-gray-900">Paperfly Wings Logistics</h4>
                                    <p className="text-[11px] text-gray-500">API Endpoint: https://api.paperfly.com.bd</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleTestConnection('paperfly')}
                                    disabled={testingCourier === 'paperfly'}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold transition-colors flex items-center gap-1.5 border-none cursor-pointer"
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 ${testingCourier === 'paperfly' ? 'animate-spin' : ''}`} />
                                    <span>{testingCourier === 'paperfly' ? 'Testing...' : 'Test Connection'}</span>
                                </button>
                            </div>

                            {testResult && testResult.courier === 'paperfly' && (
                                <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                                    testResult.success ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    {testResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                    <span>{testResult.message}</span>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <FieldLabel>Paperfly Username <span className="text-red-500">*</span></FieldLabel>
                                    <AdminInput 
                                        placeholder="Username" 
                                        value={data.paperfly_username} 
                                        onChange={e => setData('paperfly_username', e.target.value)} 
                                    />
                                </div>
                                <div>
                                    <FieldLabel>Paperfly Password <span className="text-red-500">*</span></FieldLabel>
                                    <AdminInput 
                                        type="password"
                                        placeholder="Password" 
                                        value={data.paperfly_password} 
                                        onChange={e => setData('paperfly_password', e.target.value)} 
                                    />
                                </div>
                                <div>
                                    <FieldLabel>Paperfly Key <span className="text-red-500">*</span></FieldLabel>
                                    <AdminInput 
                                        type="password"
                                        placeholder="Paperfly API Key" 
                                        value={data.paperfly_key} 
                                        onChange={e => setData('paperfly_key', e.target.value)} 
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Tab 3: Carrybee Courier ── */}
                    {activeCourierTab === 'carrybee' && (
                        <div className="mt-6 space-y-4 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                                <div>
                                    <h4 className="text-xs font-black text-gray-900">Carrybee Delivery Network</h4>
                                    <p className="text-[11px] text-gray-500">API Endpoint: https://api.carrybee.com/api/v1</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleTestConnection('carrybee')}
                                    disabled={testingCourier === 'carrybee'}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold transition-colors flex items-center gap-1.5 border-none cursor-pointer"
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 ${testingCourier === 'carrybee' ? 'animate-spin' : ''}`} />
                                    <span>{testingCourier === 'carrybee' ? 'Testing...' : 'Test Connection'}</span>
                                </button>
                            </div>

                            {testResult && testResult.courier === 'carrybee' && (
                                <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                                    testResult.success ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    {testResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                    <span>{testResult.message}</span>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <FieldLabel>Carrybee API Key <span className="text-red-500">*</span></FieldLabel>
                                    <AdminInput 
                                        type="password"
                                        placeholder="API Key" 
                                        value={data.carrybee_api_key} 
                                        onChange={e => setData('carrybee_api_key', e.target.value)} 
                                    />
                                </div>
                                <div>
                                    <FieldLabel>Carrybee Secret Token</FieldLabel>
                                    <AdminInput 
                                        type="password"
                                        placeholder="Secret Token" 
                                        value={data.carrybee_secret_key} 
                                        onChange={e => setData('carrybee_secret_key', e.target.value)} 
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Tab 4: Pathao Courier ── */}
                    {activeCourierTab === 'pathao' && (
                        <div className="mt-6 space-y-4 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                                <div>
                                    <h4 className="text-xs font-black text-gray-900">Pathao Courier Aladdin API</h4>
                                    <p className="text-[11px] text-gray-500">API Endpoint: https://api-hermes.pathao.com</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleTestConnection('pathao')}
                                    disabled={testingCourier === 'pathao'}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold transition-colors flex items-center gap-1.5 border-none cursor-pointer"
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 ${testingCourier === 'pathao' ? 'animate-spin' : ''}`} />
                                    <span>{testingCourier === 'pathao' ? 'Testing...' : 'Test Token'}</span>
                                </button>
                            </div>

                            {testResult && testResult.courier === 'pathao' && (
                                <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                                    testResult.success ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    {testResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                    <span>{testResult.message}</span>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <FieldLabel>Client ID <span className="text-red-500">*</span></FieldLabel>
                                    <AdminInput 
                                        placeholder="Pathao Client ID" 
                                        value={data.pathao_client_id} 
                                        onChange={e => setData('pathao_client_id', e.target.value)} 
                                    />
                                </div>
                                <div>
                                    <FieldLabel>Client Secret <span className="text-red-500">*</span></FieldLabel>
                                    <AdminInput 
                                        type="password"
                                        placeholder="Pathao Client Secret" 
                                        value={data.pathao_client_secret} 
                                        onChange={e => setData('pathao_client_secret', e.target.value)} 
                                    />
                                </div>
                                <div>
                                    <FieldLabel>Store ID</FieldLabel>
                                    <AdminInput 
                                        placeholder="e.g. 12345" 
                                        value={data.pathao_store_id} 
                                        onChange={e => setData('pathao_store_id', e.target.value)} 
                                    />
                                </div>
                                <div>
                                    <FieldLabel>Account Username / Email <span className="text-red-500">*</span></FieldLabel>
                                    <AdminInput 
                                        placeholder="user@example.com" 
                                        value={data.pathao_username} 
                                        onChange={e => setData('pathao_username', e.target.value)} 
                                    />
                                </div>
                                <div>
                                    <FieldLabel>Account Password <span className="text-red-500">*</span></FieldLabel>
                                    <AdminInput 
                                        type="password"
                                        placeholder="Account Password" 
                                        value={data.pathao_password} 
                                        onChange={e => setData('pathao_password', e.target.value)} 
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Tab 5: RedX Courier ── */}
                    {activeCourierTab === 'redx' && (
                        <div className="mt-6 space-y-4 animate-in fade-in duration-200">
                            <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                                <div>
                                    <h4 className="text-xs font-black text-gray-900">RedX Delivery Open API</h4>
                                    <p className="text-[11px] text-gray-500">API Endpoint: https://openapi.redx.com.bd/v1.0.0-beta</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleTestConnection('redx')}
                                    disabled={testingCourier === 'redx'}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold transition-colors flex items-center gap-1.5 border-none cursor-pointer"
                                >
                                    <RefreshCw className={`w-3.5 h-3.5 ${testingCourier === 'redx' ? 'animate-spin' : ''}`} />
                                    <span>{testingCourier === 'redx' ? 'Testing...' : 'Test Token'}</span>
                                </button>
                            </div>

                            {testResult && testResult.courier === 'redx' && (
                                <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                                    testResult.success ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    {testResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                    <span>{testResult.message}</span>
                                </div>
                            )}

                            <div>
                                <FieldLabel>RedX API Access Token <span className="text-red-500">*</span></FieldLabel>
                                <AdminInput 
                                    type="password"
                                    placeholder="Bearer token from RedX Developer Portal" 
                                    value={data.redx_api_token} 
                                    onChange={e => setData('redx_api_token', e.target.value)} 
                                />
                            </div>
                        </div>
                    )}

                    {/* ── Tab 6: Custom Courier ── */}
                    {activeCourierTab === 'custom' && (
                        <div className="mt-6 space-y-4 animate-in fade-in duration-200">
                            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-200">
                                <h4 className="text-xs font-black text-gray-900">Custom / In-House / Manual Courier</h4>
                                <p className="text-[11px] text-gray-500">Assign orders to local riders, SA Paribahan, Sundarban, eCourier, or in-house delivery team.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <FieldLabel>Courier Name</FieldLabel>
                                    <AdminInput 
                                        placeholder="e.g. SA Paribahan / In-House" 
                                        value={data.custom_courier_name} 
                                        onChange={e => setData('custom_courier_name', e.target.value)} 
                                    />
                                </div>
                                <div>
                                    <FieldLabel>Custom Tracking URL Template (Optional)</FieldLabel>
                                    <AdminInput 
                                        placeholder="e.g. https://mycourier.com/track/{tracking_code}" 
                                        value={data.custom_courier_tracking_url} 
                                        onChange={e => setData('custom_courier_tracking_url', e.target.value)} 
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </AdminCard>

                {/* ─────────────────────────────────────────────────────────────
                 * FACEBOOK PIXEL & CAPI
                 * ───────────────────────────────────────────────────────────── */}
                <AdminCard className="p-6">
                    <div className="flex items-center gap-3 mb-5 pb-3 border-b border-[#E6F5EC]">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Facebook className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-[#1A1A2E]">Meta Facebook Pixel & Conversions API</h3>
                            <p className="text-[10px] text-gray-400 font-bold">Track purchase events and optimize Facebook / Instagram ads ROI.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <FieldLabel>Facebook Pixel ID</FieldLabel>
                            <AdminInput 
                                placeholder="e.g. 123456789012345" 
                                value={data.facebook_pixel_id} 
                                onChange={e => setData('facebook_pixel_id', e.target.value)} 
                            />
                        </div>
                        <div>
                            <FieldLabel>Conversions API Access Token</FieldLabel>
                            <AdminInput 
                                type="password"
                                placeholder="EAAG..." 
                                value={data.facebook_access_token} 
                                onChange={e => setData('facebook_access_token', e.target.value)} 
                            />
                        </div>
                        <div>
                            <FieldLabel>Meta Test Event Code (Optional for Staging)</FieldLabel>
                            <AdminInput 
                                placeholder="e.g. TEST12345" 
                                value={data.facebook_test_event_code} 
                                onChange={e => setData('facebook_test_event_code', e.target.value)} 
                            />
                            <p className="text-[10px] text-gray-400 mt-1">Leave empty in production so events register as live conversions.</p>
                        </div>
                        <div>
                            <FieldLabel>Purchase Event ট্রিগার মোড (Trigger Mode)</FieldLabel>
                            <select
                                value={data.facebook_purchase_trigger}
                                onChange={e => setData('facebook_purchase_trigger', e.target.value)}
                                className="w-full h-11 px-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:bg-white focus:border-[#009E49] focus:ring-2 focus:ring-[#009E49]/10 outline-none transition-all font-bangla"
                            >
                                <option value="admin_confirmed">অ্যাডমিন প্যানেল থেকে কনফার্ম/Completed করলে (Recommended for COD)</option>
                                <option value="instant_checkout">চেকআউটে প্লেস করার সাথে সাথে তাৎক্ষণিক (Instant Tracking)</option>
                            </select>
                            <p className="text-[10px] text-emerald-700 mt-1 font-medium font-bangla">
                                💡 <strong>admin_confirmed:</strong> ক্যাশ অন ডেলিভারিতে ফেক বা ক্যান্সেল অর্ডার ফিল্টার করতে সেরা।
                            </p>
                        </div>
                        <div>
                            <FieldLabel>Google Tag Manager (GTM) Container ID</FieldLabel>
                            <AdminInput 
                                placeholder="e.g. GTM-XXXXXXX" 
                                value={data.gtm_container_id} 
                                onChange={e => setData('gtm_container_id', e.target.value)} 
                            />
                            <p className="text-[10px] text-gray-400 mt-1">Loads GTM container across storefront pages automatically.</p>
                        </div>
                    </div>

                    {/* Meta CAPI Test Action Bar */}
                    <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                disabled={isTestingCapi || !data.facebook_pixel_id || !data.facebook_access_token}
                                onClick={handleTestMetaCapi}
                                className="h-9 px-4 rounded-lg font-bold text-xs bg-blue-50/80 hover:bg-blue-100 text-blue-700 border border-blue-200/80 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
                            >
                                {isTestingCapi ? (
                                    <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Facebook className="w-3.5 h-3.5 text-blue-600" />
                                )}
                                <span>{isTestingCapi ? 'টেস্ট রিকোয়েস্ট পাঠানো হচ্ছে...' : 'Meta CAPI কানেকশন টেস্ট করুন'}</span>
                            </button>
                            <span className="text-[11px] text-gray-400 font-bangla hidden sm:inline">
                                (মেটা গ্রাফ এপিআই-তে একটি টেস্ট ইভেন্ট পাঠাবে)
                            </span>
                        </div>

                        {capiTestResult && (
                            <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                                capiTestResult.success 
                                    ? 'bg-emerald-50 text-[#009E49] border border-emerald-200' 
                                    : 'bg-red-50 text-red-600 border border-red-200'
                            }`}>
                                <span>{capiTestResult.success ? '✔' : '✖'}</span>
                                <span>{capiTestResult.message}</span>
                                {capiTestResult.fbtrace_id && (
                                    <span className="text-[10px] text-gray-400 font-mono hidden md:inline">
                                        [Trace: {capiTestResult.fbtrace_id}]
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </AdminCard>

                {/* ─────────────────────────────────────────────────────────────
                 * SMS GATEWAY
                 * ───────────────────────────────────────────────────────────── */}
                <AdminCard className="p-6">
                    <div className="flex items-center gap-3 mb-5 pb-3 border-b border-[#E6F5EC]">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <MessageSquare className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-[#1A1A2E]">SMS Notification Gateway</h3>
                            <p className="text-[10px] text-gray-400 font-bold">Send automated order confirmation and courier tracking SMS alerts.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <FieldLabel>SMS API Key (Elitbuzz / Bulksmsbd / Greenweb)</FieldLabel>
                            <AdminInput 
                                type="password"
                                placeholder="e.g. sms_api_key_..." 
                                value={data.sms_api_key} 
                                onChange={e => setData('sms_api_key', e.target.value)} 
                            />
                        </div>
                        <div>
                            <FieldLabel>Sender ID / Masking Name</FieldLabel>
                            <AdminInput 
                                placeholder="e.g. CHUTIRMART" 
                                value={data.sms_sender_id} 
                                onChange={e => setData('sms_sender_id', e.target.value)} 
                            />
                        </div>
                    </div>
                </AdminCard>

                {/* Submit Action */}
                <div className="flex justify-end pt-2">
                    <SaveBtn 
                        type="submit" 
                        disabled={processing}
                        className="px-8 py-3.5 text-sm"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        <span>Save Integrations & Courier Settings</span>
                    </SaveBtn>
                </div>

            </form>
        </AdminLayout>
    );
};

export default Integrations;
