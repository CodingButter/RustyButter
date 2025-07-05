# RustyButter

<div align="center">
  <img src="/public/images/icon.png" alt="RustyButter Logo" width="128" height="128">
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.2%2B-blue)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-18.2%2B-61dafb)](https://reactjs.org/)
  
  **A modern web application for Rust gaming servers**
  
  RustyButter provides a feature-rich website for your Rust gaming server, complete with server status monitoring, dynamic shop system, admin dashboard, and customizable themes.
</div>

## 🚀 Features

### For Players
- **Real-time Server Status** - Live player count, server info, and connection details via Steam Server Query
- **Interactive Map** - Visual server map with grid navigation
- **Dynamic Shop System** - Purchase in-game items with cart functionality and order history
- **User Accounts** - Registration, authentication, and profile management
- **Discord Integration** - Easy community access
- **Theme Selection** - Multiple visual themes to choose from

### For Administrators
- **Admin Dashboard** - Comprehensive server management interface
- **Server Configuration** - Edit server settings without code changes
- **Theme Editor** - Create and customize themes with live preview
- **User Management** - View and manage registered users
- **RCON Integration** - Execute server commands from the web interface
- **Shop Management** - Control available items and pricing

## 📋 Prerequisites

- **Node.js** 18.0 or higher
- **pnpm** 8.0 or higher (recommended) or npm
- **SQLite** (comes bundled with better-sqlite3)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/CodingButter/RustyButter.git
cd RustyButter
```

### 2. Install Dependencies

Using pnpm (recommended):
```bash
pnpm install
```

Using npm:
```bash
npm install
```

### 3. Configure Environment

Create a `.env` file in the root directory:

```env
# Server Configuration
SERVER_IP=23.136.68.2
SERVER_PORT=28017
QUERY_PORT=28017

# API Configuration
API_PORT=3003
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend Configuration
VITE_API_URL=http://localhost:3003

# Database
DATABASE_PATH=./database.sqlite

# Admin Credentials (first run only)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### 4. Start Development Server

```bash
pnpm dev
```

This will start:
- Frontend development server at `http://localhost:3000`
- Backend API server at `http://localhost:3003`

## 🏗️ Project Structure

```
RustyButter/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   │   ├── admin/         # Admin dashboard components
│   │   └── ...            # Other UI components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   ├── types/             # TypeScript type definitions
│   └── styles/            # CSS and styling
├── server/                # Backend source code
│   ├── index.ts          # Express server entry point
│   └── database.cjs      # Database initialization
├── public/               # Static assets
└── dist/                # Build output (generated)
```

## 🔧 Configuration

### Server Settings

Server configuration can be managed through:
1. **Environment Variables** - Initial setup
2. **Admin Dashboard** - Runtime changes at `/admin/server-config`

### Database

The application uses SQLite for data storage. The database is automatically created on first run with:
- Default admin user
- Initial server configuration
- Sample shop items
- Default themes

### Themes

Themes are stored in the database and can be:
- Created and edited via the admin dashboard
- Applied site-wide instantly
- Customized with CSS variables

## 📝 Scripts

```bash
# Development
pnpm dev              # Start development servers
pnpm dev:frontend     # Start only frontend
pnpm dev:backend      # Start only backend

# Production
pnpm build           # Build for production
pnpm preview         # Preview production build

# Code Quality
pnpm lint            # Run ESLint
pnpm format          # Format code with Prettier
pnpm check-types     # TypeScript type checking
```

## 🚀 Deployment

### Build for Production

```bash
pnpm build
```

This creates:
- `dist/` - Frontend static files
- `server/` - Compiled backend code

### Environment Variables

For production, ensure you set:
- Strong `JWT_SECRET`
- Correct `SERVER_IP` and ports
- Appropriate `API_PORT`
- Production `VITE_API_URL`

### Serving the Application

1. **Frontend**: Serve the `dist/` directory with any static file server (Nginx, Apache, etc.)
2. **Backend**: Run the compiled server with `node server/index.js`

### Using PM2 (Recommended)

```bash
# Install PM2
npm install -g pm2

# Start the application
pm2 start server/index.js --name rustybutter-api

# Save PM2 configuration
pm2 save
pm2 startup
```

## 🔌 API Documentation

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/server` | Get server status and info |
| GET | `/api/themes` | Get available themes |
| GET | `/api/shop/items` | Get shop items |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration |

### Protected Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get user profile |
| PUT | `/api/user/profile` | Update user profile |
| POST | `/api/shop/checkout` | Process order |
| GET | `/api/user/orders` | Get order history |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/*` | Various admin operations |
| POST | `/api/admin/themes` | Create theme |
| PUT | `/api/admin/themes/:id` | Update theme |
| DELETE | `/api/admin/themes/:id` | Delete theme |

## 🎨 Customization

### Adding Shop Items

Shop items can be added through the database or admin interface:

```javascript
{
  name: "Item Name",
  slug: "item-slug",
  description: "Item description",
  price: 100,
  currency: "scrap",
  images: ["url1", "url2"],
  category: "weapons",
  inStock: true
}
```

### Creating Themes

Themes use CSS custom properties:

```css
--color-bg-primary: #fae8c0;
--color-bg-secondary: #e2cab7;
--color-accent-primary: #679a4b;
--color-accent-secondary: #8fc370;
--color-text-base: #2a1f0a;
--color-button-bg: #679a4b;
--color-button-hover: #4a7c2e;
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/) and [Vite](https://vitejs.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Server query powered by [steam-server-query](https://www.npmjs.com/package/steam-server-query)
- Icons and assets from the Rust gaming community

## 📞 Support

For support, issues, or feature requests, please use the [GitHub Issues](https://github.com/CodingButter/RustyButter/issues) page.

---

<div align="center">
  Made with ❤️ for the Rust gaming community
</div>