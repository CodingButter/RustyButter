import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './components/ThemeProvider'
import { AuthProvider } from './components/AuthProvider'
import { ShopProvider } from './components/ShopProvider'
import { ModalProvider } from './contexts/ModalContext'
import { ModalRenderer } from './components/ModalRenderer'
import { Navigation } from './components/Navigation'
import { Hero } from './components/Hero'
import { ServerInfo } from './components/ServerInfo'
import { ServerMap } from './components/ServerMap'
import { Rules } from './components/Rules'
import { Discord } from './components/Discord'
import { Shop } from './components/Shop'
import { SectionArrows } from './components/SectionArrows'
import { useActiveSection } from './hooks/useActiveSection'
import { AdminDashboard } from './pages/AdminDashboard'
import { AdminLogin } from './pages/AdminLogin'
import { ProtectedRoute } from './components/ProtectedRoute'
import './styles/globals.css'

function HomePage() {
  const activeSection = useActiveSection()

  return (
    <div className="min-h-screen">
      <Navigation />
      <SectionArrows currentSection={activeSection} />
      <main className="pt-16">
        <section id="home">
          <Hero />
        </section>
        <section id="server-info">
          <ServerInfo />
        </section>
        <section id="map">
          <ServerMap />
        </section>
        <section id="rules">
          <Rules />
        </section>
        <section id="discord">
          <Discord />
        </section>
        <section id="shop">
          <Shop />
        </section>
      </main>
      <footer className="bg-surface-card p-4 text-center border-t border-muted">
        <p className="text-sm text-theme-base">© 2024 Rusty Butter</p>
      </footer>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ShopProvider>
            <ModalProvider>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route 
                  path="/admin/*" 
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <ModalRenderer />
            </ModalProvider>
          </ShopProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
