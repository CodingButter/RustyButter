import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/hooks/useTheme'

interface Theme {
  id: number
  name: string
  slug: string
  description: string
  css_variables: Record<string, string>
  is_active: boolean
}

export function ThemeEditor() {
  const { token, user } = useAuth()
  const { theme: currentTheme } = useTheme()
  const [themes, setThemes] = useState<Theme[]>([])
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [previewTheme, setPreviewTheme] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const originalThemeRef = useRef<Theme | null>(null)
  const originalCssVarsRef = useRef<Record<string, string>>({})
  const isLivePreviewingRef = useRef(false)
  
  // Authentication state tracked internally

  const fetchThemes = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3003/api/admin/themes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setThemes(data.themes)
      } else {
        // Failed to fetch themes - response not ok
      }
    } catch (error) {
      // Error fetching themes - silent error handling
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchThemes()
  }, [fetchThemes])

  // Store original CSS variables when starting to edit
  useEffect(() => {
    if (selectedTheme && editMode) {
      originalThemeRef.current = { ...selectedTheme }
      // If editing the current theme, mark for live preview
      if (selectedTheme.slug === currentTheme) {
        originalCssVarsRef.current = { ...selectedTheme.css_variables }
        isLivePreviewingRef.current = true
      }
    }
    
    return () => {
      // Cleanup preview on unmount
      isLivePreviewingRef.current = false
    }
  }, [selectedTheme, editMode, currentTheme])

  // Apply live preview when editing current theme
  useEffect(() => {
    if (selectedTheme && editMode && selectedTheme.slug === currentTheme) {
      // Remove existing theme style tag if any
      const existingStyle = document.getElementById('theme-variables-preview')
      if (existingStyle) {
        existingStyle.remove()
      }

      // Create new style tag with CSS variables for preview
      const style = document.createElement('style')
      style.id = 'theme-variables-preview'
      style.innerHTML = `:root {
${Object.entries(selectedTheme.css_variables || {})
  .map(([key, value]) => `  ${key}: ${value};`)
  .join('\n')}
}`
      document.head.appendChild(style)
    } else {
      // Remove preview style when not editing current theme
      const previewStyle = document.getElementById('theme-variables-preview')
      if (previewStyle) {
        previewStyle.remove()
      }
    }

    return () => {
      // Cleanup preview style on unmount
      const previewStyle = document.getElementById('theme-variables-preview')
      if (previewStyle) {
        previewStyle.remove()
      }
    }
  }, [selectedTheme, editMode, currentTheme])

  const handleSaveTheme = async () => {
    if (!selectedTheme) return
    
    setSaving(true)
    try {
      const url = editMode 
        ? `http://localhost:3003/api/admin/themes/${selectedTheme.id}`
        : 'http://localhost:3003/api/admin/themes'
      
      const response = await fetch(url, {
        method: editMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(selectedTheme)
      })
      
      if (response.ok) {
        await fetchThemes()
        setSelectedTheme(null)
        setEditMode(false)
        setHasUnsavedChanges(false)
        // If we were live previewing, the changes are now saved
        isLivePreviewingRef.current = false
      }
    } catch (error) {
      // Failed to save theme - silent error handling
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteTheme = async (id: number) => {
    if (!confirm('Are you sure you want to delete this theme?')) return
    
    try {
      const response = await fetch(`http://localhost:3003/api/admin/themes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        await fetchThemes()
      }
    } catch (error) {
      // Failed to delete theme - silent error handling
    }
  }

  const handleColorChange = (variable: string, value: string) => {
    if (!selectedTheme) return
    
    setSelectedTheme({
      ...selectedTheme,
      css_variables: {
        ...selectedTheme.css_variables,
        [variable]: value
      }
    })
    
    // Mark as having unsaved changes
    if (!hasUnsavedChanges) {
      setHasUnsavedChanges(true)
    }
  }

  const applyPreview = (theme: Theme) => {
    // Apply theme CSS variables to preview
    const root = document.documentElement
    Object.entries(theme.css_variables).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
    setPreviewTheme(theme.slug)
  }

  const removePreview = () => {
    // Reset to original theme
    const root = document.documentElement
    // Remove all custom properties
    Array.from(root.style).forEach(prop => {
      if (prop.startsWith('--color-')) {
        root.style.removeProperty(prop)
      }
    })
    setPreviewTheme(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-12 h-12 border-4 border-accent-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <h1 className="text-3xl font-bold text-heading">Theme Editor</h1>
        <button
          onClick={() => {
            // Remove preview style before creating new theme
            const previewStyle = document.getElementById('theme-variables-preview')
            if (previewStyle) {
              previewStyle.remove()
            }
            setSelectedTheme({
              id: 0,
              name: '',
              slug: '',
              description: '',
              css_variables: {
                '--color-bg-primary': '#fae8c0',
                '--color-bg-secondary': '#e2cab7',
                '--color-accent-primary': '#679a4b',
                '--color-accent-secondary': '#8fc370',
                '--color-text-base': '#2a1f0a',
                '--color-button-bg': '#679a4b',
                '--color-button-hover': '#4a7c2e'
              },
              is_active: true
            })
            setEditMode(false)
            setHasUnsavedChanges(false)
          }}
          className="px-6 py-2 bg-accent-primary hover:bg-accent-primary/90 text-white font-bold rounded-lg transition-colors"
        >
          + New Theme
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden">
        {/* Theme List */}
        <div className="lg:col-span-1 h-full overflow-hidden">
          <div className="bg-surface-card/10 backdrop-blur-sm rounded-xl border border-white/10 h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-heading">Themes</h2>
            </div>
            
            {/* Scrollable Theme List */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {themes.map(theme => (
                  <div
                    key={theme.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedTheme?.id === theme.id
                        ? 'bg-accent-primary/20 border-accent-primary'
                        : 'bg-black/20 border-white/10 hover:border-accent-primary/50'
                    }`}
                    onClick={() => {
                      // Remove preview style when switching themes
                      const previewStyle = document.getElementById('theme-variables-preview')
                      if (previewStyle) {
                        previewStyle.remove()
                      }
                      setSelectedTheme(theme)
                      setEditMode(true)
                      setHasUnsavedChanges(false)
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-heading truncate">{theme.name}</h3>
                        <p className="text-sm text-muted line-clamp-2">{theme.description}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                        {theme.is_active && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded whitespace-nowrap">Active</span>
                        )}
                        {selectedTheme?.id === theme.id && hasUnsavedChanges && (
                          <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded whitespace-nowrap">Unsaved</span>
                        )}
                        {previewTheme === theme.slug ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              removePreview()
                            }}
                            className="p-1 text-red-400 hover:text-red-300"
                            title="Remove preview"
                          >
                            ❌
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              applyPreview(theme)
                            }}
                            className="p-1 text-blue-400 hover:text-blue-300"
                            title="Preview theme"
                          >
                            👁️
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Theme Editor */}
        {selectedTheme && (
          <div className="lg:col-span-2 h-full overflow-hidden">
            <div className="bg-surface-card/10 backdrop-blur-sm rounded-xl border border-white/10 h-full flex flex-col overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-xl font-bold text-heading">
                  {editMode ? 'Edit Theme' : 'Create New Theme'}
                </h2>
                {selectedTheme.slug === currentTheme && editMode && (
                  <span className="text-sm text-blue-400">
                    Live preview enabled - changes appear instantly
                  </span>
                )}
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-heading mb-2">Name</label>
                    <input
                      type="text"
                      value={selectedTheme.name}
                      onChange={(e) => {
                        setSelectedTheme({ ...selectedTheme, name: e.target.value })
                        if (!hasUnsavedChanges) setHasUnsavedChanges(true)
                      }}
                      className="w-full px-4 py-2 bg-surface-card/20 border border-white/20 rounded-lg text-body focus:outline-none focus:border-accent-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-heading mb-2">Slug</label>
                    <input
                      type="text"
                      value={selectedTheme.slug}
                      onChange={(e) => {
                        setSelectedTheme({ ...selectedTheme, slug: e.target.value })
                        if (!hasUnsavedChanges) setHasUnsavedChanges(true)
                      }}
                      className="w-full px-4 py-2 bg-surface-card/20 border border-white/20 rounded-lg text-body focus:outline-none focus:border-accent-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-heading mb-2">Description</label>
                  <textarea
                    value={selectedTheme.description}
                    onChange={(e) => {
                      setSelectedTheme({ ...selectedTheme, description: e.target.value })
                      if (!hasUnsavedChanges) setHasUnsavedChanges(true)
                    }}
                    rows={3}
                    className="w-full px-4 py-2 bg-surface-card/20 border border-white/20 rounded-lg text-body focus:outline-none focus:border-accent-primary"
                  />
                </div>

                {/* Color Variables */}
                <div>
                  <h3 className="text-lg font-semibold text-heading mb-4">Color Variables</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries({
                      '--color-bg-primary': 'Primary Background',
                      '--color-bg-secondary': 'Secondary Background',
                      '--color-accent-primary': 'Primary Accent',
                      '--color-accent-secondary': 'Secondary Accent',
                      '--color-text-base': 'Base Text',
                      '--color-button-bg': 'Button Background',
                      '--color-button-hover': 'Button Hover'
                    }).map(([variable, label]) => (
                      <div key={variable}>
                        <label className="block text-sm text-body mb-1">{label}</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={selectedTheme.css_variables[variable] || '#000000'}
                            onChange={(e) => handleColorChange(variable, e.target.value)}
                            className="w-12 h-10 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={selectedTheme.css_variables[variable] || ''}
                            onChange={(e) => handleColorChange(variable, e.target.value)}
                            className="flex-1 px-3 py-2 bg-surface-card/20 border border-white/20 rounded text-body text-sm focus:outline-none focus:border-accent-primary"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                  <div>
                    {editMode && (
                      <button
                        onClick={() => handleDeleteTheme(selectedTheme.id)}
                        className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                      >
                        Delete Theme
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        // Remove preview style when canceling
                        const previewStyle = document.getElementById('theme-variables-preview')
                        if (previewStyle) {
                          previewStyle.remove()
                        }
                        setSelectedTheme(null)
                        setEditMode(false)
                        setHasUnsavedChanges(false)
                      }}
                      className="px-6 py-2 text-body hover:text-accent-primary transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveTheme}
                      disabled={saving}
                      className="px-6 py-2 bg-accent-primary hover:bg-accent-primary/90 disabled:bg-gray-600 text-white font-bold rounded-lg transition-colors"
                    >
                      {saving ? 'Saving...' : 'Save Theme'}
                    </button>
                  </div>
                </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}