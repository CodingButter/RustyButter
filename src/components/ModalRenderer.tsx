import { useModal } from '@/hooks/useModal'

export function ModalRenderer() {
  const { activeModal, closeModal } = useModal()

  if (!activeModal) return null

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={closeModal}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="min-w-full sm:min-w-[400px] md:min-w-[500px] max-w-full"
      >
        {activeModal.component}
      </div>
    </div>
  )
}