'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ShoppingCart, Heart, User, Menu, X, Search } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { categoryAPI } from '@/lib/api' // Add import

export default function Header() {
  const { user, profile, signOut, isAdmin } = useAuth()
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [categories, setCategories] = useState([])

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoryAPI.getAll()
        if (data) {
          // Filter for main categories and map to nav structure
          const mainCategories = data
            .filter(cat => cat.is_main)
            .map(cat => ({
              name: cat.name,
              href: `/shop?category=${cat.slug}`
            }))
          setCategories(mainCategories)
        }
      } catch (error) {
        console.error('Failed to load categories', error)
      }
    }
    loadCategories()
  }, [])

  return (
    <header className="sticky top-0 w-full bg-background/80 backdrop-blur-md z-50 border-b border-border transition-all duration-300">
      <div className="container mx-auto px-4 h-20">
        <div className="flex items-center justify-between h-full">
          {/* Mobile menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-primary hover:text-secondary">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-background border-r border-border">
              <SheetHeader>
                <SheetTitle className="font-serif text-2xl font-bold text-primary">SKONEASU</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-6 mt-8">
                <nav className="flex flex-col gap-4">
                  {categories.map((category) => (
                    <Link
                      key={category.name}
                      href={category.href}
                      className="text-lg font-medium text-primary hover:text-secondary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
                  {/* Additional static links for mobile */}
                  <Link
                    href="/"
                    className="text-lg font-medium text-primary hover:text-secondary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    href="/shop?sort=newest"
                    className="text-lg font-medium text-primary hover:text-secondary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    New Arrivals
                  </Link>
                  <Link
                    href="/shop?sort=popular"
                    className="text-lg font-medium text-primary hover:text-secondary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Best Sellers
                  </Link>
                  <Link
                    href="/shop"
                    className="text-lg font-medium text-primary hover:text-secondary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Collections
                  </Link>
                  <Link
                    href="/about"
                    className="text-lg font-medium text-primary hover:text-secondary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    About Us
                  </Link>
                  <Link
                    href="/support"
                    className="text-lg font-medium text-primary hover:text-secondary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Support
                  </Link>
                </nav>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.jpg" alt="Skoneasu" className="h-12 w-auto object-contain" />
            {/* <span className="text-2xl md:text-3xl font-serif font-bold text-neutral-900">SKONEASU</span> */}
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-primary hover:text-secondary transition-colors uppercase tracking-wide">
              Home
            </Link>

            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="text-sm font-medium text-primary hover:text-secondary transition-colors uppercase tracking-wide"
              >
                {category.name}
              </Link>
            ))}

            <Link href="/shop" className="text-sm font-medium text-primary hover:text-secondary transition-colors uppercase tracking-wide">
              Collections
            </Link>
            <Link href="/about" className="text-sm font-medium text-primary hover:text-secondary transition-colors uppercase tracking-wide">
              About
            </Link>
            <Link href="/support" className="text-sm font-medium text-primary hover:text-secondary transition-colors uppercase tracking-wide">
              Contact
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-primary hover:text-secondary hover:bg-muted/50">
              <Search className="h-5 w-5" />
            </Button>

            {user ? (
              <>
                <Button variant="ghost" size="icon" asChild className="relative text-primary hover:text-secondary hover:bg-muted/50">
                  <Link href="/wishlist">
                    <Heart className="h-5 w-5" />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-secondary text-[10px] font-bold text-white flex items-center justify-center">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                </Button>

                <Button variant="ghost" size="icon" className="relative text-primary hover:text-secondary hover:bg-muted/50" asChild>
                  <Link href="/cart">
                    <ShoppingCart className="h-5 w-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-secondary text-[10px] font-bold text-white flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-primary hover:text-secondary hover:bg-muted/50">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-card border-border">
                    <div className="px-2 py-1.5 text-sm font-medium text-primary">
                      {profile?.full_name || user.email}
                    </div>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem asChild className="focus:bg-muted focus:text-primary cursor-pointer">
                      <Link href="/dashboard">My Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="focus:bg-muted focus:text-primary cursor-pointer">
                      <Link href="/orders">My Orders</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="focus:bg-muted focus:text-primary cursor-pointer">
                      <Link href="/support">My Support Tickets</Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild className="focus:bg-muted focus:text-primary cursor-pointer">
                        <Link href="/admin/orders">Admin Dashboard</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem onClick={signOut} className="text-destructive focus:bg-destructive/10 cursor-pointer">
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" size="icon" className="relative text-primary hover:text-secondary hover:bg-muted/50" asChild>
                  <Link href="/cart">
                    <ShoppingCart className="h-5 w-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-secondary text-[10px] font-bold text-white flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </Button>
                <Button asChild className="bg-primary text-primary-foreground hover:bg-secondary">
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header >
  )
}
