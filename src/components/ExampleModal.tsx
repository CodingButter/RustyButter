import { useState } from 'react'
import { Modal } from './Modal'

// Example of how to use the Modal component
export function ExampleModal() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-accent-primary text-white rounded-lg"
      >
        Open Example Modal
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Example Modal"
        subtitle="This shows how easy it is to create a modal"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <p className="text-body">
            This is a simple example showing how to use the Modal component. 
            You can easily wrap any content with the Modal component to give it 
            instant modal functionality.
          </p>
          
          <div className="bg-accent-primary/10 border border-accent-primary/20 rounded-lg p-4">
            <h3 className="text-heading font-semibold mb-2">Features:</h3>
            <ul className="text-body space-y-1 list-disc list-inside">
              <li>Automatic centering</li>
              <li>Click outside to close</li>
              <li>Close button in header</li>
              <li>Customizable max width</li>
              <li>Optional subtitle</li>
              <li>Responsive design</li>
            </ul>
          </div>

          <button 
            onClick={() => setIsOpen(false)}
            className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Close Modal
          </button>
        </div>
      </Modal>
    </>
  )
}