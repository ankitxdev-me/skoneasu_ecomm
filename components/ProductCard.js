'use client'

import Link from 'next/link'
import { Link as LinkIcon, Heart, ShoppingCart, Minus, Plus, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'

export default function ProductCard({ product }) {
    const { cart, addToCart, updateQuantity, removeFromCart } = useCart()
    const { toggleWishlist, isInWishlist } = useWishlist()
    const isWishlisted = isInWishlist(product.id)

    const price = product.discount_price || product.price
    const hasDiscount = product.discount_price && product.discount_price < product.price
    const discountPercent = hasDiscount
        ? Math.round(((product.price - product.discount_price) / product.price) * 100)
        : 0

    // Find if product is in cart
    const cartItem = cart.find(item => item.product_id === product.id && !item.variant_id)

    const handleAddToCart = () => {
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
                            src={product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800'}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {hasDiscount && (
                            <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                -{discountPercent}%
                            </div>
                        )}
                        {product.new_arrival && (
                            <div className="absolute top-3 right-3 bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                New
                            </div>
                        )}
                    </div>
                </Link>

                <div className="p-4">
                    <Link href={`/product/${product.slug}`}>
                        <h3 className="font-semibold text-neutral-900 mb-2 group-hover:text-amber-600 transition-colors line-clamp-1">
                            {product.name}
                        </h3>
                    </Link>

                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg font-bold text-neutral-900">
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
