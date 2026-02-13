# Real-time GitHub Integration Design

**Goal**: Enable real-time updates (commits, PRs, issues) from GitHub to the Chat Interface.

## Architecture: GitHub App (Scalable + Real-time)

To solve the "manual setup for every repo" problem, we will use a **GitHub App**.

### Why GitHub App?

- **One-Time Setup**: You create 1 App and "Install" it on your personal account or organization.
- **Works for EVERYONE**: Other users just click "Install [Your App]" on their own accounts. They do **NOT** need to create their own app.
- **Future-Proof**: Automatically works for **all current and future repositories**. No manual webhook adding required.
- **Higher Limits**: 5,000 requests/hour vs 60 requests/hour for standard tokens.
- **Granular Permissions**: We request exactly what we need (Contents: Write, Issues: Write, etc.) and nothing more.

### How it Works for Users

1. User logs in (Auth).
2. User clicks "Connect GitHub App" (Installation Link).
3. GitHub asks: "Where do you want to install [Your App]?"
4. User selects their account/repos.
5. **Done!** We instantly get webhooks for all their selected repos. They do nothing else.

### 1. The Setup (GitHub Developer Settings)

- Create a new GitHub App.
- Set **Homepage URL**: `http://localhost:3000` (or `smee.io` URL for development).
- **Callback URL**: `http://localhost:3000/api/auth/callback/github` (if using NextAuth).
- **Webhook URL**: Your `smee.io` URL.

### 2. The Listener (Backend)

- **Route**: `app/api/webhooks/github/route.ts`
- **Function**: Receives events for _any_ repo you installed the App on.

### 3. The Broadcaster (Real-time)

- **Internal**: Supabase Realtime stays the same. The backend just listens to a broader firehose of events.

- **Mechanism**: Supabase Realtime (Postgres Changes).
- **Flow**:
  1. Webhook inserts/updates a row in `commits` or `events` table.
  2. Supabase automatically pushes this change to the Frontend via WebSocket.
  3. UI updates instantly without refreshing.

## Requirements Checklist

### Infrastructure

- [ ] **Public URL**: Use `smee.io` (easiest) or `ngrok`.
- [ ] **GitHub App / Webhook Setting**: Configure the webhook in your repo settings.

### Secrets

- [ ] `GITHUB_WEBHOOK_SECRET`: A string you generate to secure the connection.

### Code Changes

- [ ] **Database**: Create tables for `events` or `commits` if not present.
- [ ] **API**: Implement the webhook handler.
- [ ] **Frontend**: Use `supabase.channel()` to listen for updates.

---

**Do you want to proceed with this `smee.io` + Webhook architecture?**
