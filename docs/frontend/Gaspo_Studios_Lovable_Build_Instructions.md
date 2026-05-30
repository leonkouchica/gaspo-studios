# Gaspo Studios — Lovable AI Build Instructions

> **Project:** Gaspo Studios Photography Website  
> **Platform:** Lovable AI (TypeScript + Tailwind CSS + Beautiful UI Blocks)  
> **Design Reference:** Enerix Smart City UI (attached image) — layout patterns, spacing, card structures, and interaction models are the source of truth.  
> **Color Authority:** Gaspo Studios logo (attached) — red + dark charcoal scheme replaces the Enerix lime-green accent.  
> **Content Authority:** GaspoStudios.docx (attached) — all copy, section logic, and page structure derive from this document.

---

## 1. Design System (Global Styles)

### 1.1 Color Palette (Extracted from Logo)
Apply these exact colors across the entire site. Do NOT use the lime green from the Enerix reference.

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary` | `#E12D2D` | Primary red from "GASP" text. Buttons, active states, icons, accent borders, hover highlights. |
| `--color-primary-hover` | `#C41E1E` | Button hover states, darker red for depth. |
| `--color-dark` | `#1A1A1A` | Deep charcoal from "STUDIOS" text. Primary text, dark section backgrounds, footer. |
| `--color-dark-secondary` | `#2D2D2D` | Card backgrounds on dark sections, navbar background (scrolled). |
| `--color-light` | `#FAFAFA` | Page background, light section fills. |
| `--color-muted` | `#6B7280` | Body text, descriptions, placeholders. |
| `--color-white` | `#FFFFFF` | Text on dark backgrounds, card surfaces on light sections. |
| `--color-border` | `#E5E7EB` | Subtle dividers, card borders on light backgrounds. |
| `--color-border-dark` | `#374151` | Dividers on dark backgrounds. |

### 1.2 Typography
- **Font Family:** `Inter` or `Geist` (sans-serif). Clean, modern, highly legible.
- **Headings:** Bold weight (700), tight letter-spacing (`tracking-tight`), line-height `1.1`.
  - H1 (Hero): `text-5xl md:text-7xl`
  - H2 (Section): `text-3xl md:text-5xl`
  - H3 (Card Title): `text-xl md:text-2xl`
- **Body:** Regular weight (400), `text-base` to `text-lg`, line-height `1.6`, color `--color-muted`.
- **Labels/Overlines:** Uppercase, `text-xs`, `tracking-widest`, `--color-primary` or `--color-muted`.

### 1.3 Spacing & Layout
- **Container:** `max-w-7xl mx-auto px-6 md:px-8`
- **Section Padding:** `py-20 md:py-28` (generous vertical breathing room — match Enerix whitespace)
- **Border Radius:** 
  - Cards: `rounded-2xl` (`16px`)
  - Buttons: `rounded-full` (pill shape) or `rounded-xl` (`12px`) for large CTAs
  - Images: `rounded-2xl` consistently
  - Inputs: `rounded-xl`
- **Shadows:** 
  - Cards on light: `shadow-sm` or `shadow-md`
  - Cards on dark: no shadow, use `border border-white/10` for definition
- **Grid Gap:** `gap-6` standard, `gap-8` for feature grids

### 1.4 Global Components

#### Navigation Bar
- **Behavior:** Fixed top, transparent on load, transitions to `bg-dark-secondary/90 backdrop-blur-md` on scroll.
- **Layout:** Logo left (use uploaded Gaspo logo image, height `32px`), nav links center, CTA button right.
- **Links:** Home, About, Gallery, Book a Shoot, Shop, Blog, Contact.
- **Mobile:** Hamburger menu → full-screen overlay with large link text.
- **CTA:** "Book a Shoot" — pill button, `bg-primary text-white`, `rounded-full`, `px-6 py-2.5`.

#### Buttons
- **Primary:** `bg-primary text-white rounded-full px-8 py-3.5 font-medium hover:bg-primary-hover transition-all duration-300`. Optional: small arrow icon (`→`) inside, offset on hover.
- **Secondary (Outline):** `border border-dark text-dark rounded-full px-8 py-3.5 hover:bg-dark hover:text-white transition-all`.
- **Ghost (on dark):** `text-white border border-white/20 rounded-full px-6 py-3 hover:bg-white/10`.
- **Icon Button:** Circular, `w-10 h-10 rounded-full bg-primary text-white`, used for carousel arrows and card link-outs.

#### Cards (Universal Pattern)
Match the Enerix card system exactly:
- **Light cards:** `bg-white rounded-2xl p-6 border border-border shadow-sm`
- **Dark cards:** `bg-dark-secondary rounded-2xl p-6 border border-border-dark`
- **Feature cards:** Top icon in a small rounded square (`w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center`), title below, description, optional image at bottom with `rounded-xl`.
- **Hover state:** `hover:-translate-y-1 hover:shadow-lg transition-all duration-300`

#### Footer
- **Background:** `bg-dark text-white`
- **Layout:** 4-column grid on desktop (Brand/Newsletter, Quick Links, Services, Contact).
- **Newsletter:** Email input with `rounded-full` + subscribe button `bg-primary text-white rounded-full`.
- **Bottom bar:** Copyright + social icons (Facebook, Instagram, Twitter/X).
- **Logo:** Gaspo logo in white or light version.

---

## 2. Page-by-Page Build Instructions

### PAGE 1: Homepage

#### Section 1: Hero (Match Enerix Hero Layout)
- **Structure:** Full-width, `min-h-[90vh]`, relative positioning.
- **Background:** Large, striking hero image (photography studio or portrait work) with `object-cover`. Overlay: `bg-gradient-to-r from-dark/80 via-dark/40 to-transparent`.
- **Content Position:** Left-aligned, vertically centered, container width.
- **Label (Overline):** "Professional Photography Studio" — uppercase, `text-xs tracking-widest text-primary`.
- **Headline:** "Capture Your Moments with Gaspo Studios" — `text-5xl md:text-7xl font-bold text-white`.
- **Subheadline:** "Where Art Meets Precision in Photography" — `text-xl md:text-2xl text-white/80 mt-4`.
- **Body:** "Welcome to Gaspo Studios, your ultimate destination for professional photography services..." — `text-base text-white/70 max-w-xl mt-6`.
- **CTAs (Horizontal stack, mt-10):**
  - Primary: "Book a Shoot" (red pill button)
  - Secondary: "Visit the Shop" (white outline pill button)
- **Right Side (Floating Stats Card):** Positioned absolute on desktop, right side of hero. Dark card (`bg-dark-secondary/90 backdrop-blur rounded-2xl p-6 border border-white/10`) showing a stat like "500+ Sessions Captured" or "35% Faster Delivery" with a small thumbnail image above. Include a small circular arrow link button (`bg-primary rounded-full`) bottom-right of card.
- **Bottom Trust Bar:** Below hero, full-width light strip with `py-8`. Logo marquee or client/award logos in grayscale, evenly spaced. Label: "Trusted by leading brands & happy couples".

#### Section 2: About Preview (Match Enerix "Building Cities That Work Smarter")
- **Layout:** Two-column grid (`grid-cols-1 md:grid-cols-2 gap-12 items-center`).
- **Left Column:** Large studio image with `rounded-2xl shadow-xl`. Optional: small floating badge overlay (`bg-primary text-white rounded-full px-4 py-2`) with "10+ Years Experience".
- **Right Column:**
  - Label: "About Us" — uppercase, `text-xs tracking-widest text-primary`.
  - Headline: "Building Visual Stories That Last Forever" — `text-3xl md:text-5xl font-bold text-dark`.
  - Body: "At Gaspo Studios, we believe in creating memorable images that last a lifetime. Founded over a decade ago..." — `text-muted mt-4`.
  - Feature mini-cards (2 side-by-side below text):
    - "Creative Direction" — icon + short text in `bg-white rounded-xl p-4 border border-border`
    - "Professional Editing" — same
  - CTA: "Meet Our Team" — secondary outline button with arrow icon.

#### Section 3: Services / Featured Shoots (Match Enerix "Integrated Renewable Energy Solutions")
- **Background:** `bg-light`.
- **Header:** Left-aligned. Label "Our Services" + Headline "Integrated Photography Solutions" + subtext. Right side: "View Solutions" red pill button.
- **Layout:** 3-column grid of feature cards (`grid-cols-1 md:grid-cols-3 gap-6`).
- **Cards (each identical structure):**
  - Top: Icon in `w-12 h-12 rounded-xl bg-primary/10 text-primary` (Camera, Users, Building icons).
  - Title: e.g., "Wedding Photography", "Corporate Photography", "Special Events".
  - Description: Short text from doc.
  - Bottom: Small `rounded-xl` thumbnail image inside card, `h-40 object-cover`.
  - Top-right corner of card: Small circular arrow button (`bg-primary text-white rounded-full w-8 h-8`) linking to service detail.
- **Carousel Controls:** Below grid, left side: circular prev/next buttons. Center: progress bar indicator (thin line, `bg-gray-200` with `bg-primary` fill).

#### Section 4: Gallery Preview (Match Enerix "Energy Solutions for Smart Cities")
- **Layout:** Asymmetric two-column. Left: stacked images (2-3 overlapping with slight offset). Right: text content.
- **Left:**
  - Main image: `rounded-2xl`, large.
  - Secondary image: smaller, positioned offset below-right, `rounded-2xl`, `border-4 border-white`.
  - Floating label card: "Award Winning Portfolio" with icon.
- **Right:**
  - Label: "Portfolio"
  - Headline: "Stunning Visuals for Every Occasion"
  - Body: Description of gallery work.
  - CTA: "Explore Our Portfolio" — red pill button.
  - Mini stat row: "200+ Weddings", "50+ Brands", "15 Awards" — small text with red accent numbers.

#### Section 5: Booking CTA Banner (Match Enerix dark technology section vibe)
- **Background:** `bg-dark` with subtle texture or gradient.
- **Layout:** Centered text, container width.
- **Headline:** "Ready to Capture Your Next Moment?" — `text-3xl md:text-5xl text-white font-bold`.
- **Body:** "Booking your photo shoot with Gaspo Studios is simple and convenient..." — `text-white/70 max-w-2xl mx-auto`.
- **CTA:** "Book Your Session Today" — large red pill button, centered, `mt-8`.
- **Below CTA:** 3 small dark cards in a row showing steps: "1. Select Service", "2. Choose Date", "3. Confirm Booking" — `bg-dark-secondary rounded-xl p-4 border border-border-dark`.

#### Section 6: Testimonials / FAQ Preview
- **Background:** `bg-light`.
- **Layout:** Two-column. Left: FAQ accordion (match Enerix FAQ exactly). Right: Image.
- **FAQ Items:**
  - "What types of photography do you offer?"
  - "How far in advance should I book?"
  - "Do you offer photo editing services?"
  - "Can I purchase prints or digital copies?"
- **Accordion Style:** Clean lines, `border-b border-border`. Open state reveals answer with smooth height animation. Plus/minus icon (`+` / `−`) in `text-primary` on right.
- **Right Image:** Photographer at work, `rounded-2xl`.
- **CTA below FAQ:** "View All FAQ" — red pill button.

---

### PAGE 2: About Us

#### Section 1: Page Header
- **Background:** `bg-dark` or hero image with overlay.
- **Headline:** "About Gaspo Studios" — centered, `text-4xl md:text-6xl text-white`.
- **Breadcrumb:** Home / About — small text, `text-white/60`.

#### Section 2: Our Story (Two-column, image left, text right)
- **Left:** Studio team photo or studio space, `rounded-2xl`.
- **Right:**
  - Label: "Our Story"
  - Headline: "Where Technology Meets Artistry in Photography"
  - Body: Full "Our Story" and "Our Commitment" text from doc.
  - CTA: "View Our Work" — secondary button.

#### Section 3: Team Profiles (Match Enerix card grid)
- **Background:** `bg-light`.
- **Headline:** "Meet Our Team" — centered.
- **Layout:** 3-4 column grid of team cards.
- **Team Card:**
  - Image: `rounded-2xl aspect-[3/4] object-cover`.
  - Name: `text-xl font-bold text-dark mt-4`.
  - Role: `text-primary text-sm font-medium`.
  - Bio: `text-muted text-sm mt-2`.
  - Social icons: Small row of Instagram/LinkedIn icons.

#### Section 4: Why Choose Us
- **Background:** `bg-dark`.
- **Headline:** "Why Choose Gaspo Studios" — centered, white.
- **Layout:** 3-column grid of dark feature cards (`bg-dark-secondary rounded-2xl p-8 border border-border-dark`).
- **Items:**
  - "Professional Expertise" — icon + text
  - "State-of-the-Art Technology" — icon + text
  - "Customized Experience" — icon + text
- **Icon Style:** `w-14 h-14 rounded-xl bg-primary/20 text-primary flex items-center justify-center`.

---

### PAGE 3: Gallery

#### Section 1: Page Header
- **Background:** `bg-dark` with subtle gradient.
- **Headline:** "Our Portfolio" — centered, white.
- **Subheadline:** "Explore our collection of weddings, portraits, and commercial work."

#### Section 2: Category Filter
- **Layout:** Horizontal center-aligned pill buttons.
- **Categories:** All, Weddings, Portraits, Commercial, Events.
- **Active state:** `bg-primary text-white rounded-full px-6 py-2`.
- **Inactive:** `bg-white text-dark border border-border rounded-full px-6 py-2 hover:border-primary`.

#### Section 3: Masonry Grid
- **Layout:** `columns-1 md:columns-2 lg:columns-3 gap-6` masonry layout (or CSS grid with varying row spans).
- **Image Cards:**
  - `rounded-2xl overflow-hidden relative group`
  - Image: `w-full object-cover`
  - Overlay on hover: `absolute inset-0 bg-dark/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center`
  - Hover content: Category label + "View Project" text in white.
- **Click behavior:** Opens lightbox modal with full image, close button top-right.

---

### PAGE 4: Book a Shoot

#### Section 1: Page Header
- **Background:** `bg-dark`.
- **Headline:** "Book Your Photo Shoot" — centered, white.
- **Subheadline:** "Simple, convenient, and tailored to your needs."

#### Section 2: Booking Interface (Two-column)
- **Left Column (Service Selection):**
  - Headline: "Select Your Service"
  - Service cards (vertical stack, `gap-4`):
    - Each card: `bg-white rounded-2xl p-6 border border-border hover:border-primary transition-all cursor-pointer`
    - Selected state: `border-primary ring-2 ring-primary/20`
    - Content: Radio indicator + Service name + Description + Price
    - Services: Wedding Photography, Portrait Session, Corporate Event, Commercial Shoot.

- **Right Column (Calendar & Form):**
  - **Calendar Widget:** Custom styled calendar (not default browser). `rounded-2xl bg-white border border-border p-6`.
    - Month navigation with arrow buttons.
    - Days grid, selected date highlighted in `bg-primary text-white rounded-full`.
    - Available dates: normal. Unavailable: `text-muted line-through`.
  - **Time Slots:** Below calendar, horizontal scroll or grid of pill buttons (`rounded-full border border-border px-4 py-2 hover:bg-primary hover:text-white`).
  - **Form Fields:**
    - Name, Email, Phone — `rounded-xl border border-border px-4 py-3 w-full focus:border-primary focus:ring-2 focus:ring-primary/20`
    - Special Requests — textarea, same styling.
  - **Payment Summary:** Price breakdown card.
  - **Submit Button:** "Confirm Booking & Pay Deposit" — full-width red pill button, `py-4 text-lg font-semibold`.

#### Section 3: Booking Assurance
- **Background:** `bg-light`.
- **Layout:** 3-column icon row.
- **Items:** "Secure Payment", "Instant Confirmation", "Satisfaction Guaranteed" — each with icon + title + short text.

---

### PAGE 5: Events

#### Section 1: Page Header
- **Background:** `bg-dark`.
- **Headline:** "Studio Events" — centered, white.

#### Section 2: Upcoming Events
- **Layout:** Vertical list of event cards (`gap-6`).
- **Event Card:**
  - `bg-white rounded-2xl p-6 border border-border flex flex-col md:flex-row gap-6`
  - Left: Date badge (`bg-primary text-white rounded-xl p-4 text-center min-w-[80px]`). Shows month abbreviation + day number.
  - Middle: Event title + description + time/location.
  - Right: "Register" or "Learn More" red pill button.

#### Section 3: Past Events
- **Layout:** 3-column image grid.
- **Past Event Card:** Image `rounded-xl` + overlay title + date below.

---

### PAGE 6: Blog

#### Section 1: Page Header
- **Background:** `bg-dark`.
- **Headline:** "Photography Insights" — centered, white.

#### Section 2: Featured Article
- **Layout:** Large horizontal card, `bg-white rounded-2xl overflow-hidden border border-border`.
- **Structure:** Image left (`w-1/2`), content right (`w-1/2`).
- **Content:** Category tag (`bg-primary/10 text-primary rounded-full px-3 py-1 text-xs`), title, excerpt, "Read More" link.

#### Section 3: Article Grid
- **Layout:** 3-column grid (`grid-cols-1 md:grid-cols-3 gap-8`).
- **Blog Card:**
  - Image top: `rounded-xl h-48 object-cover`
  - Meta: Date + Category, `text-xs text-muted`
  - Title: `text-lg font-bold text-dark`
  - Excerpt: `text-sm text-muted line-clamp-3`
  - Footer: "Read Article" link in `text-primary` + comment count.
  - Social share icons: Small row below (Facebook, Instagram, Twitter/X).

---

### PAGE 7: Contact

#### Section 1: Page Header
- **Background:** `bg-dark`.
- **Headline:** "Get in Touch" — centered, white.
- **Subheadline:** "Have questions? We're here to help every step of the way."

#### Section 2: Contact Layout (Two-column)
- **Left Column (Form):**
  - Card: `bg-white rounded-2xl p-8 border border-border shadow-sm`
  - Fields: Name, Email, Phone, Subject dropdown, Message textarea.
  - All inputs: `rounded-xl border border-border px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all`.
  - Submit: "Send Message" — full-width red pill button.

- **Right Column (Info + Map):**
  - **Info Cards (stacked, gap-4):**
    - "Visit Us" — Address with map icon.
    - "Call Us" — Phone number.
    - "Email Us" — Email address.
    - Each: `bg-white rounded-xl p-5 border border-border flex items-start gap-4`. Icon in `w-10 h-10 rounded-lg bg-primary/10 text-primary`.
  - **Map:** Embedded Google Maps iframe, `rounded-2xl border border-border h-64 w-full`.
  - **Social Links:** Row of circular social icons (`w-10 h-10 rounded-full bg-dark text-white hover:bg-primary transition-colors`).

---

### PAGE 8: Shop (Online Store)

> *Note: The doc mentions an online shop for photography equipment. Include this even if minimal.*

#### Section 1: Page Header
- **Background:** `bg-dark`.
- **Headline:** "Photography Gear & Accessories" — centered, white.

#### Section 2: Product Grid
- **Layout:** 4-column grid (`grid-cols-2 md:grid-cols-4 gap-6`).
- **Product Card:**
  - Image: `rounded-xl bg-gray-100 aspect-square object-cover`
  - Category: `text-xs text-primary font-medium`
  - Product Name: `text-dark font-semibold`
  - Price: `text-lg font-bold text-dark`
  - "Add to Cart" button: Small red pill, `w-full mt-2`.

---

## 3. Global Interactions & Animations

### 3.1 Scroll Behaviors
- **Navbar:** Transparent → solid dark on scroll (after `50px`). Transition `duration-300`.
- **Fade-in-up:** All section content fades in and translates `translate-y-8 → translate-y-0` on scroll into view. Use `duration-700 ease-out`.
- **Stagger:** Cards within grids stagger in with `100ms` delay between each.

### 3.2 Hover States
- **Cards:** `hover:-translate-y-1 hover:shadow-lg transition-all duration-300`.
- **Buttons:** Scale slightly `hover:scale-105` on primary CTAs. Arrow icons shift `translate-x-1` on hover.
- **Images:** Subtle `hover:scale-105` with `overflow-hidden` on container.
- **Links:** Underline animation or color shift to `text-primary`.

### 3.3 Micro-interactions
- **FAQ Accordion:** Smooth height transition (`grid-template-rows` or max-height technique). Icon rotates 45deg (`+` to `×`).
- **Form Inputs:** Focus ring `ring-2 ring-primary/20 border-primary`. Label floats up if using floating labels.
- **Calendar:** Date selection bounces slightly (`scale-95 → scale-100`).
- **Loading:** Button loading state with spinner inside, `opacity-80 cursor-wait`.

### 3.4 Mobile-Specific
- **Hero:** Stack vertically, stats card moves below CTA buttons.
- **Grids:** All multi-column grids collapse to single column (`grid-cols-1`).
- **Navigation:** Full-screen overlay, `bg-dark`, large `text-3xl` links centered vertically.
- **Touch:** Cards require slightly larger tap targets (`min-h-[44px]` for buttons).

---

## 4. Asset Requirements

### Images (Placeholders / Stock)
Use high-quality photography-focused stock images from Unsplash/Pexels:
- Hero: Dramatic portrait or studio setup.
- About: Team working, studio interior.
- Gallery: Wedding, portrait, commercial samples (use same image set across gallery grid for consistency in mockup).
- Services: Camera equipment, event scenes, corporate headshots.
- Contact: Studio exterior or map area.

### Logo
- Use the uploaded `photo_2026-05-30_10-23-22-removebg-preview.png`.
- Display at `h-8` to `h-10` in navbar.
- Provide a white/light version for dark backgrounds if possible; otherwise the original works on light backgrounds.

### Icons
Use `lucide-react` icons throughout:
- Camera, Users, Building, Calendar, Clock, MapPin, Phone, Mail, ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Plus, Minus, Instagram, Facebook, Twitter, Check, Star, ShoppingBag.

---

## 5. Lovable AI Specific Notes

1. **UI Blocks:** Leverage Beautiful UI's pre-built card, navbar, hero, and footer blocks. Customize colors to the red/dark scheme above.
2. **TypeScript:** Ensure all components are typed. Define interfaces for:
   - `Service` (id, name, description, price, image)
   - `TeamMember` (name, role, bio, image, socials)
   - `BlogPost` (title, excerpt, date, category, image, slug)
   - `Event` (title, date, description, location, image, status)
   - `Product` (name, price, category, image)
3. **Tailwind Config:** Extend theme with the custom colors:
   ```js
   colors: {
     primary: { DEFAULT: '#E12D2D', hover: '#C41E1E' },
     dark: { DEFAULT: '#1A1A1A', secondary: '#2D2D2D' }
   }
   ```
4. **Routing:** Set up routes for `/`, `/about`, `/gallery`, `/book`, `/events`, `/blog`, `/contact`, `/shop`.
5. **State Management:** Use React state (useState) for:
   - Mobile menu open/close
   - FAQ accordion open indices
   - Gallery filter category
   - Booking form step/service selection
   - Calendar selected date
6. **Forms:** Client-side validation with visual error states (`border-red-500`, error text below field).

---

## 6. Quality Checklist

Before marking complete, verify:
- [ ] Red (`#E12D2D`) is used as the primary accent on EVERY CTA, active state, and key icon.
- [ ] Dark charcoal (`#1A1A1A`) is used for text and dark sections.
- [ ] Border radius is consistently `rounded-2xl` (cards/images) and `rounded-full` (buttons).
- [ ] The Enerix layout DNA is preserved: generous whitespace, two-column splits, floating stat cards, icon-topped feature cards, dark section breaks, FAQ accordion.
- [ ] All text content from GaspoStudios.docx is incorporated accurately.
- [ ] Logo is displayed prominently in navbar and footer.
- [ ] Mobile responsiveness is flawless — no horizontal scroll, readable text, tappable buttons.
- [ ] All animations are smooth and purposeful, not distracting.

---

*End of Build Instructions*
