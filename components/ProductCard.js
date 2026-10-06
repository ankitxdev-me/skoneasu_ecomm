'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, Star, Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'

export default function ProductCard({ product }) {
  const router = useRouter()
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()

  if (!product) return null

  const isWishlisted = isInWishlist(product.id)
  const cartItem = (Array.isArray(cart) ? cart : []).find(item => item.product_id === product.id)

  const price = product.discount_price || product.price
  const hasDiscount = product.discount_price && product.discount_price < product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0

  // Pure dynamic badge mapping from database product fields
  const renderBadge = () => {
    if (product.best_seller) {
      return (
        <span className="bg-[#E53935] text-white font-sans font-bold text-[11px] sm:text-[12px] px-2 py-0.5 rounded shadow-sm">
          Bestseller
        </span>
      )
    }
    if (hasDiscount) {
      return (
        <span className="bg-[#E53935] text-white font-sans font-bold text-[11px] sm:text-[12px] px-2 py-0.5 rounded shadow-sm">
          -{discountPercent}%
        </span>
      )
    }
    if (product.new_arrival) {
      return (
        <span className="bg-[#B87545] text-white font-sans font-bold text-[11px] sm:text-[12px] px-2 py-0.5 rounded shadow-sm">
          New
        </span>
      )
    }
    return null
  }

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product)
  }

  const handleIncrement = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (cartItem) updateQuantity(cartItem.id, cartItem.quantity + 1)
  }

  const handleDecrement = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (cartItem) {
      if (cartItem.quantity > 1) updateQuantity(cartItem.id, cartItem.quantity - 1)
      else removeFromCart(cartItem.id)
    }
  }

  const handleWishlistToggle = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product)
  }

  const hasReviews = Boolean(
    (product.reviewCount && product.reviewCount > 0) ||
    (product.reviews && Array.isArray(product.reviews) && product.reviews.length > 0)
  )
  const rawRating = product.averageRating || (product.reviews?.length ? product.reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / product.reviews.length : 0)
  const ratingFormatted = hasReviews && rawRating ? Number(rawRating).toFixed(1) : null
  const reviewCount = product.reviewCount || product.reviews?.length || 0

  return (
    <Card className="group overflow-hidden bg-white border border-[#E8C7AF]/60 rounded-xl hover:shadow-md transition-all flex flex-col justify-between">
      <CardContent className="p-0 flex flex-col justify-between h-full">
        
        {/* Product Image */}
        <Link href={`/product/${product.slug}`} className="block relative aspect-square overflow-hidden bg-[#F8EEE4]">
          <img
            src={product.images?.[0]?.image_url || '/default-product.jpeg'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />

          {/* Top Left Badge */}
          <div className="absolute top-2 left-2 z-10">
            {renderBadge()}
          </div>

          {/* Top Right Heart Wishlist Button */}
          <button
            type="button"
            onClick={handleWishlistToggle}
            className="absolute top-2 right-2 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 border border-neutral-200 flex items-center justify-center text-neutral-600 hover:text-[#E53935] transition-all"
            aria-label="Wishlist"
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isWishlisted ? 'fill-[#E53935] text-[#E53935]' : ''}`} />
          </button>
        </Link>

        {/* Product Info */}
        <div className="p-2.5 sm:p-3.5 flex flex-col justify-between flex-1">
          <div>
            <Link href={`/product/${product.slug}`}>
              <h3 className="font-sans font-semibold text-[14px] sm:text-[15px] leading-[1.4] text-[#2D1B16] line-clamp-1 group-hover:text-[#B87545] transition-colors">
                {product.name}
              </h3>
            </Link>

            {/* Stars & Rating - Only show if product has real reviews from DB */}
            {hasReviews && ratingFormatted ? (
              <div className="flex items-center gap-1 mt-1 flex-nowrap whitespace-nowrap min-h-[18px]">
                <div className="flex text-[#F59E0B] shrink-0">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B] shrink-0" />
                  ))}
                </div>
                <span className="font-sans font-semibold text-[12px] text-neutral-600 ml-0.5 whitespace-nowrap">
                  {ratingFormatted} ({reviewCount})
                </span>
              </div>
            ) : (
              <div className="min-h-[18px] mt-1" />
            )}

            {/* Price Row */}
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="font-sans font-bold text-[16px] sm:text-[17px] text-[#2D1B16]">
                ₹{price}
              </span>
              {hasDiscount && (
                <span className="font-sans font-normal sm:font-medium text-[12px] sm:text-[13px] text-neutral-400 line-through">
                  ₹{product.price}
                </span>
              )}
            </div>
          </div>

          {/* Actions: Add to Cart button + Heart Button next to it */}
          <div className="mt-2.5 pt-1">
            {cartItem ? (
              <div className="flex items-center justify-between bg-[#F8EEE4] border border-[#E8C7AF] rounded-lg p-0.5 sm:p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 sm:h-7 sm:w-7 p-0 text-[#2D1B16]"
                  onClick={handleDecrement}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-xs font-bold text-[#2D1B16]">{cartItem.quantity} in Cart</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 sm:h-7 sm:w-7 p-0 text-[#2D1B16]"
                  onClick={handleIncrement}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-[#2D1B16] hover:bg-[#432A23] text-white font-sans font-semibold text-[13px] sm:text-[14px] h-7 sm:h-8 rounded-lg"
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={`h-7 sm:h-8 px-2 rounded-lg border-neutral-300 hover:border-[#E53935] ${
                    isWishlisted ? 'text-[#E53935] border-[#E53935]' : 'text-neutral-500'
                  }`}
                  onClick={handleWishlistToggle}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-[#E53935]' : ''}`} />
                </Button>
              </div>
            )}
          </div>

        </div>

      </CardContent>
    </Card>
  )
}
