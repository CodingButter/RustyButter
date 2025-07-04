import { useState } from 'react'
import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { AdminOverview } from '@/components/admin/AdminOverview'
import { ThemeEditor } from '@/components/admin/ThemeEditor'
import { ServerConfig } from '@/components/admin/ServerConfig'
import { RconConsole } from '@/components/admin/RconConsole'
import { UserManagement } from '@/components/admin/UserManagement'

export function AdminDashboard() {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navItems = [
    { path: 'overview', label: 'Overview', icon: '📊' },
    { path: 'themes', label: 'Theme Editor', icon: '🎨' },
    { path: 'server', label: 'Server Config', icon: '⚙️' },
    { path: 'rcon', label: 'RCON Console', icon: '🖥️' },
    { path: 'users', label: 'User Management', icon: '👥' }
  ]

  return (
    <div className="min-h-screen bg-primary flex">
      {/* Sidebar */}
      <aside className={`${
        sidebarOpen ? 'w-64' : 'w-16'
      } bg-surface-card border-r border-white/10 transition-all duration-300 relative flex flex-col`}>
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className={`font-bold text-xl text-heading ${
              sidebarOpen ? 'block' : 'hidden'
            }`}>
              Admin Panel
            </h2>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <svg className="w-5 h-5 text-body" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d={sidebarOpen ? "M11 19l-7-7 7-7" : "M13 5l7 7-7 7"} />
              </svg>
            </button>
          </div>

          {/* User Info */}
          <div className={`mb-8 p-3 bg-accent-primary/10 rounded-lg ${
            sidebarOpen ? 'block' : 'hidden'
          }`}>
            <div className="text-sm text-muted">Logged in as</div>
            <div className="font-semibold text-heading">{user?.username}</div>
            <div className="text-xs text-accent-primary">Administrator</div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={`/admin/${item.path}`}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2 rounded-lg transition-all
                  ${isActive 
                    ? 'bg-accent-primary/20 text-accent-primary border-l-4 border-accent-primary' 
                    : 'text-body hover:bg-white/10 hover:text-accent-primary'
                  }
                `}
              >
                <span className="text-xl">{item.icon}</span>
                <span className={`font-medium ${sidebarOpen ? 'block' : 'hidden'}`}>
                  {item.label}
                </span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Exit Button - Fixed at bottom */}
        <div className="p-4 border-t border-white/10">
          <a
            href="/"
            className={`flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors ${
              sidebarOpen ? 'w-full' : 'w-8 h-8 p-0'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className={`${sidebarOpen ? 'block' : 'hidden'}`}>Exit Admin</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="p-8 flex-1 flex flex-col min-h-0">
          <Routes>
            <Route path="/" element={<Navigate to="/admin/overview" replace />} />
            <Route path="/overview" element={<AdminOverview />} />
            <Route path="/themes" element={<ThemeEditor />} />
            <Route path="/server" element={<ServerConfig />} />
            <Route path="/rcon" element={<RconConsole />} />
            <Route path="/users" element={<UserManagement />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}