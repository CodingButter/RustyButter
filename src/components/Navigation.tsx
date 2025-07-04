import { useState, useEffect } from 'react'
import { ThemeSelect } from './ThemeSelect'
import { AuthModalContent } from './AuthModalContent'
import { OrderHistoryModalContent } from './OrderHistoryModalContent'
import { AccountSettingsModalContent } from './AccountSettingsModalContent'
import { useShop } from '@/hooks/useShop'
import { useAuth } from '@/hooks/useAuth'
import { useModal } from '@/hooks/useModal'

export const Navigation: React.FC = () => {
  const [activeSection, setActiveSection] = useState('home')
  const [isDarkBackground, setIsDarkBackground] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { getCartItemCount, toggleCart } = useShop()
  const { user, isAuthenticated, logout } = useAuth()
  const { openModal, closeModal } = useModal()

  const scrollToSection = (sectionId: string) => {
    // Update URL hash
    window.history.pushState(null, '', `#${sectionId}`)
    
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  // Handle initial hash on page load
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    if (hash) {
      const element = document.getElementById(hash)
      if (element) {
        // Small delay to ensure page is loaded
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
          setActiveSection(hash)
        }, 100)
      }
    }
  }, [])

  // Handle hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1)
      if (hash) {
        const element = document.getElementById(hash)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
          setActiveSection(hash)
        }
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'server-info', 'map', 'rules', 'discord', 'shop']
      const scrollPosition = window.scrollY + 100

      // Determine if background is dark based on what's directly behind the nav
      const currentScrollY = window.scrollY
      
      // Check which section the nav is currently over
      let isDark = false
      
      // At the very top (scroll position 0-100), use dark text on light nav background
      if (currentScrollY <= 100) {
        isDark = false
      }
      // Hero section middle/bottom (dark background behind nav)
      else {
        const heroSection = document.getElementById('home')
        if (heroSection && currentScrollY > 100 && currentScrollY < heroSection.offsetHeight) {
          isDark = true
        }
      }
      
      // Rules section (dark background) 
      const rulesSection = document.getElementById('rules')
      if (rulesSection && currentScrollY >= rulesSection.offsetTop - 100 && currentScrollY < rulesSection.offsetTop + rulesSection.offsetHeight - 100) {
        isDark = true
      }
      
      // All other sections have light backgrounds
      const serverInfoSection = document.getElementById('server-info')
      const mapSection = document.getElementById('map')
      const discordSection = document.getElementById('discord')
      const shopSection = document.getElementById('shop')
      
      if (
        (serverInfoSection && currentScrollY >= serverInfoSection.offsetTop - 100 && currentScrollY < serverInfoSection.offsetTop + serverInfoSection.offsetHeight - 100) ||
        (mapSection && currentScrollY >= mapSection.offsetTop - 100 && currentScrollY < mapSection.offsetTop + mapSection.offsetHeight - 100) ||
        (discordSection && currentScrollY >= discordSection.offsetTop - 100 && currentScrollY < discordSection.offsetTop + discordSection.offsetHeight - 100) ||
        (shopSection && currentScrollY >= shopSection.offsetTop - 100 && currentScrollY < shopSection.offsetTop + shopSection.offsetHeight - 100)
      ) {
        isDark = false
      }
      
      setIsDarkBackground(isDark)

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          // Account for navbar height (4rem = 64px)
          const navbarHeight = 64
          const offsetTop = element.offsetTop - navbarHeight
          const offsetBottom = offsetTop + element.offsetHeight

          // Check if we're in this section (with some tolerance)
          if (scrollPosition >= offsetTop - 10 && scrollPosition < offsetBottom) {
            setActiveSection(section)
            // Update URL hash without triggering scroll
            if (window.location.hash !== `#${section}`) {
              window.history.replaceState(null, '', `#${section}`)
            }
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'server-info', label: 'Server Info' },
    { id: 'map', label: 'Map' },
    { id: 'rules', label: 'Rules' },
    { id: 'discord', label: 'Discord' },
    { id: 'shop', label: 'Shop' }
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b shadow-sm"
         style={{ 
           background: 'var(--color-overlay)',
           borderColor: 'var(--color-border-muted)',
           boxShadow: '0 2px 20px var(--color-shadow)'
         }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <button onClick={() => scrollToSection('home')}>
                <img className="h-8 w-8 object-contain" src="/images/icon.png" alt="RustyButter" />
              </button>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all hover:scale-105 ${
                      activeSection === item.id
                        ? '' 
                        : ''
                    }`}
                    style={{
                      color: activeSection === item.id 
                        ? 'var(--color-accent-primary)' 
                        : isDarkBackground ? '#ffffff' : 'var(--color-text-body)',
                      background: activeSection === item.id ? 'var(--color-overlay)' : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (activeSection !== item.id) {
                        e.currentTarget.style.color = 'var(--color-accent-primary)'
                        e.currentTarget.style.background = 'var(--color-overlay)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeSection !== item.id) {
                        e.currentTarget.style.color = isDarkBackground ? '#ffffff' : 'var(--color-text-body)'
                        e.currentTarget.style.background = 'transparent'
                      }
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6 gap-4">
              <button
                onClick={toggleCart}
                className="relative p-2 rounded-lg transition-all hover:scale-110"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-overlay)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <svg 
                  className={`w-6 h-6 ${isDarkBackground ? 'text-white' : 'text-gray-700'} hover:text-accent-primary transition-colors`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13v8a2 2 0 002 2h6a2 2 0 002-2v-8" />
                </svg>
                {getCartItemCount() > 0 && (
                  <span className="absolute -top-1 -right-1 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                        style={{
                          background: 'var(--color-button-bg)',
                          color: 'var(--color-button-text)'
                        }}>
                    {getCartItemCount()}
                  </span>
                )}
              </button>
              
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:scale-105`}
                    style={{
                      color: isDarkBackground ? '#ffffff' : 'var(--color-text-body)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--color-overlay)'
                      e.currentTarget.style.color = 'var(--color-accent-primary)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                      e.currentTarget.style.color = isDarkBackground ? '#ffffff' : 'var(--color-text-body)'
                    }}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">{user?.username}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 border rounded-lg shadow-2xl z-50"
                         style={{ 
                           background: 'var(--color-bg-primary)',
                           borderColor: 'var(--color-border-muted)',
                           boxShadow: '0 10px 30px var(--color-shadow)'
                         }}>
                      <div className="py-2">
                        <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--color-border-muted)' }}>
                          <p className="text-sm text-heading font-medium">{user?.username}</p>
                          <p className="text-xs text-muted">{user?.email}</p>
                          {user?.vipStatus && (
                            <span className="inline-block mt-1 px-2 py-1 text-xs rounded"
                                  style={{
                                    background: 'var(--color-overlay)',
                                    color: 'var(--color-accent-primary)'
                                  }}>
                              VIP
                            </span>
                          )}
                        </div>
                        {user?.role === 'admin' && (
                          <a
                            href="/admin"
                            className="block w-full text-left px-4 py-2 text-sm font-medium transition-all"
                            style={{
                              background: 'var(--color-accent-primary)',
                              color: 'var(--color-button-text)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'var(--color-button-hover)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'var(--color-accent-primary)'
                            }}
                          >
                            👑 Admin Dashboard
                          </a>
                        )}
                        <button 
                          onClick={() => {
                            openModal({
                              id: 'order-history',
                              component: <OrderHistoryModalContent onClose={closeModal} />,
                              onClose: closeModal
                            })
                            setUserMenuOpen(false)
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-body transition-all"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--color-overlay)'
                            e.currentTarget.style.color = 'var(--color-accent-primary)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent'
                            e.currentTarget.style.color = 'var(--color-text-body)'
                          }}
                        >
                          Order History
                        </button>
                        <button 
                          onClick={() => {
                            openModal({
                              id: 'account-settings',
                              component: <AccountSettingsModalContent onClose={closeModal} />,
                              onClose: closeModal
                            })
                            setUserMenuOpen(false)
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-body transition-all"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--color-overlay)'
                            e.currentTarget.style.color = 'var(--color-accent-primary)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent'
                            e.currentTarget.style.color = 'var(--color-text-body)'
                          }}
                        >
                          Account Settings
                        </button>
                        <div className="border-t mt-2" style={{ borderColor: 'var(--color-border-muted)' }}>
                          <button 
                            onClick={() => {
                              logout()
                              setUserMenuOpen(false)
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-400 transition-all"
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'var(--color-overlay)'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent'
                            }}
                          >
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      openModal({
                        id: 'auth-login',
                        component: <AuthModalContent initialMode="login" onClose={closeModal} />,
                        onClose: closeModal
                      })
                    }}
                    className="px-3 py-2 text-sm font-medium rounded-lg transition-all hover:scale-105"
                    style={{
                      color: isDarkBackground ? '#ffffff' : 'var(--color-text-body)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--color-accent-primary)'
                      e.currentTarget.style.background = 'var(--color-overlay)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = isDarkBackground ? '#ffffff' : 'var(--color-text-body)'
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      openModal({
                        id: 'auth-register',
                        component: <AuthModalContent initialMode="register" onClose={closeModal} />,
                        onClose: closeModal
                      })
                    }}
                    className="px-3 py-2 text-sm font-medium rounded-lg transition-all hover:scale-105"
                    style={{
                      background: 'var(--color-button-bg)',
                      color: 'var(--color-button-text)',
                      boxShadow: '0 4px 15px var(--color-shadow)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--color-button-hover)'
                      e.currentTarget.style.transform = 'scale(1.05) translateY(-1px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--color-button-bg)'
                      e.currentTarget.style.transform = 'scale(1)'
                    }}
                  >
                    Sign Up
                  </button>
                </div>
              )}
              
              <ThemeSelect />
            </div>
          </div>
          <div className="md:hidden">
            <button className={`${isDarkBackground ? 'text-white' : 'text-gray-700'} hover:text-accent-primary inline-flex items-center justify-center p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent-primary`}>
              <span className="sr-only">Open main menu</span>
              <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}