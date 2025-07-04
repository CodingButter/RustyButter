import { useState } from 'react'
import { useShop, type ShopItem } from '@/hooks/useShop'

interface ImageGalleryProps {
  images: string[]
  productName: string
}

function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [currentImage, setCurrentImage] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-surface-card/20 rounded-xl flex items-center justify-center">
        <span className="text-muted text-4xl">{productName.charAt(0)}</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-square rounded-xl overflow-hidden bg-surface-card/20">
        {images[currentImage] ? (
          <img
            src={images[currentImage]}
            alt={productName}
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
          className="absolute inset-0 flex items-center justify-center text-6xl font-bold text-gray-400 bg-gray-800"
          style={{ display: images[currentImage] ? 'none' : 'flex' }}
        >
          {productName.charAt(0).toUpperCase()}
        </div>
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                currentImage === index 
                  ? 'border-accent-primary' 
                  : 'border-white/20 hover:border-white/40'
              }`}
            >
              <div className="relative w-full h-full bg-gray-800">
                {image ? (
                  <img
                    src={image}
                    alt={`${productName} ${index + 1}`}
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
                  className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-400 bg-gray-800"
                  style={{ display: image ? 'none' : 'flex' }}
                >
                  {index + 1}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

interface ProductModalContentProps {
  item: ShopItem
  onClose: () => void
}

export function ProductModalContent({ item, onClose }: ProductModalContentProps) {
  const { addToCart } = useShop()
  const [quantity, setQuantity] = useState(1)

  const handleAddToCart = () => {
    addToCart(item, quantity)
    onClose()
  }

  return (
    <div className="bg-primary border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-heading">{item.name}</h2>
          {item.badge && (
            <span className="px-3 py-1 bg-accent-primary/20 text-accent-primary text-sm font-medium rounded-full border border-accent-primary/30">
              {item.badge}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-body hover:text-accent-primary p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8 p-6">
        {/* Image Gallery */}
        <div>
          <ImageGallery images={item.images} productName={item.name} />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-accent-primary">${item.price}</span>
            {item.originalPrice && (
              <>
                <span className="text-lg text-muted line-through">${item.originalPrice}</span>
                <span className="px-2 py-1 bg-red-500/20 text-red-400 text-sm font-medium rounded">
                  -{item.discount}%
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <p className="text-body leading-relaxed">{item.description}</p>

          {/* Features */}
          <div>
            <h3 className="text-lg font-semibold text-heading mb-3">What's Included:</h3>
            <ul className="space-y-2">
              {item.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-body">
                  <svg className="w-4 h-4 text-accent-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Quantity & Add to Cart */}
          <div className="space-y-4">
            {item.maxQuantity && item.maxQuantity > 1 && (
              <div>
                <label className="block text-sm font-medium text-heading mb-2">Quantity:</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-full bg-surface-card/20 text-body hover:bg-surface-card/40 transition-colors"
                  >
                    -
                  </button>
                  <span className="text-heading font-medium w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(item.maxQuantity || 99, quantity + 1))}
                    className="w-8 h-8 rounded-full bg-surface-card/20 text-body hover:bg-surface-card/40 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={!item.inStock}
              className="w-full bg-accent-primary hover:bg-accent-primary/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              {item.inStock ? `Add to Cart - $${(item.price * quantity).toFixed(2)}` : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}