import { useState } from 'react'
import { useShop } from '@/hooks/useShop'

interface CheckoutModalContentProps {
  onClose: () => void
}

export function CheckoutModalContent({ onClose }: CheckoutModalContentProps) {
  const { cart, getCartTotal, clearCart } = useShop()
  const [isProcessing, setIsProcessing] = useState(false)
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')

  const handleCheckout = async () => {
    if (!email || !username) return
    
    setIsProcessing(true)
    
    try {
      // Create order via API
      const orderData = {
        items: cart.map(item => ({ id: item.id, quantity: item.quantity })),
        customerInfo: { email, username },
        paymentMethod: 'stripe' // In real implementation, this would come from Stripe
      }

      const response = await fetch('http://localhost:3003/api/shop/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      })

      if (response.ok) {
        const result = await response.json()
        alert(result.message || 'Payment successful! Items will be delivered to your account within 5 minutes.')
        clearCart()
      } else {
        const error = await response.json()
        alert(error.error || 'Payment failed. Please try again.')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Payment failed. Please check your connection and try again.')
    }
    
    setIsProcessing(false)
    onClose()
  }

  return (
    <div className="bg-primary border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <h2 className="text-2xl font-bold text-heading">Secure Checkout</h2>
        <button
          onClick={onClose}
          className="text-body hover:text-accent-primary p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Order Summary */}
        <div>
          <h3 className="text-lg font-semibold text-heading mb-4">Order Summary</h3>
          <div className="space-y-3">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center py-2 border-b border-white/10">
                <div>
                  <span className="text-body">{item.name}</span>
                  <span className="text-muted text-sm ml-2">x{item.quantity}</span>
                </div>
                <span className="text-accent-primary font-medium">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2 text-lg font-bold">
              <span className="text-heading">Total:</span>
              <span className="text-accent-primary">${getCartTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-heading">Customer Information</h3>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-heading mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-surface-card/20 border border-white/20 rounded-lg text-body placeholder-muted focus:outline-none focus:border-accent-primary transition-colors"
                placeholder="your@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-heading mb-2">Rust Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 bg-surface-card/20 border border-white/20 rounded-lg text-body placeholder-muted focus:outline-none focus:border-accent-primary transition-colors"
                placeholder="Your in-game name"
                required
              />
              <p className="text-xs text-muted mt-1">Items will be delivered to this character</p>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-accent-primary/10 rounded-lg p-4 border border-accent-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-accent-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span className="text-heading font-medium">Secure Payment</span>
          </div>
          <p className="text-body text-sm">
            Your payment is secured by Stripe. All transactions are encrypted and protected.
          </p>
        </div>

        {/* Delivery Info */}
        <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-blue-400">🎮</span>
            <span className="text-heading font-medium">In-Game Delivery</span>
          </div>
          <p className="text-body text-sm">
            Items will be automatically delivered to your Rust character within 5-15 minutes after payment.
          </p>
        </div>

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={isProcessing || !email || !username}
          className="w-full bg-accent-primary hover:bg-accent-primary/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Processing Payment...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Complete Purchase - ${getCartTotal().toFixed(2)}
            </>
          )}
        </button>

        <p className="text-xs text-muted text-center">
          By completing this purchase, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}