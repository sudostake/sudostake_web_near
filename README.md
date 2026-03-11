# SudoStake Web App

Next.js + TypeScript frontend for SudoStake, with NEAR Wallet Selector and Firebase.

## Quick start
1. Install dependencies.

```bash
npm install
```

2. Create `.env.local` in the project root.

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"<PROJECT_ID>", ...}'
NEXT_PUBLIC_LENDING_USE_API=false
NEXT_PUBLIC_PENDING_USE_API=false
```

3. Start the app.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## What each env var is for
- `NEXT_PUBLIC_FIREBASE_*`: browser Firebase config. All are required except `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`.
- `FIREBASE_SERVICE_ACCOUNT_KEY`: Firebase Admin service account JSON for server routes that read or write Firestore.
- `NEXT_PUBLIC_LENDING_USE_API`: optional REST polling for lender positions instead of realtime Firestore.
- `NEXT_PUBLIC_PENDING_USE_API`: optional REST polling for pending requests instead of realtime Firestore.

## Useful commands
- `npm run dev`: start the local app.
- `npm run lint`: run linting.
- `npm run test:account`
- `npm run test:transform`
- `npm run test:epochs`
- `npm run test:format`
- `npm run test:strings`
- `npm run test:acceptActions`

## Notes
- The app defaults to NEAR `testnet`.
- The app uses `/api/rpc` as a proxy for chain reads.
- If `FIREBASE_SERVICE_ACCOUNT_KEY` is missing or malformed, Firebase Admin routes will fail.

## Docs
- Product and flow docs: [`docs/README.md`](./docs/README.md)
- First borrower guide: [`docs/guides/opening-liquidity-request.md`](./docs/guides/opening-liquidity-request.md)
