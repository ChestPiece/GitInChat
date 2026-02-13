# Real-time GitHub Integration Guide

## Methodology Alignment

You asked if this fits your app's methodology. **Yes, absolutely.**

- **Current App**: Reactive _Chat_ Interface. You talk, it acts.
- **Missing Piece**: _Passive_ Awareness. If something happens on GitHub (a test fails, a teammate pushes code), your app is currently blind to it until you ask.
- **Real-time Goal**: The app becomes a true "Command Center" that reflects the _live_ state of your repositories, not just a static snapshot.

## The Solution: GitHub App + Webhooks

We will use a **GitHub App** to "subscribe" to your repositories.

### Requirements

1.  **Public URL (Dev Only)**: `smee.io` (to receive events on localhost).
2.  **GitHub App**: You create this _once_ on GitHub.com.
3.  **Supabase**: To store and broadcast events.

---

## Step-by-Step Implementation Guide

### Phase 1: Infrastructure Setup

#### 1. Start Local Tunnel

We need a way for GitHub to hit your `localhost:3000`.

1.  Go to [smee.io](https://smee.io) and click **"Start a new channel"**.
2.  Copy the **Webhook Proxy URL** (e.g., `https://smee.io/xyz...`).
3.  Keep this tab open or save the URL.

#### 2. Create GitHub App

1.  Go to **GitHub Developer Settings** -> **GitHub Apps** -> **New GitHub App**.
2.  **Name**: `Your-App-Name-Dev` (e.g., "V0 Chat Agent").
3.  **Homepage URL**: `http://localhost:3000`.
4.  **Callback URL**: `http://localhost:3000/api/auth/callback/github` (for future auth usage).
5.  **Webhook URL**: Paste your **Smee.io URL**.
6.  **Webhook Secret**: Generate a random string (e.g., `my_secret_123`) and save it.
7.  **Permissions** (Select 'Read and Write' for):
    - `Contents` (Code)
    - `Issues`
    - `Pull requests`
    - `Metadata` (Read-only)
8.  **Subscribe to events**: Check `Push`, `Pull request`, `Issues`.
9.  Click **Create GitHub App**.

#### 3. Save Credentials

Get these from the App settings page and add to `.env`:

```bash
GITHUB_APP_ID=123456
GITHUB_WEBHOOK_SECRET=my_secret_123
# Generate a Private Key at the bottom of the settings page, download it,
# and convert content to a single line string (use \n for newlines)
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n..."
```

---

### Phase 2: The Listener (Backend Code)

We need an API route to receive the webhook.

**File:** `app/api/webhooks/github/route.ts`

```typescript
import { Webhooks } from "@octokit/webhooks";

const webhooks = new Webhooks({
  secret: process.env.GITHUB_WEBHOOK_SECRET!,
});

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("x-hub-signature-256");

  // Verify security signature
  if (!(await webhooks.verify(body, signature!))) {
    return new Response("Unauthorized", { status: 401 });
  }

  const event = JSON.parse(body);

  // Handle Event (e.g., save to DB)
  if (req.headers.get("x-github-event") === "push") {
    console.log("New Push to", event.repository.full_name);
    // TODO: Insert into Supabase 'events' table
  }

  return new Response("OK", { status: 200 });
}
```

---

### Phase 3: The Broadcaster (Real-time Config)

1.  **Database**: Create a table in Supabase (e.g., `github_events`) with `realtime` enabled.
2.  **Frontend**: Use `supabase.channel` to listen to inserts on `github_events`.

### Phase 4: User Installation

1.  Add a button: `<Link href="https://github.com/apps/YOUR-APP/installations/new">Connect Repos</Link>`.
2.  When you (or any user) clicks this, they grant the app permission for their selected repos.
3.  Webhooks start flowing immediately.
