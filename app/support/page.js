'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { supportAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Plus, MessageSquare, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

export default function SupportPage() {
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/signin?redirect=/support')
        } else if (user) {
            fetchTickets()
        }
    }, [user, authLoading, router])

    const fetchTickets = async () => {
        try {
            setLoading(true)
            // Use API instead of direct Supabase call to avoid session issues on reload
            const data = await supportAPI.getAll()
            setTickets(data || [])
        } catch (error) {
            console.error('Error fetching tickets via API:', error)
            // Robust fallback to direct client query
            try {
                if (user?.id) {
                    const { data: clientData, error: clientError } = await supabase
                        .from('support_tickets')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false })
                    if (!clientError) {
                        setTickets(clientData || [])
                        return
                    }
                }
            } catch (fallbackErr) {
                console.error('Client query fallback failed:', fallbackErr)
            }
            toast.error('Failed to load tickets')
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'text-green-600 bg-green-50 border-green-200'
            case 'in_progress': return 'text-blue-600 bg-blue-50 border-blue-200'
            case 'closed': return 'text-gray-600 bg-gray-50 border-gray-200'
            default: return 'text-gray-600 bg-gray-50 border-gray-200'
        }
    }

    if (authLoading || (loading && user)) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-neutral-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-neutral-900">Support Tickets</h1>
                        <p className="text-neutral-500 mt-1">Manage your support requests and inquiries</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/">
                            <Button variant="outline">
                                Home
                            </Button>
                        </Link>
                        <Link href="/support/create">
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                New Ticket
                            </Button>
                        </Link>
                    </div>
                </div>

                {tickets.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-neutral-200">
                        <div className="mx-auto h-12 w-12 text-neutral-400 mb-4">
                            <MessageSquare className="h-12 w-12" />
                        </div>
                        <h3 className="text-lg font-medium text-neutral-900 mb-2">No tickets yet</h3>
                        <p className="text-neutral-500 mb-6">Have a question or issue? Create a new support ticket.</p>
                        <Link href="/support/create">
                            <Button variant="outline">Create Ticket</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
                        <div className="divide-y divide-neutral-200">
                            {tickets.map((ticket) => (
                                <Link
                                    key={ticket.id}
                                    href={`/support/${ticket.id}`}
                                    className="block hover:bg-neutral-50 transition-colors p-6"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-lg font-medium text-neutral-900 truncate">
                                                    {ticket.subject}
                                                </h3>
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                                                    {ticket.status.replace('_', ' ').toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-sm text-neutral-500 gap-4">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {format(new Date(ticket.created_at), 'MMM d, yyyy')}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    ID: {ticket.id.slice(0, 8)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="ml-4 flex-shrink-0">
                                            <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center">
                                                <MessageSquare className="h-4 w-4 text-neutral-400" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
