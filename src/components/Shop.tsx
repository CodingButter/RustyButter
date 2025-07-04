import { useEffect } from 'react'
import { useShop } from '@/hooks/useShop'
import { useModal } from '@/hooks/useModal'
import { ProductModalContent } from './ProductModalContent'
import { CartModalContent } from './CartModalContent'
import { CheckoutModalContent } from './CheckoutModalContent'

export function Shop() {
  const {
    filteredItems,
    selectedItem,
    cartOpen,
    checkoutOpen,
    isLoading,
    searchQuery,
    selectedCategory,
    sortBy,
    selectItem,
    toggleCart,
    toggleCheckout,
    setSearchQuery,
    setSelectedCategory,
    setSortBy,
    addToCart
  } = useShop()
  const { openModal, closeModal, isModalOpen } = useModal()

  // Handle modal opening based on shop state
  useEffect(() => {
    if (selectedItem && !isModalOpen('product-detail')) {
      openModal({
        id: 'product-detail',
        component: (
          <ProductModalContent
            item={selectedItem}
            onClose={() => {
              selectItem(null)
              closeModal()
            }}
          />
        ),
        onClose: () => {
          selectItem(null)
        }
      })
    }
  }, [selectedItem])

  useEffect(() => {
    if (cartOpen && !isModalOpen('shopping-cart')) {
      openModal({
        id: 'shopping-cart',
        component: (
          <CartModalContent
            onClose={() => {
              toggleCart()
              closeModal()
            }}
          />
        ),
        onClose: () => {
          toggleCart()
        }
      })
    }
  }, [cartOpen])

  useEffect(() => {
    if (checkoutOpen && !isModalOpen('checkout')) {
      openModal({
        id: 'checkout',
        component: (
          <CheckoutModalContent
            onClose={() => {
              toggleCheckout()
              closeModal()
            }}
          />
        ),
        onClose: () => {
          toggleCheckout()
        }
      })
    }
  }, [checkoutOpen])

  // Close modals when their state becomes false/null
  useEffect(() => {
    if (!selectedItem && isModalOpen('product-details')) {
      closeModal()
    }
  }, [selectedItem, isModalOpen, closeModal])

  useEffect(() => {
    if (!cartOpen && isModalOpen('shopping-cart')) {
      closeModal()
    }
  }, [cartOpen, isModalOpen, closeModal])

  useEffect(() => {
    if (!checkoutOpen && isModalOpen('checkout')) {
      closeModal()
    }
  }, [checkoutOpen, isModalOpen, closeModal])

  const categories = [
    { id: 'all', name: 'All Items', icon: '🛍️' },
    { id: 'vip', name: 'VIP', icon: '👑' },
    { id: 'kits', name: 'Kits', icon: '📦' },
    { id: 'cosmetics', name: 'Skins', icon: '🎨' },
    { id: 'boosters', name: 'Boosters', icon: '⚡' },
    { id: 'bundles', name: 'Bundles', icon: '🎁' }
  ]

  return (
    <section className="min-h-screen bg-primary py-16 relative overflow-hidden">
      {/* Background Effects with theme colors */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse opacity-20"
             style={{ background: 'var(--color-gradient-start)' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000 opacity-20"
             style={{ background: 'var(--color-gradient-end)' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black text-heading mb-4">
            SERVER <span className="text-accent-primary">SHOP</span>
          </h1>
          <div className="w-32 h-1 mx-auto mb-6" 
               style={{ background: `linear-gradient(90deg, var(--color-gradient-start), var(--color-gradient-end))` }} />
          <p className="text-xl text-body max-w-3xl mx-auto">
            Enhance your Rust experience with premium items, VIP access, and exclusive content. Secure payments powered by Stripe.
          </p>
        </div>

        {/* Shop Controls */}
        <div className="backdrop-blur-sm rounded-2xl p-6 border mb-8"
             style={{ 
               background: 'var(--color-overlay)', 
               borderColor: 'var(--color-border-muted)',
               boxShadow: '0 10px 30px var(--color-shadow)'
             }}>
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg text-body placeholder-muted focus:outline-none transition-all"
                style={{
                  background: 'var(--color-shadow)',
                  borderWidth: '1px',
                  borderStyle: 'solid',
                  borderColor: 'var(--color-border-muted)'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-accent-primary)'
                  e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-overlay)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border-muted)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 hover:scale-105 ${
                    selectedCategory === category.id
                      ? ''
                      : ''
                  }`}
                  style={{
                    background: selectedCategory === category.id ? 'var(--color-button-bg)' : 'var(--color-shadow)',
                    color: selectedCategory === category.id ? 'var(--color-button-text)' : 'var(--color-text-body)',
                    boxShadow: selectedCategory === category.id ? '0 4px 15px var(--color-shadow)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCategory !== category.id) {
                      e.currentTarget.style.background = 'var(--color-overlay)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCategory !== category.id) {
                      e.currentTarget.style.background = 'var(--color-shadow)'
                    }
                  }}
                >
                  <span>{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'price' | 'name' | 'popular')}
              className="px-4 py-2 rounded-lg text-body focus:outline-none transition-all cursor-pointer"
              style={{
                background: 'var(--color-shadow)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'var(--color-border-muted)'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-accent-primary)'
                e.currentTarget.style.boxShadow = '0 0 0 3px var(--color-overlay)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border-muted)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-t-transparent rounded-full mx-auto mb-4"
                 style={{ borderColor: 'var(--color-accent-primary)', borderTopColor: 'transparent' }}></div>
            <p className="text-body">Loading awesome items...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group backdrop-blur-sm rounded-2xl border overflow-hidden transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl"
                style={{
                  background: 'var(--color-overlay)',
                  borderColor: 'var(--color-border-muted)',
                  boxShadow: '0 4px 20px var(--color-shadow)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-accent-primary)'
                  e.currentTarget.style.boxShadow = '0 20px 40px var(--color-shadow)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border-muted)'
                  e.currentTarget.style.boxShadow = '0 4px 20px var(--color-shadow)'
                }}
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-gray-800">
                  {item.images[0] ? (
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        const fallback = target.nextElementSibling as HTMLElement
                        if (fallback) fallback.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <div 
                    className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-gray-400 bg-gray-800"
                    style={{ display: item.images[0] ? 'none' : 'flex' }}
                  >
                    {item.name.charAt(0).toUpperCase()}
                  </div>
                  {item.badge && (
                    <div className="absolute top-3 left-3 px-2 py-1 text-xs font-bold rounded-full"
                         style={{
                           background: 'var(--color-button-bg)',
                           color: 'var(--color-button-text)'
                         }}>
                      {item.badge}
                    </div>
                  )}
                  {item.discount && (
                    <div className="absolute top-3 right-3 px-2 py-1 bg-red-500/90 text-white text-xs font-bold rounded-full">
                      -{item.discount}%
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-bold text-heading text-lg group-hover:text-accent-primary transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-sm text-muted line-clamp-2">{item.shortDescription}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold" style={{ color: 'var(--color-accent-primary)' }}>${item.price}</span>
                      {item.originalPrice && (
                        <span className="text-sm text-muted line-through">${item.originalPrice}</span>
                      )}
                    </div>
                    {!item.inStock && (
                      <span className="text-xs text-red-400 font-medium">Out of Stock</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => selectItem(item)}
                      className="flex-1 px-4 py-2 font-medium rounded-lg transition-all hover:scale-105"
                      style={{
                        background: 'var(--color-shadow)',
                        color: 'var(--color-text-body)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--color-overlay)'
                        e.currentTarget.style.color = 'var(--color-accent-primary)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--color-shadow)'
                        e.currentTarget.style.color = 'var(--color-text-body)'
                      }}
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => addToCart(item)}
                      disabled={!item.inStock}
                      className="px-4 py-2 disabled:bg-gray-600 disabled:cursor-not-allowed font-bold rounded-lg transition-all hover:scale-105"
                      style={{
                        background: !item.inStock ? '#4b5563' : 'var(--color-button-bg)',
                        color: !item.inStock ? '#9ca3af' : 'var(--color-button-text)',
                        boxShadow: item.inStock ? '0 4px 15px var(--color-shadow)' : 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (item.inStock) {
                          e.currentTarget.style.background = 'var(--color-button-hover)'
                          e.currentTarget.style.transform = 'scale(1.05) translateY(-1px)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (item.inStock) {
                          e.currentTarget.style.background = 'var(--color-button-bg)'
                          e.currentTarget.style.transform = 'scale(1)'
                        }
                      }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && filteredItems.length === 0 && (
          <div className="text-center py-12">
            <svg className="w-24 h-24 text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-heading mb-2">No items found</h3>
            <p className="text-muted">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Modals are now handled by useEffect hooks above */}
    </section>
  )
}