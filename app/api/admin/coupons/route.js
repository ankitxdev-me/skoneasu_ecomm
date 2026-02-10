import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Helper to check admin role
async function isAdmin(request) {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return false

    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) return false

    const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    return data?.role === 'admin'
}

export async function GET(request) {
    if (!await isAdmin(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseAuthenticated = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            global: { headers: { Authorization: `Bearer ${token}` } }
        }
    )

    const { data, error } = await supabaseAuthenticated
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

export async function POST(request) {
    if (!await isAdmin(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { code, discount_type, discount_value, min_order_amount, max_discount_amount, expiry_date, usage_limit } = body

        // Basic validation
        if (!code || !discount_type || !discount_value) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Use Service Role for insert to ensure we can write if policies are strict,
        // though Admin policy should allow it. Let's use standard client first as user is admin.
        // Actually, to be safe against RLS quirks, let's just use the authenticated user who is confirmed admin.

        const token = request.headers.get('authorization')?.replace('Bearer ', '')
        const { createClient } = await import('@supabase/supabase-js')
        const supabaseAuthenticated = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            {
                global: { headers: { Authorization: `Bearer ${token}` } }
            }
        )

        const { data, error } = await supabaseAuthenticated
            .from('coupons')
            .insert({
                code: code.toUpperCase(),
                discount_type,
                discount_value,
                min_order_amount,
                max_discount_amount,
                expiry_date,
                usage_limit,
                active: true
            })
            .select()
            .single()

        if (error) {
            if (error.code === '23505') { // Unique violation
                return NextResponse.json({ error: 'Coupon code already exists' }, { status: 409 })
            }
            throw error
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Create coupon error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
