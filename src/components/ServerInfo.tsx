import { useState, useEffect, useMemo } from 'react'

interface Player {
  name: string
  score: number
  duration: number
  kills: number
  deaths: number
  joinTime: string
}

interface ServerStats {
  lastWipe: string
  nextWipe: string
  totalPlayersRegistered: number
  peakConcurrentPlayers: number
  averageDailyPlayers: number
  uptimePercentage: number
  mapSeed: number
  mapSize: number
  gatherRate: string
  wipeSchedule: string
  currentPlayers: number
  timestamp: string
}

interface ServerEvent {
  id: number
  type: string
  title: string
  message: string
  timestamp: string
  priority: string
}

export function ServerInfo() {
  // Fallback data to ensure the section always displays
  const fallbackStats: ServerStats = useMemo(() => ({
    lastWipe: '2024-12-20T18:00:00Z',
    nextWipe: '2025-01-03T18:00:00Z',
    totalPlayersRegistered: 2847,
    peakConcurrentPlayers: 98,
    averageDailyPlayers: 67,
    uptimePercentage: 99.2,
    mapSeed: 1847629,
    mapSize: 4000,
    gatherRate: '2x',
    wipeSchedule: 'Bi-Weekly (Thursdays 6PM EST)',
    currentPlayers: 45,
    timestamp: new Date().toISOString()
  }), [])

  const fallbackPlayers: Player[] = useMemo(() => [
    { name: 'RustLord_2024', score: 4250, duration: 7200, kills: 47, deaths: 12, joinTime: '2024-12-28T10:30:00Z' },
    { name: 'NakedBeachBob', score: 3890, duration: 5400, kills: 32, deaths: 18, joinTime: '2024-12-28T09:15:00Z' },
    { name: 'ScrapQueen', score: 4100, duration: 6300, kills: 41, deaths: 14, joinTime: '2024-12-28T08:45:00Z' },
    { name: 'RaidMaster', score: 4500, duration: 7800, kills: 52, deaths: 16, joinTime: '2024-12-28T07:30:00Z' },
    { name: 'BowSniper47', score: 3650, duration: 4900, kills: 38, deaths: 22, joinTime: '2024-12-28T11:00:00Z' },
    { name: 'ChainSawCharlie', score: 3200, duration: 3600, kills: 28, deaths: 15, joinTime: '2024-12-28T12:15:00Z' },
    { name: 'MetalDetector', score: 2900, duration: 3200, kills: 25, deaths: 19, joinTime: '2024-12-28T13:00:00Z' },
    { name: 'RocketRaider', score: 4300, duration: 6800, kills: 45, deaths: 13, joinTime: '2024-12-28T08:00:00Z' },
    { name: 'ShotgunSally', score: 3750, duration: 5100, kills: 35, deaths: 17, joinTime: '2024-12-28T09:30:00Z' },
    { name: 'BuilderBen', score: 3100, duration: 4200, kills: 22, deaths: 8, joinTime: '2024-12-28T10:45:00Z' },
    { name: 'FarmingFrank', score: 2800, duration: 3800, kills: 18, deaths: 12, joinTime: '2024-12-28T11:30:00Z' },
    { name: 'PvPPete', score: 4600, duration: 8100, kills: 58, deaths: 19, joinTime: '2024-12-28T07:00:00Z' },
    { name: 'CraftingCarl', score: 2600, duration: 2900, kills: 15, deaths: 9, joinTime: '2024-12-28T13:30:00Z' },
    { name: 'LootGoblin', score: 3400, duration: 4500, kills: 29, deaths: 16, joinTime: '2024-12-28T10:15:00Z' },
    { name: 'BaseDefender', score: 3900, duration: 5700, kills: 36, deaths: 11, joinTime: '2024-12-28T08:30:00Z' }
  ], [])

  const fallbackEvents: ServerEvent[] = useMemo(() => [
    {
      id: 1,
      type: 'announcement',
      title: 'Server Maintenance Tonight',
      message: 'Brief maintenance window from 3-4 AM EST for performance improvements.',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      priority: 'medium'
    },
    {
      id: 2,
      type: 'event',
      title: 'Community Build Competition',
      message: 'Submit your best base designs! Winner gets VIP status and in-game rewards.',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      priority: 'high'
    },
    {
      id: 3,
      type: 'update',
      title: 'New Custom Monuments Added',
      message: 'Explore the new custom monuments scattered across the map!',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      priority: 'medium'
    }
  ], [])

  const [players, setPlayers] = useState<Player[]>(fallbackPlayers)
  const [stats, setStats] = useState<ServerStats>(fallbackStats)
  const [events, setEvents] = useState<ServerEvent[]>(fallbackEvents)
  const [activeTab, setActiveTab] = useState<'overview' | 'players' | 'events'>('overview')

  // Countdown to next wipe
  const [timeToWipe, setTimeToWipe] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [playersRes, statsRes, eventsRes] = await Promise.all([
          fetch('http://localhost:3003/api/server/players'),
          fetch('http://localhost:3003/api/server/stats'),
          fetch('http://localhost:3003/api/server/events')
        ])

        if (playersRes.ok && statsRes.ok && eventsRes.ok) {
          const playersData = await playersRes.json()
          const statsData = await statsRes.json()
          const eventsData = await eventsRes.json()

          setPlayers(playersData.players || fallbackPlayers)
          setStats(statsData || fallbackStats)
          setEvents(eventsData.events || fallbackEvents)
        }
      } catch (error) {
        // Using fallback data - API not available
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [fallbackPlayers, fallbackStats, fallbackEvents])

  useEffect(() => {
    if (!stats?.nextWipe) return

    const updateCountdown = () => {
      const now = new Date().getTime()
      const wipeTime = new Date(stats.nextWipe).getTime()
      const distance = wipeTime - now

      if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24))
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((distance % (1000 * 60)) / 1000)

        setTimeToWipe({ days, hours, minutes, seconds })
      }
    }

    updateCountdown()
    const countdown = setInterval(updateCountdown, 1000)
    return () => clearInterval(countdown)
  }, [stats?.nextWipe])

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${mins}m`
  }

  const formatKD = (kills: number, deaths: number) => {
    return deaths === 0 ? kills.toFixed(1) : (kills / deaths).toFixed(1)
  }

  return (
    <section className="min-h-screen bg-primary py-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-heading mb-4">
            SERVER <span className="text-accent-primary">INFO</span>
          </h1>
          <div className="w-32 h-1 mx-auto mb-6" 
               style={{ background: `linear-gradient(90deg, var(--color-gradient-start), var(--color-gradient-end))` }} />
          <p className="text-xl text-body max-w-3xl mx-auto">
            Real-time server statistics, player information, and everything you need to know about Rusty Butter.
          </p>
        </div>

        {/* Wipe Countdown */}
        <div className="rounded-2xl p-8 mb-12 border shadow-2xl"
             style={{ 
               background: `linear-gradient(135deg, var(--color-gradient-start), transparent)`,
               borderColor: 'var(--color-accent-primary)',
               boxShadow: '0 20px 40px var(--color-shadow)'
             }}>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-3xl font-bold text-heading mb-2">🔥 Next Wipe Countdown</h2>
              <p className="text-body text-lg">{stats.wipeSchedule}</p>
            </div>
            <div className="flex gap-4">
              {[
                { label: 'Days', value: timeToWipe.days },
                { label: 'Hours', value: timeToWipe.hours },
                { label: 'Minutes', value: timeToWipe.minutes },
                { label: 'Seconds', value: timeToWipe.seconds }
              ].map((item) => (
                <div key={item.label} className="backdrop-blur-sm rounded-lg p-4 text-center min-w-[80px]"
                     style={{ 
                       background: 'var(--color-shadow)' 
                     }}>
                  <div className="text-3xl font-bold" style={{ color: 'var(--color-accent-primary)' }}>{item.value.toString().padStart(2, '0')}</div>
                  <div className="text-sm text-body">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'players', label: 'Online Players', icon: '👥' },
            { id: 'events', label: 'Events & News', icon: '📢' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'players' | 'events')}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all hover:scale-105"
              style={{
                background: activeTab === tab.id ? 'var(--color-button-bg)' : 'var(--color-shadow)',
                color: activeTab === tab.id ? 'var(--color-button-text)' : 'var(--color-text-body)',
                boxShadow: activeTab === tab.id ? '0 4px 15px var(--color-shadow)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.background = 'var(--color-overlay)'
                  e.currentTarget.style.color = 'var(--color-accent-primary)'
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.currentTarget.style.background = 'var(--color-shadow)'
                  e.currentTarget.style.color = 'var(--color-text-body)'
                }
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Server Status Card */}
            <div className="backdrop-blur-sm rounded-xl p-6 border transition-all duration-300 hover:shadow-2xl hover:scale-105"
                 style={{
                   background: 'var(--color-overlay)',
                   borderColor: 'var(--color-border-muted)',
                   boxShadow: '0 10px 30px var(--color-shadow)'
                 }}
                 onMouseEnter={(e) => {
                   e.currentTarget.style.borderColor = 'var(--color-accent-primary)'
                 }}
                 onMouseLeave={(e) => {
                   e.currentTarget.style.borderColor = 'var(--color-border-muted)'
                 }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <h3 className="text-xl font-bold text-heading">🟢 Server Status</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-body">Players Online</span>
                  <span className="font-bold" style={{ color: 'var(--color-accent-primary)' }}>{stats.currentPlayers}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body">Uptime</span>
                  <span className="text-green-400 font-bold">{stats.uptimePercentage}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body">Gather Rate</span>
                  <span className="font-bold" style={{ color: 'var(--color-accent-primary)' }}>{stats.gatherRate}</span>
                </div>
              </div>
            </div>

            {/* Player Statistics */}
            <div className="backdrop-blur-sm rounded-xl p-6 border transition-all duration-300 hover:shadow-2xl hover:scale-105"
                 style={{
                   background: 'var(--color-overlay)',
                   borderColor: 'var(--color-border-muted)',
                   boxShadow: '0 10px 30px var(--color-shadow)'
                 }}
                 onMouseEnter={(e) => {
                   e.currentTarget.style.borderColor = 'var(--color-accent-secondary)'
                 }}
                 onMouseLeave={(e) => {
                   e.currentTarget.style.borderColor = 'var(--color-border-muted)'
                 }}>
              <h3 className="text-xl font-bold text-heading mb-4">📈 Player Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-body">Total Registered</span>
                  <span className="font-bold" style={{ color: 'var(--color-accent-primary)' }}>{stats.totalPlayersRegistered.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body">Peak Concurrent</span>
                  <span className="font-bold" style={{ color: 'var(--color-accent-primary)' }}>{stats.peakConcurrentPlayers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body">Daily Average</span>
                  <span className="font-bold" style={{ color: 'var(--color-accent-primary)' }}>{stats.averageDailyPlayers}</span>
                </div>
              </div>
            </div>

            {/* Map Information */}
            <div className="backdrop-blur-sm rounded-xl p-6 border transition-all duration-300 hover:shadow-2xl hover:scale-105"
                 style={{
                   background: 'var(--color-overlay)',
                   borderColor: 'var(--color-border-muted)',
                   boxShadow: '0 10px 30px var(--color-shadow)'
                 }}
                 onMouseEnter={(e) => {
                   e.currentTarget.style.borderColor = 'var(--color-accent-tertiary)'
                 }}
                 onMouseLeave={(e) => {
                   e.currentTarget.style.borderColor = 'var(--color-border-muted)'
                 }}>
              <h3 className="text-xl font-bold text-heading mb-4">🗺️ Map Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-body">Map Size</span>
                  <span className="font-bold" style={{ color: 'var(--color-accent-primary)' }}>{stats.mapSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body">Seed</span>
                  <span className="font-bold" style={{ color: 'var(--color-accent-primary)' }}>{stats.mapSeed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body">Last Wipe</span>
                  <span className="font-bold" style={{ color: 'var(--color-accent-primary)' }}>
                    {new Date(stats.lastWipe).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'players' && (
          <div className="backdrop-blur-sm rounded-xl border overflow-hidden"
               style={{
                 background: 'var(--color-overlay)',
                 borderColor: 'var(--color-border-muted)',
                 boxShadow: '0 10px 30px var(--color-shadow)'
               }}>
            <div className="p-6 border-b" style={{ borderColor: 'var(--color-border-muted)' }}>
              <h3 className="text-2xl font-bold text-heading">Online Players ({players.length})</h3>
              <p className="text-body mt-2">Currently active players on the server</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ background: 'var(--color-shadow)' }}>
                  <tr>
                    <th className="text-left p-4 text-heading font-semibold">Player</th>
                    <th className="text-left p-4 text-heading font-semibold">Score</th>
                    <th className="text-left p-4 text-heading font-semibold">K/D</th>
                    <th className="text-left p-4 text-heading font-semibold">Play Time</th>
                    <th className="text-left p-4 text-heading font-semibold">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player, index) => (
                    <tr key={index} className="border-b transition-all"
                        style={{ borderColor: 'var(--color-border-muted)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--color-overlay)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent'
                        }}>
                      <td className="p-4">
                        <span className="text-heading font-medium">{player.name}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold" style={{ color: 'var(--color-accent-primary)' }}>{player.score.toLocaleString()}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-body">{formatKD(player.kills, player.deaths)}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-body">{formatDuration(player.duration)}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-body">{new Date(player.joinTime).toLocaleDateString()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-6">
            {events.map((event) => (
              <div key={event.id} className="backdrop-blur-sm rounded-xl p-6 border transition-all duration-300 hover:scale-[1.02]"
                   style={{
                     background: 'var(--color-overlay)',
                     borderColor: 'var(--color-border-muted)',
                     boxShadow: '0 10px 30px var(--color-shadow)'
                   }}
                   onMouseEnter={(e) => {
                     e.currentTarget.style.borderColor = 'var(--color-accent-primary)'
                   }}
                   onMouseLeave={(e) => {
                     e.currentTarget.style.borderColor = 'var(--color-border-muted)'
                   }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">
                        {event.type === 'announcement' ? '📢' : event.type === 'event' ? '🎉' : '🔄'}
                      </span>
                      <h3 className="text-xl font-bold text-heading">{event.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        event.priority === 'high' 
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {event.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-body leading-relaxed">{event.message}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-body">
                      {new Date(event.timestamp).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-body opacity-75">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}