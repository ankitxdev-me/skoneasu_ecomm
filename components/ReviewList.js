'use client'

import { Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'

export default function ReviewList({ reviews }) {
    if (!reviews || reviews.length === 0) {
        return (
            <div className="text-center py-12 text-neutral-500 italic bg-neutral-50 rounded-lg">
                No reviews yet. Be the first to review this product!
            </div>
        )
    }

    return (
        <div className="grid gap-6">
            {reviews.map((review) => (
                <Card key={review.id} className="bg-neutral-50 shadow-none border-none">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-lg">
                                    {review.user?.full_name?.charAt(0) || 'A'}
                                </div>
                                <div>
                                    <div className="font-semibold text-neutral-900">{review.user?.full_name || 'Anonymous'}</div>
                                    <div className="text-xs text-neutral-500">
                                        {new Date(review.created_at).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </div>
                            </div>
                            <div className="flex text-amber-400">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-neutral-200'}`}
                                    />
                                ))}
                            </div>
                        </div>

                        <p className="text-neutral-700 leading-relaxed mb-4">{review.comment}</p>

                        {review.image_url && (
                            <div className="mt-4">
                                <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-neutral-200 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(review.image_url, '_blank')}>
                                    <Image
                                        src={review.image_url}
                                        alt="Review attachment"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
