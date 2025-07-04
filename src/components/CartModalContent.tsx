import { useShop } from '@/hooks/useShop'

interface CartModalContentProps {
  onClose: () => void
}

export function CartModalContent({ onClose }: CartModalContentProps) {
  const { cart, removeFromCart, updateQuantity, getCartTotal, toggleCheckout, clearCart } = useShop()

  return (
    <div className="bg-primary border border-white/10 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <h2 className="text-xl font-bold text-heading">Shopping Cart ({cart.length})</h2>
        <button
          onClick={onClose}
          className="text-body hover:text-accent-primary p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Cart Items */}
      <div className="space-y-4 max-h-[60vh] overflow-y-auto p-6">
        {cart.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13v8a2 2 0 002 2h6a2 2 0 002-2v-8" />
            </svg>
            <p className="text-muted">Your cart is empty</p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="bg-surface-card/10 rounded-xl p-4 border border-white/10">
              <div className="flex items-start gap-3">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-800">
                  {item.images[0] ? (
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        const fallback = target.nextElementSibling as HTMLElement
                        if (fallback) fallback.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <div 
                    className="absolute inset-0 flex items-center justify-center text-xl font-bold text-gray-400 bg-gray-800"
                    style={{ display: item.images[0] ? 'none' : 'flex' }}
                  >
                    {item.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-heading truncate">{item.name}</h3>
                  <p className="text-sm text-muted truncate">{item.shortDescription}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-accent-primary">${item.price}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-full bg-surface-card/20 text-body hover:bg-surface-card/40 transition-colors text-sm"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm text-body">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-full bg-surface-card/20 text-body hover:bg-surface-card/40 transition-colors text-sm"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="ml-2 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {cart.length > 0 && (
        <div className="border-t border-white/10 p-6 space-y-4">
          <div className="flex justify-between items-center text-lg font-bold">
            <span className="text-heading">Total:</span>
            <span className="text-accent-primary">${getCartTotal().toFixed(2)}</span>
          </div>
          <button
            onClick={() => {
              toggleCheckout()
              onClose()
            }}
            className="w-full bg-accent-primary hover:bg-accent-primary/90 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Complete Purchase - ${getCartTotal().toFixed(2)}
            </>
          </button>
          <div className="flex justify-center">
            <button
              onClick={clearCart}
              className="w-full bg-surface-card/20 hover:bg-surface-card/40 text-body font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Clear Cart
            </button>
          </div>
        </div>
      )}
    </div>
  )
}