## Getting Started

1) Install dependencies

```bash
npm install
```

2) Configure environment variables

Create a `.env.local` file in the project root and set the following:

Client (public) Firebase config:

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

Server-side Firebase Admin (required for API routes using Firebase Admin):

```bash
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"<PROJECT_ID>", ...}'
```

3) Run the development server

```bash
npm run dev
```

Then open http://localhost:3000 in your browser.
