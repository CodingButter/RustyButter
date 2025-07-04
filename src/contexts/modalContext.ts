import { createContext } from 'react'
import type { ReactNode } from 'react'

export interface ModalConfig {
  id: string
  component: ReactNode
  onClose?: () => void
}

export interface ModalContextType {
  activeModal: ModalConfig | null
  openModal: (config: ModalConfig) => void
  closeModal: () => void
  isModalOpen: (id: string) => boolean
}

export const ModalContext = createContext<ModalContextType | undefined>(undefined)