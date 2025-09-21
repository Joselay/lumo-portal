# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lumo Portal is a Next.js 15 application using React 19, TypeScript, and Tailwind CSS. It's a dashboard application with authentication pages (login/register) and a main dashboard with data visualization components. The app uses the App Router pattern and server components.

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application with Turbopack
- `npm run start` - Start production server
- `npm run lint` - Run Biome linter and check code quality
- `npm run format` - Format code using Biome

## Architecture & Structure

### Key Directories
- `src/app/` - Next.js App Router pages (dashboard, login, register)
- `src/components/` - Reusable React components
- `src/components/ui/` - shadcn/ui components
- `src/lib/` - Utility functions (primarily `utils.ts` with `cn` helper)
- `src/hooks/` - Custom React hooks
- `src/api/` - API layer with authentication endpoints
- `src/types/` - TypeScript type definitions

### Core Dependencies
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables theming
- **Icons**: Tabler Icons and Lucide React
- **Data Visualization**: Recharts
- **Drag & Drop**: @dnd-kit libraries
- **Theming**: next-themes with system/dark/light modes
- **Tables**: @tanstack/react-table
- **Notifications**: Sonner toasts
- **Validation**: Zod
- **State Management**: @tanstack/react-query for server state
- **Drawer Component**: vaul for mobile-friendly drawers

### Important Configuration
- **Linting/Formatting**: Uses Biome (not ESLint/Prettier)
- **Theming**: Configured for system/dark/light themes via ThemeProvider
- **Path Aliases**: `@/*` maps to `src/*`
- **shadcn/ui**: Configured with "new-york" style, CSS variables, and custom Acme registry

### Authentication Architecture
- **Token Management**: Dual storage system using both localStorage and cookies
- **Cookie Strategy**: Uses modern Cookie Store API with document.cookie fallback
- **API Layer**: Centralized API client in `src/lib/api.ts` with automatic Bearer token injection
- **Auth Utilities**: Authentication helpers in `src/lib/auth.ts` for token management
- **Backend Integration**: Connects to external API via `NEXT_PUBLIC_BACKEND_URL` environment variable

### Application Flow
- Root page (`/`) redirects to `/dashboard`
- Dashboard uses SidebarProvider layout with AppSidebar and main content area
- Authentication pages available at `/login` and `/register`
- All pages wrapped in ThemeProvider for consistent theming

### Component Patterns
- Uses shadcn/ui component library extensively
- Custom components follow naming convention: kebab-case files, PascalCase exports
- Tailwind CSS with `cn()` utility function for conditional classes
- TypeScript strict mode enabled with proper type definitions

## Development Notes

### Code Quality & Formatting
- Always use Biome for linting/formatting (not ESLint/Prettier)
- Biome config includes Next.js and React domain rules
- Automatic import organization enabled via Biome assist actions

### UI Development
- Follow shadcn/ui patterns for new UI components
- Use the `cn()` utility from `@/lib/utils` for conditional styling
- Leverage existing Radix UI components and patterns
- Maintain the established theming system using CSS variables

### Environment Setup
- Requires `NEXT_PUBLIC_BACKEND_URL` environment variable for API connections
- Uses Turbopack for faster development and build times