# Anwar Clothing — Setup Guide

A custom-built clothing store (fabric, leather, fragrance, gift boxes) modeled on the
structure of bilalmarth7.pk — disciplines nav, houses/collections, bestsellers,
gift-box composer, COD-first checkout — with 100% original code and copy.

## What's Included

- `backend/` — Node.js + Express API, PostgreSQL via Prisma
- `frontend/` — React (Vite) + Tailwind storefront

## Step 1 — Database

1. Install PostgreSQL locally, or spin up a free instance on
   [Neon](https://neon.tech) or [Supabase](https://supabase.com).
2. Copy `backend/.env.example` to `backend/.env` and fill in `DATABASE_URL`.

## Step 2 — Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
node prisma/seed.js      # loads sample disciplines/collections/products
npm run dev               # starts on http://localhost:4000
```

Visit `http://localhost:4000/api/health` — you should see `{"status":"ok"}`.

**Note:** `prisma generate` and `prisma migrate` need internet access to
download Prisma's query engine binary the first time you run them. This
couldn't be run in my sandboxed environment (its network allowlist doesn't
include Prisma's binary host), so this is genuinely untested end-to-end —
run it locally and let me know if anything errors.

## Step 3 — Frontend

```bash
cd frontend
npm install
npm run dev    # starts on http://localhost:5173
```

Create `frontend/.env` if your API runs somewhere other than
`http://localhost:4000/api`:

```
VITE_API_URL=http://localhost:4000/api
```

## Step 4 — Try It

1. Register an account at `/register`
2. Browse `/collections/fabric` — you'll see the seeded products
3. Add something to your cart
4. Try `/gift-box` — pick one fabric, one fragrance, one leather item
5. Check out with Cash on Delivery

## What You'll Need to Add for Production

This is a working foundation, not a finished production store. Before
launch:

- **Real product photography** — seed data uses placeholder images
- **Payment gateway integration** — COD works end-to-end; card/JazzCash/
  EasyPaisa have the schema and UI in place but need actual gateway API keys
  wired into `order.controller.js` (marked with a `NOTE:` comment at the
  relevant spot)
- **Image hosting** — wire up Cloudinary or S3 rather than storing image
  URLs pointing at placeholders
- **Hero + lookbook video files** — drop your own `.mp4` into
  `frontend/public/media/`
- **Admin dashboard** — the API supports order status updates
  (`PATCH /orders/:id/status`, admin-only) but there's no admin UI yet;
  you'd manage products/orders via Prisma Studio (`npx prisma studio`) or a
  simple admin panel
- **Rate limiting, input sanitization hardening, and HTTPS** for a real
  public launch
- **Password reset flow** — not included in this pass

## Architecture Notes

- Auth uses short-lived (15 min) access tokens + 30-day refresh tokens,
  auto-refreshed on 401 by the frontend's axios interceptor
- Stock is checked twice: once when adding to cart, once again at checkout
  (in the same DB transaction as order creation) to prevent overselling
- The gift-box composer stores picks in a `GiftBox`/`GiftBoxItem` table
  before converting them into normal cart items — this keeps the "compose
  a box" flow separate from raw cart logic until the person actually
  commits
