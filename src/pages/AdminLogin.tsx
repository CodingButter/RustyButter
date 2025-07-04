import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const success = await login(username, password)
      if (success) {
        navigate('/admin')
      } else {
        setError('Invalid username or password')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="backdrop-blur-sm rounded-2xl p-8 border"
             style={{
               background: 'var(--color-overlay)',
               borderColor: 'var(--color-border-muted)',
               boxShadow: '0 10px 30px var(--color-shadow)'
             }}>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-heading mb-2">Admin Login</h1>
            <p className="text-body">Sign in to access the admin dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-body mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border transition-colors"
                style={{
                  background: 'var(--color-bg-primary)',
                  borderColor: 'var(--color-border-muted)',
                  color: 'var(--color-text-base)'
                }}
                placeholder="Enter username"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-body mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border transition-colors"
                style={{
                  background: 'var(--color-bg-primary)',
                  borderColor: 'var(--color-border-muted)',
                  color: 'var(--color-text-base)'
                }}
                placeholder="Enter password"
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'var(--color-button-bg)',
                color: 'var(--color-button-text)',
                boxShadow: '0 4px 15px var(--color-shadow)'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = 'var(--color-button-hover)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--color-button-bg)'
              }}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted">
              Default credentials:<br/>
              Username: <code className="text-accent-primary">admin</code><br/>
              Password: <code className="text-accent-primary">change me</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}