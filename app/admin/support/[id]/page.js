'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { adminAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ArrowLeft, Send, Paperclip, X, Loader2, CheckCircle, AlertCircle, User, Mail, Phone } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

export default function AdminTicketDetailPage() {
    const { id } = useParams()
    const { profile, user: currentUser, loading: authLoading } = useAuth()
    const router = useRouter()
    const [ticket, setTicket] = useState(null)
    const [ticketUser, setTicketUser] = useState(null)
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [newMessage, setNewMessage] = useState('')
    const [files, setFiles] = useState([])
    const messagesEndRef = useRef(null)

    useEffect(() => {
        if (!authLoading && (!profile || profile.role !== 'admin')) {
            router.push('/')
            return
        }

        if (profile?.role === 'admin' && id) {
            fetchTicketData()
        }
    }, [profile, id, authLoading])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const fetchTicketData = async () => {
        try {
            setLoading(true)

            // 1. Force Session Check/Restoration (to help with subsequent actions like Reply)
            let { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
                if (token) {
                    await supabase.auth.setSession({ access_token: token, refresh_token: '' })
                }
            }

            // 2. Fetch via Admin API (Bypasses RLS)
            console.log('Fetching ticket details via API for:', id)
            const data = await adminAPI.support.getById(id)
            console.log('Ticket Details:', data)

            if (!data || !data.ticket) throw new Error('Ticket not found')

            setTicket(data.ticket)
            setTicketUser(data.ticket.user)
            setMessages(data.messages || [])

        } catch (error) {
            console.error('Error fetching ticket data:', error)
            toast.error(`Failed to load ticket details: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    const handleFileChange = (e) => {
        if (e.target.files) {
            setFiles(prev => [...prev, ...Array.from(e.target.files)])
        }
    }

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index))
    }

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if ((!newMessage.trim() && files.length === 0) || !currentUser) return

        setSending(true)
        try {
            // 1. Upload files
            const uploadedUrls = []
            if (files.length > 0) {
                for (const file of files) {
                    const fileExt = file.name.split('.').pop()
                    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
                    const filePath = `admin/${fileName}` // Admin uploads go to admin folder or generic

                    const { error: uploadError } = await supabase.storage
                        .from('support-attachments')
                        .upload(filePath, file)

                    if (uploadError) throw uploadError
                    uploadedUrls.push(filePath)
                }
            }

            // 2. Send via Server API
            // Determine new status
            const newStatus = ticket.status === 'open' ? 'in_progress' : ticket.status

            await adminAPI.support.reply(id, {
                message: newMessage,
                attachments: uploadedUrls,
                status: newStatus
            })

            if (newStatus !== ticket.status) {
                setTicket(prev => ({ ...prev, status: newStatus }))
            }

            setNewMessage('')
            setFiles([])
            fetchTicketData() // Refresh messages

        } catch (error) {
            console.error('Error sending message:', error)
            toast.error(`Failed to send message: ${error.message}`)
        } finally {
            setSending(false)
        }
    }

    const updateStatus = async (newStatus) => {
        try {
            await adminAPI.support.updateStatus(id, newStatus)

            setTicket(prev => ({ ...prev, status: newStatus }))
            toast.success(`Ticket marked as ${newStatus.replace('_', ' ')}`)
        } catch (error) {
            console.error('Error updating status:', error)
            toast.error(`Failed to update status: ${error.message}`)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="animate-spin h-8 w-8 text-neutral-400" />
            </div>
        )
    }

    if (!ticket) return <div className="p-8 text-center">Ticket not found</div>

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">

            {/* Main Chat Area */}
            <div className="lg:col-span-2 flex flex-col bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
                <div className="border-b border-neutral-200 p-4 flex items-center justify-between bg-neutral-50/50">
                    <div className="flex items-center gap-3">
                        <Link href="/admin/support" className="text-neutral-500 hover:text-neutral-900">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h2 className="font-semibold text-neutral-900 truncate">
                                {ticket.subject}
                            </h2>
                            <p className="text-xs text-neutral-500">
                                Ticket #{ticket.id.slice(0, 8)} • {format(new Date(ticket.created_at), 'MMM d, h:mm a')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {messages.map((msg) => {
                        const isAdmin = msg.is_admin_reply
                        // If admin interface, "Me" is Admin.
                        // msg.is_admin_reply means it was sent by an admin.
                        // Ideally checking sender_id vs currentUser.id is better for "Me", 
                        // but visual distinction between User and Admin is also good.
                        // Let's use left/right. Admin (Me) on right. User on left.
                        const isMe = msg.sender_id === currentUser.id

                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 ${isAdmin ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-600'
                                        }`}>
                                        {isAdmin ? 'A' : 'U'}
                                    </div>
                                    <div className={`px-4 py-3 rounded-2xl ${isMe
                                        ? 'bg-neutral-900 text-white rounded-br-none'
                                        : 'bg-neutral-100 text-neutral-900 rounded-bl-none'
                                        }`}>
                                        <div className="whitespace-pre-wrap text-sm">{msg.message}</div>

                                        {msg.attachments && msg.attachments.length > 0 && (
                                            <div className="mt-3 space-y-2">
                                                {msg.attachments.map((path, idx) => (
                                                    <div key={idx} className={`flex items-center gap-2 text-xs p-2 rounded ${isMe ? 'bg-white/10' : 'bg-white'}`}>
                                                        <Paperclip className="h-3 w-3" />
                                                        <span className="truncate max-w-[150px]">{path.split('/').pop()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-neutral-400' : 'text-neutral-500'}`}>
                                            {format(new Date(msg.created_at), 'p')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                    <div ref={messagesEndRef} />
                </div>

                <div className="border-t border-neutral-200 p-4 bg-neutral-50/30">
                    <form onSubmit={handleSendMessage} className="relative">
                        {files.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2 p-2 bg-neutral-50 rounded-lg border border-neutral-100">
                                {files.map((file, i) => (
                                    <div key={i} className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-neutral-200 text-xs">
                                        <span className="truncate max-w-[100px]">{file.name}</span>
                                        <button type="button" onClick={() => removeFile(i)} className="text-neutral-400 hover:text-red-500">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Reply as admin..."
                                    className="min-h-[50px] pr-12 resize-none py-3"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault()
                                            handleSendMessage(e)
                                        }
                                    }}
                                />
                                <div className="absolute right-2 bottom-2.5">
                                    <label className="cursor-pointer p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors inline-flex">
                                        <input type="file" multiple className="hidden" onChange={handleFileChange} />
                                        <Paperclip className="h-5 w-5" />
                                    </label>
                                </div>
                            </div>
                            <Button type="submit" size="icon" disabled={sending || (!newMessage.trim() && files.length === 0)} className="h-[50px] w-[50px] shrink-0">
                                {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Sidebar Controls */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Ticket Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Status</h4>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant={ticket.status === 'open' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => updateStatus('open')}
                                    className="flex-1"
                                >
                                    Open
                                </Button>
                                <Button
                                    variant={ticket.status === 'in_progress' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => updateStatus('in_progress')}
                                    className="flex-1"
                                >
                                    In Progress
                                </Button>
                                <Button
                                    variant={ticket.status === 'closed' ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => updateStatus('closed')}
                                    className="flex-1"
                                >
                                    Close
                                </Button>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-neutral-100">
                            <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Priority</h4>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded text-xs font-medium border ${ticket.priority === 'high' ? 'bg-red-50 text-red-700 border-red-200' :
                                    ticket.priority === 'low' ? 'bg-neutral-100 text-neutral-600 border-neutral-200' :
                                        'bg-blue-50 text-blue-700 border-blue-200'
                                    }`}>
                                    {ticket.priority.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Customer Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {ticketUser ? (
                            <>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-neutral-900">{ticketUser.full_name || 'No Name'}</div>
                                        <div className="text-xs text-neutral-500">Customer</div>
                                    </div>
                                </div>
                                <div className="space-y-2 pt-2 text-sm">
                                    <div className="flex items-center gap-2 text-neutral-600">
                                        <Mail className="h-4 w-4" />
                                        <span>{ticketUser.email}</span>
                                    </div>
                                    {ticketUser.phone && (
                                        <div className="flex items-center gap-2 text-neutral-600">
                                            <Phone className="h-4 w-4" />
                                            <span>{ticketUser.phone}</span>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="text-sm text-neutral-500">
                                User information not available.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

        </div>
    )
}
