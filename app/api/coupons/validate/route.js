import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use Anon Key for read-only validation access (allowed by RLS policy "Public can read active coupons")
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(request) {
    try {
        const { code, total_amount } = await request.json()

        if (!code) {
            return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 })
        }

        // Fetch coupon
        const { data: coupon, error } = await supabase
            .from('coupons')
            .select('*')
            .eq('code', code.toUpperCase())
            .eq('active', true)
            .single()

        if (error || !coupon) {
            return NextResponse.json({ error: 'Invalid coupon code' }, { status: 404 })
        }

        // 1. Check Expiry
        if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
            return NextResponse.json({ error: 'Coupon has expired' }, { status: 400 })
        }

        // 2. Check Usage Limit
        if (coupon.usage_limit !== null && (coupon.used_count || 0) >= coupon.usage_limit) {
            return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 })
        }

        // 3. Check Minimum Order Amount
        if (coupon.min_order_amount && total_amount < coupon.min_order_amount) {
            return NextResponse.json({
                error: `Minimum order amount of ₹${coupon.min_order_amount} required`
            }, { status: 400 })
        }

        // Calculate Discount
        let discount = 0
        if (coupon.discount_type === 'percent') {
            discount = (total_amount * coupon.discount_value) / 100
            if (coupon.max_discount_amount) {
                discount = Math.min(discount, coupon.max_discount_amount)
            }
        } else {
            discount = coupon.discount_value
        }

        // Ensure discount doesn't exceed total
        discount = Math.min(discount, total_amount)

        return NextResponse.json({
            valid: true,
            discount_amount: Math.round(discount * 100) / 100,
            coupon_code: coupon.code,
            coupon_id: coupon.id,
            type: coupon.discount_type,
            value: coupon.discount_value
        })

    } catch (error) {
        console.error('Coupon validation error:', error)
        return NextResponse.json({ error: 'Validation failed' }, { status: 500 })
    }
}
