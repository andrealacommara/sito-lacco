# 🎵 Lacco — Official Website

Un progetto **React + TypeScript + Vite** che racconta **Lacco**, la sua musica e la sua identità artistica.  
Il sito presenta una struttura moderna, responsive e ottimizzata per la performance, con animazioni fluide e integrazione diretta con **Spotify**, **Apple Music**, **YouTube**, **Instagram** e **TikTok**.

---

## 🚀 Stack Tecnologico

| Categoria | Tecnologie |
|------------|-------------|
| **Frontend Framework** | [React 18+](https://react.dev/) con [Vite](https://vitejs.dev/) |
| **Linguaggio** | [TypeScript](https://www.typescriptlang.org/) |
| **UI Library** | [HeroUI](https://heroui.dev/) (basata su NextUI e TailwindCSS) |
| **Styling** | [TailwindCSS](https://tailwindcss.com/) |
| **Animazioni** | [Framer Motion](https://www.framer.com/motion/) |
| **Email Service** | [EmailJS](https://www.emailjs.com/) per l’invio di messaggi dal form contatti |
| **Gestione Immagini** | `@heroui/image` |
| **Player Spotify** | IFrame Embed API |

---

## 🧩 Struttura del Progetto

```
src/
├── assets/                 # Immagini e risorse statiche
│   └── images/lacco/
├── components/             # Componenti UI riutilizzabili
│   ├── cardSongExposer.tsx
│   ├── icons.tsx
│   ├── navbar.tsx
│   └── spotifyPlayer.tsx
├── config/                 # File di configurazione del sito e delle tracce
│   ├── site.ts
│   └── songList.ts
├── layouts/                # Layout principali condivisi (es. DefaultLayout)
│   └── default.tsx
├── pages/                  # Pagine principali del sito
│   ├── index.tsx           # Home
│   ├── la-mia-musica.tsx   # Sezione musica
│   ├── su-di-me.tsx        # Biografia
│   └── contatti.tsx        # Form di contatto con EmailJS
├── provider.tsx            # Provider globale HeroUI + Toast
└── types/                  # Tipi TypeScript condivisi
```

---

## ✨ Funzionalità Principali

- **Homepage:** introduzione a Lacco e player Spotify integrato.  
- **La mia musica:** carosello orizzontale di singoli, con descrizione e link diretti alle piattaforme.  
- **Su di me:** biografia animata con effetti di scorrimento progressivo (Framer Motion).  
- **Contatti:** form interattivo per inviare messaggi direttamente via EmailJS.  
- **Footer:** link rapidi ai profili social e musicali.  

---

## ⚙️ Setup Locale

### 1. Clona il repository
```bash
git clone https://github.com/<tuo-username>/<nome-repo>.git
cd <nome-repo>
```

### 2. Installa le dipendenze
```bash
npm install
# oppure
yarn install
```

### 3. Configura le variabili d’ambiente
Crea un file `.env` nella root del progetto e inserisci i parametri EmailJS:

```bash
VITE_EMAILJS_SERVICE_ID=tuo_service_id
VITE_EMAILJS_TEMPLATE_ID=tuo_template_id
VITE_EMAILJS_PUBLIC_KEY=tuo_public_key
```

### 4. Avvia il server di sviluppo
```bash
npm run dev
```
Il sito sarà disponibile su [http://localhost:5173](http://localhost:5173)

---

## 🧱 Build per la Produzione

```bash
npm run build
```

I file ottimizzati saranno generati nella cartella `/dist`.  
Puoi servirli con un qualsiasi hosting statico (es. Netlify, Vercel, GitHub Pages, Cloudflare Pages).

---

## 🧠 Convenzioni di Codice

- Tutti i componenti React sono **funzionali** e scritti in **TypeScript**.  
- Stile gestito tramite **TailwindCSS** e **HeroUI**.  
- Ogni componente è autocontenuto e documentato.  
- Import assoluti (`@/...`) per una struttura più pulita.  

---

## 🎤 Link all'artista (me)

**Lacco**  
🎧 [Spotify](https://open.spotify.com/artist/6viihrUFd4eGCfv9w61tL7)  
📸 [Instagram](https://instagram.com/laccoverse)  
🎵 [TikTok](https://tiktok.com/@laccoverse)  
📺 [YouTube](https://www.youtube.com/@Laccoverse)

---

## 🧑‍💻 Autore
Andrea La Commara

---
## 📜 Licenza

Questo progetto è distribuito sotto licenza **MIT**.  
Puoi modificarlo e riutilizzarlo liberamente, citando la fonte.
