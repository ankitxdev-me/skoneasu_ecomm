'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { adminAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Loader2, ArrowLeft, AlertTriangle, FileText } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

export default function AdminOrderDetailsPage({ params }) {
    const router = useRouter()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchOrder()
    }, [params.id])

    const fetchOrder = async () => {
        try {
            // We need a specific endpoint or just filter from getAll? 
            // Better to have getById. Admin API didn't have getById exposed in api.js but check route.js
            // route.js doesn't seem to have admin specific getById, it uses handleAdminGetOrders which returns ALL.
            // I should add getById to admin route or just filter client side for now (inefficient but works for small scale).
            // Actually, best to just use the public detailed order endpoint? No, admin needs more info maybe.
            // Let's rely on filtering getAll for MVP or add the endpoint.
            // Wait, looking at route.js:
            // if (path[0] === 'admin' && path[1] === 'orders') { return handleAdminGetOrders }
            // It doesn't handle ID. 
            // I will update api.js to fetch getAll and find, OR user orderAPI.getById if I'm admin?
            // The public orderAPI.getById checks `getAuthUser` and `eq('user_id', user.id)`. So Admin CANNOT use it.
            // I MUST ADD `handleAdminGetOrderById` to route.js or filter client side.
            // Filtering client side is easiest for now.
            const data = await adminAPI.orders.getAll()
            const found = data.find(o => o.id === params.id)
            if (found) {
                setOrder(found)
            } else {
                toast.error('Order not found')
                router.push('/admin/orders')
            }
        } catch (error) {
            toast.error('Failed to load order')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleCancellation = async (status) => {
        try {
            await adminAPI.orders.handleCancellation(order.id, status)
            toast.success(`Cancellation ${status}`)
            fetchOrder()
        } catch (error) {
            toast.error('Failed to update cancellation')
        }
    }

    const handleAddressChange = async (status) => {
        try {
            await adminAPI.orders.handleAddressChange(order.id, status)
            toast.success(`Address request ${status}`)
            fetchOrder()
        } catch (error) {
            toast.error('Failed to update address')
        }
    }

    const handlePaymentStatusChange = async (newStatus) => {
        try {
            await adminAPI.orders.updateStatus(order.id, { payment_status: newStatus })
            setOrder({ ...order, payment_status: newStatus })
            toast.success('Payment status updated')
        } catch (error) {
            toast.error('Failed to update payment status')
        }
    }

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>
    if (!order) return null

    return (
        <div className="space-y-6">
            <Button variant="ghost" onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders</Button>

            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Manage Order #{order.id.slice(0, 8)}</h1>
                <Button variant="outline" onClick={() => window.open(`/orders/${order.id}/invoice`, '_blank')}>
                    <FileText className="mr-2 h-4 w-4" /> Download Invoice
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Requests Section */}
                <div className="space-y-6">
                    {order.cancellation_status === 'requested' && (
                        <Card className="border-red-200 bg-red-50">
                            <CardHeader><CardTitle className="text-red-800 flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Cancellation Requested</CardTitle></CardHeader>
                            <CardContent>
                                <p className="mb-4 text-red-900">Reason: <span className="font-semibold">{order.cancellation_reason}</span></p>
                                <div className="flex gap-4">
                                    <Button variant="destructive" onClick={() => handleCancellation('approved')}>Approve Cancel</Button>
                                    <Button variant="outline" onClick={() => handleCancellation('rejected')}>Reject</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {order.address_change_status === 'requested' && (
                        <Card className="border-amber-200 bg-amber-50">
                            <CardHeader><CardTitle className="text-amber-800 flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Address Change Requested</CardTitle></CardHeader>
                            <CardContent>
                                <div className="bg-white p-3 rounded mb-4 text-sm">
                                    <p className="font-semibold">New Address:</p>
                                    <p>{order.new_shipping_address?.full_name}</p>
                                    <p>{order.new_shipping_address?.address_line1}</p>
                                    <p>{order.new_shipping_address?.city}, {order.new_shipping_address?.state} {order.new_shipping_address?.postal_code}</p>
                                    <p>{order.new_shipping_address?.phone}</p>
                                </div>
                                <div className="flex gap-4">
                                    <Button onClick={() => handleAddressChange('approved')}>Approve Change</Button>
                                    <Button variant="outline" onClick={() => handleAddressChange('rejected')}>Reject</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {order.notes && (
                        <Card className="border-blue-200 bg-blue-50">
                            <CardHeader><CardTitle className="text-blue-800 flex items-center gap-2"><FileText className="h-5 w-5" /> Customer Notes</CardTitle></CardHeader>
                            <CardContent>
                                <p className="text-blue-900 whitespace-pre-wrap">{order.notes}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Details Section */}
                <div className="space-y-6">
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

                    {/* Order Items */}
                    <Card>
                        <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
                        <CardContent>
                            <div className="flex justify-between items-center mb-4">
                                <div>Status: <span className="font-medium">{order.status}</span></div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-neutral-500">Payment:</span>
                                    <select
                                        className={`h-8 rounded-md border text-sm px-2 font-medium focus:ring-1 focus:ring-neutral-900
                                            ${order.payment_status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' :
                                                'bg-neutral-50 text-neutral-700 border-neutral-200'}`}
                                        value={order.payment_status}
                                        onChange={(e) => handlePaymentStatusChange(e.target.value)}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="paid">Paid</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1 mb-4 text-sm">
                                <div className="flex justify-between">
                                    <span>Subtotal (approx):</span>
                                    <span>₹{order.total_amount - (order.shipping_cost || 0) + (order.discount || 0) - (order.tax_amount || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping:</span>
                                    <span>₹{order.shipping_cost}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tax (GST):</span>
                                    <span>₹{order.tax_amount}</span>
                                </div>
                                <div className="flex justify-between text-green-600">
                                    <span>Early Order Discount:</span>
                                    <span>-₹{order.tax_amount}</span>
                                </div>
                                {order.coupon_code && (
                                    <div className="flex justify-between text-green-600 font-medium">
                                        <span>Coupon ({order.coupon_code}):</span>
                                        <span>-₹{(order.discount || 0) - (order.tax_amount || 0)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                    <span>Total:</span>
                                    <span>₹{order.total_amount}</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {order.items?.map(item => (
                                    <div key={item.id} className="flex gap-4 items-center border-b pb-4 last:border-0 last:pb-0">
                                        <div className="relative h-16 w-16 bg-neutral-100 rounded overflow-hidden flex-shrink-0">
                                            {item.product?.images?.[0]?.image_url ? (
                                                <Image
                                                    src={item.product.images[0].image_url}
                                                    alt={item.product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-neutral-400">?</div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{item.product?.name || item.product_name || 'Product'}</p>
                                            {(item.variant_details || item.variant) && (
                                                <div className="text-sm text-neutral-500">
                                                    {(item.variant_details?.variant_type || item.variant?.variant_type)}:&nbsp;
                                                    {(item.variant_details?.variant_value || item.variant?.variant_value)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-neutral-500">{item.quantity} x ₹{item.price}</div>
                                            <div className="font-medium">₹{item.price * item.quantity}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div >
    )
}
