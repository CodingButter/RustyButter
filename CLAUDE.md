# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RustyButter is a TypeScript/React web application for a Rust gaming server, built as a monorepo using Turborepo with pnpm workspaces. Despite the name, this is not a Rust codebase but a modern web application that provides server information and connectivity for a Rust game server.

## Development Commands

**Start development servers:**
```bash
pnpm dev
```

**Build all packages:**
```bash
pnpm build
```

**Lint all packages:**
```bash
pnpm lint
```

**Type checking:**
```bash
pnpm check-types
```

**Format code:**
```bash
pnpm format
```

**Install dependencies:**
```bash
pnpm install
```

## Architecture

### Monorepo Structure
- **Turborepo** manages the monorepo with build caching and parallel execution
- **pnpm workspaces** handle dependency management
- **Apps**: `web` (main site, port 3000) and `docs` (documentation, port 3001)
- **Packages**: Shared configurations and UI components

### Key Applications
- **`apps/web`**: Main Rust server website with Steam server query integration
- **`apps/docs`**: Documentation site (minimal implementation)

### Shared Packages
- **`@repo/ui`**: Shared React components with Tailwind CSS
- **`@repo/eslint-config`**: ESLint configurations for Next.js and React
- **`@repo/tailwind-config`**: Shared Tailwind CSS configurations
- **`@repo/typescript-config`**: TypeScript configurations

### Technology Stack
- **Frontend**: Next.js 15.3.0 with App Router, React 19.1.0
- **Styling**: Tailwind CSS v4.1.5 with custom "organic" theme system
- **Server Query**: `steam-server-query` package for Rust server at `23.136.68.2:28017`
- **Package Manager**: pnpm v8.15.6
- **Node**: >= 18

## Key Features

### Steam Server Integration
- Real-time server status via Steam Server Query API
- Server info endpoint: `/apps/web/src/app/api/server/route.ts`
- Queries Rust server for player count, status, and connection details

### Custom Theming
- "Organic" theme variants using CSS custom properties
- Theme system defined in shared Tailwind configuration
- Mobile-first responsive design approach

## Important Notes

- **No testing framework** is currently configured
- **No CI/CD pipeline** exists yet
- The project uses **Next.js App Router** (not Pages Router)
- All shared configurations are centralized in the `packages/` directory
- Dependencies are managed at the workspace level with pnpm