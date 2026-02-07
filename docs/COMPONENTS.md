# Component Reference

## Component Index

### Core Components

1. [Sidebar](#sidebar) - Desktop navigation sidebar
2. [SidebarMobile](#sidebarmobile) - Mobile drawer navigation
3. [ChatMessage](#chatmessage) - Message display component
4. [ChatInput](#chatinput) - Message input component
5. [MessageSkeleton](#messageskeleton) - Loading placeholder
6. [ThemeProvider](#themeprovider) - Theme context provider

---

## Core Components

### Sidebar

**Location:** `components/sidebar.tsx`  
**Type:** Client Component (`'use client'`)

#### Purpose

Main navigation sidebar for desktop view with chat history, user profile, and app controls.

#### Props

```typescript
interface SidebarProps {
  userEmail?: string; // User's email address
  userName?: string; // Display name
  userAvatar?: string; // Avatar URL
  chats?: Array<{
    // List of chats
    id: string;
    title: string;
  }>;
  currentChatId?: string; // Active chat ID
  onNewChat?: () => Promise<void>; // New chat handler
}
```

#### Features

- ✅ Logo and branding
- ✅ New chat button
- ✅ Scrollable chat history
- ✅ Active chat highlighting
- ✅ User profile with avatar
- ✅ Settings button (UI)
- ✅ Sign out functionality

#### Usage

```tsx
<Sidebar
  userName="Demo User"
  userEmail="demo@github.com"
  userAvatar="https://..."
  chats={[
    { id: "1", title: "Getting Started" },
    { id: "2", title: "Repository Basics" },
  ]}
  currentChatId="1"
  onNewChat={handleNewChat}
/>
```

#### Styling

- Width: 256px (w-64)
- Background: slate-900
- Fixed height: 100vh
- Dark theme optimized

---

### SidebarMobile

**Location:** `components/sidebar-mobile.tsx`  
**Type:** Client Component

#### Purpose

Mobile-optimized drawer navigation with same functionality as desktop sidebar.

#### Props

```typescript
interface SidebarMobileProps {
  userEmail?: string;
  userName?: string;
  userAvatar?: string;
  chats?: Array<{
    id: string;
    title: string;
  }>;
  currentChatId?: string;
  onNewChat?: () => Promise<void>;
}
```

#### Features

- ✅ Hamburger menu button
- ✅ Slide-out drawer
- ✅ Overlay backdrop
- ✅ Touch-optimized
- ✅ Auto-close on navigation

#### Responsive Behavior

- Visible: < 768px (mobile)
- Hidden: ≥ 768px (desktop)

---

### ChatMessage

**Location:** `components/chat-message.tsx`  
**Type:** Client Component

#### Purpose

Displays individual chat messages with role-based styling.

#### Props

```typescript
interface ChatMessageProps {
  role: "user" | "assistant"; // Message role
  content: string; // Message text
  displayName?: string; // User name to display
}
```

#### Features

- ✅ Role-based styling
- ✅ Avatar display
- ✅ Markdown-ready
- ✅ Copy functionality ready
- ✅ Timestamp display ready

#### Visual Differences

**User Messages:**

- Aligned right
- Blue background
- User avatar

**Assistant Messages:**

- Aligned left
- Dark background
- Bot avatar/icon

#### Usage

```tsx
<ChatMessage
  role="user"
  content="How do I create a repository?"
  displayName="Demo User"
/>

<ChatMessage
  role="assistant"
  content="To create a repository..."
/>
```

---

### ChatInput

**Location:** `components/chat-input.tsx`  
**Type:** Client Component

#### Purpose

Message input field with auto-expanding textarea and send controls.

#### Props

```typescript
interface ChatInputProps {
  onSend: (message: string) => void; // Send handler
  disabled?: boolean; // Loading state
  placeholder?: string; // Input placeholder
}
```

#### Features

- ✅ Auto-expanding textarea (1-8 rows)
- ✅ Enter to send (Shift+Enter for newline)
- ✅ Send button with loading state
- ✅ Attachment button (UI)
- ✅ Character limit handling
- ✅ Disabled state

#### Behavior

```typescript
// Enter sends, Shift+Enter adds newline
handleKeyDown = (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
};

// Auto-resize based on content
useEffect(() => {
  textarea.style.height = `${scrollHeight}px`;
}, [message]);
```

#### Usage

```tsx
<ChatInput
  onSend={handleSendMessage}
  disabled={isLoading}
  placeholder="Ask about your GitHub repositories..."
/>
```

---

### MessageSkeleton

**Location:** `components/message-skeleton.tsx`  
**Type:** Client Component

#### Purpose

Loading placeholder for messages during AI response.

#### Props

None

#### Features

- ✅ Animated skeleton
- ✅ Matches message layout
- ✅ Pulse animation

#### Usage

```tsx
{
  isLoading && <MessageSkeleton />;
}
```

---

### ThemeProvider

**Location:** `components/theme-provider.tsx`  
**Type:** Client Component

#### Purpose

Provides theme context using next-themes.

#### Props

```typescript
interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
}
```

#### Usage

```tsx
<ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
  {children}
</ThemeProvider>
```

---

## UI Components (Radix-based)

Located in `components/ui/` - 50 components from Shadcn/Radix UI.

### Form Components

- `button.tsx` - Button variants
- `input.tsx` - Text input
- `textarea.tsx` - Multi-line input
- `checkbox.tsx` - Checkbox
- `radio-group.tsx` - Radio buttons
- `select.tsx` - Select dropdown
- `slider.tsx` - Range slider
- `switch.tsx` - Toggle switch
- `label.tsx` - Form labels

### Layout Components

- `card.tsx` - Card container
- `separator.tsx` - Divider
- `scroll-area.tsx` - Custom scrollbar
- `aspect-ratio.tsx` - Aspect ratio container
- `resizable.tsx` - Resizable panels

### Overlay Components

- `dialog.tsx` - Modal dialog
- `popover.tsx` - Popover menu
- `dropdown-menu.tsx` - Dropdown actions
- `context-menu.tsx` - Right-click menu
- `hover-card.tsx` - Hover tooltip
- `tooltip.tsx` - Tooltip
- `alert-dialog.tsx` - Confirmation dialog
- `drawer.tsx` - Slide-out drawer

### Navigation Components

- `navigation-menu.tsx` - Nav menu
- `menubar.tsx` - Menu bar
- `tabs.tsx` - Tab navigation
- `accordion.tsx` - Collapsible sections
- `collapsible.tsx` - Expandable content

### Feedback Components

- `toast.tsx` - Toast notifications
- `alert.tsx` - Alert messages
- `progress.tsx` - Progress bar
- `badge.tsx` - Status badges
- `skeleton.tsx` - Loading skeleton

### Display Components

- `avatar.tsx` - User avatar
- `calendar.tsx` - Date picker
- `carousel.tsx` - Image carousel
- `chart.tsx` - Charts/graphs
- `command.tsx` - Command palette
- `table.tsx` - Data table

---

## Custom Hooks

### useChats

**Location:** `hooks/use-chats.ts`

#### Purpose

Manage chat list CRUD operations.

#### API

```typescript
const {
  chats, // Chat[]
  isLoading, // boolean
  error, // string | null
  fetchChats, // () => Promise<void>
  createChat, // (title: string) => Promise<Chat>
  deleteChat, // (chatId: string) => Promise<void>
  updateChat, // (chatId: string, title: string) => Promise<void>
} = useChats();
```

#### Usage

```typescript
const { chats, createChat } = useChats();

const handleNewChat = async () => {
  const chat = await createChat("New Chat");
  router.push(`/chat/${chat.id}`);
};
```

---

### useMessages

**Location:** `hooks/use-messages.ts`

#### Purpose

Manage messages for a specific chat.

#### API

```typescript
const {
  messages, // Message[]
  isLoading, // boolean
  fetchMessages, // () => Promise<void>
  sendMessage, // (content: string, role) => Promise<Message>
} = useMessages(chatId);
```

#### Usage

```typescript
const { messages, sendMessage } = useMessages("chat-123");

await sendMessage("Hello", "user");
await sendMessage("Hi there!", "assistant");
```

---

### useMobile

**Location:** `hooks/use-mobile.tsx`

#### Purpose

Detect mobile viewport.

#### API

```typescript
const isMobile = useMobile(); // boolean
```

#### Breakpoint

640px (sm breakpoint)

---

### useToast

**Location:** `hooks/use-toast.ts`

#### Purpose

Display toast notifications.

#### API

```typescript
const { toast } = useToast();

toast({
  title: "Success",
  description: "Chat created successfully",
});

toast({
  title: "Error",
  description: "Failed to send message",
  variant: "destructive",
});
```

---

## Server Actions

### Authentication Actions

**Location:** `lib/auth.ts`  
**Type:** Server Actions (`'use server'`)

#### signInWithGithub()

```typescript
"use server";
async function signInWithGithub(): Promise<never>;
```

- Sets auth cookie
- Redirects to /chat
- Currently mock implementation

#### signOut()

```typescript
"use server";
async function signOut(): Promise<never>;
```

- Deletes auth cookie
- Redirects to /auth/login

#### getSession()

```typescript
"use server";
async function getSession(): Promise<{ user: User } | null>;
```

- Validates cookie
- Returns user session

#### getUser()

```typescript
"use server";
async function getUser(): Promise<User | null>;
```

- Gets current user
- Returns null if not authenticated

---

## Utility Functions

### cn (classNames)

**Location:** `lib/utils.ts`

#### Purpose

Merge Tailwind classes with conflict resolution.

#### API

```typescript
import { cn } from "@/lib/utils";

cn("px-2 py-1", "px-3"); // 'py-1 px-3'
cn("text-red-500", condition && "text-blue-500");
```

#### Implementation

Uses `clsx` + `tailwind-merge`

---

## Component Best Practices

### 1. Client vs Server Components

- Default: Server Components
- Use `'use client'` for:
  - Event handlers
  - State management
  - Browser APIs
  - Context consumers

### 2. Props Destructuring

```typescript
// ✅ Good
export function Component({ title, onClose }: Props) {
  // ...
}

// ❌ Avoid
export function Component(props: Props) {
  const { title, onClose } = props;
  // ...
}
```

### 3. Event Handlers

```typescript
// Async handlers
const handleAction = async () => {
  try {
    await someAsyncOperation();
  } catch (error) {
    console.error("Failed:", error);
  }
};
```

### 4. Conditional Rendering

```typescript
// Short circuit
{isLoading && <Spinner />}

// Ternary
{isLoading ? <Spinner /> : <Content />}

// Early return
if (!data) return <Empty />
```

### 5. Accessibility

- Use semantic HTML
- Include ARIA labels
- Keyboard navigation support
- Focus management
- Screen reader support
