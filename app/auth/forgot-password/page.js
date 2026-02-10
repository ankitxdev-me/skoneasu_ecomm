'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import Header from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
    const { register, handleSubmit } = useForm()
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const { resetPassword } = useAuth()

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            await resetPassword(data.email)
            setSubmitted(true)
            toast.success('Password reset link sent!')
        } catch (error) {
            toast.error(error.message || 'Failed to send reset link')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col">
            <Header />
            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-serif">Reset Password</CardTitle>
                        <CardDescription>
                            {submitted
                                ? "Check your email for the reset link"
                                : "Enter your email to receive a password reset link"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {submitted ? (
                            <div className="text-center space-y-4">
                                <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm">
                                    We have sent a password reset link to your email address. Please check your inbox (and spam folder) and click the link to create a new password.
                                </div>
                                <Button asChild className="w-full" variant="outline">
                                    <Link href="/auth/signin">Back to Sign In</Link>
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email Address</label>
                                    <Input
                                        type="email"
                                        placeholder="Enter your email"
                                        {...register('email', { required: true })}
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Send Reset Link
                                </Button>
                                <div className="text-center">
                                    <Link href="/auth/signin" className="text-sm text-muted-foreground hover:text-secondary flex items-center justify-center gap-1">
                                        <ArrowLeft className="h-3 w-3" /> Back to Sign In
                                    </Link>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
