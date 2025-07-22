# AGENTS.md - Development Guidelines for MVT (Veteran Mentorship Platform)

## Build/Test Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm test` - Run tests
- `npm test -- --watch` - Run tests in watch mode
- `npx convex dev` - Start Convex development server

## Code Style Guidelines

### TypeScript
- Use TypeScript for all files (.ts/.tsx)
- Define interfaces for all data structures
- Use strict type checking
- Prefer `interface` over `type` for object shapes

### Imports
- Use absolute imports from `@/` for app directory
- Group imports: external libraries, internal modules, relative imports
- Use named imports when possible

### Components
- Use functional components with hooks
- Follow PascalCase for component names
- Use `use client` directive for client components
- Keep server components as default

### Styling
- Use Tailwind CSS v4 classes
- Prefer utility classes over custom CSS
- Use responsive design patterns (mobile-first)

### Error Handling
- Use try-catch blocks for async operations
- Implement proper error boundaries
- Return meaningful error messages
- Log errors appropriately

### Convex Integration
- Use Convex queries/mutations for data operations
- Follow Convex naming conventions
- Implement proper authentication checks
- Use real-time subscriptions where appropriate