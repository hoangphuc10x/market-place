# syntax=docker/dockerfile:1.7
#
# Production image for the Next.js web app.
#
# Build context = monorepo root. Run with:
#   docker build -f apps/web/Dockerfile \
#     --build-arg NEXT_PUBLIC_API_URL=https://api.threadly.example \
#     --build-arg NEXT_PUBLIC_APP_URL=https://threadly.example \
#     -t threadly-web .
#
# Uses Next.js `output: 'standalone'` → final image only contains the
# server.js + minimal node_modules Next traced, not the full monorepo.

# ────────────────────────────────────────────────────────────────────
# Alpine is fine here — no Prisma engine to worry about, just the
# Node runtime serving pre-built bundles.
# ────────────────────────────────────────────────────────────────────

FROM node:20-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /repo


# ─── deps ───────────────────────────────────────────────────────────
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY apps/web/package.json            apps/web/
COPY packages/config/package.json     packages/config/
COPY packages/types/package.json      packages/types/
COPY packages/db/package.json         packages/db/
COPY packages/themes/package.json     packages/themes/

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile


# ─── build ──────────────────────────────────────────────────────────
FROM deps AS build
COPY packages/config  packages/config
COPY packages/types   packages/types
COPY packages/db      packages/db
COPY packages/themes  packages/themes
COPY apps/web         apps/web

# NEXT_PUBLIC_* are baked into the client bundle at build time —
# they MUST be set as ARGs and forwarded to ENV before `next build`.
# Non-public env (API_URL used server-side only) is read at runtime.
ARG NEXT_PUBLIC_API_URL=http://localhost:4000
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

# Build shared packages first so Next can resolve them. Prisma client
# is needed because the web app imports types from @threadly/db.
RUN pnpm --filter @threadly/db    generate \
 && pnpm --filter @threadly/types build    \
 && pnpm --filter @threadly/db    build    \
 && pnpm --filter @threadly/web   build


# ─── runtime ────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
# Next.js standalone reads PORT and HOSTNAME
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN apk add --no-cache curl \
 && addgroup -S app && adduser -S app -G app

WORKDIR /app

# Next.js `output: 'standalone'` produces three things we need:
#   .next/standalone — server.js + traced node_modules + workspace pkg files
#   .next/static     — fingerprinted JS/CSS chunks (served from /_next/static)
#   public           — anything in apps/web/public (favicon, theme previews)
#
# `outputFileTracingRoot` in next.config.mjs points at the monorepo root,
# so the standalone folder mirrors the repo structure under /app.
COPY --from=build --chown=app:app /repo/apps/web/.next/standalone ./
COPY --from=build --chown=app:app /repo/apps/web/.next/static     ./apps/web/.next/static
COPY --from=build --chown=app:app /repo/apps/web/public           ./apps/web/public

USER app
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -fsS http://localhost:${PORT}/ || exit 1

CMD ["node", "apps/web/server.js"]
