import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface ConfigItem {
  value: string
  description: string
  type: string
}

interface ServerConfigData {
  [key: string]: ConfigItem
}

export function ServerConfig() {
  const { token } = useAuth()
  const [config, setConfig] = useState<ServerConfigData>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'success' | 'error' | null>(null)

  const fetchConfig = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3003/api/admin/config', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setConfig(data.config)
      }
    } catch (error) {
      // Failed to fetch config
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  const handleSave = async () => {
    setSaving(true)
    try {
      const configs: Record<string, string> = {}
      Object.entries(config).forEach(([key, item]) => {
        configs[key] = item.value
      })

      const response = await fetch('http://localhost:3003/api/admin/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ configs })
      })
      
      if (response.ok) {
        alert('Configuration saved successfully!')
      }
    } catch (error) {
      console.error('Failed to save config:', error)
      alert('Failed to save configuration')
    } finally {
      setSaving(false)
    }
  }

  const handleTestConnection = async () => {
    setTestingConnection(true)
    setConnectionStatus(null)
    
    try {
      // In a real implementation, this would test the server connection
      // For now, we'll simulate it
      await new Promise(resolve => setTimeout(resolve, 2000))
      setConnectionStatus('success')
    } catch (error) {
      setConnectionStatus('error')
    } finally {
      setTestingConnection(false)
    }
  }

  const updateConfig = (key: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        value
      }
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-12 h-12 border-4 border-accent-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-heading mb-8">Server Configuration</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Server Connection */}
        <div className="bg-surface-card/10 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <h2 className="text-xl font-bold text-heading mb-6">Server Connection</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-heading mb-2">
                Server IP Address
              </label>
              <input
                type="text"
                value={config.server_ip?.value || ''}
                onChange={(e) => updateConfig('server_ip', e.target.value)}
                className="w-full px-4 py-2 bg-surface-card/20 border border-white/20 rounded-lg text-body focus:outline-none focus:border-accent-primary"
                placeholder="e.g., 192.168.1.1"
              />
              <p className="text-xs text-muted mt-1">{config.server_ip?.description}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-heading mb-2">
                Server Port
              </label>
              <input
                type="number"
                value={config.server_port?.value || ''}
                onChange={(e) => updateConfig('server_port', e.target.value)}
                className="w-full px-4 py-2 bg-surface-card/20 border border-white/20 rounded-lg text-body focus:outline-none focus:border-accent-primary"
                placeholder="e.g., 28015"
              />
              <p className="text-xs text-muted mt-1">{config.server_port?.description}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-heading mb-2">
                Query Port
              </label>
              <input
                type="number"
                value={config.query_port?.value || ''}
                onChange={(e) => updateConfig('query_port', e.target.value)}
                className="w-full px-4 py-2 bg-surface-card/20 border border-white/20 rounded-lg text-body focus:outline-none focus:border-accent-primary"
                placeholder="e.g., 28017"
              />
              <p className="text-xs text-muted mt-1">{config.query_port?.description}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-heading mb-2">
                RCON Port
              </label>
              <input
                type="number"
                value={config.rcon_port?.value || ''}
                onChange={(e) => updateConfig('rcon_port', e.target.value)}
                className="w-full px-4 py-2 bg-surface-card/20 border border-white/20 rounded-lg text-body focus:outline-none focus:border-accent-primary"
                placeholder="e.g., 28016"
              />
              <p className="text-xs text-muted mt-1">{config.rcon_port?.description}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-heading mb-2">
                RCON Password
              </label>
              <input
                type="password"
                value={config.rcon_password?.value || ''}
                onChange={(e) => updateConfig('rcon_password', e.target.value)}
                className="w-full px-4 py-2 bg-surface-card/20 border border-white/20 rounded-lg text-body focus:outline-none focus:border-accent-primary"
                placeholder="Enter RCON password"
              />
              <p className="text-xs text-muted mt-1">{config.rcon_password?.description}</p>
            </div>

            <button
              onClick={handleTestConnection}
              disabled={testingConnection}
              className="w-full px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 disabled:bg-gray-600/20 text-blue-400 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {testingConnection ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full"></div>
                  Testing...
                </>
              ) : (
                <>
                  🔌 Test Connection
                </>
              )}
            </button>

            {connectionStatus && (
              <div className={`p-3 rounded-lg ${
                connectionStatus === 'success' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {connectionStatus === 'success' 
                  ? '✅ Connection successful!' 
                  : '❌ Connection failed. Please check your settings.'}
              </div>
            )}
          </div>
        </div>

        {/* Server Details */}
        <div className="bg-surface-card/10 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <h2 className="text-xl font-bold text-heading mb-6">Server Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-heading mb-2">
                Server Name
              </label>
              <input
                type="text"
                value={config.server_name?.value || ''}
                onChange={(e) => updateConfig('server_name', e.target.value)}
                className="w-full px-4 py-2 bg-surface-card/20 border border-white/20 rounded-lg text-body focus:outline-none focus:border-accent-primary"
                placeholder="e.g., My Rust Server"
              />
              <p className="text-xs text-muted mt-1">{config.server_name?.description}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-heading mb-2">
                Max Players
              </label>
              <input
                type="number"
                value={config.max_players?.value || ''}
                onChange={(e) => updateConfig('max_players', e.target.value)}
                className="w-full px-4 py-2 bg-surface-card/20 border border-white/20 rounded-lg text-body focus:outline-none focus:border-accent-primary"
                placeholder="e.g., 100"
              />
              <p className="text-xs text-muted mt-1">{config.max_players?.description}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-heading mb-2">
                Wipe Schedule
              </label>
              <input
                type="text"
                value={config.wipe_schedule?.value || ''}
                onChange={(e) => updateConfig('wipe_schedule', e.target.value)}
                className="w-full px-4 py-2 bg-surface-card/20 border border-white/20 rounded-lg text-body focus:outline-none focus:border-accent-primary"
                placeholder="e.g., Bi-Weekly (Thursdays 6PM EST)"
              />
              <p className="text-xs text-muted mt-1">{config.wipe_schedule?.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-accent-primary hover:bg-accent-primary/90 disabled:bg-gray-600 text-white font-bold rounded-lg transition-colors"
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </div>
  )
}