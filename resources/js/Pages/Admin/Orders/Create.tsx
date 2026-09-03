import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { AdminCard, PageHeader, SaveBtn, AdminInput, AdminTextarea, AdminSelect, FieldLabel } from '@/components/admin/ui';
import { Save, ArrowLeft, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
    id: number;
    name: string;
    price: number;
    stock_quantity: number;
}

interface CreateProps {
    products: Product[];
}

export const Create: React.FC<CreateProps> = ({ products }) => {
    const [selectedProduct, setSelectedProduct] = useState<string>('');
    const [orderItems, setOrderItems] = useState<any[]>([]);
    const [submitting, setSubmitting] = useState<boolean>(false);

    const { data, setData, errors } = useForm({
        customer_name: '',
        mobile: '',
        shipping_address: '',
        address: '',
        shipping_charge: 80,
        delivery_charge: 80,
        district: 'Dhaka',
    });

    const addProductToOrder = () => {
        if (!selectedProduct) return;
        const prod = products.find(p => p.id === parseInt(selectedProduct));
        if (!prod) return;

        // Check if already in order items
        const existingIndex = orderItems.findIndex(item => item.product_id === prod.id);
        if (existingIndex > -1) {
            toast.error('প্রোডাক্টটি ইতিমধ্যে তালিকায় যোগ করা হয়েছে।');
            return;
        }

        const newItems = [
            ...orderItems,
            {
                product_id: prod.id,
                name: prod.name,
                price: prod.price,
                quantity: 1,
                max_stock: prod.stock_quantity
            }
        ];
        setOrderItems(newItems);
        setSelectedProduct('');
    };

    const updateItemQuantity = (productId: number, qty: number) => {
        const item = orderItems.find(item => item.product_id === productId);
        if (!item) return;

        if (qty > item.max_stock) {
            toast.warning(`স্টক অতিক্রম করেছে (${item.max_stock}টি উপলব্ধ)।`);
        }

        const updated = orderItems.map(item => {
            if (item.product_id === productId) {
                return { ...item, quantity: Math.max(1, qty) };
            }
            return item;
        });
        setOrderItems(updated);
    };

    const updateItemPrice = (productId: number, price: number) => {
        const updated = orderItems.map(item => {
            if (item.product_id === productId) {
                return { ...item, price: Math.max(0, price) };
            }
            return item;
        });
        setOrderItems(updated);
    };

    const removeItemFromOrder = (productId: number) => {
        setOrderItems(orderItems.filter(item => item.product_id !== productId));
    };

    // Calculate Subtotal dynamically
    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCharge = Number(data.shipping_charge || 80);
    const total = subtotal + shippingCharge;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (orderItems.length === 0) {
            toast.error('অনুগ্রহ করে অর্ডারে অন্তত একটি প্রোডাক্ট যোগ করুন।');
            return;
        }

        if (!data.customer_name.trim()) {
            toast.error('কাস্টমারের নাম লিখুন।');
            return;
        }

        if (!data.mobile.trim()) {
            toast.error('মোবাইল নম্বর লিখুন।');
            return;
        }

        const addressText = (data.shipping_address || data.address || '').trim();
        if (!addressText) {
            toast.error('ডেলিভারি ঠিকানা লিখুন।');
            return;
        }

        setSubmitting(true);

        const payload = {
            customer_name: data.customer_name.trim(),
            mobile: data.mobile.trim(),
            address: addressText,
            shipping_address: addressText,
            district: shippingCharge === 80 ? 'Dhaka' : 'Outside Dhaka',
            delivery_charge: shippingCharge,
            shipping_charge: shippingCharge,
            items: orderItems.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.price,
            })),
        };

        router.post(route('admin.orders.store'), payload, {
            preserveScroll: false,
            onSuccess: () => {
                setSubmitting(false);
                toast.success('অর্ডারটি সফলভাবে তৈরি করা হয়েছে! 🎉');
            },
            onError: (errs) => {
                setSubmitting(false);
                const firstErr = Object.values(errs)[0];
                toast.error(firstErr ? String(firstErr) : 'অর্ডার তৈরি করা যায়নি। ইনপুট চেক করুন।');
            }
        });
    };

    return (
        <AdminLayout>
            <Head title="Create Order" />

            <div className="flex items-center gap-3 mb-5 w-full max-w-full">
                <Link href={route('admin.orders.index', { status: 'all' })} prefetch>
                    <button className="w-8 h-8 rounded-xl bg-white border border-[#E6F5EC] flex items-center justify-center text-gray-500 hover:border-[#009E49] hover:text-[#009E49] transition-all shadow-sm cursor-pointer">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                </Link>
                <div>
                    <h2 className="text-xl font-black text-[#1A1A2E]">Create Manual Order</h2>
                    <p className="text-xs text-[#9096B0] mt-0.5">Manually place order for customers received from external channels.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-full">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left: Customer & Products Selection */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Customer Information Card */}
                        <AdminCard className="p-6">
                            <h3 className="text-sm font-black text-[#1A1A2E] mb-5 flex items-center gap-2">
                                <span className="p-1 rounded-lg bg-[#E6F5EC] text-[#009E49]"><ShoppingCart className="w-4 h-4" /></span>
                                Customer Details
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <FieldLabel required>Customer Name</FieldLabel>
                                    <AdminInput 
                                        placeholder="e.g. Abdur Rahman" 
                                        value={data.customer_name} 
                                        onChange={e => setData('customer_name', e.target.value)} 
                                        required 
                                        error={errors.customer_name}
                                    />
                                </div>
                                <div>
                                    <FieldLabel required>Mobile Number</FieldLabel>
                                    <AdminInput 
                                        placeholder="e.g. 01700000000" 
                                        value={data.mobile} 
                                        onChange={e => setData('mobile', e.target.value)} 
                                        required 
                                        error={errors.mobile}
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <FieldLabel required>Shipping Address</FieldLabel>
                                    <AdminTextarea 
                                        placeholder="Detailed delivery address..." 
                                        value={data.shipping_address} 
                                        onChange={e => setData('shipping_address', e.target.value)} 
                                        rows={3}
                                        required 
                                        error={errors.shipping_address}
                                    />
                                </div>
                            </div>
                        </AdminCard>

                        {/* Product Items Selection Card */}
                        <AdminCard className="p-6">
                            <h3 className="text-sm font-black text-[#1A1A2E] mb-5">Select Products</h3>
                            
                            <div className="flex gap-2 mb-6">
                                <div className="flex-1">
                                    <AdminSelect 
                                        value={selectedProduct} 
                                        onChange={e => setSelectedProduct(e.target.value)}
                                    >
                                        <option value="">Choose a product from store...</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.id} disabled={p.stock_quantity <= 0}>
                                                {p.name} - ৳{p.price} ({p.stock_quantity > 0 ? `Stock: ${p.stock_quantity}` : 'Out of Stock'})
                                            </option>
                                        ))}
                                    </AdminSelect>
                                </div>
                                <button
                                    type="button"
                                    onClick={addProductToOrder}
                                    className="px-4 py-2.5 rounded-xl bg-[#009E49] text-white hover:bg-[#007F3B] font-bold text-xs flex items-center gap-1.5 border-none transition-all cursor-pointer shrink-0"
                                >
                                    <Plus className="w-4 h-4" /> Add Product
                                </button>
                            </div>

                            {/* Added Items List Table */}
                            {orderItems.length === 0 ? (
                                <div className="border border-dashed border-[#E6F5EC] rounded-2xl p-8 text-center text-gray-400 text-xs font-bold">
                                    No products added to order list yet. Choose a product above to start.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-[#E6F5EC] text-left text-[10px] font-black text-gray-400 uppercase tracking-wider">
                                                <th className="py-2.5">Product Name</th>
                                                <th className="py-2.5 w-24">Price (৳)</th>
                                                <th className="py-2.5 w-20">Qty</th>
                                                <th className="py-2.5 w-24 text-right">Subtotal</th>
                                                <th className="py-2.5 w-12 text-center"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orderItems.map((item, idx) => (
                                                <tr key={idx} className="border-b border-[#FAFDFB] hover:bg-[#FAFDFB] transition-all">
                                                    <td className="py-3 text-xs font-bold text-[#1A1A2E]">{item.name}</td>
                                                    <td className="py-3">
                                                        <input 
                                                            type="number" 
                                                            value={item.price} 
                                                            onChange={e => updateItemPrice(item.product_id, parseFloat(e.target.value))} 
                                                            className="w-20 h-8 px-2 border border-[#E6F5EC] rounded-lg text-xs font-bold text-gray-700 bg-white"
                                                        />
                                                    </td>
                                                    <td className="py-3">
                                                        <input 
                                                            type="number" 
                                                            value={item.quantity} 
                                                            onChange={e => updateItemQuantity(item.product_id, parseInt(e.target.value))} 
                                                            className="w-16 h-8 px-2 border border-[#E6F5EC] rounded-lg text-xs font-bold text-gray-700 bg-white"
                                                            min="1"
                                                        />
                                                    </td>
                                                    <td className="py-3 text-right text-xs font-black text-[#1A1A2E]">৳{item.price * item.quantity}</td>
                                                    <td className="py-3 text-center">
                                                        <button 
                                                            type="button" 
                                                            onClick={() => removeItemFromOrder(item.product_id)}
                                                            className="text-red-500 hover:text-red-700 border-none bg-transparent cursor-pointer p-1"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </AdminCard>
                    </div>

                    {/* Right: Pricing Summary & Create */}
                    <div className="space-y-6">
                        <AdminCard className="p-6">
                            <h3 className="text-sm font-black text-[#1A1A2E] mb-5">Order Summary</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <FieldLabel required>Shipping Delivery Charge (৳)</FieldLabel>
                                    <AdminSelect 
                                        value={data.shipping_charge} 
                                        onChange={e => setData('shipping_charge', parseFloat(e.target.value))}
                                    >
                                        <option value={80}>Inside Dhaka (৳80)</option>
                                        <option value={130}>Outside Dhaka (৳130)</option>
                                        <option value={0}>Free Shipping (৳0)</option>
                                    </AdminSelect>
                                </div>

                                <div className="border-t border-[#E6F5EC] my-4 pt-4 space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-gray-500">
                                        <span>Subtotal:</span>
                                        <span>৳{subtotal}</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-bold text-gray-500">
                                        <span>Delivery Fee:</span>
                                        <span>৳{data.shipping_charge}</span>
                                    </div>
                                    <div className="border-t border-[#E6F5EC] pt-2 flex justify-between text-sm font-black text-[#1A1A2E]">
                                        <span>Total Payable:</span>
                                        <span className="text-[#E2231A]">৳{total}</span>
                                    </div>
                                </div>

                                <SaveBtn type="submit" disabled={submitting} className="w-full justify-center">
                                    <Save className="w-4.5 h-4.5" />
                                    {submitting ? 'Creating Order...' : 'Create Order Now'}
                                </SaveBtn>
                            </div>
                        </AdminCard>
                    </div>

                </div>
            </form>
        </AdminLayout>
    );
};

export default Create;
