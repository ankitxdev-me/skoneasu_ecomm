'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner' // Assuming sonner is installed as per package.json

export default function CreateTicketPage() {
    const { user } = useAuth()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [files, setFiles] = useState([])
    const [formData, setFormData] = useState({
        subject: '',
        message: '',
        priority: 'normal'
    })

    const handleFileChange = (e) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files)
            setFiles(prev => [...prev, ...newFiles])
        }
    }

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!user) return
        setLoading(true)

        try {
            // Ensure session is active using the custom token if needed
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                const token = localStorage.getItem('auth_token')
                if (token) {
                    const { error: setSessionError } = await supabase.auth.setSession({
                        access_token: token,
                        refresh_token: token // Try using token as refresh token or just string
                    })
                    if (setSessionError) console.warn('Failed to set session from token:', setSessionError)
                }
            }

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

                    // Get public URL (or signed URL if private, but usually public URL is easier for display if bucket is public READ)
                    // The migration set bucket to PRIVATE. So we need signed URL or just store the path.
                    // Storing the path is safer, and we generate signed URL on view.
                    // But for simplicity in this app, usually people use public buckets. 
                    // I'll store the object path.
                    uploadedUrls.push(filePath)
                }
            }

            // 2. Create Ticket
            const { data: ticket, error: ticketError } = await supabase
                .from('support_tickets')
                .insert({
                    user_id: user.id,
                    subject: formData.subject,
                    status: 'open',
                    priority: formData.priority
                })
                .select()
                .single()

            if (ticketError) throw ticketError

            // 3. Create Initial Message
            const { error: messageError } = await supabase
                .from('support_messages')
                .insert({
                    ticket_id: ticket.id,
                    sender_id: user.id,
                    message: formData.message,
                    attachments: uploadedUrls,
                    is_admin_reply: false
                })

            if (messageError) throw messageError

            toast.success('Ticket created successfully!')
            router.push(`/support/${ticket.id}`)

        } catch (error) {
            console.error('Error creating ticket:', error)
            toast.error(`Failed to create ticket: ${error.message || 'Unknown error'}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-neutral-50 pt-24 pb-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <Link href="/support" className="flex items-center text-neutral-500 hover:text-neutral-900 transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Tickets
                    </Link>
                    <Link href="/">
                        <Button variant="outline" size="sm">Home</Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-serif">Create Support Ticket</CardTitle>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input
                                    id="subject"
                                    placeholder="Brief summary of your issue"
                                    required
                                    value={formData.subject}
                                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="priority">Priority</Label>
                                <select
                                    id="priority"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.priority}
                                    onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                >
                                    <option value="low">Low - General Question</option>
                                    <option value="normal">Normal - Minor Issue</option>
                                    <option value="high">High - Critical Issue</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea
                                    id="message"
                                    placeholder="Describe your issue in detail..."
                                    rows={6}
                                    required
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Attachments (Optional)</Label>
                                <div className="border-2 border-dashed border-neutral-200 rounded-lg p-6 text-center hover:bg-neutral-50 transition-colors cursor-pointer relative">
                                    <input
                                        type="file"
                                        multiple
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={handleFileChange}
                                    />
                                    <Upload className="h-8 w-8 mx-auto text-neutral-400 mb-2" />
                                    <p className="text-sm text-neutral-500">Click or drag files to upload</p>
                                </div>
                                {files.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        {files.map((file, index) => (
                                            <div key={index} className="flex items-center justify-between bg-neutral-100 p-2 rounded text-sm">
                                                <span className="truncate max-w-[80%]">{file.name}</span>
                                                <button type="button" onClick={() => removeFile(index)} className="text-neutral-500 hover:text-red-600">
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating Ticket...
                                    </>
                                ) : (
                                    'Submit Ticket'
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    )
}
