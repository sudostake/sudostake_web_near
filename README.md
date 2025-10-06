## SudoStake Web App

Next.js + TypeScript web app for SudoStake with NEAR Wallet Selector and Firebase. This guide walks you from clone to running locally, with the minimum you need to configure.

Prerequisites

- Node.js 18.18+ (or 20/22). Recommended via nvm
- npm (uses package-lock.json)

1) Install dependencies

```bash
npm install
```

2) Configure environment variables

Create a .env.local file in the project root with the following. Values marked optional can be omitted.

Client Firebase config (public):

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
# Optional
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
```

Server Firebase Admin (required for API routes):

```bash
# Paste the full JSON of a Firebase service account. Keep it on one line or wrap in quotes.
# Tip: wrapping in single quotes often works well: ' {...} '
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"<PROJECT_ID>", ...}'
```

Optional feature flags and overrides:

```bash
# Use REST API instead of Firestore realtime for lender positions (default: false)
NEXT_PUBLIC_LENDING_USE_API=false
# Use REST API instead of Firestore realtime for pending requests (default: false)
NEXT_PUBLIC_PENDING_USE_API=false
# Override the NEAR mainnet USDC implicit account (64 hex chars) if needed
NEXT_PUBLIC_USDC_MAINNET_ID=17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1
```

3) Run the development server

```bash
npm run dev
```

Open http://localhost:3000

Testing and linting

- Lint: npm run lint
- Scripted tests (run individually):
  - npm run test:account
  - npm run test:transform
  - npm run test:epochs
  - npm run test:format
  - npm run test:strings
  - npm run test:acceptActions

Notes

- NEAR network: The app defaults to testnet and uses an internal /api/rpc proxy to avoid CORS.
- API routes: Any route that accesses Firestore via Firebase Admin requires FIREBASE_SERVICE_ACCOUNT_KEY to be set in your environment during development.

Troubleshooting

- FIREBASE_SERVICE_ACCOUNT_KEY contains invalid JSON: Ensure the value is the exact JSON for the service account. If using .env files, keep the JSON on one line or wrap it in single quotes; escape newlines and backslashes if necessary.
- Missing FIREBASE_SERVICE_ACCOUNT_KEY: API routes that use Firebase Admin will fail. Set it to a valid service account JSON.

Additional docs

- docs/ contains architecture, features, guides and reference. For a first tutorial, see docs/guides/opening-liquidity-request.md
