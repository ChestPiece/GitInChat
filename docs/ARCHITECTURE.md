# Architecture Documentation

## System Architecture

### Application Type

**Single Page Application (SPA)** with **Server-Side Rendering (SSR)** capabilities via Next.js App Router.

### Architecture Pattern

**Component-Based Architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│          Presentation Layer             │
│  (Components, UI, User Interactions)    │
├─────────────────────────────────────────┤
│            Business Logic               │
│   (Hooks, State Management, Utils)      │
├─────────────────────────────────────────┤
│              Data Layer                 │
│     (Auth, API Calls - Currently Mock)  │
└─────────────────────────────────────────┘
```

## Directory Structure & Responsibilities

### `/app` - Next.js App Router

The application routing and page components using Next.js 13+ App Router conventions.

**Structure:**

```
app/
├── auth/              # Authentication flows
│   ├── login/        # Login page
│   ├── signup/       # Signup page
│   ├── error/        # Auth error handling
│   └── loading.tsx   # Auth loading state
├── chat/              # Chat interface
│   ├── [id]/         # Dynamic chat routes
│   ├── layout.tsx    # Chat layout wrapper
│   └── page.tsx      # Main chat page
├── layout.tsx         # Root layout (fonts, metadata)
├── page.tsx          # Home (redirects to chat/login)
└── globals.css       # Global styles
```

**Key Patterns:**

- Server Components by default (RSC)
- Client Components marked with `'use client'`
- Route protection via middleware
- Nested layouts for shared UI

### `/components` - React Components

**Structure:**

```
components/
├── ui/                    # Shadcn/Radix UI primitives
│   ├── button.tsx
│   ├── input.tsx
│   ├── dialog.tsx
│   └── ... (50 components)
├── chat-input.tsx         # Message input component
├── chat-message.tsx       # Message display component
├── message-skeleton.tsx   # Loading state
├── sidebar.tsx            # Desktop sidebar
├── sidebar-mobile.tsx     # Mobile sidebar
└── theme-provider.tsx     # Theme context provider
```

**Component Hierarchy:**

```
ChatPage (app/chat/page.tsx)
├── Sidebar (desktop)
├── SidebarMobile
└── Main Content
    ├── ChatMessage (multiple)
    └── ChatInput
```

### `/hooks` - Custom React Hooks

**Custom Hooks:**

- `use-chats.ts` - Chat CRUD operations
- `use-messages.ts` - Message management
- `use-mobile.tsx` - Responsive utilities
- `use-toast.ts` - Toast notifications

**Pattern:**
All hooks follow the React Hook conventions:

- Start with `use` prefix
- Return state and actions
- Use `useCallback` for memoization
- Include error handling

### `/lib` - Utilities & Core Logic

**Files:**

- `auth.ts` - Authentication utilities (server actions)
- `utils.ts` - Utility functions (cn helper)

**Auth Flow:**

```
User Action → signInWithGithub()
    ↓
Set HTTP-only cookie
    ↓
Redirect to /chat
    ↓
Middleware validates token
    ↓
getUser() retrieves user data
```

## Data Flow

### Authentication Flow

```
1. User visits app → middleware checks auth_token cookie
2. No token → Redirect to /auth/login
3. Login → signInWithGithub() → Set cookie → Redirect to /chat
4. Protected routes → middleware validates → Allow/Deny access
```

### Chat Message Flow

```
User Input → ChatInput component
    ↓
handleSendMessage()
    ↓
Add user message to state
    ↓
Call AI API (currently simulated)
    ↓
Receive response
    ↓
Add assistant message to state
    ↓
ChatMessage components render
    ↓
Auto-scroll to bottom
```

### State Management

Currently using **local component state** with React hooks:

- `useState` for local state
- `useEffect` for side effects
- No global state library (Redux, Zustand, etc.)

**State Location:**

- Chat list: `useChats` hook
- Messages: `app/chat/page.tsx` local state
- User data: `app/chat/page.tsx` local state

## Routing Strategy

### App Router (Next.js 13+)

- File-based routing
- Server components by default
- Route groups for organization
- Dynamic routes with `[id]` folders

**Routes:**

- `/` → Redirect to `/chat` or `/auth/login`
- `/auth/login` → Login page
- `/auth/signup` → Signup page
- `/chat` → Main chat interface
- `/chat/[id]` → Specific chat conversation

### Route Protection

Middleware (`middleware.ts`) protects `/chat/*` routes:

```typescript
if (!authToken && path.startsWith("/chat")) {
  redirect("/auth/login");
}
```

## Component Design Patterns

### 1. Compound Components

Example: Sidebar with nested sections

```
<Sidebar>
  <Logo />
  <NewChatButton />
  <ChatHistory />
  <UserProfile />
</Sidebar>
```

### 2. Controlled Components

Example: ChatInput with controlled textarea

```typescript
<Textarea
  value={message}
  onChange={(e) => setMessage(e.target.value)}
/>
```

### 3. Server Actions

Authentication uses Next.js server actions:

```typescript
"use server";
export async function signInWithGithub() {
  // Server-side logic
}
```

## Styling Architecture

### Tailwind CSS Approach

- Utility-first CSS
- Custom design system in `tailwind.config.ts`
- Component-scoped styling
- Dark theme as primary theme

**Color Palette:**

- Primary: Blue (600, 700)
- Background: Slate (900, 800)
- Borders: Slate (700)
- Text: White, Slate (400, 300)

### CSS Variables

Custom CSS variables defined in `globals.css`:

- HSL color system
- Theme-aware variables
- Responsive design tokens

## Security Considerations

### Current Implementation

- ✅ HTTP-only cookies for auth tokens
- ✅ Route protection middleware
- ✅ Server-side authentication checks
- ⚠️ Mock authentication (not production-ready)
- ⚠️ No CSRF protection yet
- ⚠️ No rate limiting

### Production Requirements

- Real GitHub OAuth
- CSRF token validation
- Rate limiting on API routes
- Environment variable protection
- Security headers

## Performance Optimizations

### Current Optimizations

- Server Components for reduced JS bundle
- Dynamic imports (lazy loading)
- Image optimization (next/image ready)
- Auto text area height adjustment
- Memo hooks for expensive operations

### Future Optimizations

- Virtual scrolling for long message lists
- Message pagination
- Optimistic UI updates
- Request deduplication
- Caching strategy

## Scalability Considerations

### Current Limitations

- In-memory state (no persistence)
- No database connection
- Mock data generation
- Client-side only state

### Future Architecture

```
Frontend (Next.js)
    ↓
API Layer (Next.js API routes)
    ↓
Business Logic (Services)
    ↓
Database (Supabase/PostgreSQL)
    ↓
External APIs (GitHub, AI Service)
```

## Development Workflow

### Local Development

```bash
npm run dev    # Start dev server
npm run build  # Production build
npm run lint   # Run ESLint
```

### Build Output

- Static HTML for static routes
- Server-side rendered pages
- Client-side hydration
- API routes as serverless functions
