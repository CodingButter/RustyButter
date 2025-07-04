import { useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { ModalContext, type ModalConfig } from './modalContext'

export function ModalProvider({ children }: { children: ReactNode }) {
  const [activeModal, setActiveModal] = useState<ModalConfig | null>(null)

  const openModal = useCallback((config: ModalConfig) => {
    setActiveModal(config)
  }, [])

  const closeModal = useCallback(() => {
    setActiveModal(prev => {
      if (prev?.onClose) {
        // Defer the onClose callback to avoid state updates during render
        setTimeout(() => prev.onClose(), 0)
      }
      return null
    })
  }, [])

  const isModalOpen = useCallback((id: string) => {
    return activeModal?.id === id
  }, [activeModal])

  return (
    <ModalContext.Provider value={{
      activeModal,
      openModal,
      closeModal,
      isModalOpen
    }}>
      {children}
    </ModalContext.Provider>
  )
}