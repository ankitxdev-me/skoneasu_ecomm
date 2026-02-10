'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Header from '@/components/Header'
import { Loader2, Heart, Trash2, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

export default function WishlistPage() {
    const router = useRouter()
    const { user, loading: authLoading } = useAuth()
    const { wishlist, removeFromWishlist } = useWishlist()
    const { addToCart } = useCart()

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/signin?redirect=/wishlist')
        }
    }, [user, authLoading, router])

    const handleAddToCart = (product) => {
        addToCart(product)
        toast.success('Added to cart')
    }

    if (authLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-secondary" />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-serif font-bold text-primary mb-8">My Wishlist</h1>

                {wishlist.length === 0 ? (
                    <div className="text-center py-16">
                        <Heart className="h-16 w-16 mx-auto text-muted mb-4" />
                        <h3 className="text-xl font-medium text-primary mb-2">Your wishlist is empty</h3>
                        <p className="text-muted-foreground mb-8">Save items you love to revisit them later.</p>
                        <Button asChild className="bg-primary text-primary-foreground hover:bg-secondary">
                            <Link href="/shop">Explore Products</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wishlist.map((product) => (
                            <Card key={product.id} className="overflow-hidden group border-border hover:shadow-lg transition-all duration-300">
                                <div className="relative h-64 bg-muted/20">
                                    {product.images && product.images[0]?.image_url ? (
                                        <Image
                                            src={product.images[0].image_url}
                                            alt={product.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                            <Heart className="h-12 w-12" />
                                        </div>
                                    )}
                                    <button
                                        onClick={() => removeFromWishlist(product.id)}
                                        className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full text-destructive hover:bg-white transition-colors"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                                <CardContent className="p-4">
                                    <Link href={`/product/${product.slug}`}>
                                        <h3 className="font-medium text-lg text-primary hover:text-secondary transition-colors mb-1 line-clamp-1">{product.name}</h3>
                                    </Link>
                                    <div className="flex items-center justify-between mt-4">
                                        <p className="font-serif font-bold text-primary">
                                            ₹{product.price?.toLocaleString()}
                                        </p>
                                        <Button size="sm" onClick={() => handleAddToCart(product)} className="bg-primary text-primary-foreground hover:bg-secondary">
                                            <ShoppingCart className="mr-2 h-4 w-4" />
                                            Add to Cart
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
