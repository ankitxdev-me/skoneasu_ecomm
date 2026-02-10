'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { authAPI } from '@/lib/api'
import { toast } from 'sonner'
import Header from '@/components/Header'

export default function SignUpPage() {
    const router = useRouter()
    const { register, handleSubmit, watch, formState: { errors } } = useForm()
    const [loading, setLoading] = useState(false)

    const password = watch("password")

    const onSubmit = async (data) => {
        setLoading(true)
        try {
            const response = await authAPI.signUp(data)
            // Save token if returned immediately (Supabase auto-confirm off)
            if (response?.session?.access_token) {
                localStorage.setItem('auth_token', response.session.access_token)
                toast.success('Account created successfully!')
                window.location.href = '/'
            } else {
                toast.success('Please check your email to confirm your account')
                router.push('/auth/signin')
            }
        } catch (error) {
            toast.error(error.message || 'Registration failed')
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
                        <CardTitle className="text-2xl font-serif">Create Account</CardTitle>
                        <CardDescription>Join our exclusive circle of luxury</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Full Name</label>
                                <Input {...register('full_name', { required: true })} placeholder="John Doe" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input type="email" {...register('email', { required: true })} placeholder="john@example.com" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Phone</label>
                                <Input {...register('phone')} placeholder="+91..." />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Password</label>
                                <Input type="password" {...register('password', { required: true, minLength: 6 })} />
                                {errors.password && <span className="text-xs text-red-500">Min 6 characters</span>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Confirm Password</label>
                                <Input
                                    type="password"
                                    {...register('confirm_password', {
                                        validate: value => value === password || "Passwords do not match"
                                    })}
                                />
                                {errors.confirm_password && <span className="text-xs text-red-500">{errors.confirm_password.message}</span>}
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? 'Creating Account...' : 'Sign Up'}
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-sm text-neutral-600">
                            Already have an account?{' '}
                            <Link href="/auth/signin" className="text-secondary hover:underline">
                                Sign In
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
