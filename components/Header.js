'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ShoppingCart, Heart, User, Menu, X, Search } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { categoryAPI, productAPI } from '@/lib/api'

export default function Header() {
  const { user, profile, signOut, isAdmin } = useAuth()
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [categories, setCategories] = useState([])

  // Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()

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

  // Debounced search effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsSearching(true)
        try {
          const data = await productAPI.getAll({ search: searchQuery, limit: 5 })
          if (data && data.products) {
            setSearchResults(data.products)
          } else {
            setSearchResults([])
          }
        } catch (error) {
          console.error('Search error:', error)
          setSearchResults([])
        } finally {
          setIsSearching(false)
        }
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}`)
      setIsSearchOpen(false)
      setSearchResults([])
    }
  }

  return (
    <header className="sticky top-0 w-full bg-background/80 backdrop-blur-md z-50 border-b border-border transition-all duration-300">
      <div className="container mx-auto px-4 h-20 relative">
        {isSearchOpen ? (
          <div className="absolute inset-x-4 top-0 h-full flex items-center bg-background z-50 animate-in fade-in zoom-in-95">
            <form onSubmit={handleSearchSubmit} className="flex w-full items-center gap-2 max-w-4xl mx-auto relative px-2">
              <Search className="h-5 w-5 text-muted-foreground shrink-0" />
              <Input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="flex-1 border-none bg-transparent focus-visible:ring-0 text-lg h-12 shadow-none px-2"
              />
              {isSearching && <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mr-2"></div>}
              <Button type="button" variant="ghost" size="icon" onClick={() => { setIsSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}>
                <X className="h-5 w-5" />
              </Button>

              {/* Results Dropdown */}
              {searchResults.length > 0 && searchQuery.length > 1 && (
                <div className="absolute top-full left-0 right-0 mt-2 rounded-lg border bg-popover text-popover-foreground shadow-lg overflow-hidden z-50 bg-white dark:bg-neutral-900 animate-in slide-in-from-top-2">
                  <div className="max-h-[60vh] overflow-y-auto">
                    {searchResults.map(product => (
                      <Link
                        key={product.id}
                        href={`/product/${product.slug}`}
                        onClick={() => { setIsSearchOpen(false); setSearchQuery(''); setSearchResults([]); }}
                        className="flex items-center gap-4 p-3 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors border-b last:border-0"
                      >
                        <div className="h-12 w-12 rounded bg-neutral-100 shrink-0 overflow-hidden">
                          {product.images?.[0]?.image_url && (
                            <img src={product.images[0].image_url} alt={product.name} className="h-full w-full object-cover" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm line-clamp-1">{product.name}</p>
                          <p className="text-xs text-muted-foreground">₹{product.price?.toLocaleString()} {product.compare_at_price > product.price && <span className="line-through ml-1 opacity-70">₹{product.compare_at_price?.toLocaleString()}</span>}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="w-full text-xs font-medium py-3 text-center bg-muted/50 hover:bg-muted transition-colors text-primary block"
                  >
                    View all results for "{searchQuery}"
                  </button>
                </div>
              )}
            </form>
          </div>
        ) : (
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
              <img src="/logo.png" alt="Skoneasu" className="h-12 w-auto object-contain" />
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
              <Button
                variant="ghost"
                size="icon"
                className="text-primary hover:text-secondary hover:bg-muted/50"
                onClick={() => setIsSearchOpen(true)}
              >
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
        )}
      </div>
    </header >
  )
}
