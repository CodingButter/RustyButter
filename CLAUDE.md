# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RustyButter is a modern web application for Rust gaming servers, built with TypeScript, React, Vite, and Express. It provides a comprehensive website solution including server status monitoring, shop system, user authentication, and admin dashboard.

## Architecture

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express + TypeScript
- **Database**: SQLite with better-sqlite3
- **Styling**: Tailwind CSS v4 with custom theme system
- **Authentication**: JWT tokens with bcrypt password hashing

### Project Structure
```
RustyButter/
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page-level components
│   ├── hooks/             # Custom React hooks
│   ├── contexts/          # React context providers
│   └── types/             # TypeScript type definitions
├── server/                # Backend Express server
│   ├── index.ts          # Main server entry point
│   └── database.cjs      # Database initialization
├── public/               # Static assets
└── dist/                # Production build output
```

## Development Commands

**Install dependencies:**
```bash
pnpm install
```

**Start development:**
```bash
pnpm dev                # Start both frontend and backend
pnpm dev:frontend       # Frontend only (port 3000)
pnpm dev:backend        # Backend only (port 3003)
```

**Build for production:**
```bash
pnpm build
```

**Code quality:**
```bash
pnpm lint              # Run ESLint
pnpm format            # Format with Prettier
pnpm check-types       # TypeScript type checking
```

## Key Features

### Frontend Features
- **Server Status**: Real-time Rust server monitoring via Steam Query
- **Shop System**: Dynamic product catalog with cart and checkout
- **User Authentication**: Registration, login, and profile management
- **Admin Dashboard**: Server configuration, theme editor, user management
- **Theme System**: Database-stored themes with live preview

### Backend Features
- **RESTful API**: Express server with TypeScript
- **JWT Authentication**: Secure token-based auth with role support
- **SQLite Database**: Lightweight database with migrations
- **Server Query**: Integration with steam-server-query package

## Important Conventions

### API Endpoints
- Public: `/api/*` (server status, themes, shop items)
- Protected: `/api/user/*` (requires authentication)
- Admin: `/api/admin/*` (requires admin role)

### Database Schema
- **users**: User accounts with roles
- **themes**: Custom theme configurations
- **shop_items**: Product catalog
- **orders**: Purchase history
- **server_config**: Server settings

### Theme System
Themes use CSS custom properties stored in the database:
- `--color-bg-primary`: Main background
- `--color-accent-primary`: Primary accent color
- `--color-text-base`: Base text color
- And more...

### Environment Variables
Required environment variables (see `.env.example`):
- `SERVER_IP`: Rust server IP
- `SERVER_PORT`: Rust server port
- `JWT_SECRET`: Authentication secret
- `VITE_API_URL`: Backend API URL

## Development Guidelines

1. **Type Safety**: Always use TypeScript types, avoid `any`
2. **Component Structure**: Use functional components with hooks
3. **State Management**: Context API for global state, hooks for local
4. **Error Handling**: Silent error handling in production
5. **Code Style**: Follow ESLint and Prettier configurations

## Common Tasks

### Adding a New Page
1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Update navigation if needed

### Adding API Endpoint
1. Add route handler in `server/index.ts`
2. Use appropriate middleware (auth, admin)
3. Update TypeScript types

### Modifying Database
1. Update schema in `server/database.cjs`
2. Handle migrations if needed
3. Update related API endpoints

### Creating a Theme
1. Use admin dashboard theme editor
2. Set CSS variable values
3. Test with live preview
4. Save to database

## Deployment Notes

- Frontend builds to `dist/` directory
- Backend compiles TypeScript to JavaScript
- Database file is created automatically
- Ensure environment variables are set
- Use PM2 or similar for process management