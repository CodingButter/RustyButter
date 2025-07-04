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
  const [selectedTheme, setSelectedTheme] = useLocalStorage<string>('rusty-butter-theme', 'organic-dark')
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
          }
        } else {
          // Use fallback themes if database is empty
          const fallbackThemes: DbTheme[] = [
            {
              id: 1,
              name: 'Organic',
              slug: 'organic',
              description: 'Natural greens and browns with earthy tones',
              css_variables: {
                '--color-bg-primary': '#fae8c0',
                '--color-bg-secondary': '#e2cab7',
                '--color-surface-card': '#e2cab7',
                '--color-text-base': '#2a1f0a',
                '--color-text-onprimary': '#2a1f0a',
                '--color-border-muted': '#c0c9bc',
                '--color-accent-primary': '#679a4b',
                '--color-accent-secondary': '#8fc370',
                '--color-accent-tertiary': '#4a7c2e',
                '--color-gradient-start': '#679a4b',
                '--color-gradient-end': '#8fc370',
                '--color-button-bg': '#679a4b',
                '--color-button-hover': '#4a7c2e',
                '--color-button-text': '#ffffff',
                '--color-overlay': 'rgba(103, 154, 75, 0.1)',
                '--color-shadow': 'rgba(42, 31, 10, 0.1)'
              }
            },
            {
              id: 2,
              name: 'Organic Dark',
              slug: 'organic-dark',
              description: 'Deep forest theme with dark greens',
              css_variables: {
                '--color-bg-primary': '#3a422a',
                '--color-bg-secondary': '#2e3621',
                '--color-surface-card': '#332713',
                '--color-text-base': '#fefefe',
                '--color-text-onprimary': '#fae8c0',
                '--color-border-muted': '#679a4b',
                '--color-accent-primary': '#e2cab7',
                '--color-accent-secondary': '#fae8c0',
                '--color-accent-tertiary': '#c9a890',
                '--color-gradient-start': '#e2cab7',
                '--color-gradient-end': '#679a4b',
                '--color-button-bg': '#e2cab7',
                '--color-button-hover': '#c9a890',
                '--color-button-text': '#332713',
                '--color-overlay': 'rgba(103, 154, 75, 0.15)',
                '--color-shadow': 'rgba(0, 0, 0, 0.3)'
              }
            }
          ]
          setAvailableThemes(fallbackThemes)
          const theme = fallbackThemes.find(t => t.slug === selectedTheme) || fallbackThemes[0]
          applyCssVariables(theme.css_variables)
        }
      }
    } catch (error) {
      // Failed to fetch themes - use defaults
      console.warn('Failed to fetch themes, using defaults')
      setLoading(false)
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
