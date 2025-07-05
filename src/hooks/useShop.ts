import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { useAuth } from './useAuth'
import { useLocalStorage } from './useLocalStorage'

export interface ShopItem {
  id: string
  name: string
  description: string
  shortDescription: string
  price: number
  originalPrice?: number
  category: 'vip' | 'kits' | 'cosmetics' | 'boosters' | 'bundles'
  images: string[]
  features: string[]
  popular?: boolean
  limited?: boolean
  discount?: number
  badge?: string
  inStock: boolean
  maxQuantity?: number
}

export interface CartItem extends ShopItem {
  quantity: number
}

export interface ShopState {
  items: ShopItem[]
  cart: CartItem[]
  selectedItem: ShopItem | null
  cartOpen: boolean
  checkoutOpen: boolean
  isLoading: boolean
  searchQuery: string
  selectedCategory: string
  sortBy: 'price' | 'name' | 'popular'
}

interface ShopContextType extends ShopState {
  addToCart: (item: ShopItem, quantity?: number) => void
  removeFromCart: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  selectItem: (item: ShopItem | null) => void
  toggleCart: () => void
  toggleCheckout: () => void
  setSearchQuery: (query: string) => void
  setSelectedCategory: (category: string) => void
  setSortBy: (sort: 'price' | 'name' | 'popular') => void
  getCartTotal: () => number
  getCartItemCount: () => number
  filteredItems: ShopItem[]
}

const ShopContext = createContext<ShopContextType | undefined>(undefined)

export function useShop() {
  const context = useContext(ShopContext)
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider')
  }
  return context
}

// Fallback items for when API is unavailable
const fallbackItems: ShopItem[] = [
  {
    id: 'vip-monthly',
    name: 'VIP Monthly Membership',
    description: 'Unlock premium features, exclusive kits, priority queue access, and special privileges on the server.',
    shortDescription: 'Premium server access with exclusive perks',
    price: 9.99,
    category: 'vip',
    images: ['https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&h=600&fit=crop&crop=center'],
    features: ['Priority queue access', 'Custom chat colors', 'VIP areas', '1.5x gather rate'],
    popular: true,
    inStock: true,
    badge: 'Most Popular'
  }
]

export function useShopState(): ShopContextType {
  const { isAuthenticated, token } = useAuth()
  
  // Use localStorage for guest cart persistence
  const [localCart, setLocalCart] = useLocalStorage<CartItem[]>('guest-cart', [])
  
  const [state, setState] = useState<ShopState>({
    items: fallbackItems,
    cart: localCart, // Initialize with localStorage cart
    selectedItem: null,
    cartOpen: false,
    checkoutOpen: false,
    isLoading: true,
    searchQuery: '',
    selectedCategory: 'all',
    sortBy: 'popular'
  })

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true }))
        const response = await fetch('http://localhost:3003/api/shop/products')
        if (response.ok) {
          const data = await response.json()
          setState(prev => ({ 
            ...prev, 
            items: data.products || fallbackItems,
            isLoading: false 
          }))
        } else {
          throw new Error('API response not ok')
        }
      } catch (error) {
        // Using fallback shop data - API not available
        setState(prev => ({ 
          ...prev, 
          items: fallbackItems,
          isLoading: false 
        }))
      }
    }

    fetchProducts()
  }, [])

  const loadCartFromServer = useCallback(async () => {
    if (!token) return
    
    try {
      const response = await fetch('http://localhost:3003/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        // Convert server cart format to local cart format
        interface ServerCartItem {
          slug: string
          name: string
          price: number
          quantity: number
          image?: string
        }
        const serverCart = data.cartItems.map((item: ServerCartItem) => ({
          id: item.slug,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          // Add other required properties with defaults
          description: '',
          shortDescription: '',
          category: 'unknown' as const,
          images: [item.image || ''],
          features: [],
          inStock: true
        }))
        setState(prev => ({ ...prev, cart: serverCart }))
      }
    } catch (error) {
      // Failed to load cart from server
    }
  }, [token])

  // Load cart from server for authenticated users, or from localStorage for guests
  useEffect(() => {
    if (isAuthenticated && token) {
      loadCartFromServer()
    } else {
      // For guest users, use localStorage cart
      setState(prev => ({ ...prev, cart: localCart }))
    }
  }, [isAuthenticated, token, localCart, loadCartFromServer])

  const addToCart = async (item: ShopItem, quantity: number = 1) => {
    // Update local cart immediately for better UX
    setState(prev => {
      const existingItem = prev.cart.find(cartItem => cartItem.id === item.id)
      let newCart: CartItem[]
      
      if (existingItem) {
        const newQuantity = Math.min(
          existingItem.quantity + quantity,
          item.maxQuantity || 99
        )
        newCart = prev.cart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: newQuantity }
            : cartItem
        )
      } else {
        newCart = [...prev.cart, { ...item, quantity }]
      }
      
      // Persist to localStorage for guest users
      if (!isAuthenticated) {
        setLocalCart(newCart)
      }
      
      return {
        ...prev,
        cart: newCart
      }
    })

    // Sync with server if authenticated
    if (isAuthenticated && token) {
      try {
        // Find the product ID from the database
        const product = state.items.find(p => p.id === item.id)
        if (product) {
          await fetch('http://localhost:3003/api/cart', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              productId: product.id, // Use the database product ID
              quantity
            })
          })
        }
      } catch (error) {
        // Failed to sync cart with server - silent error handling
      }
    }
  }

  const removeFromCart = async (itemId: string) => {
    // Update local cart immediately
    setState(prev => {
      const newCart = prev.cart.filter(item => item.id !== itemId)
      
      // Persist to localStorage for guest users
      if (!isAuthenticated) {
        setLocalCart(newCart)
      }
      
      return {
        ...prev,
        cart: newCart
      }
    })

    // Sync with server if authenticated
    if (isAuthenticated && token) {
      try {
        await fetch(`http://localhost:3003/api/cart/${itemId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      } catch (error) {
        // Failed to remove item from server cart - silent error handling
      }
    }
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId)
      return
    }
    
    setState(prev => {
      const newCart = prev.cart.map(item =>
        item.id === itemId
          ? { ...item, quantity: Math.min(quantity, item.maxQuantity || 99) }
          : item
      )
      
      // Persist to localStorage for guest users
      if (!isAuthenticated) {
        setLocalCart(newCart)
      }
      
      return {
        ...prev,
        cart: newCart
      }
    })
  }

  const clearCart = async () => {
    // Update local cart immediately
    setState(prev => {
      // Persist to localStorage for guest users
      if (!isAuthenticated) {
        setLocalCart([])
      }
      
      return { ...prev, cart: [] }
    })

    // Clear server cart if authenticated
    if (isAuthenticated && token) {
      try {
        // Remove all items from server cart
        const promises = state.cart.map(item =>
          fetch(`http://localhost:3003/api/cart/${item.id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        )
        await Promise.all(promises)
      } catch (error) {
        // Failed to clear server cart - silent error handling
      }
    }
  }

  const selectItem = (item: ShopItem | null) => {
    setState(prev => ({ ...prev, selectedItem: item }))
  }

  const toggleCart = () => {
    setState(prev => ({ ...prev, cartOpen: !prev.cartOpen }))
  }

  const toggleCheckout = () => {
    setState(prev => ({ ...prev, checkoutOpen: !prev.checkoutOpen }))
  }

  const setSearchQuery = (query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }))
  }

  const setSelectedCategory = (category: string) => {
    setState(prev => ({ ...prev, selectedCategory: category }))
  }

  const setSortBy = (sort: 'price' | 'name' | 'popular') => {
    setState(prev => ({ ...prev, sortBy: sort }))
  }

  const getCartTotal = () => {
    return state.cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getCartItemCount = () => {
    return state.cart.reduce((count, item) => count + item.quantity, 0)
  }

  const filteredItems = state.items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(state.searchQuery.toLowerCase())
    const matchesCategory = state.selectedCategory === 'all' || item.category === state.selectedCategory
    return matchesSearch && matchesCategory
  }).sort((a, b) => {
    switch (state.sortBy) {
      case 'price':
        return a.price - b.price
      case 'name':
        return a.name.localeCompare(b.name)
      case 'popular':
        return (b.popular ? 1 : 0) - (a.popular ? 1 : 0)
      default:
        return 0
    }
  })

  return {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    selectItem,
    toggleCart,
    toggleCheckout,
    setSearchQuery,
    setSelectedCategory,
    setSortBy,
    getCartTotal,
    getCartItemCount,
    filteredItems
  }
}

export { ShopContext }