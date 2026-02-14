'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { adminAPI } from '@/lib/api'
import { Trash2, Pin, PinOff, Star, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'


export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const router = useRouter()

    useEffect(() => {
        loadReviews()
    }, [])

    const loadReviews = async () => {
        try {
            const data = await adminAPI.getReviews()
            setReviews(data)
        } catch (error) {
            console.error('Error loading reviews:', error)
            toast.error('Failed to load reviews')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this review?')) return
        try {
            await adminAPI.deleteReview(id)
            toast.success('Review deleted')
            loadReviews()
        } catch (error) {
            toast.error(error.message || 'Failed to delete review')
        }
    }

    const handleTogglePin = async (id) => {
        try {
            await adminAPI.togglePinReview(id)
            toast.success('Review pin status updated')
            loadReviews()
        } catch (error) {
            toast.error(error.message || 'Failed to update pin status')
        }
    }

    const filteredReviews = reviews.filter(r =>
        r.user?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        r.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.comment.toLowerCase().includes(search.toLowerCase())
    )

    const pinnedCount = reviews.filter(r => r.is_pinned).length

    return (
        <>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
                    <p className="text-muted-foreground mt-1">Manage customer reviews</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-sm">
                        Pinned: {pinnedCount}/3
                    </Badge>
                </div>
            </div>

            <div className="flex gap-4 mb-6">
                <div className="relative max-w-sm flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search reviews..."
                        className="pl-8 bg-white"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Rating</TableHead>
                                <TableHead>Comment</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : filteredReviews.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                        No reviews found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredReviews.map((review) => (
                                    <TableRow key={review.id}>
                                        <TableCell className="font-medium text-xs">
                                            {review.product?.name}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{review.user?.full_name || 'Anonymous'}</span>
                                                <span className="text-xs text-muted-foreground">{review.user?.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex text-amber-500">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-neutral-200'}`} />
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate text-sm" title={review.comment}>
                                            {review.comment}
                                            {review.image_url && <span className="ml-2 text-xs text-blue-500">(Image)</span>}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-xs">
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleTogglePin(review.id)}
                                                    className={review.is_pinned ? "text-blue-600 bg-blue-50" : "text-muted-foreground"}
                                                    title={review.is_pinned ? "Unpin" : "Pin to Homepage (Max 3)"}
                                                >
                                                    {review.is_pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(review.id)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </>
    )
}
