# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui

## Artifacts

### GigVillage Platform (`artifacts/gigvillage`)
A community-based gig economy web app for rural youth and graduate entrepreneurs in Malaysia.

**Pages:**
- `/` — Landing page with hero, features, how it works
- `/marketplace` — Browse gig listings with category/location/search filters
- `/providers` — Directory of registered service providers
- `/providers/:id` — Full provider profile with bio, stats, services, reviews, review form, rating breakdown
- `/bookings` — Bookings dashboard with two role tabs (My Orders / My Gig Bookings) and status sub-tabs
- `/impact` — Impact dashboard with stats, charts, activity feed
- `/login` — Lightweight email + name sign-in (find-or-create user)
- `/register`, `/provider/onboarding` — Provider onboarding (requires login; links provider to user)
- `/post-gig` — Post a new gig listing
- `/gigs/:id` — Gig detail page with booking form (requires login to book)
- `/bookings/:id` — Booking detail page

**Auth & Roles:**
- All accounts live in `users` (id, name, email). Auth state stored in `localStorage` (`gigvillage_auth_user`).
- A user becomes a Provider by completing onboarding — that creates a row in `providers` with `userId` set. The user record is enriched with `providerId` on read.
- Same user can be both Customer (places orders) and Provider (receives bookings on their gigs).
- Bookings carry `customerUserId` (the booker) and `providerId` (the gig's owner). The bookings list endpoint filters with `?customerUserId=X` or `?providerId=Y`.

**Brand:** Deep crimson red (#8B1A1A) primary, warm gold (#C9A84C) accent, cream background — Malaysian heritage palette.

### API Server (`artifacts/api-server`)
Express 5 backend serving the GigVillage API at `/api`.

**Routes:**
- `GET/POST /api/gigs` — List and create gig listings
- `GET /api/gigs/:id` — Get single gig
- `GET/POST /api/providers` — List and register providers
- `GET /api/providers/:id` — Get provider profile
- `GET/POST /api/bookings` — List and create bookings
- `GET /api/bookings/:id` — Get booking details
- `PATCH /api/bookings/:id` — Update booking status
- `GET /api/impact/summary` — Platform impact stats
- `GET /api/impact/activity` — Recent activity feed
- `GET /api/impact/categories` — Gig category breakdown

## Database Tables

- `providers` — Service provider profiles (skills, location, ratings, earnings)
- `gigs` — Gig/service listings (category, price, status)
- `bookings` — Service bookings (status, customer info, scheduling)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
