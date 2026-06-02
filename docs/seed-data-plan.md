# Seed Data Expansion Plan

> **Project:** Gaspo Studios  
> **Date:** June 2, 2026  
> **Script:** `scripts/seed-supabase.mjs`

---

## 1. Current State

| Table | Rows | Status |
|-------|------|--------|
| `gallery_images` | 14 | 5 categories covered (Weddings 3, Portraits 3, Commercial 3, Events 3, Behind the Scenes 2) |
| `events` | 3 | **All 3 are `upcoming`** — zero completed/past events |
| `bookings` | 8 | Varied statuses: 3 new, 1 reviewed, 1 confirmed, 1 completed, 1 cancelled + 2 extra |
| `blog_posts` | 6 | 4 published, 1 draft, 1 scheduled |

**Critical gap:** The Past Events section on `/events#past` is completely empty. The site needs at least 3–4 completed events with recap photos, attendance stats, and testimonials.

---

## 2. Gallery — 10 New Images

**Goal:** Bring total to 24 images with better distribution across categories and more variety in image sources.

### 2.1 New Images

| # | ID | Title | Category | src | visible | order |
|---|-----|-------|----------|-----|---------|-------|
| 1 | `img-015` | Vintage Wedding Detail | Weddings | `/images/wedding_couple.webp` | true | 15 |
| 2 | `img-016` | Bridal Prep — The Quiet Moments | Weddings | `/images/portrait_woman.webp` | true | 16 |
| 3 | `img-017` | Corporate Headshot Series — Ola | Portraits | `/images/team_founder.webp` | true | 17 |
| 4 | `img-018` | Family Portrait — The Adeyemis | Portraits | `/images/wedding_couple.webp` | true | 18 |
| 5 | `img-019` | Product Flat-Lay — Lumière Skincare | Commercial | `/images/corporate_team.webp` | true | 19 |
| 6 | `img-020` | Restaurant Menu Shoot — Cilantro Lagos | Commercial | `/images/photographer_hero.webp` | true | 20 |
| 7 | `img-021` | Award Ceremony — Tech Innovation Awards | Events | `/images/events_crowd.webp` | true | 21 |
| 8 | `img-022` | Birthday Celebration — 50th Gala | Events | `/images/wedding_couple.webp` | true | 22 |
| 9 | `img-023` | Lighting Test Session | Behind the Scenes | `/images/photographer_hero.webp` | false | 23 |
| 10 | `img-024` | Team Retreat — Ikoyi Studio | Behind the Scenes | `/images/corporate_team.webp` | false | 24 |

### 2.2 Updated Distribution

| Category | Before | After |
|----------|--------|-------|
| Weddings | 3 | 5 |
| Portraits | 3 | 5 |
| Commercial | 3 | 5 |
| Events | 3 | 5 |
| Behind the Scenes | 2 | 4 |

---

## 3. Events — Most Critical Gap

**Goal:** Add 4 past/completed events + 2 more upcoming events. Total: 9 events (5 upcoming, 4 past).

### 3.1 New Past Events (4)

#### Event 1: "The Art of Photography" Exhibition
```
id:          "evt-004"
slug:        "the-art-of-photography-exhibition-2025"
title:       "The Art of Photography — Annual Exhibition 2025"
summary:     "Our flagship annual exhibition showcasing the best work from Gaspo Studios' 2025 portfolio — weddings, portraits, and commercial campaigns under one roof."
description: "In December 2025, we transformed the Terra Kulture gallery into a visual journey through a year of storytelling. Over 300 guests walked through six curated rooms, each dedicated to a different photography genre. The evening featured a fireside chat with Marco Gaspo, live portfolio reviews, and the announcement of our 2026 mentorship programme winners."
status:       "completed"
date:         "2025-12-08T00:00:00Z"
time:         "17:00"
end_time:     "21:00"
venue:        "Terra Kulture"
address:      "Plot 1376, Tiamiyu Savage Street"
city:         "Victoria Island, Lagos"
country:      "Nigeria"
category:     "Exhibition"
type:         "physical"
capacity:     300
registration_count: 287
featured:     true
```

**Speakers (1):**
- Marco Gaspo — Founder, Gaspo Studios

**Agenda (5 items):**
- 17:00 — Doors Open & Welcome Drinks
- 17:30 — Gallery Tour with Marco Gaspo
- 18:30 — Fireside Chat: "A Year in Frames"
- 19:30 — Mentorship Programme Announcement
- 20:00 — Networking & Closing

**Gallery Images:** `/images/events_crowd.webp`, `/images/wedding_couple.webp`, `/images/portrait_woman.webp`

**Testimonial snippet:** "The exhibition was breathtaking. Seeing our wedding images printed large-format moved us to tears." — Adaeze & Chidi O.

---

#### Event 2: "Corporate Photography Summit Q4 2025"
```
id:          "evt-005"
slug:        "corporate-photography-summit-q4-2025"
title:       "Corporate Photography Summit — Q4 2025"
summary:     "A half-day summit for corporate communications professionals, HR leaders, and brand managers on leveraging professional photography for employer branding and corporate storytelling."
description: "In partnership with the Lagos Chamber of Commerce, we hosted 120 corporate leaders for an intensive afternoon on the power of visual storytelling in business. Sessions covered executive portraiture best practices, event coverage strategy, and the ROI of professional brand imagery. Each attendee received a complimentary headshot session voucher."
status:       "completed"
date:         "2025-11-15T00:00:00Z"
time:         "12:00"
end_time:     "17:00"
venue:        "Lagos Chamber of Commerce"
address:      "1, Idowu Taylor Street"
city:         "Victoria Island, Lagos"
country:      "Nigeria"
category:     "Corporate"
type:         "physical"
capacity:     120
registration_count: 118
featured:     false
```

**Speakers (2):**
- Marco Gaspo — Founder, Gaspo Studios
- Aisha Bello — Lead Retoucher, Gaspo Studios

**Agenda (5 items):**
- 12:00 — Registration & Lunch
- 13:00 — Keynote: "Visual Branding in the Digital Age"
- 14:00 — Workshop: "Planning Your Corporate Photoshoot"
- 15:30 — Live Demo: Executive Portraiture
- 16:30 — Networking Reception

---

#### Event 3: "Lagos Creatives Mixer — September 2025"
```
id:          "evt-006"
slug:        "lagos-creatives-mixer-september-2025"
title:       "Lagos Creatives Mixer — September 2025"
summary:     "An informal evening bringing together photographers, designers, stylists, and content creators for drinks, conversation, and collaboration."
description: "Our quarterly creative mixer returned with its biggest turnout yet — 65 creatives from across Lagos gathered at our Ikoyi studio for an evening of genuine connection. No panels, no keynotes — just good people, great music, and the kind of conversations that spark collaborations. Special thanks to our drinks sponsor, Jameson."
status:       "completed"
date:         "2025-09-20T00:00:00Z"
time:         "19:00"
end_time:     "22:00"
venue:        "Gaspo Studios"
address:      "14 Bayo Kuku Road, Ikoyi"
city:         "Lagos"
country:      "Nigeria"
category:     "Networking"
type:         "physical"
capacity:     65
registration_count: 65
featured:     false
```

**Speakers:** None (informal mixer)

**Agenda (3 items):**
- 19:00 — Arrivals & Welcome Drinks
- 19:30 — Icebreaker & Introductions
- 20:00 — Open Networking

---

#### Event 4: "Mobile Photography Workshop — August 2025"
```
id:          "evt-007"
slug:        "mobile-photography-workshop-august-2025"
title:       "Mobile Photography Workshop — August 2025"
summary:     "A practical workshop teaching content creators and small business owners how to capture professional-quality images using only their smartphones."
description: "Not everyone has a DSLR — but everyone has a phone. This sold-out workshop taught 40 participants the fundamentals of composition, lighting, and editing using nothing but their smartphone cameras. Attendees left with a 30-page mobile photography guide, hands-on practice with product flat-lays, and edited images ready for social media."
status:       "completed"
date:         "2025-08-10T00:00:00Z"
time:         "10:00"
end_time:     "15:00"
venue:        "Gaspo Studios"
address:      "14 Bayo Kuku Road, Ikoyi"
city:         "Lagos"
country:      "Nigeria"
category:     "Workshop"
type:         "physical"
capacity:     40
registration_count: 40
featured:     false
```

**Speakers (1):**
- Aisha Bello — Lead Retoucher, Gaspo Studios

**Agenda (5 items):**
- 10:00 — Welcome & Phone Camera Basics
- 10:45 — Composition & Lighting Fundamentals
- 12:00 — Break
- 12:30 — Hands-On: Product Photography with Phones
- 14:00 — Editing Session & Q&A

---

### 3.2 New Upcoming Events (2)

#### Event 5: "Creative Business Bootcamp — October 2026"
```
id:          "evt-008"
slug:        "creative-business-bootcamp-october-2026"
title:       "Creative Business Bootcamp — October 2026"
summary:     "A two-day intensive bootcamp for photographers and creatives ready to turn their craft into a sustainable, profitable business."
description: "Over two packed days, Marco Gaspo and guest speakers from finance, legal, and marketing will walk you through the business side of creativity — pricing strategies, client contracts, tax planning, social media marketing, and scaling your studio without burning out. Includes one-on-one portfolio and business plan reviews."
status:       "upcoming"
date:         "2026-10-17T00:00:00Z"
time:         "09:00"
end_time:     "17:00"
venue:        "Gaspo Studios"
address:      "14 Bayo Kuku Road, Ikoyi"
city:         "Lagos"
country:      "Nigeria"
category:     "Workshop"
type:         "physical"
capacity:     20
registration_count: 6
featured:     false
registration_open: true
registration_deadline: "2026-10-10T00:00:00Z"
sponsorship_enabled: false
```

**Speakers (2):**
- Marco Gaspo — Founder, Gaspo Studios
- Guest Speaker TBD — Creative Business Consultant

**Agenda (Day 1 — 5 items, Day 2 — 4 items)**

**Topics:**
- Pricing your work profitably
- Client contracts and IP rights
- Marketing on a budget
- Tax basics for freelancers
- Scaling from solo to studio
- Avoiding creative burnout

---

#### Event 6: "End-of-Year Portfolio Review & Gala — December 2026"
```
id:          "evt-009"
slug:        "end-of-year-portfolio-review-gala-2026"
title:       "End-of-Year Portfolio Review & Gala 2026"
summary:     "Close the year with Gaspo Studios at our annual portfolio review night — featuring expert critique, champagne, and the announcement of our 2027 exhibition theme."
description: "Our most anticipated event of the year returns. Submit up to 10 of your best 2026 images for live critique from the Gaspo Studios team and guest judges. The evening culminates in awards for Best Wedding Image, Best Portrait, Best Commercial Work, and the People's Choice award. Black tie optional — champagne mandatory."
status:       "upcoming"
date:         "2026-12-05T00:00:00Z"
time:         "18:00"
end_time:     "22:00"
venue:        "The Wheatbaker Hotel"
address:      "4 Lawrence Road, Ikoyi"
city:         "Lagos"
country:      "Nigeria"
category:     "Networking"
type:         "physical"
capacity:     150
registration_count: 42
featured:     true
registration_open: true
registration_deadline: "2026-11-28T00:00:00Z"
sponsorship_enabled: true
sponsor_packages: (use defaultSponsorPackages from seed script)
```

**Speakers (3):**
- Marco Gaspo — Founder, Gaspo Studios
- Aisha Bello — Lead Retoucher, Gaspo Studios
- Guest Judge TBD — International Photography Editor

**Agenda (6 items)**

---

### 3.3 Events Summary

| # | Type | Status | Title | Date |
|---|------|--------|-------|------|
| evt-001 | Technology | upcoming | Future of AI & Networking | Sep 2026 |
| evt-002 | Workshop | upcoming | Portrait Lighting Masterclass | Jul 2026 |
| evt-003 | Networking | upcoming | Wedding Photographer Meetup | Aug 2026 |
| evt-004 | Exhibition | **completed** | The Art of Photography Exhibition | Dec 2025 |
| evt-005 | Corporate | **completed** | Corporate Photography Summit | Nov 2025 |
| evt-006 | Networking | **completed** | Lagos Creatives Mixer | Sep 2025 |
| evt-007 | Workshop | **completed** | Mobile Photography Workshop | Aug 2025 |
| evt-008 | Workshop | upcoming | Creative Business Bootcamp | Oct 2026 |
| evt-009 | Networking | upcoming | End-of-Year Gala | Dec 2026 |

**After seeding: 5 upcoming + 4 past = 9 total events**

---

## 4. Bookings — 6 New Bookings

**Goal:** Bring total to 14 bookings with better representation of all services and statuses.

### 4.1 New Bookings

| # | ID | Name | Service | Package | Status | Date | Value (₦) |
|---|-----|------|---------|---------|--------|------|-----------|
| 1 | `bk-007` | Oluwaseun Adebayo | Wedding Photography | Full Day Coverage | new | 2026-10-03 | 3,600,000 |
| 2 | `bk-008` | Zainab Ibrahim | Portrait Session | 90-Minute Session | reviewed | 2026-06-20 | 675,000 |
| 3 | `bk-009` | David Okonkwo | Commercial Shoot | Half Day Shoot | confirmed | 2026-06-25 | 1,350,000 |
| 4 | `bk-010` | Amara Eze | Wedding Photography | Full Day Coverage | new | 2026-11-14 | 3,600,000 |
| 5 | `bk-011` | Bola Shittu | Corporate Event | Half Day Coverage | completed | 2026-05-05 | 1,800,000 |
| 6 | `bk-012` | Ifeanyi Maduka | Portrait Session | 90-Minute Session | cancelled | 2026-06-01 | 675,000 |

### 4.2 Detailed Records

#### Booking 1: Oluwaseun Adebayo — Wedding (new)
```
id: "bk-007"
name: "Oluwaseun Adebayo"
email: "seun.adebayo@gmail.com"
phone: "+234 816 789 0123"
service: "Wedding Photography"
package: "Full Day Coverage"
preferred_date: "2026-10-03"
preferred_time: "09:00"
message: "Church ceremony at House on the Rock, reception at The Civic Centre. Approx 350 guests. We love candid, photojournalistic style."
status: "new"
submitted_at: "2026-06-01T07:15:00Z"
total_value: 3600000
```

#### Booking 2: Zainab Ibrahim — Portrait (reviewed)
```
id: "bk-008"
name: "Zainab Ibrahim"
email: "zainab.ibrahim@outlook.com"
phone: "+234 812 345 6789"
service: "Portrait Session"
package: "90-Minute Session"
preferred_date: "2026-06-20"
preferred_time: "11:00"
message: "Graduation portraits — Law School. Would love both indoor studio and outdoor garden shots."
status: "reviewed"
submitted_at: "2026-05-31T14:20:00Z"
admin_notes: "Called client — confirmed outdoor location available at studio. Send mood board."
total_value: 675000
```

#### Booking 3: David Okonkwo — Commercial (confirmed)
```
id: "bk-009"
name: "David Okonkwo"
email: "david@okonkwodesigns.com"
phone: "+234 803 999 8888"
service: "Commercial Shoot"
package: "Half Day Shoot"
preferred_date: "2026-06-25"
preferred_time: "10:00"
message: "Interior design portfolio shoot. 3 completed residential projects across Ikoyi. Need architectural + detail shots."
status: "confirmed"
submitted_at: "2026-05-25T10:45:00Z"
admin_notes: "Deposit paid ₦540,000. Locations confirmed. Transport arranged for 3-site shoot."
total_value: 1350000
```

#### Booking 4: Amara Eze — Wedding (new)
```
id: "bk-010"
name: "Amara Eze"
email: "amara.eze@yahoo.com"
phone: "+234 811 222 3333"
service: "Wedding Photography"
package: "Full Day Coverage"
preferred_date: "2026-11-14"
preferred_time: "08:00"
message: "Traditional Igbo wedding (morning) + white wedding (afternoon). Two venues — family compound in Enugu, then church reception."
status: "new"
submitted_at: "2026-06-01T16:30:00Z"
total_value: 3600000
```

#### Booking 5: Bola Shittu — Corporate Event (completed)
```
id: "bk-011"
name: "Bola Shittu"
email: "bola@firstbank.ng"
phone: "+234 805 444 5555"
service: "Corporate Event"
package: "Half Day Coverage"
preferred_date: "2026-05-05"
preferred_time: "09:00"
message: "Branch managers' quarterly meeting. 45 attendees. Formal headshots + candid meeting coverage."
status: "completed"
submitted_at: "2026-04-20T09:00:00Z"
admin_notes: "Delivered May 12th. 340 edited images. Client requested 10 additional retouched headshots — completed May 15th."
total_value: 1800000
```

#### Booking 6: Ifeanyi Maduka — Portrait (cancelled)
```
id: "bk-012"
name: "Ifeanyi Maduka"
email: "ifeanyi.maduka@gmail.com"
phone: "+234 813 666 7777"
service: "Portrait Session"
package: "90-Minute Session"
preferred_date: "2026-06-01"
preferred_time: "14:00"
message: "Personal branding photos for my new consulting website."
status: "cancelled"
submitted_at: "2026-05-28T11:00:00Z"
admin_notes: "Client cancelled — scheduling conflict. Offered to reschedule, awaiting response."
total_value: 675000
```

### 4.3 Updated Bookings Summary

| Status | Before | After |
|--------|--------|-------|
| new | 3 | 5 |
| reviewed | 1 | 2 |
| confirmed | 1 | 2 |
| completed | 1 | 2 |
| cancelled | 1 | 2 |
| **Total** | **8** | **14** |

---

## 5. Blog Posts — 6 New Posts

**Goal:** Bring total to 12 blog posts (10 published, 1 draft, 1 scheduled) for visible pagination and richer category coverage.

### 5.1 New Posts

| # | ID | Title | Category | Status |
|---|-----|-------|----------|--------|
| 1 | `post-007` | "Choosing the Right Wedding Photographer: 15 Questions to Ask" | Wedding | published |
| 2 | `post-008` | "The Photographer's Guide to Social Media in 2026" | Tips | published |
| 3 | `post-009` | "How We Shot: A Destination Wedding in Cape Town" | Wedding | published |
| 4 | `post-010` | "RAW vs JPEG: Why We Shoot RAW (And When We Don't)" | Editorial | published |
| 5 | `post-011` | "Building a Photography Portfolio That Gets You Hired" | Tips | published |
| 6 | `post-012` | "Our Studio Refresh: New Gear, New Space, Same Passion" | Studio | published |

### 5.2 Detailed Posts

#### Post 1: "Choosing the Right Wedding Photographer: 15 Questions to Ask"
```
id: "post-007"
slug: "choosing-wedding-photographer-questions"
title: "Choosing the Right Wedding Photographer: 15 Questions to Ask"
excerpt: "Before you sign that contract, ask these 15 questions. Your wedding album will thank you."
body: "<p>Booking a wedding photographer is one of the biggest decisions you'll make in your planning journey — and one of the few that outlasts the day itself. Here are the 15 questions every couple should ask before signing.</p>
<h2>1. Can we see a full wedding gallery?</h2>
<p>Not just highlights. Ask to see an entire wedding — from getting ready to the last dance. This reveals consistency, not just cherry-picked best shots.</p>
<h2>2. How do you handle low light?</h2>
<p>Nigerian receptions are notoriously dark. Ask about off-camera flash, their typical ISO ceiling, and whether they bring continuous lighting.</p>
<h2>3. What's your backup plan?</h2>
<p>Cameras fail. Memory cards corrupt. A professional has backup bodies, lenses, cards, and batteries — and can explain exactly how they handle failure on the day.</p>
<h2>4. How many images do we receive?</h2>
<p>For a full-day wedding, expect 500–800 edited images. Anything less than 300 for a full day is a red flag.</p>
<h2>5. What's your editing style?</h2>
<p>Is it light and airy? Dark and moody? True-to-life? Make sure their portfolio matches your vision — asking a photographer to change their editing style rarely ends well.</p>"
category: "Wedding"
tags: ["wedding", "planning", "checklist", "tips"]
author_name: "Marco Gaspo"
author_avatar: "/images/team_founder.webp"
author_role: "Founder & Senior Photographer"
featured_image: "/images/wedding_couple.webp"
status: "published"
published_at: "2026-04-18T09:00:00Z"
views: 3201
comments: 22
seo_title: "15 Questions to Ask Your Wedding Photographer — Gaspo Studios"
seo_description: "Before you book your wedding photographer, ask these 15 essential questions. Save time, money, and heartbreak."
created_at: "2026-04-15T10:00:00Z"
updated_at: "2026-04-18T08:50:00Z"
```

---

#### Post 2: "The Photographer's Guide to Social Media in 2026"
```
id: "post-008"
slug: "photographers-guide-social-media-2026"
title: "The Photographer's Guide to Social Media in 2026"
excerpt: "Instagram's algorithm changed again. Here's what's actually working for photographers right now."
body: "<p>If you're still posting three carousel images a day and wondering why your engagement tanked, this post is for you. The social media landscape for photographers has shifted dramatically — here's the playbook for 2026.</p>
<h2>Video-first is no longer optional</h2>
<p>Reels and TikTok-style short-form video now drive 70% of new client inquiries at Gaspo Studios. But you don't need to become a videographer — a simple BTS clip of your lighting setup or a 15-second before/after edit comparison consistently outperforms static posts.</p>
<h2>Carousels aren't dead — they've evolved</h2>
<p>The winning format in 2026: educational carousels. Think '5 posing mistakes and how to fix them' — each slide shows a before/after with a short caption. Our top-performing carousel this year hit 48K impressions with zero ad spend.</p>
<h2>The platform shift nobody's talking about</h2>
<p>While everyone obsesses over Instagram, our highest converting platform for corporate clients is actually LinkedIn. We posted one behind-the-scenes shot from a boardroom shoot and booked three corporate packages within a week.</p>"
category: "Tips"
tags: ["social-media", "marketing", "business", "instagram"]
author_name: "Aisha Bello"
author_avatar: "/images/portrait_woman.webp"
author_role: "Lead Retoucher & Editor"
featured_image: "/images/photographer_hero.webp"
status: "published"
published_at: "2026-03-22T10:00:00Z"
views: 4501
comments: 31
seo_title: "Social Media Guide for Photographers 2026 — Gaspo Studios"
seo_description: "What's actually working for photographers on social media in 2026. Instagram, TikTok, and LinkedIn strategies that drive bookings."
created_at: "2026-03-20T08:00:00Z"
updated_at: "2026-03-22T09:45:00Z"
```

---

#### Post 3: "How We Shot: A Destination Wedding in Cape Town"
```
id: "post-009"
slug: "destination-wedding-cape-town-behind-scenes"
title: "How We Shot: A Destination Wedding in Cape Town"
excerpt: "Flying a photography team across the continent comes with unique challenges — and unforgettable rewards."
body: "<p>When Tolu and Kwame asked us to photograph their wedding at a vineyard in Stellenbosch, we said yes before they finished the sentence. Here's how we planned, packed, and executed a destination wedding 4,700 kilometres from our Lagos studio.</p>
<h2>The Gear Strategy</h2>
<p>Flying with gear means ruthless minimalism. We packed two bodies, three lenses (35mm, 85mm, 24-70mm), two speedlights, and a single LED panel — all in carry-on. Checked luggage had light stands, modifiers, and backup chargers.</p>
<h2>Location Scouting Remotely</h2>
<p>We arrived three days early and spent the first 24 hours mapping every shooting location on the vineyard property. The golden hour hit the ceremony site at 17:47 — we tested this with a scouting app and confirmed it twice. That attention to timing is why the ceremony photos glow the way they do.</p>
<h2>The Result</h2>
<p>1,200 edited images delivered in 14 days. Three magazine features. And one very happy couple who now have a wedding album that looks like it belongs in a travel magazine — because it genuinely does.</p>"
category: "Wedding"
tags: ["destination-wedding", "behind-the-scenes", "travel", "gear"]
author_name: "Marco Gaspo"
author_avatar: "/images/team_founder.webp"
author_role: "Founder & Senior Photographer"
featured_image: "/images/wedding_couple.webp"
status: "published"
published_at: "2026-02-10T09:00:00Z"
views: 2890
comments: 17
seo_title: "Destination Wedding Photography in Cape Town — Behind the Scenes"
seo_description: "How the Gaspo Studios team planned and shot a destination wedding at a Stellenbosch vineyard. Gear, scouting, and lessons learned."
created_at: "2026-02-08T10:00:00Z"
updated_at: "2026-02-10T08:30:00Z"
```

---

#### Post 4: "RAW vs JPEG: Why We Shoot RAW (And When We Don't)"
```
id: "post-010"
slug: "raw-vs-jpeg-photography-guide"
title: "RAW vs JPEG: Why We Shoot RAW (And When We Don't)"
excerpt: "The file format debate, settled. Here's when RAW is non-negotiable — and when JPEG is the smarter choice."
body: "<p>Every photographer has an opinion on RAW vs JPEG. Here's ours — backed by 12 years of shooting everything from dimly lit receptions to high-speed commercial campaigns.</p>
<h2>Why we shoot RAW for 90% of our work</h2>
<p>RAW files capture 12-14 bits of colour data per pixel. JPEG captures 8. That's the difference between recovering a blown-out wedding dress and losing it forever. For weddings, portraits, and commercial work — anything where post-processing matters — we shoot RAW, always.</p>
<h2>When JPEG wins</h2>
<p>Corporate event coverage with a 4-hour turnaround? JPEG. The client needs images during the event for social media, not after a week of editing. We shoot RAW+JPEG to one card for this exact scenario — JPEGs go to the client's social team on-site, RAWs come back to the studio for selects.</p>
<h2>The storage reality</h2>
<p>A full-day wedding in RAW can hit 128GB. That's 2-3 memory cards, plus redundant backups. Budget for storage — it's part of the cost of doing professional work.</p>"
category: "Editorial"
tags: ["raw", "jpeg", "editing", "workflow", "gear"]
author_name: "Aisha Bello"
author_avatar: "/images/portrait_woman.webp"
author_role: "Lead Retoucher & Editor"
featured_image: "/images/corporate_team.webp"
status: "published"
published_at: "2026-01-28T10:00:00Z"
views: 5670
comments: 41
seo_title: "RAW vs JPEG Photography Guide — When to Use Each Format"
seo_description: "The definitive guide to RAW vs JPEG for professional photographers. When RAW is essential and when JPEG is the smarter choice."
created_at: "2026-01-25T09:00:00Z"
updated_at: "2026-01-28T09:55:00Z"
```

---

#### Post 5: "Building a Photography Portfolio That Gets You Hired"
```
id: "post-011"
slug: "building-photography-portfolio-gets-hired"
title: "Building a Photography Portfolio That Gets You Hired"
excerpt: "Your portfolio isn't a gallery of your best work — it's a sales tool. Here's how to build one that converts."
body: "<p>Most photographers treat their portfolio like a trophy case: 'Look at all the beautiful things I've made.' The best photographers treat it like a sales page: 'Here's exactly why you should hire me.' The difference shows in your booking rate.</p>
<h2>Rule 1: Show the work you want to get booked for</h2>
<p>If you want more wedding clients, don't fill your portfolio with landscape shots from your holiday in Ghana. Clients hire you for the work you show — not the work you wish you could do.</p>
<h2>Rule 2: 12 images is the sweet spot</h2>
<p>Research shows that after 12-15 images, a client's attention drops. Curate ruthlessly. If an image isn't strong enough to stand alone, it's weakening your portfolio — not strengthening it.</p>
<h2>Rule 3: Lead with emotion, follow with technique</h2>
<p>Your hero image shouldn't be your most technically perfect shot. It should be the one that makes someone feel something. A technically imperfect image that captures genuine emotion will always outperform a flawless but sterile image.</p>"
category: "Tips"
tags: ["portfolio", "business", "marketing", "career"]
author_name: "Marco Gaspo"
author_avatar: "/images/team_founder.webp"
author_role: "Founder & Senior Photographer"
featured_image: "/images/portrait_woman.webp"
status: "published"
published_at: "2025-11-08T09:00:00Z"
views: 7800
comments: 53
seo_title: "How to Build a Photography Portfolio That Books Clients"
seo_description: "Your portfolio is a sales tool, not a gallery. Learn the 5 rules for building a photography portfolio that converts viewers into clients."
created_at: "2025-11-05T11:00:00Z"
updated_at: "2025-11-08T08:40:00Z"
```

---

#### Post 6: "Our Studio Refresh: New Gear, New Space, Same Passion"
```
id: "post-012"
slug: "gaspo-studios-studio-refresh-2026"
title: "Our Studio Refresh: New Gear, New Space, Same Passion"
excerpt: "We renovated our Ikoyi studio, added new lighting rigs, and expanded our editing suite. Here's a tour."
body: "<p>After six months of planning and three weeks of construction, our refreshed Ikoyi studio is finally ready. We've doubled our shooting space, added a dedicated client lounge, and invested in new Profoto lighting equipment that's already transforming our portrait work.</p>
<h2>The New Space</h2>
<p>Our main shooting bay now spans 60 square metres with 4-metre ceilings — enough room for full bridal party portraits and large product installations. The north-facing windows give us consistent natural light from 9 AM to 3 PM, which our portrait clients love.</p>
<h2>The New Gear</h2>
<p>We've added two Profoto B10X Plus units and a full set of OCF modifiers to our lighting arsenal. The difference in our portrait work has been immediate — faster recycling, more consistent colour temperature, and the freedom to shoot anywhere without hunting for power outlets.</p>
<h2>What Hasn't Changed</h2>
<p>New walls and new lights don't change why we do this. Every morning we still walk into this studio with the same mission: to capture images that matter — images that families will pass down, that businesses will build their brands on, that couples will look back on in fifty years and remember exactly how they felt.</p>"
category: "Studio"
tags: ["studio", "gear", "behind-the-scenes", "announcement"]
author_name: "Marco Gaspo"
author_avatar: "/images/team_founder.webp"
author_role: "Founder & Senior Photographer"
featured_image: "/images/photographer_hero.webp"
status: "published"
published_at: "2026-05-01T08:00:00Z"
views: 1230
comments: 9
seo_title: "Gaspo Studios Ikoyi Studio Refresh 2026 — New Space & Gear"
seo_description: "Take a tour of our newly renovated Ikoyi photography studio — expanded shooting bays, new Profoto lighting, and a dedicated client lounge."
created_at: "2026-04-28T09:00:00Z"
updated_at: "2026-05-01T07:45:00Z"
```

---

## 6. Implementation Notes

### 6.1 Image References
All new seed records reuse the existing image paths already in the project:
- `/images/wedding_couple.webp`
- `/images/portrait_woman.webp`
- `/images/team_founder.webp`
- `/images/corporate_team.webp`
- `/images/photographer_hero.webp`
- `/images/events_crowd.webp`

No new image assets are needed.

### 6.2 Seed Script Approach
All new rows use `upsert` with `onConflict` by `id` (or `slug` for blog_posts/events), making the seed script **idempotent** — safe to run multiple times. Existing rows are updated; new rows are inserted.

### 6.3 Post-Seed Verification
After seeding, verify counts:
```
gallery_images: 24 (was 14)
events:          9 (was 3) — 5 upcoming, 4 past
bookings:       14 (was 8)
blog_posts:     12 (was 6) — 10 published, 1 draft, 1 scheduled
```

### 6.4 Order of Operations
1. Append new gallery images to the existing `galleryImages` array in `seed-supabase.mjs`
2. Append new events to the existing `events` array
3. Append new bookings to the existing `bookings` array
4. Append new blog posts to the existing `blogPosts` array
5. Run: `node --env-file=.env scripts/seed-supabase.mjs`
