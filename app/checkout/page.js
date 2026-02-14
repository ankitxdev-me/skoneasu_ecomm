'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { ShieldCheck, Lock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { addressAPI, cartAPI, orderAPI } from '@/lib/api'
import { loadRazorpay } from '@/lib/razorpay'
import { toast } from 'sonner'
import { useCart } from '@/contexts/CartContext'
import { MapPin } from 'lucide-react'

export default function CheckoutPage() {
    const router = useRouter()
    const { register, handleSubmit, setValue, formState: { errors } } = useForm()
    const [loading, setLoading] = useState(false)
    // const [cartTotal, setCartTotal] = useState(0) // Removed local state using context now
    const [paymentMethod, setPaymentMethod] = useState('online')
    const [addresses, setAddresses] = useState([])
    const {
        refreshCart, cartDiscount, cartTotal, cartGST,
        couponCode, setCouponCode, appliedCoupon, setAppliedCoupon,
        couponDiscount, setCouponDiscount, couponError, setCouponError,
        couponSuccess, setCouponSuccess, clearCoupon
    } = useCart()

    // Local state for UI loading
    const [validatingCoupon, setValidatingCoupon] = useState(false)

    // Coupon State - REMOVED (using Context)

    const [shippingFee, setShippingFee] = useState(70)
    const [freeShippingThreshold, setFreeShippingThreshold] = useState(999)
    const [codEnabled, setCodEnabled] = useState(true)

    useEffect(() => {
        loadSettings()
        loadAddresses()
    }, [])

    const loadSettings = async () => {
        try {
            // Public endpoint or admin? Settings should be public for customers
            // Since we protected the /admin/settings route, we can't use it here directly unless user is admin
            // We should use a public method or just hardcode defaults with a TODO if we didn't make a public endpoint
            // BUT, in `create-settings-table.sql`, I added "Enable read access for all users".
            // So I can query Supabase directly here!
            const { supabase } = await import('@/lib/supabase')
            const { data } = await supabase
                .from('store_settings')
                .select('key, value')
                .in('key', ['shipping_fee', 'free_shipping_threshold', 'cod_enabled'])

            if (data) {
                data.forEach(item => {
                    if (item.key === 'shipping_fee') setShippingFee(Number(item.value))
                    if (item.key === 'free_shipping_threshold') setFreeShippingThreshold(Number(item.value))
                    if (item.key === 'cod_enabled') setCodEnabled(String(item.value) === 'true')
                })
            }
        } catch (error) {
            console.error('Failed to load settings', error)
        }
    }

    const loadAddresses = async () => {
        try {
            const data = await addressAPI.getAll()
            setAddresses(data || [])
        } catch (error) {
            console.error('Failed to load addresses', error)
        }
    }

    const handleAddressSelect = (address) => {
        setValue('full_name', address.full_name)
        setValue('phone', address.phone)
        setValue('address_line1', address.address_line1)
        setValue('address_line2', address.address_line2)
        setValue('city', address.city)
        setValue('state', address.state)
        setValue('postal_code', address.postal_code)
        setValue('country', address.country)
        toast.info('Address applied')
    }

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return

        setValidatingCoupon(true)
        setCouponError('')
        setCouponSuccess('')

        try {
            const response = await fetch('/api/coupons/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: couponCode,
                    total_amount: cartTotal
                })
            })

            const data = await response.json()

            if (!response.ok) {
                setCouponError(data.error || 'Invalid coupon')
                setCouponDiscount(0)
                setAppliedCoupon(null)
            } else {
                setCouponDiscount(data.discount_amount)
                setAppliedCoupon({
                    code: data.coupon_code,
                    id: data.coupon_id
                })
                setCouponSuccess(`Coupon ${data.coupon_code} applied! You saved ₹${data.discount_amount}`)
                toast.success('Coupon applied successfully')
            }
        } catch (error) {
            setCouponError('Failed to validate coupon')
        } finally {
            setValidatingCoupon(false)
        }
    }

    const handleRemoveCoupon = () => {
        clearCoupon()
        toast.info('Coupon removed')
    }

    const loadCartTotal = async () => {
        try {
            const items = await cartAPI.get()
            // Only redirect if explicitly empty array is returned (not null/undefined which might be error)
            // and maybe add a small delay or check URL to avoid loop?
            // actually simpler: just show empty state UI or redirect ONCE.
            if (Array.isArray(items) && items.length === 0) {
                toast.info('Your cart is empty')
                router.push('/cart')
                return
            }
            if (!items) return
            const total = items.reduce((sum, item) => {
                const price = item.variant
                    ? (item.product.discount_price || item.product.price) + item.variant.price_modifier
                    : (item.product.discount_price || item.product.price)
                return sum + (price * item.quantity)
            }, 0)
            setCartTotal(total)
        } catch (error) {
            console.error(error)
            router.push('/')
        }
    }


    const shippingCost = cartTotal < freeShippingThreshold ? shippingFee : 0

    const onSubmit = async (data) => {
        if (paymentMethod === 'cod' && !codEnabled) {
            toast.error('Cash on Delivery is currently unavailable')
            return
        }
        setLoading(true)
        try {
            // Sanitize phone number
            const sanitizedData = {
                ...data,
                // Ensure phone is string
                phone: String(data.phone).replace(/\D/g, ''),
                coupon_code: appliedCoupon ? appliedCoupon.code : null
            }

            // 1. Create Order
            const { order, razorpay } = await orderAPI.create({
                shipping_address: sanitizedData,
                coupon_code: appliedCoupon ? appliedCoupon.code : null,
                payment_method: paymentMethod,
                notes: data.notes
            })

            // If COD, we are done
            if (paymentMethod === 'cod') {
                toast.success('Order placed successfully!')
                refreshCart()
                router.push('/orders')
                return
            }

            if (!razorpay || !razorpay.success) {
                toast.error('Failed to initialize payment gateway')
                console.error('Razorpay Error:', razorpay)
                setLoading(false)
                return
            }

            // 2. Open Razorpay
            const res = await loadRazorpay()
            if (!res) {
                toast.error('Razorpay SDK failed to load')
                setLoading(false)
                return
            }

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: razorpay.amount,
                currency: razorpay.currency,
                name: 'Skoneasu',
                description: `Order #${order.id.slice(0, 8)}`,
                order_id: razorpay.orderId,
                handler: async function (response) {
                    try {
                        // 3. Verify Payment
                        await orderAPI.verifyPayment({
                            order_id: razorpay.orderId,
                            payment_id: response.razorpay_payment_id,
                            signature: response.razorpay_signature
                        })

                        toast.success('Order placed successfully!')
                        refreshCart()
                        router.push('/orders')
                    } catch (err) {
                        console.error('Verification Error:', err)
                        toast.error(err.message || 'Payment verification failed')
                    }
                },
                prefill: {
                    name: sanitizedData.full_name,
                    email: 'user@example.com', // In real app, get from auth context
                    contact: sanitizedData.phone
                },
                theme: {
                    color: '#8b597b' // Mauve (Secondary)
                }
            }

            const paymentObject = new window.Razorpay(options)
            paymentObject.open()

        } catch (error) {
            console.error(error)
            toast.error(error.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            <Header />

            <div className="container mx-auto px-4 py-12">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl font-serif font-bold text-primary mb-8 text-center">Checkout</h1>

                    <div className="grid gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ShieldCheck className="text-green-600" /> Secure Checkout
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    {addresses.length > 0 && (
                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-lg flex items-center gap-2"><MapPin className="h-4 w-4" /> Saved Addresses</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {addresses.map((addr) => (
                                                    <div
                                                        key={addr.id}
                                                        className="border rounded-lg p-4 cursor-pointer hover:border-amber-500 hover:bg-amber-50 transition-colors"
                                                        onClick={() => handleAddressSelect(addr)}
                                                    >
                                                        <p className="font-medium">{addr.full_name}</p>
                                                        <p className="text-sm text-neutral-600">{addr.address_line1}, {addr.city}</p>
                                                        <p className="text-xs text-neutral-500 mt-1">Click to use this address</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="relative">
                                                <div className="absolute inset-0 flex items-center">
                                                    <span className="w-full border-t" />
                                                </div>
                                                <div className="relative flex justify-center text-xs uppercase">
                                                    <span className="bg-white px-2 text-muted-foreground">Or enter new address</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-lg">Shipping Information</h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Full Name</label>
                                                <Input {...register('full_name', { required: true })} placeholder="John Doe" />
                                                {errors.full_name && <span className="text-red-500 text-xs">Required</span>}
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Phone Number</label>
                                                <Input {...register('phone', { required: true })} placeholder="+91 98765 43210" />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Address Line 1</label>
                                            <Input {...register('address_line1', { required: true })} placeholder="123 Luxury Lane" />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Address Line 2 (Optional)</label>
                                            <Input {...register('address_line2')} />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">City</label>
                                                <Input {...register('city', { required: true })} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">State</label>
                                                <Input {...register('state', { required: true })} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Postal Code</label>
                                                <Input {...register('postal_code', { required: true })} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Country</label>
                                                <Input {...register('country', { required: true })} defaultValue="India" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-lg">Order Notes (Optional)</h3>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Notes for Administrator / Delivery Instructions</label>
                                            <textarea
                                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                placeholder="e.g. Please ring the doorbell, Leave at front desk..."
                                                {...register('notes')}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-lg">Payment Method</h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            <label className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-secondary bg-muted/20 ring-1 ring-secondary' : 'border-border hover:border-primary/50'}`}>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="radio"
                                                        name="payment_method"
                                                        value="online"
                                                        className="h-4 w-4 text-amber-600"
                                                        checked={paymentMethod === 'online'}
                                                        onChange={() => setPaymentMethod('online')}
                                                    />
                                                    <div>
                                                        <p className="font-medium text-neutral-900">Online Payment</p>
                                                        <p className="text-xs text-neutral-500">Credit/Debit Card, UPI, Net Banking</p>
                                                    </div>
                                                </div>
                                            </label>

                                            <label className={`flex items-center justify-between p-4 border rounded-lg transition-all ${!codEnabled
                                                ? 'opacity-50 cursor-not-allowed bg-neutral-100 border-neutral-200'
                                                : paymentMethod === 'cod'
                                                    ? 'border-secondary bg-muted/20 ring-1 ring-secondary cursor-pointer'
                                                    : 'border-border hover:border-primary/50 cursor-pointer'
                                                }`}>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="radio"
                                                        name="payment_method"
                                                        value="cod"
                                                        className="h-4 w-4 text-amber-600 disabled:opacity-50"
                                                        checked={paymentMethod === 'cod'}
                                                        onChange={() => setPaymentMethod('cod')}
                                                        disabled={!codEnabled}
                                                    />
                                                    <div>
                                                        <p className={`font-medium ${!codEnabled ? 'text-neutral-400' : 'text-neutral-900'}`}>Cash on Delivery</p>
                                                        <p className={`text-xs ${!codEnabled ? 'text-neutral-400' : 'text-neutral-500'}`}>
                                                            {!codEnabled ? 'Currently unavailable' : 'Pay when you receive the order'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="bg-neutral-100 p-4 rounded-lg space-y-4">
                                        {/* Coupon Input */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Have a coupon?</label>
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <Input
                                                        placeholder="Enter code"
                                                        value={couponCode}
                                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                        disabled={!!appliedCoupon}
                                                        className={couponError ? 'border-red-500' : couponSuccess ? 'border-green-500' : ''}
                                                    />
                                                    {(couponSuccess || couponError) && (
                                                        <span className={`text-xs absolute -bottom-5 left-0 ${couponError ? 'text-red-500' : 'text-green-600'}`}>
                                                            {couponError || couponSuccess}
                                                        </span>
                                                    )}
                                                </div>
                                                {appliedCoupon ? (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={handleRemoveCoupon}
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    >
                                                        Remove
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        onClick={handleApplyCoupon}
                                                        disabled={!couponCode || validatingCoupon}
                                                    >
                                                        {validatingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="border-t border-neutral-200 pt-4 space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span>Subtotal</span>
                                                <span>₹{cartTotal.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Shipping</span>
                                                <span>
                                                    {shippingCost === 0 ? (
                                                        <span className="text-green-600 font-medium">Free</span>
                                                    ) : (
                                                        `₹${shippingCost}`
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-neutral-500">
                                                <span>GST (12% included)</span>
                                                <span>₹{Math.round(cartTotal * 0.12).toLocaleString()}</span>
                                            </div>

                                            {/* GST Discount Display */}
                                            <div className="flex justify-between text-green-600">
                                                <span>Early Order Discount</span>
                                                <span>-₹{Math.round(cartTotal * 0.12).toLocaleString()}</span>
                                            </div>

                                            {/* Courier Discount Display (Coupon) */}
                                            {couponDiscount > 0 && (
                                                <div className="flex justify-between text-green-600 font-medium animate-in fade-in slide-in-from-right-5">
                                                    <span>Coupon Discount ({appliedCoupon?.code})</span>
                                                    <span>-₹{couponDiscount.toLocaleString()}</span>
                                                </div>
                                            )}

                                            <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                                                <span>Total</span>
                                                <span>₹{(cartTotal + shippingCost - couponDiscount).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Button type="submit" className="w-full h-12 text-lg" disabled={loading}>
                                        {loading ? 'Processing...' : (paymentMethod === 'cod' ? 'Place Order' : `Pay ₹${(cartTotal + (cartTotal < freeShippingThreshold ? shippingFee : 0) - couponDiscount).toLocaleString('en-IN')}`)}
                                        {paymentMethod === 'online' && <Lock className="ml-2 h-4 w-4" />}
                                    </Button>

                                    <p className="text-center text-xs text-neutral-500 flex items-center justify-center gap-1">
                                        <Lock className="h-3 w-3" /> Payments are secure and encrypted
                                    </p>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div >

            <Footer />
        </div >
    )
}
