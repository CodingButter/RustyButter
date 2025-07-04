# Rusty Butter

A modern web application for the Rusty Butter Rust gaming server, built with Vite, React, TypeScript, and Express.

## Features

- 🎨 **Dynamic Theme System** - Switch between Organic, Organic Light, and Organic Dark themes
- 🎮 **Real-time Server Status** - Live player count and server information
- 🚀 **Modern Stack** - Vite + React + TypeScript + Express
- 📱 **Responsive Design** - Mobile-first approach with Tailwind CSS
- ⚡ **Fast Development** - Hot reload for both frontend and backend

## Tech Stack

### Frontend
- **Vite** - Fast build tool and dev server
- **React 18** - UI framework with hooks
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Custom Theme System** - CSS custom properties

### Backend
- **Express** - Node.js web framework
- **TypeScript** - Type safety
- **steam-server-query** - Rust server integration
- **CORS** - Cross-origin resource sharing

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd RustyButter
```

2. Install dependencies:
```bash
npm install
```

3. Start development servers:
```bash
npm run dev
```

This starts both the frontend (http://localhost:3000) and backend (http://localhost:3001) concurrently.

### Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:frontend` - Start only the frontend dev server
- `npm run dev:backend` - Start only the backend dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once

## Project Structure

```
src/
├── components/          # React components
│   ├── Hero.tsx        # Main hero section
│   ├── ThemeProvider.tsx # Theme context provider
│   └── ThemeSelect.tsx # Theme selection dropdown
├── hooks/              # Custom React hooks
│   └── useTheme.ts     # Theme management hook
├── styles/             # CSS and styling
│   └── globals.css     # Global styles and theme definitions
├── test/               # Test utilities
└── main.tsx           # App entry point

server/
└── index.ts           # Express server

```

## API Endpoints

- `GET /api/health` - Server health check
- `GET /api/server/status` - Rust server status and player information

## Theme System

The application features a custom theme system with three variants:

- **Organic Light** - Light theme with warm colors (default)
- **Organic** - Base theme with beige/brown palette
- **Organic Dark** - Dark theme with green/brown backgrounds

Themes use CSS custom properties for dynamic switching without page reloads.

## Development

### Frontend Development
The frontend runs on Vite with hot reload. Changes to React components are reflected immediately.

### Backend Development  
The backend uses `tsx watch` for automatic restart on file changes. API changes are reflected immediately.

### Adding New Components
1. Create component in `src/components/`
2. Export from component file
3. Import and use in other components
4. Add tests if needed

### Modifying Themes
Edit the CSS custom properties in `src/styles/globals.css` to modify theme colors.

## Deployment

1. Build the application:
```bash
npm run build
```

2. The frontend builds to `dist/client/` and backend to `dist/server/`

3. Deploy both directories to your hosting provider

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details