import React, { useEffect, useRef } from 'react';
import { Printer, X, Phone, MapPin, Package, Calendar, Truck, Tag } from 'lucide-react';

export interface OrderPrintData {
    id: number;
    order_number: string;
    customer_name: string;
    mobile: string;
    address?: string;
    thana?: string;
    district?: string;
    special_notes?: string;
    subtotal: number;
    delivery_charge: number;
    coupon_discount?: number;
    discount?: number;
    total: number;
    status: string;
    payment_status?: string;
    payment_method?: string;
    courier_name?: string;
    courier_tracking_code?: string;
    consignment_id?: string;
    created_at: string;
    items?: Array<{
        id?: number;
        product_name: string;
        quantity: number;
        unit_price: number;
        total_price: number;
        variant_info?: any;
    }>;
}

interface OrderPrintModalProps {
    orders: OrderPrintData[];
    isOpen: boolean;
    onClose: () => void;
    autoPrint?: boolean;
}

/* ─────────────────────────────────────────────────────────────
 * Generate Self-Contained Clean HTML for Printing (100% Reliable)
 * ───────────────────────────────────────────────────────────── */
const generateShippingLabelHtml = (orders: OrderPrintData[]): string => {
    const labelsHtml = orders.map((order, index) => {
        const fullAddress = [order.address, order.thana, order.district].filter(Boolean).join(', ') || 'Address not provided';
        const formattedDate = new Date(order.created_at).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
        const isPaid = (order.payment_status || '').toLowerCase() === 'paid';
        const isCod = !isPaid;
        const courierName = order.courier_name || 'Standard Courier';
        const trackingCode = order.courier_tracking_code || order.consignment_id || '';
        const items = order.items || [];
        const totalQty = items.reduce((acc, it) => acc + (Number(it.quantity) || 1), 0);

        const itemsRows = items.map((item, i) => {
            const variantText = item.variant_info 
                ? ` (${item.variant_info.label || item.variant_info.value || item.variant_info.name || ''})` 
                : '';
            return `
                <div class="item-row">
                    <span class="item-num">${i + 1}.</span>
                    <span class="item-name">${escapeHtml(item.product_name)}${escapeHtml(variantText)}</span>
                    <span class="item-qty">×${item.quantity}</span>
                </div>
            `;
        }).join('');

        return `
            <div class="label-wrapper ${index < orders.length - 1 ? 'page-break' : ''}">
                <!-- Outer Border Container -->
                <div class="shipping-card">
                    
                    <!-- 1. Header: Brand & Order Info -->
                    <div class="card-header">
                        <div class="brand-info">
                            <div class="brand-title">ছুটির মার্ট <span class="brand-en">ChutirMart</span></div>
                            <div class="brand-sub">📞 01305-654884 | www.chutirmart.com</div>
                        </div>
                        <div class="order-badge-col">
                            <div class="badge-label">SHIPPING LABEL</div>
                            <div class="order-id">#${escapeHtml(order.order_number)}</div>
                            <div class="order-date">${formattedDate}</div>
                        </div>
                    </div>

                    <!-- 2. Customer Section (Top Priority for Courier Delivery) -->
                    <div class="customer-box">
                        <div class="box-tag">DELIVER TO / প্রাপক:</div>
                        <div class="customer-name">${escapeHtml(order.customer_name)}</div>
                        <div class="customer-phone">📱 ${escapeHtml(order.mobile)}</div>
                        <div class="customer-address">📍 ${escapeHtml(fullAddress)}</div>
                        ${order.special_notes ? `<div class="customer-note"><strong>Note:</strong> ${escapeHtml(order.special_notes)}</div>` : ''}
                    </div>

                    <!-- 3. Payment & Courier Grid -->
                    <div class="details-grid">
                        <div class="courier-box">
                            <div class="grid-sub-tag">COURIER</div>
                            <div class="courier-val">🚚 ${escapeHtml(courierName.toUpperCase())}</div>
                            ${trackingCode ? `<div class="tracking-val">Track: <strong>${escapeHtml(trackingCode)}</strong></div>` : ''}
                            <div class="pay-method">Method: ${escapeHtml((order.payment_method || 'Cash On Delivery').toUpperCase())}</div>
                        </div>
                        <div class="cod-box ${isCod ? 'cod-highlight' : 'paid-highlight'}">
                            <div class="grid-sub-tag">${isCod ? 'CASH ON DELIVERY (কন্ডিশন টাকা)' : 'PAYMENT STATUS'}</div>
                            <div class="cod-amount">৳${Number(order.total).toFixed(2)}</div>
                            <div class="cod-status">${isPaid ? '✓ PAID (পরিশোধিত)' : '⚠ DUE / COLLECT CASH'}</div>
                        </div>
                    </div>

                    <!-- 4. Package Items Summary -->
                    <div class="items-container">
                        <div class="items-header">
                            <span>📦 PACKAGE ITEMS (${totalQty} pcs)</span>
                        </div>
                        <div class="items-body">
                            ${itemsRows || '<div class="item-row"><span class="item-name">No product item data</span></div>'}
                        </div>
                    </div>

                    <!-- 5. Barcode & Verification Footer -->
                    <div class="card-footer">
                        <div class="barcode-visual">
                            <div class="barcode-lines"></div>
                            <div class="barcode-text">*${escapeHtml(order.order_number)}*</div>
                        </div>
                        <div class="footer-sign">
                            <div class="sign-line"></div>
                            <div class="sign-text">Receiver Signature</div>
                        </div>
                    </div>

                </div>
            </div>
        `;
    }).join('');

    return `
        <!DOCTYPE html>
        <html lang="bn">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Shipping Labels - ChutirMart</title>
            <style>
                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                }
                body {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    background: #ffffff;
                    color: #0f172a;
                    padding: 8px;
                    font-size: 12px;
                    line-height: 1.35;
                }
                @page {
                    size: auto;
                    margin: 4mm;
                }
                .label-wrapper {
                    width: 100%;
                    max-width: 420px;
                    margin: 0 auto 16px auto;
                }
                .page-break {
                    page-break-after: always;
                    break-after: page;
                }
                .shipping-card {
                    border: 2px solid #0f172a;
                    border-radius: 8px;
                    padding: 10px 12px;
                    background: #ffffff;
                }

                /* Header */
                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    border-bottom: 2px solid #0f172a;
                    padding-bottom: 6px;
                    margin-bottom: 8px;
                }
                .brand-title {
                    font-size: 16px;
                    font-weight: 900;
                    color: #009E49;
                    letter-spacing: -0.3px;
                }
                .brand-en {
                    font-size: 12px;
                    font-weight: 700;
                    color: #334155;
                }
                .brand-sub {
                    font-size: 10px;
                    color: #64748b;
                    font-weight: 600;
                    margin-top: 1px;
                }
                .order-badge-col {
                    text-align: right;
                }
                .badge-label {
                    display: inline-block;
                    background: #0f172a;
                    color: #ffffff;
                    font-size: 9px;
                    font-weight: 900;
                    padding: 2px 6px;
                    border-radius: 3px;
                    letter-spacing: 0.5px;
                }
                .order-id {
                    font-size: 13px;
                    font-weight: 900;
                    color: #009E49;
                    margin-top: 2px;
                    font-family: monospace;
                }
                .order-date {
                    font-size: 9.5px;
                    color: #64748b;
                }

                /* Customer Section */
                .customer-box {
                    background: #f8fafc;
                    border: 1.5px solid #cbd5e1;
                    border-radius: 6px;
                    padding: 8px 10px;
                    margin-bottom: 8px;
                }
                .box-tag {
                    font-size: 9.5px;
                    font-weight: 900;
                    color: #009E49;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 2px;
                }
                .customer-name {
                    font-size: 14px;
                    font-weight: 800;
                    color: #0f172a;
                }
                .customer-phone {
                    font-size: 14px;
                    font-weight: 900;
                    color: #0f172a;
                    letter-spacing: 0.3px;
                    margin: 2px 0;
                }
                .customer-address {
                    font-size: 11.5px;
                    color: #334155;
                    line-height: 1.35;
                }
                .customer-note {
                    margin-top: 4px;
                    font-size: 10.5px;
                    color: #92400e;
                    background: #fef3c7;
                    padding: 2px 6px;
                    border-radius: 4px;
                    border: 1px solid #fde68a;
                }

                /* Details Grid */
                .details-grid {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 8px;
                }
                .courier-box {
                    flex: 1;
                    border: 1.5px solid #cbd5e1;
                    border-radius: 6px;
                    padding: 6px 8px;
                    background: #ffffff;
                }
                .grid-sub-tag {
                    font-size: 8.5px;
                    font-weight: 900;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.3px;
                }
                .courier-val {
                    font-size: 11px;
                    font-weight: 800;
                    color: #0f172a;
                    margin-top: 1px;
                }
                .tracking-val {
                    font-size: 10px;
                    color: #334155;
                    font-family: monospace;
                    margin-top: 2px;
                }
                .pay-method {
                    font-size: 9.5px;
                    color: #64748b;
                    margin-top: 2px;
                }

                .cod-box {
                    flex: 1.2;
                    border-radius: 6px;
                    padding: 6px 8px;
                    text-align: right;
                }
                .cod-highlight {
                    border: 2px solid #0f172a;
                    background: #0f172a;
                    color: #ffffff;
                }
                .cod-highlight .grid-sub-tag {
                    color: #94a3b8;
                }
                .cod-amount {
                    font-size: 16px;
                    font-weight: 900;
                    color: #4ade80;
                    font-family: monospace;
                    letter-spacing: -0.5px;
                    line-height: 1.2;
                    margin: 1px 0;
                }
                .cod-status {
                    font-size: 9px;
                    font-weight: 800;
                    text-transform: uppercase;
                }

                .paid-highlight {
                    border: 1.5px solid #009E49;
                    background: #f0fdf4;
                    color: #009E49;
                }
                .paid-highlight .cod-amount {
                    color: #009E49;
                }

                /* Items Box */
                .items-container {
                    border: 1.5px solid #cbd5e1;
                    border-radius: 6px;
                    padding: 6px 8px;
                    margin-bottom: 8px;
                    background: #ffffff;
                }
                .items-header {
                    font-size: 9px;
                    font-weight: 900;
                    color: #475569;
                    text-transform: uppercase;
                    border-bottom: 1px dashed #cbd5e1;
                    padding-bottom: 3px;
                    margin-bottom: 4px;
                }
                .items-body {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .item-row {
                    display: flex;
                    align-items: baseline;
                    font-size: 11px;
                    color: #1e293b;
                }
                .item-num {
                    font-size: 10px;
                    color: #64748b;
                    width: 14px;
                    flex-shrink: 0;
                }
                .item-name {
                    flex: 1;
                    font-weight: 600;
                }
                .item-qty {
                    font-weight: 800;
                    color: #0f172a;
                    padding-left: 6px;
                    font-family: monospace;
                    font-size: 11px;
                }

                /* Footer & Barcode */
                .card-footer {
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-between;
                    border-top: 1px dashed #cbd5e1;
                    padding-top: 6px;
                }
                .barcode-visual {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                }
                .barcode-lines {
                    height: 22px;
                    width: 130px;
                    background: repeating-linear-gradient(
                        90deg,
                        #000 0px,
                        #000 2px,
                        transparent 2px,
                        transparent 3px,
                        #000 3px,
                        #000 5px,
                        transparent 5px,
                        transparent 7px,
                        #000 7px,
                        #000 10px,
                        transparent 10px,
                        transparent 11px
                    );
                }
                .barcode-text {
                    font-family: monospace;
                    font-size: 9px;
                    font-weight: 700;
                    letter-spacing: 2px;
                    color: #334155;
                    margin-top: 1px;
                }
                .footer-sign {
                    text-align: center;
                    width: 110px;
                }
                .sign-line {
                    border-bottom: 1px solid #94a3b8;
                    height: 18px;
                }
                .sign-text {
                    font-size: 8.5px;
                    color: #64748b;
                    margin-top: 2px;
                }
            </style>
        </head>
        <body>
            ${labelsHtml}
        </body>
        </html>
    `;
};

function escapeHtml(str: string): string {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/* ─────────────────────────────────────────────────────────────
 * Reliable Iframe-Based Printing (No Blank Pages)
 * ───────────────────────────────────────────────────────────── */
export const printShippingLabels = (orders: OrderPrintData[]) => {
    if (!orders || orders.length === 0) return;

    const html = generateShippingLabelHtml(orders);
    const iframeId = 'chutirmart-shipping-label-frame';
    let iframe = document.getElementById(iframeId) as HTMLIFrameElement | null;

    if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = iframeId;
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        iframe.style.opacity = '0';
        iframe.style.pointerEvents = 'none';
        document.body.appendChild(iframe);
    }

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) {
        window.print();
        return;
    }

    doc.open();
    doc.write(html);
    doc.close();

    // Trigger print after iframe renders document
    setTimeout(() => {
        try {
            iframe?.contentWindow?.focus();
            iframe?.contentWindow?.print();
        } catch (e) {
            console.error('Iframe print error fallback to window.print:', e);
            window.print();
        }
    }, 180);
};

/* ─────────────────────────────────────────────────────────────
 * Modal Component with Visual Preview
 * ───────────────────────────────────────────────────────────── */
export const OrderPrintModal: React.FC<OrderPrintModalProps> = ({
    orders,
    isOpen,
    onClose,
    autoPrint = false,
}) => {
    const hasAutoPrinted = useRef(false);

    useEffect(() => {
        if (isOpen && autoPrint && orders.length > 0 && !hasAutoPrinted.current) {
            hasAutoPrinted.current = true;
            const timer = setTimeout(() => {
                printShippingLabels(orders);
            }, 300);
            return () => clearTimeout(timer);
        }
        if (!isOpen) {
            hasAutoPrinted.current = false;
        }
    }, [isOpen, autoPrint, orders]);

    // Handle ESC key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen || orders.length === 0) return null;

    const handlePrintClick = () => {
        printShippingLabels(orders);
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-150">
            {/* Modal Card */}
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
                
                {/* ── Modal Header ── */}
                <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 bg-slate-50 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#009E49]/10 text-[#009E49] flex items-center justify-center shrink-0">
                            <Tag className="w-4.5 h-4.5" />
                        </div>
                        <div>
                            <h3 className="text-[14px] sm:text-[15px] font-black text-slate-800 leading-tight">
                                Shipping Label (শিপিং লেবেল)
                            </h3>
                            <p className="text-[11px] text-slate-500">
                                {orders.length === 1 ? `Order #${orders[0].order_number}` : `${orders.length} Labels Ready`}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handlePrintClick}
                            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg bg-[#009E49] hover:bg-[#007F3B] text-white text-xs sm:text-[13px] font-bold shadow-xs hover:shadow-sm active:scale-95 transition-all border-none cursor-pointer"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Print Now (প্রিন্ট করুন)</span>
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg bg-slate-200/70 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors border-none cursor-pointer"
                            title="Close"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* ── Label Visual Preview Area ── */}
                <div className="overflow-y-auto p-4 sm:p-5 bg-slate-100 space-y-4">
                    {orders.map((order, idx) => {
                        const fullAddress = [order.address, order.thana, order.district].filter(Boolean).join(', ') || 'Address not provided';
                        const isPaid = (order.payment_status || '').toLowerCase() === 'paid';
                        const courierName = order.courier_name || 'Standard Courier';
                        const tracking = order.courier_tracking_code || order.consignment_id;
                        const items = order.items || [];
                        const totalQty = items.reduce((acc, it) => acc + (Number(it.quantity) || 1), 0);

                        return (
                            <div
                                key={order.id || idx}
                                className="bg-white border-2 border-slate-900 rounded-lg p-3.5 sm:p-4 text-slate-900 shadow-sm max-w-[420px] mx-auto select-none"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between border-b-2 border-slate-900 pb-2 mb-2.5">
                                    <div>
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-[16px] font-black text-[#009E49] tracking-tight">ছুটির মার্ট</span>
                                            <span className="text-[12px] font-bold text-slate-700">ChutirMart</span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-medium">
                                            📞 01305-654884 | www.chutirmart.com
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="inline-block px-2 py-0.5 bg-slate-900 text-white font-black text-[9px] uppercase tracking-wider rounded">
                                            SHIPPING LABEL
                                        </span>
                                        <div className="text-[13px] font-black font-mono text-[#009E49] mt-0.5">
                                            #{order.order_number}
                                        </div>
                                    </div>
                                </div>

                                {/* Customer Delivery Box */}
                                <div className="bg-slate-50 border border-slate-300 rounded-md p-2.5 mb-2.5">
                                    <div className="text-[9.5px] font-black text-[#009E49] uppercase tracking-wider mb-1 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        <span>DELIVER TO (প্রাপক)</span>
                                    </div>
                                    <div className="text-[14px] font-black text-slate-900">
                                        {order.customer_name}
                                    </div>
                                    <div className="text-[14px] font-black text-slate-900 font-mono flex items-center gap-1 my-0.5">
                                        <Phone className="w-3 h-3 text-[#009E49]" />
                                        <span>{order.mobile}</span>
                                    </div>
                                    <div className="text-[12px] text-slate-700 leading-snug">
                                        {fullAddress}
                                    </div>
                                    {order.special_notes && (
                                        <div className="text-[10px] text-amber-900 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 mt-1 font-medium">
                                            Note: {order.special_notes}
                                        </div>
                                    )}
                                </div>

                                {/* Courier & COD Details */}
                                <div className="grid grid-cols-2 gap-2 mb-2.5">
                                    <div className="border border-slate-300 rounded-md p-2 bg-white">
                                        <div className="text-[8.5px] font-black text-slate-500 uppercase tracking-wider">
                                            COURIER
                                        </div>
                                        <div className="text-[11.5px] font-black text-slate-900 mt-0.5">
                                            🚚 {courierName.toUpperCase()}
                                        </div>
                                        {tracking && (
                                            <div className="text-[10px] font-mono text-slate-600 mt-0.5 truncate">
                                                Track: <strong>{tracking}</strong>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className={`border rounded-md p-2 text-right ${
                                        isPaid ? 'border-[#009E49] bg-emerald-50/50' : 'border-slate-900 bg-slate-900 text-white'
                                    }`}>
                                        <div className={`text-[8.5px] font-black uppercase tracking-wider ${isPaid ? 'text-[#009E49]' : 'text-slate-400'}`}>
                                            {isPaid ? 'PAYMENT STATUS' : 'CASH ON DELIVERY (COD)'}
                                        </div>
                                        <div className={`text-[16px] font-black font-mono leading-tight my-0.5 ${isPaid ? 'text-[#009E49]' : 'text-emerald-400'}`}>
                                            ৳{Number(order.total).toFixed(2)}
                                        </div>
                                        <div className={`text-[9px] font-black uppercase ${isPaid ? 'text-emerald-700' : 'text-amber-300'}`}>
                                            {isPaid ? '✓ PAID' : '⚠ COLLECT CASH'}
                                        </div>
                                    </div>
                                </div>

                                {/* Items Compact List */}
                                <div className="border border-slate-300 rounded-md p-2 bg-white mb-2.5">
                                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-wider border-b border-dashed border-slate-200 pb-1 mb-1.5 flex items-center justify-between">
                                        <span>PACKAGE ITEMS ({totalQty} pcs)</span>
                                    </div>
                                    <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                                        {items.length > 0 ? (
                                            items.map((it, i) => (
                                                <div key={it.id || i} className="flex items-center justify-between text-[11px] text-slate-800">
                                                    <span className="truncate pr-2 font-medium">
                                                        {i + 1}. {it.product_name}
                                                        {it.variant_info && (
                                                            <span className="text-[10px] text-slate-500 ml-1">
                                                                ({it.variant_info.label || it.variant_info.value || it.variant_info.name || ''})
                                                            </span>
                                                        )}
                                                    </span>
                                                    <span className="font-mono font-black text-slate-900 shrink-0">
                                                        ×{it.quantity}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-[11px] text-slate-400">No items specified</div>
                                        )}
                                    </div>
                                </div>

                                {/* Barcode Footer */}
                                <div className="flex items-end justify-between border-t border-dashed border-slate-300 pt-2">
                                    <div>
                                        <div className="h-5 w-28 bg-[repeating-linear-gradient(90deg,#000_0px,#000_2px,transparent_2px,transparent_3px,#000_3px,#000_5px,transparent_5px,transparent_7px,#000_7px,#000_10px,transparent_10px,transparent_11px)]"></div>
                                        <div className="text-[9px] font-mono font-bold text-slate-600 tracking-widest mt-0.5">
                                            *{order.order_number}*
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="w-24 border-b border-slate-400 h-3"></div>
                                        <span className="text-[8.5px] text-slate-400 block mt-0.5">Receiver Sign</span>
                                    </div>
                                </div>

                            </div>
                        );
                    })}
                </div>

                {/* ── Modal Footer ── */}
                <div className="px-4 sm:px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                    <p className="text-[11px] text-slate-500 font-medium">
                        কুরিয়ার পার্সেল স্টিকার সাইজে নিখুঁত প্রিন্ট হবে।
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                            বন্ধ করুন (Close)
                        </button>
                        <button
                            type="button"
                            onClick={handlePrintClick}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#009E49] hover:bg-[#007F3B] text-white text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer border-none"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Print Now</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default OrderPrintModal;
