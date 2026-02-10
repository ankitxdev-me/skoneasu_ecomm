'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { orderAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Header from '@/components/Header'
import { Loader2, Package, Calendar, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

export default function OrdersPage() {
    const router = useRouter()
    const { user, loading: authLoading } = useAuth()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/signin?redirect=/orders')
        } else if (user) {
            fetchOrders()
        }
    }, [user, authLoading, router])

    const fetchOrders = async () => {
        try {
            const data = await orderAPI.getAll()
            setOrders(data || [])
        } catch (error) {
            toast.error('Failed to load orders')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    if (authLoading || (loading && user)) {
        return (
            <div className="min-h-screen bg-neutral-50 flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-serif font-bold text-neutral-900 mb-8">My Orders</h1>

                {orders.length === 0 ? (
                    <div className="text-center py-16">
                        <Package className="h-16 w-16 mx-auto text-neutral-300 mb-4" />
                        <h3 className="text-xl font-medium text-neutral-900 mb-2">No orders yet</h3>
                        <p className="text-neutral-600 mb-8">You haven't placed any orders yet. Start shopping to find something you love.</p>
                        <Button asChild>
                            <Link href="/shop">Start Shopping</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <Card key={order.id} className="overflow-hidden">
                                <CardHeader className="bg-neutral-50 border-b border-neutral-200">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium 
                                            ${order.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                        order.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-neutral-100 text-neutral-700'}`}>
                                                    {order.status.toUpperCase()}
                                                </span>
                                            </div>
                                            <CardDescription className="flex items-center gap-2">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </CardDescription>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-sm text-neutral-600">Total Amount</p>
                                                <p className="text-xl font-bold font-serif text-amber-600">
                                                    ₹{order.total_amount.toLocaleString()}
                                                </p>
                                            </div>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/orders/${order.id}`}>
                                                    View Details <ChevronRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                {/* ... content ... */}
                                <CardContent className="p-0">
                                    <div className="divide-y divide-neutral-100">
                                        {order.items?.map((item) => (
                                            <div key={item.id} className="p-4 flex gap-4">
                                                <div className="relative h-20 w-20 flex-shrink-0 bg-neutral-100 rounded-md overflow-hidden">
                                                    {item.product_image ? (
                                                        <Image
                                                            src={item.product_image}
                                                            alt={item.product_name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center text-neutral-400">
                                                            <Package className="h-8 w-8" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium">{item.product_name}</h4>
                                                    {item.variant_details && (
                                                        <p className="text-sm text-neutral-500">
                                                            {item.variant_details.variant_type}: {item.variant_details.variant_value}
                                                        </p>
                                                    )}
                                                    <div className="flex justify-between mt-2">
                                                        <p className="text-sm text-neutral-600">Qty: {item.quantity}</p>
                                                        <p className="font-medium">₹{item.price.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
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
