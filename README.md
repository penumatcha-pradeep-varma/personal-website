# Pradeep Varma Penumatcha — Personal Website

Portfolio and career website for Pradeep Varma Penumatcha, Senior Data Engineer with 11+ years of experience.

**Live:** [pradeeppenumatcha.vercel.app](https://pradeeppenumatcha.vercel.app)

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | Astro 4 (Static Site Generation) |
| 3D / Hero | Three.js — rotating geometric shapes |
| Animations | GSAP + ScrollTrigger + ScrollSmoother |
| Styling | Tailwind CSS 3 |
| Language | TypeScript |
| Blog | Astro Content Collections (MDX) |
| Hosting | Vercel (free tier) |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:4321](http://localhost:4321)

## Type Checking

```bash
npm run typecheck
```

## Production Build

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
  components/
    three/          # Three.js scene (HeroScene.ts)
    ui/             # Navbar, Footer
    sections/       # Page sections (Hero, HomeHighlights)
  content/
    personal-blog/  # Technical articles (.mdx)
    blogs/          # Lifestyle posts: travel, bikes (.mdx)
  layouts/
    BaseLayout.astro
    BlogLayout.astro
  lib/
    gsap.ts         # GSAP plugin registration
  pages/
    index.astro     # Home
    experience.astro
    about.astro
    blog/           # Personal Blog (technical)
    blogs/          # Blogs (travel, adventures)
  styles/
    global.css
public/
  images/
    pradeep-hero.jpg  ← ADD YOUR PHOTO HERE
  Pradeep_Resume.pdf  ← ADD YOUR RESUME HERE
  favicon.svg
```

## Adding Blog Posts

### Personal Blog (Technical Articles)
Create `src/content/personal-blog/your-post.mdx`:
```mdx
---
title: "Your Post Title"
description: "Brief description"
pubDate: 2026-01-15
tags: ["Spark", "AWS", "Data Engineering"]
---

Your content here...
```

### Blogs (Travel / Adventures)
Create `src/content/blogs/your-adventure.mdx`:
```mdx
---
title: "Your Adventure Title"
description: "Brief description"
pubDate: 2026-01-15
location: "Hyderabad, India"
tags: ["travel", "bikes"]
heroImage: "/images/your-photo.jpg"
---

Your story here...
```

## Deployment (Vercel)

1. Push this repo to GitHub
2. Connect repo on [vercel.com](https://vercel.com)
3. Vercel auto-detects Astro — no config needed
4. Every push to `main` triggers a new deploy

### Required Assets Before Deploy
- `public/images/pradeep-hero.jpg` — Professional photo
- `public/Pradeep_Resume.pdf` — Latest resume PDF

## Vercel Config (optional)

Create `vercel.json` if you need custom headers:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ]
}
```
