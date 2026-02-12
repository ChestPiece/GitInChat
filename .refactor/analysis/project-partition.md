# Phase 0: Project Partition

## 0.1 Domain Division

### Frontend Domain

- **Pages & Routing**: `app/` (Next.js App Router)
  - `app/chat/`: Chat interface
  - `app/api/`: API Routes
- **UI Components**: `components/`
  - `components/ui/`: Reusable UI components (shadcn/ui)
  - `components/`: Feature-specific components (e.g., `chat-input.tsx`, `sidebar.tsx`)

### Backend/Service Domain

- **AI Services**: `lib/ai/` (AI SDK integration, tools)
- **GitHub Services**: `lib/github/`
- **Supabase Services**: `lib/supabase/`
- **Authentication**: `lib/auth.ts`, `app/auth/`

### Shared/Common Domain

- **Utilities**: `lib/utils.ts`
- **Configuration**: `tailwind.config.ts`, `next.config.mjs`

## 0.2 Resource Inventory

### UI Layer Resources

| Resource Type     | Location                                 | Implementation | Description                                                             |
| ----------------- | ---------------------------------------- | -------------- | ----------------------------------------------------------------------- |
| Component Library | `components/ui/`                         | shadcn/ui      | Comprehensive set of accessible components (Button, Card, Dialog, etc.) |
| Icons             | `lucide-react`                           | External Lib   | Used throughout (implied by shadcn/ui)                                  |
| Theme System      | `components/theme-provider.tsx`          | next-themes    | Dark/Light mode support                                                 |
| Toast System      | `components/ui/toast.tsx`, `toaster.tsx` | shadcn/ui      | Notification system                                                     |
| Sidebar           | `components/ui/sidebar.tsx`              | Custom/shadcn  | App sidebar implementation                                              |

### Utility Layer Resources

| Resource Type | Location       | Exports | Description                                   |
| ------------- | -------------- | ------- | --------------------------------------------- |
| Class Merging | `lib/utils.ts` | `cn`    | Tailwind class merger (clsx + tailwind-merge) |

### Service Layer Resources (Preliminary)

| Resource Type    | Location        | Description             |
| ---------------- | --------------- | ----------------------- |
| AI Logic         | `lib/ai/`       | Core AI functionality   |
| GitHub Logic     | `lib/github/`   | GitHub API interactions |
| Data Persistence | `lib/supabase/` | Database interactions   |
| Auth             | `lib/auth.ts`   | Authentication logic    |

### Infrastructure

| System        | Implementation              | Location                            |
| ------------- | --------------------------- | ----------------------------------- |
| Routing       | Next.js App Router          | `app/`                              |
| Styling       | Tailwind CSS                | `globals.css`, `tailwind.config.ts` |
| Data Fetching | Server Components / Actions | `app/`, `lib/`                      |
