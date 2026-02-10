'use client'

import { useState, useEffect } from 'react'
import { adminAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Loader2, Plus, Trash2, Tag, Calendar, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function CouponsPage() {
    const [coupons, setCoupons] = useState([])
    const [loading, setLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        code: '',
        discount_type: 'percent',
        discount_value: '',
        min_order_amount: '',
        max_discount_amount: '',
        expiry_date: '',
        usage_limit: ''
    })

    useEffect(() => {
        loadCoupons()
    }, [])

    const loadCoupons = async () => {
        try {
            const data = await adminAPI.coupons.getAll()
            setCoupons(data || [])
        } catch (error) {
            console.error('Failed to load coupons', error)
            toast.error('Failed to load coupons')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            const payload = {
                ...formData,
                discount_value: parseFloat(formData.discount_value),
                min_order_amount: formData.min_order_amount ? parseFloat(formData.min_order_amount) : null,
                max_discount_amount: formData.max_discount_amount ? parseFloat(formData.max_discount_amount) : null,
                usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
                expiry_date: formData.expiry_date || null
            }

            await adminAPI.coupons.create(payload)
            toast.success('Coupon created')
            setIsDialogOpen(false)
            setFormData({
                code: '',
                discount_type: 'percent',
                discount_value: '',
                min_order_amount: '',
                max_discount_amount: '',
                expiry_date: '',
                usage_limit: ''
            })
            loadCoupons()
        } catch (error) {
            toast.error(error.message || 'Failed to create coupon')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this coupon?')) return

        try {
            await adminAPI.coupons.delete(id)
            toast.success('Coupon deleted')
            loadCoupons()
        } catch (error) {
            toast.error('Failed to delete coupon')
        }
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-serif font-bold text-neutral-900">Coupons</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Create Coupon
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Create New Coupon</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Coupon Code</label>
                                <Input
                                    required
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    placeholder="e.g. SUMMER25"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Discount Type</label>
                                    <Select
                                        value={formData.discount_type}
                                        onValueChange={(val) => setFormData({ ...formData, discount_type: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="percent">Percentage (%)</SelectItem>
                                            <SelectItem value="flat">Flat Amount (₹)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Value</label>
                                    <Input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={formData.discount_value}
                                        onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                                        placeholder={formData.discount_type === 'percent' ? '10' : '500'}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Min Order (₹)</label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={formData.min_order_amount}
                                        onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                                        placeholder="Optional"
                                    />
                                </div>
                                {formData.discount_type === 'percent' && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Max Discount (₹)</label>
                                        <Input
                                            type="number"
                                            min="0"
                                            value={formData.max_discount_amount}
                                            onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })}
                                            placeholder="Optional"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Expiry Date</label>
                                    <Input
                                        type="date"
                                        value={formData.expiry_date}
                                        onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Usage Limit</label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={formData.usage_limit}
                                        onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                                        placeholder="Unlimited"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button type="submit" disabled={submitting}>
                                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Coupon
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Active Coupons</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Discount</TableHead>
                                    <TableHead>Min Spend</TableHead>
                                    <TableHead>Expiry</TableHead>
                                    <TableHead>Usage</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {coupons.map((coupon) => (
                                    <TableRow key={coupon.id}>
                                        <TableCell className="font-mono font-bold text-neutral-900">
                                            <div className="flex items-center gap-2">
                                                <Tag className="h-4 w-4 text-emerald-600" />
                                                {coupon.code}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {coupon.discount_type === 'percent'
                                                ? `${coupon.discount_value}% OFF`
                                                : `₹${coupon.discount_value} OFF`}
                                            {coupon.max_discount_amount && (
                                                <span className="text-xs text-neutral-500 block">Up to ₹{coupon.max_discount_amount}</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {coupon.min_order_amount ? `₹${coupon.min_order_amount}` : '-'}
                                        </TableCell>
                                        <TableCell>
                                            {coupon.expiry_date ? (
                                                <div className={`flex items-center gap-1 ${new Date(coupon.expiry_date) < new Date() ? 'text-red-500' : ''}`}>
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(coupon.expiry_date).toLocaleDateString()}
                                                </div>
                                            ) : (
                                                <span className="text-neutral-400">No expiry</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {coupon.usage_limit ? (
                                                <span>{coupon.used_count || 0} / {coupon.usage_limit}</span>
                                            ) : (
                                                <span>{coupon.used_count || 0} (∞)</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleDelete(coupon.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {coupons.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-neutral-500">
                                            No coupons found. Create one to get started.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
