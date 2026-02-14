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
import ReviewForm from '@/components/ReviewForm'
import ReviewList from '@/components/ReviewList'

export default function ProductPage() {
    const { slug } = useParams()
    const router = useRouter()
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedImage, setSelectedImage] = useState(0)
    const [selectedVariant, setSelectedVariant] = useState(null)
    const [selectedAttributes, setSelectedAttributes] = useState({}) // { Size: 'S', Color: 'Red' }
    const [availableAttributes, setAvailableAttributes] = useState({}) // { Size: ['S', 'M'], Color: ['Red'] }
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
                // generic way to extract attributes
                const attrs = {}
                data.variants.forEach(v => {
                    const vAttrs = v.attributes || (v.variant_type && v.variant_value ? { [v.variant_type]: v.variant_value } : {})
                    Object.entries(vAttrs).forEach(([key, val]) => {
                        if (!attrs[key]) attrs[key] = new Set()
                        attrs[key].add(val)
                    })
                })

                const attrObj = {}
                Object.keys(attrs).forEach(key => {
                    attrObj[key] = Array.from(attrs[key])
                })
                setAvailableAttributes(attrObj)

                // Select first variant default
                const firstVariant = data.variants[0]
                const firstAttrs = firstVariant.attributes || (firstVariant.variant_type && firstVariant.variant_value ? { [firstVariant.variant_type]: firstVariant.variant_value } : {})
                setSelectedAttributes(firstAttrs)
                setSelectedVariant(firstVariant)
            }
        } catch (error) {
            console.error('Error loading product:', error)
            toast.error('Failed to load product details')
        } finally {
            setLoading(false)
        }
    }

    // Effect to find matching variant when attributes change
    useEffect(() => {
        if (!product || !product.variants) return

        const match = product.variants.find(v => {
            const vAttrs = v.attributes || (v.variant_type && v.variant_value ? { [v.variant_type]: v.variant_value } : {})
            const keys1 = Object.keys(vAttrs)
            const keys2 = Object.keys(selectedAttributes)

            if (keys1.length !== keys2.length) return false
            return keys1.every(key => vAttrs[key] === selectedAttributes[key])
        })

        setSelectedVariant(match || null)
    }, [selectedAttributes, product])

    const handleAttributeSelect = (key, value) => {
        const newAttrs = { ...selectedAttributes, [key]: value }
        setSelectedAttributes(newAttrs)
    }

    const isOptionAvailable = (key, value) => {
        // Check if this option + current other selections leads to a valid variant
        // complex logic can be added here (e.g. disable if size S not available in Red)
        // For now simple check
        return true
    }

    const handleAddToCart = async () => {
        if (!product) return
        if (product.variants && product.variants.length > 0 && !selectedVariant) {
            toast.error('Please select valid options')
            return
        }
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
        if (product.variants && product.variants.length > 0 && !selectedVariant) {
            toast.error('Please select valid options')
            return
        }
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
                                src={product.images?.[selectedImage]?.image_url || '/default-product.jpeg'}
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
                            <div className="mb-8 space-y-4">
                                {Object.entries(availableAttributes).map(([attrName, values]) => (
                                    <div key={attrName}>
                                        <h3 className="font-semibold mb-3">
                                            Select {attrName}: <span className="font-normal text-neutral-600">{selectedAttributes[attrName]}</span>
                                        </h3>
                                        <div className="flex flex-wrap gap-3">
                                            {values.map((val) => (
                                                <button
                                                    key={val}
                                                    onClick={() => handleAttributeSelect(attrName, val)}
                                                    className={`px-4 py-2 rounded border transition-all ${selectedAttributes[attrName] === val
                                                        ? 'bg-neutral-900 text-white border-neutral-900'
                                                        : 'bg-white text-neutral-900 border-neutral-200 hover:border-neutral-900'
                                                        }`}
                                                >
                                                    {val}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {!selectedVariant && (
                                    <div className="text-red-500 text-sm mt-2">
                                        This combination is currently unavailable.
                                    </div>
                                )}
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
                <div className="mt-20 border-t border-neutral-100 pt-12" id="reviews">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-serif font-bold">Customer Reviews</h2>
                        <Button onClick={() => document.getElementById('review-form').scrollIntoView({ behavior: 'smooth' })}>
                            Write a Review
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2">
                            <ReviewList reviews={product.reviews} />
                        </div>

                        <div id="review-form">
                            <ReviewForm
                                productId={product.id}
                                onReviewAdded={() => loadProduct()}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}
