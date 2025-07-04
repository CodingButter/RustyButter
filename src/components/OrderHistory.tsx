import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Modal } from './Modal'

interface OrderItem {
  id: number
  productName: string
  quantity: number
  price: number
  totalPrice: number
}

interface Order {
  id: number
  orderNumber: string
  total: number
  status: string
  paymentStatus: string
  deliveryStatus: string
  itemsSummary: string
  createdAt: string
  items?: OrderItem[]
}

interface OrderHistoryModalProps {
  isOpen: boolean
  onClose: () => void
}

export function OrderHistoryModal({ isOpen, onClose }: OrderHistoryModalProps) {
  const { token, user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const fetchOrders = useCallback(async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch('http://localhost:3003/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders || [])
      } else {
        setError('Failed to load order history')
      }
    } catch (error) {
      // Error fetching orders
      setError('Network error occurred')
    }
    
    setIsLoading(false)
  }, [token])

  useEffect(() => {
    if (isOpen && token) {
      fetchOrders()
    }
  }, [isOpen, token, fetchOrders])

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-400 bg-green-500/20'
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/20'
      case 'cancelled':
        return 'text-red-400 bg-red-500/20'
      case 'processing':
        return 'text-blue-400 bg-blue-500/20'
      default:
        return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getDeliveryStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'text-green-400 bg-green-500/20'
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/20'
      case 'processing':
        return 'text-blue-400 bg-blue-500/20'
      default:
        return 'text-gray-400 bg-gray-500/20'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Order History"
      subtitle="View your purchase history and order status"
      maxWidth="4xl"
    >
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-accent-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-body">Loading your orders...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-400 text-4xl mb-4">⚠️</div>
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchOrders}
                className="px-4 py-2 bg-accent-primary hover:bg-accent-primary/90 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted text-6xl mb-4">🛍️</div>
              <h3 className="text-xl font-semibold text-heading mb-2">No Orders Yet</h3>
              <p className="text-body mb-6">You haven't made any purchases yet. Visit our shop to get started!</p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-accent-primary hover:bg-accent-primary/90 text-white rounded-lg transition-colors"
              >
                Browse Shop
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-surface-card/10 rounded-xl p-6 border border-white/10 hover:border-accent-primary/30 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-heading">#{order.orderNumber}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDeliveryStatusColor(order.deliveryStatus)}`}>
                          {order.deliveryStatus}
                        </span>
                      </div>
                      <p className="text-body text-sm mb-2">{order.itemsSummary}</p>
                      <p className="text-muted text-xs">{formatDate(order.createdAt)}</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-accent-primary">${order.total.toFixed(2)}</div>
                        <div className="text-xs text-muted">
                          {order.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Pending'}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                        className="px-4 py-2 bg-accent-primary/20 hover:bg-accent-primary/30 text-accent-primary rounded-lg transition-colors"
                      >
                        {selectedOrder?.id === order.id ? 'Hide Details' : 'View Details'}
                      </button>
                    </div>
                  </div>
                  
                  {/* Order Details */}
                  {selectedOrder?.id === order.id && (
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-lg font-semibold text-heading mb-3">Order Information</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted">Order Number:</span>
                              <span className="text-body">{order.orderNumber}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted">Order Status:</span>
                              <span className={`px-2 py-1 rounded text-xs ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted">Payment:</span>
                              <span className="text-body">{order.paymentStatus}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted">Delivery:</span>
                              <span className={`px-2 py-1 rounded text-xs ${getDeliveryStatusColor(order.deliveryStatus)}`}>
                                {order.deliveryStatus}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted">Order Date:</span>
                              <span className="text-body">{formatDate(order.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-lg font-semibold text-heading mb-3">Delivery Information</h4>
                          <div className="bg-accent-primary/10 rounded-lg p-4 border border-accent-primary/20">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-accent-primary">🎮</span>
                              <span className="text-heading font-medium">In-Game Delivery</span>
                            </div>
                            <p className="text-body text-sm mb-2">
                              Items will be delivered to your Rust character: <strong>{user?.rustUsername || 'Your Account'}</strong>
                            </p>
                            <p className="text-muted text-xs">
                              {order.deliveryStatus === 'delivered' 
                                ? '✅ Items have been delivered to your account'
                                : '⏳ Items will be delivered within 5-15 minutes'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
    </Modal>
  )
}