'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Loader2, LayoutDashboard, Package, ShoppingCart, Users, Tag, LogOut, ArrowLeft, Layers, MessageSquare, Star, Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'

export default function AdminLayout({ children }) {
    const router = useRouter()
    const pathname = usePathname()
    const { user, profile, loading, signOut } = useAuth()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // If no user, redirect to signin with return URL
                router.push('/auth/signin?redirect=' + encodeURIComponent(pathname))
            } else if (profile && profile.role !== 'admin') {
                // If user but not admin, redirect home
                router.push('/')
            }
        }
    }, [user, profile, loading, router, pathname])

    if (loading || !profile || profile.role !== 'admin') {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
            </div>
        )
    }
    const navItems = [
        { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/products', label: 'Products', icon: Package },
        { href: '/admin/categories', label: 'Categories', icon: Layers },
        { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
        { href: '/admin/customers', label: 'Customers', icon: Users },
        { href: '/admin/coupons', label: 'Coupons', icon: Tag },
        { href: '/admin/reviews', label: 'Reviews', icon: Star },
        { href: '/admin/support', label: 'Support', icon: MessageSquare },
    ]

    const NavContent = () => (
        <div className="flex flex-col h-full">
            <div className="p-6 border-b border-neutral-200">
                <Link href="/" className="flex items-center gap-2 mb-1">
                    <ArrowLeft className="h-4 w-4 text-neutral-500" />
                    <span className="text-sm text-neutral-500">Back to Store</span>
                </Link>
                <h1 className="text-xl font-serif font-bold text-primary">Admin Panel</h1>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                            ${isActive
                                    ? 'bg-neutral-900 text-white'
                                    : 'text-neutral-600 hover:bg-neutral-100 text-neutral-900'
                                }`}
                        >
                            <Icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-neutral-200 mt-auto">
                <div className="flex items-center gap-3 px-4 py-3 mb-2">
                    <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs">
                        {profile.full_name?.substring(0, 2).toUpperCase() || 'AD'}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium truncate">{profile.full_name}</p>
                        <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                    </div>
                </div>
                <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-neutral-100 flex flex-col md:flex-row">
            {/* Mobile Header */}
            <header className="md:hidden bg-white border-b border-neutral-200 p-4 flex items-center justify-between sticky top-0 z-50">
                <h1 className="text-lg font-serif font-bold text-primary">Admin Panel</h1>
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-72">
                        <NavContent />
                    </SheetContent>
                </Sheet>
            </header>

            {/* Desktop Sidebar */}
            <aside className="w-64 bg-white border-r border-neutral-200 hidden md:flex flex-col sticky top-0 h-screen overflow-y-auto">
                <NavContent />
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-4 md:p-8">
                {children}
            </main>
        </div>
    )
}
