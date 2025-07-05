import { type ReactNode, useEffect, useState, useCallback } from 'react'
import { ThemeContext } from '@/hooks/useTheme'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import type { ThemeType } from '@/types'

interface ThemeProviderProps {
  children: ReactNode
}

interface DbTheme {
  id: number
  name: string
  slug: string
  description: string
  css_variables: Record<string, string>
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [selectedTheme, setSelectedTheme] = useLocalStorage<string>('rusty-butter-theme', '')
  const [availableThemes, setAvailableThemes] = useState<DbTheme[]>([])
  const [loading, setLoading] = useState(true)

  const fetchThemes = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3003/api/themes')
      if (response.ok) {
        const data = await response.json()
        if (data.themes && data.themes.length > 0) {
          setAvailableThemes(data.themes)
          
          // Apply the selected theme CSS variables
          const theme = data.themes.find((t: DbTheme) => t.slug === selectedTheme)
          if (theme) {
            applyCssVariables(theme.css_variables)
          } else if (data.themes.length > 0) {
            // If selected theme not found, use first available theme
            const firstTheme = data.themes[0]
            setSelectedTheme(firstTheme.slug)
            applyCssVariables(firstTheme.css_variables)
          }
        }
      }
    } catch (error) {
      // Failed to fetch themes - silent error handling
    } finally {
      setLoading(false)
    }
  }, [selectedTheme])

  useEffect(() => {
    fetchThemes()
  }, [fetchThemes])

  const applyCssVariables = (cssVariables: Record<string, string>) => {
    // Remove existing theme style tag if any
    const existingStyle = document.getElementById('theme-variables')
    if (existingStyle) {
      existingStyle.remove()
    }

    // Create new style tag with CSS variables
    const style = document.createElement('style')
    style.id = 'theme-variables'
    style.innerHTML = `:root {
${Object.entries(cssVariables)
  .map(([key, value]) => `  ${key}: ${value};`)
  .join('\n')}
}`
    document.head.appendChild(style)
  }

  const getThemes = () => availableThemes.map(t => t.slug as ThemeType)

  const setThemeHandler = (newTheme: ThemeType) => {
    const theme = availableThemes.find(t => t.slug === newTheme)
    if (theme) {
      setSelectedTheme(newTheme)
      applyCssVariables(theme.css_variables)
    } else {
      // Theme not found - use first available theme
      const fallbackTheme = availableThemes[0]
      if (fallbackTheme) {
        setSelectedTheme(fallbackTheme.slug as ThemeType)
        applyCssVariables(fallbackTheme.css_variables)
      }
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-primary flex items-center justify-center">
      <div className="animate-spin w-12 h-12 border-4 border-accent-primary border-t-transparent rounded-full"></div>
    </div>
  }

  return (
    <ThemeContext.Provider value={{ theme: selectedTheme as ThemeType, setTheme: setThemeHandler, getThemes }}>
      <div className="min-h-screen">{children}</div>
    </ThemeContext.Provider>
  )
}
