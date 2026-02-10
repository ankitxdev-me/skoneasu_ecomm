'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { adminAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge' // Assuming Badge component exists or I use tailwind
import { Loader2, MessageSquare, Filter, Search } from 'lucide-react'
import { format } from 'date-fns'

export default function AdminSupportPage() {
    const { user, profile, loading: authLoading } = useAuth() // Get user too
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState('all')
    const [debugStats, setDebugStats] = useState(null)
    const router = useRouter()

    useEffect(() => {
        if (!authLoading && (!profile || profile.role !== 'admin')) {
            router.push('/')
        } else if (profile?.role === 'admin') {
            fetchTickets()
        }
    }, [profile, authLoading, router])

    const fetchTickets = async () => {
        try {
            setLoading(true)

            // 1. Force Session Check/Restoration (good to have)
            let { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
                if (token) {
                    await supabase.auth.setSession({ access_token: token, refresh_token: '' })
                }
            }

            // 2. USE SERVER-SIDE API (Robust against RLS issues)
            console.log('Fetching tickets via adminAPI...')
            const data = await adminAPI.support.getAll()
            console.log('adminAPI tickets:', data)

            let filteredTickets = data || []

            if (filterStatus !== 'all') {
                filteredTickets = filteredTickets.filter(t => t.status === filterStatus)
            }

            setTickets(filteredTickets)

            setDebugStats({
                total_tickets: data?.length || 0,
                api_success: true,
                message: 'Fetched via Server API'
            })

        } catch (error) {
            console.error('Error fetching tickets:', error)
            toast.error(`Failed to load tickets: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    // Refresh when filter changes
    useEffect(() => {
        if (profile?.role === 'admin') {
            fetchTickets()
        }
    }, [filterStatus])

    const getStatusBadge = (status) => {
        const styles = {
            open: 'bg-green-100 text-green-800 border-green-200',
            in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
            closed: 'bg-neutral-100 text-neutral-800 border-neutral-200'
        }
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.closed}`}>
                {status.replace('_', ' ').toUpperCase()}
            </span>
        )
    }

    if (authLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Debug Info */}
            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 text-xs font-mono text-yellow-800">
                <p><strong>DEBUG INFO:</strong></p>
                <p>User ID: {user?.id}</p>
                <p>Email: {user?.email}</p>
                <p>Role: {profile?.role || 'undefined'}</p>
                <p>Is Admin? {profile?.role === 'admin' ? 'YES' : 'NO'}</p>
                <div className="mt-2 border-t border-yellow-200 pt-2">
                    <p><strong>DB STATS (RPC):</strong></p>
                    <p>Total Tickets: {debugStats?.total_tickets ?? 'Loading...'}</p>
                    <p>API Status: {debugStats?.api_success ? 'SUCCESS' : 'PENDING/FAIL'}</p>
                    <p>Msg: {debugStats?.message || ''}</p>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-serif font-bold text-neutral-900">Support Tickets</h1>
                    <p className="text-neutral-500">Manage and respond to user inquiries</p>
                </div>

                <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-neutral-200">
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filterStatus === 'all' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilterStatus('open')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filterStatus === 'open' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}
                    >
                        Open
                    </button>
                    <button
                        onClick={() => setFilterStatus('closed')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filterStatus === 'closed' ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}
                    >
                        Closed
                    </button>
                </div>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-neutral-200 bg-neutral-50/50">
                                <th className="p-4 font-medium text-neutral-500">Subject</th>
                                <th className="p-4 font-medium text-neutral-500">User</th>
                                <th className="p-4 font-medium text-neutral-500">Status</th>
                                <th className="p-4 font-medium text-neutral-500">Priority</th>
                                <th className="p-4 font-medium text-neutral-500">Date</th>
                                <th className="p-4 font-medium text-neutral-500">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-neutral-500">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                                        Loading tickets...
                                    </td>
                                </tr>
                            ) : tickets.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-neutral-500">
                                        No tickets found.
                                    </td>
                                </tr>
                            ) : (
                                tickets.map((ticket) => (
                                    <tr key={ticket.id} className="hover:bg-neutral-50 group">
                                        <td className="p-4 font-medium text-neutral-900 max-w-[250px] truncate">
                                            {ticket.subject}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-neutral-900">{ticket.user?.full_name || 'Unknown'}</div>
                                            <div className="text-xs text-neutral-500">{ticket.user?.email}</div>
                                        </td>
                                        <td className="p-4">
                                            {getStatusBadge(ticket.status)}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${ticket.priority === 'high' ? 'bg-red-50 text-red-700 border-red-100' :
                                                'bg-neutral-100 text-neutral-600 border-neutral-200'
                                                }`}>
                                                {ticket.priority}
                                            </span>
                                        </td>
                                        <td className="p-4 text-neutral-500 whitespace-nowrap">
                                            {format(new Date(ticket.created_at), 'MMM d, h:mm a')}
                                        </td>
                                        <td className="p-4">
                                            <Link href={`/admin/support/${ticket.id}`}>
                                                <Button variant="outline" size="sm">
                                                    View
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}
