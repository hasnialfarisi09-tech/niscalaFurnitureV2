# Changelog

What changed and why. Newest first. The format is defined in `AGENTS.md`;
every agent and developer adds an entry for anything that alters behaviour,
output, build steps or deploy steps.

The "Watch" lines are the point of this file: they are what a later change can
break by not knowing.

## Unreleased

### Added Furniture Custom main page and category dropdown with 20+ reference galleries, 2-column mobile layout, and interactive lightbox
- **What** Added "Furniture Custom" navigation link directly below "Portofolio" with a dropdown featuring 5 categories: Kitchen Set Custom, Lemari Custom, Lemari Bawah Tangga Custom, Backdrop TV Custom, and Furniture Kamar. Created a comprehensive hub page at `/furniture-custom` and 5 dynamic category galleries at `/furniture-custom/[slug]`, each loaded with at least 20 curated design references (116 total items). All galleries are laid out in responsive desktop grids and strictly 2 columns on mobile (`grid-cols-2`). Added an accessible, touch-friendly, full-screen interactive Lightbox modal (`ImageLightbox`) enabling visitors to enlarge every photo, navigate with arrows or swipe, view specifications, and consult directly via prefilled WhatsApp.
- **Why** User request to add "Furniture Custom" under "Portofolio" as a main page with a category dropdown of the 5 specific categories, populate each category with minimal 20 reference images matching each title, format the mobile layout as 2 columns, and make all photos enlargeable on click.
- **Watch** Image references in `src/data/custom-furniture.ts` map to optimized WebP imagery in `public/images/custom-furniture/` and `public/images/portfolio/` (all 116 references verified and audited to ensure 0 broken links). Routes are indexed in `src/app/sitemap.ts`.

### Ignored generated image variants directory in git
- **What** Added `/public/v/` to `.gitignore`.
- **Why** Image variants are generated locally and during deployment builds; tracking them caused repository bloat and binary merge conflicts.
- **Watch** Deployment environments must run the build step or upload the generated `public/v/` directory, as the site layout depends on these variants.

### Updated material section photos to match technical substrate and hardware specifications
- **What** Replaced the two general under-stair cabinet photos in `src/data/projects.ts` (`materialImages`) used by `src/components/sections/materials.tsx` with dedicated, authentic high-resolution photographs representing the actual technical specifications: one showing dense export-grade multipleks (plywood) layers, green moisture-resistant HMR core, and clean ABS machine edging, and one showing a premium stainless steel slow-motion hydraulic soft-close hinge and undermount soft-close drawer slide.
- **Why** User request to replace the two mismatched under-stair cabinet images with imagery directly depicting the materials described (Plywood/HMR, HPL/Duco, slow-motion hinges, and ABS machine edging).
- **Watch** Images are stored at `public/images/materials/` in 3:4 aspect ratio WebP and render with Next.js responsive image sets.

### Limited related articles to 4 cards with visual thumbnails and "Panduan Lainnya" CTA button
- **What** Updated the "Panduan lainnya" section in `src/app/knowledge/[slug]/page.tsx` to display exactly 4 relevant articles with context-matched image thumbnails, 2-column mobile layout (`grid-cols-2 lg:grid-cols-4`), and a prominent "Panduan Lainnya" button linking to `/knowledge`. Also added image blocks to baseline articles in `src/data/custom-articles.json` and `src/data/knowledge.ts`.
- **Why** User request to show only 4 related guides with content-matched imagery and a "Panduan Lainnya" button below.
- **Watch** Thumbnail selection prioritizes image blocks in `article.body` and falls back gracefully to contextual portfolio photography.

### Added second wave of 9 problem-solution articles across all categories
- **What** Appended 9 more in-depth articles to `src/data/custom-articles.json` (one per category across Bandung, Cimahi, Bandung Barat, Jakarta, Tangerang, Bekasi, Finishing, Desain, and Tips), bringing total custom articles to 21, each with portfolio photography, technical problem/solution breakdowns, and WhatsApp CTAs.
- **Why** User request to add 9 additional articles across each category.
- **Watch** Total custom articles count is now 21; all automatically inherit the 4-card portfolio showcase and WhatsApp consultation funnels.

### Configured portfolio grids to 2 columns on mobile viewport
- **What** Updated the portfolio grid layout in `src/app/knowledge/[slug]/page.tsx`, `src/components/portfolio/project-grid.tsx`, and `src/app/portfolio/[slug]/page.tsx` to display 2 columns on mobile viewports (`grid-cols-2 gap-space-sm sm:gap-gutter-desktop`) with 50vw mobile image sizing.
- **Why** User request to use a 2-column layout on mobile for portfolio card areas.
- **Watch** `ProjectCard` typography and padding scale smoothly on small screens with `text-[10px]` and `p-space-xs`.

### Added 4 featured portfolio project cards with "Lihat Semua Portofolio" CTA under every article
- **What** Enhanced `src/app/knowledge/[slug]/page.tsx` with a dedicated portfolio showcase section displaying 4 contextually matched project cards (prioritizing category/location relevance) using `ProjectCard`, followed by a prominent call-to-action button linking to `/portfolio`.
- **Why** User request to showcase 4 real portfolio project cards under every article followed by a "Lihat Semua Portofolio" link.
- **Watch** Projects are dynamically matched against article category/location metadata and capped at exactly 4 items.

### Published comprehensive problem-solution articles across all categories with images and WhatsApp CTA
- **What** Added 9 rich editorial articles to `src/data/custom-articles.json` spanning all service area categories (Bandung, Cimahi, Bandung Barat, Jakarta, Tangerang, Bekasi) and general categories (Finishing & Perawatan, Desain & Tata Letak, Tips & Inspirasi), each featuring actual portfolio photography, detailed problem-solution breakdowns, and WhatsApp consultation CTAs.
- **Why** User request to populate articles across all categories explaining custom furniture with clear problems, solutions, relevant images, and WhatsApp consultation CTAs.
- **Watch** Articles automatically feed into `/services/[slug]` landing pages and `/knowledge` by matching category names.

### Transformed "Layanan" into "Layanan Area" category dropdown with dedicated area landing pages
- **What** Replaced the single "Layanan" navigation link with a "Layanan Area" dropdown containing 6 city areas (Bandung, Cimahi, Bandung Barat, Jakarta, Tangerang, Bekasi) in both desktop HeaderNav and mobile drawer menu, linked them to new dynamic landing pages at `/services/[slug]`, added service area categories to admin article editor presets, and added area routes to sitemap.
- **Why** User request to transform "Layanan" into a "Layanan Area" dropdown categorized by 6 service areas that developers can input and manage through articles.
- **Watch** Each area in `src/data/service-areas.ts` uses the exact category name (e.g., "Furniture Custom Bandung") matched by `getAllArticles()` filtering.

### Moved quick estimation survey form directly below hero
- **What** Repositioned the `<Survey />` section ("Rencanakan Ruangan Impian Anda") in `src/app/page.tsx` to sit immediately beneath `<Hero />` and directly above `<Problems />` ("Sebelum memilih furniture"), with vertical spacing tailored for the placement.
- **Why** Prioritizes the interactive 4-step consultation and estimation flow directly after the first screen fold.
- **Watch** `CtaBanner` now directly precedes `BehindTheScenes` and uses `reserveCurveSpace={true}` to prevent curve overlap.

### Added public review form with email capture and notification to info@niscalafurniture.com
- **What** Added an email address field to `ReviewForm` and `submitReviewAction`, configured automated email notifications to `info@niscalafurniture.com` via `src/lib/email.ts` (using nodemailer / SMTP / webhook fallback), and ensured the email is kept strictly private for developer/internal data by stripping it from public API and UI rendering.
- **Why** Enables the studio team to receive immediate email notifications of new public reviews and follow up directly with the submitter, while protecting client privacy.
- **Watch** Outgoing email requires SMTP variables in `.env.local` to deliver directly from server; without SMTP it logs safely and does not block review persistence.

### Set mobile hero background scrim opacity to 30%
- **What** Changed the mobile background overlay in `src/components/sections/hero.tsx` from `bg-deep-black/85` to `bg-deep-black/30`.
- **Why** Adjusted overlay balance between photograph visibility and white text contrast.
- **Watch** Keep an eye on text legibility against brighter photographs.

### A runnable migration prompt for the second developer's agent
- **What** `SYNC-AGENT.md`: step-by-step instructions an AI agent executes to
  move Developer B's clone onto this repository, with a proof step before the
  switch and guardrails against force-pushing or committing secrets.
- **Why** `CONTRIBUTING.md` explains the workflow to a person; this is written
  to be run. The steps are ordered so nothing is discarded before it is proven
  to exist on `master`.
- **Watch** It describes `master`, not the open `feat/optimasi-gambar` branch.
  The first draft claimed `public/v`, `prepare:variants` and a 98-page build,
  all of which live only on that branch - `master` builds 65 pages and has no
  image pipeline. Re-check those numbers when the branch merges.

### Migration steps for the second developer now cover the admin credentials
- **What** `CONTRIBUTING.md` gains three steps: `npm install` (sharp moved to
  `dependencies`), the first `npm run build` that creates `public/v`, and
  generating `ADMIN_SECRET` / `ADMIN_PASSWORD_HASH` locally.
- **Why** The migration was written before the admin panel failed closed. A
  developer following the old steps would land on a working site with a dead
  `/admin` and no clue why, since the reason only appears in the server log.
- **Watch** Those values are per machine. `.env.local` is git-ignored, so they
  are never shared between developers, and production must not reuse a local
  one.

### Published rewritten wardrobe and kitchen guides in custom articles
- **What** Added rewritten, authoritative versions of `ukuran-ideal-lemari-pakaian` and `ergonomi-dan-layout-kitchen` to `src/data/custom-articles.json`.
- **Why** Replaced baseline stubs with 10-block guides covering ergonomics, optimal cabinet clearances, and workflow triangles.
- **Watch** `src/data/custom-articles.json` is modified at runtime by `/admin`. Changes here are deployed content and take precedence over baseline articles.

### Closed an authentication bypass in the admin panel
- **What** Removed every credential default from `src/lib/auth.ts`, split the
  session signing key from the password, bounded the session timestamp at both
  ends, and added `npm run admin:secret` / `npm run admin:password` plus
  scrypt-hashed password storage.
- **Why** `ADMIN_PASSWORD` defaulted to a literal in the source and the signing
  key defaulted to that literal plus a fixed suffix. The repository is public
  and none of the variables were set, so the key was the public constant
  `niscala2026_salt_niscala`. Anyone could compute
  `<timestamp>.HMAC(timestamp, key)`, set the session cookie, and hold a full
  admin session without touching the login form - which meant the rate limiter
  never saw them. Verified by forging a token and using it; the admin list
  returned 72 KB with four articles. After the fix the same token returns a
  response byte-identical to sending no cookie at all.
- **Watch** Three things a later change can get wrong here.
  (1) `isAdminAuthenticated()` denies rather than throws when the config is
  missing, on purpose: throwing would fail `next build` and turn a
  misconfiguration into a dead site instead of a disabled panel. Verified the
  build still succeeds with no admin variables set.
  (2) scrypt, not bcrypt or argon2, because those are native addons and a build
  on this host has already died over a native binary and an old glibc.
  (3) The scrypt cost parameters live *inside* the hash string. Keeping them as
  a shared constant is what broke the first attempt - the generator used
  N=32768 while the verifier fell through to Node's default of 16384, and the
  correct password was rejected.

### Agent and contributor documentation
- **What** Added `CHANGELOG.md`, `CONTRIBUTING.md`, and a project-rules section
  in `AGENTS.md` covering commands, document ownership, and the traps that have
  already cost time.
- **Why** Two developers and several agents were each re-deriving the same
  constraints. `CODEX_MEMORY.md` had already gone stale — it still described a
  Turbopack build and knew nothing about the admin panel or the image loader.
- **Watch** `AGENTS.md` is loaded automatically by Claude Code via `CLAUDE.md`
  and read directly by other agents, so it is the only file guaranteed to be
  seen. Anything an agent must not get wrong belongs there, not here.

### Merged the admin-panel branch
- **What** Brought Developer B's four commits (article admin panel, login,
  editor, image and YouTube embeds) into `master`, then merged `master` into
  `feat/optimasi-gambar`. Five files conflicted and were resolved by taking
  whichever side was more complete per hunk.
- **Why** The two branches had diverged from `afc8d4e` and both had touched the
  homepage sections while independently fixing the same mobile problems.
- **Watch** `sticky-mobile-cta.tsx` merged with **no** conflict and was broken
  anyway: an early `/admin` return landed above a `useEffect`, leaving a
  conditional hook that throws on navigation out of `/admin`. Lint caught it,
  git could not. A clean merge here is not evidence of a working merge — run
  `npm run lint` and `npm run build` after every merge.

### Kept `--text-display-mobile` at 40px
- **What** Declined the admin branch's 34px for this token.
- **Why** `--text-headline-lg-mobile` is 36px. At 34px the largest step in the
  scale renders smaller than the step beneath it, everywhere the token is used —
  hero, closing CTA, CTA banner.
- **Watch** Both branches were chasing the same goal, a hero that does not push
  the proof bar below the fold on a 360px phone. If the hero specifically needs
  to be smaller, that belongs on the hero's own class.

### Pre-rendered responsive image variants; runtime optimiser off
- **What** `scripts/build-image-variants.mjs` writes every width in the ladder
  into `public/v` before the build. A custom `next/image` loader
  (`src/lib/image-loader.ts`) points at those files. `/_next/image` now 404s.
- **Why** On Hostinger shared hosting a cold `/_next/image` request measured
  **1.8–2.8s TTFB** because `sharp` encoded on demand, and the cache behind it
  lives in `.next/cache/images`, which every rebuild wipes — so the first
  visitor after each deploy paid it again. The same request now serves in
  **23ms**.
- **Watch** WebP only, deliberately. Measured on this project's own photography
  at 1280px: webp 202ms / 79.6 KB against avif 5081ms / 65.5 KB. AVIF is 25×
  slower to encode for 18% fewer bytes, which is a 45-minute build instead of a
  1-minute one. Do not "improve" this by re-enabling AVIF without re-measuring
  on the target host.

### Hard-linked the duplicate top ladder rung
- **What** Ladder steps at or above a source's own width are copied once and
  hard-linked thereafter, with a copy fallback.
- **Why** 227 of 232 sources are 1280px wide or narrower, so the 1600 rung was a
  byte-for-byte duplicate of 1280. The tree went from 63.2 MB to 39.9 MB.
- **Watch** Uploading over FTP expands links back into files. The saving is real
  only when the build runs on the server.

### Blur placeholders via `placeholder`, not `placeholder="blur"`
- **What** `npm run prepare:blur` writes a 16px LQIP into the manifests;
  `src/lib/image-placeholder.ts` passes it as a `data:` URI.
- **Why** `placeholder="blur"` wraps the URI in an inline SVG carrying two
  `feGaussianBlur` passes, a `feColorMatrix` and two `feComposite` nodes — about
  1 KB per image, repeated in the flight payload. That more than doubled
  `/portfolio`. Passing the URI directly paints it as a plain background, and
  the browser's own upscaling supplies the blur the filter was faking.
- **Watch** Roughly 150 bytes per image either way; the SVG is the expensive
  part, not the placeholder.

### Spelled out `sizes` instead of approximating with `vw`
- **What** Portfolio grids declare real slot widths.
- **Why** `30vw` was a stand-in for the container arithmetic and drifted on wide
  screens: the container caps at 1440px with 64px gutters, so a card is 416px on
  a 1920px display, not 576px.
- **Watch** Next narrows a srcset only when `sizes` contains a bare integer
  `vw` preceded by whitespace — its regex is `/(^|\s)(1?\d?\d)vw/`. A `calc()`
  disables that narrowing, so all ladder widths are offered. Measured cost:
  1.1 KB gzipped, accepted so low-DPR phones keep the small variants.

### Long-lived caching for images
- **What** `/images`, `/logo` and `/v` are served `immutable` for a year.
- **Why** The host returned them with no `Cache-Control` at all, so browsers
  fell back to heuristic caching and revalidated far more often than needed.
