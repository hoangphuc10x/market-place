# Threadly

A marketplace where every shop is its own storefront. Fashion-first.

```
threadly.com/             ← marketplace (discover, search, trending)
threadly.com/linhstudio   ← seller's own storefront (themed, branded)
```

## Quick start (dev)

```bash
# 1. Install deps
pnpm install

# 2. Start Postgres + Redis + Meilisearch (dev infra only)
pnpm docker:up

# 3. Copy env and edit if needed
cp .env.example .env

# 4. Push schema + seed demo data
pnpm db:push
pnpm --filter @threadly/db seed

# 5. Run everything (API on :4000, Web on :3000)
pnpm dev
```

Visit:
- `http://localhost:3000` — marketplace home
- `http://localhost:3000/linhstudio` — seeded demo storefront (Atelier theme)
- `http://localhost:3000/seller/onboarding` — create your own shop
- `http://localhost:4000/v1/health` — API healthcheck

## Production (Docker)

Each app has a multi-stage Dockerfile at `apps/{api,web}/Dockerfile`. Build
context is the **monorepo root** (not the app folder), so the pnpm workspace
resolves cleanly.

### Build individual images

```bash
# API (NestJS + Prisma)
docker build -f apps/api/Dockerfile -t threadly-api .

# Web (Next.js standalone)
docker build -f apps/web/Dockerfile \
  --build-arg NEXT_PUBLIC_API_URL=https://api.threadly.example \
  --build-arg NEXT_PUBLIC_APP_URL=https://threadly.example \
  -t threadly-web .
```

### Full stack with compose

```bash
# 1. Fill in secrets
cp .env.production.example .env.production
# edit .env.production — set POSTGRES_PASSWORD, JWT_SECRET, etc.

# 2. Build + run everything
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build

# 3. Tail logs
docker compose -f docker-compose.prod.yml logs -f api web

# 4. Stop
docker compose -f docker-compose.prod.yml down
```

The `migrate` service runs `prisma migrate deploy` once at startup, then the
`api` service starts only after migrations finish. Put nginx/Caddy in front of
`:3000` and `:4000` in real prod — the compose only binds to `127.0.0.1`.

### Image sizes (after build)

| Image | Size | Notes |
|---|---|---|
| `threadly-web` | ~180 MB | Next.js standalone on alpine |
| `threadly-api` | ~450 MB | debian-slim + Prisma engine + full monorepo (room to shrink with `pnpm prune --prod` later) |

## Repo layout

```
apps/
  web/          Next.js 15 (App Router) — marketplace + storefronts + seller dashboard
  api/          NestJS — REST API, business logic, jobs
packages/
  db/           Prisma schema + client (single source of DB truth)
  themes/       Atelier · Tokyo · Pastel storefront themes
  types/        Zod-first DTOs shared between web and api
  config/       tsconfig / eslint / tailwind preset
```

## How it fits together

```
                   browser
                     │
                     ▼
              ┌──────────────┐
              │   apps/web   │  Next.js — server components fetch from API
              │  middleware  │  guards reserved slugs
              └──────┬───────┘
                     │ HTTP (JWT)
                     ▼
              ┌──────────────┐
              │   apps/api   │  NestJS — auth, stores, products, orders
              └──────┬───────┘
                     │
            ┌────────┼────────┐
            ▼        ▼        ▼
        Postgres   Redis  Meilisearch
```

## Architecture decisions

| Decision | Reason |
|---|---|
| **Route-based storefront** (`/[slug]`) | Subdomain wildcards add SSL/DNS pain. Routes ship faster, SEO is fine. |
| **Theme system, not page builder** | Three curated themes cover 80% of fashion sellers. "3 minutes to live" beats infinite flexibility. |
| **Single Postgres, row-level multi-tenancy** (`storeId` FK) | Scales to ~10k stores without sharding. Schema-per-tenant only for enterprise later. |
| **Build commerce on Nest, skip MedusaJS** | Medusa is single-store at heart; multi-vendor + Stripe Connect would need custom layer anyway. Owning the model = scale freedom. |
| **Zod-first DTOs in `@threadly/types`** | One schema = backend validation + frontend types + form validation. No drift. |
| **`RESERVED_SLUGS` enforced in 3 places** | API rejects on create; middleware tags requests; layout double-checks. Defense in depth against route collisions. |
| **Money as integer minor units** | VND has no decimals; USD stored as cents. No float math, ever. |

## What's done (MVP scaffold)

- ✅ Monorepo with Turborepo + pnpm
- ✅ Prisma schema (User/Store/Product/Variant/Cart/Order)
- ✅ JWT auth (signup/login/me)
- ✅ Slug availability check + reserved-slug enforcement
- ✅ Seller onboarding wizard (4 steps, localStorage-persisted)
- ✅ `/[storeSlug]` storefront with 3 themes
- ✅ `/[storeSlug]/p/[productSlug]` product detail
- ✅ Per-store theme CSS-variable injection (color customization)
- ✅ docker-compose for Postgres/Redis/Meilisearch

## Not yet (next milestones)

1. **Seller dashboard** — product CRUD, order list, store settings
2. **Cart + checkout** — split per store, Stripe/VNPay/Momo adapters
3. **Image upload** — Cloudflare R2 presigned URLs
4. **Search** — index products to Meilisearch
5. **Marketplace discovery** — featured shops, trending, category feed
6. **Notifications** — email + in-app (BullMQ + Redis)
7. **Analytics** — per-store dashboards
8. **Mobile-first PWA polish**

## Conventions

- **Single source of truth for shapes**: `@threadly/types` (Zod). Both Nest validation and Next forms use the same schemas.
- **Reserved slugs**: edit `packages/types/src/slugs.ts`. The API blocks them on create; middleware tags requests; layout treats them as 404.
- **Adding a theme**: register the id in `@threadly/types/theme.ts`, add a `<ThemeRenderer>` in `packages/themes/src/<id>/index.tsx`, add catalog entry. That's it.
- **Money**: always `{ amount: number, currency: 'VND' | 'USD' | 'EUR' }` where amount is minor units.
