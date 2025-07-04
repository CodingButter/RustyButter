export type ThemeType = 'organic' | 'organic-light' | 'organic-dark' | 'cyberpunk' | 'electric' | 'synthwave' | 'forest-dark' | 'ocean' | 'sunset' | 'material'

export interface ThemeContextType {
  theme: ThemeType
  setTheme: (theme: ThemeType) => void
  getThemes: () => ThemeType[]
}

export interface ServerInfo {
  name: string
  players: number
  maxPlayers: number
  map: string
}

export interface Player {
  name: string
  score: number
  duration: number
}

export interface ServerStatus {
  online: boolean
  server: ServerInfo
  players: Player[]
  connectionString: string
  timestamp: string
  error?: string
}

export interface ApiError {
  error: string
  message: string
}
