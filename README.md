# The Unforgiven

**Forensic Forgiveness for the Things You Can't Let Go**

A newspaper-style broadsheet publication exploring the real work of forgiveness — the kind that happens in the body, not just the mind.

## Stack

- **Server:** Express.js with SSR
- **Build:** Vite + React + TypeScript
- **CDN:** Bunny CDN (images, fonts, email storage)
- **Deploy:** Render Web Service

## Development

```bash
pnpm install
pnpm dev
```

## Production Build

```bash
pnpm install && pnpm build
NODE_ENV=production node scripts/start-with-cron.mjs
```

## Content

- 300 articles across 5 categories
- 30 published at launch (backdated from Jan 1, 2026)
- 270 gated at 5/day rolling schedule
- Auto-gen pipeline (disabled by default)

## Categories

1. **The Lie** — Cultural myths about forgiveness that keep people stuck
2. **The Forensic Method** — A systematic approach to examining what you carry
3. **The Body** — How resentment lives in the nervous system
4. **The Specific** — Forgiving parents, partners, yourself — the hardest cases
5. **The Liberation** — What happens after real forgiveness

## Author

Kalesh — Consciousness Teacher & Writer
[kalesh.love](https://kalesh.love)
