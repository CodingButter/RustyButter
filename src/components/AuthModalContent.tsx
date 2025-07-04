import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface AuthModalContentProps {
  initialMode?: 'login' | 'register'
  onClose: () => void
}

export function AuthModalContent({ initialMode = 'login', onClose }: AuthModalContentProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    rustUsername: ''
  })
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const { login, register } = useAuth()

  const validateForm = () => {
    const errors: Record<string, string> = {}
    
    if (!formData.username.trim()) {
      errors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters'
    }
    
    if (mode === 'register') {
      if (!formData.email.trim()) {
        errors.email = 'Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Please enter a valid email address'
      }
      
      if (!formData.password) {
        errors.password = 'Password is required'
      } else if (formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters'
      }
      
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match'
      }
    } else {
      if (!formData.password) {
        errors.password = 'Password is required'
      }
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    setError('')
    setValidationErrors({})

    try {
      let result
      if (mode === 'login') {
        result = await login(formData.username, formData.password)
      } else {
        result = await register(formData.username, formData.email, formData.password, formData.rustUsername)
      }

      if (result.success) {
        if (mode === 'register') {
          setSuccessMessage('Account created successfully! Welcome to RustyButter!')
          setTimeout(() => {
            onClose()
            setFormData({ username: '', email: '', password: '', confirmPassword: '', rustUsername: '' })
            setValidationErrors({})
            setSuccessMessage('')
          }, 2000)
        } else {
          onClose()
          setFormData({ username: '', email: '', password: '', confirmPassword: '', rustUsername: '' })
          setValidationErrors({})
        }
      } else {
        setError(result.message || 'An error occurred')
      }
    } catch (error) {
      setError('Network error occurred')
    }

    setIsLoading(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  return (
    <div className="bg-primary border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <h2 className="text-2xl font-bold text-heading">
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </h2>
        <button
          onClick={onClose}
          className="text-body hover:text-accent-primary p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-heading mb-2">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 bg-surface-card/20 border rounded-lg text-body placeholder-muted focus:outline-none transition-colors ${
              validationErrors.username 
                ? 'border-red-500 focus:border-red-500' 
                : 'border-white/20 focus:border-accent-primary'
            }`}
            placeholder="Enter your username"
            required
          />
          {validationErrors.username && (
            <p className="text-red-400 text-xs mt-1">{validationErrors.username}</p>
          )}
        </div>

        {mode === 'register' && (
          <div>
            <label className="block text-sm font-medium text-heading mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 bg-surface-card/20 border rounded-lg text-body placeholder-muted focus:outline-none transition-colors ${
                validationErrors.email 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-white/20 focus:border-accent-primary'
              }`}
              placeholder="Enter your email"
              required
            />
            {validationErrors.email && (
              <p className="text-red-400 text-xs mt-1">{validationErrors.email}</p>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-heading mb-2">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 bg-surface-card/20 border rounded-lg text-body placeholder-muted focus:outline-none transition-colors ${
              validationErrors.password 
                ? 'border-red-500 focus:border-red-500' 
                : 'border-white/20 focus:border-accent-primary'
            }`}
            placeholder="Enter your password"
            required
          />
          {validationErrors.password && (
            <p className="text-red-400 text-xs mt-1">{validationErrors.password}</p>
          )}
          {mode === 'register' && formData.password && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                <div className={`h-1 flex-1 rounded ${formData.password.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <div className={`h-1 flex-1 rounded ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <div className={`h-1 flex-1 rounded ${/[A-Z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <div className={`h-1 flex-1 rounded ${/[0-9]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              </div>
              <p className="text-xs text-muted">Password strength: Include uppercase, numbers, 8+ characters</p>
            </div>
          )}
        </div>

        {mode === 'register' && (
          <>
            <div>
              <label className="block text-sm font-medium text-heading mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 bg-surface-card/20 border rounded-lg text-body placeholder-muted focus:outline-none transition-colors ${
                  validationErrors.confirmPassword 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-white/20 focus:border-accent-primary'
                }`}
                placeholder="Confirm your password"
                required
              />
              {validationErrors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">{validationErrors.confirmPassword}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-heading mb-2">Rust Username (Optional)</label>
              <input
                type="text"
                name="rustUsername"
                value={formData.rustUsername}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-surface-card/20 border border-white/20 rounded-lg text-body placeholder-muted focus:outline-none focus:border-accent-primary transition-colors"
                placeholder="Your in-game name"
              />
              <p className="text-xs text-muted mt-1">This will be used for in-game purchases and VIP benefits</p>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-accent-primary hover:bg-accent-primary/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
            </>
          ) : (
            mode === 'login' ? 'Sign In' : 'Create Account'
          )}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login')
              setError('')
              setValidationErrors({})
              setFormData({ username: '', email: '', password: '', confirmPassword: '', rustUsername: '' })
            }}
            className="text-accent-primary hover:text-accent-primary/80 text-sm transition-colors"
          >
            {mode === 'login' 
              ? "Don't have an account? Sign up" 
              : "Already have an account? Sign in"
            }
          </button>
        </div>
      </form>
    </div>
  )
}