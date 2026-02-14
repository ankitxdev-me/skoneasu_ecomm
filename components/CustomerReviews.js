'use client'

import { useState, useEffect } from 'react'
import { reviewAPI } from '@/lib/api'
import { Star, Quote } from 'lucide-react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

export default function CustomerReviews() {
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadPinnedReviews()
    }, [])

    const loadPinnedReviews = async () => {
        try {
            const data = await reviewAPI.getPinned()
            setReviews(data)
        } catch (error) {
            console.error('Error loading pinned reviews:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading || reviews.length === 0) return null

    return (
        <section className="py-24 bg-neutral-50">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-16 text-primary">
                    What Our Customers Say
                </h2>

                <div className="flex overflow-x-auto pb-8 md:grid md:grid-cols-3 gap-8 snap-x snap-mandatory hide-scrollbar">
                    {reviews.map((review) => (
                        <div key={review.id} className="flex-shrink-0 w-[66vw] md:w-auto snap-center pt-6">
                            <Card className="border-none shadow-lg bg-white relative overflow-visible h-full">
                                <div className="absolute -top-6 left-8 bg-amber-500 text-white p-3 rounded-full shadow-md z-10">
                                    <Quote className="h-6 w-6 fill-current" />
                                </div>
                                <CardContent className="pt-12 pb-8 px-8 flex flex-col h-full">
                                    <div className="flex text-amber-500 mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-neutral-200'}`} />
                                        ))}
                                    </div>

                                    <p className="text-neutral-600 mb-6 italic leading-relaxed min-h-[80px] flex-grow">
                                        "{review.comment}"
                                    </p>

                                    <div className="flex items-center gap-4 pt-6 border-t border-neutral-100 mt-auto">
                                        <div className="h-12 w-12 rounded-full overflow-hidden bg-neutral-100 relative shrink-0">
                                            {review.user?.avatar_url ? (
                                                <Image src={review.user.avatar_url} alt={review.user.full_name} fill className="object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center bg-amber-100 text-amber-800 font-bold text-lg">
                                                    {review.user?.full_name?.charAt(0) || 'C'}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-primary">{review.user?.full_name || 'Customer'}</div>
                                            {review.product && (
                                                <div className="text-xs text-neutral-400 mt-0.5">
                                                    purchased <Link href={`/product/${review.product.slug}`} className="text-amber-600 hover:underline">{review.product.name}</Link>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
