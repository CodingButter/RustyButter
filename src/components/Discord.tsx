import { useState, useEffect, useMemo } from 'react'

interface DiscordAnnouncement {
  title: string
  content: string
  timestamp: string
}

interface DiscordData {
  memberCount: number
  onlineMembers: number
  boostLevel: number
  recentAnnouncements: DiscordAnnouncement[]
  timestamp: string
}

export function Discord() {
  // Fallback data to ensure the section always displays
  const fallbackDiscordData: DiscordData = useMemo(() => ({
    memberCount: 1247,
    onlineMembers: 384,
    boostLevel: 2,
    recentAnnouncements: [
      {
        title: 'Wipe Day Reminder',
        content: 'Next wipe is Thursday 6PM EST! Get ready for a fresh start.',
        timestamp: new Date(Date.now() - 43200000).toISOString() // 12 hours ago
      },
      {
        title: 'New Role: VIP Builder',
        content: 'Recognition role for amazing base builders! Apply in #applications.',
        timestamp: new Date(Date.now() - 259200000).toISOString() // 3 days ago
      },
      {
        title: 'Weekend Event: Raid Olympics',
        content: 'Join us this weekend for competitive raiding events with prizes!',
        timestamp: new Date(Date.now() - 432000000).toISOString() // 5 days ago
      }
    ],
    timestamp: new Date().toISOString()
  }), [])

  const [discordData, setDiscordData] = useState<DiscordData>(fallbackDiscordData)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const fetchDiscordData = async () => {
      try {
        const response = await fetch('http://localhost:3003/api/discord')
        if (response.ok) {
          const data = await response.json()
          setDiscordData(data || fallbackDiscordData)
        }
      } catch (error) {
        // Using fallback Discord data - API not available
      }
    }

    fetchDiscordData()
    const interval = setInterval(fetchDiscordData, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [fallbackDiscordData])

  const handleJoinDiscord = () => {
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 600)
    // Replace with actual Discord invite link
    window.open('https://discord.gg/rustybutter', '_blank')
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date().getTime()
    const time = new Date(timestamp).getTime()
    const diffInHours = Math.floor((now - time) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  const getBoostBadge = (level: number) => {
    const badges = {
      1: { emoji: '🥉', text: 'Level 1', color: 'from-amber-600 to-amber-800' },
      2: { emoji: '🥈', text: 'Level 2', color: 'from-gray-400 to-gray-600' },
      3: { emoji: '🥇', text: 'Level 3', color: 'from-yellow-400 to-yellow-600' }
    }
    return badges[level as keyof typeof badges] || badges[1]
  }

  const boostBadge = getBoostBadge(discordData.boostLevel)

  return (
    <section className="min-h-screen bg-primary py-16 relative overflow-hidden">
      {/* Subtle Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-96 h-96 rounded-full blur-3xl animate-pulse opacity-20"
             style={{ background: 'var(--color-accent-secondary)' }}></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000 opacity-20"
             style={{ background: 'var(--color-gradient-start)' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-discord rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-heading" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.210.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.120.098.246.195.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.210 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.210 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-heading mb-4">
            JOIN OUR <span className="text-discord">DISCORD</span>
          </h1>
          <div className="w-32 h-1 mx-auto mb-6" 
               style={{ background: `linear-gradient(90deg, var(--color-gradient-start), var(--color-gradient-end))` }} />
          <p className="text-xl text-body max-w-3xl mx-auto">
            Connect with fellow survivors, get server updates, participate in events, and become part of our amazing community!
          </p>
        </div>

        {/* Main Discord Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Members Card */}
          <div className="group backdrop-blur-sm rounded-2xl p-8 border transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-2"
               style={{
                 background: 'var(--color-overlay)',
                 borderColor: 'var(--color-border-muted)',
                 boxShadow: '0 10px 30px var(--color-shadow)'
               }}
               onMouseEnter={(e) => {
                 e.currentTarget.style.borderColor = 'var(--color-accent-primary)'
                 e.currentTarget.style.boxShadow = '0 20px 40px var(--color-shadow)'
               }}
               onMouseLeave={(e) => {
                 e.currentTarget.style.borderColor = 'var(--color-border-muted)'
                 e.currentTarget.style.boxShadow = '0 10px 30px var(--color-shadow)'
               }}>
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center shadow-lg"
                     style={{ background: `linear-gradient(135deg, var(--color-gradient-start), var(--color-gradient-end))` }}>
                  <span className="text-3xl">👥</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-heading text-xs font-bold animate-bounce">
                  +
                </div>
              </div>
              <div className="text-4xl font-black mb-2 group-hover:scale-110 transition-transform"
                   style={{ color: 'var(--color-accent-primary)' }}>
                {discordData.memberCount.toLocaleString()}
              </div>
              <div className="text-body text-lg">Total Members</div>
              <div className="text-sm text-muted mt-2">Growing every day!</div>
            </div>
          </div>

          {/* Online Members Card */}
          <div className="group backdrop-blur-sm rounded-2xl p-8 border transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-2"
               style={{
                 background: 'var(--color-overlay)',
                 borderColor: 'var(--color-border-muted)',
                 boxShadow: '0 10px 30px var(--color-shadow)'
               }}
               onMouseEnter={(e) => {
                 e.currentTarget.style.borderColor = 'var(--color-accent-secondary)'
                 e.currentTarget.style.boxShadow = '0 20px 40px var(--color-shadow)'
               }}
               onMouseLeave={(e) => {
                 e.currentTarget.style.borderColor = 'var(--color-border-muted)'
                 e.currentTarget.style.boxShadow = '0 10px 30px var(--color-shadow)'
               }}>
            <div className="text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg">
                  <span className="text-3xl">🟢</span>
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full animate-ping"></div>
              </div>
              <div className="text-4xl font-black mb-2 group-hover:scale-110 transition-transform"
                   style={{ color: 'var(--color-accent-secondary)' }}>
                {discordData.onlineMembers}
              </div>
              <div className="text-body text-lg">Online Now</div>
              <div className="text-sm text-muted mt-2">Active community</div>
            </div>
          </div>

          {/* Server Boost Card */}
          <div className="group backdrop-blur-sm rounded-2xl p-8 border transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-2"
               style={{
                 background: 'var(--color-overlay)',
                 borderColor: 'var(--color-border-muted)',
                 boxShadow: '0 10px 30px var(--color-shadow)'
               }}
               onMouseEnter={(e) => {
                 e.currentTarget.style.borderColor = 'var(--color-accent-tertiary)'
                 e.currentTarget.style.boxShadow = '0 20px 40px var(--color-shadow)'
               }}
               onMouseLeave={(e) => {
                 e.currentTarget.style.borderColor = 'var(--color-border-muted)'
                 e.currentTarget.style.boxShadow = '0 10px 30px var(--color-shadow)'
               }}>
            <div className="text-center">
              <div className="relative mb-6">
                <div className={`w-20 h-20 bg-gradient-to-br ${boostBadge.color} rounded-2xl mx-auto flex items-center justify-center shadow-lg`}>
                  <span className="text-3xl">{boostBadge.emoji}</span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-heading text-xs font-bold animate-pulse">
                  ⚡
                </div>
              </div>
              <div className="text-4xl font-black mb-2 group-hover:scale-110 transition-transform"
                   style={{ color: 'var(--color-accent-tertiary)' }}>
                {boostBadge.text}
              </div>
              <div className="text-body text-lg">Server Boost</div>
              <div className="text-sm text-muted mt-2">Premium perks unlocked!</div>
            </div>
          </div>
        </div>

        {/* Join Discord CTA */}
        <div className="text-center mb-16">
          <button
            onClick={handleJoinDiscord}
            className={`group relative inline-flex items-center gap-4 px-12 py-6 rounded-2xl text-xl font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
              isAnimating ? 'animate-pulse scale-95' : ''
            }`}
            style={{
              background: 'var(--color-button-bg)',
              color: 'var(--color-button-text)',
              boxShadow: '0 10px 30px var(--color-shadow)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-button-hover)'
              e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 20px 40px var(--color-shadow)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--color-button-bg)'
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = '0 10px 30px var(--color-shadow)'
            }}
          >
            <svg className="w-8 h-8 group-hover:animate-bounce" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.210.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.120.098.246.195.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.210 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.210 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            Join Discord Server
            <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
          <p className="text-theme-base mt-4 opacity-75">
            Click to join our community • Free to join • Instant access
          </p>
        </div>

        {/* Recent Announcements */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-heading mb-4 flex items-center justify-center gap-3">
              📢 Recent Announcements
            </h2>
            <p className="text-body">Stay updated with the latest server news and events</p>
          </div>

          <div className="space-y-6">
            {discordData.recentAnnouncements.map((announcement, index) => (
              <div 
                key={index}
                className="group backdrop-blur-sm rounded-xl p-6 border transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                style={{
                  background: 'var(--color-overlay)',
                  borderColor: 'var(--color-border-muted)',
                  boxShadow: '0 4px 20px var(--color-shadow)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-accent-primary)'
                  e.currentTarget.style.transform = 'translateY(-4px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border-muted)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                         style={{ background: 'var(--color-overlay)' }}>
                      <span className="text-xl">
                        {index === 0 ? '📌' : index === 1 ? '🎉' : '🔔'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold text-heading transition-colors"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = 'var(--color-accent-primary)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'var(--color-text-heading)'
                          }}>
                        {announcement.title}
                      </h3>
                      <span className="text-sm text-muted flex-shrink-0 ml-4">
                        {formatTimeAgo(announcement.timestamp)}
                      </span>
                    </div>
                    <p className="text-body leading-relaxed">
                      {announcement.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Discord Features Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: '💬', title: 'General Chat', desc: 'Talk with fellow players' },
            { icon: '🎮', title: 'LFG Channels', desc: 'Find teammates to play with' },
            { icon: '📸', title: 'Screenshots', desc: 'Share your best moments' },
            { icon: '🎁', title: 'Giveaways', desc: 'Win exclusive prizes' },
            { icon: '📊', title: 'Server Stats', desc: 'Live server information' },
            { icon: '🛠️', title: 'Support', desc: 'Get help from admins' },
            { icon: '📅', title: 'Events', desc: 'Join community events' },
            { icon: '🏆', title: 'Leaderboards', desc: 'Compete with others' }
          ].map((feature, index) => (
            <div 
              key={index}
              className="backdrop-blur-sm rounded-xl p-4 border transition-all duration-300 text-center group"
              style={{
                background: 'var(--color-overlay)',
                borderColor: 'var(--color-border-muted)',
                opacity: '0.8'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-accent-primary)'
                e.currentTarget.style.background = 'var(--color-shadow)'
                e.currentTarget.style.opacity = '1'
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border-muted)'
                e.currentTarget.style.background = 'var(--color-overlay)'
                e.currentTarget.style.opacity = '0.8'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <div className="text-heading font-semibold mb-1">{feature.title}</div>
              <div className="text-muted text-sm">{feature.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}