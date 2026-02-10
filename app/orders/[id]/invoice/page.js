'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { orderAPI, adminAPI } from '@/lib/api'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'

export default function InvoicePage() {
    const params = useParams()
    const router = useRouter()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Try to fetch order. If user, use orderAPI. If fails (e.g. admin viewing), try adminAPI?
        // Actually, for simplicity, let's assume if orderAPI fails we might be admin.
        // But better is to check role. For now, let's try standard fetch.
        // Since this page is public route protected by Middleware possibly?
        // Or we can just use the public orderAPI.getById first.
        fetchOrder()
    }, [])

    const fetchOrder = async () => {
        try {
            // Try user API first
            let data
            try {
                data = await orderAPI.getById(params.id)
            } catch (err) {
                // If 404 or auth error, maybe we are admin?
                // adminAPI.orders.getAll() is inefficient.
                // We really need admin getById.
                // But for now, let's assume logged in user/admin context.
                // If this fails, we can't show invoice.
                // Actually, let's assume the user is authorized if they got here.
                // If the user is admin, they can see any order via standard API? NO, RLS blocks it.
                // So Admin needs special handling. 
                // I will try adminAPI.orders.getAll() and find (inefficient but safe).
                const allOrders = await adminAPI.orders.getAll()
                data = allOrders.find(o => o.id === params.id)
            }

            if (data) {
                setOrder(data)
                // Auto trigger print after loading
                setTimeout(() => window.print(), 1000)
            } else {
                throw new Error("Order not found")
            }
        } catch (error) {
            console.error(error)
            // toast.error('Failed to load invoice')
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>
    if (!order) return <div className="p-8 text-center">Order not found</div>

    return (
        <div className="bg-white min-h-screen p-8 text-neutral-900 font-sans max-w-4xl mx-auto" id="invoice">
            {/* Header */}
            <div className="flex justify-between items-start border-b pb-8 mb-8">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-neutral-900">INVOICE</h1>
                    <p className="text-neutral-500 mt-2">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-neutral-500">{new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString()}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold">SKONEASU</h2>
                    <p>157/A, C-6, Block A</p>
                    <p>Najafgarh, New Delhi 110043</p>
                    <p>India</p>
                    <p>support@skoneasu.com</p>
                </div>
            </div>

            {/* Addresses */}
            <div className="flex justify-between mb-12">
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-2">Billed To</h3>
                    <p className="font-semibold">{order.billing_address?.full_name || order.user?.full_name}</p>
                    <p>{order.billing_address?.address_line1}</p>
                    <p>{order.billing_address?.city}, {order.billing_address?.state}</p>
                    <p>{order.billing_address?.postal_code}</p>
                    <p>{order.billing_address?.phone}</p>
                </div>
                <div className="text-right">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-2">Shipped To</h3>
                    <p className="font-semibold">{order.shipping_address?.full_name}</p>
                    <p>{order.shipping_address?.address_line1}</p>
                    <p>{order.shipping_address?.city}, {order.shipping_address?.state}</p>
                    <p>{order.shipping_address?.postal_code}</p>
                    <p>{order.shipping_address?.phone}</p>
                </div>
            </div>

            {/* Items Table */}
            <table className="w-full mb-8">
                <thead>
                    <tr className="border-b-2 border-neutral-900 text-left">
                        <th className="py-3 font-bold">Item</th>
                        <th className="py-3 font-bold text-center">Qty</th>
                        <th className="py-3 font-bold text-right">Price</th>
                        <th className="py-3 font-bold text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {order.items?.map((item, index) => (
                        <tr key={index} className="border-b border-neutral-200 text-sm">
                            <td className="py-4">
                                <p className="font-medium">{item.product_name || item.product?.name}</p>
                                {item.variant_details && (
                                    <p className="text-neutral-500 text-xs">{item.variant_details.variant_type}: {item.variant_details.variant_value}</p>
                                )}
                            </td>
                            <td className="py-4 text-center">{item.quantity}</td>
                            <td className="py-4 text-right">₹{item.price?.toLocaleString()}</td>
                            <td className="py-4 text-right">₹{(item.price * item.quantity).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end">
                <div className="w-64 space-y-2">
                    <div className="flex justify-between text-neutral-600">
                        <span>Subtotal</span>
                        <span>₹{(order.total_amount - (order.shipping_cost || 0) - (order.tax_amount || 0) + (order.discount || 0)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-neutral-600">
                        <span>Shipping</span>
                        <span>{order.shipping_cost ? `₹${order.shipping_cost}` : 'Free'}</span>
                    </div>
                    {/* GST & Discount (Tax Offset) */}
                    <div className="flex justify-between text-neutral-600">
                        <span>GST (12%)</span>
                        <span>₹{order.tax_amount?.toLocaleString() || '0'}</span>
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

                    <div className="flex justify-between border-t border-neutral-900 pt-4 text-xl font-bold">
                        <span>Total</span>
                        <span>₹{order.total_amount.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Payment Info */}
            <div className="mt-8 border-t pt-4">
                <p className="text-sm font-medium">Payment Status: <span className="uppercase">{order.payment_status}</span></p>
                {order.payment_status !== 'paid' && (
                    <p className="text-sm text-neutral-500">Method: {order.payment_method?.toUpperCase().replace('_', ' ')}</p>
                )}
            </div>

            {/* Footer */}
            <div className="mt-16 pt-8 border-t text-center text-neutral-500 text-sm">
                <p>Thank you for shopping with Skoneasu.</p>
                <p className="mt-2">For support, please contact support@skoneasu.com</p>
            </div>

            <style jsx global>{`
                @media print {
                    @page { margin: 0; }
                    body { margin: 1.6cm; }
                }
            `}</style>
        </div >
    )
}
