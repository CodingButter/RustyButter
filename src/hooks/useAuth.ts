import { useState, useEffect, createContext, useContext } from 'react'

export interface User {
  id: number
  username: string
  email: string
  rustUsername?: string
  role: string
  vipStatus: boolean
  loyaltyPoints: number
  totalSpent: number
  createdAt?: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>
  register: (username: string, email: string, password: string, rustUsername?: string) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function useAuthState(): AuthContextType {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('auth_token'),
    isLoading: true,
    isAuthenticated: false
  })

  // Check if user is authenticated on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      // Verify token and get user info
      fetchUser(token)
    } else {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [])

  const fetchUser = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3003/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setState(prev => ({
          ...prev,
          user: data.user,
          token,
          isAuthenticated: true,
          isLoading: false
        }))
      } else {
        // Token is invalid
        localStorage.removeItem('auth_token')
        setState(prev => ({
          ...prev,
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        }))
      }
    } catch (error) {
      // Silent auth error handling
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const login = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch('http://localhost:3003/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('auth_token', data.token)
        setState(prev => ({
          ...prev,
          user: data.user,
          token: data.token,
          isAuthenticated: true
        }))
        return { success: true, message: data.message }
      } else {
        return { success: false, message: data.error || 'Login failed' }
      }
    } catch (error) {
      // Silent login error handling
      return { success: false, message: 'Network error occurred' }
    }
  }

  const register = async (username: string, email: string, password: string, rustUsername?: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch('http://localhost:3003/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password, rustUsername })
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('auth_token', data.token)
        setState(prev => ({
          ...prev,
          user: data.user,
          token: data.token,
          isAuthenticated: true
        }))
        return { success: true, message: data.message }
      } else {
        return { success: false, message: data.error || 'Registration failed' }
      }
    } catch (error) {
      // Silent registration error handling
      return { success: false, message: 'Network error occurred' }
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    setState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false
    })
  }

  const refreshUser = async () => {
    if (state.token) {
      await fetchUser(state.token)
    }
  }

  return {
    ...state,
    login,
    register,
    logout,
    refreshUser
  }
}

export { AuthContext }