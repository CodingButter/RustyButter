import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import type { ServerStatus } from '@/types'

export function Hero() {
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchServerStatus = async () => {
      try {
        setLoading(true)
        const data = await api.getServerStatus()
        setServerStatus(data)
      } catch (err) {
        // If API call fails completely, create an offline status
        const offlineStatus: ServerStatus = {
          online: false,
          server: {
            name: 'Rusty Butter Server',
            players: 0,
            maxPlayers: 100,
            map: 'Unknown'
          },
          players: [],
          connectionString: 'steam://connect/23.136.68.2:28015',
          timestamp: new Date().toISOString(),
          error: 'Unable to connect to server API'
        }
        setServerStatus(offlineStatus)
      } finally {
        setLoading(false)
      }
    }

    fetchServerStatus()
    const interval = setInterval(fetchServerStatus, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Parallax Background */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-fixed"
        style={{ 
          backgroundImage: "url('/images/banner.jpg')",
          transform: 'translateZ(0)',
          willChange: 'transform'
        }}
      />
      
      {/* Overlay with theme color */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[var(--color-overlay)]" />
      
      {/* Animated particles with theme colors */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full animate-pulse opacity-70" 
             style={{ background: 'var(--color-accent-primary)' }} />
        <div className="absolute top-1/3 right-1/3 w-1 h-1 rounded-full animate-ping opacity-50"
             style={{ background: 'var(--color-accent-secondary)' }} />
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 rounded-full animate-pulse opacity-60"
             style={{ background: 'var(--color-accent-tertiary)' }} />
        <div className="absolute top-1/2 right-1/4 w-1 h-1 rounded-full animate-ping opacity-40"
             style={{ background: 'var(--color-accent-primary)' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Server Status Badge */}
            <div className="inline-flex items-center gap-2 backdrop-blur-sm px-4 py-2 rounded-full border" 
                 style={{ background: 'var(--color-shadow)', borderColor: 'var(--color-border-muted)' }}>
              {loading ? (
                <>
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--color-accent-primary)' }} />
                  <span className="text-white text-sm">Loading server info...</span>
                </>
              ) : serverStatus?.online ? (
                <>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-white text-sm font-medium">
                    {serverStatus.server.players}/{serverStatus.server.maxPlayers} Players Online
                  </span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-red-400 rounded-full" />
                  <span className="text-red-400 text-sm">Server Offline</span>
                </>
              )}
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight">
                RUSTY
                <span className="block text-accent-primary">BUTTER</span>
              </h1>
              <div className="w-24 h-1 rounded-full" style={{ background: `linear-gradient(90deg, var(--color-gradient-start), var(--color-gradient-end))` }} />
            </div>

            {/* Description */}
            <p className="text-xl text-gray-200 max-w-lg leading-relaxed">
              Where chaos meets craftsmanship. Join an active community with bi-weekly wipes, 
              epic raids, and stories that matter.
            </p>

            {/* Server Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="backdrop-blur-sm p-4 rounded-lg border transition-all duration-300 hover:shadow-lg"
                   style={{ 
                     background: 'var(--color-shadow)', 
                     borderColor: 'var(--color-border-muted)',
                     boxShadow: '0 4px 20px var(--color-shadow)'
                   }}>
                <div className="text-2xl font-bold text-accent-primary">
                  {serverStatus?.server.players || '0'}
                </div>
                <div className="text-sm text-gray-300">Players Online</div>
              </div>
              <div className="backdrop-blur-sm p-4 rounded-lg border transition-all duration-300 hover:shadow-lg"
                   style={{ 
                     background: 'var(--color-shadow)', 
                     borderColor: 'var(--color-border-muted)',
                     boxShadow: '0 4px 20px var(--color-shadow)'
                   }}>
                <div className="text-2xl font-bold text-accent-primary">
                  {serverStatus?.server.map || 'Unknown'}
                </div>
                <div className="text-sm text-gray-300">Current Map</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                className={`group relative overflow-hidden px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 ${
                  serverStatus?.online === false
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : 'hover:scale-105 hover:shadow-2xl'
                }`}
                style={{
                  background: serverStatus?.online === false ? '#4b5563' : 'var(--color-button-bg)',
                  color: serverStatus?.online === false ? '#9ca3af' : 'var(--color-button-text)',
                  boxShadow: serverStatus?.online !== false ? '0 10px 30px var(--color-shadow)' : 'none'
                }}
                type="button"
                disabled={serverStatus?.online === false}
                title={
                  serverStatus?.online === false
                    ? 'Server is currently offline'
                    : 'Connect to Rusty Butter server'
                }
              >
                <span className="relative z-10">
                  {serverStatus?.online === false ? 'Server Offline' : 'CONNECT NOW'}
                </span>
                {serverStatus?.online && (
                  <>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                         style={{ background: `linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-end))` }} />
                    <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                  </>
                )}
              </button>

              <button 
                onClick={() => {
                  const rulesSection = document.getElementById('rules')
                  if (rulesSection) {
                    window.history.pushState(null, '', '#rules')
                    rulesSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                }}
                className="px-8 py-4 rounded-lg font-bold text-lg border-2 transition-all duration-300 hover:scale-105"
                style={{
                  color: 'var(--color-text-onprimary)',
                  borderColor: 'var(--color-border-muted)',
                  background: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-overlay)'
                  e.currentTarget.style.borderColor = 'var(--color-accent-primary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderColor = 'var(--color-border-muted)'
                }}
              >
                VIEW RULES
              </button>
            </div>

            {/* Connection String */}
            {serverStatus && (
              <div className="backdrop-blur-sm p-3 rounded-lg border"
                   style={{ 
                     background: 'var(--color-shadow)', 
                     borderColor: 'var(--color-border-muted)' 
                   }}>
                <div className="text-xs text-gray-400 mb-1">Connection String</div>
                <div className="text-sm text-white font-mono">
                  {serverStatus.connectionString}
                </div>
              </div>
            )}
          </div>

          {/* Right Content - Interactive Elements */}
          <div className="lg:block hidden">
            <div className="relative h-96">
              {/* Floating Cards */}
              <div className="absolute -top-4 -right-4 backdrop-blur-sm p-6 rounded-xl border transform rotate-3 hover:rotate-0 transition-all duration-300 z-20 hover:shadow-2xl"
                   style={{ 
                     background: 'var(--color-shadow)', 
                     borderColor: 'var(--color-border-muted)',
                     boxShadow: '0 20px 40px var(--color-shadow)'
                   }}>
                <div className="text-2xl font-bold text-accent-primary">24/7</div>
                <div className="text-sm text-gray-300">Uptime</div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 backdrop-blur-sm p-6 rounded-xl border transform -rotate-3 hover:rotate-0 transition-all duration-300 z-20 hover:shadow-2xl"
                   style={{ 
                     background: 'var(--color-shadow)', 
                     borderColor: 'var(--color-border-muted)',
                     boxShadow: '0 20px 40px var(--color-shadow)'
                   }}>
                <div className="text-2xl font-bold text-accent-primary">2x</div>
                <div className="text-sm text-gray-300">Gather Rate</div>
              </div>

              {/* Main Feature Card */}
              <div className="backdrop-blur-sm p-8 rounded-2xl border transition-all duration-300 relative z-10 mt-8 hover:shadow-2xl"
                   style={{ 
                     background: `linear-gradient(135deg, var(--color-shadow), var(--color-overlay))`,
                     borderColor: 'var(--color-border-muted)',
                     boxShadow: '0 10px 30px var(--color-shadow)'
                   }}
                   onMouseEnter={(e) => {
                     e.currentTarget.style.borderColor = 'var(--color-accent-primary)'
                     e.currentTarget.style.transform = 'translateY(-4px)'
                   }}
                   onMouseLeave={(e) => {
                     e.currentTarget.style.borderColor = 'var(--color-border-muted)'
                     e.currentTarget.style.transform = 'translateY(0)'
                   }}>
                <h3 className="text-2xl font-bold text-white mb-4">Server Features</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-gray-200">
                    <div className="w-2 h-2 rounded-full" style={{ background: 'var(--color-accent-primary)' }} />
                    Bi-weekly wipes
                  </li>
                  <li className="flex items-center gap-3 text-gray-200">
                    <div className="w-2 h-2 rounded-full" style={{ background: 'var(--color-accent-primary)' }} />
                    Active moderation
                  </li>
                  <li className="flex items-center gap-3 text-gray-200">
                    <div className="w-2 h-2 rounded-full" style={{ background: 'var(--color-accent-primary)' }} />
                    Custom events
                  </li>
                  <li className="flex items-center gap-3 text-gray-200">
                    <div className="w-2 h-2 rounded-full" style={{ background: 'var(--color-accent-primary)' }} />
                    Discord integration
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

    </section>
  )
}
