'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Star, Shield, Truck, RefreshCw, Minus, Plus, Heart, Share2, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { productAPI, wishlistAPI } from '@/lib/api'
import { useCart } from '@/contexts/CartContext'
import { toast } from 'sonner'

export default function ProductPage() {
    const { slug } = useParams()
    const router = useRouter()
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedImage, setSelectedImage] = useState(0)
    const [selectedVariant, setSelectedVariant] = useState(null)
    const [quantity, setQuantity] = useState(1)
    const { addToCart } = useCart()

    useEffect(() => {
        loadProduct()
    }, [slug])

    const loadProduct = async () => {
        try {
            const data = await productAPI.getBySlug(slug)
            setProduct(data)
            if (data.variants && data.variants.length > 0) {
                setSelectedVariant(data.variants[0])
            }
        } catch (error) {
            console.error('Error loading product:', error)
            toast.error('Failed to load product details')
        } finally {
            setLoading(false)
        }
    }

    const handleAddToCart = async () => {
        if (!product) return
        setLoading(true)
        try {
            await addToCart(product, quantity, selectedVariant?.id)
            // toast.success('Added to cart') // Context handles this
        } catch (error) {
            // handled in addToCart usually or here
        } finally {
            setLoading(false)
        }
    }

    const handleBuyNow = async () => {
        if (!product) return
        setLoading(true)
        try {
            await addToCart(product, quantity, selectedVariant?.id)
            router.push('/cart')
        } catch (error) {
            console.error('Error in buy now:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddToWishlist = async () => {
        if (!product) return
        try {
            await wishlistAPI.add(product.id)
            toast.success('Added to wishlist')
        } catch (error) {
            console.error('Error adding to wishlist:', error)
            toast.error('Could not add to wishlist. Please login.')
        }
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
        </div>
    }

    if (!product) {
        return <div className="min-h-screen flex items-center justify-center">Product not found</div>
    }

    const currentPrice = selectedVariant
        ? (product.discount_price || product.price) + selectedVariant.price_modifier
        : (product.discount_price || product.price)

    const originalPrice = selectedVariant
        ? product.price + selectedVariant.price_modifier
        : product.price

    const hasDiscount = product.discount_price && product.discount_price < product.price

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <div className="aspect-square relative overflow-hidden rounded-xl bg-neutral-100">
                            <img
                                src={product.images?.[selectedImage]?.image_url || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800'}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            {product.images?.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 ${selectedImage === idx ? 'border-amber-600' : 'border-transparent'
                                        }`}
                                >
                                    <img
                                        src={img.image_url}
                                        alt={`${product.name} view ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div>
                        <div className="mb-2 text-sm text-secondary font-medium tracking-wide">
                            {product.categories?.map(c => c.category?.name).filter(Boolean).join(', ')}
                        </div>
                        <h1 className="text-4xl font-serif font-bold text-primary mb-4">
                            {product.name}
                        </h1>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex text-amber-500">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} className={`h-5 w-5 ${i < Math.round(product.averageRating || 5) ? 'fill-current' : 'text-neutral-300'}`} />
                                ))}
                            </div>
                            <span className="text-neutral-500 text-sm">
                                ({product.reviewCount || 0} reviews)
                            </span>
                        </div>

                        <div className="text-3xl font-bold text-primary mb-6 flex items-baseline gap-3">
                            ₹{currentPrice.toLocaleString('en-IN')}
                            {hasDiscount && (
                                <span className="text-xl text-neutral-400 line-through font-normal">
                                    ₹{originalPrice.toLocaleString('en-IN')}
                                </span>
                            )}
                        </div>

                        <div className="prose prose-neutral mb-8">
                            <p>{product.description}</p>
                        </div>

                        {/* Variants */}
                        {product.variants && product.variants.length > 0 && (
                            <div className="mb-8">
                                <h3 className="font-semibold mb-3">
                                    Select {product.variants[0].variant_type}:
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {product.variants.map((variant) => (
                                        <button
                                            key={variant.id}
                                            onClick={() => setSelectedVariant(variant)}
                                            className={`px-4 py-2 rounded border ${selectedVariant?.id === variant.id
                                                ? 'bg-neutral-900 text-white border-neutral-900'
                                                : 'bg-white text-neutral-900 border-neutral-200 hover:border-neutral-900'
                                                }`}
                                        >
                                            {variant.variant_value}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <div className="flex items-center border border-neutral-300 rounded-lg">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="px-4 py-2 hover:bg-neutral-100"
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <span className="w-12 text-center font-medium">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="px-4 py-2 hover:bg-neutral-100"
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                            <Button size="lg" className="flex-1" onClick={handleAddToCart} disabled={loading}>
                                <ShoppingCart className="mr-2 h-5 w-5" />
                                Add to Cart
                            </Button>
                            <Button size="lg" variant="secondary" className="flex-1" onClick={handleBuyNow} disabled={loading}>
                                Buy Now
                            </Button>
                            <Button size="lg" variant="outline" onClick={handleAddToWishlist}>
                                <Heart className="h-5 w-5" />
                            </Button>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8 border-t border-neutral-100">
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30">
                                <Shield className="h-5 w-5 text-secondary" />
                                <div>
                                    <h4 className="font-semibold text-sm text-primary">Authentic</h4>
                                    <p className="text-xs text-muted-foreground">Certified</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30">
                                <Truck className="h-5 w-5 text-secondary" />
                                <div>
                                    <h4 className="font-semibold text-sm text-primary">Free Shipping</h4>
                                    <p className="text-xs text-muted-foreground">On over ₹50k</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30">
                                <RefreshCw className="h-5 w-5 text-secondary" />
                                <div>
                                    <h4 className="font-semibold text-sm text-primary">30-Day Returns</h4>
                                    <p className="text-xs text-muted-foreground">Hassle-free returns</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-20">
                    <h2 className="text-2xl font-serif font-bold mb-8">Customer Reviews</h2>
                    {product.reviews && product.reviews.length > 0 ? (
                        <div className="grid gap-6">
                            {product.reviews.map(review => (
                                <Card key={review.id} className="bg-neutral-50 shadow-none border-none">
                                    <CardContent className="p-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="font-semibold">{review.user?.full_name || 'Anonymous'}</div>
                                            <span className="text-neutral-400 text-sm">•</span>
                                            <div className="text-neutral-400 text-sm">
                                                {new Date(review.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="flex text-amber-500 mb-3">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-neutral-200'}`} />
                                            ))}
                                        </div>
                                        <p className="text-neutral-700">{review.comment}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <p className="text-neutral-500 italic">No reviews yet. Be the first to review this artwork!</p>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    )
}
