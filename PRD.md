# 📋 Product Requirements Document (PRD)
## ChutirMart — Laravel E-commerce Platform
### Version 2.0 | Final Specification

**Prepared for:** ChutirMart (chutirmart.com)
**Tech Stack:** Laravel 13 + Inertia.js + Vue 3 + shadcn-vue + Tailwind CSS 4
**Design Reference:** Figma Mockups (11 screens — Storefront + Admin/SellMate Theme)
**Last Updated:** 2026-08-26

---

## 📌 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Goals & Objectives](#2-goals--objectives)
3. [Tech Stack](#3-tech-stack)
4. [User Roles & Permissions](#4-user-roles--permissions)
5. [Database Schema](#5-database-schema)
6. [Storefront — Functional Requirements](#6-storefront--functional-requirements)
7. [Admin Panel — Functional Requirements](#7-admin-panel--functional-requirements)
8. [API & Backend Logic](#8-api--backend-logic)
9. [Non-Functional Requirements](#9-non-functional-requirements)
10. [Out of Scope (v1)](#10-out-of-scope-v1)
11. [Delivery Phases / Milestones](#11-delivery-phases--milestones)
12. [Acceptance Criteria](#12-acceptance-criteria)

---

## 1. Project Overview

**ChutirMart** একটি বাংলাদেশ-কেন্দ্রিক E-commerce প্ল্যাটফর্ম যেখানে China থেকে সোর্স করা ট্রেন্ডিং Home/Lifestyle প্রোডাক্ট বিক্রি হবে। প্ল্যাটফর্মটি মূলত **Facebook Ads / Landing Page** ট্রাফিক থেকে অর্ডার কনভার্ট করার জন্য অপ্টিমাইজড।

### সাইটের দুইটি প্রধান অংশ:

| অংশ | বিবরণ |
|---|---|
| **Storefront** | Customer-facing — Home, Shop, Product, Cart, Checkout, Thanks, About, Terms |
| **Admin Panel (SellMate)** | Overview, Product, Order, Customer, Store Management |

### ডিজাইন ফিলোসফি:
- **Figma Pixel-Perfect:** সরবরাহকৃত Figma ডিজাইন অনুযায়ী pixel-level accuracy বজায় রেখে implement করতে হবে
- **Conversion-Focused:** ৩ ক্লিকের মধ্যে COD checkout সম্পন্ন করার লক্ষ্যে ডিজাইন
- **Trust-Building:** COD badge, delivery time, 24/7 support সর্বদা visible
- **Bangladesh-first:** বাংলা ভাষা, COD payment, bKash/Nagad integration প্রস্তুতি

---

## 2. Goals & Objectives

### Primary Goals:
- Fast, smooth, mobile-first শপিং experience তৈরি করা
- Facebook Ads ট্রাফিক থেকে হাই conversion rate (কম click-to-order friction)
- Cash on Delivery (COD) কেন্দ্রিক checkout flow
- Admin-এর জন্য প্রোডাক্ট, অর্ডার, কাস্টমার ও স্টোর management এক জায়গা থেকে
- shadcn-vue কম্পোনেন্ট লাইব্রেরি দিয়ে modern, lightweight, clean UI
- সম্পূর্ণ mobile responsive + bottom mobile navigation বার

### KPIs (Success Metrics):
| Metric | Target |
|---|---|
| Page Load Speed (LCP) | < 2.5s on 4G |
| Mobile Responsiveness | 100% (no horizontal scroll) |
| Checkout Completion Steps | 3 steps max |
| Admin Product Add Time | < 2 minutes |

---

## 3. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Backend Framework | Laravel | ^13.17 |
| Frontend Bridge | Inertia.js | ^3.3 |
| Frontend Framework | Vue 3 (Composition API) | ^3.5 |
| UI Component System | shadcn-vue (shadcn/ui Vue port) | Latest |
| Styling | Tailwind CSS | ^4.0 |
| Database | MySQL | 8.0+ |
| Local Dev Environment | XAMPP (Apache + MySQL + PHP) | Latest |
| Build Tool | Vite | ^8.0 |
| Package Manager | Composer (PHP) + NPM (JS) | — |
| Charts (Admin) | Chart.js / ApexCharts (Vue wrapper) | Latest |
| Image Handling | Laravel Filesystem (local/S3-ready) | — |
| Auth (Admin) | Laravel Session Auth + Role-based | — |
| Auth (Customer) | Guest checkout (no mandatory login) | — |
| Icons | lucide-vue-next | Latest |
| Toast Notifications | Sonner (shadcn-vue) | Latest |

> **Note:** shadcn/ui মূলত React-based। এই প্রজেক্টে **shadcn-vue** (https://www.shadcn-vue.com) ব্যবহার হবে — একই ডিজাইন token, component pattern ও accessibility standard বজায় রেখে Vue-তে implement করা।

---

## 4. User Roles & Permissions

| Role | Access Level | Pages |
|---|---|---|
| **Guest Customer** | Public storefront | Home, Shop, Product, Cart, Checkout, Thanks, About, Terms |
| **Admin** | Full admin access | All admin panel pages |
| **Manager** (Future v2) | Limited admin access | Order & Customer management only |

### Route Protection Strategy:
```
/admin/*   → auth middleware (admin session required)
/          → public routes (no auth)
/checkout  → public, but rate-limited (5 orders/hour per IP)
```

---

## 5. Database Schema

### Core Tables:

#### `products`
```sql
id, name, slug, description (longtext),
price, compare_at_price,
discount_type (percentage|fixed|seasonal|none),
discount_value, stock_quantity,
cost_price (nullable),
status (active|draft|archived),
brand_id (FK), 
meta_title, meta_description,
youtube_url (nullable),
created_at, updated_at
```

#### `product_images`
```sql
id, product_id (FK), image_path, sort_order, is_main (boolean)
```

#### `product_category` (pivot)
```sql
product_id, category_id
```

#### `product_variants`
```sql
id, product_id (FK), attribute_value_id (FK),
additional_price, stock_override (nullable)
```

#### `categories`
```sql
id, name, slug, parent_id (nullable, self-FK), icon, sort_order, status
```

#### `brands`
```sql
id, name, slug, logo_path, description, status
```

#### `tags`
```sql
id, name, slug
```

#### `product_tags` (pivot)
```sql
product_id, tag_id
```

#### `attributes`
```sql
id, name (e.g., "Color", "Size"), type (color|text)
```

#### `attribute_values`
```sql
id, attribute_id (FK), value (e.g., "Red", "XL"), color_hex (nullable)
```

#### `orders`
```sql
id, order_number (unique, CHU-XXXXX),
customer_name, mobile,
address, district, thana,
subtotal, delivery_charge, coupon_discount, total,
payment_method (cod|online),
payment_status (pending|paid|incomplete),
status (processing|on_hold|complete|cancelled|trash|incomplete),
special_notes (nullable), coupon_code (nullable),
ip_address, created_at, updated_at
```

#### `order_items`
```sql
id, order_id (FK), product_id (FK),
product_name (snapshot), variant_info (JSON snapshot),
quantity, unit_price, total_price
```

#### `customers`
```sql
id, name, mobile (unique), email (nullable),
address, district,
total_orders (computed), total_spent (computed),
status (new|returning|vip),
created_at, updated_at
```

#### `coupons`
```sql
id, code (unique), type (percentage|fixed), value,
min_order_amount, max_uses, used_count,
expires_at (nullable), status (active|inactive)
```

#### `reviews`
```sql
id, product_id (FK), customer_name, rating (1-5),
review_text, status (pending|approved|rejected),
verified (boolean), created_at
```

#### `banners`
```sql
id, title, image_path, link_url (nullable),
sort_order, status (active|inactive),
scheduled_at (nullable), expires_at (nullable)
```

#### `store_settings`
```sql
key (unique), value (text), type (text|image|json|boolean)
```

*Standard keys:*
- `site_name`, `site_logo`, `favicon`
- `footer_contact_phone`, `footer_contact_address`, `footer_about_text`
- `footer_social_facebook`, `footer_social_instagram`, `footer_social_youtube`, `whatsapp_number`
- `footer_link_group_1` (JSON), `footer_link_group_2` (JSON)
- `delivery_inside_dhaka`, `delivery_outside_dhaka`
- `cod_enabled`, `online_payment_enabled`
- `about_page_content`, `terms_page_content`

#### `districts`
```sql
id, name, delivery_charge (nullable — uses store_settings default if null)
```

#### `thanas`
```sql
id, district_id (FK), name
```

#### `landing_pages`
```sql
id, title, slug (unique),
hero_headline, hero_subtext, hero_image_path,
product_id (nullable FK),
sections (JSON — page builder blocks),
facebook_pixel_id (nullable), ga_id (nullable),
cta_button_text,
status (published|draft),
created_at, updated_at
```

#### `admin_users`
```sql
id, name, email (unique), password,
role (admin|manager), avatar_path (nullable),
last_login_at, created_at
```

---

## 6. Storefront — Functional Requirements

### 6.1 Global Header & Navigation

**Desktop Header (2 rows):**
```
Row 1: [Logo] ─────── [Search Bar (full width)] ─────── [Track Order | Sign In | Wishlist | Cart(badge) | More▾]
Row 2: [Green-Red gradient nav bar] → [All Products | Home & Kitchen | Smart Gadget | Offer | Summer | Feature | Flash | About Us]
```

**Mobile Header:**
```
[Logo] ──────────────────────── [🔍 Search] [🛒 Cart(badge)]
```

**Fixed Bottom Navigation (Mobile < 768px):**
- 5 tabs: 🏠 Home | 🛍️ Shop | 🛒 Cart (center, elevated) | ❤️ Wishlist | ☰ Menu
- Active tab: primary color icon + label text
- Inactive: muted gray
- `position: fixed; bottom: 0; z-index: 50`
- iOS safe-area padding: `padding-bottom: env(safe-area-inset-bottom)`

**Functional Requirements:**
- Cart icon badge: live count from localStorage cart
- Search: submit redirects to `/shop?q={query}`
- "Track Order": modal with order number + phone lookup form
- "More" dropdown: About Us, Terms & Conditions
- Category nav links → `/shop?category={slug}`

---

### 6.2 Home Page

#### A. Hero Banner Carousel
- Full-width, auto-slide every 4s
- Manual prev/next arrows
- Dot indicators
- Mobile: single slide, touch-swipeable
- Source: Admin → Banner Management

#### B. Featured Categories Row
- Horizontally scrollable on mobile
- Icon + category name
- Each links to `/shop?category={slug}`
- From `categories` table (featured/sorted)

#### C. Top Selling Products Section
- H2: "সবচেয়ে বেশি বিক্রিত পণ্য"
- "See All →" → `/shop?sort=best_selling`
- 4-col desktop / 2-col mobile
- Algorithm: `ORDER BY total_sold DESC LIMIT 8`

#### D. All Products Section
- H2: "সকল পণ্য"
- "See All →" → `/shop`
- Latest 8-12 products

#### E. Customer Reviews Carousel
- Auto-play, pause on hover
- 4 visible desktop / 1-2 mobile
- Card: avatar (initial circle), name, location, "Verified ✓", ★★★★★, review text, product tag
- Source: Admin-approved reviews

#### F. Urgency CTA Banner
- Full-width gradient (green → red)
- Bangla urgency copy + Add to Cart button
- Links to featured product (configured in Store Settings)

#### G. Footer
- 4 columns → mobile accordion
- Content from Admin → Footer Management
- Social icons: Facebook, Instagram, YouTube, WhatsApp Chat button

---

### 6.3 Shop Page

**URL patterns:** `/shop`, `/shop?category={slug}`, `/shop?brand={slug}`, `/shop?q={query}`

**Layout:**
```
[Breadcrumb] ──────────────────────────── [Sort By ▾]

[Left Sidebar — 280px]    [Product Grid — remaining width]
  Price Range slider        3 col desktop
  Brand checkboxes          2 col tablet
  Category checkboxes       2 col mobile (1 col on very small)
  Availability toggle
```

**Functional Requirements:**
- Price range: dual-handle slider + number inputs
- Brand checkboxes: from `brands` table
- Category checkboxes: tree structure
- Sort options: Default | Price: Low to High | Price: High to Low | Newest | Best Selling
- URL query params update on every filter change
- Pagination: 12 per page, numbered pagination component
- Mobile filter: Sheet from bottom triggered by "Filter" button + active filter count badge
- Empty state: "কোনো পণ্য পাওয়া যায়নি। ফিল্টার পরিষ্কার করুন →"

---

### 6.4 Product Single Page

**URL:** `/product/{slug}`

**Desktop layout:**
```
[Breadcrumb]

[Left 50%: Image Gallery]         [Right 50%: Product Info]
  Main image (large)               Title (H1)
  Thumbnail strip (5 images)       ★★★★☆ (4.2) 156 Reviews
  Click thumbnail → change main    "94% buyers recommended"
                                   ~~৳1,200~~  ৳950  [Save 20%]
                                   Color: [● Red] [● Blue] [● Green]
                                   Quantity: [−] [  2  ] [+]
                                   [Add To Cart (outline)] [Buy Now (red)]
                                   [WhatsApp Order (green)] [📞 Call to Order]
                                   Trust: [📦 COD] [🚚 1-3 Days] [💬 24/7]

[Tabs: Product Details | Product Video & Images]
  └── Rich HTML content / YouTube embed + extra gallery

[Related Products (4-col grid)]
```

**Mobile specifics:**
- Gallery: full-width swipeable
- Info stacks below gallery
- Sticky bottom bar: [Add To Cart] [Buy Now] — always visible

**Functional Requirements:**
- Gallery: click thumbnail → change main image (desktop), swipe → next image (mobile)
- Color swatches: clicking updates selected variant; if `additional_price > 0`, price updates
- Qty stepper: min=1, max=stock_quantity; shows "স্টক শেষ" when stock=0
- "Add To Cart": localStorage update + Cart Sheet opens + Sonner toast
- "Buy Now": localStorage update + redirect to `/checkout`
- "WhatsApp Order": `https://wa.me/{number}?text=আমি {product} কিনতে চাই - {url}`
- Related Products: same primary category, `LIMIT 8`, excludes current product
- JSON-LD structured data: Product schema

---

### 6.5 Cart Sheet (Slide-in Sidebar)

**Component:** shadcn-vue `Sheet` (side="right"), width 420px desktop / 100% mobile

**Layout:**
```
Header: "Shopping Cart (3 items)" ─────────── [× Close]
─────────────────────────────────────────────────────────
Scrollable body:
  [Thumb 64×64] [Name]               [− qty +]  [৳950] [🗑]
                [Variant: Red]
  ─────────────────────────────────────────────────────
  [Thumb 64×64] [Name 2]             [− qty +]  [৳650] [🗑]
  ─────────────────────────────────────────────────────
  You May Also Like (horizontal mini-carousel):
  [Mini card] [Mini card] [Mini card]
  ─────────────────────────────────────────────────────
  [▾ Have a coupon code?] (Accordion)
    [_____________] [Apply]
─────────────────────────────────────────────────────────
Sticky footer:
  Order Total: ৳1,600
  [Proceed to Checkout →]
```

**Functional Requirements:**
- Qty stepper: updates localStorage, recalculates total live
- Remove: removes from localStorage, shows brief undo toast
- "You May Also Like": server-fetched related products (random from active products)
- Coupon: POST to `/cart/validate-coupon` → returns discount amount or error
- Empty state: Illustration + "কার্টে কিছু নেই" + "কেনাকাটা চালিয়ে যান" button
- Header badge count: synced with localStorage

---

### 6.6 Checkout Page

**URL:** `/checkout` (redirects to `/` if cart empty)

**Layout:**
```
H1: "চেকআউট"  [Home > Cart > Checkout]

[Left Column — 58%]              [Right Column — 42%]
┌──────────────────────┐        ┌──────────────────────┐
│ 🛒 Shopping Cart     │        │ 💳 Payment Method     │
│ [thumb][name][color] │        │ ● Cash on Delivery   │
│ [−][qty][+]    ৳XXX  │        │ ○ Online (Coming soon)│
│ [×remove]           │        ├──────────────────────┤
├──────────────────────┤        │ 🎟️ Coupon/Gift Voucher│
│ 📍 Shipping Address  │        │ [Code______] [Apply] │
│ Full Name *         │        ├──────────────────────┤
│ Mobile Number *     │        │ 📊 Order Summary      │
│ District * [▾]      │        │ Subtotal:    ৳1,600  │
│ Thana     [▾]       │        │ Delivery:     ৳130  │
│ House/Road/Area *   │        │ ─────────────────── │
│ (textarea)          │        │ Total:       ৳1,730  │
└──────────────────────┘        ├──────────────────────┤
                                │ 📝 Special Notes     │
                                │ [optional textarea]  │
                                ├──────────────────────┤
                                │ ☐ Terms & Conditions │
                                ├──────────────────────┤
                                │ [Confirm Order →]   │
                                └──────────────────────┘
Mobile: Single column; Right column stacks below Left; Confirm button sticky bottom
```

**Functional Requirements:**
- Full Name: required, min 3 chars
- Mobile: required, validates BD format (01XXXXXXXXX / +88XXXXXXXXXX)
- District: required dropdown from `districts` table
- Thana: optional, AJAX `/api/thanas?district_id={id}` call
- House/Road/Area: required textarea
- Delivery charge: auto-updates on district selection
- COD selected by default; Online Payment radio shows "শীঘ্রই আসছে" badge + disabled
- Coupon validation: POST `/cart/validate-coupon`
- Terms checkbox: required before Confirm Order enables
- Confirm Order: validates all fields → POST `/checkout/place-order` → redirect to confirmation
- Rate limiting: 5 orders/hour per IP (Laravel `throttle` middleware)
- Order number: `CHU-XXXXX` (5-digit random, unique)
- On success: clears localStorage cart + redirects to `/order/confirmation/{order_number}`

---

### 6.7 Thank You / Purchase Summary Page

**URL:** `/order/confirmation/{order_number}`

**Layout:**
```
[✅ Large success checkmark animation]
"অর্ডারটি সফলভাবে সম্পন্ন হয়েছে! 🎉"
"আমাদের প্রতিনিধি শীঘ্রই কল করে নিশ্চিত করবেন"

[Order #CHU-10245 badge]

┌─ Order Details ──────────────────────────────────────┐
│ Product       │ Qty  │ Subtotal  │ Delivery │ Total  │
│ [name+thumb]  │  2   │  ৳1,600  │  ৳130   │৳1,730  │
└──────────────────────────────────────────────────────┘

┌─ Delivery Address ───────────────────────────────────┐
│ Name: Karim Ahmed                                    │
│ Mobile: 01711234567                                  │
│ Address: 12/B, Mirpur, Dhaka                        │
├──────────────────────────────────────────────────────┤
│ 📦 ঢাকার ভেতরে: ২৪ ঘন্টার মধ্যে                    │
│ 📦 ঢাকার বাইরে: ২–৩ কার্যদিবস                       │
└──────────────────────────────────────────────────────┘

[← কেনাকাটা চালিয়ে যান]
```

**Functional Requirements:**
- Data fetched from DB by `order_number` (no auth required)
- clears `localStorage.cart` on page mount
- meta: `<meta name="robots" content="noindex">`
- If `order_number` not found → 404

---

### 6.8 About Us Page (`/about`)
- Brand story, mission statement, contact info, map (optional), social links
- Content editable from Admin → Store Settings → `about_page_content` (rich text)

---

### 6.9 Terms & Conditions Page (`/terms`)
- Three accordion sections:
  1. Terms of Service
  2. Privacy Policy
  3. Returns & Refund Policy
- Content editable from Admin → Store Settings → `terms_page_content` (rich text JSON per section)

---

### 6.10 Product Card Component

```
┌─────────────────────────────┐
│ [NEW] or [20% OFF] badge    │  absolute, top-left
│ ─────────────────────────── │
│                             │
│     [Product Image]         │  aspect-square, object-cover
│                             │
├─────────────────────────────┤
│ Product Title (2-line max)  │  line-clamp-2, text-sm/base
│ ~~৳1,200~~  ৳950           │  muted strikethrough + bold
│ [  Add To Cart  ]           │  full-width, outline variant
└─────────────────────────────┘
```

Hover: `scale-[1.02]` + `shadow-md`, `transition-transform duration-200`

---

## 7. Admin Panel — Functional Requirements

### 7.1 Admin Shell (Global Layout)

**Sidebar Structure:**
```
[ChutirMart Logo + "SellMate" tag]
─────────────────────────────────
🏠  Overview
📦  Product Management         [▾]
    ├─ All Product
    ├─ Add New Product
    ├─ Brands
    ├─ Categories
    ├─ Tag
    ├─ Attributes
    └─ Reviews
📋  Order Management           [▾]
    ├─ All Order
    ├─ Processing
    ├─ On Hold
    ├─ Complete
    ├─ Cancelled
    ├─ Trash
    └─ Incomplete Orders
👥  Customer Management        [▾]
    ├─ All Customers
    └─ Add Customer
⚙️  Store Management           [▾]
    ├─ Store Settings
    │   ├─ Banner Management
    │   ├─ Payment Management
    │   ├─ Logo Management
    │   └─ Footer Management
    └─ Landing Page
        └─ Create & Manage
─────────────────────────────────
🚪  Log Out
```

**Sidebar Behaviors:**
- Desktop: fixed, 260px, always expanded
- Collapsed mode (icon-only, 60px): hover → flyout Popover for sub-menus
- Toggle button: ← / → arrow at sidebar bottom edge
- Active item: `bg-[#EDEBFB] text-[#5B4FE9]` + left border accent
- Mobile: Sheet drawer (left), hamburger in topbar triggers open

**Topbar:**
```
[☰ (mobile only)] ["Welcome Back! ChutirMart"] ─ [🔍] [🌙] [🔔 (badge)] [👤 profile▾]
```

- Dark Mode: Tailwind `class` strategy, persists in localStorage
- Notifications Popover: last 5 new orders + low stock alerts
- Profile dropdown: "Profile", "Log Out"

---

### 7.2 Overview (Dashboard)

**Stat Cards (top row, 4 cards):**

| Card | Icon | Value | % Change |
|---|---|---|---|
| Sales | 🛒 | Total order count | vs last week |
| Revenue | 💰 | ৳ total revenue | vs last week |
| Orders | 📋 | Order count | vs last week |
| Customers | 👥 | New customer count | vs last week |

Period toggle per card: Weekly / Monthly

**Orders Summary Widget:**
- 3 pills: New Order (processing count) | Packed (on_hold) | Delivered (complete)

**Inventory Alerts Widget:**
- Products where `stock_quantity <= 10`
- Columns: thumb + name, qty left, [Restock] button
- "See All" → All Products filtered low stock

**Purchase & Sales Report Chart:**
- Dual-line chart (ApexCharts Vue)
- Line 1: Sales Revenue | Line 2: Cost (if cost_price set)
- Period: Weekly / Monthly / Yearly selector
- Hover tooltip

**Smart Suggestions Panel:**
Rule-based alerts:
- `stock_quantity < 5` → restock alert
- No orders in 30 days → discount suggestion
- Category spike (10%+ more orders this week) → trending alert

**Top Performing Products Table:**
| Col | Detail |
|---|---|
| Image + Name | Thumbnail + clickable |
| Product ID | PRD-XXXXX |
| Price | Current selling price ৳ |
| Stock | Qty remaining |
| Sold | Total units sold |
| Profit | Revenue − (cost × sold) |
| Actions | Edit button |

- Sortable columns
- Category filter
- Export CSV
- 10 per page

**Quick Actions:** [+ Add Products] [View Reports]

---

### 7.3 Product Management

#### All Products
Search + filters (Category, Brand, Status, Stock level) → Table → Bulk actions

**Table columns:** Checkbox | Thumb | Name | ID | Category | Price | Stock | Status | Actions (Edit/Duplicate/Delete)

#### Add New Product

**Form sections:**

**1. General Information**
- Product Name * (text)
- Product ID (auto: `PRD-` + 5 random digits, editable)
- Short Description (textarea, 150 chars, used in cards)
- Description * (Tiptap rich text editor — Bangla support, image embed, formatting)
- SEO: Meta Title, Meta Description (collapsible)

**2. Pricing & Stock**
- Price * (৳)
- Compare at Price (original/strikethrough ৳)
- Discount Type: None | Percentage | Fixed Amount | Seasonal Campaign
- Discount Value (conditional)
- Stock Quantity *
- Cost Price (optional)
- Low Stock Alert Threshold (default 10)

**3. Media**
- Main Image: drag & drop zone, single file, preview
- Gallery Images: multiple upload, drag-to-reorder, max 10, each with remove button
- YouTube Video URL (optional → shows embed preview)

**4. Organization**
- Category: multi-select searchable dropdown (tree structure)
- Brand: select dropdown + inline "Add New Brand" link
- Tags: multi-select tag input (comma add or Enter)

**5. Variants / Attributes**
- "Add Attribute" button → selects attribute (Color/Size)
- Add values: text + color hex picker for Color type
- Each variant row: value, additional price, stock override

**6. Publishing**
- Status: Active / Draft
- [Save Draft] [Add Products / Update]

---

#### Brands
Table: Logo | Name | Slug | Products Count | Status | Edit/Delete
Form: Name, Logo upload, Description, Status

#### Categories
Tree view with indentation; parent→child
Form: Name, Slug (auto), Parent Category, Icon (emoji or upload), Sort Order
Drag-to-reorder within same level

#### Tags
List: Tag Name | Product Count | Delete
Bulk add via comma-separated input textarea

#### Attributes
List of attribute types (Color, Size, Material)
Expandable → value list
Add attribute: Name, Type (color|text)
Add values: Value text + Color Hex (if color type) + sort order

#### Reviews
**Table:** Product thumb+name | Customer Name | ★ Rating | Review (truncated) | Status badge | Verified toggle | Date | Actions (Approve/Reject/Delete)

Filters: Status | Rating | Product search
Bulk: Approve selected / Reject selected / Delete selected

---

### 7.4 Order Management

**Sub-routes (all reuse same table component with status filter):**
```
/admin/orders           → All Orders
/admin/orders/processing
/admin/orders/on-hold
/admin/orders/complete
/admin/orders/cancelled
/admin/orders/trash
/admin/orders/incomplete
```

**Top Stat Cards (4):**
Total Orders | Completed | Cancelled | Returns (weekly % change)

**Filter bar:**
- Search: order number / customer name / mobile
- Date range picker
- Category dropdown
- Status dropdown (on "All Orders" tab)

**Table:**
| Col | Detail |
|---|---|
| ☐ | Bulk select |
| Order # | #CHU-XXXXX (link to detail) |
| Product(s) | Thumb(s) + name(s) |
| Customer | Name + mobile |
| Date | Order date |
| Qty | Total items |
| Total | ৳ amount |
| Payment | Badge: COD / Paid / Incomplete |
| Status | Badge: Processing / Complete / etc. |
| Actions | ⋯ → View / Edit Status / Remove |

**Bulk Actions:** Change status | Export CSV

**Order Detail Page:**
- Full customer info (name, mobile, district, thana, address)
- Itemized order (thumb, name, variant, qty, unit price, subtotal)
- Delivery charge, coupon discount, total
- Status change dropdown + Save
- Internal notes: textarea + save + history log
- Print/PDF invoice button

---

### 7.5 Customer Management

**Top Stats (3 cards):** Total Customers | New This Week | Repeat Customers

**Top 10 Customers Widget:**
Rank | Name | Total Spent ৳ | Order Count

**Table:**
| Col | Detail |
|---|---|
| # | Row number |
| Name | Full name |
| Joining Date | First order date |
| Phone | Mobile number |
| Email | If provided |
| Total Spent | ৳ sum |
| Orders | Count |
| Status | Badge: New / Returning / VIP |
| Actions | ⋯ → Purchase History / Edit / Remove |

**Purchase History (Dialog):**
- Product Name | Date | Qty | Price | Status
- Download Invoice (PDF) per row
- "View All Orders" button

**Add Customer Form:**
Name, Mobile, Email (optional), District, Address, Status

---

### 7.6 Store Management

#### Banner Management
- Grid of current banners (drag-to-reorder)
- Each: image preview, title, link URL, sort #, Status toggle, schedule dates, Delete
- "Add New Banner": image upload, title, link URL, schedule
- Max 10 banners

#### Payment Management
- **COD:** Enable/Disable toggle
- **Delivery Charges:**
  - Inside Dhaka: ৳ input
  - Outside Dhaka: ৳ input
  - Per-district custom charges: accordion table
- **Online Payment** (disabled in v1 — "Coming Soon"):
  - bKash: API key, Secret key fields (grayed)
  - Nagad: API key, Secret key fields (grayed)
  - Card/SSLCommerz: merchant ID, store password (grayed)

#### Logo Management
- Site Logo: upload zone + preview (recommended 200×60px, SVG/PNG)
- Favicon: upload zone + preview (32×32px)
- Image crop/resize tool (aspect-ratio constrained)

#### Footer Management
- Contact Info: Phone, Address, Email
- Social Links: Facebook, Instagram, YouTube, WhatsApp number
- Link Group 1: Title + link items (drag-to-reorder, add/remove)
- Link Group 2: Title + link items
- About Text: short textarea
- Live preview panel on right side

#### Landing Page — Create & Manage

**List Table:**
Title | Slug | Product | Status | Created | Actions (Edit/Duplicate/Preview/Delete)

**Landing Page Builder:**
- Page Title *
- URL Slug * (auto-generated, editable) → published at `/lp/{slug}`
- Hero Section: headline, subheadline, bg image or color picker
- Product Selector: links to store product
- Section toggles (show/hide): Gallery | Details | Reviews | Trust Badges | FAQ
- CTA Button Text: "এখনই অর্ডার করুন" (editable)
- Tracking: Facebook Pixel ID, Google Analytics ID
- Status: Published / Draft
- Preview in new tab button

**Published landing pages:**
- Route: `/lp/{slug}` (public, no site header/footer)
- Standalone sales page + embedded checkout CTA
- Direct to `/checkout` with product pre-filled

---

## 8. API & Backend Logic

### Frontend Routes (web.php)

```php
// Storefront
Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/shop', [ShopController::class, 'index'])->name('shop');
Route::get('/product/{slug}', [ProductController::class, 'show'])->name('product.show');
Route::get('/about', [PageController::class, 'about'])->name('about');
Route::get('/terms', [PageController::class, 'terms'])->name('terms');
Route::post('/cart/validate-coupon', [CouponController::class, 'validate'])->name('cart.validate-coupon');
Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout');
Route::post('/checkout/place-order', [CheckoutController::class, 'placeOrder'])
    ->middleware('throttle:5,60')->name('checkout.place-order');
Route::get('/order/confirmation/{orderNumber}', [OrderController::class, 'confirmation'])->name('order.confirmation');
Route::post('/track-order', [OrderController::class, 'track'])->name('order.track');

// API (AJAX)
Route::get('/api/thanas', [ThanaController::class, 'byDistrict'])->name('api.thanas');

// Landing Pages (public)
Route::get('/lp/{slug}', [LandingPageController::class, 'show'])->name('landing.show');
```

### Admin Routes (admin.php or web.php with prefix)

```php
Route::prefix('admin')->name('admin.')->group(function () {
    // Auth
    Route::get('/login', [AdminAuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AdminAuthController::class, 'login']);
    Route::post('/logout', [AdminAuthController::class, 'logout'])->name('logout');

    Route::middleware('admin.auth')->group(function () {
        Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

        // Products
        Route::resource('products', ProductController::class);
        Route::post('/products/{id}/duplicate', [ProductController::class, 'duplicate']);
        Route::resource('brands', BrandController::class);
        Route::resource('categories', CategoryController::class);
        Route::resource('tags', TagController::class);
        Route::resource('attributes', AttributeController::class);
        Route::resource('reviews', ReviewController::class)->only(['index', 'update', 'destroy']);

        // Orders
        Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
        Route::get('/orders/{status}', [OrderController::class, 'byStatus'])->name('orders.status');
        Route::get('/orders/detail/{id}', [OrderController::class, 'show'])->name('orders.show');
        Route::put('/orders/{id}/status', [OrderController::class, 'updateStatus']);

        // Customers
        Route::resource('customers', CustomerController::class);
        Route::get('/customers/{id}/purchases', [CustomerController::class, 'purchaseHistory']);

        // Store
        Route::resource('banners', BannerController::class);
        Route::get('/store/payment', [StoreController::class, 'payment']);
        Route::put('/store/payment', [StoreController::class, 'updatePayment']);
        Route::get('/store/logo', [StoreController::class, 'logo']);
        Route::put('/store/logo', [StoreController::class, 'updateLogo']);
        Route::get('/store/footer', [StoreController::class, 'footer']);
        Route::put('/store/footer', [StoreController::class, 'updateFooter']);
        Route::resource('landing-pages', LandingPageController::class);
    });
});
```

### Key Business Logic

#### Delivery Charge Calculation
```php
function calculateDeliveryCharge(string $districtName): int
{
    $district = District::where('name', $districtName)->first();
    if ($district && $district->delivery_charge !== null) {
        return $district->delivery_charge;
    }
    $insideDhaka = ['Dhaka', 'Dhaka City Corporation', 'Narayanganj'];
    if (in_array($districtName, $insideDhaka)) {
        return (int) StoreSetting::get('delivery_inside_dhaka', 80);
    }
    return (int) StoreSetting::get('delivery_outside_dhaka', 130);
}
```

#### Order Number Generation
```php
function generateOrderNumber(): string
{
    do {
        $number = 'CHU-' . str_pad(rand(10000, 99999), 5, '0', STR_PAD_LEFT);
    } while (Order::where('order_number', $number)->exists());
    return $number;
}
```

#### Discounted Price Calculation
```php
function getDiscountedPrice(Product $product): float
{
    return match($product->discount_type) {
        'percentage' => $product->price * (1 - $product->discount_value / 100),
        'fixed'      => max(0, $product->price - $product->discount_value),
        default      => $product->price,
    };
}
```

---

## 9. Non-Functional Requirements

### Performance
- Lazy-load all images (`loading="lazy"` attribute)
- Paginated product queries (no `SELECT *` full scans)
- Eager load Eloquent relationships (prevent N+1)
- Vite production build: minification + asset hashing
- Target Lighthouse Performance: ≥ 75 mobile
- LCP target: < 2.5s on 4G

### Security
- CSRF: Laravel default (all POST/PUT/DELETE)
- Input sanitization: all forms via Laravel Form Requests
- Rate limiting: checkout POST (5/hour/IP)
- Admin routes: `auth` middleware guard
- File uploads: type whitelist (jpg, jpeg, png, webp, svg), max 5MB, MIME check
- XSS: Blade/Vue auto-escaping (no raw `v-html` on user input)
- SQL injection: Eloquent ORM (no raw queries with user input)

### SEO
- Inertia.js with server-side head management (Inertia's `<Head>` component)
- Meta title + description per product, category, page
- Clean URL slugs (no numeric IDs in public URLs)
- Open Graph tags for product pages (sharing preview)
- JSON-LD structured data: Product schema on product pages
- Canonical URLs
- Sitemap.xml (`/sitemap.xml` route)

### Accessibility
- shadcn-vue (Radix Vue primitives): keyboard navigable, ARIA attributes
- Color contrast: WCAG AA minimum
- All images: descriptive `alt` attributes
- Form labels: always visible (no placeholder-only patterns)

### Browser Support
- Chrome 120+ (desktop + Android)
- Firefox 120+ (desktop)
- Safari 17+ (macOS + iOS)
- Samsung Internet (for BD Android market)

### Localization
- Storefront: Bangla (Bengali) primary language
- Admin panel: English (matches SellMate design reference)
- Currency: ৳ (BDT Taka symbol)
- Phone format: Bangladeshi (+880 / 01X prefix)

---

## 10. Out of Scope (v1)

| Feature | Notes |
|---|---|
| Customer login/accounts | Guest checkout + Track Order by order# + phone only |
| Online payment live wiring | UI/toggle present, API integration is phase 2 |
| SMS/Email notifications | Infrastructure ready, sending deferred |
| Multi-vendor / Marketplace | Single-vendor only in v1 |
| Native mobile app | Web responsive only |
| Full SSR (Inertia SSR) | Client-side Inertia sufficient for v1 |
| Advanced ML recommendations | Rule-based suggestions only |
| Inventory purchase tracking | Cost price optional, no PO system |

---

## 11. Delivery Phases / Milestones

| Phase | Deliverables | Priority |
|---|---|---|
| **Phase 1 — Foundation** | Laravel + Inertia + Vue 3 + shadcn-vue setup, Tailwind config, DB migrations (all tables), Admin auth, design system tokens (colors, typography, spacing) | Critical |
| **Phase 2 — Storefront Core** | Home page (all sections), Shop page (filters, pagination), Product Single page (gallery, variants, CTAs), Cart Sheet component | High |
| **Phase 3 — Checkout Flow** | Checkout page, Order confirmation page, delivery charge logic, COD order creation, coupon validation | High |
| **Phase 4 — Admin Core** | Overview dashboard (all widgets), Product Management (All Products, Add/Edit, Brands, Categories, Tags, Attributes, Reviews) | High |
| **Phase 5 — Order & Customer** | Order Management (all statuses, detail view, status update), Customer Management (list, purchase history, add customer) | High |
| **Phase 6 — Store Management** | Banner Management, Payment Management, Logo Management, Footer Management, Landing Page builder | Medium |
| **Phase 7 — Polish & QA** | Mobile responsive pass, dark mode admin, performance optimization, cross-browser testing, content population, SEO meta, launch checklist | High |

---

## 12. Acceptance Criteria

### Storefront Acceptance:
- [ ] Customer can go from Home → Product → Cart → Checkout → Confirmation in ≤ 3 clicks
- [ ] Cart persists on page refresh (localStorage)
- [ ] All pages render correctly on mobile (no horizontal scroll, no broken layout)
- [ ] Bottom nav appears on all storefront pages on mobile (< 768px)
- [ ] Checkout form validates required fields with inline error messages
- [ ] Bangladeshi phone format validation works correctly
- [ ] Delivery charge auto-updates when district changes
- [ ] Order confirmation page shows correct order data from DB

### Admin Acceptance:
- [ ] New product added in admin → immediately visible in Shop page
- [ ] New order placed → immediately appears in admin Order Management (Processing tab)
- [ ] Order status changed in admin → reflected in order confirmation page
- [ ] Banner uploaded → immediately shows in homepage carousel
- [ ] Dark mode toggle works; preference persists across sessions
- [ ] All tables have working pagination, sorting, and search/filter
- [ ] Low-stock products appear in Inventory Alerts widget (threshold ≤ 10)

### Performance Acceptance:
- [ ] Lighthouse Performance ≥ 75 on mobile
- [ ] No JavaScript console errors in production build
- [ ] All product images have descriptive alt text
- [ ] Admin dashboard loads in < 3s with 100+ products in DB

---

*For detailed design specifications, component mapping, and visual guidelines, see [DESIGN.md](./DESIGN.md)*

*For project setup instructions, see [README.md](./README.md)*
