import { useState, useRef, useEffect } from 'react'
import { useTheme } from '@/hooks/useTheme'
import type { ThemeType } from '@/types'

const themeLabels: Record<ThemeType, string> = {
  organic: 'Organic',
  'organic-light': 'Organic Light',
  'organic-dark': 'Organic Dark',
  cyberpunk: 'Cyberpunk Neon',
  electric: 'Electric City',
  synthwave: 'Retro Synthwave',
  'forest-dark': 'Forest Dark',
  ocean: 'Ocean Blue',
  sunset: 'Sunset Orange',
  material: 'Material Design',
}

export function ThemeSelect() {
  const { theme, setTheme, getThemes } = useTheme()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const themes = getThemes()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full min-w-[140px] px-3 py-2 text-sm bg-primary border border-muted rounded-md text-theme-base hover:bg-surface-card transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        type="button"
      >
        <span>{themeLabels[theme]}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1 bg-primary border border-muted rounded-md shadow-lg z-50">
          <ul role="listbox" className="py-1">
            {themes.map(themeOption => (
              <li key={themeOption} role="option">
                <button
                  onClick={() => {
                    setTheme(themeOption)
                    setIsOpen(false)
                  }}
                  className={`w-full px-3 py-2 text-sm text-left hover:bg-surface-card transition-colors ${
                    theme === themeOption
                      ? 'bg-surface-card text-onprimary font-medium'
                      : 'text-theme-base'
                  }`}
                  type="button"
                >
                  {themeLabels[themeOption]}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
