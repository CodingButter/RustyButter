import { useLocalStorage } from '@/hooks/useLocalStorage'

interface RuleCategory {
  id: string
  title: string
  icon: string
  description: string
  rules: Rule[]
}

interface Rule {
  id: string
  title: string
  description: string
  severity: 'warning' | 'ban' | 'kick'
}

const ruleCategories: RuleCategory[] = [
  {
    id: 'cheating',
    title: 'Cheating & Exploits',
    icon: '🚫',
    description: 'Zero tolerance policy for any form of cheating or exploiting',
    rules: [
      {
        id: 'hacks',
        title: 'Hacks, Cheats & Third-party Software',
        description: 'Use of any external software to gain unfair advantages including aimbots, ESP, speed hacks, or auto-clickers',
        severity: 'ban'
      },
      {
        id: 'exploits',
        title: 'Bug Exploitation',
        description: 'Abusing game bugs, glitches, or unintended mechanics including rock bases, terrain glitching, or disconnect exploits',
        severity: 'ban'
      },
      {
        id: 'scripting',
        title: 'Scripting & Automation',
        description: 'Using scripts, macros, or any form of automation to perform actions in-game',
        severity: 'ban'
      }
    ]
  },
  {
    id: 'conduct',
    title: 'Player Conduct',
    icon: '🤝',
    description: 'Maintaining a respectful and positive gaming environment',
    rules: [
      {
        id: 'harassment',
        title: 'Harassment & Toxicity',
        description: 'Malicious harassment, doxxing, or targeted abuse of players. Constructive trash talk is allowed.',
        severity: 'warning'
      },
      {
        id: 'hate-speech',
        title: 'Hate Speech',
        description: 'Racism, sexism, homophobia, or discrimination based on religion, nationality, or disability',
        severity: 'ban'
      },
      {
        id: 'chat-rules',
        title: 'Chat & Communication',
        description: 'English only in global chat. No spam, advertising other servers, or excessive caps',
        severity: 'warning'
      }
    ]
  },
  {
    id: 'gameplay',
    title: 'Gameplay Rules',
    icon: '⚔️',
    description: 'Fair play guidelines for PvP and base building',
    rules: [
      {
        id: 'team-limits',
        title: 'Team Size Limit',
        description: 'Maximum team size is 6 players. Green dots, base sharing, and coordinated actions count as teaming',
        severity: 'kick'
      },
      {
        id: 'griefing',
        title: 'Excessive Griefing',
        description: 'Sealing tool cupboards, blocking base access permanently, or unnecessary base destruction beyond raiding',
        severity: 'warning'
      },
      {
        id: 'camping',
        title: 'Roof/Door Camping',
        description: 'Camping players for extended periods (30+ minutes) without engaging in meaningful gameplay',
        severity: 'warning'
      }
    ]
  },
  {
    id: 'building',
    title: 'Base Building',
    icon: '🏗️',
    description: 'Construction guidelines and restrictions',
    rules: [
      {
        id: 'building-zones',
        title: 'Building Restrictions',
        description: 'No building inside monuments, on roads, or blocking key map locations. Respect spawn areas',
        severity: 'warning'
      },
      {
        id: 'stability-abuse',
        title: 'Stability Exploits',
        description: 'Building structures that abuse stability mechanics or create impossible floating bases',
        severity: 'warning'
      },
      {
        id: 'sleeping-bags',
        title: 'Sleeping Bag Placement',
        description: 'No excessive sleeping bag spam around other players\' bases or key locations',
        severity: 'warning'
      }
    ]
  }
]

const severityColors = {
  warning: {
    color: '#facc15',
    background: 'rgba(250, 204, 21, 0.2)',
    border: 'rgba(250, 204, 21, 0.3)'
  },
  kick: {
    color: '#fb923c',
    background: 'rgba(251, 146, 60, 0.2)',
    border: 'rgba(251, 146, 60, 0.3)'
  },
  ban: {
    color: '#f87171',
    background: 'rgba(248, 113, 113, 0.2)',
    border: 'rgba(248, 113, 113, 0.3)'
  }
}

const severityLabels = {
  warning: 'Warning',
  kick: 'Kick',
  ban: 'Permanent Ban'
}

export function Rules() {
  // Use localStorage to persist collapsed state
  const [expandedCategoriesArray, setExpandedCategoriesArray] = useLocalStorage<string[]>(
    'rules-expanded-categories',
    ruleCategories.map(cat => cat.id) // Default to all expanded
  )
  
  // Convert array to Set for easier manipulation
  const expandedCategories = new Set(expandedCategoriesArray)

  const toggleCategory = (categoryId: string) => {
    const newSet = new Set(expandedCategories)
    if (newSet.has(categoryId)) {
      newSet.delete(categoryId)
    } else {
      newSet.add(categoryId)
    }
    setExpandedCategoriesArray(Array.from(newSet))
  }

  const toggleAll = () => {
    if (expandedCategories.size === ruleCategories.length) {
      // All expanded, so collapse all
      setExpandedCategoriesArray([])
    } else {
      // Some or all collapsed, so expand all
      setExpandedCategoriesArray(ruleCategories.map(cat => cat.id))
    }
  }

  return (
    <div className="min-h-screen bg-primary">
      {/* Header */}
      <div className="relative py-20"
           style={{ 
             background: `linear-gradient(135deg, var(--color-shadow), var(--color-overlay))` 
           }}>
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('/images/banner.jpg')" }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
              SERVER <span style={{ color: 'var(--color-accent-primary)' }}>RULES</span>
            </h1>
            <div className="w-32 h-1 mx-auto mb-6" 
                 style={{ background: `linear-gradient(90deg, var(--color-gradient-start), var(--color-gradient-end))` }} />
            <p className="text-xl text-gray-200 max-w-3xl mx-auto">
              Our rules are designed to ensure fair play and maintain a positive gaming environment. 
              Ignorance of rules is not an excuse - all players are expected to read and follow these guidelines.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="border-b"
           style={{ 
             background: 'var(--color-shadow)',
             borderColor: 'var(--color-border-muted)'
           }}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2" style={{ color: 'var(--color-accent-primary)' }}>Zero Tolerance</div>
              <div className="text-gray-200">Cheating & Exploits</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2" style={{ color: 'var(--color-accent-secondary)' }}>6 Players</div>
              <div className="text-gray-200">Maximum Team Size</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-2" style={{ color: 'var(--color-accent-tertiary)' }}>Fair Play</div>
              <div className="text-gray-200">Enforced 24/7</div>
            </div>
          </div>
        </div>
      </div>

      {/* Rules Categories */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Toggle All Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={toggleAll}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-all hover:scale-105"
            style={{
              background: 'var(--color-button-bg)',
              color: 'var(--color-button-text)',
              boxShadow: '0 4px 15px var(--color-shadow)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-button-hover)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--color-button-bg)'
            }}
          >
            <svg 
              className={`w-5 h-5 transition-transform duration-300 ${
                expandedCategories.size === ruleCategories.length ? 'rotate-180' : ''
              }`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            {expandedCategories.size === ruleCategories.length ? 'Collapse All' : 'Expand All'}
          </button>
        </div>
        
        <div className="space-y-12">
          {ruleCategories.map((category, categoryIndex) => (
            <div key={category.id} className="backdrop-blur-sm rounded-xl border overflow-hidden"
                 style={{ 
                   background: 'var(--color-overlay)',
                   borderColor: 'var(--color-border-muted)',
                   boxShadow: '0 10px 30px var(--color-shadow)'
                 }}>
              {/* Category Header - Clickable */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full p-6 border-b transition-all duration-300"
                style={{
                  background: `linear-gradient(90deg, var(--color-overlay), transparent)`,
                  borderColor: 'var(--color-border-muted)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `linear-gradient(90deg, var(--color-gradient-start), transparent)`
                  e.currentTarget.style.backgroundSize = '200% 100%'
                  e.currentTarget.style.backgroundPosition = '0% 0%'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `linear-gradient(90deg, var(--color-overlay), transparent)`
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{category.icon}</div>
                    <div className="text-left">
                      <h2 className="text-2xl font-bold text-white">{category.title}</h2>
                      <p className="text-gray-300 mt-1">{category.description}</p>
                    </div>
                  </div>
                  <svg 
                    className={`w-6 h-6 text-white transition-transform duration-300 ${
                      expandedCategories.has(category.id) ? 'rotate-180' : ''
                    }`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Rules List - Collapsible */}
              <div 
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  expandedCategories.has(category.id) ? 'max-h-[2000px]' : 'max-h-0'
                }`}
              >
                <div className="p-6 space-y-4">
                  {category.rules.map((rule, ruleIndex) => (
                    <div 
                      key={rule.id}
                      className="backdrop-blur-sm p-4 rounded-lg border transition-all duration-300"
                      style={{
                        background: 'var(--color-shadow)',
                        borderColor: 'var(--color-border-muted)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-accent-primary)'
                        e.currentTarget.style.transform = 'translateX(4px)'
                        e.currentTarget.style.boxShadow = '0 4px 20px var(--color-shadow)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-border-muted)'
                        e.currentTarget.style.transform = 'translateX(0)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-bold" style={{ color: 'var(--color-accent-primary)' }}>
                              {categoryIndex + 1}.{ruleIndex + 1}
                            </span>
                            <h3 className="text-lg font-semibold text-white">{rule.title}</h3>
                          </div>
                          <p className="text-gray-300 leading-relaxed">{rule.description}</p>
                        </div>
                        <div className="px-3 py-1 rounded-full text-xs font-bold border"
                             style={{
                               color: severityColors[rule.severity].color,
                               background: severityColors[rule.severity].background,
                               borderColor: severityColors[rule.severity].border
                             }}>
                          {severityLabels[rule.severity]}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-12 backdrop-blur-sm rounded-xl border p-8"
             style={{ 
               background: `linear-gradient(135deg, var(--color-shadow), var(--color-overlay))`,
               borderColor: 'var(--color-border-muted)',
               boxShadow: '0 10px 30px var(--color-shadow)'
             }}>
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Important Information</h3>
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div>
                <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-accent-primary)' }}>📋 Rule Enforcement</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>• Rules are enforced by active admins and automated systems</li>
                  <li>• Violations are reviewed on a case-by-case basis</li>
                  <li>• Repeat offenders face escalated punishments</li>
                  <li>• Appeals can be submitted through Discord</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-accent-primary)' }}>⚖️ Appeals Process</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>• Join our Discord server to submit appeals</li>
                  <li>• Provide your Steam ID and details of the incident</li>
                  <li>• Appeals are reviewed within 24-48 hours</li>
                  <li>• False appeals may result in extended bans</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}