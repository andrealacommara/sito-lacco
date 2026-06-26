# 🎵 Lacco — Official Website

A **React + TypeScript + Vite** project that tells the story of **Lacco**, his music, and his artistic identity.  
The website features a modern, responsive, and high-performance structure, with smooth animations, release landing pages, a newsletter system, and direct integration with **Spotify**, **Apple Music**, **YouTube**, **Instagram**, and **TikTok**.

🌐 Live: [www.lacco.it](https://www.lacco.it)

---

## 🚀 Tech Stack

| Category               | Technologies                                                               |
| ---------------------- | -------------------------------------------------------------------------- |
| **Frontend Framework** | [React 19](https://react.dev/) with [Vite](https://vitejs.dev/)           |
| **Language**           | [TypeScript](https://www.typescriptlang.org/)                              |
| **UI Library**         | [HeroUI v3](https://heroui.dev/) (on top of React Aria + TailwindCSS)      |
| **Styling**            | [TailwindCSS v4](https://tailwindcss.com/)                                 |
| **Animations**         | [Framer Motion](https://www.framer.com/motion/)                            |
| **Backend / DB**       | [Supabase](https://supabase.com/) (Postgres + Edge Functions + Auth)       |
| **Email Service**      | [Resend](https://resend.com/) — contact form, newsletter welcome + broadcast (all via Supabase Edge Functions) |
| **Rich Text**          | [Tiptap](https://tiptap.dev/) for the admin broadcast composer             |
| **Charts**             | [Recharts](https://recharts.org/) — admin Instagram analytics dashboard    |
| **Instagram Analytics**| [Instagram Graph API](https://developers.facebook.com/docs/instagram-platform/) (Business Login) — follower growth, post insights, unfollower tracking (admin-only) |
| **Image Handling**     | Custom `SmartImage` component with AVIF/WebP/JPEG fallback                 |
| **SEO**                | Static prerendering (Playwright) · per-release/event OG images · Schema.org JSON-LD · `sitemap.xml` + `llms.txt` |
| **Build Tools**        | Vite + TailwindCSS (PostCSS) + HeroUI Theme                                |
| **CI/CD**              | [GitHub Actions](https://github.com/features/actions) + FTPS deploy to Aruba |
| **Node.js**            | v22+ recommended                                                            |

---

## 🧩 Project Structure

```
src/
├── assets/                 # Static resources and images
│   ├── icons/
│   └── images/
├── components/             # Reusable UI components (representative)
│   ├── admin/
│   │   ├── adminSelect.tsx      # HeroUI v3 Select wrapper (v2-compatible API)
│   │   ├── instagramCharts.tsx  # Recharts growth + post-engagement charts (IG dashboard)
│   │   ├── instagramSection.tsx # Instagram analytics (Dashboard / Follower / Contenuti tabs)
│   │   └── templateStudio.tsx  # Social-media image generator (story/post formats)
│   ├── countdown.tsx         # Release/event countdown timer (dark/light variant)
│   ├── icons.tsx             # SVG icons + Logo component
│   ├── liveEventCard.tsx     # Live event card (poster, countdown, ticket CTA)
│   ├── liveGalleryModal.tsx  # Past-show photo gallery modal
│   ├── presaveButton.tsx     # DistroKid hyperfollow presave CTA
│   ├── richTextEditor.tsx    # Tiptap editor for the admin broadcast composer
│   ├── smartImage.tsx        # Optimized image with AVIF/WebP/JPEG fallback
│   ├── songCarousel.tsx      # Horizontal snap carousel of catalog songs
│   ├── spotifyPlayer.tsx     # On-demand Spotify embed
│   └── subscribeForm.tsx     # Newsletter subscribe form (full + compact)
├── config/
│   ├── catalog.ts             # Single source of truth: all releases + config
│   ├── liveEvents.data.ts     # Pure live event data (Node-loadable, no asset imports)
│   ├── liveEvents.ts          # Live events + poster/gallery assets wired in
│   ├── slugs.ts               # Dynamic /:slug resolver (re-exported from catalog)
│   ├── site.ts                # Global site config (nav, social links, metadata)
│   ├── date.ts                # Date helpers
│   ├── sectionsAboutPage.ts   # About page content
│   └── pressKitPhotos.ts / pressKitStats.ts  # PressKit content
├── emails/
│   └── templates.ts          # HTML email templates (welcome + broadcast preview)
├── layouts/
│   └── default.tsx           # Shared layout (Navbar + Footer)
├── lib/
│   ├── supabase.ts           # Supabase client + Edge Function base URL
│   ├── instagramAnalytics.ts # Pure derivations for the IG dashboard (series, buckets, CSV download)
│   ├── themeColor.ts         # Single owner of <meta name="theme-color"> synced to the real theme
│   └── templateRenderer.ts   # Canvas renderer for social-media template images
├── pages/
│   ├── aboutPage.tsx         # "Su di me"
│   ├── adminPage.tsx         # Admin dashboard (subscriber list + broadcast)
│   ├── contactPage.tsx       # Contact form (via send-contact-email Edge Function)
│   ├── homePage.tsx          # Home
│   ├── livePage.tsx          # "Live" — upcoming/past shows
│   ├── eventPage.tsx         # Event detail page (/live/:slug — upcoming or recap)
│   ├── musicPage.tsx         # "La mia musica" (song carousel)
│   ├── newsletterPage.tsx    # Newsletter subscribe page
│   ├── notFoundPage.tsx      # 404
│   ├── pressKitPage.tsx      # PressKit (noindex, lazy)
│   ├── privacyPage.tsx       # Privacy Policy (GDPR)
│   ├── releasePage.tsx       # Release landing page (/:slug — presave or live mode)
│   └── unsubscribePage.tsx   # Unsubscribe landing
├── routes/
│   └── pages.ts              # Lazy routes + preload helpers
├── styles/
│   └── globals.css
├── types/
│   └── api.ts                # Shared API types (subscribe, broadcast, contact, Instagram analytics, etc.)
├── utils/
│   ├── createIcon.tsx
│   └── lazyWithPreload.ts
├── App.tsx                   # Main router
├── main.tsx                  # Entry point
└── provider.tsx              # HeroUI + Toast provider

scripts/                      # Build-time tooling (run via postbuild)
├── routes.mjs                # Single source of indexable routes (sitemap + prerender + llms)
├── catalog-loader.mjs / events-loader.mjs  # Load TS config in Node via esbuild
├── prerender.mjs             # Static HTML snapshots per route (Playwright)
├── generate-og-images.js     # OG 1200×630 per release
├── generate-og-events.mjs    # OG 1200×630 per live event
├── generate-llms.mjs         # Generates dist/llms.txt from routes.mjs
├── make-presskit-zip.js      # Bundles the downloadable press kit
├── generate-email-assets.mjs # Email image assets
└── smoke-test.js             # Runtime smoke test

supabase/
├── functions/
│   ├── _shared/              # Shared helpers (Supabase clients, direct Postgres, admin auth, email, Instagram Graph API, Resend sync, validation)
│   ├── subscribe/            # POST: add subscriber (single opt-in) + welcome email
│   ├── unsubscribe/          # GET: unsubscribe via personal token
│   ├── send-contact-email/   # POST: contact form submission → email via Resend
│   ├── send-magic-link/      # POST: send admin magic-link sign-in email
│   ├── resend-webhook/       # POST: Resend webhook (unsubscribe/bounce status sync)
│   ├── admin-subscribers/    # GET/POST/PATCH: list, add, manually unsubscribe (admin-only)
│   ├── admin-broadcast/      # POST: send broadcast to all confirmed subscribers or to selected ones
│   ├── admin-sync-resend/    # POST: reconcile subscriber status with the Resend Audience
│   ├── admin-stats/          # GET: dashboard counters (confirmed, unsubscribed, bounced, new)
│   ├── admin-instagram-snapshot/  # Daily cron: IG Graph API snapshot (followers + post insights) + net-drop alert; auto-refreshes the token
│   ├── admin-instagram-export/    # POST: diff a client-parsed IG data export → unfollower/follower events + email
│   ├── admin-instagram-stats/     # GET: IG dashboard data (growth series, top posts, unfollowers)
│   ├── admin-instagram-mark/      # POST: toggle the "removed" check on a non-follower-back username
│   └── admin-instagram-tag/       # POST: assign/clear a manual tag (persona/vip/pagina) on a username
└── migrations/               # SQL migrations (subscribers table, keep-alive cron, status changes, instagram schema + cron)
```

---

## ✨ Main Features

- **Home:** Introduction to Lacco with an on-demand Spotify player that loads only when needed on mobile, plus a presave card (blurred artwork backdrop, countdown, DistroKid presave button) for the next upcoming release, and a live event card for the next upcoming show.
- **Live (`/live`):** Driven by `liveEvents.ts`. Shows upcoming live dates (poster, countdown, venue/lineup details, ticket link) and an archive of past shows; displays a "new dates coming soon" message when nothing is upcoming.
- **Event detail pages (`/live/:slug`):** Dedicated page per show. Upcoming mode shows poster, countdown, venue/address/lineup and ticket CTA; past mode turns into a recap with description and YouTube videos. Each event has its own OG image and Schema.org JSON-LD.
- **La mia musica:** Horizontal snap carousel of singles, with descriptions and streaming links (Spotify + Apple Music) in a modal. Supports presave mode with "COMING SOON" badge.
- **Release pages (`/:slug`):** Full-screen landing pages driven by `catalog.ts`. Two modes:
  - **Presave mode** — artwork, countdown timer, DistroKid presave button, newsletter subscribe form.
  - **Live mode** — artwork, streaming CTAs (Spotify / Apple Music), song carousel.
- **Newsletter:** Subscribe form with name + email + consent. Single opt-in — confirmed immediately, with a welcome email sent right away. Unsubscribe link in every email, kept in sync with the Resend Audience via webhook and manual reconciliation.
- **Admin (`/admin`):** Protected by Supabase magic link auth. Dashboard with live counters (confirmed, unsubscribed, bounced, new in last 7 days), searchable/sortable/filterable subscriber list with configurable page size, manual unsubscribe for selected subscribers, and a broadcast composer (body, optional image, optional CTA button) with live email preview — sendable to all confirmed subscribers or to individually selected ones. Also includes a **Template Studio** that generates branded social-media images (story 9:16, post 4:5/1:1) with logo and rich-text overlay, downloadable for posting.
- **Instagram analytics (`/admin` → Instagram):** Private analytics for the artist account, split across **Dashboard**, **Follower**, and **Contenuti** tabs. A daily cron (pg_cron + pg_net) snapshots follower growth and per-post insights from the Instagram Graph API — auto-refreshing the 60-day long-lived token — with email alerts on net follower drops and a weekly export reminder. Charts (growth curve, decomposed growth, post/reel/story engagement) render with Recharts. Unfollower tracking works by drag-and-dropping the Instagram data-export ZIP, parsed **client-side** with JSZip so only usernames + timestamps reach the server, which diffs them to detect who unfollowed and surfaces a "Non ti ricambiano" (doesn't follow you back) list — each entry can be manually tagged (persona/vip/pagina) or checked off as removed. Data lives in a dedicated, non-exposed `instagram` Postgres schema reached only by Edge Functions via a direct DB connection.
- **Contatti:** Contact form submitted to the `send-contact-email` Supabase Edge Function, which delivers the message via Resend.
- **PressKit:** Dedicated private page (lazy-loaded, noindex) with official media assets, extended bio, press photos, and professional contacts; the downloadable kit is zipped at build time.
- **Privacy Policy (`/privacy`):** GDPR-compliant privacy policy in Italian.
- **SEO & crawlers:** Each page ships per-route head tags (title, description, Open Graph, canonical) via `react-helmet-async`, plus Schema.org JSON-LD on home/release/event pages. At build time every indexable route is statically prerendered (Playwright) so crawlers see baked-in tags, and `sitemap.xml` + `llms.txt` are generated from a single source of truth (`scripts/routes.mjs`).
- **Route preloading:** Navigation links prefetch their chunks on hover/touch for near-instant transitions.

---

## ⚙️ Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/andrealacommara/sito-lacco.git
cd sito-lacco
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```bash
# Supabase (newsletter, contact form, admin)
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your_anon_key"
```

> **Note:** The contact form, newsletter, and admin features all run through Supabase Edge Functions. Their server-side secrets (`RESEND_API_KEY`, `service_role`, `IG_GRAPH_TOKEN`, `IG_BUSINESS_ACCOUNT_ID`, etc.) are configured in the Supabase dashboard — never in `VITE_*` variables. The Instagram cron secret lives only in Supabase Vault (`ig_cron_secret`).

### 4. Start the development server

```bash
npm run dev
```

The website will be available at [http://localhost:5173](http://localhost:5173)

---

## 🧱 Build for Production

```bash
npm run build
```

Optimized files are generated in the `/dist` folder. A `postbuild` step then runs automatically:

1. `generate-og-images` / `generate-og-events` — per-release and per-event OG images;
2. `prerender` — static HTML snapshots of every indexable route (requires Chromium for Playwright);
3. `generate-llms` — `dist/llms.txt` from the shared route source;
4. `make-presskit-zip` — the downloadable press kit archive.

`sitemap.xml` is produced during the Vite build by `vite-plugin-sitemap`, also from `scripts/routes.mjs`.

---

## 🔄 CI/CD Pipeline

The project uses **GitHub Actions** for continuous integration and deployment:

| Workflow | Trigger | Purpose |
| --- | --- | --- |
| **CI** | Pull requests to `main` | Runs `npm run build` (incl. prerender) + runtime smoke test to validate changes |
| **Build and Deploy** | Push to `main` | Builds and deploys to **Aruba** via FTPS |
| **Auto-merge Dependabot** | Dependabot PRs | Merges dependency updates automatically after CI passes |

Branch protection on `main` requires the CI check to pass before merging.

---

## 📦 Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start local development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Lint and auto-fix with ESLint |
| `npm run format` | Format code with Prettier |
| `npm run type-check` | Run TypeScript type checking |
| `npm run test:smoke` | Runtime smoke test on the built site (Playwright) |
| `npm run test:env` | Validate required environment variables |
| `npm run test:full` | Run lint + type-check + build + env + smoke test |
| `npm run generate-email-assets` | Regenerate email image assets |
| `npm run update` | Bump dependencies (npm-check-updates) and reinstall |

---

## 🧠 Code Conventions

- All React components are **functional** and written in **TypeScript**.
- Styling handled with **TailwindCSS** and **HeroUI**.
- Absolute imports (`@/...`) for cleaner structure.
- ESLint + Prettier are used for linting and formatting.
- All sensitive keys (service_role, SMTP credentials) live server-side in Supabase dashboard — never in frontend env vars.

---

## 🎤 Artist Links

**Lacco (me)**  
🎧 [Spotify](https://open.spotify.com/artist/6viihrUFd4eGCfv9w61tL7)  
📸 [Instagram](https://instagram.com/laccoverse)  
🎵 [TikTok](https://tiktok.com/@laccoverse)  
📺 [YouTube](https://www.youtube.com/@Laccoverse)   
🌐 [lacco.it](https://www.lacco.it)

---

## 🧑‍💻 Author

Andrea La Commara

---

## 📜 License

This project is licensed under the **MIT License**.  
You are free to modify and reuse it, as long as proper credit is given.
