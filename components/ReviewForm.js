'use client'

import { useState } from 'react'
import { Star, Upload, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase'
import { reviewAPI } from '@/lib/api'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function ReviewForm({ productId, onReviewAdded, onCancel }) {
    const { user } = useAuth()
    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState('')
    const [image, setImage] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB')
            return
        }

        setImage(file)
        setPreviewUrl(URL.createObjectURL(file))
    }

    const removeImage = () => {
        setImage(null)
        setPreviewUrl(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            let imageUrl = null

            if (image) {
                const fileName = `${Date.now()}-${image.name.replace(/[^a-zA-Z0-9]/g, '')}`
                const { data, error } = await supabase.storage
                    .from('review-images')
                    .upload(fileName, image)

                if (error) throw error

                const { data: { publicUrl } } = supabase.storage
                    .from('review-images')
                    .getPublicUrl(fileName)

                imageUrl = publicUrl
            }

            await reviewAPI.create({
                product_id: productId,
                rating,
                comment,
                image_url: imageUrl
            })

            toast.success('Review submitted successfully!')
            onReviewAdded()
            setComment('')
            setRating(5)
            removeImage()
        } catch (error) {
            console.error('Review error:', error)
            toast.error(error.message || 'Failed to submit review')
        } finally {
            setLoading(false)
        }
    }

    if (!user) {
        return (
            <div className="bg-neutral-50 p-6 rounded-lg border border-neutral-100 text-center space-y-4">
                <h3 className="font-semibold text-lg">Write a Review</h3>
                <p className="text-muted-foreground">Please sign in to share your experience.</p>
                <div className="flex justify-center gap-4">
                    <Button variant="outline" asChild>
                        <Link href={`/auth/signin?redirect=/product/${productId}`}>Sign In</Link>
                    </Button>
                    <Button variant="ghost" asChild>
                        <Link href={`/auth/signup?redirect=/product/${productId}`}>Sign Up</Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="bg-neutral-50 p-6 rounded-lg border border-neutral-100 space-y-4">
            <h3 className="font-semibold text-lg">Write a Review</h3>

            <div className="space-y-2">
                <label className="text-sm font-medium">Rating</label>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="focus:outline-none transition-transform hover:scale-110"
                        >
                            <Star
                                className={`h-6 w-6 ${rating >= star ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'
                                    }`}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Your Review</label>
                <Textarea
                    placeholder="Share your thoughts..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    className="min-h-[100px] bg-white"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Add Photo (Optional)</label>
                <div className="flex items-center gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('review-image-upload').click()}
                        className="bg-white"
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Image
                    </Button>
                    <input
                        id="review-image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                    />
                    {previewUrl && (
                        <div className="relative w-16 h-16 rounded border border-neutral-200 overflow-hidden group">
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={removeImage}
                                className="absolute top-0 right-0 bg-red-500 text-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Submit Review
                </Button>
                {onCancel && (
                    <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
                        Cancel
                    </Button>
                )}
            </div>
        </form>
    )
}
