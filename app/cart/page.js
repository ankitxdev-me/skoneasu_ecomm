'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Trash2, ArrowRight, Minus, Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { cartAPI } from '@/lib/api'
import { useCart } from '@/contexts/CartContext'
import { toast } from 'sonner'

export default function CartPage() {
    const {
        cart, loading, updateQuantity, removeFromCart, cartTotal, cartDiscount, cartGST,
        couponCode, setCouponCode, appliedCoupon, setAppliedCoupon,
        couponDiscount, setCouponDiscount, couponError, setCouponError,
        couponSuccess, setCouponSuccess, clearCoupon
    } = useCart()
    const [validatingCoupon, setValidatingCoupon] = useState(false)
    const [shippingFee, setShippingFee] = useState(70)
    const [freeShippingThreshold, setFreeShippingThreshold] = useState(999)

    useEffect(() => {
        loadSettings()
    }, [])

    const loadSettings = async () => {
        try {
            const { supabase } = await import('@/lib/supabase')
            const { data } = await supabase
                .from('store_settings')
                .select('key, value')
                .in('key', ['shipping_fee', 'free_shipping_threshold'])

            if (data) {
                data.forEach(item => {
                    if (item.key === 'shipping_fee') setShippingFee(Number(item.value))
                    if (item.key === 'free_shipping_threshold') setFreeShippingThreshold(Number(item.value))
                })
            }
        } catch (error) {
            console.error('Failed to load settings', error)
        }
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

    return (
        <div className="min-h-screen bg-neutral-50">
            <Header />

            <div className="container mx-auto px-4 py-12">
                <h1 className="text-3xl font-serif font-bold text-primary mb-8">Shopping Cart</h1>

                {loading ? (
                    <div className="text-center py-12">Loading cart...</div>
                ) : cart.length > 0 ? (
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Cart Items */}
                        <div className="flex-1 space-y-4">
                            {cart.map((item) => {
                                const price = item.variant
                                    ? (item.product.discount_price || item.product.price) + item.variant.price_modifier
                                    : (item.product.discount_price || item.product.price)

                                return (
                                    <Card key={item.id} className="border-none shadow-sm">
                                        <CardContent className="p-4 flex gap-4 min-h-[140px]">
                                            <div className="w-24 h-24 bg-neutral-100 rounded-md overflow-hidden flex-shrink-0">
                                                <img
                                                    src={item.product?.images?.[0]?.image_url}
                                                    alt={item.product?.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            <div className="flex-1 flex flex-col justify-between">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <Link href={`/product/${item.product?.slug}`} className="font-semibold text-lg hover:text-amber-600">
                                                            {item.product?.name}
                                                        </Link>
                                                        {item.variant && (
                                                            <p className="text-sm text-neutral-500 mt-1">
                                                                {item.variant.variant_type}: {item.variant.variant_value}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <button onClick={() => removeFromCart(item.id)} className="text-neutral-400 hover:text-red-600">
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </div>

                                                <div className="flex justify-between items-end mt-4">
                                                    <div className="flex items-center border border-neutral-200 rounded">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                            className="p-1 hover:bg-neutral-100"
                                                        >
                                                            <Minus className="h-4 w-4" />
                                                        </button>
                                                        <span className="w-10 text-center text-sm">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="p-1 hover:bg-neutral-100"
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                    <div className="font-bold text-lg">
                                                        ₹{(price * item.quantity).toLocaleString('en-IN')}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>

                        {/* Summary */}
                        <div className="w-full lg:w-96">
                            <Card className="sticky top-24 border-none shadow-sm">
                                <CardContent className="p-6">
                                    <h3 className="font-semibold text-lg mb-4">Order Summary</h3>

                                    {/* Free Delivery Progress */}
                                    {cartTotal < freeShippingThreshold && (
                                        <div className="mb-6 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
                                            Add <span className="font-bold">₹{freeShippingThreshold - cartTotal}</span> more for free delivery!
                                        </div>
                                    )}

                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between text-neutral-600">
                                            <span>Subtotal</span>
                                            <span>₹{cartTotal.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="flex justify-between text-neutral-600">
                                            <span>Shipping</span>
                                            {cartTotal < freeShippingThreshold ? (
                                                <span>₹{shippingFee}</span>
                                            ) : (
                                                <span className="text-green-600">Free</span>
                                            )}
                                        </div>
                                        <div className="flex justify-between text-neutral-600">
                                            <span>GST (12%)</span>
                                            <span>₹{cartGST.toLocaleString('en-IN')}</span>
                                        </div>
                                        <div className="flex justify-between text-neutral-600">
                                            <span>Early Order Discount</span>
                                            <span className="text-green-600">-₹{cartDiscount.toLocaleString('en-IN')}</span>
                                        </div>

                                        {/* Coupon Input */}
                                        <div className="pt-4 pb-2 border-t border-dashed">
                                            {appliedCoupon ? (
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-green-600 font-medium animate-in fade-in slide-in-from-right-5">
                                                        <span>Coupon ({appliedCoupon.code})</span>
                                                        <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={handleRemoveCoupon}
                                                        className="h-auto p-0 text-red-500 hover:text-red-700 hover:bg-transparent text-xs"
                                                    >
                                                        Remove verificationcoupon
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <label className="text-xs font-medium text-neutral-500">Have a coupon?</label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Enter code"
                                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 uppercase"
                                                            value={couponCode}
                                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                        />
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={handleApplyCoupon}
                                                            disabled={!couponCode || validatingCoupon}
                                                        >
                                                            {validatingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                                                        </Button>
                                                    </div>
                                                    {couponError && <p className="text-xs text-red-500">{couponError}</p>}
                                                    {couponSuccess && <p className="text-xs text-green-600">{couponSuccess}</p>}
                                                </div>
                                            )}
                                        </div>
                                        <div className="border-t pt-3 flex justify-between font-bold text-xl text-primary">
                                            <span>Total</span>
                                            <span>₹{(cartTotal + (cartTotal < freeShippingThreshold ? shippingFee : 0) - couponDiscount).toLocaleString('en-IN')}</span>
                                        </div>
                                    </div>

                                    <Button asChild className="w-full h-12 text-lg">
                                        <Link href="/checkout">
                                            Proceed to Checkout <ArrowRight className="ml-2 h-5 w-5" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-lg shadow-sm">
                        <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
                        <p className="text-neutral-500 mb-8">Looks like you haven't added anything yet.</p>
                        <Button asChild size="lg">
                            <Link href="/shop">Start Shopping</Link>
                        </Button>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    )
}
