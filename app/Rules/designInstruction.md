# Project Instructions for AI Editor

## Tech Stack Requirements
- **Framework**: Next.js (latest stable version)
- **Database/Backend**: Supabase
- **UI Components**: shadcn/ui (strictly required - no other component libraries)
- **Styling**: Tailwind CSS (via shadcn)

## Code Quality Standards

### Design & UX
- Modern, clean, and professional interface design
- User-friendly and intuitive interactions
- Smooth animations and transitions (no glitchy behavior)
- Responsive design across all device sizes
- Consistent design system following shadcn patterns

### Code Quality
- **Zero tolerance policy**: No linting errors, no TypeScript errors
- Follow Next.js best practices (App Router conventions, server/client components)
- Proper code structure with clear separation of concerns
- Implement proper refactoring for maintainability
- Use TypeScript strictly with proper typing
- Follow React and Next.js performance best practices

### Project Structure
- Organize code into logical, well-named directories
- Separate concerns: components, utilities, hooks, types, services
- Keep components small and reusable
- Use proper naming conventions (PascalCase for components, camelCase for functions)

## Workflow Requirements

### User Communication
- **Always clarify user intent before proceeding** with implementation
- Ask for user preferences and choices when multiple approaches exist
- Provide clear explanations of what you're building and why
- Don't make assumptions - confirm requirements first
- Avoid vague or incomplete responses

### Version Control & Git Management

#### Branch Strategy
- **Never commit directly to `main` branch**
- Create feature branches following naming convention: `feature/description` or `fix/description`
- Keep branches focused on single features or fixes
- Delete branches after successful merge

#### Commit Standards
- Make atomic commits (one logical change per commit)
- Write clear, descriptive commit messages following conventional commits:
  - `feat: add user authentication with Supabase`
  - `fix: resolve TypeScript error in ProfileCard component`
  - `refactor: optimize database queries for better performance`
  - `style: update button styling to match design system`
  - `docs: add API documentation`

#### Performance Tracking
- Monitor and report on:
  - Build time and bundle size
  - TypeScript compilation errors
  - Linting issues
  - Page load performance metrics
  - Database query performance
- Flag any performance regressions before committing

#### Merge & Deployment Process
1. Complete feature implementation on feature branch
2. Run all checks (lint, type-check, build)
3. **Request user permission before merging** with summary of changes
4. After user approval:
   - Merge feature branch into `main`
   - Push changes to remote
   - Delete feature branch
5. Report merge status and next steps

### Permission Requirements
- **Always require explicit user permission for**:
  - Merging branches to `main`
  - Pushing code to remote repository
  - Deleting branches
  - Making breaking changes
  - Modifying configuration files

## Performance & Optimization
- Implement proper code splitting
- Optimize images and assets
- Use Supabase edge functions where appropriate
- Implement proper caching strategies
- Monitor and optimize Core Web Vitals

## Error Handling
- Implement comprehensive error boundaries
- Provide meaningful error messages to users
- Log errors appropriately for debugging
- Handle loading and error states gracefully

## Before Starting Any Task
1. Understand the full scope and user requirements
2. Clarify any ambiguities
3. Propose an implementation approach
4. Get user confirmation
5. Create appropriate feature branch
6. Proceed with implementation