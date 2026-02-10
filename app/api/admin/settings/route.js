import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request) {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseAuthenticated = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            global: { headers: { Authorization: `Bearer ${token}` } }
        }
    )

    const { data: { user }, error: authError } = await supabaseAuthenticated.auth.getUser()
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabaseAuthenticated
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data, error } = await supabaseAuthenticated
        .from('store_settings')
        .select('*')

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const settings = {}
    data.forEach(item => {
        settings[item.key] = item.value
    })

    if (Object.keys(settings).length === 0) {
        return NextResponse.json({
            shipping_fee: 70,
            free_shipping_threshold: 999
        })
    }

    return NextResponse.json(settings)
}

export async function PUT(request) {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseAuthenticated = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            global: { headers: { Authorization: `Bearer ${token}` } }
        }
    )

    const { data: { user }, error: authError } = await supabaseAuthenticated.auth.getUser()
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabaseAuthenticated
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validKeys = ['shipping_fee', 'free_shipping_threshold', 'cod_enabled', 'home_hero_image']
    const updates = []

    for (const [key, value] of Object.entries(body)) {
        if (validKeys.includes(key)) {
            updates.push(
                supabaseAuthenticated
                    .from('store_settings')
                    .upsert({
                        key,
                        value: String(value),
                        updated_at: new Date().toISOString()
                    })
            )
        }
    }

    try {
        const results = await Promise.all(updates)
        for (const result of results) {
            if (result.error) throw result.error
        }
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Settings update error:', error)
        return NextResponse.json({ error: error.message || 'Failed to update settings' }, { status: 500 })
    }
}
