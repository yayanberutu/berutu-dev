# berutu.dev

Personal portfolio, blog, and freelance sales website for `berutu.dev`.

## Stack

- Astro
- React (interactive components only)
- TypeScript
- Tailwind CSS
- MDX content collections

## Local Development

```bash
npm install
npm run dev
```

App runs on `http://localhost:4321`.

## Build

```bash
npm run build
npm run preview
```

## Routes

Primary localized routes:

- `/en/*`
- `/id/*`

Key pages:

- `/en`, `/id`
- `/en/work`, `/id/work`
- `/en/blog`, `/id/blog`
- `/en/blog/[slug]`, `/id/blog/[slug]`
- `/en/services`, `/id/services`
- `/en/about`, `/id/about`
- `/en/contact`, `/id/contact`

Legacy compatibility routes:

- `/blog` redirects to `/en/blog` (`301`)
- `/blog/[slug]` redirects to `/en/blog/[slug]` (`301`)

## Content

Blog and work content is managed with Astro content collections:

- `src/content/blog`
- `src/content/work`

Language is declared per content file using frontmatter `lang: en | id`.

## Branding Assets

Brand assets are stored in `public/brand`:

- `logo-primary.png` (light mode logo)
- `logo-reversed.png` (dark mode logo)
- `icon-on-color.png` (favicon/app icon/social fallback image)
- `logo-monochrome.png` (fallback/document use only)

Current usage:

- Header:
  - Desktop: theme-aware full logo
  - Mobile: `icon-on-color.png`
- Footer: theme-aware full logo
- SEO/favicon:
  - favicon + apple-touch-icon use `icon-on-color.png`
  - default social image fallback uses `icon-on-color.png`

## Important Files

- `src/i18n.ts` (locale detection + localized path helpers)
- `src/components/layout/SiteHeader.astro`
- `src/components/layout/SiteFooter.astro`
- `src/components/layout/SEO.astro`
- `src/pages/[lang]/blog/index.astro`
- `src/pages/[lang]/blog/[slug].astro`
- `src/pages/blog/index.astro` (redirect)
- `src/pages/blog/[slug].astro` (redirect)
