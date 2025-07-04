import { useState, useEffect } from 'react'

interface Stats {
  totalUsers: number
  totalOrders: number
  totalRevenue: number
  activeThemes: number
  serverStatus: 'online' | 'offline'
  currentPlayers: number
}

export function AdminOverview() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeThemes: 0,
    serverStatus: 'offline',
    currentPlayers: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // For now, we'll use dummy data
      // In a real implementation, this would fetch from the API
      setStats({
        totalUsers: 2847,
        totalOrders: 342,
        totalRevenue: 12485.50,
        activeThemes: 3,
        serverStatus: 'online',
        currentPlayers: 45
      })
    } catch (error) {
      // Failed to fetch stats
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: '👥',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      icon: '🛍️',
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: '💰',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      title: 'Active Themes',
      value: stats.activeThemes.toString(),
      icon: '🎨',
      color: 'from-purple-500 to-purple-600'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-12 h-12 border-4 border-accent-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-heading mb-8">Dashboard Overview</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-surface-card/10 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:border-accent-primary/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <span className="text-3xl font-bold text-heading">{stat.value}</span>
            </div>
            <h3 className="text-body text-sm">{stat.title}</h3>
          </div>
        ))}
      </div>

      {/* Server Status */}
      <div className="bg-surface-card/10 backdrop-blur-sm rounded-xl border border-white/10 p-6 mb-8">
        <h2 className="text-xl font-bold text-heading mb-4">Server Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-4">
            <div className={`w-4 h-4 rounded-full ${stats.serverStatus === 'online' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
            <span className="text-body">
              Server is <span className={`font-bold ${stats.serverStatus === 'online' ? 'text-green-400' : 'text-red-400'}`}>
                {stats.serverStatus}
              </span>
            </span>
          </div>
          <div className="text-body">
            Current Players: <span className="font-bold text-accent-primary">{stats.currentPlayers}/100</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-surface-card/10 backdrop-blur-sm rounded-xl border border-white/10 p-6">
        <h2 className="text-xl font-bold text-heading mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="px-6 py-3 bg-accent-primary/20 hover:bg-accent-primary/30 text-accent-primary rounded-lg transition-colors">
            🔄 Restart Server
          </button>
          <button className="px-6 py-3 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg transition-colors">
            📢 Broadcast Message
          </button>
          <button className="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors">
            📊 Export Reports
          </button>
        </div>
      </div>
    </div>
  )
}