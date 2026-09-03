# PRD (Product Requirement Document)
## ChutirMart — Laravel E-commerce Platform

**Version:** 1.0
**Prepared for:** ChutirMart (chutirmart.com)
**Prepared by:** Development Documentation
**Reference:** Figma UI mockups (Home, Shop, Cart, Product, Checkout, Thanks, SellMate Admin Panel)

---

## ১. প্রজেক্ট ওভারভিউ (Project Overview)

ChutirMart একটি বাংলাদেশ-কেন্দ্রিক E-commerce প্ল্যাটফর্ম, যেখানে China থেকে সোর্স করা ট্রেন্ডিং ও Home/Lifestyle প্রোডাক্ট বিক্রি হবে — মূলত Facebook Ads / Landing Page ট্রাফিক থেকে অর্ডার কনভার্ট করার জন্য অপ্টিমাইজড।

সাইটের দুইটি প্রধান অংশ থাকবে:

1. **Storefront (Customer facing)** — Home, Shop, Product, Cart, Checkout, Thanks, About, Terms পেজ
2. **Admin Panel (SellMate)** — Overview/Dashboard, Product Management, Order Management, Customer Management, Store Management

ডিজাইন রেফারেন্স হিসেবে Figma-তে তৈরি ১১টি স্ক্রিন সরবরাহ করা হয়েছে; ডেভেলপমেন্ট সেই ডিজাইন অনুযায়ী পিক্সেল-লেভেল accuracy বজায় রেখে করতে হবে।

---

## ২. লক্ষ্য (Goals & Objectives)

- Fast, smooth, mobile-first শপিং এক্সপেরিয়েন্স তৈরি করা
- Facebook Ads ট্রাফিক থেকে হাই কনভার্সন রেট (কম ক্লিক-টু-অর্ডার ফ্রিকশন)
- Cash on Delivery (COD) কেন্দ্রিক checkout flow, অতিরিক্ত ফিল্ড ছাড়া
- Admin-এর জন্য প্রোডাক্ট, অর্ডার, কাস্টমার ও স্টোর ম্যানেজমেন্ট এক জায়গা থেকে সহজে করার সুযোগ
- shadcn/ui কম্পোনেন্ট লাইব্রেরির স্ট্যান্ডার্ড ব্যবহার করে modern, lightweight, clean UI
- সম্পূর্ণ মোবাইল রেসপন্সিভ, নিচে (bottom) মোবাইল ন্যাভিগেশন বার সহ

---

## ৩. টেক স্ট্যাক (Tech Stack)

| Layer | Technology |
|---|---|
| Backend Framework | Laravel (latest stable) |
| Frontend Bridge | Inertia.js |
| Frontend Framework | Vue 3 (Composition API) |
| UI Component System | shadcn/ui design principles — **shadcn-vue** (Vue port of ui.shadcn.com) + Tailwind CSS |
| Styling | Tailwind CSS (utility-first, matches shadcn tokens) |
| Database | MySQL |
| Local Dev Environment | XAMPP (Apache + MySQL + PHP) |
| Package/Build Tool | Composer (PHP), NPM + Vite (frontend assets) |
| Charts (Admin Dashboard) | Chart.js / ApexCharts (Vue wrapper) — for Purchase & Sales report |
| Image Handling | Laravel filesystem (local disk in dev, S3-ready structure for production) |
| Auth (Admin) | Laravel breeze/fortify-style session auth, role-based (Admin/Manager) |
| Auth (Customer) | Guest checkout by default; optional "Sign In" placeholder for future account features (Track Order works via phone/order number, no mandatory login) |

> **নোট:** shadcn/ui মূলত React-ভিত্তিক। যেহেতু এই প্রজেক্টের স্ট্যাক Laravel + Inertia + **Vue**, তাই আমরা **shadcn-vue** (https://www.shadcn-vue.com) ব্যবহার করব — এটি একই ডিজাইন টোকেন, কম্পোনেন্ট প্যাটার্ন ও accessibility standard বজায় রাখে, শুধু Vue-তে implement করা। যদি ভবিষ্যতে React স্ট্যাকে যাওয়ার সিদ্ধান্ত হয়, তাহলে মূল shadcn/ui সরাসরি ব্যবহারযোগ্য।

---

## ৪. ইউজার রোল (User Roles)

| Role | Access |
|---|---|
| Guest Customer | Browse, Cart, Checkout (COD), Track Order |
| Admin (Manager) | Full admin panel access — Products, Orders, Customers, Store Settings |
| (Future) Staff | Limited admin access (out of scope for v1) |

---

## ৫. স্টোরফ্রন্ট — ফাংশনাল রিকোয়ারমেন্ট (Functional Requirements)

### ৫.১ Global Header & Navigation
- Logo (ChutirMart)
- Search bar (product search, autosuggest — phase 2 ok as basic search v1)
- Icons: Track Order, Sign In, Wishlist, Cart (badge with item count), More (dropdown)
- Main nav bar (green/red accent bar): All Products, Home & Kitchen, Smart Gadget, Offer Products, Summer Products, Feature Products, Flash Products, About Us
- **Mobile:** header collapses to logo + search icon + cart; a **fixed bottom navigation bar** appears with: Home, Shop/Categories, Cart, Wishlist/Account, Menu — icons only, active-state highlight

### ৫.২ Home Page
- Hero banner carousel (auto-slide + manual prev/next arrows, dot indicators)
- Featured Categories row (icon + label, horizontally scrollable on mobile)
- "Top Selling Products" section — product cards, "See All" link
- "All Products" section — grid of product cards, "See All" link
- Product Card component: image, title, strikethrough original price + discounted price, "Add To Cart" button (outline style unless it's the highlighted/featured item, which uses solid green)
- Customer Reviews carousel — avatar/initial badge, name, location, "Verified" tag, star rating, review text, category tag (e.g. "Turbo Fan"), left/right arrows
- Promotional CTA banner ("এখনই অর্ডার করুন!" — limited stock urgency banner) with Add to Cart button
- Footer: logo + tagline, Contact block (phone, address), Follow Us (social icons + WhatsApp Chat button), Useful Links, Our Products links, copyright bar

### ৫.৩ Shop Page
- Breadcrumb (Home › Shop › Category)
- Sort By dropdown (Default, Price Low-High, Price High-Low, Newest)
- Left sidebar filters:
  - Price range (dual-handle slider + min/max input boxes)
  - Brands (checkbox list)
  - (Extendable: Category checkbox, Availability)
- Product grid (3 columns desktop / 2 columns tablet / 1-2 columns mobile)
- Pagination or infinite scroll (recommend pagination for SEO)
- Mobile: filters open via a bottom sheet/drawer triggered by a "Filter" button

### ৫.৪ Product Single Page
- Breadcrumb (Home › Category › Subcategory › Product)
- Image gallery: main image + thumbnail strip (click/swipe to change), swipeable on mobile
- Product title, rating (stars + review count), "% of buyers recommended" trust line
- Price block: current price + strikethrough original price + "Save X%" badge
- Variant selector: Color swatches
- Quantity stepper (-, input, +)
- Action buttons: **Add To Cart** (outline), **Buy Now** (solid red/primary — triggers direct checkout), **WhatsApp Order** (green, opens WhatsApp chat with pre-filled product info), **Call to order** (tel: link with number)
- Trust badges row: Cash on Delivery, Delivery time (1–3 days), 24/7 Support — icon + short label
- Category tag, Wishlist/Bookmark/Share icons
- Tabs or stacked sections: **Product Details** (rich text/HTML description — supports Bangla long-form sales copy) and **Product Video/Images** (YouTube embed + additional image gallery)
- Related Products section (grid, same Product Card component)

### ৫.৫ Cart (Slide-in Sidebar Popup)
- Triggered from header Cart icon — slides in from right, overlay dims background
- Header: "Shopping Cart" + item count + Close button
- Line items: thumbnail, name, quantity stepper (-, qty, +), price = qty × unit price, remove (trash icon)
- "You May Also Like" horizontal carousel with quick "Add" button
- Coupon code accordion ("Have a coupon code?")
- Order Total row
- "Proceed to Checkout" primary button (full width, sticky at bottom of drawer)
- Empty state: friendly empty-cart message + "Continue Shopping" CTA

### ৫.৬ Checkout Page
- Page header: "চেকআউট" + breadcrumb
- Left column:
  - **Shopping Cart** table: product thumb+name+variant (e.g. Color), quantity stepper, price, remove
  - **Shipping Address** form: Full Name, Mobile Number (+88 prefixed), Address (District, Thana, House/Road/Area free text), District dropdown, Thana dropdown (optional, filtered by District)
- Right column:
  - **Payment Method**: radio cards — Cash On Delivery (default selected), Online Payment (gateway integration placeholder — bKash/Nagad/Card, phase 2)
  - **Coupon/Gift Voucher** input + Apply button
  - **Order Summary**: Subtotal, Delivery Charge (auto-calculated by District — Inside Dhaka vs Outside Dhaka), Total (highlighted bar)
  - **Special Notes** (optional textarea)
  - Terms & Conditions checkbox (required, links to T&C page)
  - **Confirm Order** button (full width, green, disabled until required fields valid)
- Form validation: required fields inline error, phone number format validation (Bangladeshi format)

### ৫.৭ Thank You / Order Confirmation Page
- Success icon + headline "অর্ডারটি সফলভাবে সম্পন্ন হয়েছে! 🎉"
- Confirmation message (rep will call to confirm)
- Order Number badge (e.g. #CHU-10245)
- Order Details card: Product, Quantity, Subtotal, Delivery Charge, Total (highlighted)
- Delivery Address card: Customer Name, Mobile Number, Address, estimated delivery time banner (Inside Dhaka: 24 Hour / Outside Dhaka: 2-3 Day)
- No login required — order lookup later via Track Order + phone number/order ID

### ৫.৮ About Us Page
- Brand story, mission, contact info, social links (content-managed via Admin CMS)

### ৫.৯ Terms & Conditions Page
- Static/CMS-editable long-form content (Terms, Privacy Policy, Returns Policy as sub-sections or separate routes, editable from Admin)

---

## ৬. অ্যাডমিন প্যানেল — ফাংশনাল রিকোয়ারমেন্ট (SellMate Theme)

### ৬.১ Global Admin Shell
- **Left sidebar (মূল নেভিগেশন — চূড়ান্ত/ফাইনাল স্ট্রাকচার, v1-এ ঠিক এই ৫টি টপ-লেভেল মেনু থাকবে):**

```
├── Overview
├── Product Management
│   ├── All Product
│   ├── Add New Product
│   ├── Brands
│   ├── Categories
│   ├── Tag
│   ├── Attributes
│   └── Reviews
├── Order Management
│   ├── All Order
│   ├── Processing
│   ├── On Hold
│   ├── Complete
│   ├── Cancelled
│   ├── Trash
│   └── Incomplete Orders
├── Customer Management
│   ├── All Customers
│   ├── Add Customer
│   └── Purchases History (per-customer, row action থেকে অ্যাক্সেস)
├── Store Management
│   ├── Store Settings
│   │   ├── Banner Management
│   │   ├── Payment Management
│   │   ├── Logo Management
│   │   └── Footer Management
│   └── Landing Page
│       └── Landing Page Create & Management
└── Log Out
```

- প্রতিটি টপ-লেভেল মেনু (Product/Order/Store Management) সাইডবারে একটি collapsible/expandable group হিসেবে থাকবে — ক্লিক করলে সাব-মেনু ইনলাইন এক্সপ্যান্ড হবে (accordion-style nested nav), একটিভ সাব-আইটেম হাইলাইট থাকবে এবং প্যারেন্ট গ্রুপও একটিভ স্টেট দেখাবে
- Top bar: "Welcome Back! [Store Name]" গ্রিটিং, গ্লোবাল সার্চ, ডার্ক-মোড টগল, নোটিফিকেশন বেল, অ্যাডমিন প্রোফাইল (অ্যাভাটার, নাম, রোল যেমন "Manager")
- সম্পূর্ণ রেসপন্সিভ — ট্যাবলেট/মোবাইলে সাইডবার আইকন-অনলি অথবা `Sheet` ড্রয়ারে কোলাপ্স করবে (হ্যামবার্গার ট্রিগার টপবারে)
- Inventory-লেভেল low-stock ট্র্যাকিং ও কাস্টমার মেসেজ/ইনকোয়ারি লগ v1-এ আলাদা সাইডবার আইটেম না হয়ে Overview-এর "Inventory Alerts" উইজেট ও Store Management-এর আন্ডারে রাখা হবে (ভবিষ্যতে প্রয়োজনে আলাদা টপ-লেভেল মেনু হিসেবে বিভক্ত করা যাবে)

### ৬.২ Overview (Dashboard)
- স্ট্যাট কার্ড: **Sales** (কাউন্ট, গত সপ্তাহের তুলনায় %), **Revenue** (অ্যামাউন্ট, %), **Order** (কাউন্ট, %), **Customer** (কাউন্ট, %) — প্রতিটিতে weekly/monthly পিরিয়ড টগল
- **Orders Summary** উইজেট: New Order / Packed / Delivered কাউন্ট
- **Inventory Alerts** উইজেট: low-stock প্রোডাক্ট লিস্ট (বাকি কোয়ান্টিটিসহ), "See All" লিংক
- **Purchase & Sales Report** চার্ট: লাইন চার্ট, Purchase vs Sale ওভার টাইম (মাসিক), পিরিয়ড সিলেক্টর (Weekly/Monthly/Yearly), হোভারে টুলটিপ
- **AI Suggestion** প্যানেল: সিস্টেম-জেনারেটেড রিস্টক/বান্ডল/ট্রেন্ড অ্যালার্ট (v1-এ rule-based: low stock, no-sale-in-N-days, trending category)
- **Top Performing Products** টেবিল: image, name, Product ID, price, stock, sold, profit — সর্টেবল কলাম, ক্যাটাগরি ফিল্টার, এক্সপোর্ট (CSV)
- "Add Products" ও "View Reports" কুইক-অ্যাকশন বাটন

### ৬.৩ Product Management
সাইডবারে সাব-মেনু হিসেবে থাকবে: **All Product, Add New Product, Brands, Categories, Tag, Attributes, Reviews**

- **All Product** — টেবিল ভিউ: image, name, ID, category, price, stock, status, actions (Edit/Duplicate/Delete)
- **Add New Product** ফর্ম (Figma অনুযায়ী):
  - General Information: Product Name, Product ID (auto-generated, editable), Description (rich text editor)
  - Pricing & Stock: Price, Discount Type (dropdown: Percentage/Fixed/Seasonal Campaign), Discount Percentage, Stock Quantity
  - Upload Image: main image + একাধিক গ্যালারি ইমেজ, drag-drop, add (+) টাইল
  - Categories & Brand: Category dropdown (multi-select), Brand Name input/select
  - Actions: Save Draft, Add Products (publish)
- **Brands** — CRUD লিস্ট (name, logo, product count)
- **Categories** — CRUD লিস্ট, parent/child সাপোর্ট (Category → Subcategory, যেমন Decoration > Furniture > Storage)
- **Tag** — CRUD, সিম্পল ট্যাগ লিস্ট প্রোডাক্টে অ্যাসাইনযোগ্য
- **Attributes** — ভ্যারিয়েন্ট অপশনের (যেমন Color, Size) CRUD, ভ্যালুসহ (Product পেজের কালার-সোয়াচ সিলেক্টরে ব্যবহৃত)
- **Reviews** — প্রতি প্রোডাক্টের কাস্টমার রিভিউ লিস্ট: approve/reject/delete, star rating, রিভিউয়ার নাম, টেক্সট, verified badge টগল

### ৬.৪ Order Management
সাইডবারে সাব-মেনু/ট্যাব হিসেবে থাকবে: **All Order, Processing, On Hold, Complete, Cancelled, Trash, Incomplete Orders**

- স্ট্যাট কার্ড: Total Order, Completed Order, Cancelled Order, Return Order (সাপ্তাহিক তুলনা % সহ)
- **Order List** টেবিল: Product(s), Customer Name, Order Date, Quantity, Payment (Paid/Incomplete), Status badge (Shipped/In Transit/Processing/Cancelled), row actions (⋯ মেনু: Edit, Remove)
- প্রতিটি স্ট্যাটাস (All Order / Processing / On Hold / Complete / Cancelled / Trash / Incomplete Orders) একটি আলাদা ট্যাব বা সাব-রুট হিসেবে থাকবে, একই টেবিল কম্পোনেন্ট রিইউজ করে স্ট্যাটাস অনুযায়ী ফিল্টার করা ডেটা দেখাবে
- ক্যাটাগরি ড্রপডাউন + স্ট্যাটাস ড্রপডাউন দিয়ে ফিল্টার
- Pagination (Show X per page)
- Order detail drawer/page: সম্পূর্ণ কাস্টমার তথ্য, শিপিং অ্যাড্রেস, আইটেমাইজড প্রোডাক্ট, স্ট্যাটাস চেঞ্জ কন্ট্রোল, ইন্টারনাল নোট

### ৬.৫ Customer Management
- স্ট্যাট কার্ড: Total Customer, New Customer (weekly), "Top 10 Customers this Week" মিনি লিডারবোর্ড
- **Customers List** টেবিল: Name, Joining Date, Email, Total Spent, Status badge (VIP/Returning/New), actions (⋯ মেনু)
- Row actions: **Purchases History** (মডাল: product name, purchase date, quantity, price, প্রতি লাইনে ডাউনলোডযোগ্য ইনভয়েস + "View Reports" বাটন), **Edit**, **Remove**
- Add Customer (ম্যানুয়াল এন্ট্রি, যেমন ফোন অর্ডারের জন্য)
- Pagination

### ৬.৬ Store Management
সাইডবারে দুইটি সাব-গ্রুপ থাকবে: **Store Settings** ও **Landing Page**

- **Store Settings**
  - **Banner Management** — হোমপেজ হিরো ব্যানার আপলোড/রিঅর্ডার/শিডিউল
  - **Payment Management** — পেমেন্ট মেথড enable/disable (COD টগল, Online Payment gateway keys — bKash/Nagad/Card)
  - **Logo Management** — সাইট লোগো, favicon আপলোড
  - **Footer Management** — ফুটার কন্টাক্ট ইনফো, সোশ্যাল লিংক, ফুটার লিংক গ্রুপ এডিট (কোড ছাড়াই)
- **Landing Page**
  - গুরুত্বপূর্ণ ল্যান্ডিং পেজ তৈরি ও ম্যানেজমেন্ট — স্বতন্ত্র ক্যাম্পেইন ল্যান্ডিং পেজ (Facebook Ads ট্রাফিকের জন্য প্রোডাক্ট-স্পেসিফিক সেলস পেজ) — page builder বা টেমপ্লেট-ভিত্তিক, প্রতিটির নিজস্ব URL slug, hero, প্রোডাক্ট ডিটেইলস, embedded checkout CTA সহ
  - ল্যান্ডিং পেজ লিস্ট (তৈরি করা সব পেজের টেবিল: title, slug, status Published/Draft, তৈরির তারিখ, actions Edit/Duplicate/Delete/Preview)

---

## ৭. নন-ফাংশনাল রিকোয়ারমেন্ট (Non-Functional Requirements)

- **Responsive:** Mobile-first; breakpoints for mobile (<640px), tablet (640–1024px), desktop (>1024px); bottom nav on mobile as specified
- **Performance:** Lazy-load images, paginated product queries, Vite asset bundling/minification, target LCP < 2.5s on 4G
- **SEO:** Server-rendered product/category pages via Inertia SSR (or fallback to Blade for critical SEO pages if SSR not set up initially), meta tags per product/category, clean URL slugs
- **Security:** CSRF protection (Laravel default), input validation/sanitization on all forms, rate-limiting on checkout/order submission to prevent spam orders, admin routes behind auth middleware
- **Accessibility:** shadcn/ui's built-in accessible components (Radix primitives under shadcn-vue) — keyboard navigable, proper ARIA labels
- **Localization:** Bangla as primary content language throughout storefront; admin panel can remain English (per SellMate reference) or bilingual — confirm preference
- **Browser Support:** Latest Chrome, Safari, Firefox, and Chrome for Android (majority of BD mobile traffic)

---

## ৮. আউট অফ স্কোপ (v1)

- Customer account/login dashboard (order history for logged-in users) — only guest checkout + Track Order by phone/order ID in v1
- Online payment gateway live integration (UI/toggle present, gateway wiring is phase 2)
- Multi-vendor/marketplace features
- Native mobile app

---

## ৯. মাইলস্টোন / ফেজ (Suggested Delivery Phases)

1. **Phase 1 — Foundation:** Laravel + Inertia + Vue + shadcn-vue setup, DB schema, auth scaffolding, design system tokens
2. **Phase 2 — Storefront Core:** Home, Shop, Product Single, Cart drawer
3. **Phase 3 — Checkout Flow:** Checkout page, Order confirmation/Thanks page, delivery charge logic
4. **Phase 4 — Admin Core:** Overview dashboard, Product Management (all sub-modules), Order Management
5. **Phase 5 — Admin Extended:** Customer Management, Store Management (Settings + Landing Page builder), Inventory, Message
6. **Phase 6 — Polish & QA:** Mobile responsiveness pass, performance tuning, cross-browser test, content population, launch checklist

---

## ১০. একসেপ্টেন্স ক্রাইটেরিয়া (Sample)

- একজন কাস্টমার হোমপেজ থেকে প্রোডাক্ট দেখে, কার্টে যোগ করে, কোনো লগইন ছাড়াই COD-তে চেকআউট সম্পন্ন করতে পারবে — সর্বোচ্চ ৩টি ক্লিক/স্টেপে
- মোবাইলে সব পেজ bottom nav সহ ব্যবহারযোগ্য এবং কোনো horizontal scroll/broken layout থাকবে না
- অ্যাডমিন নতুন প্রোডাক্ট যোগ করার পর সেটি সাথে সাথে Shop পেজে দেখা যাবে
- অর্ডার confirm হওয়ার সাথে সাথে Admin Order List-এ "Processing"/"Incomplete" স্ট্যাটাসে দেখা যাবে
