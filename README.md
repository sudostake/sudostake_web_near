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

Guides

- Onboarding: Open your first liquidity request → docs/onboarding-liquidity-request.md


UI style guide (vault primitives)

We use a simple neutral theme (zinc-like) with reusable UI primitives. These live in `app/components/ui/`.

- Card: neutral container for panels

```tsx
import { Card } from "@/app/components/ui/Card";

<Card className="p-3">
  <div className="text-secondary-text text-[11px] uppercase tracking-wide">Label</div>
  <div className="font-medium text-foreground">Value</div>
</Card>
```

- Badge: status chips

```tsx
import { Badge } from "@/app/components/ui/Badge";

<Badge variant="warn">Expired</Badge>
<Badge variant="danger">Error</Badge>
<Badge variant="success">Ready</Badge>
```

- LabelValue: caption + value block

```tsx
import { LabelValue } from "@/app/components/ui/LabelValue";

<LabelValue label="Unlock epoch" value={3969} mono />
```

- CopyButton: icon-only copy with toast

```tsx
import { CopyButton } from "@/app/components/ui/CopyButton";

<CopyButton value="vault-1.factory.testnet" />
```

- SectionHeader: standardized section titles and actions

```tsx
import { SectionHeader } from "@/app/components/ui/SectionHeader";

<SectionHeader
  title="Your Vaults"
  caption="3 vaults"
  right={<button className="text-xs underline text-primary">Action</button>}
/>
```

Theme tokens

- Structural
  - `bg-background`, `text-foreground`, `border-foreground/20`
- Secondary/muted
  - `text-secondary-text`
- Primary action
  - `bg-primary`, `text-primary-text`

Dark mode

Use the provided primitives; they are already balanced for dark mode. For one-off elements, prefer neutral tokens:

- Neutral labels: `text-secondary-text dark:text-neutral-400`
- Values: `text-foreground dark:text-neutral-100`
- Panels: `border-foreground/20 bg-background/80 dark:bg-background/60`
