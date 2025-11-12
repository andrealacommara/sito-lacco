# 🎵 Lacco — Official Website

A **React + TypeScript + Vite** project that tells the story of **Lacco**, his music, and his artistic identity.  
The website features a modern, responsive, and high-performance structure, with smooth animations and direct integration with **Spotify**, **Apple Music**, **YouTube**, **Instagram**, and **TikTok**.

🌐 Live: [www.lacco.it](https://www.lacco.it)

---

## 🚀 Tech Stack

| Category               | Technologies                                                     |
| ---------------------- | ---------------------------------------------------------------- |
| **Frontend Framework** | [React 18+](https://react.dev/) with [Vite](https://vitejs.dev/) |
| **Language**           | [TypeScript](https://www.typescriptlang.org/)                    |
| **UI Library**         | [HeroUI](https://heroui.dev/) (based on NextUI and TailwindCSS)  |
| **Styling**            | [TailwindCSS](https://tailwindcss.com/)                          |
| **Animations**         | [Framer Motion](https://www.framer.com/motion/)                  |
| **Email Service**      | [EmailJS](https://www.emailjs.com/) for contact form handling    |
| **Image Handling**     | `@heroui/image`                                                  |
| **Spotify Player**     | IFrame Embed API                                                 |
| **Build Tools**        | Vite + TailwindCSS (PostCSS) + HeroUI Theme                      |

---

## 🧩 Project Structure

```
src/
├── assets/                 # Static resources and images
│   ├── icons
│   └── images
├── components/             # Reusable UI components
│   ├── aboutSection.tsx
│   ├── cardSongExposer.tsx
│   ├── icons.tsx
│   ├── navbar.tsx
│   ├── primitives.ts
│   ├── smartImage.tsx
│   ├── spotifyPlayer.tsx
│   └── theme-switch.tsx
├── config/                 # Site and song configuration files
│   ├── sectionsAboutPage.ts
│   ├── site.ts
│   └── songList.ts
├── layouts/                # Shared main layouts
│   └── default.tsx
├── pages/                  # Main website pages
│   ├── aboutPage.tsx       # "Su di me" Page
│   ├── contactPage.tsx     # "Contatti" Page
│   ├── homePage.tsx        # "Home" Page
│   └── musicPage.tsx       # "La mia musica" Page
├── routes/                 # Lazy routes + preload helpers
│   └── pages.ts
├── styles/                 # Styles configuration
│   └── global.css
├── types/                  # Shared TypeScript types
│   └── index.ts
├── utils/                  # Utility helpers shared across the app
│   ├── createIcon.tsx
│   ├── ensureMediaKeySystemRobustness.ts
│   └── lazyWithPreload.ts
├── App.tsx                 # Main component for routing
├── main.tsx                # App entry point
└── provider.tsx            # Global HeroUI + Toast provider
```

---

## ✨ Main Features

- **Home:** Introduction to Lacco with an on-demand Spotify player that loads only when needed on mobile.
- **La mia musica:** Horizontal carousel of singles, with descriptions and direct links to platforms (Modal).
- **Su di me:** Animated biography with progressive scroll effects (Framer Motion).
- **Contatti:** Interactive form that sends messages via EmailJS.
- **Footer:** Quick links to social and music platforms.
- **Route preloading:** Navigation links prefetch their chunks on hover/touch for near-instant transitions.

---

## ⚙️ Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure environment variables

Create a `.env` file in the project root and add your EmailJS parameters:

```bash
VITE_EMAILJS_SERVICE_ID="your_service_id"
VITE_EMAILJS_TEMPLATE_ID="your_template_id"
VITE_EMAILJS_PUBLIC_KEY="your_public_key"
```

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
You can deploy them to any static hosting service (e.g., **Aruba**, Netlify, Vercel, GitHub Pages, Cloudflare Pages).

---

## 🧠 Code Conventions

- All React components are **functional** and written in **TypeScript**.
- Styling handled with **TailwindCSS** and **HeroUI**.
- Each component is self-contained and documented.
- Absolute imports (`@/...`) for cleaner structure.
- ESLint + Prettier are used for linting and formatting.

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
