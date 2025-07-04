import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Modal } from './Modal'

interface AccountSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AccountSettingsModal({ isOpen, onClose }: AccountSettingsModalProps) {
  const { user, token, refreshUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile')
  
  // Profile form data
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    rustUsername: ''
  })
  
  // Password form data
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (user && isOpen) {
      setProfileData({
        username: user.username || '',
        email: user.email || '',
        rustUsername: user.rustUsername || ''
      })
    }
  }, [user, isOpen])

  const validateProfileForm = () => {
    const errors: Record<string, string> = {}
    
    if (!profileData.username.trim()) {
      errors.username = 'Username is required'
    } else if (profileData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters'
    }
    
    if (!profileData.email.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      errors.email = 'Please enter a valid email address'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validatePasswordForm = () => {
    const errors: Record<string, string> = {}
    
    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required'
    }
    
    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required'
    } else if (passwordData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters'
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateProfileForm()) {
      return
    }
    
    setIsLoading(true)
    setError('')
    setSuccessMessage('')
    
    try {
      const response = await fetch('http://localhost:3003/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setSuccessMessage('Profile updated successfully!')
        await refreshUser()
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setError(data.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      setError('Network error occurred')
    }
    
    setIsLoading(false)
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validatePasswordForm()) {
      return
    }
    
    setIsLoading(true)
    setError('')
    setSuccessMessage('')
    
    try {
      const response = await fetch('http://localhost:3003/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setSuccessMessage('Password changed successfully!')
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setError(data.error || 'Failed to change password')
      }
    } catch (error) {
      console.error('Password change error:', error)
      setError('Network error occurred')
    }
    
    setIsLoading(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, formType: 'profile' | 'password') => {
    const { name, value } = e.target
    
    if (formType === 'profile') {
      setProfileData(prev => ({ ...prev, [name]: value }))
    } else {
      setPasswordData(prev => ({ ...prev, [name]: value }))
    }
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const tabsContent = (
    <div className="flex border-b border-white/10">
          <button
            onClick={() => {
              setActiveTab('profile')
              setError('')
              setSuccessMessage('')
              setValidationErrors({})
            }}
            className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
              activeTab === 'profile'
                ? 'text-accent-primary border-b-2 border-accent-primary bg-accent-primary/5'
                : 'text-body hover:text-accent-primary'
            }`}
          >
            👤 Profile Information
          </button>
          <button
            onClick={() => {
              setActiveTab('security')
              setError('')
              setSuccessMessage('')
              setValidationErrors({})
            }}
            className={`flex-1 py-4 px-6 text-sm font-medium transition-colors ${
              activeTab === 'security'
                ? 'text-accent-primary border-b-2 border-accent-primary bg-accent-primary/5'
                : 'text-body hover:text-accent-primary'
            }`}
          >
            🔒 Security
          </button>
    </div>
  )

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Account Settings"
      subtitle="Manage your account information and security"
      maxWidth="2xl"
      headerContent={tabsContent}
    >
      <div>
        {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          
        {successMessage && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg mb-6">
              {successMessage}
            </div>
          )}

        {activeTab === 'profile' ? (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              {/* Account Overview */}
              <div className="bg-accent-primary/10 rounded-xl p-4 border border-accent-primary/20">
                <h3 className="text-lg font-semibold text-heading mb-3">Account Overview</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted">Member Since:</span>
                    <div className="text-body font-medium">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted">Account Role:</span>
                    <div className="text-body font-medium flex items-center gap-2">
                      {user?.role === 'admin' ? '👑 Admin' : '👤 User'}
                      {user?.vipStatus && <span className="text-accent-primary">✨ VIP</span>}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted">Total Spent:</span>
                    <div className="text-accent-primary font-bold">${user?.totalSpent?.toFixed(2) || '0.00'}</div>
                  </div>
                  <div>
                    <span className="text-muted">Loyalty Points:</span>
                    <div className="text-accent-primary font-bold">{user?.loyaltyPoints || 0} pts</div>
                  </div>
                </div>
              </div>

              {/* Profile Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-heading mb-2">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={profileData.username}
                    onChange={(e) => handleInputChange(e, 'profile')}
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

                <div>
                  <label className="block text-sm font-medium text-heading mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange(e, 'profile')}
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

                <div>
                  <label className="block text-sm font-medium text-heading mb-2">Rust Username</label>
                  <input
                    type="text"
                    name="rustUsername"
                    value={profileData.rustUsername}
                    onChange={(e) => handleInputChange(e, 'profile')}
                    className="w-full px-4 py-2 bg-surface-card/20 border border-white/20 rounded-lg text-body placeholder-muted focus:outline-none focus:border-accent-primary transition-colors"
                    placeholder="Your in-game name"
                  />
                  <p className="text-xs text-muted mt-1">This will be used for in-game purchases and VIP benefits</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-accent-primary hover:bg-accent-primary/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                {isLoading ? 'Updating Profile...' : 'Update Profile'}
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-heading mb-2">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={(e) => handleInputChange(e, 'password')}
                    className={`w-full px-4 py-2 bg-surface-card/20 border rounded-lg text-body placeholder-muted focus:outline-none transition-colors ${
                      validationErrors.currentPassword 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-white/20 focus:border-accent-primary'
                    }`}
                    placeholder="Enter your current password"
                    required
                  />
                  {validationErrors.currentPassword && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors.currentPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-heading mb-2">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={(e) => handleInputChange(e, 'password')}
                    className={`w-full px-4 py-2 bg-surface-card/20 border rounded-lg text-body placeholder-muted focus:outline-none transition-colors ${
                      validationErrors.newPassword 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-white/20 focus:border-accent-primary'
                    }`}
                    placeholder="Enter your new password"
                    required
                  />
                  {validationErrors.newPassword && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors.newPassword}</p>
                  )}
                  
                  {/* Password Strength Indicator */}
                  {passwordData.newPassword && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        <div className={`h-1 flex-1 rounded ${passwordData.newPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <div className={`h-1 flex-1 rounded ${passwordData.newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <div className={`h-1 flex-1 rounded ${/[A-Z]/.test(passwordData.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <div className={`h-1 flex-1 rounded ${/[0-9]/.test(passwordData.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      </div>
                      <p className="text-xs text-muted">Password strength: Include uppercase, numbers, 8+ characters</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-heading mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handleInputChange(e, 'password')}
                    className={`w-full px-4 py-2 bg-surface-card/20 border rounded-lg text-body placeholder-muted focus:outline-none transition-colors ${
                      validationErrors.confirmPassword 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-white/20 focus:border-accent-primary'
                    }`}
                    placeholder="Confirm your new password"
                    required
                  />
                  {validationErrors.confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">{validationErrors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-yellow-400">⚠️</span>
                  <span className="text-heading font-medium">Security Notice</span>
                </div>
                <p className="text-body text-sm">
                  Changing your password will not log you out of your current session, but we recommend using a strong, unique password.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-accent-primary hover:bg-accent-primary/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                {isLoading ? 'Changing Password...' : 'Change Password'}
              </button>
            </form>
          )}
        </div>
    </Modal>
  )
}