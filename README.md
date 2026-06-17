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
| **UI Library**         | [HeroUI](https://heroui.dev/) (based on NextUI and TailwindCSS)            |
| **Styling**            | [TailwindCSS v4](https://tailwindcss.com/)                                 |
| **Animations**         | [Framer Motion](https://www.framer.com/motion/)                            |
| **Backend / DB**       | [Supabase](https://supabase.com/) (Postgres + Edge Functions + Auth)       |
| **Email Service**      | [EmailJS](https://www.emailjs.com/) for contact form · [Resend](https://resend.com/) for newsletter (welcome + broadcast) |
| **Image Handling**     | Custom `SmartImage` component with AVIF/WebP/JPEG fallback                 |
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
├── components/             # Reusable UI components
│   ├── cardSongExposer.tsx   # Song card with modal (presave + streaming links)
│   ├── countdown.tsx         # Release countdown timer (dark/light variant)
│   ├── icons.tsx             # SVG icons + Logo component
│   ├── liveEventCard.tsx     # Live event card (poster, countdown, ticket CTA)
│   ├── navbar.tsx
│   ├── presaveButton.tsx     # DistroKid hyperfollow presave CTA
│   ├── primitives.ts         # Typography utility classes
│   ├── smartImage.tsx        # Optimized image with AVIF/WebP/JPEG fallback
│   ├── songCarousel.tsx      # Horizontal snap carousel of catalog songs
│   └── subscribeForm.tsx     # Newsletter subscribe form (full + compact)
├── config/
│   ├── catalog.ts             # Single source of truth: all songs + release config
│   └── liveEvents.ts          # Live events: upcoming/past shows + ticket links
├── emails/
│   └── templates.ts          # HTML email templates (welcome + broadcast preview)
├── layouts/
│   └── default.tsx           # Shared layout (Navbar + Footer)
├── lib/
│   └── supabase.ts           # Supabase client + Edge Function base URL
├── pages/
│   ├── aboutPage.tsx         # "Su di me"
│   ├── adminPage.tsx         # Admin dashboard (subscriber list + broadcast)
│   ├── contactPage.tsx       # Contact form via EmailJS
│   ├── homePage.tsx          # Home
│   ├── livePage.tsx          # "Live" — upcoming/past shows
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
│   └── api.ts                # Shared API types (subscribe, broadcast, etc.)
├── utils/
│   ├── createIcon.tsx
│   └── lazyWithPreload.ts
├── App.tsx                   # Main router
├── main.tsx                  # Entry point
└── provider.tsx              # HeroUI + Toast provider

supabase/
├── functions/
│   ├── _shared/              # Shared helpers (Supabase clients, email, Resend sync, validation)
│   ├── subscribe/            # POST: add subscriber (single opt-in) + welcome email
│   ├── unsubscribe/          # GET: unsubscribe via personal token
│   ├── resend-webhook/       # POST: Resend webhook (unsubscribe/bounce status sync)
│   ├── admin-subscribers/    # GET/POST/PATCH: list, add, manually unsubscribe (admin-only)
│   ├── admin-broadcast/      # POST: send broadcast to all confirmed subscribers or to selected ones
│   ├── admin-sync-resend/    # POST: reconcile subscriber status with the Resend Audience
│   └── admin-stats/          # GET: dashboard counters (confirmed, unsubscribed, bounced, new)
└── migrations/
    ├── 20260614000001_create_subscribers.sql
    ├── 20260614000002_keep_alive_cron.sql
    └── 20260616000001_remove_pending_status.sql
```

---

## ✨ Main Features

- **Home:** Introduction to Lacco with an on-demand Spotify player that loads only when needed on mobile, plus a presave card (blurred artwork backdrop, countdown, DistroKid presave button) for the next upcoming release, and a live event card for the next upcoming show.
- **Live (`/live`):** Driven by `liveEvents.ts`. Shows upcoming live dates (poster, countdown, venue/lineup details, ticket link) and an archive of past shows; displays a "new dates coming soon" message when nothing is upcoming.
- **La mia musica:** Horizontal snap carousel of singles, with descriptions and streaming links (Spotify + Apple Music) in a modal. Supports presave mode with "COMING SOON" badge.
- **Release pages (`/:slug`):** Full-screen landing pages driven by `catalog.ts`. Two modes:
  - **Presave mode** — artwork, countdown timer, DistroKid presave button, newsletter subscribe form.
  - **Live mode** — artwork, streaming CTAs (Spotify / Apple Music), song carousel.
- **Newsletter:** Subscribe form with name + email + consent. Single opt-in — confirmed immediately, with a welcome email sent right away. Unsubscribe link in every email, kept in sync with the Resend Audience via webhook and manual reconciliation.
- **Admin (`/admin`):** Protected by Supabase magic link auth. Dashboard with live counters (confirmed, unsubscribed, bounced, new in last 7 days), searchable/sortable/filterable subscriber list with configurable page size, manual unsubscribe for selected subscribers, and a broadcast composer (body, optional image, optional CTA button) with live email preview — sendable to all confirmed subscribers or to individually selected ones.
- **Contatti:** Contact form via EmailJS.
- **PressKit:** Dedicated private page (lazy-loaded, noindex) with official media assets, extended bio, press photos, and professional contacts.
- **Privacy Policy (`/privacy`):** GDPR-compliant privacy policy in Italian.
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
# EmailJS (contact form)
VITE_EMAILJS_SERVICE_ID="your_service_id"
VITE_EMAILJS_TEMPLATE_ID="your_template_id"
VITE_EMAILJS_PUBLIC_KEY="your_public_key"

# Supabase (newsletter + admin)
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your_anon_key"
```

> **Note:** The Supabase Edge Functions use server-side secrets (`RESEND_API_KEY`, `service_role`) configured in the Supabase dashboard — never in `VITE_*` variables.

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

Optimized files will be generated in the `/dist` folder.

---

## 🔄 CI/CD Pipeline

The project uses **GitHub Actions** for continuous integration and deployment:

| Workflow | Trigger | Purpose |
| --- | --- | --- |
| **CI** | Pull requests to `main` | Runs `npm install` + `npm run build` to validate changes |
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
| `npm run test:full` | Run lint + type-check + build + env validation |

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
