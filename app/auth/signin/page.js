// 'use client'

// import { useState } from 'react'
// import Link from 'next/link'
// import { useRouter } from 'next/navigation'
// import { useForm } from 'react-hook-form'
// import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
// import { authAPI } from '@/lib/api'
// import { toast } from 'sonner'
// import Header from '@/components/Header'

// export default function SignInPage() {
//     const router = useRouter()
//     const { register, handleSubmit } = useForm()
//     const [loading, setLoading] = useState(false)

//     const onSubmit = async (data) => {
//         setLoading(true)
//         try {
//             const response = await authAPI.signIn(data)
//             // Save token
//             if (response?.session?.access_token) {
//                 localStorage.setItem('auth_token', response.session.access_token)
//                 toast.success('Welcome back!')
//                 // Force full reload to update auth headers and state
//                 window.location.href = '/'
//             }
//         } catch (error) {
//             toast.error(error.message || 'Login failed')
//         } finally {
//             setLoading(false)
//         }
//     }

//     return (
//         <div className="min-h-screen bg-neutral-50 flex flex-col">
//             <Header />
//             <div className="flex-1 flex items-center justify-center px-4 py-12">
//                 <Card className="w-full max-w-md">
//                     <CardHeader className="text-center">
//                         <CardTitle className="text-2xl font-serif">Sign In</CardTitle>
//                         <CardDescription>Enter your credentials to access your account</CardDescription>
//                     </CardHeader>
//                     <CardContent>
//                         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//                             <div className="space-y-2">
//                                 <label className="text-sm font-medium">Email</label>
//                                 <Input type="email" {...register('email', { required: true })} />
//                             </div>
//                             <div className="space-y-2">
//                                 <label className="text-sm font-medium">Password</label>
//                                 <Input type="password" {...register('password', { required: true })} />
//                                 <div className="flex justify-end">
//                                     <Link href="/auth/forgot-password" className="text-xs text-secondary hover:underline">
//                                         Forgot Password?
//                                     </Link>
//                                 </div>
//                             </div>
//                             <Button type="submit" className="w-full" disabled={loading}>
//                                 {loading ? 'Signing In...' : 'Sign In'}
//                             </Button>
//                         </form>

//                         <div className="mt-6 text-center text-sm text-neutral-600">
//                             Don't have an account?{' '}
//                             <Link href="/auth/signup" className="text-secondary hover:underline">
//                                 Sign Up
//                             </Link>
//                         </div>
//                     </CardContent>
//                 </Card>
//             </div>
//         </div>
//     )
// }



'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card'

import { toast } from 'sonner'
import Header from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'

export default function SignInPage() {
    const router = useRouter()

    const { register, handleSubmit } = useForm()

    const [loading, setLoading] = useState(false)

    const { signIn } = useAuth()

    const onSubmit = async (data) => {
        setLoading(true)

        try {
            await signIn(data.email, data.password)

            toast.success('Welcome back!')

            router.replace('/')
        } catch (error) {
            console.error('Login error:', error)

            toast.error(error.message || 'Login failed')
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

                        <CardTitle className="text-2xl font-serif">
                            Sign In
                        </CardTitle>

                        <CardDescription>
                            Enter your credentials to access your account
                        </CardDescription>

                    </CardHeader>

                    <CardContent>

                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="space-y-4"
                        >

                            <div className="space-y-2">

                                <label className="text-sm font-medium">
                                    Email
                                </label>

                                <Input
                                    type="email"
                                    {...register('email', {
                                        required: true
                                    })}
                                />

                            </div>

                            <div className="space-y-2">

                                <label className="text-sm font-medium">
                                    Password
                                </label>

                                <Input
                                    type="password"
                                    {...register('password', {
                                        required: true
                                    })}
                                />

                                <div className="flex justify-end">

                                    <Link
                                        href="/auth/forgot-password"
                                        className="text-xs text-secondary hover:underline"
                                    >
                                        Forgot Password?
                                    </Link>

                                </div>

                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading}
                            >
                                {loading
                                    ? 'Signing In...'
                                    : 'Sign In'}
                            </Button>

                        </form>

                        <div className="mt-6 text-center text-sm text-neutral-600">

                            Don't have an account?{' '}

                            <Link
                                href="/auth/signup"
                                className="text-secondary hover:underline"
                            >
                                Sign Up
                            </Link>

                        </div>

                    </CardContent>

                </Card>

            </div>

        </div>
    )
}