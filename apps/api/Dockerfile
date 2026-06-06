# syntax=docker/dockerfile:1.7
#
# Production image for the NestJS API.
#
# Build context = monorepo root. Run with:
#   docker build -f apps/api/Dockerfile -t threadly-api .
#
# Stages:
#   base    — Node 20 + pnpm, shared by every stage
#   deps    — install full deps (cached on lockfile + manifests)
#   build   — compile @threadly/types, @threadly/db, @threadly/api
#   runtime — debian-slim with only what's needed to `node dist/main.js`

# ────────────────────────────────────────────────────────────────────
# Why debian-slim, not alpine:
#   Prisma's query engine links against glibc + openssl. Alpine (musl)
#   needs a different binaryTarget and is fiddly to debug. Slim is ~80MB
#   bigger; we save it back in fewer "works on my machine" incidents.
# ────────────────────────────────────────────────────────────────────

FROM node:20-bookworm-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate
WORKDIR /repo


# ─── deps ───────────────────────────────────────────────────────────
# Only copy lockfile + package manifests so this layer caches when source
# changes but deps don't. Massive build-time win during iteration.
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json .npmrc ./
COPY apps/api/package.json            apps/api/
COPY packages/config/package.json     packages/config/
COPY packages/types/package.json      packages/types/
COPY packages/db/package.json         packages/db/

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile


# ─── build ──────────────────────────────────────────────────────────
FROM deps AS build
COPY packages/config  packages/config
COPY packages/types   packages/types
COPY packages/db      packages/db
COPY apps/api         apps/api

# 1. Generate Prisma client into node_modules/.prisma/client
# 2. Build workspace TS packages so their dist/ exists for the API to consume
# 3. Build the API itself (nest build → apps/api/dist)
RUN pnpm --filter @threadly/db    generate \
 && pnpm --filter @threadly/types build    \
 && pnpm --filter @threadly/db    build    \
 && pnpm --filter @threadly/api   build


# ─── runtime ────────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS runtime
ENV NODE_ENV=production
ENV API_PORT=4000

# openssl is required by Prisma engine; curl is for HEALTHCHECK.
# ca-certificates so outbound HTTPS (Stripe, R2, etc.) verifies.
RUN apt-get update \
 && apt-get install -y --no-install-recommends curl ca-certificates openssl \
 && rm -rf /var/lib/apt/lists/* \
 && groupadd -r app && useradd -r -g app -m -d /app app

WORKDIR /app

# Copy the monorepo into /app — pnpm-resolved symlinks stay intact.
# We could prune devDeps with `pnpm prune --prod` to shrink ~150MB,
# but that historically breaks workspace symlinks; revisit when image
# size becomes a deploy bottleneck.
COPY --from=build --chown=app:app /repo /app

USER app
WORKDIR /app/apps/api

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -fsS http://localhost:${API_PORT}/v1/health || exit 1

CMD ["node", "dist/main.js"]
