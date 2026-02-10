import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

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

export async function DELETE(request, { params }) {
    if (!await isAdmin(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Use authenticated client
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const { createClient } = await import('@supabase/supabase-js')
    const supabaseAuthenticated = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            global: { headers: { Authorization: `Bearer ${token}` } }
        }
    )

    const { error } = await supabaseAuthenticated
        .from('coupons')
        .delete()
        .eq('id', id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
