'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { supportAPI } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ArrowLeft, Send, Paperclip, X, Download, Lock, CheckCircle, Clock, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

export default function TicketDetailPage() {
    const { id } = useParams()
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()
    const [ticket, setTicket] = useState(null)
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [newMessage, setNewMessage] = useState('')
    const [files, setFiles] = useState([])
    const messagesEndRef = useRef(null)

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/signin')
            return
        }

        if (user && id) {
            fetchTicketData()
        }
    }, [user, id, authLoading])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const fetchTicketData = async () => {
        try {
            // Use API client
            const data = await supportAPI.getById(id)
            setTicket(data) // data contains mixed ticket fields and messages based on our API design? 
            // Wait, our API returns { ...ticket, messages }
            // So ticket state should be just ticket fields?
            // Existing code expects `ticket` state to be the ticket object, and `messages` state to be array.

            // Let's destructure
            const { messages: msgs, ...ticketInfo } = data
            setTicket(ticketInfo)
            setMessages(msgs || [])

        } catch (error) {
            console.error('Error fetching ticket data:', error)
            toast.error('Failed to load ticket details')
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
        if ((!newMessage.trim() && files.length === 0) || !user) return

        setSending(true)
        try {
            // 1. Upload files
            const uploadedUrls = []
            if (files.length > 0) {
                for (const file of files) {
                    const fileExt = file.name.split('.').pop()
                    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
                    const filePath = `${user.id}/${fileName}`

                    const { error: uploadError } = await supabase.storage
                        .from('support-attachments')
                        .upload(filePath, file)

                    if (uploadError) throw uploadError
                    uploadedUrls.push(filePath)
                }
            }

            // 2. Insert message
            const { error } = await supabase
                .from('support_messages')
                .insert({
                    ticket_id: id,
                    sender_id: user.id,
                    message: newMessage,
                    attachments: uploadedUrls,
                    is_admin_reply: false
                })

            if (error) throw error

            // 3. Update ticket updated_at and move to 'open' if it was 'closed'? 
            // Usually if user replies, it might re-open or stay same.
            // Let's just update updated_at
            await supabase
                .from('support_tickets')
                .update({ updated_at: new Date().toISOString(), status: 'open' }) // Re-open if closed
                .eq('id', id)

            setNewMessage('')
            setFiles([])
            fetchTicketData() // Refresh messages

        } catch (error) {
            console.error('Error sending message:', error)
            toast.error('Failed to send message')
        } finally {
            setSending(false)
        }
    }

    // Helper to get signed URL for attachments (if bucket is private)
    // For now, assuming we might need to implement this if images don't load.
    // If bucket is public, we can just construct URL.
    // If private, we need `supabase.storage.from('...').createSignedUrl(path, 60)`
    // Since we are iterating quickly, let's assume we can display if we use the right method.
    // I'll create a small helper component for attachments if needed.

    if (loading) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
        )
    }

    if (!ticket) return <div className="pt-24 text-center">Ticket not found</div>

    return (
        <div className="min-h-screen bg-neutral-50 pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Chat Area */}
                <div className="lg:col-span-2 flex flex-col h-[calc(100vh-140px)]">
                    <div className="bg-white rounded-t-xl border border-b-0 border-neutral-200 p-4 flex items-center justify-between shadow-sm z-10">
                        <div className="flex items-center gap-3">
                            <Link href="/support" className="text-neutral-500 hover:text-neutral-900" title="Back to Tickets">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                            <Link href="/" title="Go Home">
                                <Button variant="ghost" size="sm" className="h-8 gap-1">
                                    <span className="text-sm font-medium">Home</span>
                                </Button>
                            </Link>
                            <div>
                                <h2 className="font-semibold text-neutral-900 text-lg truncate max-w-[200px] sm:max-w-md">
                                    {ticket.subject}
                                </h2>
                                <p className="text-xs text-neutral-500">Ticket ID: {ticket.id.slice(0, 8)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${ticket.status === 'open' ? 'bg-green-50 text-green-700 border-green-200' :
                                ticket.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                    'bg-neutral-100 text-neutral-600 border-neutral-200'
                                }`}>
                                {ticket.status.replace('_', ' ').toUpperCase()}
                            </span>
                        </div>
                    </div>

                    {/* Messages Scroll Area */}
                    <div className="flex-1 bg-white border-x border-neutral-200 overflow-y-auto p-4 space-y-6">
                        {messages.map((msg) => {
                            const isMe = msg.sender_id === user.id
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl px-5 py-3 ${isMe
                                        ? 'bg-neutral-900 text-white rounded-br-none'
                                        : 'bg-neutral-100 text-neutral-900 rounded-bl-none'
                                        }`}>
                                        <div className="text-sm sm:text-base whitespace-pre-wrap">{msg.message}</div>

                                        {/* Attachments */}
                                        {msg.attachments && msg.attachments.length > 0 && (
                                            <div className="mt-3 space-y-2">
                                                {msg.attachments.map((path, idx) => (
                                                    <div key={idx} className={`flex items-center gap-2 text-xs p-2 rounded ${isMe ? 'bg-white/10' : 'bg-white'}`}>
                                                        <Paperclip className="h-3 w-3" />
                                                        <span className="truncate max-w-[150px]">{path.split('/').pop()}</span>
                                                        {/* We aren't generating signed URLs here yet, user might not see image instantly if private */}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-neutral-400' : 'text-neutral-500'}`}>
                                            {format(new Date(msg.created_at), 'p')}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Reply Input */}
                    <div className="bg-white rounded-b-xl border border-t-0 border-neutral-200 p-4 shadow-sm">
                        {ticket.status === 'closed' ? (
                            <div className="text-center py-4 bg-neutral-50 rounded-lg text-neutral-500 mb-2">
                                <Lock className="h-4 w-4 inline mr-2" />
                                This ticket is closed. Reply to re-open.
                            </div>
                        ) : null}

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
                                        placeholder="Type your reply..."
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

                {/* Sidebar Info */}
                <div className="hidden lg:block space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Ticket Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="text-sm font-medium text-neutral-500 mb-1">Status</h4>
                                <div className="flex items-center gap-2">
                                    {ticket.status === 'open' && <div className="text-green-600 font-medium flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full" /> Open</div>}
                                    {ticket.status === 'in_progress' && <div className="text-blue-600 font-medium flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded-full" /> In Progress</div>}
                                    {ticket.status === 'closed' && <div className="text-neutral-500 font-medium flex items-center gap-1"><CheckCircle className="h-4 w-4" /> Closed</div>}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-neutral-500 mb-1">Priority</h4>
                                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium border ${ticket.priority === 'high' ? 'bg-red-50 text-red-700 border-red-200' :
                                    ticket.priority === 'low' ? 'bg-neutral-100 text-neutral-600 border-neutral-200' :
                                        'bg-blue-50 text-blue-700 border-blue-200'
                                    }`}>
                                    {ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}
                                </span>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-neutral-500 mb-1">Created</h4>
                                <p className="text-sm">{format(new Date(ticket.created_at), 'MMM d, yyyy h:mm a')}</p>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-neutral-500 mb-1">Last Updated</h4>
                                <p className="text-sm">{format(new Date(ticket.updated_at), 'MMM d, yyyy h:mm a')}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    )
}
