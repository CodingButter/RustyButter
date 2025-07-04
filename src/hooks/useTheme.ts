import { createContext, useContext } from 'react'
import type { ThemeContextType } from '@/types'

export const ThemeContext = createContext<ThemeContextType>({
  theme: 'organic-light',
  setTheme: () => {},
  getThemes: () => ['organic', 'organic-light', 'organic-dark', 'cyberpunk', 'electric', 'synthwave', 'forest-dark', 'ocean', 'sunset', 'material'],
})

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
