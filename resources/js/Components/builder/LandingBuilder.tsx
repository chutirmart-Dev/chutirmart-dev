import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Layout, Type, AlignLeft, Image as ImageIcon, Video, 
    MousePointerClick, Minus, ArrowUpDown, ShieldCheck, 
    ListChecks, ShoppingBag, DollarSign, Images, FileText, 
    Star, ShoppingCart, CheckCircle2, Eye, Save, Undo2, 
    Redo2, Smartphone, Tablet, Monitor, ChevronRight, 
    Trash2, Copy, Move, Settings, Plus, Sparkles, Layers, 
    ArrowLeft, Flame, HelpCircle, Check, X, Sliders, 
    Palette, Code, ExternalLink, RefreshCw, AlertCircle,
    Columns, Grid, Box, Rows, SplitSquareVertical, 
    Maximize2, Minimize2
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

export interface ElementItem {
    id: string;
    type: string;
    content: Record<string, any>;
    style: Record<string, any>;
    advanced?: Record<string, any>;
}

export interface SectionItem {
    id: string;
    type: 'section';
    settings: {
        background?: string;
        paddingY?: string;
        containerWidth?: 'default' | 'narrow' | 'wide' | 'full';
        layout?: '1-col' | '2-col' | '3-col' | '4-col' | 'left-sidebar' | 'right-sidebar';
        gap?: 'none' | 'sm' | 'md' | 'lg';
        alignItems?: 'start' | 'center' | 'end' | 'stretch';
        borderStyle?: 'none' | 'solid' | 'dashed';
        borderWidth?: '1px' | '2px' | '4px';
        borderColor?: string;
        borderRadius?: 'none' | 'rounded-lg' | 'rounded-2xl' | 'rounded-3xl';
        shadow?: 'none' | 'shadow-xs' | 'shadow-md' | 'shadow-xl';
        customClass?: string;
    };
    children: ElementItem[];
}

interface LandingBuilderProps {
    page?: any;
    products: any[];
    isCreate?: boolean;
}

export const LandingBuilder: React.FC<LandingBuilderProps> = ({ page, products, isCreate = false }) => {
    // ── Selected Product for Dynamic Data ──────────────────────────────────────
    const [selectedProductId, setSelectedProductId] = useState<string>(
        page?.product_id ? String(page.product_id) : (products[0]?.id ? String(products[0].id) : '')
    );

    const activeProduct = products.find(p => String(p.id) === String(selectedProductId)) || products[0] || {};

    // ── Default Template Generator (Used for blank or legacy landing pages) ────
    const generateDefaultSections = (legacyPage?: any, prod?: any): SectionItem[] => {
        const headline = legacyPage?.hero_headline || (prod?.name ? `${prod.name} স্পেশাল অফার!` : 'আমাদের প্রিমিয়াম প্রোডাক্ট অফার');
        const subtext = legacyPage?.hero_subtext || prod?.short_description || '১০০% অরিজিনাল ও প্রিমিয়াম কোয়ালিটি পণ্য। সারা বাংলাদেশে দ্রুত ক্যাশ অন ডেলিভারি সুবিধা।';
        const image = legacyPage?.hero_image_path || prod?.images?.[0]?.image_path || '/storage/defaults/default-product.svg';

        return [
            {
                id: 'sec_hero',
                type: 'section',
                settings: { 
                    background: '#ffffff', 
                    paddingY: 'py-8', 
                    containerWidth: 'default',
                    layout: '1-col',
                    gap: 'md',
                    borderRadius: 'none',
                    shadow: 'none'
                },
                children: [
                    {
                        id: 'el_headline',
                        type: 'heading',
                        content: { text: headline, tag: 'h1' },
                        style: { fontSize: 'text-3xl md:text-4xl', fontWeight: 'font-black', textAlign: 'text-center', color: '#111827' }
                    },
                    {
                        id: 'el_subtext',
                        type: 'text',
                        content: { text: subtext },
                        style: { fontSize: 'text-base', textAlign: 'text-center', color: '#4B5563', marginY: 'my-3' }
                    },
                    {
                        id: 'el_hero_img',
                        type: 'image',
                        content: { url: image, alt: prod?.name || 'Product Image' },
                        style: { align: 'center', maxWidth: 'max-w-xl', radius: 'rounded-2xl', shadow: 'shadow-md' }
                    },
                    {
                        id: 'el_price_badge',
                        type: 'product-price',
                        content: {},
                        style: { align: 'center', marginY: 'my-4' }
                    },
                    {
                        id: 'el_cta_btn',
                        type: 'product-cta',
                        content: { text: legacyPage?.cta_button_text || 'অর্ডার করতে নিচে যান 🛍️', target: '#order-form' },
                        style: { bg: '#009E49', color: '#ffffff', size: 'lg', radius: 'rounded-xl', shadow: 'shadow-lg' }
                    },
                    {
                        id: 'el_trust',
                        type: 'trust-badges',
                        content: {},
                        style: { marginY: 'mt-6' }
                    }
                ]
            },
            {
                id: 'sec_details',
                type: 'section',
                settings: { 
                    background: '#FAFDFB', 
                    paddingY: 'py-8', 
                    containerWidth: 'default',
                    layout: '1-col',
                    gap: 'md',
                    borderRadius: 'rounded-2xl',
                    shadow: 'shadow-xs'
                },
                children: [
                    {
                        id: 'el_desc_head',
                        type: 'heading',
                        content: { text: 'পণ্যের বিস্তারিত বিবরণ ও সুবিধাসমূহ', tag: 'h2' },
                        style: { fontSize: 'text-2xl font-black', textAlign: 'text-center', color: '#111827', marginY: 'mb-4' }
                    },
                    {
                        id: 'el_desc_content',
                        type: 'product-description',
                        content: {},
                        style: { marginY: 'mb-6' }
                    }
                ]
            },
            {
                id: 'sec_checkout',
                type: 'section',
                settings: { 
                    background: '#ffffff', 
                    paddingY: 'py-8', 
                    containerWidth: 'narrow',
                    layout: '1-col',
                    gap: 'md',
                    borderRadius: 'none',
                    shadow: 'none'
                },
                children: [
                    {
                        id: 'el_checkout_head',
                        type: 'heading',
                        content: { text: 'অর্ডার কনফার্ম করতে নিচের ফর্মটি পূরণ করুন', tag: 'h2' },
                        style: { fontSize: 'text-2xl font-black', textAlign: 'text-center', color: '#009E49', marginY: 'mb-4' }
                    },
                    {
                        id: 'el_checkout_form',
                        type: 'checkout-form',
                        content: { title: 'ক্যাশ অন ডেলিভারি অর্ডার' },
                        style: {}
                    }
                ]
            }
        ];
    };

    // ── Initial Sections Loading & Parsing ────────────────────────────────────
    const initialSections = (): SectionItem[] => {
        if (page?.sections && Array.isArray(page.sections) && page.sections.length > 0) {
            return page.sections.map((sec: any) => ({
                ...sec,
                settings: {
                    background: '#ffffff',
                    paddingY: 'py-8',
                    containerWidth: 'default',
                    layout: '1-col',
                    gap: 'md',
                    borderRadius: 'none',
                    shadow: 'none',
                    ...(sec.settings || {})
                }
            }));
        }
        return generateDefaultSections(page, activeProduct);
    };

    const [sections, setSections] = useState<SectionItem[]>(initialSections);

    // ── History (Undo / Redo) ──────────────────────────────────────────────────
    const [history, setHistory] = useState<SectionItem[][]>([initialSections()]);
    const [historyIndex, setHistoryIndex] = useState(0);

    const updateSectionsWithHistory = (newSections: SectionItem[]) => {
        setSections(newSections);
        const nextHistory = history.slice(0, historyIndex + 1);
        nextHistory.push(newSections);
        setHistory(nextHistory);
        setHistoryIndex(nextHistory.length - 1);
    };

    const handleUndo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(prev => prev - 1);
            setSections(history[historyIndex - 1]);
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(prev => prev + 1);
            setSections(history[historyIndex + 1]);
        }
    };

    // ── Page Metadata Form ─────────────────────────────────────────────────────
    const [title, setTitle] = useState(page?.title || (activeProduct?.name ? `${activeProduct.name} Landing Page` : ''));
    const [slug, setSlug] = useState(page?.slug || (activeProduct?.slug ? `${activeProduct.slug}-offer` : ''));
    const [status, setStatus] = useState<'published' | 'draft'>(page?.status || 'published');
    const [ctaButtonText, setCtaButtonText] = useState(page?.cta_button_text || 'এখনই অর্ডার করুন');
    const [facebookPixelId, setFacebookPixelId] = useState(page?.facebook_pixel_id || '');
    const [gaId, setGaId] = useState(page?.ga_id || '');

    // ── Builder State ──────────────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState<'elements' | 'page-settings' | 'layers'>('elements');
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
    const [activeInspectorTab, setActiveInspectorTab] = useState<'content' | 'style' | 'advanced'>('content');
    const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [showStructurePicker, setShowStructurePicker] = useState<boolean>(false);

    // ── Auto-sync Title & Slug when product changes (if in create mode) ────────
    const handleProductChange = (newProductId: string) => {
        setSelectedProductId(newProductId);
        const newProd = products.find(p => String(p.id) === String(newProductId));
        if (isCreate && newProd) {
            setTitle(`${newProd.name} Special Offer`);
            setSlug(`${newProd.slug || 'product'}-offer`);
        }
    };

    // ── Widget Definitions (Categorized) ───────────────────────────────────────
    const widgetCategories = [
        {
            name: 'LAYOUT & CONTAINERS',
            description: 'Flexbox Containers & Multi-Column Grids',
            widgets: [
                { type: 'container-1', label: '1 Column Box', icon: Box, desc: 'Single column container with styling' },
                { type: 'container-2', label: '2 Columns (50/50)', icon: Columns, desc: 'Two equal column split grid' },
                { type: 'container-3', label: '3 Columns Grid', icon: Grid, desc: 'Three column product/feature grid' },
                { type: 'container-4', label: '4 Columns Grid', icon: Grid, desc: 'Four equal column cards grid' },
                { type: 'container-card', label: 'Styled Promo Card', icon: Sparkles, desc: 'Bordered card box with custom shadow' },
                { type: 'container-sidebar', label: 'Sidebar + Content', icon: SplitSquareVertical, desc: '30% Sidebar / 70% Content split' }
            ]
        },
        {
            name: 'DYNAMIC PRODUCT WIDGETS',
            description: 'Automatically synchronizes with the Connected Product',
            widgets: [
                { type: 'product-title', label: 'Product Title', icon: Type, desc: 'Auto-syncs with product name' },
                { type: 'product-price', label: 'Price & Discount', icon: DollarSign, desc: 'Price, regular price & save badge' },
                { type: 'product-image', label: 'Main Product Image', icon: ImageIcon, desc: 'Auto-syncs with main product image' },
                { type: 'product-gallery', label: 'Product Gallery', icon: Images, desc: 'Image thumbnail switcher' },
                { type: 'product-description', label: 'Product Description', icon: FileText, desc: 'Full rich HTML product details' },
                { type: 'product-features', label: 'Product Highlights', icon: ListChecks, desc: 'Features & specifications' },
                { type: 'product-reviews', label: 'Customer Reviews', icon: Star, desc: 'Verified buyer feedback & ratings' },
                { type: 'product-cta', label: 'Buy / Order Button', icon: ShoppingCart, desc: 'Direct smooth scroll to checkout' }
            ]
        },
        {
            name: 'CHECKOUT WIDGET',
            description: '1-Step Direct Cash on Delivery Checkout',
            widgets: [
                { type: 'checkout-form', label: 'COD Checkout Form', icon: CheckCircle2, desc: 'Direct 1-step order form for campaign conversions' }
            ]
        },
        {
            name: 'BASIC WIDGETS',
            description: 'Standard layout and content blocks',
            widgets: [
                { type: 'heading', label: 'Heading', icon: Type, desc: 'H1, H2, H3 title' },
                { type: 'text', label: 'Text Block', icon: AlignLeft, desc: 'Paragraph text / description' },
                { type: 'image', label: 'Custom Image', icon: ImageIcon, desc: 'Upload or insert image' },
                { type: 'video', label: 'Video Embed', icon: Video, desc: 'YouTube or Vimeo demo' },
                { type: 'button', label: 'Action Button', icon: MousePointerClick, desc: 'Custom link / WhatsApp button' },
                { type: 'trust-badges', label: 'Trust Badges', icon: ShieldCheck, desc: 'COD, Fast Delivery, Easy Return' },
                { type: 'divider', label: 'Divider', icon: Minus, desc: 'Separation line' },
                { type: 'spacer', label: 'Spacer', icon: ArrowUpDown, desc: 'Adjustable blank vertical gap' }
            ]
        }
    ];

    // ── Helper to find selected element or section ─────────────────────────────
    let selectedElement: ElementItem | null = null;
    let selectedElementSection: SectionItem | null = null;

    if (selectedElementId) {
        for (const sec of sections) {
            const found = sec.children.find(c => c.id === selectedElementId);
            if (found) {
                selectedElement = found;
                selectedElementSection = sec;
                break;
            }
        }
    }

    const selectedSection = selectedSectionId 
        ? sections.find(s => s.id === selectedSectionId) || null 
        : null;

    // ── Add Section / Container with Specific Layout ───────────────────────────
    const addSectionWithLayout = (layout: '1-col' | '2-col' | '3-col' | '4-col' | 'left-sidebar' | 'right-sidebar', bg = '#ffffff') => {
        const newSecId = `sec_${Date.now()}`;
        const newSection: SectionItem = {
            id: newSecId,
            type: 'section',
            settings: { 
                background: bg, 
                paddingY: 'py-8', 
                containerWidth: layout === '4-col' ? 'wide' : 'default',
                layout: layout,
                gap: 'md',
                borderRadius: 'none',
                shadow: 'none'
            },
            children: []
        };
        updateSectionsWithHistory([...sections, newSection]);
        setSelectedSectionId(newSecId);
        setSelectedElementId(null);
        setShowStructurePicker(false);
        toast.success(`Added new ${layout} Container Section! 🎉`);
    };

    // ── Add Elements to Section ────────────────────────────────────────────────
    const addElementToSection = (sectionId: string, widgetType: string) => {
        // If user selected a Container widget from the sidebar, convert section layout or create container
        if (widgetType.startsWith('container-')) {
            if (widgetType === 'container-2') {
                updateSectionData(sectionId, { layout: '2-col', gap: 'md' });
                toast.success('Section converted to 2-Column Container Layout');
                return;
            } else if (widgetType === 'container-3') {
                updateSectionData(sectionId, { layout: '3-col', gap: 'md' });
                toast.success('Section converted to 3-Column Container Layout');
                return;
            } else if (widgetType === 'container-4') {
                updateSectionData(sectionId, { layout: '4-col', gap: 'md', containerWidth: 'wide' });
                toast.success('Section converted to 4-Column Container Layout');
                return;
            } else if (widgetType === 'container-sidebar') {
                updateSectionData(sectionId, { layout: 'left-sidebar', gap: 'md' });
                toast.success('Section converted to Sidebar + Content Layout');
                return;
            } else if (widgetType === 'container-card') {
                updateSectionData(sectionId, { 
                    background: '#FAFDFB', 
                    borderRadius: 'rounded-2xl', 
                    borderStyle: 'solid', 
                    borderWidth: '1px', 
                    borderColor: '#D1F2DE', 
                    shadow: 'shadow-md',
                    paddingY: 'py-6'
                });
                toast.success('Section styled as Promo Card Container');
                return;
            }
        }

        const newElId = `el_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
        let defaultContent: Record<string, any> = {};
        let defaultStyle: Record<string, any> = {};

        switch (widgetType) {
            case 'heading':
                defaultContent = { text: 'নতুন আকর্ষণীয় হেডলাইন লিখুন', tag: 'h2' };
                defaultStyle = { fontSize: 'text-2xl md:text-3xl', fontWeight: 'font-black', textAlign: 'text-center', color: '#111827' };
                break;
            case 'text':
                defaultContent = { text: 'আপনার পণ্যের চমৎকার বৈশিষ্ট্য এবং আকর্ষণীয় অফার সম্পর্কিত তথ্য লিখুন।' };
                defaultStyle = { fontSize: 'text-base', textAlign: 'text-left', color: '#4B5563' };
                break;
            case 'image':
                defaultContent = { url: '/storage/defaults/default-product.svg', alt: 'Image' };
                defaultStyle = { align: 'center', maxWidth: 'max-w-lg', radius: 'rounded-xl' };
                break;
            case 'video':
                defaultContent = { url: activeProduct.youtube_url || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' };
                defaultStyle = { align: 'center' };
                break;
            case 'button':
                defaultContent = { text: 'এখনই কিনুন 🛍️', link: '#order-form' };
                defaultStyle = { bg: '#009E49', color: '#ffffff', size: 'md', radius: 'rounded-xl', align: 'center' };
                break;
            case 'trust-badges':
                defaultContent = {};
                defaultStyle = { marginY: 'my-4' };
                break;
            case 'product-title':
                defaultContent = {};
                defaultStyle = { fontSize: 'text-2xl md:text-3xl', fontWeight: 'font-black', textAlign: 'text-center', color: '#111827' };
                break;
            case 'product-price':
                defaultContent = {};
                defaultStyle = { align: 'center', marginY: 'my-3' };
                break;
            case 'product-image':
                defaultContent = {};
                defaultStyle = { align: 'center', maxWidth: 'max-w-md', radius: 'rounded-2xl' };
                break;
            case 'product-gallery':
                defaultContent = {};
                defaultStyle = { align: 'center' };
                break;
            case 'product-description':
                defaultContent = {};
                defaultStyle = { marginY: 'my-4' };
                break;
            case 'product-features':
                defaultContent = { items: ['১০০% অরিজিনাল পণ্য', 'সুপার ফাস্ট হোম ডেলিভারি', '৭ দিনের রিপ্লেসমেন্ট গ্যারান্টি'] };
                defaultStyle = {};
                break;
            case 'product-reviews':
                defaultContent = {};
                defaultStyle = { marginY: 'my-6' };
                break;
            case 'product-cta':
                defaultContent = { text: 'অর্ডার করতে নিচে যান 🛍️', target: '#order-form' };
                defaultStyle = { bg: '#009E49', color: '#ffffff', size: 'lg', radius: 'rounded-xl' };
                break;
            case 'checkout-form':
                defaultContent = { title: 'ক্যাশ অন ডেলিভারিতে অর্ডার করুন' };
                defaultStyle = {};
                break;
            case 'divider':
                defaultContent = {};
                defaultStyle = { color: '#E5E7EB', thickness: '1px', marginY: 'my-4' };
                break;
            case 'spacer':
                defaultContent = {};
                defaultStyle = { height: '32px' };
                break;
            default:
                break;
        }

        const newElement: ElementItem = {
            id: newElId,
            type: widgetType,
            content: defaultContent,
            style: defaultStyle,
            advanced: {}
        };

        const updated = sections.map(sec => {
            if (sec.id === sectionId) {
                return { ...sec, children: [...sec.children, newElement] };
            }
            return sec;
        });

        updateSectionsWithHistory(updated);
        setSelectedElementId(newElId);
        setSelectedSectionId(null);
        toast.success(`Added ${widgetType} widget`);
    };

    const deleteSection = (sectionId: string) => {
        if (sections.length <= 1) {
            toast.error('At least one section must remain.');
            return;
        }
        const updated = sections.filter(s => s.id !== sectionId);
        updateSectionsWithHistory(updated);
        if (selectedSectionId === sectionId) setSelectedSectionId(null);
        toast.success('Section deleted');
    };

    const duplicateSection = (sectionId: string) => {
        const index = sections.findIndex(s => s.id === sectionId);
        if (index === -1) return;
        const target = sections[index];
        const cloned: SectionItem = {
            ...target,
            id: `sec_${Date.now()}`,
            children: target.children.map(c => ({
                ...c,
                id: `el_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`
            }))
        };
        const updated = [...sections];
        updated.splice(index + 1, 0, cloned);
        updateSectionsWithHistory(updated);
        toast.success('Section duplicated');
    };

    const deleteElement = (elementId: string) => {
        const updated = sections.map(sec => ({
            ...sec,
            children: sec.children.filter(c => c.id !== elementId)
        }));
        updateSectionsWithHistory(updated);
        if (selectedElementId === elementId) setSelectedElementId(null);
        toast.success('Element deleted');
    };

    const duplicateElement = (elementId: string) => {
        let clonedId = '';
        const updated = sections.map(sec => {
            const index = sec.children.findIndex(c => c.id === elementId);
            if (index === -1) return sec;
            const target = sec.children[index];
            clonedId = `el_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
            const cloned: ElementItem = {
                ...target,
                id: clonedId
            };
            const newChildren = [...sec.children];
            newChildren.splice(index + 1, 0, cloned);
            return { ...sec, children: newChildren };
        });
        updateSectionsWithHistory(updated);
        setSelectedElementId(clonedId);
        toast.success('Element duplicated');
    };

    const moveElement = (elementId: string, direction: 'up' | 'down') => {
        const updated = sections.map(sec => {
            const index = sec.children.findIndex(c => c.id === elementId);
            if (index === -1) return sec;
            const newChildren = [...sec.children];
            if (direction === 'up' && index > 0) {
                const temp = newChildren[index - 1];
                newChildren[index - 1] = newChildren[index];
                newChildren[index] = temp;
            } else if (direction === 'down' && index < newChildren.length - 1) {
                const temp = newChildren[index + 1];
                newChildren[index + 1] = newChildren[index];
                newChildren[index] = temp;
            }
            return { ...sec, children: newChildren };
        });
        updateSectionsWithHistory(updated);
    };

    const updateElementData = (elementId: string, updates: { content?: any; style?: any; advanced?: any }) => {
        const updated = sections.map(sec => ({
            ...sec,
            children: sec.children.map(c => {
                if (c.id === elementId) {
                    return {
                        ...c,
                        content: { ...c.content, ...updates.content },
                        style: { ...c.style, ...updates.style },
                        advanced: { ...c.advanced, ...updates.advanced }
                    };
                }
                return c;
            })
        }));
        setSections(updated);
    };

    const updateSectionData = (sectionId: string, settings: any) => {
        const updated = sections.map(sec => {
            if (sec.id === sectionId) {
                return { ...sec, settings: { ...sec.settings, ...settings } };
            }
            return sec;
        });
        setSections(updated);
    };

    // ── Drag & Drop Handlers ───────────────────────────────────────────────────
    const [draggedWidgetType, setDraggedWidgetType] = useState<string | null>(null);

    const handleDragStartWidget = (e: React.DragEvent, widgetType: string) => {
        setDraggedWidgetType(widgetType);
        e.dataTransfer.setData('text/plain', widgetType);
    };

    const handleDropOnSection = (e: React.DragEvent, sectionId: string) => {
        e.preventDefault();
        const widgetType = e.dataTransfer.getData('text/plain') || draggedWidgetType;
        if (widgetType) {
            addElementToSection(sectionId, widgetType);
            setDraggedWidgetType(null);
        }
    };

    // ── Save / Publish Action ──────────────────────────────────────────────────
    const handleSave = (targetStatus?: 'published' | 'draft') => {
        if (!title.trim()) {
            toast.error('Please enter a Page Title.');
            setActiveTab('page-settings');
            return;
        }
        if (!slug.trim()) {
            toast.error('Please enter a URL Slug.');
            setActiveTab('page-settings');
            return;
        }
        if (!selectedProductId) {
            toast.error('Please select an Associated Product.');
            setActiveTab('page-settings');
            return;
        }

        setIsSaving(true);
        const finalStatus = targetStatus || status;

        const payload = {
            title,
            slug,
            product_id: selectedProductId,
            status: finalStatus,
            cta_button_text: ctaButtonText,
            facebook_pixel_id: facebookPixelId,
            ga_id: gaId,
            sections: sections
        };

        if (isCreate) {
            router.post(route('admin.landing-pages.store'), payload as any, {
                onSuccess: () => {
                    setIsSaving(false);
                    toast.success('Landing page created & published! 🎉');
                },
                onError: (errs) => {
                    setIsSaving(false);
                    const first = Object.values(errs)[0];
                    toast.error(String(first || 'Failed to save landing page.'));
                }
            });
        } else {
            router.put(route('admin.landing-pages.update', { id: page.id }), payload as any, {
                onSuccess: () => {
                    setIsSaving(false);
                    setStatus(finalStatus);
                    toast.success('Landing page saved successfully! 🎉');
                },
                onError: (errs) => {
                    setIsSaving(false);
                    const first = Object.values(errs)[0];
                    toast.error(String(first || 'Failed to update landing page.'));
                }
            });
        }
    };

    // ── Helper to determine section grid classes ──────────────────────────────
    const getSectionGridClass = (layout = '1-col', gap = 'md') => {
        const gapClass = gap === 'none' ? 'gap-0' : gap === 'sm' ? 'gap-3' : gap === 'lg' ? 'gap-8' : 'gap-6';

        switch (layout) {
            case '2-col':
                return `grid grid-cols-1 md:grid-cols-2 ${gapClass}`;
            case '3-col':
                return `grid grid-cols-1 md:grid-cols-3 ${gapClass}`;
            case '4-col':
                return `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 ${gapClass}`;
            case 'left-sidebar':
                return `grid grid-cols-1 md:grid-cols-3 ${gapClass} md:[&>*:first-child]:col-span-1 md:[&>*:last-child]:col-span-2`;
            case 'right-sidebar':
                return `grid grid-cols-1 md:grid-cols-3 ${gapClass} md:[&>*:first-child]:col-span-2 md:[&>*:last-child]:col-span-1`;
            default:
                return 'space-y-4';
        }
    };

    // ── Filtered Widgets ───────────────────────────────────────────────────────
    const filteredCategories = widgetCategories.map(cat => ({
        ...cat,
        widgets: cat.widgets.filter(w => 
            !searchQuery.trim() || 
            w.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            w.desc.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(cat => cat.widgets.length > 0);

    return (
        <div className="h-screen flex flex-col bg-[#F3F4F6] text-[#1E293B] overflow-hidden select-none font-sans">
            <Toaster position="top-center" richColors />
            <Head title={`Builder - ${title || 'New Landing Page'}`} />

            {/* ──────────────────────────────────────────────────────────────────
             * TOP TOOLBAR (Header)
             * ────────────────────────────────────────────────────────────────── */}
            <header className="h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between z-30 shrink-0 shadow-xs">
                
                {/* Left: Back & Title */}
                <div className="flex items-center gap-3">
                    <Link href={route('admin.landing-pages.index')}>
                        <button 
                            type="button"
                            title="Back to Landing Pages"
                            className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-colors border-none cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                    </Link>

                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-gray-900 line-clamp-1 max-w-[200px] md:max-w-xs">
                                {title || 'Untitled Landing Page'}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                                {status.toUpperCase()}
                            </span>
                        </div>
                        <p className="text-[11px] text-gray-400 font-mono line-clamp-1">
                            /page/{slug || '...'}
                        </p>
                    </div>
                </div>

                {/* Center: Viewport Switcher & Undo/Redo */}
                <div className="hidden md:flex items-center gap-4">
                    {/* Viewport switch */}
                    <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
                        <button
                            type="button"
                            onClick={() => setViewport('desktop')}
                            title="Desktop View (100%)"
                            className={`p-1.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${
                                viewport === 'desktop' ? 'bg-white text-[#009E49] shadow-xs' : 'text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            <Monitor className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewport('tablet')}
                            title="Tablet View (768px)"
                            className={`p-1.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${
                                viewport === 'tablet' ? 'bg-white text-[#009E49] shadow-xs' : 'text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            <Tablet className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewport('mobile')}
                            title="Mobile View (375px)"
                            className={`p-1.5 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${
                                viewport === 'mobile' ? 'bg-white text-[#009E49] shadow-xs' : 'text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            <Smartphone className="w-4 h-4" />
                        </button>
                    </div>

                    {/* History controls */}
                    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200">
                        <button
                            type="button"
                            onClick={handleUndo}
                            disabled={historyIndex <= 0}
                            title="Undo (Ctrl+Z)"
                            className="p-1.5 rounded-lg text-gray-600 hover:bg-white hover:text-gray-900 disabled:opacity-30 border-none transition-all cursor-pointer"
                        >
                            <Undo2 className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={handleRedo}
                            disabled={historyIndex >= history.length - 1}
                            title="Redo (Ctrl+Y)"
                            className="p-1.5 rounded-lg text-gray-600 hover:bg-white hover:text-gray-900 disabled:opacity-30 border-none transition-all cursor-pointer"
                        >
                            <Redo2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                    {slug && (
                        <a
                            href={route('landing.show', { slug })}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors"
                        >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                        </a>
                    )}

                    <button
                        type="button"
                        onClick={() => handleSave('draft')}
                        disabled={isSaving}
                        className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors border-none cursor-pointer"
                    >
                        Save Draft
                    </button>

                    <button
                        type="button"
                        onClick={() => handleSave('published')}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#009E49] hover:bg-[#007F3B] text-white text-xs font-bold shadow-[0_2px_10px_rgba(0,158,73,0.3)] transition-all active:scale-95 border-none cursor-pointer disabled:opacity-50"
                    >
                        <Save className="w-3.5 h-3.5" />
                        <span>{isSaving ? 'Saving...' : 'Publish'}</span>
                    </button>
                </div>
            </header>

            {/* ──────────────────────────────────────────────────────────────────
             * MAIN BUILDER WORKSPACE (3 Columns: Elements | Canvas | Inspector)
             * ────────────────────────────────────────────────────────────────── */}
            <div className="flex-1 flex overflow-hidden">

                {/* ── LEFT SIDEBAR (Elements / Page Settings / Layers) ──────────── */}
                <div className="w-72 md:w-80 bg-white border-r border-gray-200 flex flex-col shrink-0 z-20 shadow-xs">
                    {/* Navigation Tabs */}
                    <div className="flex border-b border-gray-200 bg-gray-50/50">
                        <button
                            type="button"
                            onClick={() => setActiveTab('elements')}
                            className={`flex-1 py-3 text-xs font-black flex items-center justify-center gap-1.5 border-b-2 transition-all border-none cursor-pointer ${
                                activeTab === 'elements' ? 'border-[#009E49] text-[#009E49] bg-white' : 'border-transparent text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            <Layout className="w-4 h-4" />
                            <span>Widgets</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('page-settings')}
                            className={`flex-1 py-3 text-xs font-black flex items-center justify-center gap-1.5 border-b-2 transition-all border-none cursor-pointer ${
                                activeTab === 'page-settings' ? 'border-[#009E49] text-[#009E49] bg-white' : 'border-transparent text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            <Settings className="w-4 h-4" />
                            <span>Settings</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('layers')}
                            className={`flex-1 py-3 text-xs font-black flex items-center justify-center gap-1.5 border-b-2 transition-all border-none cursor-pointer ${
                                activeTab === 'layers' ? 'border-[#009E49] text-[#009E49] bg-white' : 'border-transparent text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            <Layers className="w-4 h-4" />
                            <span>Layers</span>
                        </button>
                    </div>

                    {/* Tab 1: Elements Widget Library */}
                    {activeTab === 'elements' && (
                        <div className="flex-1 overflow-y-auto p-4 space-y-5">
                            {/* Search */}
                            <input
                                type="text"
                                placeholder="Search widgets & containers..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full h-9 px-3 rounded-xl border border-gray-200 bg-gray-50 text-xs focus:bg-white focus:border-[#009E49] focus:outline-none transition-all"
                            />

                            {/* Connected Product Notification pill */}
                            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">Connected Product</span>
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                                </div>
                                <p className="text-xs font-bold text-gray-900 line-clamp-1">{activeProduct.name || 'None'}</p>
                                <p className="text-[11px] text-[#E2231A] font-bold mt-0.5">৳{activeProduct.price || 0}</p>
                            </div>

                            {/* Quick Add Container Button */}
                            <button
                                type="button"
                                onClick={() => setShowStructurePicker(true)}
                                className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-300 text-[#009E49] rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer"
                            >
                                <Columns className="w-4 h-4" />
                                <span>+ Choose Container Structure</span>
                            </button>

                            {/* Widgets categories */}
                            {filteredCategories.map((cat, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="border-b border-gray-100 pb-1">
                                        <h4 className="text-[11px] font-black text-gray-800 uppercase tracking-wider">{cat.name}</h4>
                                        <p className="text-[10px] text-gray-400">{cat.description}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {cat.widgets.map(w => {
                                            const IconComp = w.icon;
                                            return (
                                                <div
                                                    key={w.type}
                                                    draggable
                                                    onDragStart={e => handleDragStartWidget(e, w.type)}
                                                    onClick={() => {
                                                        const targetSecId = selectedSectionId || sections[0]?.id;
                                                        if (targetSecId) addElementToSection(targetSecId, w.type);
                                                        else addSectionWithLayout('1-col');
                                                    }}
                                                    className="p-3 bg-gray-50 hover:bg-emerald-50 hover:border-[#009E49] border border-gray-200 rounded-xl cursor-grab active:cursor-grabbing transition-all flex flex-col items-center text-center group"
                                                    title={`Click or drag to add ${w.label}`}
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-white shadow-2xs flex items-center justify-center text-gray-600 group-hover:text-[#009E49] group-hover:scale-110 transition-transform mb-1.5">
                                                        <IconComp className="w-4 h-4" />
                                                    </div>
                                                    <span className="text-[11px] font-bold text-gray-800 group-hover:text-[#009E49] line-clamp-1">{w.label}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Tab 2: Page Settings */}
                    {activeTab === 'page-settings' && (
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Page Title <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="w-full h-9 px-3 rounded-xl border border-gray-200 text-xs focus:border-[#009E49] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">URL Slug <span className="text-red-500">*</span></label>
                                <div className="flex items-center">
                                    <span className="bg-gray-100 text-gray-500 text-xs px-2.5 h-9 rounded-l-xl border border-r-0 border-gray-200 flex items-center">/page/</span>
                                    <input
                                        type="text"
                                        value={slug}
                                        onChange={e => setSlug(e.target.value)}
                                        className="w-full h-9 px-3 rounded-r-xl border border-gray-200 text-xs focus:border-[#009E49] focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Connected Product <span className="text-red-500">*</span></label>
                                <select
                                    value={selectedProductId}
                                    onChange={e => handleProductChange(e.target.value)}
                                    className="w-full h-9 px-3 rounded-xl border border-gray-200 text-xs focus:border-[#009E49] focus:outline-none"
                                >
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>
                                            {p.name} (৳{p.price})
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[11px] text-gray-400 mt-1">Changing product automatically updates all dynamic widgets!</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Publish Status</label>
                                <select
                                    value={status}
                                    onChange={e => setStatus(e.target.value as any)}
                                    className="w-full h-9 px-3 rounded-xl border border-gray-200 text-xs focus:border-[#009E49] focus:outline-none"
                                >
                                    <option value="published">Published</option>
                                    <option value="draft">Draft</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">CTA Button Default Text</label>
                                <input
                                    type="text"
                                    value={ctaButtonText}
                                    onChange={e => setCtaButtonText(e.target.value)}
                                    className="w-full h-9 px-3 rounded-xl border border-gray-200 text-xs focus:border-[#009E49] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Facebook Pixel ID</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 1234567890"
                                    value={facebookPixelId}
                                    onChange={e => setFacebookPixelId(e.target.value)}
                                    className="w-full h-9 px-3 rounded-xl border border-gray-200 text-xs focus:border-[#009E49] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Google Analytics ID</label>
                                <input
                                    type="text"
                                    placeholder="e.g. G-XXXXXXXXXX"
                                    value={gaId}
                                    onChange={e => setGaId(e.target.value)}
                                    className="w-full h-9 px-3 rounded-xl border border-gray-200 text-xs focus:border-[#009E49] focus:outline-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* Tab 3: Structure / Layers Navigator */}
                    {activeTab === 'layers' && (
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            <div className="flex items-center justify-between pb-2 border-b">
                                <span className="text-xs font-bold text-gray-700">Containers & Elements</span>
                                <button
                                    type="button"
                                    onClick={() => setShowStructurePicker(true)}
                                    className="text-[11px] font-bold text-[#009E49] flex items-center gap-1 border-none bg-transparent cursor-pointer"
                                >
                                    <Plus className="w-3 h-3" /> Add Container
                                </button>
                            </div>

                            <div className="space-y-2">
                                {sections.map((sec, sIdx) => (
                                    <div key={sec.id} className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                                        <div 
                                            onClick={() => { setSelectedSectionId(sec.id); setSelectedElementId(null); }}
                                            className={`p-2 px-3 flex items-center justify-between cursor-pointer ${
                                                selectedSectionId === sec.id ? 'bg-emerald-100/60 font-black text-[#009E49]' : 'text-gray-700'
                                            }`}
                                        >
                                            <div className="flex items-center gap-1.5">
                                                <Box className="w-3.5 h-3.5 text-gray-400" />
                                                <span className="text-xs font-bold">Container {sIdx + 1} ({sec.settings.layout || '1-col'})</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); duplicateSection(sec.id); }}
                                                    title="Duplicate Section"
                                                    className="p-1 text-gray-400 hover:text-gray-700 border-none bg-transparent cursor-pointer"
                                                >
                                                    <Copy className="w-3 h-3" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); deleteSection(sec.id); }}
                                                    title="Delete Section"
                                                    className="p-1 text-gray-400 hover:text-red-500 border-none bg-transparent cursor-pointer"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>

                                        {sec.children.length > 0 && (
                                            <div className="p-1 pl-4 space-y-1 bg-white border-t border-gray-100">
                                                {sec.children.map(el => (
                                                    <div
                                                        key={el.id}
                                                        onClick={() => { setSelectedElementId(el.id); setSelectedSectionId(null); }}
                                                        className={`p-1.5 px-2.5 rounded-lg text-xs flex items-center justify-between cursor-pointer ${
                                                            selectedElementId === el.id ? 'bg-[#009E49] text-white font-bold' : 'text-gray-600 hover:bg-gray-100'
                                                        }`}
                                                    >
                                                        <span className="truncate">{el.type}</span>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); deleteElement(el.id); }}
                                                            className="text-gray-300 hover:text-red-500 border-none bg-transparent cursor-pointer"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── CENTER CANVAS (Interactive Live Drag & Drop Preview) ───────── */}
                <div className="flex-1 bg-[#EAEBF0] overflow-y-auto p-4 md:p-8 flex justify-center items-start">
                    
                    {/* Viewport Frame Container */}
                    <div 
                        className={`transition-all duration-300 bg-white min-h-[85vh] shadow-xl rounded-2xl overflow-hidden border border-gray-300 flex flex-col ${
                            viewport === 'mobile' ? 'w-[375px]' : viewport === 'tablet' ? 'w-[768px]' : 'w-full max-w-4xl'
                        }`}
                    >
                        {/* Mock Urgency bar */}
                        <div className="bg-[#E2231A] text-white text-[11px] font-bold py-1.5 text-center flex items-center justify-center gap-1.5">
                            <Flame className="w-3.5 h-3.5 animate-bounce" />
                            <span>সীমিত সময়ের অফার! দ্রুত অর্ডার কনফার্ম করুন</span>
                        </div>

                        {/* Render Sections / Containers */}
                        <div className="flex-1 flex flex-col">
                            {sections.map((sec, secIdx) => {
                                const gridClass = getSectionGridClass(sec.settings.layout, sec.settings.gap);
                                const radiusClass = sec.settings.borderRadius || 'none';
                                const shadowClass = sec.settings.shadow || 'none';
                                const borderClass = sec.settings.borderStyle && sec.settings.borderStyle !== 'none' 
                                    ? `border-${sec.settings.borderStyle}` 
                                    : '';

                                return (
                                    <section
                                        key={sec.id}
                                        onDragOver={e => e.preventDefault()}
                                        onDrop={e => handleDropOnSection(e, sec.id)}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedSectionId(sec.id);
                                            setSelectedElementId(null);
                                        }}
                                        className={`relative group px-4 md:px-8 transition-all ${sec.settings.paddingY || 'py-6'} ${radiusClass} ${shadowClass} ${borderClass} ${
                                            selectedSectionId === sec.id ? 'ring-2 ring-[#009E49] ring-inset' : 'hover:ring-1 hover:ring-emerald-300'
                                        }`}
                                        style={{ 
                                            backgroundColor: sec.settings.background || '#ffffff',
                                            borderColor: sec.settings.borderColor || '#E5E7EB',
                                            borderWidth: sec.settings.borderWidth || '0px'
                                        }}
                                    >
                                        {/* Container Floating Toolbar on Hover */}
                                        <div className="absolute top-2 right-2 z-20 hidden group-hover:flex items-center gap-1 bg-gray-900/85 text-white p-1 rounded-lg backdrop-blur-xs text-[10px]">
                                            <span className="px-1 font-bold">Container {secIdx + 1} ({sec.settings.layout || '1-col'})</span>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); duplicateSection(sec.id); }}
                                                className="p-1 hover:text-emerald-400 border-none bg-transparent cursor-pointer text-white"
                                                title="Duplicate Container"
                                            >
                                                <Copy className="w-3 h-3" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); deleteSection(sec.id); }}
                                                className="p-1 hover:text-red-400 border-none bg-transparent cursor-pointer text-white"
                                                title="Delete Container"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>

                                        {/* Section Container Content Grid */}
                                        <div className={`mx-auto ${
                                            sec.settings.containerWidth === 'narrow' ? 'max-w-xl' : sec.settings.containerWidth === 'wide' ? 'max-w-5xl' : sec.settings.containerWidth === 'full' ? 'w-full' : 'max-w-3xl'
                                        }`}>
                                            {sec.children.length === 0 ? (
                                                <div className="border-2 border-dashed border-gray-300 rounded-2xl py-10 px-4 text-center">
                                                    <Box className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                                    <p className="text-xs font-bold text-gray-600">Container ({sec.settings.layout || '1-col'}) is empty</p>
                                                    <p className="text-[11px] text-gray-400 mt-0.5">Drag widgets from the left or click below</p>
                                                    <div className="flex flex-wrap justify-center gap-2 mt-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => addElementToSection(sec.id, 'heading')}
                                                            className="px-3 py-1 bg-gray-100 hover:bg-emerald-50 text-xs font-bold rounded-lg border border-gray-200"
                                                        >
                                                            + Heading
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => addElementToSection(sec.id, 'product-price')}
                                                            className="px-3 py-1 bg-gray-100 hover:bg-emerald-50 text-xs font-bold rounded-lg border border-gray-200"
                                                        >
                                                            + Price
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => addElementToSection(sec.id, 'checkout-form')}
                                                            className="px-3 py-1 bg-gray-100 hover:bg-emerald-50 text-xs font-bold rounded-lg border border-gray-200"
                                                        >
                                                            + Checkout Form
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className={gridClass}>
                                                    {sec.children.map((el, elIdx) => (
                                                        <div
                                                            key={el.id}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedElementId(el.id);
                                                                setSelectedSectionId(null);
                                                            }}
                                                            className={`relative group/el p-2 rounded-xl transition-all ${
                                                                selectedElementId === el.id 
                                                                    ? 'ring-2 ring-[#009E49] bg-emerald-50/20' 
                                                                    : 'hover:ring-1 hover:ring-blue-300'
                                                            }`}
                                                        >
                                                            {/* Element Floating Controls */}
                                                            <div className="absolute top-0 right-0 -translate-y-1/2 hidden group-hover/el:flex items-center gap-1 bg-[#009E49] text-white px-2 py-0.5 rounded-md text-[9px] font-bold z-20 shadow-sm">
                                                                <span>{el.type}</span>
                                                                <button 
                                                                    type="button" 
                                                                    onClick={(e) => { e.stopPropagation(); moveElement(el.id, 'up'); }}
                                                                    disabled={elIdx === 0}
                                                                    className="hover:text-amber-200 border-none bg-transparent cursor-pointer text-white disabled:opacity-30"
                                                                >
                                                                    ↑
                                                                </button>
                                                                <button 
                                                                    type="button" 
                                                                    onClick={(e) => { e.stopPropagation(); moveElement(el.id, 'down'); }}
                                                                    disabled={elIdx === sec.children.length - 1}
                                                                    className="hover:text-amber-200 border-none bg-transparent cursor-pointer text-white disabled:opacity-30"
                                                                >
                                                                    ↓
                                                                </button>
                                                                <button 
                                                                    type="button" 
                                                                    onClick={(e) => { e.stopPropagation(); duplicateElement(el.id); }}
                                                                    className="hover:text-amber-200 border-none bg-transparent cursor-pointer text-white"
                                                                >
                                                                    <Copy className="w-2.5 h-2.5" />
                                                                </button>
                                                                <button 
                                                                    type="button" 
                                                                    onClick={(e) => { e.stopPropagation(); deleteElement(el.id); }}
                                                                    className="hover:text-red-200 border-none bg-transparent cursor-pointer text-white"
                                                                >
                                                                    <Trash2 className="w-2.5 h-2.5" />
                                                                </button>
                                                            </div>

                                                            {/* ── Widget Renderers Inside Canvas ── */}

                                                            {/* Heading */}
                                                            {el.type === 'heading' && (
                                                                <div className={`${el.style.textAlign || 'text-center'}`}>
                                                                    <h2 
                                                                        className={`${el.style.fontSize || 'text-2xl'} ${el.style.fontWeight || 'font-black'} leading-tight`}
                                                                        style={{ color: el.style.color || '#111827' }}
                                                                    >
                                                                        {el.content.text || 'Heading Text'}
                                                                    </h2>
                                                                </div>
                                                            )}

                                                            {/* Text */}
                                                            {el.type === 'text' && (
                                                                <div className={`${el.style.textAlign || 'text-left'} leading-relaxed`} style={{ color: el.style.color || '#4B5563' }}>
                                                                    <p className={`${el.style.fontSize || 'text-sm'}`}>
                                                                        {el.content.text}
                                                                    </p>
                                                                </div>
                                                            )}

                                                            {/* Image */}
                                                            {el.type === 'image' && (
                                                                <div className={`flex justify-${el.style.align === 'left' ? 'start' : el.style.align === 'right' ? 'end' : 'center'}`}>
                                                                    <img
                                                                        src={el.content.url || '/storage/defaults/default-product.svg'}
                                                                        alt={el.content.alt || ''}
                                                                        className={`max-w-full ${el.style.maxWidth || 'max-w-md'} ${el.style.radius || 'rounded-xl'} ${el.style.shadow || ''} object-cover`}
                                                                    />
                                                                </div>
                                                            )}

                                                            {/* Video */}
                                                            {el.type === 'video' && (
                                                                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black/5 border border-gray-200 flex items-center justify-center">
                                                                    <iframe
                                                                        src={(el.content.url || '').replace('watch?v=', 'embed/')}
                                                                        className="w-full h-full"
                                                                        title="Video"
                                                                    />
                                                                </div>
                                                            )}

                                                            {/* Button */}
                                                            {el.type === 'button' && (
                                                                <div className={`flex justify-${el.style.align === 'left' ? 'start' : el.style.align === 'right' ? 'end' : 'center'}`}>
                                                                    <button
                                                                        type="button"
                                                                        className={`px-6 py-3 font-bold ${el.style.radius || 'rounded-xl'} shadow-md transition-transform active:scale-95 border-none`}
                                                                        style={{ backgroundColor: el.style.bg || '#009E49', color: el.style.color || '#ffffff' }}
                                                                    >
                                                                        {el.content.text || 'Click Here'}
                                                                    </button>
                                                                </div>
                                                            )}

                                                            {/* Trust Badges */}
                                                            {el.type === 'trust-badges' && (
                                                                <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold text-gray-600">
                                                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center">
                                                                        <ShieldCheck className="w-5 h-5 text-[#009E49] mb-1" />
                                                                        <span>১০০% আসল পণ্য</span>
                                                                    </div>
                                                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center">
                                                                        <CheckCircle2 className="w-5 h-5 text-[#009E49] mb-1" />
                                                                        <span>ক্যাশ অন ডেলিভারি</span>
                                                                    </div>
                                                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex flex-col items-center">
                                                                        <Sparkles className="w-5 h-5 text-[#009E49] mb-1" />
                                                                        <span>৭ দিনের গ্যারান্টি</span>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Dynamic Product Title */}
                                                            {el.type === 'product-title' && (
                                                                <div className={`${el.style.textAlign || 'text-center'}`}>
                                                                    <h2 className={`${el.style.fontSize || 'text-2xl md:text-3xl'} ${el.style.fontWeight || 'font-black'} text-gray-900`}>
                                                                        {activeProduct.name || 'Product Title (Dynamic)'}
                                                                    </h2>
                                                                </div>
                                                            )}

                                                            {/* Dynamic Product Price */}
                                                            {el.type === 'product-price' && (
                                                                <div className="flex items-baseline justify-center gap-3 my-2">
                                                                    <span className="text-3xl font-black text-[#E2231A]">
                                                                        ৳{activeProduct.price || 0}
                                                                    </span>
                                                                    {activeProduct.compare_at_price && parseFloat(activeProduct.compare_at_price) > parseFloat(activeProduct.price) && (
                                                                        <span className="text-lg font-bold text-gray-400 line-through">
                                                                            ৳{activeProduct.compare_at_price}
                                                                        </span>
                                                                    )}
                                                                    {activeProduct.discount_percentage > 0 && (
                                                                        <span className="text-xs font-bold text-[#009E49] bg-emerald-100 px-2 py-0.5 rounded-md">
                                                                            {activeProduct.discount_percentage}% Save
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Dynamic Product Image */}
                                                            {el.type === 'product-image' && (
                                                                <div className="flex justify-center">
                                                                    <img
                                                                        src={activeProduct.images?.[0]?.image_path || '/storage/defaults/default-product.svg'}
                                                                        alt={activeProduct.name || ''}
                                                                        className="max-w-md w-full aspect-square object-cover rounded-2xl border border-gray-200 shadow-md"
                                                                    />
                                                                </div>
                                                            )}

                                                            {/* Dynamic Product Description */}
                                                            {el.type === 'product-description' && (
                                                                <div 
                                                                    className="prose max-w-none text-gray-700 text-sm leading-relaxed p-4 bg-gray-50/50 rounded-2xl border border-gray-200"
                                                                    dangerouslySetInnerHTML={{ __html: activeProduct.description || activeProduct.short_description || '<p>Product description will appear here.</p>' }}
                                                                />
                                                            )}

                                                            {/* Dynamic Product CTA Button */}
                                                            {el.type === 'product-cta' && (
                                                                <div className="flex justify-center">
                                                                    <button
                                                                        type="button"
                                                                        className="w-full max-w-md h-14 rounded-xl bg-[#009E49] text-white text-base font-black flex items-center justify-center gap-2 shadow-lg border-none"
                                                                    >
                                                                        <ShoppingCart className="w-5 h-5" />
                                                                        <span>{el.content.text || ctaButtonText}</span>
                                                                    </button>
                                                                </div>
                                                            )}

                                                            {/* Dynamic Direct Cash on Delivery Checkout Form */}
                                                            {el.type === 'checkout-form' && (
                                                                <div className="p-6 rounded-2xl border-2 border-[#009E49] bg-white shadow-md space-y-4">
                                                                    <div className="bg-[#009E49] text-white -mx-6 -mt-6 p-4 rounded-t-xl text-center">
                                                                        <h3 className="text-base font-black">{el.content.title || 'অর্ডার ফর্ম (ক্যাশ অন ডেলিভারি)'}</h3>
                                                                    </div>

                                                                    <div className="flex items-center gap-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-200">
                                                                        <img
                                                                            src={activeProduct.images?.[0]?.image_path || '/storage/defaults/default-product.svg'}
                                                                            className="w-12 h-12 rounded-lg object-cover"
                                                                            alt=""
                                                                        />
                                                                        <div>
                                                                            <p className="text-xs font-bold text-gray-900 line-clamp-1">{activeProduct.name || 'Product'}</p>
                                                                            <p className="text-xs font-black text-[#E2231A]">৳{activeProduct.price || 0}</p>
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-3 opacity-90 pointer-events-none">
                                                                        <input type="text" placeholder="আপনার পুরো নাম" className="w-full h-10 px-3 rounded-lg border border-gray-300 text-xs bg-gray-50" readOnly />
                                                                        <input type="tel" placeholder="মোবাইল নম্বর" className="w-full h-10 px-3 rounded-lg border border-gray-300 text-xs bg-gray-50" readOnly />
                                                                        <input type="text" placeholder="জেলা সিলেক্ট করুন" className="w-full h-10 px-3 rounded-lg border border-gray-300 text-xs bg-gray-50" readOnly />
                                                                        <textarea placeholder="সম্পূর্ণ ঠিকানা" rows={2} className="w-full p-3 rounded-lg border border-gray-300 text-xs bg-gray-50" readOnly />
                                                                        <button type="button" className="w-full h-12 bg-[#E2231A] text-white font-black text-sm rounded-xl border-none">
                                                                            অর্ডার কনফার্ম করুন (ক্যাশ অন ডেলিভারি)
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Spacer */}
                                                            {el.type === 'spacer' && (
                                                                <div style={{ height: el.style.height || '32px' }} className="w-full bg-blue-50/20 border border-dashed border-blue-200 rounded flex items-center justify-center text-[10px] text-blue-400">
                                                                    Spacer ({el.style.height || '32px'})
                                                                </div>
                                                            )}

                                                            {/* Divider */}
                                                            {el.type === 'divider' && (
                                                                <hr style={{ borderColor: el.style.color || '#E5E7EB', borderWidth: el.style.thickness || '1px' }} />
                                                            )}

                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                );
                            })}
                        </div>

                        {/* Elementor-Style Structure Picker Modal / Selector */}
                        {showStructurePicker ? (
                            <div className="p-6 bg-emerald-50/80 border-t border-emerald-200 text-center animate-in fade-in duration-200">
                                <div className="flex items-center justify-between max-w-xl mx-auto mb-4">
                                    <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900">
                                        Choose Container Structure
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={() => setShowStructurePicker(false)}
                                        className="text-gray-400 hover:text-gray-700 border-none bg-transparent cursor-pointer"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 max-w-xl mx-auto">
                                    {/* 1 Col */}
                                    <button
                                        type="button"
                                        onClick={() => addSectionWithLayout('1-col')}
                                        className="p-3 bg-white hover:bg-emerald-100/50 border-2 border-dashed border-emerald-400 rounded-xl flex flex-col items-center gap-1.5 transition-all cursor-pointer group"
                                    >
                                        <div className="w-full h-8 bg-emerald-200/60 rounded border border-emerald-300"></div>
                                        <span className="text-[10px] font-black text-gray-700 group-hover:text-emerald-800">1 Col</span>
                                    </button>

                                    {/* 2 Col (50/50) */}
                                    <button
                                        type="button"
                                        onClick={() => addSectionWithLayout('2-col')}
                                        className="p-3 bg-white hover:bg-emerald-100/50 border-2 border-dashed border-emerald-400 rounded-xl flex flex-col items-center gap-1.5 transition-all cursor-pointer group"
                                    >
                                        <div className="w-full h-8 flex gap-1">
                                            <div className="flex-1 bg-emerald-200/60 rounded border border-emerald-300"></div>
                                            <div className="flex-1 bg-emerald-200/60 rounded border border-emerald-300"></div>
                                        </div>
                                        <span className="text-[10px] font-black text-gray-700 group-hover:text-emerald-800">2 Col (50/50)</span>
                                    </button>

                                    {/* 3 Col (33/33/33) */}
                                    <button
                                        type="button"
                                        onClick={() => addSectionWithLayout('3-col')}
                                        className="p-3 bg-white hover:bg-emerald-100/50 border-2 border-dashed border-emerald-400 rounded-xl flex flex-col items-center gap-1.5 transition-all cursor-pointer group"
                                    >
                                        <div className="w-full h-8 flex gap-1">
                                            <div className="flex-1 bg-emerald-200/60 rounded border border-emerald-300"></div>
                                            <div className="flex-1 bg-emerald-200/60 rounded border border-emerald-300"></div>
                                            <div className="flex-1 bg-emerald-200/60 rounded border border-emerald-300"></div>
                                        </div>
                                        <span className="text-[10px] font-black text-gray-700 group-hover:text-emerald-800">3 Col</span>
                                    </button>

                                    {/* 4 Col */}
                                    <button
                                        type="button"
                                        onClick={() => addSectionWithLayout('4-col')}
                                        className="p-3 bg-white hover:bg-emerald-100/50 border-2 border-dashed border-emerald-400 rounded-xl flex flex-col items-center gap-1.5 transition-all cursor-pointer group"
                                    >
                                        <div className="w-full h-8 flex gap-0.5">
                                            <div className="flex-1 bg-emerald-200/60 rounded border border-emerald-300"></div>
                                            <div className="flex-1 bg-emerald-200/60 rounded border border-emerald-300"></div>
                                            <div className="flex-1 bg-emerald-200/60 rounded border border-emerald-300"></div>
                                            <div className="flex-1 bg-emerald-200/60 rounded border border-emerald-300"></div>
                                        </div>
                                        <span className="text-[10px] font-black text-gray-700 group-hover:text-emerald-800">4 Col</span>
                                    </button>

                                    {/* Left Sidebar */}
                                    <button
                                        type="button"
                                        onClick={() => addSectionWithLayout('left-sidebar')}
                                        className="p-3 bg-white hover:bg-emerald-100/50 border-2 border-dashed border-emerald-400 rounded-xl flex flex-col items-center gap-1.5 transition-all cursor-pointer group"
                                    >
                                        <div className="w-full h-8 flex gap-1">
                                            <div className="w-1/3 bg-emerald-200/60 rounded border border-emerald-300"></div>
                                            <div className="w-2/3 bg-emerald-200/60 rounded border border-emerald-300"></div>
                                        </div>
                                        <span className="text-[10px] font-black text-gray-700 group-hover:text-emerald-800">30 / 70</span>
                                    </button>

                                    {/* Right Sidebar */}
                                    <button
                                        type="button"
                                        onClick={() => addSectionWithLayout('right-sidebar')}
                                        className="p-3 bg-white hover:bg-emerald-100/50 border-2 border-dashed border-emerald-400 rounded-xl flex flex-col items-center gap-1.5 transition-all cursor-pointer group"
                                    >
                                        <div className="w-full h-8 flex gap-1">
                                            <div className="w-2/3 bg-emerald-200/60 rounded border border-emerald-300"></div>
                                            <div className="w-1/3 bg-emerald-200/60 rounded border border-emerald-300"></div>
                                        </div>
                                        <span className="text-[10px] font-black text-gray-700 group-hover:text-emerald-800">70 / 30</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Add Section Button At Bottom */
                            <div className="p-6 bg-gray-50 text-center border-t border-gray-200 flex justify-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowStructurePicker(true)}
                                    className="px-5 py-2.5 rounded-xl bg-[#009E49] text-white text-xs font-black hover:bg-[#007F3B] transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer border-none"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>+ Add Container Section</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── RIGHT SIDEBAR (Element & Container Inspector Controls) ───── */}
                <div className="w-72 md:w-80 bg-white border-l border-gray-200 flex flex-col shrink-0 z-20 shadow-xs">
                    
                    {/* Header */}
                    <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
                        <div>
                            <span className="text-[10px] font-black uppercase text-gray-400">Inspector</span>
                            <h3 className="text-xs font-black text-gray-900">
                                {selectedElement ? `${selectedElement.type.toUpperCase()} Settings` : selectedSection ? 'CONTAINER / SECTION' : 'Select an element'}
                            </h3>
                        </div>
                        {(selectedElement || selectedSection) && (
                            <button
                                type="button"
                                onClick={() => { setSelectedElementId(null); setSelectedSectionId(null); }}
                                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 border-none bg-transparent cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Inspector Content */}
                    {selectedElement ? (
                        <div className="flex-1 flex flex-col overflow-hidden">
                            {/* Tabs */}
                            <div className="flex border-b border-gray-200 bg-white">
                                <button
                                    type="button"
                                    onClick={() => setActiveInspectorTab('content')}
                                    className={`flex-1 py-2 text-[11px] font-bold border-b-2 transition-all border-none cursor-pointer ${
                                        activeInspectorTab === 'content' ? 'border-[#009E49] text-[#009E49]' : 'border-transparent text-gray-500'
                                    }`}
                                >
                                    Content
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveInspectorTab('style')}
                                    className={`flex-1 py-2 text-[11px] font-bold border-b-2 transition-all border-none cursor-pointer ${
                                        activeInspectorTab === 'style' ? 'border-[#009E49] text-[#009E49]' : 'border-transparent text-gray-500'
                                    }`}
                                >
                                    Style
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {activeInspectorTab === 'content' && (
                                    <>
                                        {/* Text/Heading content */}
                                        {['heading', 'text', 'button', 'product-cta'].includes(selectedElement.type) && (
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1">Text Content</label>
                                                <textarea
                                                    rows={3}
                                                    value={selectedElement.content.text || ''}
                                                    onChange={e => updateElementData(selectedElement!.id, { content: { text: e.target.value } })}
                                                    className="w-full p-2 rounded-xl border border-gray-200 text-xs focus:border-[#009E49] focus:outline-none"
                                                />
                                            </div>
                                        )}

                                        {/* Tag for heading */}
                                        {selectedElement.type === 'heading' && (
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1">HTML Tag</label>
                                                <select
                                                    value={selectedElement.content.tag || 'h2'}
                                                    onChange={e => updateElementData(selectedElement!.id, { content: { tag: e.target.value } })}
                                                    className="w-full h-9 px-3 rounded-xl border border-gray-200 text-xs"
                                                >
                                                    <option value="h1">H1 (Main Headline)</option>
                                                    <option value="h2">H2 (Section Headline)</option>
                                                    <option value="h3">H3 (Sub-heading)</option>
                                                    <option value="h4">H4 (Small title)</option>
                                                </select>
                                            </div>
                                        )}

                                        {/* Image URL */}
                                        {selectedElement.type === 'image' && (
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1">Image URL</label>
                                                <input
                                                    type="text"
                                                    value={selectedElement.content.url || ''}
                                                    onChange={e => updateElementData(selectedElement!.id, { content: { url: e.target.value } })}
                                                    className="w-full h-9 px-3 rounded-xl border border-gray-200 text-xs"
                                                />
                                            </div>
                                        )}

                                        {/* Video URL */}
                                        {selectedElement.type === 'video' && (
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1">YouTube URL</label>
                                                <input
                                                    type="text"
                                                    value={selectedElement.content.url || ''}
                                                    onChange={e => updateElementData(selectedElement!.id, { content: { url: e.target.value } })}
                                                    className="w-full h-9 px-3 rounded-xl border border-gray-200 text-xs"
                                                />
                                            </div>
                                        )}

                                        {/* Button link */}
                                        {['button', 'product-cta'].includes(selectedElement.type) && (
                                            <div>
                                                <label className="block text-xs font-bold text-gray-700 mb-1">Target Link / Anchor</label>
                                                <input
                                                    type="text"
                                                    placeholder="#order-form or https://..."
                                                    value={selectedElement.content.link || selectedElement.content.target || '#order-form'}
                                                    onChange={e => updateElementData(selectedElement!.id, { content: { link: e.target.value, target: e.target.value } })}
                                                    className="w-full h-9 px-3 rounded-xl border border-gray-200 text-xs"
                                                />
                                            </div>
                                        )}
                                    </>
                                )}

                                {activeInspectorTab === 'style' && (
                                    <>
                                        {/* Text Align */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Alignment</label>
                                            <div className="flex gap-1">
                                                {['text-left', 'text-center', 'text-right'].map(align => (
                                                    <button
                                                        key={align}
                                                        type="button"
                                                        onClick={() => updateElementData(selectedElement!.id, { style: { textAlign: align, align: align.replace('text-', '') } })}
                                                        className={`flex-1 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                                                            selectedElement!.style.textAlign === align || selectedElement!.style.align === align.replace('text-', '')
                                                                ? 'bg-[#009E49] text-white border-[#009E49]'
                                                                : 'bg-gray-50 border-gray-200 text-gray-600'
                                                        }`}
                                                    >
                                                        {align.replace('text-', '')}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Color */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Color</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={selectedElement.style.color || selectedElement.style.bg || '#111827'}
                                                    onChange={e => {
                                                        if (['button', 'product-cta'].includes(selectedElement!.type)) {
                                                            updateElementData(selectedElement!.id, { style: { bg: e.target.value } });
                                                        } else {
                                                            updateElementData(selectedElement!.id, { style: { color: e.target.value } });
                                                        }
                                                    }}
                                                    className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer"
                                                />
                                                <span className="text-xs font-mono text-gray-600">{selectedElement.style.color || selectedElement.style.bg || '#111827'}</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ) : selectedSection ? (
                        /* ── Container / Section Settings ── */
                        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                            
                            {/* Layout Structure */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Column Structure</label>
                                <select
                                    value={selectedSection.settings.layout || '1-col'}
                                    onChange={e => updateSectionData(selectedSection.id, { layout: e.target.value })}
                                    className="w-full h-9 px-3 rounded-xl border border-gray-200 text-xs focus:border-[#009E49]"
                                >
                                    <option value="1-col">1 Column (Single Flow)</option>
                                    <option value="2-col">2 Columns (50% / 50%)</option>
                                    <option value="3-col">3 Columns (33% / 33% / 33%)</option>
                                    <option value="4-col">4 Columns (25% each)</option>
                                    <option value="left-sidebar">30% Sidebar / 70% Content</option>
                                    <option value="right-sidebar">70% Content / 30% Sidebar</option>
                                </select>
                            </div>

                            {/* Column Gap */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Columns Gap</label>
                                <select
                                    value={selectedSection.settings.gap || 'md'}
                                    onChange={e => updateSectionData(selectedSection.id, { gap: e.target.value })}
                                    className="w-full h-9 px-3 rounded-xl border border-gray-200 text-xs"
                                >
                                    <option value="none">No Gap (0px)</option>
                                    <option value="sm">Small Gap (12px)</option>
                                    <option value="md">Medium Gap (24px)</option>
                                    <option value="lg">Large Gap (32px)</option>
                                </select>
                            </div>

                            {/* Container Width */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Container Max Width</label>
                                <select
                                    value={selectedSection.settings.containerWidth || 'default'}
                                    onChange={e => updateSectionData(selectedSection.id, { containerWidth: e.target.value })}
                                    className="w-full h-9 px-3 rounded-xl border border-gray-200 text-xs"
                                >
                                    <option value="default">Standard (768px)</option>
                                    <option value="narrow">Narrow (576px)</option>
                                    <option value="wide">Wide (1024px)</option>
                                    <option value="full">Full Width (100%)</option>
                                </select>
                            </div>

                            {/* Background Color */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Background Color</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={selectedSection.settings.background || '#ffffff'}
                                        onChange={e => updateSectionData(selectedSection.id, { background: e.target.value })}
                                        className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer"
                                    />
                                    <span className="text-xs font-mono text-gray-600">{selectedSection.settings.background || '#ffffff'}</span>
                                </div>
                            </div>

                            {/* Vertical Padding */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Vertical Padding</label>
                                <select
                                    value={selectedSection.settings.paddingY || 'py-8'}
                                    onChange={e => updateSectionData(selectedSection.id, { paddingY: e.target.value })}
                                    className="w-full h-9 px-3 rounded-xl border border-gray-200 text-xs"
                                >
                                    <option value="py-2">Extra Compact (py-2)</option>
                                    <option value="py-4">Compact (py-4)</option>
                                    <option value="py-8">Normal (py-8)</option>
                                    <option value="py-12">Spacious (py-12)</option>
                                    <option value="py-16">Large (py-16)</option>
                                </select>
                            </div>

                            {/* Border Radius */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Corner Radius</label>
                                <select
                                    value={selectedSection.settings.borderRadius || 'none'}
                                    onChange={e => updateSectionData(selectedSection.id, { borderRadius: e.target.value })}
                                    className="w-full h-9 px-3 rounded-xl border border-gray-200 text-xs"
                                >
                                    <option value="none">Square (0px)</option>
                                    <option value="rounded-lg">Rounded (8px)</option>
                                    <option value="rounded-2xl">Rounded 2XL (16px)</option>
                                    <option value="rounded-3xl">Rounded 3XL (24px)</option>
                                </select>
                            </div>

                            {/* Shadow */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">Box Shadow</label>
                                <select
                                    value={selectedSection.settings.shadow || 'none'}
                                    onChange={e => updateSectionData(selectedSection.id, { shadow: e.target.value })}
                                    className="w-full h-9 px-3 rounded-xl border border-gray-200 text-xs"
                                >
                                    <option value="none">No Shadow</option>
                                    <option value="shadow-xs">Soft Shadow</option>
                                    <option value="shadow-md">Medium Shadow</option>
                                    <option value="shadow-xl">Elevated Shadow</option>
                                </select>
                            </div>

                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-400">
                            <Box className="w-10 h-10 mb-2 opacity-40 text-emerald-600" />
                            <p className="text-xs font-bold text-gray-700">Select any Container or Widget</p>
                            <p className="text-[11px] text-gray-400 mt-1">Click a section or widget in the canvas to adjust columns, background, padding, and styles.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default LandingBuilder;
