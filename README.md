# LearnCMS — CMS-Powered World Builder

Connect a real headless CMS, complete challenges, and watch an entire website evolve from the content you create.

## Product Flow

```
Connect CMS → Complete Challenge → Unlock Website Layer → Explore Fullscreen → Return & Evolve
```

## Getting Started

```bash
npm install
npm run db:setup   # required for Demo Mode
npm run dev
```

Open **http://localhost:3000**

## Entry Point: Connect Your CMS

The first screen is always **Connect Your CMS**. Supported providers:

- **Sanity** — Project ID, Dataset, API Token
- **Contentful** — Space ID, API Token
- **Strapi** — API URL, Token
- **Hygraph** — GraphQL endpoint, Token
- **Generic REST API** — Custom URL + Token
- **Demo Mode** — Local SQLite database (optional, at bottom)

After connection you'll see: entry count, content types, schemas, last sync.

## Website Evolution

Each completed challenge unlocks new website capabilities:

| Challenge | Unlocks |
|-----------|---------|
| Create a Blog Post | Blog homepage |
| Media Management | Hero sections, gallery |
| Categories | Filtering, navigation |
| Authors | Author profiles |
| Localization | Language switcher |
| SEO | Metadata preview |
| Content Modeling | Custom components |

After each challenge → **fullscreen immersive website** with cinematic transition.

## Features

- **6 Website Themes** — Same CMS data, different frontends (Startup, Magazine, Ecommerce, Portfolio, Travel, SaaS)
- **Live API Events** — Real request/response payloads logged as you edit
- **X-Ray Mode** — See CMS field → JSON → rendered component
- **Real persistence** — Demo mode uses SQLite; external CMS uses live APIs
- **Cross-browser sync** — SSE broadcasts content changes

## Architecture

```
CMS (Real API / SQLite)
  ↓
/api/content (CRUD)
  ↓
React Query (server state)
  ↓
Learn Workspace + Immersive Website

Zustand = UI only (connection, lessons, unlocks, theme, x-ray)
```

## Modules

- `ConnectPage` — CMS connection entry
- `LearnWorkspace` — Challenge-driven editing
- `ImmersiveWebsite` — Fullscreen evolving website
- `LiveEventPanel` — Real API flow log
- `XRayOverlay` — Architecture visualization
