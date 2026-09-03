# 🎨 DESIGN.md
## ChutirMart — Complete Design System & UI Specification
### Version 2.0 | Figma-Accurate Implementation Guide

**Base Library:** shadcn-vue (shadcn/ui Vue port) + Tailwind CSS 4
**Design References:** Figma Mockups — 11 screens (Storefront + Admin/SellMate Theme)
**Font:** Hind Siliguri (Bangla) + Inter (Latin) — Google Fonts
**Icon Library:** lucide-vue-next

---

## 📌 Table of Contents

1. [Design Principles](#1-design-principles)
2. [Color System (Design Tokens)](#2-color-system-design-tokens)
3. [Typography](#3-typography)
4. [Spacing & Layout Grid](#4-spacing--layout-grid)
5. [shadcn-vue Component Mapping](#5-shadcn-vue-component-mapping)
6. [Storefront — Page-by-Page Specs](#6-storefront--page-by-page-specs)
7. [Admin Panel — Page-by-Page Specs](#7-admin-panel--page-by-page-specs)
8. [Responsive Breakpoints](#8-responsive-breakpoints)
9. [Component Specifications](#9-component-specifications)
10. [Motion & Animation Guide](#10-motion--animation-guide)
11. [Dark Mode (Admin)](#11-dark-mode-admin)
12. [Iconography](#12-iconography)
13. [Setup & Configuration](#13-setup--configuration)

---

## 1. Design Principles

### Two Distinct Visual Themes:

#### Storefront Theme — "Warm & Trustworthy"
- **Feeling:** Warm, inviting, trust-focused, conversion-optimized
- **Background:** Warm off-white/cream (`#F5F3EE`) — not pure white, feels softer
- **Accents:** Green (trust, add to cart, confirm) + Red (urgency, buy now, discounts)
- **Style:** Clean product cards, prominent CTAs, Bangla copy with clear readability
- **Mood:** Approachable marketplace, like a friendly Bengali bazaar — digital

#### Admin Theme — "SellMate: Clean & Professional"
- **Feeling:** Data-dense but airy, professional, efficient
- **Background:** Light lavender-gray (`#F3F2FA`) — subtle purple tint, not gray
- **Accents:** Indigo/Purple (`#5B4FE9`) — primary action color
- **Style:** Compact tables, clear stat cards, good information hierarchy
- **Mood:** Modern SaaS dashboard, inspired by Figma's SellMate design reference

### Universal Principles:
- **Lightweight & Clean** — Minimal shadow, minimal bevel; flat cards + subtle borders (shadcn default)
- **Trust-first storefront** — COD badge, delivery time, 24/7 support always visible
- **Conversion-focused** — Add to Cart / Buy Now always prominent, above-fold where possible
- **Consistent component reuse** — Same Product Card, Buttons, Badges, Inputs across all storefront pages
- **Pixel-perfect Figma accuracy** — Implement exactly as designed in Figma

---

## 2. Color System (Design Tokens)

### Method: Tailwind CSS + shadcn CSS Variables
Both token sets use CSS custom properties defined in `:root` (storefront) and `.admin` layout class (admin panel).

---

### 2.1 Storefront Color Tokens

```css
/* resources/css/storefront.css */
:root {
  /* Backgrounds */
  --background: #F5F3EE;      /* Page background — warm off-white/cream */
  --card:       #FFFFFF;      /* Card surfaces */
  --muted:      #EFEDE7;      /* Input backgrounds, subtle sections */

  /* Text */
  --foreground:          #1A1A1A;   /* Primary text — near-black */
  --muted-foreground:    #6B7280;   /* Secondary text, placeholders, strikethrough prices */
  --card-foreground:     #1A1A1A;   /* Text on cards */

  /* Borders & Dividers */
  --border: #E3E0D8;    /* Card borders, input borders, dividers */
  --input:  #E3E0D8;    /* Input border color */
  --ring:   #1E8A3C;    /* Focus ring color — green */

  /* Primary (Green — Trust, Add to Cart, Confirm) */
  --primary:             #1E8A3C;   /* Main green — buttons, nav accent */
  --primary-foreground:  #FFFFFF;   /* Text on green buttons */
  --primary-hover:       #176F30;   /* Green button hover state */

  /* Destructive / Urgency (Red — Buy Now, Discounts, Urgency) */
  --destructive:             #D62828;   /* Red — Buy Now button, urgency banners */
  --destructive-foreground:  #FFFFFF;   /* Text on red elements */
  --accent-urgent:           #D62828;   /* Alias for destructive */

  /* Secondary / Neutral */
  --secondary:             #F0EEE8;   /* Secondary button backgrounds */
  --secondary-foreground:  #374151;   /* Text on secondary buttons */

  /* Special colors */
  --star-rating:   #F5A623;   /* Amber — star ratings */
  --badge-hot:     #FF4444;   /* "HOT" product badge */
  --badge-new:     #22C55E;   /* "NEW" product badge */
  --badge-sale:    #EF4444;   /* "SALE" / discount badge */
  --whatsapp:      #25D366;   /* WhatsApp green button */

  /* Nav bar accent */
  --nav-green:  #1E8A3C;   /* Left half of dual-color nav */
  --nav-red:    #D62828;   /* Right half of dual-color nav */

  /* Shadows */
  --shadow-sm:  0 1px 2px rgba(0,0,0,0.05);
  --shadow-md:  0 4px 6px rgba(0,0,0,0.07);
  --shadow-lg:  0 10px 15px rgba(0,0,0,0.10);

  /* Border radius */
  --radius: 0.75rem;    /* 12px — card radius (rounded-xl) */
  --radius-sm: 0.5rem;  /* 8px — button/input radius (rounded-lg) */
  --radius-xs: 0.375rem; /* 6px — badge radius (rounded-md) */
}
```

**Storefront Color Usage Guide:**

| Element | Token | Hex |
|---|---|---|
| Page background | `--background` | `#F5F3EE` |
| Product cards | `--card` | `#FFFFFF` |
| Primary text | `--foreground` | `#1A1A1A` |
| Secondary/muted text | `--muted-foreground` | `#6B7280` |
| Strikethrough price | `--muted-foreground` + `line-through` | `#6B7280` |
| Card/input borders | `--border` | `#E3E0D8` |
| Add to Cart button | `--primary` bg | `#1E8A3C` |
| Buy Now button | `--destructive` bg | `#D62828` |
| Discount price | `--destructive` | `#D62828` |
| Star ratings | `--star-rating` | `#F5A623` |
| Verified badge | `--badge-new` | `#22C55E` |
| WhatsApp button | `--whatsapp` | `#25D366` |
| Nav bar (green side) | `--nav-green` | `#1E8A3C` |
| Nav bar (red side) | `--nav-red` | `#D62828` |

---

### 2.2 Admin (SellMate) Color Tokens

```css
/* resources/css/admin.css — applied under .admin-layout class */
.admin-layout {
  /* Backgrounds */
  --background:    #F3F2FA;   /* Dashboard bg — light lavender-gray */
  --card:          #FFFFFF;   /* Card surfaces */
  --sidebar-bg:    #FFFFFF;   /* Sidebar background */
  --topbar-bg:     #FFFFFF;   /* Topbar background */

  /* Text */
  --foreground:         #1F2937;   /* Primary text */
  --muted-foreground:   #6B7280;   /* Secondary text */

  /* Borders */
  --border:  #E5E7EB;   /* Subtle borders */

  /* Primary (Indigo/Purple — main action color) */
  --primary:             #5B4FE9;   /* Indigo purple — buttons, active states */
  --primary-foreground:  #FFFFFF;   /* Text on primary buttons */
  --primary-hover:       #4A3FD4;   /* Hover state */

  /* Sidebar */
  --sidebar-active-bg:    #EDEBFB;   /* Active nav item background (light purple) */
  --sidebar-active-text:  #5B4FE9;   /* Active nav item text/icon */
  --sidebar-icon:         #9CA3AF;   /* Inactive icon color */
  --sidebar-text:         #374151;   /* Inactive text color */

  /* Status colors */
  --success:  #22C55E;   /* Green — Complete, Paid, positive % */
  --warning:  #F59E0B;   /* Amber — Processing, Low stock */
  --danger:   #EF4444;   /* Red — Cancelled, critical alerts */
  --info:     #3B82F6;   /* Blue — VIP badge, informational */
  --neutral:  #6B7280;   /* Gray — On Hold, COD badge */

  /* Stat card % indicators */
  --stat-up:    #22C55E;   /* Positive change */
  --stat-down:  #EF4444;   /* Negative change */

  /* Chart colors */
  --chart-sales:    #5B4FE9;   /* Sales line — indigo */
  --chart-revenue:  #22C55E;   /* Revenue/profit line — green */
  --chart-grid:     #F3F4F6;   /* Chart grid lines */
}
```

**Admin Color Usage Guide:**

| Element | Token | Hex |
|---|---|---|
| Dashboard background | `--background` | `#F3F2FA` |
| Sidebar + Cards | `--card` | `#FFFFFF` |
| Primary buttons | `--primary` bg | `#5B4FE9` |
| Active sidebar item | `--sidebar-active-bg` | `#EDEBFB` |
| Active sidebar text/icon | `--sidebar-active-text` | `#5B4FE9` |
| Complete/Success badges | `--success` | `#22C55E` |
| Processing/Warning badges | `--warning` | `#F59E0B` |
| Cancelled/Danger badges | `--danger` | `#EF4444` |
| VIP/Info badges | `--info` | `#3B82F6` |
| Positive % change | `--stat-up` | `#22C55E` |
| Negative % change | `--stat-down` | `#EF4444` |

---

### 2.3 Dark Mode Tokens (Admin Only)

```css
.admin-layout.dark {
  --background:    #0F0E1A;   /* Very dark purple-black */
  --card:          #1A1929;   /* Card surface */
  --sidebar-bg:    #1A1929;   /* Sidebar dark */
  --topbar-bg:     #1A1929;
  --foreground:    #F9FAFB;
  --muted-foreground: #9CA3AF;
  --border:        #2D2B45;
  --sidebar-active-bg:   #2D2B55;
  --sidebar-active-text: #8B7FF5;
}
```

---

## 3. Typography

### Font Loading (Google Fonts)
```html
<!-- In app.blade.php <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

### Tailwind Font Config
```js
// tailwind.config.js (or CSS layer in Tailwind 4)
fontFamily: {
  sans: ['Hind Siliguri', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  bangla: ['Hind Siliguri', 'sans-serif'],
  latin: ['Inter', 'ui-sans-serif', 'sans-serif'],
}
```

### Typography Scale

#### Storefront Typography
| Element | Classes | Size | Weight |
|---|---|---|---|
| Page H1 (product title) | `text-2xl md:text-3xl font-semibold` | 24–30px | 600 |
| Section H2 ("Top Selling") | `text-lg md:text-xl font-semibold` | 18–20px | 600 |
| Card title | `text-sm md:text-base font-medium` | 14–16px | 500 |
| Body text | `text-sm md:text-base` | 14–16px | 400 |
| Current price (large) | `text-xl md:text-2xl font-bold text-destructive` | 20–24px | 700 |
| Strikethrough price | `text-sm text-muted-foreground line-through` | 14px | 400 |
| Badge text | `text-xs font-medium` | 12px | 500 |
| Button text | `text-sm font-medium` | 14px | 500 |
| Footer links | `text-sm` | 14px | 400 |
| Trust badge label | `text-xs font-medium` | 12px | 500 |
| Review text | `text-sm` | 14px | 400 |
| Nav links | `text-sm font-medium` | 14px | 500 |

#### Admin Typography
| Element | Classes | Size | Weight |
|---|---|---|---|
| Page title | `text-xl font-semibold` | 20px | 600 |
| Stat card value | `text-2xl md:text-3xl font-bold` | 24–30px | 700 |
| Stat card label | `text-sm text-muted-foreground` | 14px | 400 |
| Table header | `text-xs font-medium uppercase tracking-wide text-muted-foreground` | 12px | 500 |
| Table cell | `text-sm` | 14px | 400 |
| Sidebar item | `text-sm font-medium` | 14px | 500 |
| Section heading | `text-base font-semibold` | 16px | 600 |
| Form label | `text-sm font-medium` | 14px | 500 |
| Input text | `text-sm` | 14px | 400 |

---

## 4. Spacing & Layout Grid

### Container
```css
/* Max width container */
.container {
  max-width: 1280px;   /* xl breakpoint */
  margin: 0 auto;
  padding: 0 1rem;     /* px-4 mobile */
}

/* Desktop padding */
@media (min-width: 1024px) {
  .container { padding: 0 2rem; }  /* px-8 */
}
```

### Base Spacing Scale (Tailwind 4px units)
| Token | px | Usage |
|---|---|---|
| `p-2` | 8px | Tight padding (badges, small buttons) |
| `p-3` | 12px | Input internal padding |
| `p-4` | 16px | Card padding (mobile) |
| `p-6` | 24px | Card padding (desktop), section inner padding |
| `p-8` | 32px | Large section padding |
| `gap-3` | 12px | Tight grid gaps |
| `gap-4` | 16px | Standard grid gaps |
| `gap-6` | 24px | Section element gaps |

### Section Rhythm
- Between homepage sections: `py-8 md:py-12` (32–48px)
- Between admin content blocks: `gap-6` (24px)
- Card internal padding: `p-4 md:p-6`

### Product Grid Layouts
```css
/* Storefront product grid */
.product-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);    /* mobile: 2 cols */
  gap: 1rem;
}
@media (min-width: 768px) {
  .product-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (min-width: 1024px) {
  .product-grid { grid-template-columns: repeat(4, 1fr); }
}

/* Admin stat cards */
.stat-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}
@media (min-width: 1024px) {
  .stat-cards { grid-template-columns: repeat(4, 1fr); }
}
```

### Border Radius
| Context | Class | px |
|---|---|---|
| Product cards | `rounded-xl` | 12px |
| Buttons | `rounded-lg` | 8px |
| Input fields | `rounded-md` | 6px |
| Badges | `rounded-md` | 6px |
| Admin cards | `rounded-lg` | 8px |
| Modals/Sheets | `rounded-t-2xl` (mobile bottom sheet) | 16px top |
| Color swatches | `rounded-full` | circle |

---

## 5. shadcn-vue Component Mapping

| UI Element | shadcn-vue Component | Notes |
|---|---|---|
| Search bar | `Input` + `Button` (icon) | Search icon inside input right-side |
| Header icon buttons | `Button` variant="ghost" + `Badge` | Ghost buttons with icons |
| "More" dropdown | `DropdownMenu` | With ChevronDown icon |
| Hero banner carousel | `Carousel` | Auto-play with embla-carousel |
| Product Card | `Card` + `Badge` + `Button` | Custom composed component |
| Customer Reviews carousel | `Carousel` + `Card` + `Avatar` | Auto-play, manual arrows |
| Cart slide-in sidebar | `Sheet` side="right" | 420px desktop, 100% mobile |
| Quantity stepper | Custom: `Button` (icon) + `Input` | Inline flex component |
| Coupon code accordion | `Accordion` | Single item accordion |
| Checkout payment radios | `RadioGroup` + `Card` | Card-style radio items |
| District/Thana dropdown | `Select` | Searchable select |
| Terms checkbox | `Checkbox` + `Label` | Linked to T&C page |
| Color variant swatches | Custom `ToggleGroup` | Circle swatches with border on active |
| Product details tabs | `Tabs` | Default horizontal tabs |
| Toast notifications | `Sonner` | Slide-up, auto-dismiss 2.5s |
| Track Order modal | `Dialog` | Centered modal |
| Product image lightbox | `Dialog` (full screen) | Mobile: native swipe |
| Filter (mobile) | `Sheet` side="bottom" | Full-width bottom sheet |
| Admin sidebar | Custom + `Collapsible` | shadcn Sidebar block |
| Admin nav sub-items | `Collapsible` (accordion expand) | Inline expand, not fly-out |
| Order status tabs | Sidebar sub-nav OR `Tabs` | Filtered same Table component |
| Admin stat cards | `Card` | With trend arrow icon |
| Admin data tables | `Table` + `DropdownMenu` + `Pagination` | shadcn Table component |
| Sales chart | `Chart` (Chart.js wrapper) | Dual-line chart |
| Add Product form | `Form` + `Input` + `Textarea` + `Select` | shadcn Form (with Vee-Validate) |
| Purchase history modal | `Dialog` + `Table` | Customer purchases |
| Dark mode toggle | `Switch` | Tailwind `class` strategy |
| Notification bell | `Popover` + `Badge` | Recent alerts list |
| Mobile bottom nav | Custom `nav` component | Fixed bottom, 5 icons |
| Image upload dropzone | Custom + `Input type=file` | Drag & drop with preview |
| Rich text editor | Tiptap Vue | For product descriptions |
| Confirmation/alert dialogs | `AlertDialog` | Destructive action confirm |
| Tooltip | `Tooltip` | For icon buttons |
| Date range picker | `Calendar` (shadcn) | Admin order date filter |
| Progress bar | `Progress` | Stock level visual |
| Skeleton loader | `Skeleton` | Loading states for tables/cards |

---

## 6. Storefront — Page-by-Page Specs

### 6.1 Global Header

```
Desktop:
┌────────────────────────────────────────────────────────────────────────────┐
│ [Logo 150×40]  [──────── Search Bar ─────── 🔍]  [📦 Track] [👤 Sign In] │
│                                                   [♡ Wishlist] [🛒 Cart 2]│
├────────────────────────────────────────────────────────────────────────────┤
│ [GREEN HALF] All Products | Home & Kitchen | Smart Gadget | Offer Products │
│ [RED HALF]   Summer Products | Feature Products | Flash Products | About Us │
└────────────────────────────────────────────────────────────────────────────┘

Mobile:
┌────────────────────────────────────────────────────────────────────────────┐
│ [Logo]                                              [🔍]  [🛒 2]           │
└────────────────────────────────────────────────────────────────────────────┘
```

**Nav bar details:**
- Dual-tone bar: left section `bg-[#1E8A3C]` (green), right section `bg-[#D62828]` (red)
- Implemented as: `background: linear-gradient(to right, #1E8A3C 50%, #D62828 50%)`
- OR: Two `<div>` halves in flex
- Nav links: `text-white text-sm font-medium px-4 py-2.5 hover:opacity-90`

---

### 6.2 Home Page Sections

#### Hero Carousel
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  [Full-width banner image — 1280×480px recommended] │
│    Bangla headline text overlaid (optional)         │
│                                                     │
│  ◀                                               ▶  │
│                    ● ○ ○ ○                          │
└─────────────────────────────────────────────────────┘
```
- Height: `h-48 md:h-64 lg:h-[480px]`
- Images: `object-cover w-full`
- Arrows: absolute positioned, `Button` ghost variant with ChevronLeft/Right icons
- Dots: Absolute bottom-center, filled/unfilled circles

#### Featured Categories
```
[🏠 Home &    [⚡ Smart     [🎁 Offer     [☀️ Summer    [⭐ Feature    [→ More]
  Kitchen]     Gadget]       Products]     Products]     Products]
```
- Horizontal scroll: `overflow-x-auto scrollbar-hide`
- Each item: `flex flex-col items-center gap-2 min-w-[80px]`
- Icon: 48×48 circle background `bg-muted rounded-full p-3`
- Label: `text-xs text-center`

#### Product Grid Sections (Top Selling / All Products)
```
[Section Heading ──────────────────────── See All →]

[Card] [Card] [Card] [Card]
[Card] [Card] [Card] [Card]
```
- Section header: flex justify-between align-center
- "See All": `Button` variant="link" with ArrowRight icon
- Grid: `grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4`

#### Customer Reviews Carousel
```
[◀]  [Card: 😊 Name | Location | ✓ Verified | ★★★★★ | Review text | Tag]  [▶]
```
- Visible: 4 cards desktop / 2 tablet / 1 mobile
- Auto-play interval: 5s
- Card: `bg-white rounded-xl p-5 shadow-sm border border-border`
- Avatar: `w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold`

#### Urgency CTA Banner
```
┌────────────────────────────────────────────────────────────────────┐
│  🔥 সীমিত স্টক! — এখনই অর্ডার করুন!              [অর্ডার করুন →] │
└────────────────────────────────────────────────────────────────────┘
```
- Background: `bg-gradient-to-r from-[#1E8A3C] to-[#D62828]`
- Text: white
- Button: `Button` variant="outline" className="border-white text-white hover:bg-white hover:text-primary"
- Full width: `py-6 px-8`

#### Footer
```
Desktop (4 columns):
[Logo + About text]  [Contact Info]  [Follow Us]  [Useful Links | Our Products]

Mobile (Accordion):
[▶ About]  [▶ Contact]  [▶ Follow Us]  [▶ Links]
```

Footer background: `bg-[#1A1A1A]` (dark) or `bg-[#1E8A3C]` (green — check Figma)
Footer text: white
Social icons: Circle buttons, `w-9 h-9 rounded-full`
WhatsApp button: `bg-[#25D366] text-white px-4 py-2 rounded-lg`
Copyright bar: `border-t border-white/20 mt-8 pt-4 text-sm text-white/70`

---

### 6.3 Shop Page

```
[Breadcrumb: Home / Shop]                           [Sort By: Default ▾]
────────────────────────────────────────────────────────────────────────
[Left Sidebar 280px]           [Product Grid — remaining]
┌──────────────────┐           ┌───────────────────────────────────────┐
│ Filter Products  │           │ [Card] [Card] [Card]                  │
│ ─────────────── │           │ [Card] [Card] [Card]                  │
│ Price Range      │           │ [Card] [Card] [Card]                  │
│ ৳[──●────────]  │           │                                       │
│ Min ৳ ___ Max ৳ _│           │ [Pagination: ← 1 2 3 4 5 →]          │
│ ─────────────── │           └───────────────────────────────────────┘
│ Brands           │
│ ☑ Brand A (12)  │
│ ☐ Brand B (8)   │
│ ─────────────── │
│ Categories       │
│ ☑ Category A    │
│ ─ ☐ Sub Cat    │
│ ─────────────── │
│ Availability     │
│ ● In Stock      │
│ ○ All           │
└──────────────────┘

Mobile: Filter button appears above grid → Sheet from bottom
```

**Sidebar:**
- Background: `bg-card rounded-xl p-4 border border-border`
- Section headers: `text-sm font-semibold mb-3`
- Price slider: dual-handle, with Tailwind range input styling

---

### 6.4 Product Single Page

```
[Breadcrumb]
──────────────────────────────────────────────────────────────────────────────
[Left — Gallery 50%]                [Right — Info 50%]
┌────────────────────────────────┐  ┌─────────────────────────────────────────┐
│                                │  │ Product Title (H1)                      │
│   [Main Image — aspect-square] │  │ ★★★★☆ 4.2 (156 reviews) 📊 94% rec.   │
│                                │  │ ─────────────────────────────────────── │
│ [thumb1] [thumb2] [thumb3] [+] │  │ ~~৳1,200~~   ৳950      [Save 20%] 🏷️   │
└────────────────────────────────┘  │ ─────────────────────────────────────── │
                                    │ Color:                                  │
                                    │ [● Red] [● Blue] [● Green] [○ Yellow]  │
                                    │ ─────────────────────────────────────── │
                                    │ Qty: [−] [  2  ] [+]                   │
                                    │ ─────────────────────────────────────── │
                                    │ [  Add To Cart  ] [  Buy Now (red)  ]  │
                                    │ [WhatsApp Order (green)] [📞 Call]      │
                                    │ ─────────────────────────────────────── │
                                    │ 📦 COD  |  🚚 1-3 Days  |  💬 24/7     │
                                    └─────────────────────────────────────────┘

[Tabs: Product Details | Product Video & Images]
  ─────────────────────────────────────────────
  [Rich HTML content / YouTube embed]

[Related Products]
  [Card] [Card] [Card] [Card]
```

**Gallery specifics:**
- Main image: `aspect-square rounded-xl object-cover w-full`
- Thumbnails: `flex gap-2 mt-3`, each `w-16 h-16 rounded-md object-cover cursor-pointer`
- Active thumbnail: `ring-2 ring-primary`

**Variant swatches:**
- Circle: `w-8 h-8 rounded-full cursor-pointer border-2`
- Active: `border-primary scale-110`
- Inactive: `border-transparent hover:border-muted-foreground`
- Color filled: inline `style="background: {color_hex}"`

**Trust badges row:**
```
[📦 Cash on Delivery] | [🚚 ১–৩ দিনের ডেলিভারি] | [💬 ২৪/৭ সাপোর্ট]
```
- Flex row, each: icon (20px) + short text, separated by dividers
- Background: `bg-muted rounded-lg p-3`

**Mobile sticky bar (bottom of screen):**
```
[Add To Cart (outline, flex-1)] [Buy Now (red solid, flex-1)]
```
- `position: fixed; bottom: 0; left: 0; right: 0; z-index: 40`
- `padding: 0.75rem 1rem; padding-bottom: calc(0.75rem + env(safe-area-inset-bottom))`
- Hidden on desktop (`hidden md:hidden` when bottom nav is present: adjust z-index)

---

### 6.5 Cart Sheet

```
┌──────────────────── Shopping Cart (3) ──── [✕] ─┐
│                                                   │
│  [Thumb 64×64]  Product Name              [🗑]   │
│                 Color: Red                        │
│                 [−] [2] [+]        ৳1,900        │
│  ───────────────────────────────────────────────  │
│  [Thumb 64×64]  Product Name 2            [🗑]   │
│                 [−] [1] [+]          ৳950         │
│  ───────────────────────────────────────────────  │
│                                                   │
│  You May Also Like                                │
│  ┌──────┐ ┌──────┐ ┌──────┐                     │
│  │[img] │ │[img] │ │[img] │                     │
│  │Name  │ │Name  │ │Name  │                     │
│  │৳XXX  │ │৳XXX  │ │৳XXX  │                     │
│  │[+Add]│ │[+Add]│ │[+Add]│                     │
│  └──────┘ └──────┘ └──────┘                     │
│                                                   │
│  ▶ Have a coupon code?                           │
│    [_____________________] [Apply]                │
│                                                   │
├───────────────────────────────────────────────────┤
│  Order Total:                          ৳2,850     │
│  [     Proceed to Checkout →     ]               │
└───────────────────────────────────────────────────┘
```

- Sheet width: `w-full max-w-[420px]`
- Header: `sticky top-0 bg-card z-10 border-b`
- Scrollable area: `flex-1 overflow-y-auto`
- Footer: `sticky bottom-0 bg-card border-t p-4`
- "Proceed to Checkout" button: `w-full` + primary green

---

### 6.6 Checkout Page

See PRD §6.6 for full functional spec. Design notes:

- Left/Right column split: `grid-cols-1 md:grid-cols-[1fr_400px] gap-6`
- Each section card: `bg-card rounded-xl p-6 border border-border shadow-sm`
- Payment method radio cards:
  ```
  ┌───────────────────────────────┐
  │ ● 💵 Cash on Delivery         │ ← selected: border-primary bg-primary/5
  └───────────────────────────────┘
  ┌───────────────────────────────┐
  │ ○ 💳 Online Payment  [Soon]   │ ← disabled: opacity-50
  └───────────────────────────────┘
  ```
- Order Summary total row: `bg-primary text-white rounded-lg px-4 py-3 flex justify-between text-lg font-bold`
- Confirm Order button: full-width, `bg-primary text-white py-4 text-base font-semibold`

---

### 6.7 Thank You / Confirmation Page

- Centered layout, max-width 600px
- Success icon: `CheckCircle` (Lucide) `w-20 h-20 text-green-500` with pulse animation
- Order number badge: `bg-primary/10 text-primary px-4 py-2 rounded-full font-mono text-lg font-bold`
- Cards: white, rounded-xl, shadow-sm, border

---

## 7. Admin Panel — Page-by-Page Specs

### 7.1 Admin Shell Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ SIDEBAR (260px)                 │  TOPBAR (full remaining width)            │
│ ┌─────────────────────────────┐ │  [☰] Welcome Back! ChutirMart    [🔍][🌙] │
│ │ [ChutirMart logo]           │ │  [🔔 3] [👤 Admin ▾]                      │
│ │ SellMate                    │ │ ─────────────────────────────────────────  │
│ ├─────────────────────────────┤ │                                           │
│ │ 🏠 Overview                  │ │  [PAGE CONTENT AREA]                     │
│ │ 📦 Product Management ▾     │ │                                           │
│ │   ├ All Product              │ │                                           │
│ │   ├ Add New Product          │ │                                           │
│ │ 📋 Order Management ▾       │ │                                           │
│ │ 👥 Customer Management ▾    │ │                                           │
│ │ ⚙️ Store Management ▾       │ │                                           │
│ │                             │ │                                           │
│ │ 🚪 Log Out                  │ │                                           │
│ └─────────────────────────────┘ │                                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Sidebar CSS:**
```css
.admin-sidebar {
  width: 260px;
  min-height: 100vh;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--border);
  position: fixed;
  top: 0; left: 0;
  z-index: 30;
  transition: width 200ms ease;
}
.admin-sidebar.collapsed { width: 60px; }
.admin-main {
  margin-left: 260px;
  min-height: 100vh;
  transition: margin-left 200ms ease;
}
```

**Topbar CSS:**
```css
.admin-topbar {
  height: 64px;
  background: var(--topbar-bg);
  border-bottom: 1px solid var(--border);
  position: sticky; top: 0; z-index: 20;
  padding: 0 1.5rem;
  display: flex; align-items: center; justify-content: space-between;
}
```

---

### 7.2 Dashboard / Overview

```
[Welcome Back, Admin! 👋] ────────────── [+ Add Products] [View Reports]

┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ 🛒 Sales         │ │ 💰 Revenue       │ │ 📋 Orders        │ │ 👥 Customers     │
│ 1,234            │ │ ৳45,200          │ │ 89               │ │ 234              │
│ ↑12% this week   │ │ ↑8% this week    │ │ ↓3% this week    │ │ ↑20% this week   │
└──────────────────┘ └──────────────────┘ └──────────────────┘ └──────────────────┘

┌───────────────────────────────────────┐ ┌───────────────────────────────────────┐
│ Orders Summary                        │ │ Inventory Alerts                      │
│ 🟡 New Order: 12                      │ │ [img] Turbo Fan        ⚠️ 3 left       │
│ 🔵 Packed: 45                         │ │ [img] Smart Watch      ⚠️ 7 left       │
│ 🟢 Delivered: 234                     │ │ [img] Air Purifier     ⚠️ 1 left       │
│                                       │ │ See All →                             │
└───────────────────────────────────────┘ └───────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────────────┐
│ Purchase & Sales Report    [Weekly ▾]                                             │
│                                                                                   │
│ ৳50k │         ╭──────────────╮                                                  │
│ ৳40k │    ╭────╯   Sales      ╰──                                               │
│ ৳30k │ ╭──╯   ─────────────── Purchase                                          │
│ ৳20k │─╯                                                                         │
│      Jan  Feb  Mar  Apr  May  Jun                                                 │
└───────────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────────────┐
│ Top Performing Products    [Category: All ▾]  [Export CSV]                        │
│ ─────────────────────────────────────────────────────────────────────────────── │
│ # │ Image+Name         │ ID          │ Price   │ Stock │ Sold │ Profit │ Action  │
│ 1 │ [img] Turbo Fan    │ PRD-00123   │ ৳1,200  │  45   │ 234  │ ৳8,400 │ [Edit]  │
└───────────────────────────────────────────────────────────────────────────────────┘
```

**Stat Card Design:**
```css
.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}
.stat-card-icon {
  width: 48px; height: 48px;
  border-radius: 12px;
  background: var(--primary)/10;
  display: flex; align-items: center; justify-content: center;
}
.stat-card-value { font-size: 1.75rem; font-weight: 700; }
.stat-card-label { font-size: 0.875rem; color: var(--muted-foreground); }
.stat-up   { color: var(--success); }
.stat-down { color: var(--danger); }
```

---

### 7.3 Product Management

#### All Products Table Layout
```
[Search: _______________] [Category▾] [Status▾] [Stock▾]    [+ Add Product]

☐ │ Image │ Name            │ ID       │ Category │ Price  │ Stock │ Status  │ ⋯
──────────────────────────────────────────────────────────────────────────────────
☐ │[img]  │ Turbo Fan       │PRD-00123 │ Gadgets  │ ৳1,200 │  45   │ Active  │ ⋯
☐ │[img]  │ Smart Watch     │PRD-00124 │ Gadgets  │   ৳950 │   7 ⚠│ Active  │ ⋯
☐ │[img]  │ Air Purifier    │PRD-00125 │ Home     │ ৳2,500 │  30   │ Draft   │ ⋯

[Bulk Actions: Delete ▾]              [← 1 2 3 4 5 →]  [Show: 10 ▾ per page]
```

**Low stock visual:** `text-warning font-medium` with `AlertTriangle` icon (Lucide)

---

#### Add New Product Form Layout
```
[← Back to Products]    Add New Product
─────────────────────────────────────────────────────────────────────────────────

[Left 60%]                                    [Right 40%]
┌───────────────────────────────────────────┐ ┌────────────────────────────────┐
│ General Information                       │ │ Publishing                     │
│ Product Name *                            │ │ Status: ● Active ○ Draft       │
│ [_________________________________]       │ │ [Save Draft] [Add Products]    │
│ Product ID (auto-generated)               │ ├────────────────────────────────┤
│ [PRD-12345  ✎]                            │ │ Category & Organization        │
│ Description *                             │ │ Category: [Select ▾]           │
│ [Rich text editor — Tiptap]               │ │ Brand: [Select ▾] + [New]      │
│ ───────────────────────────────────────── │ │ Tags: [______] [+ Add]         │
│ Pricing & Stock                           │ ├────────────────────────────────┤
│ Price *          Compare at Price         │ │ Attributes / Variants          │
│ [৳ ________]    [৳ ________]             │ │ [+ Add Attribute]              │
│ Discount: [None ▾] Discount%: [__]       │ │ Color ▾:                       │
│ Stock Qty *      Cost Price               │ │   [Red #FF0000] [+]            │
│ [________]       [৳ ________]            │ │   [Blue #0000FF] [+]           │
│ ───────────────────────────────────────── │ │ Size ▾:                        │
│ Media / Images                            │ │   [S] [M] [L] [XL] [+]       │
│ Main Image:                               │ └────────────────────────────────┘
│ ┌─────────────────────────────────────┐  │
│ │ Drag & drop or click to upload      │  │
│ │         🖼️ Upload Image             │  │
│ └─────────────────────────────────────┘  │
│ Gallery (up to 10):                       │
│ [img1 ×][img2 ×][img3 ×][+ Add]          │
│ ───────────────────────────────────────── │
│ YouTube Video URL                         │
│ [https://youtube.com/...    ]             │
│ [Preview embed if valid URL]             │
└───────────────────────────────────────────┘
```

---

### 7.4 Order Management

```
[All Order] [Processing] [On Hold] [Complete] [Cancelled] [Trash] [Incomplete]  ← Sub-nav links

[Search: _______________] [Date Range: ___ to ___] [Category▾] [Export CSV]

☐ │ Order#   │ Product(s)     │ Customer      │ Date      │ Qty │ Total  │ Pay  │ Status  │ ⋯
────────────────────────────────────────────────────────────────────────────────────────────────
☐ │#CHU-10245│[img] Turbo Fan │ Karim Ahmed   │ Aug 26    │  2  │৳2,400  │COD   │Processing│ ⋯
☐ │#CHU-10244│[img] Smart Wat.│ Rashida Begum │ Aug 25    │  1  │  ৳950  │Paid  │Complete  │ ⋯
```

**Status Badge Colors:**
| Status | Color | Class |
|---|---|---|
| Processing | Amber | `bg-warning/10 text-warning` |
| On Hold | Gray | `bg-gray-100 text-gray-600` |
| Complete | Green | `bg-success/10 text-success` |
| Cancelled | Red | `bg-danger/10 text-danger` |
| Incomplete | Orange | `bg-orange-100 text-orange-600` |
| Trash | Dark gray | `bg-gray-200 text-gray-500` |

**Payment Badge:**
| Payment | Color |
|---|---|
| COD | `bg-gray-100 text-gray-600` |
| Paid | `bg-success/10 text-success` |
| Incomplete | `bg-warning/10 text-warning` |

---

### 7.5 Customer Management

```
┌────────────────┐ ┌────────────────┐ ┌────────────────┐
│ 👥 Total       │ │ 🆕 New This    │ │ 🔄 Returning   │
│ 1,234          │ │ Week: 45       │ │ 678            │
└────────────────┘ └────────────────┘ └────────────────┘

Top 10 Customers:
# │ Name          │ Total Spent │ Orders
1 │ Karim Ahmed   │ ৳45,200    │ 23
...

☐ │ Name         │ Joined   │ Phone      │ Email    │ Spent   │ Orders │ Status  │ ⋯
──────────────────────────────────────────────────────────────────────────────────────
☐ │ Karim Ahmed  │ Jan 2026 │01711234567 │ (none)   │৳45,200  │  23    │ VIP     │ ⋯
```

**Customer Status Badges:**
| Status | Color |
|---|---|
| New | `bg-info/10 text-info` (blue) |
| Returning | `bg-warning/10 text-warning` (amber) |
| VIP | `bg-primary/10 text-primary` (purple) |

---

## 8. Responsive Breakpoints

| Breakpoint | Width | Behavior |
|---|---|---|
| (default) | < 640px | Mobile: 2-col product grid, bottom nav, collapsed header |
| `sm` | 640px+ | 2-col grid still, tablet transition begins |
| `md` | 768px+ | Sidebar filters visible, 3-col grid, desktop header, **bottom nav hidden** |
| `lg` | 1024px+ | 4-col grid, admin sidebar always expanded |
| `xl` | 1280px+ | Max container width reached |

### Mobile-Specific Behaviors:

**Storefront:**
- Header: logo + search icon + cart icon only
- No category nav bar (use Menu tab in bottom nav)
- Product grid: 2 columns (`grid-cols-2`)
- Cart Sheet: 100% width
- Product Single: gallery full-width, info below, sticky CTA bar
- Checkout: single column
- Footer: accordion sections

**Admin Panel:**
- Sidebar: Sheet drawer (left side), triggered by hamburger in topbar
- Tables: horizontal scroll with sticky first column
- Stat cards: 2×2 grid
- Charts: full width
- Forms: single column

---

## 9. Component Specifications

### 9.1 Product Card Component (Reused Everywhere)

```vue
<!-- ProductCard.vue -->
<template>
  <div class="group bg-card rounded-xl overflow-hidden border border-border
              shadow-sm hover:shadow-md hover:scale-[1.02]
              transition-all duration-200 cursor-pointer">
    <!-- Discount badge -->
    <div class="relative">
      <Badge v-if="discount" class="absolute top-2 left-2 z-10 bg-destructive text-white">
        {{ discount }}% OFF
      </Badge>
      <Badge v-if="isNew" class="absolute top-2 left-2 z-10 bg-badge-new text-white">
        NEW
      </Badge>
      <!-- Product Image -->
      <img :src="image" :alt="title"
           class="w-full aspect-square object-cover rounded-t-xl"
           loading="lazy" />
    </div>
    <!-- Card Body -->
    <div class="p-3 md:p-4">
      <h3 class="text-sm font-medium text-foreground line-clamp-2 mb-2">
        {{ title }}
      </h3>
      <div class="flex items-center gap-2">
        <span class="text-base md:text-lg font-bold text-destructive">
          ৳{{ currentPrice }}
        </span>
        <span v-if="originalPrice" class="text-xs text-muted-foreground line-through">
          ৳{{ originalPrice }}
        </span>
      </div>
      <Button class="w-full mt-3" variant="outline"
              @click.stop="addToCart">
        <ShoppingCart class="w-4 h-4 mr-2" />
        Add To Cart
      </Button>
    </div>
  </div>
</template>
```

### 9.2 Mobile Bottom Navigation

```vue
<!-- MobileBottomNav.vue -->
<template>
  <nav class="fixed bottom-0 left-0 right-0 z-50 md:hidden
              bg-card border-t border-border
              flex items-center justify-around
              pb-safe"
       style="padding-bottom: env(safe-area-inset-bottom)">
    <NavItem to="/" icon="Home" label="Home" />
    <NavItem to="/shop" icon="Store" label="Shop" />
    <!-- Center Cart button (elevated) -->
    <div class="relative -top-4">
      <button class="w-14 h-14 rounded-full bg-primary text-white
                     flex items-center justify-center shadow-lg">
        <ShoppingCart class="w-6 h-6" />
        <Badge v-if="cartCount" class="absolute -top-1 -right-1 min-w-5 h-5 text-xs">
          {{ cartCount }}
        </Badge>
      </button>
    </div>
    <NavItem to="/wishlist" icon="Heart" label="Wishlist" />
    <NavItem icon="Menu" label="Menu" @click="openMenu" />
  </nav>
</template>
```

### 9.3 Admin Sidebar Item

```vue
<!-- AdminSidebarItem.vue -->
<template>
  <!-- Top-level link -->
  <RouterLink :to="href"
    class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
           transition-colors duration-150"
    :class="isActive
      ? 'bg-[#EDEBFB] text-[#5B4FE9]'
      : 'text-[#374151] hover:bg-gray-100'">
    <component :is="icon" class="w-5 h-5 flex-shrink-0" />
    <span v-if="!collapsed">{{ label }}</span>
  </RouterLink>
</template>
```

### 9.4 Status Badge

```vue
<!-- StatusBadge.vue -->
<template>
  <span :class="statusClasses[status]"
        class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium">
    {{ statusLabels[status] }}
  </span>
</template>

<script setup>
const statusClasses = {
  processing:  'bg-amber-50 text-amber-700',
  on_hold:     'bg-gray-100 text-gray-600',
  complete:    'bg-green-50 text-green-700',
  cancelled:   'bg-red-50 text-red-700',
  trash:       'bg-gray-200 text-gray-500',
  incomplete:  'bg-orange-50 text-orange-700',
  // Customer
  new:         'bg-blue-50 text-blue-700',
  returning:   'bg-amber-50 text-amber-700',
  vip:         'bg-purple-50 text-purple-700',
  // Payment
  paid:        'bg-green-50 text-green-700',
  pending:     'bg-amber-50 text-amber-700',
}
</script>
```

### 9.5 Form Input Standard

```vue
<!-- All form inputs follow this pattern -->
<div class="space-y-1.5">
  <Label for="name" class="text-sm font-medium">
    Full Name <span class="text-destructive">*</span>
  </Label>
  <Input
    id="name"
    v-model="form.name"
    placeholder="আপনার পূর্ণ নাম লিখুন"
    class="h-10 rounded-md"
    :class="errors.name ? 'border-destructive' : ''"
  />
  <p v-if="errors.name" class="text-destructive text-xs mt-1">
    {{ errors.name }}
  </p>
</div>
```

---

## 10. Motion & Animation Guide

| Element | Animation | Duration | Easing |
|---|---|---|---|
| Cart Sheet slide-in | `slideInRight` | 300ms | `ease-out` |
| Mobile Sheet slide-up | `slideInUp` | 300ms | `ease-out` |
| Sidebar collapse | width transition | 200ms | `ease` |
| Button hover | `transition-colors` | 150ms | default |
| Card hover (scale) | `scale(1.02)` | 200ms | `ease` |
| Carousel slide | `translateX` | 500ms | `ease-in-out` |
| Toast (Sonner) | slide-up fade-in | 300ms | `ease-out` |
| Toast auto-dismiss | — | 2500ms | — |
| Success checkmark | stroke-dashoffset | 600ms | `ease-out` |
| Accordion expand | `height` + `opacity` | 200ms | `ease` |
| Skeleton shimmer | `shimmer` keyframe | 1500ms | infinite |
| Page transition | `fade` | 200ms | `ease` |
| Quantity stepper | `scale(0.95)` on click | 100ms | `ease` |

**Principle:** Keep animations minimal and functional. No decorative heavy motion. Every animation has a purpose (feedback, context, transition).

---

## 11. Dark Mode (Admin)

**Strategy:** Tailwind CSS `class` dark mode (add `dark` class to `<html>` or `.admin-layout`)

**Implementation:**
```js
// composables/useDarkMode.js
const isDark = ref(localStorage.getItem('adminDarkMode') === 'true')

function toggleDark() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('adminDarkMode', isDark.value)
}
```

**Dark mode applies to:** Admin panel only (storefront is light-theme-only per Figma)

**Dark mode color overrides (key tokens):**
```css
.admin-layout.dark {
  --background:    #0F0E1A;   /* Near-black purple */
  --card:          #1A1929;   /* Dark card */
  --sidebar-bg:    #1A1929;
  --topbar-bg:     #1A1929;
  --foreground:    #F9FAFB;
  --muted-foreground: #9CA3AF;
  --border:        #2D2B45;
  --sidebar-active-bg:  #2D2B55;
  --sidebar-icon:       #6B7280;
  --sidebar-text:       #D1D5DB;
}
```

---

## 12. Iconography

**Library:** `lucide-vue-next` (shadcn default paired icon set)

**Usage guide:**

| Icon | Lucide Name | Usage |
|---|---|---|
| Search | `Search` | Header search, admin search |
| Cart | `ShoppingCart` | Cart icon, bottom nav |
| Heart | `Heart` | Wishlist |
| User | `User` | Sign In, admin profile |
| Package | `Package` | Track Order, Product Management |
| Menu | `Menu` | Mobile menu, hamburger |
| Home | `Home` | Bottom nav Home |
| Store | `Store` | Bottom nav Shop |
| ChevronDown | `ChevronDown` | Dropdown arrows |
| ChevronLeft/Right | `ChevronLeft/Right` | Carousel navigation |
| X | `X` | Close buttons |
| Trash2 | `Trash2` | Delete/remove items |
| Edit | `Pencil` | Edit actions |
| Plus | `Plus` | Add buttons |
| Minus | `Minus` | Remove, quantity stepper |
| Star | `Star` | Reviews (filled) |
| StarHalf | `StarHalf` | Half-star ratings |
| CheckCircle | `CheckCircle` | Success states |
| AlertTriangle | `AlertTriangle` | Warning/low stock |
| TrendingUp | `TrendingUp` | Positive stat change |
| TrendingDown | `TrendingDown` | Negative stat change |
| Bell | `Bell` | Notifications |
| Moon/Sun | `Moon`/`Sun` | Dark mode toggle |
| Phone | `Phone` | Call to Order |
| MapPin | `MapPin` | Address/location |
| Truck | `Truck` | Delivery info |
| Shield | `Shield` | Trust badges |
| Eye | `Eye` | Preview |
| Copy | `Copy` | Duplicate |
| Download | `Download` | Export/download |
| Upload | `Upload` | File upload |
| BarChart2 | `BarChart2` | Reports |
| Users | `Users` | Customer Management |
| Settings | `Settings` | Store Management |
| LogOut | `LogOut` | Logout |
| Tag | `Tag` | Tags, price tags |
| Layers | `Layers` | Categories |
| Bookmark | `Bookmark` | Brands |

**Size standards:**
- Inline with text: `w-4 h-4` (16px)
- Standalone action icons: `w-5 h-5` (20px)
- Large feature icons (trust badges, stat cards): `w-6 h-6` (24px)
- Very large (empty states): `w-12 h-12` (48px)
- Extreme (order confirmation checkmark): `w-20 h-20` (80px)

---

## 13. Setup & Configuration

### shadcn-vue Initialization

```bash
# 1. Install dependencies
npm install -D tailwindcss @tailwindcss/vite
npm install lucide-vue-next

# 2. Initialize shadcn-vue
npx shadcn-vue@latest init
# Choose: TypeScript → No (use JS), Base color → neutral, CSS variables → yes

# 3. Add required components
npx shadcn-vue@latest add \
  button card badge input label textarea select \
  sheet dialog alert-dialog \
  dropdown-menu popover tooltip \
  accordion collapsible tabs \
  carousel \
  radio-group checkbox switch \
  form \
  table pagination \
  avatar \
  separator \
  skeleton \
  sonner \
  chart \
  sidebar \
  scroll-area \
  progress \
  calendar
```

### tailwind.config.js (Tailwind 4 — CSS-first config)

```css
/* resources/css/app.css */
@import "tailwindcss";

/* Storefront tokens */
@layer base {
  :root {
    --background: 46 14% 95%;   /* HSL for #F5F3EE */
    --foreground: 0 0% 10%;
    --primary: 141 63% 33%;     /* #1E8A3C */
    --primary-foreground: 0 0% 100%;
    --destructive: 0 65% 50%;   /* #D62828 */
    --destructive-foreground: 0 0% 100%;
    --muted: 40 11% 93%;
    --muted-foreground: 220 9% 46%;
    --border: 35 14% 88%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 10%;
    --radius: 0.75rem;
    /* ... additional tokens */
  }
}

/* Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
```

### File Structure (resources/js)

```
resources/
  js/
    app.js               # Inertia app bootstrap
    Pages/
      Storefront/
        Home.vue
        Shop.vue
        ProductSingle.vue
        Checkout.vue
        OrderConfirmation.vue
        About.vue
        Terms.vue
      Admin/
        Login.vue
        Dashboard.vue
        Products/
          Index.vue
          Create.vue
          Edit.vue
          Brands.vue
          Categories.vue
          Tags.vue
          Attributes.vue
          Reviews.vue
        Orders/
          Index.vue
          Show.vue
        Customers/
          Index.vue
          Create.vue
        Store/
          Banners.vue
          Payment.vue
          Logo.vue
          Footer.vue
          LandingPages/
            Index.vue
            Builder.vue
    Components/
      Storefront/
        Header.vue
        Footer.vue
        MobileBottomNav.vue
        ProductCard.vue
        CartSheet.vue
        HeroBannerCarousel.vue
        ReviewsCarousel.vue
        TrustBadges.vue
        QuantityStepper.vue
        ColorSwatches.vue
      Admin/
        AdminSidebar.vue
        AdminTopbar.vue
        StatCard.vue
        StatusBadge.vue
        DataTable.vue
        ProductForm.vue
        OrderDetail.vue
    Layouts/
      StorefrontLayout.vue
      AdminLayout.vue
    Composables/
      useCart.js          # localStorage cart management
      useDarkMode.js      # admin dark mode
      useToast.js         # Sonner toast wrapper
    stores/
      cart.js             # Pinia store for cart state
  css/
    app.css              # Tailwind + design tokens
```

---

*Document ends. For functional requirements and database schema, see [PRD.md](./PRD.md)*
