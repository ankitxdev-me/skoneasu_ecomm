'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { adminAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, FileText } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminOrdersPage() {
    const router = useRouter()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchOrders()
    }, [])

    const fetchOrders = async () => {
        try {
            const data = await adminAPI.orders.getAll()
            setOrders(data || [])
        } catch (error) {
            toast.error('Failed to load orders')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await adminAPI.orders.updateStatus(orderId, newStatus)
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
            toast.success('Order status updated')
        } catch (error) {
            toast.error('Failed to update status')
        }
    }

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-serif font-bold text-neutral-900">Orders</h1>

            <Card>
                <CardHeader>
                    <CardTitle>All Orders ({orders.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow
                                    key={order.id}
                                    className={`cursor-pointer transition-colors
                                        ${order.status === 'cancelled' ? 'bg-neutral-100/50 hover:bg-neutral-100 text-neutral-500' :
                                            order.status === 'delivered' ? 'bg-green-50/30 hover:bg-green-50/50' :
                                                'hover:bg-neutral-50'}`}
                                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                                >
                                    <TableCell className="font-mono text-xs">
                                        {order.id.slice(0, 8)}
                                        {(order.cancellation_status === 'requested' || order.address_change_status === 'requested') && (
                                            <span className="ml-2 text-red-500">●</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        <div className="font-medium">{new Date(order.created_at).toLocaleDateString()}</div>
                                        <div className="text-xs text-neutral-500">{new Date(order.created_at).toLocaleTimeString()}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">{order.user?.full_name || 'Guest'}</p>
                                            <p className="text-xs text-neutral-500">{order.user?.email}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>₹{order.total_amount.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                    ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {order.payment_status.toUpperCase()}
                                        </span>
                                    </TableCell>
                                    <TableCell onClick={(e) => e.stopPropagation()}>
                                        <select
                                            className="h-8 w-32 rounded-md border border-neutral-300 bg-transparent px-2 text-sm"
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="processing">Processing</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </TableCell>
                                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                        <Link href={`/orders/${order.id}/invoice`} target="_blank">
                                            <Button variant="ghost" size="icon" title="Download Invoice">
                                                <FileText className="h-4 w-4 text-neutral-600 hover:text-neutral-900" />
                                            </Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
