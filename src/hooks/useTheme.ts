import { createContext, useContext } from 'react'
import type { ThemeContextType } from '@/types'

export const ThemeContext = createContext<ThemeContextType>({
  theme: '',
  setTheme: () => {},
  getThemes: () => [],
})

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
