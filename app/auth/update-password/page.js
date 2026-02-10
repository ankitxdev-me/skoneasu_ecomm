'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import Header from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function UpdatePasswordPage() {
    const router = useRouter()
    const { register, handleSubmit, watch } = useForm()
    const [loading, setLoading] = useState(false)
    const { updatePassword } = useAuth()
    const [verifying, setVerifying] = useState(true)

    useEffect(() => {
        // Supabase handles the hash fragment automatically for auth state
        // creating a session. We just need to wait for it.
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setVerifying(false)
            } else {
                // If no session, maybe flow is broken or manual navigation
                // We keep verifying state until a timeout or we redirect?
                // Actually, just let them try.
                setVerifying(false)
            }
        })
    }, [])


    const onSubmit = async (data) => {
        if (data.password !== data.confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        setLoading(true)
        try {
            await updatePassword(data.password)
            toast.success('Password updated successfully!')
            router.push('/')
        } catch (error) {
            toast.error(error.message || 'Failed to update password')
        } finally {
            setLoading(false)
        }
    }

    if (verifying) {
        return (
            <div className="min-h-screen bg-neutral-50 flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col">
            <Header />
            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-serif">Set New Password</CardTitle>
                        <CardDescription>Enter your new password below</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">New Password</label>
                                <Input
                                    type="password"
                                    placeholder="Minimum 6 characters"
                                    {...register('password', { required: true, minLength: 6 })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Confirm Password</label>
                                <Input
                                    type="password"
                                    placeholder="Re-enter password"
                                    {...register('confirmPassword', { required: true })}
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Update Password
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
