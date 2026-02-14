'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Link as LinkIcon, Heart, ShoppingCart, Minus, Plus, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { Star } from 'lucide-react'

export default function ProductCard({ product }) {
    const { cart, addToCart, updateQuantity, removeFromCart } = useCart()

    const getAverageRating = (p) => {
        return p.averageRating ? Number(p.averageRating) : 0
    }
    const { toggleWishlist, isInWishlist } = useWishlist()
    const isWishlisted = isInWishlist(product.id)

    const price = product.discount_price || product.price
    const hasDiscount = product.discount_price && product.discount_price < product.price
    const discountPercent = hasDiscount
        ? Math.round(((product.price - product.discount_price) / product.price) * 100)
        : 0

    // Find if product is in cart
    const cartItem = cart.find(item => item.product_id === product.id && !item.variant_id)

    const router = useRouter()

    const handleAddToCart = () => {
        if (product.variants && product.variants.length > 0) {
            router.push(`/product/${product.slug}`)
            return
        }
        addToCart(product)
    }

    const handleIncrement = () => {
        if (cartItem) {
            updateQuantity(cartItem.id, cartItem.quantity + 1)
        } else {
            addToCart(product)
        }
    }

    const handleDecrement = () => {
        if (cartItem) {
            if (cartItem.quantity > 1) {
                updateQuantity(cartItem.id, cartItem.quantity - 1)
            } else {
                removeFromCart(cartItem.id)
            }
        }
    }

    return (
        <Card className="group overflow-hidden border-neutral-200 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-0">
                <Link href={`/product/${product.slug}`}>
                    <div className="relative aspect-square overflow-hidden bg-neutral-100">
                        <img
                            src={product.images?.[0]?.image_url || '/default-product.jpeg'}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {hasDiscount && (
                            <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-0.5 rounded text-xs font-semibold z-10">
                                -{discountPercent}%
                            </div>
                        )}
                        {product.new_arrival && (
                            <div className="absolute bottom-3 left-3 bg-amber-600 text-white px-2 py-0.5 rounded text-xs font-semibold z-10">
                                New
                            </div>
                        )}

                        {/* Circular Rating Badge */}
                        <div className="absolute top-3 right-3 w-14 h-14 bg-white/90 backdrop-blur-sm rounded-full shadow-sm flex flex-col items-center justify-center border border-amber-100 z-10">
                            {/* Semicircle Stars Arc */}
                            <div className="absolute top-1 w-full h-full">
                                {[...Array(5)].map((_, i) => {
                                    // Spread 5 stars across top 100 degrees (-50 to +50 from top center)
                                    const rotation = -50 + (i * 25)
                                    return (
                                        <div
                                            key={i}
                                            className="absolute top-0 left-1/2 -ml-1 h-1/2 origin-bottom"
                                            style={{ transform: `rotate(${rotation}deg)` }}
                                        >
                                            <Star
                                                className={`w-2 h-2 ${i < Math.round(getAverageRating(product)) ? 'fill-amber-500 text-amber-500' : 'text-neutral-300'}`}
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                            <span className="text-xs font-bold text-neutral-900 mt-3">
                                {getAverageRating(product) > 0 ? getAverageRating(product).toFixed(1) : '-'}
                            </span>
                        </div>


                    </div>
                </Link>

                <div className="p-3">
                    <Link href={`/product/${product.slug}`}>
                        <div className="flex justify-between items-start gap-2 mb-2">
                            <h3 className="font-semibold text-sm md:text-base text-neutral-900 group-hover:text-amber-600 transition-colors line-clamp-1">
                                {product.name}
                            </h3>
                            {getAverageRating(product) > 0 && (
                                <div className="flex items-center gap-1 shrink-0 bg-neutral-100 px-1.5 py-0.5 rounded">
                                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                    <span className="text-xs font-medium text-neutral-900">
                                        {getAverageRating(product).toFixed(1)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </Link>



                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-base md:text-lg font-bold text-neutral-900">
                            ₹{price?.toLocaleString('en-IN')}
                        </span>
                        {hasDiscount && (
                            <span className="text-sm text-neutral-500 line-through">
                                ₹{product.price?.toLocaleString('en-IN')}
                            </span>
                        )}
                    </div>

                    <div className="space-y-2">
                        {cartItem ? (
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between border border-neutral-200 rounded-md p-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0"
                                        onClick={handleDecrement}
                                    >
                                        <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="text-sm font-medium w-8 text-center">{cartItem.quantity}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0"
                                        onClick={handleIncrement}
                                    >
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                </div>
                                <Button size="sm" variant="secondary" className="w-full text-xs" asChild>
                                    <Link href="/cart">
                                        Go to Cart <ArrowRight className="ml-1 h-3 w-3" />
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    className="flex-1"
                                    onClick={handleAddToCart}
                                >
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    Add to Cart
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className={`px-2 ${isWishlisted ? 'text-secondary border-secondary' : 'text-neutral-500'}`}
                                    onClick={() => toggleWishlist(product)}
                                >
                                    <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
