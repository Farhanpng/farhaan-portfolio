# PRD — Photography & Cinematography Portfolio

## Original Problem Statement
"build a website to showcase my Photography and Cinematography portfolio and I can also add video link from youtube"

## User Personas
- **Portfolio owner (admin)**: photographer/cinematographer who logs in to upload photos, add/remove YouTube film links, and read contact enquiries.
- **Visitor**: potential client or fan browsing the gallery, watching films, reading the manifesto, sending a message.

## Core Requirements (static)
- Dark cinematic, Awwwards-level public portfolio (hero, gallery, films, about, contact).
- Gallery photos uploadable from computer (object storage), manageable by admin.
- YouTube videos embeddable via pasted links.
- Admin panel behind login (JWT auth, single admin).
- Contact form storing enquiries readable in admin panel.

## Architecture
- FastAPI backend (`/api/*`), MongoDB (`users`, `photos`, `videos`, `messages`, `login_attempts`), Emergent object storage for uploaded photos (paths prefixed `cinema-portfolio/`).
- React frontend: public one-page portfolio (Lenis smooth scroll, framer-motion reveals, react-fast-marquee) + `/admin` login + `/admin/dashboard`.
- Auth: bcrypt password hashing, JWT Bearer tokens (7-day), brute-force lockout (5 fails = 15 min), admin seeded from env (`ADMIN_EMAIL`/`ADMIN_PASSWORD`).

## Implemented (2026-08-18)
- Public site: kinetic masked line-by-line hero ("LIGHT, SHADOW, STORY.") with parallax + scroll fade, editorial marquee, asymmetric Tetris photo gallery with lightbox, Films section with lazy YouTube embeds (thumbnail -> click to play), numbered manifesto About chapters, Contact form, giant serif footer, film-grain overlay.
- Admin: login page, dashboard tabs (Photos upload/delete, Videos add/delete via YouTube link parsing, Messages inbox).
- Seed content: 6 stock photos + 1 placeholder showreel video (replaceable from admin).
- Verified: login, me, photo upload (stored + served back 200), photo/video delete, contact post + inbox listing, full screenshot pass of public pages and admin flow.

## Implemented (2026-08-18, update 2)
- Rebranded to Farhan Khan: navbar logo, hero overline, contact email (kfarhaan749@gmail.com), footer giant wordmark + copyright, Instagram link (https://www.instagram.com/farh_aaaan/), browser title/meta.
- Replaced all seed stock photos with 5 of Farhan's real works (Portrait/Product/Food/Fashion) stored in object storage; About section uses his portrait.
- Replaced placeholder showreel with his two YouTube films (btSfFJCsrrs "Showreel", d2usZzLmmZk "Short Film").
- Gallery category filters (All / Portrait / Product / Food / Fashion) with active-state buttons.
- Verified: filter clicks, gallery render with real photos, films thumbnails, about portrait, footer rebrand via screenshots.

## Implemented (2026-08-18, update 3 — reference-style redesign)
- Restyled public site after krishmenaria.lovable.app reference: pure-black editorial interface, wide extended display type (Syne 800) for the giant hero name over his own darkened portrait, Inter Tight grotesque statement headings, JetBrains Mono micro-labels ("— 01 / WHO IS FARHAN?"), Cormorant italic quotes.
- New flow: Hero (FARHAN KHAN full-bleed + masked reveal + parallax) → roles marquee (✦ separators) → About ("I don't chase moments. I wait for them." + portrait) → Gallery (filters) → Films → Mindset (3 italic quotes) → Contact ("If our frames align, let's talk." + email + form) → minimal footer.
- Admin panel, auth, and all APIs unchanged.
- Verified via screenshots: hero fit fix (name was clipping at 9vw → 7.6vw), about, gallery + filters, mindset, contact.

## Implemented (2026-08-18, update 4)
- Hero: new owner-supplied sunset city-overlook photo (uploaded as hidden asset, not in gallery), lighter grade (black/35 overlay, grayscale 10%).
- Journey section: 4 roles (The Social Glory, RHYTHM JECRC, The Social Wedding, Freelance) with italic descriptions; nav + section numbering updated.
- Mindset: replaced placeholder quotes with Farhan's own "Behind the camera, where I belong" statement.
- Email alerts: managed Resend via EMERGENT_EMAIL_KEY; every /api/contact submission emails kfarhaan749@gmail.com (reply-to same), server-side template + guardrail gate; verified with live test send (email id returned).

## Implemented (2026-08-18, update 5)
- About photo: uncropped natural landscape ratio, kept on the side (self-center) per owner request.
- Gallery: +5 owner photos — 4 RHYTHM concert shots (new "Concert" category/filter) + "Rosé by the Pool" (Fashion). Gallery now 10 works, 6 filters.
- Video retitled: "Showreel" → "JECRC University 2026 RHYTHM Aftermovie".

## Implemented (2026-08-18, update 6)
- Video retitled: "Short Film" → "Vicky Kaushal at JECRC University".
- Hero swapped to the "Pyro & Soul" concert shot.
- Weddings section: 5 Instagram reels. NOTE: Instagram blocks iframe embeds (embedding disabled on these reels) and og:image is login-walled, so reels render as styled click-to-watch cards opening Instagram in a new tab. Reels API (GET/POST/DELETE /api/reels) + admin "reels" tab added.

## Implemented (2026-08-18, update 7)
- Wedding reels moved INTO the Work (gallery) section as a "Wedding Films — Weddings, unposed." sub-block; dedicated Weddings section and nav link removed.
- Reels renamed with real titles (Telugu Wedding, Bride's Outfit Deserves a Spotlight, Rambagh Palace Jaipur, Dreamy Varmala, South Indian Themed Haldi) and each now shows its owner-supplied cover still (uploaded as hidden assets, served via /api/files).

## Implemented (2026-08-18, update 8)
- Mindset section removed; Farhan's "I live for the moments behind the lens…" statement moved into the About (Who is Farhan?) section as an italic serif quote.
- Films section grew to 7 videos; 5 new YouTube links added with titles auto-pulled from YouTube (Alia Bhatt & Sharvari, Street Dance Rhythm'24, JIC RISE 2.0, CINSPECTRA Film Festival, Ashneer Grover).

## Implemented (2026-08-18, update 9)
- Visual edit pass: amber hero overline/tagline, removed "Available for commissions", About frame 9:16, Journey org 2 = "JECRC University", gallery filters (Portrait hidden, Product → Jewellery), uncropped masonry gallery, footer "© Farhan Khan".
- Gallery +5 owner works (Blooming Streets, Off the Line, Indigo Hour — Fashion; Ratnatray Signature — Jewellery; Kaefin Coffee — Food). Gallery now 15 works.

## Implemented (2026-08-18, update 10)
- Gallery heading → "No motion needed.", side paragraph removed; About "behind the lens" caption removed.
- Gallery curated to best 12 (removed Golden Hour, Poolside Pink, Outdoor Studio — soft-deleted, restorable).

## Implemented (2026-08-18, update 11)
- Gallery +5 fashion works (Sun & Style, Poolside in Pink, Block Print Blues, Summer State of Mind, Backdrop in the Wild). Gallery now 17 works; Fashion filter holds 9.

## Implemented (2026-08-18, update 12)
- Filter order fixed (All, Fashion, Concert, Jewellery, Food); reel helper line removed.
- Gallery switched from masonry columns to an offset editorial grid (12-col, varied spans + staggered mt offsets, uncropped images).

## Backlog / Next Tasks
- P0: Replace placeholder brand name "CARTER", hero text, and seed content with the owner's real name/work (needs user input).
- P1: Editable site settings (name, email, social links, about text) from admin panel.
- P1: Photo reordering / featuring; category filter on gallery.
- P2: Instagram feed or social link wiring; real email notifications for contact form (Resend).
- P2: Password change / forgot-password flow for admin.
