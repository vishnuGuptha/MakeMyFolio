# BuildMyFolio

**BuildMyFolio** ([buildmyfolio.com](https://buildmyfolio.com)) turns a resume into a polished live portfolio — minutes, not weeks.

## Stack

- **Client:** Vite + React 18 + TypeScript + Tailwind CSS + Framer Motion
- **Server:** Express + TypeScript + MongoDB (Mongoose)
- **Auth:** JWT in httpOnly cookies
- **Media:** Local disk (dev), or Cloudinary / S3 in production

## Prerequisites

- Node.js 18+ (Node 20+ recommended if using S3 via AWS SDK)
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

## Quick Start

### 1. Server

```bash
cd server
cp .env.example .env
# Edit .env — set MONGODB_URI and a strong JWT_SECRET (≥32 chars in production)
npm install
npm run seed
npm run dev
```

API: `http://localhost:4000`

### 2. Client

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Client: `http://localhost:5173`

Seed credentials (dev only, from `npm run seed`):

| Role | Email | Password |
|------|-------|----------|
| Platform admin | `admin@portfolio.local` (or `ADMIN_EMAIL`) | `admin123` (or `ADMIN_PASSWORD`) |
| Demo user | `vishnugupta28899@gmail.com` | `user123` |

### 3. URL map

| URL | Description |
|-----|-------------|
| `/` | **BuildMyFolio** marketing home (guests). Signed-in users → `/dashboard` |
| `/try` | Guest editor (session draft; cleared on refresh) |
| `/try/preview` | Full theme preview of the guest draft (new tab) |
| `/examples` | Published portfolio gallery |
| `/{slug}` | Live public portfolio |
| `/login` · `/register` | Auth (optional `?claimGuest=1` to save try-mode draft) |
| `/dashboard` | Owner CMS |
| `/platform` | Platform admin |
| `/platform/try-demo` | Edit the shared public `/try` demo seed |

Publish at `https://{slug}.buildmyfolio.com` in production (subdomain).

## Guest funnel

1. Explore themes and examples without an account.
2. Edit in `/try` — richer fields + side preview; **Full preview** opens `/try/preview` in a new tab.
3. Draft stored in `sessionStorage`, **lost on page refresh**. Fresh visits load the platform-managed demo seed from the API.
4. **Resume import** and **Publish** open an auth modal (or use `/register?claimGuest=1`).
5. After signup, the guest draft is claimed onto the new profile.

Platform admins control the default `/try` (and theme-card) content at `/platform/try-demo`.

## Freemium

Plans are marketed on the home page (`Free` / `Pro` / `Team`). Users have `plan: free` on the server by default; Stripe enforcement is not in v1.

## Environment

Copy examples only — never commit real `.env` files.

| File | Purpose |
|------|---------|
| [`server/.env.example`](server/.env.example) | `JWT_SECRET`, MongoDB, storage (`STORAGE_PROVIDER`, Cloudinary/S3), Gemini resume AI |
| [`client/.env.example`](client/.env.example) | `VITE_API_URL` (empty in same-origin prod proxies; `http://localhost:4000` in local dev) |

**Production checklist**

- Set a unique `JWT_SECRET` (≥32 characters; never `dev-secret`)
- Set `CLIENT_URL` to your public site origin
- Use MongoDB Atlas (or managed Mongo) with a strong DB user password
- Prefer `STORAGE_PROVIDER=cloudinary` or `s3` instead of local disk
- Rotate any keys that ever appeared in chat, screenshots, or old commits

## Project structure

```
portfolio/
├── client/          # React + BuildMyFolio marketing + dashboard
│   └── src/brand/   # Logo + brand constants
├── server/          # Express API
└── README.md
```
