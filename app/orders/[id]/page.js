'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { orderAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Header from '@/components/Header'
import { Loader2, ArrowLeft, Package, Clock, MapPin, AlertCircle, FileText } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

export default function OrderDetailsPage({ params }) {
    const router = useRouter()
    const { user, loading: authLoading } = useAuth()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)

    // Cancellation State
    const [showCancelForm, setShowCancelForm] = useState(false)
    const [cancelReason, setCancelReason] = useState('')
    const [submittingCancel, setSubmittingCancel] = useState(false)

    // Address Change State
    const [showAddressForm, setShowAddressForm] = useState(false)
    const [newAddress, setNewAddress] = useState({
        full_name: '', address_line1: '', city: '', state: '', postal_code: '', phone: ''
    })
    const [submittingAddress, setSubmittingAddress] = useState(false)

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/signin?redirect=/orders')
        } else if (user) {
            fetchOrder()
        }
    }, [user, authLoading, params.id])

    const fetchOrder = async () => {
        try {
            const data = await orderAPI.getById(params.id)
            setOrder(data)
        } catch (error) {
            toast.error('Failed to load order')
            router.push('/orders')
        } finally {
            setLoading(false)
        }
    }

    const handleCancelRequest = async (e) => {
        e.preventDefault()
        if (!cancelReason.trim()) return tooltip.error('Reason is required')

        setSubmittingCancel(true)
        try {
            await orderAPI.requestCancellation(order.id, cancelReason)
            toast.success('Cancellation requested successfully')
            setShowCancelForm(false)
            fetchOrder() // Refresh to show updated status
        } catch (error) {
            toast.error(error.message || 'Failed to request cancellation')
        } finally {
            setSubmittingCancel(false)
        }
    }

    const handleAddressRequest = async (e) => {
        e.preventDefault()
        setSubmittingAddress(true)
        try {
            await orderAPI.requestAddressChange(order.id, newAddress)
            toast.success('Address change requested successfully')
            setShowAddressForm(false)
            fetchOrder()
        } catch (error) {
            toast.error(error.message || 'Failed to request address change')
        } finally {
            setSubmittingAddress(false)
        }
    }

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-neutral-50 flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
                </div>
            </div>
        )
    }

    if (!order) return null

    const canModify = order.status === 'pending' || order.status === 'processing' || order.status === 'paid'

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <Button variant="ghost" className="mb-6 pl-0 hover:pl-2 transition-all" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Orders
                </Button>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Order Details */}
                    <div className="flex-1 space-y-6">
                        <Card>
                            <CardHeader className="border-b bg-neutral-50">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-xl">Order #{order.id.slice(0, 8)}</CardTitle>
                                        <p className="text-neutral-500 text-sm mt-1">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button variant="outline" size="sm" onClick={() => window.open(`/orders/${order.id}/invoice`, '_blank')}>
                                            <FileText className="mr-2 h-4 w-4" /> Invoice
                                        </Button>
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium 
                                            ${order.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                order.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-neutral-100 text-neutral-700'}`}>
                                            {order.status.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-neutral-100">
                                    {order.items?.map((item) => (
                                        <div key={item.id} className="p-6 flex gap-6">
                                            <div className="relative h-24 w-24 flex-shrink-0 bg-neutral-100 rounded-md overflow-hidden">
                                                <Image
                                                    src={item.product_image || '/default-product.jpeg'}
                                                    alt={item.product_name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-lg">{item.product_name}</h4>
                                                {item.variant_details && (
                                                    <p className="text-neutral-500">{item.variant_details.variant_type}: {item.variant_details.variant_value}</p>
                                                )}
                                                <div className="flex justify-between mt-4">
                                                    <p className="text-neutral-600">Qty: {item.quantity}</p>
                                                    <p className="font-medium text-lg">₹{item.price.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                            <CardFooter className="bg-neutral-50 p-6 block border-t">
                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-neutral-600">
                                        <span>Subtotal</span>
                                        <span>₹{(order.total_amount - (order.shipping_cost || 0) - (order.tax_amount || 0) + (order.discount || 0)).toLocaleString()}</span>
                                        {/* Note: reverse calculating subtotal because order usually stores final total. 
                                            Actually, let's use the stored values if available. 
                                            order.items * price might be better? 
                                            Let's rely on the math: Total = Subtotal + Shipping + Tax - Discount.
                                            So Subtotal = Total - Shipping - Tax + Discount.
                                            Wait, `order.total_amount` is the final amount.
                                        */}
                                    </div>
                                    <div className="flex justify-between text-neutral-600">
                                        <span>Shipping</span>
                                        <span>₹{(order.shipping_cost || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-neutral-600">
                                        <span>GST (12%)</span>
                                        <span>₹{(order.tax_amount || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-green-600">
                                        <span>Early Order Discount</span>
                                        <span>-₹{(order.tax_amount || 0).toLocaleString()}</span>
                                    </div>
                                    {order.coupon_code && (
                                        <div className="flex justify-between text-green-600 font-medium">
                                            <span>Coupon ({order.coupon_code})</span>
                                            <span>-₹{((order.discount || 0) - (order.tax_amount || 0)).toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t">
                                    <span className="font-medium text-neutral-900">Total Amount</span>
                                    <span className="text-2xl font-bold font-serif text-amber-600">₹{order.total_amount.toLocaleString()}</span>
                                </div>
                            </CardFooter>
                        </Card>
                    </div>

                    {/* Sidebar: Requests & Info */}
                    <div className="w-full lg:w-96 space-y-6">

                        {/* Shipping Address */}
                        <Card>
                            <CardHeader><CardTitle className="text-base">Shipping Address</CardTitle></CardHeader>
                            <CardContent>
                                <div className="space-y-1 text-sm text-neutral-600">
                                    <p className="font-medium text-neutral-900">{order.shipping_address?.full_name}</p>
                                    <p>{order.shipping_address?.address_line1}</p>
                                    <p>{order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.postal_code}</p>
                                    <p>{order.shipping_address?.phone}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Request Sections */}
                        {canModify && (
                            <>
                                {/* Cancellation */}
                                <Card>
                                    <CardHeader><CardTitle className="text-base">Order Cancellation</CardTitle></CardHeader>
                                    <CardContent>
                                        {order.cancellation_status === 'requested' ? (
                                            <div className="bg-amber-50 text-amber-800 p-4 rounded-md flex items-start gap-3">
                                                <Clock className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="font-medium">Cancellation Requested</p>
                                                    <p className="text-sm mt-1">Pending admin approval.</p>
                                                </div>
                                            </div>
                                        ) : order.cancellation_status === 'approved' ? (
                                            <div className="bg-red-50 text-red-800 p-4 rounded-md">Order Cancelled</div>
                                        ) : (order.cancellation_status !== 'rejected' || showCancelForm) ? (
                                            !showCancelForm ? (
                                                <>
                                                    {order.cancellation_status === 'rejected' && (
                                                        <div className="bg-red-50 p-3 rounded-md mb-3 text-sm text-red-800 border border-red-100">
                                                            <p className="font-medium flex items-center gap-2"><AlertCircle className="h-4 w-4" /> Previous Request Rejected</p>
                                                        </div>
                                                    )}
                                                    <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={() => setShowCancelForm(true)}>
                                                        {order.cancellation_status === 'rejected' ? 'Request Cancellation Again' : 'Request Cancellation'}
                                                    </Button>
                                                </>
                                            ) : (
                                                <form onSubmit={handleCancelRequest} className="space-y-4">
                                                    <Textarea
                                                        placeholder="Reason for cancellation..."
                                                        value={cancelReason}
                                                        onChange={(e) => setCancelReason(e.target.value)}
                                                        className="min-h-[100px]"
                                                        required
                                                    />
                                                    <div className="flex gap-2">
                                                        <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowCancelForm(false)}>Cancel</Button>
                                                        <Button type="submit" variant="destructive" className="flex-1" disabled={submittingCancel}>
                                                            {submittingCancel ? 'Sending...' : 'Confirm'}
                                                        </Button>
                                                    </div>
                                                </form>
                                            )
                                        ) : (
                                            <div className="bg-neutral-50 p-4 rounded-md">
                                                <p className="text-red-600 font-medium">Cancellation Rejected</p>
                                                <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => setShowCancelForm(true)}>Request Again</Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Address Change */}
                                <Card>
                                    <CardHeader><CardTitle className="text-base">Change Address</CardTitle></CardHeader>
                                    <CardContent>
                                        {order.address_change_status === 'requested' ? (
                                            <div className="bg-amber-50 text-amber-800 p-4 rounded-md flex items-start gap-3">
                                                <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="font-medium">Address Change Requested</p>
                                                    <p className="text-sm mt-1">Pending admin approval.</p>
                                                </div>
                                            </div>
                                        ) : (
                                            !showAddressForm ? (
                                                <Button variant="outline" className="w-full" onClick={() => {
                                                    setNewAddress(order.shipping_address)
                                                    setShowAddressForm(true)
                                                }}>
                                                    Request Address Change
                                                </Button>
                                            ) : (
                                                <form onSubmit={handleAddressRequest} className="space-y-3">
                                                    <Input placeholder="Full Name" value={newAddress.full_name} onChange={e => setNewAddress({ ...newAddress, full_name: e.target.value })} required />
                                                    <Input placeholder="Address Line 1" value={newAddress.address_line1} onChange={e => setNewAddress({ ...newAddress, address_line1: e.target.value })} required />
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <Input placeholder="City" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} required />
                                                        <Input placeholder="State" value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} required />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <Input placeholder="Postal Code" value={newAddress.postal_code} onChange={e => setNewAddress({ ...newAddress, postal_code: e.target.value })} required />
                                                        <Input placeholder="Phone" value={newAddress.phone} onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} required />
                                                    </div>
                                                    <div className="flex gap-2 mt-2">
                                                        <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowAddressForm(false)}>Cancel</Button>
                                                        <Button type="submit" className="flex-1" disabled={submittingAddress}>
                                                            {submittingAddress ? 'Sending...' : 'Request'}
                                                        </Button>
                                                    </div>
                                                </form>
                                            )
                                        )}
                                    </CardContent>
                                </Card>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
