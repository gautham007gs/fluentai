# FluentAI - Language Learning Chat Application

## Overview

FluentAI is an AI-powered language learning chat application that helps users learn new languages through conversational practice. Users select their native language and target language, then engage in chat conversations where:

1. User messages in their native language are translated to the target language
2. AI responds in the target language with translations back to the user's native language
3. Conversations are persisted and organized in a dashboard

The application uses Replit Auth for user authentication and OpenAI for translations and conversational AI.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Animations**: Framer Motion for page transitions and message animations
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite

**Key Design Patterns**:
- Protected routes redirect unauthenticated users to landing page
- Custom hooks encapsulate API calls (`use-auth`, `use-conversations`)
- Layout component provides consistent sidebar navigation
- API routes defined in shared module for type-safe client/server communication

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Pattern**: RESTful JSON API with Zod schema validation
- **Session Management**: Express sessions with PostgreSQL store

**Route Structure**:
- `/api/auth/*` - Authentication endpoints (Replit Auth)
- `/api/conversations` - CRUD for chat conversations
- `/api/conversations/:id/messages` - Message operations with AI translation

### Data Storage
- **Database**: PostgreSQL via Drizzle ORM
- **Schema Location**: `shared/schema.ts` (exports from `shared/models/`)
- **Migrations**: Drizzle Kit (`npm run db:push`)

**Core Tables**:
- `users` - User profiles from Replit Auth
- `sessions` - Session storage for authentication
- `conversations` - Chat conversations with language pairs
- `messages` - Individual messages with native/target language content

### Authentication
- **Provider**: Replit Auth (OpenID Connect)
- **Session Storage**: PostgreSQL via connect-pg-simple
- **Pattern**: Passport.js with OIDC strategy

### AI Integration
- **Provider**: OpenAI via Replit AI Integrations
- **Use Cases**: Language translation, conversational responses
- **Configuration**: Environment variables `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL`

### Build and Development
- **Development**: `npm run dev` - Vite dev server with HMR
- **Production Build**: `npm run build` - Vite for client, esbuild for server
- **Type Checking**: `npm run check`

## External Dependencies

### Database
- **PostgreSQL**: Required, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Schema definition and query building

### Authentication
- **Replit Auth**: OpenID Connect provider
- **Required Secrets**: `SESSION_SECRET`, `REPL_ID`, `ISSUER_URL`

### AI Services
- **OpenAI API**: Via Replit AI Integrations proxy
- **Required Secrets**: `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`

### UI Component Library
- **shadcn/ui**: Pre-built accessible components using Radix UI primitives
- **Configuration**: `components.json` defines aliases and styling preferences

### Key NPM Packages
- `@tanstack/react-query` - Data fetching and caching
- `drizzle-orm` / `drizzle-zod` - Database ORM with Zod schema generation
- `passport` / `openid-client` - Authentication
- `framer-motion` - Animations
- `date-fns` - Date formatting