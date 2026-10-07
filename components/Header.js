'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { productAPI, categoryAPI } from '@/lib/api'

export default function Header() {
  const { user, profile, signOut, isAdmin } = useAuth()
  const { cartCount } = useCart()
  const { wishlistCount } = useWishlist()
  const router = useRouter()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)

  const [navCategories, setNavCategories] = useState([])

  useEffect(() => {
    let isMounted = true
    const loadCategories = async () => {
      try {
        const data = await categoryAPI.getAll()
        if (isMounted && Array.isArray(data)) {
          // Strictly only include categories marked as main (is_main === true)
          const mains = data.filter(c => Boolean(c.is_main))
          setNavCategories(mains)
        }
      } catch (err) {
        console.error('Failed to load navigation categories:', err)
      }
    }
    loadCategories()

    // Real-time listener for category updates from admin panel
    const handleCategoryUpdate = () => loadCategories()
    window.addEventListener('categories-updated', handleCategoryUpdate)
    return () => {
      isMounted = false
      window.removeEventListener('categories-updated', handleCategoryUpdate)
    }
  }, [])

  // Order priority for main categories in navbar
  const CATEGORY_ORDER = {
    'gifts-for-her': 10,
    'gifts-for-him': 20,
    'gift-combos': 30,
    'all-collections': 40,
    'jewelry': 50,
    'accessories': 60,
    'occasions': 70,
    'new-product': 80,
  }

  // Pure dynamic categories from DB where is_main === true
  const displayCategories = navCategories.filter(c => Boolean(c.is_main) && c.slug !== 'all-collections').slice(0, 4)

  const getCategoryLink = (cat) => {
    if (cat.slug === 'all-collections') return '/shop'
    if (cat.slug === 'occasions') return '/#occasions'
    return `/shop?category=${encodeURIComponent(cat.slug)}`
  }

  // Rotating & Sliding Announcements for Mobile
  const announcements = [
    { icon: '🎁', text: 'Free Shipping on Orders Above ₹499' },
    { icon: '✨', text: 'Meaningful Gifts & Premium Quality' },
    { icon: '❤️', text: 'Loved by 1000+ Happy Customers' },
    { isLinks: true }
  ]
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0)
  const [touchStart, setTouchStart] = useState(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAnnouncement((prev) => (prev + 1) % announcements.length)
    }, 3800)
    return () => clearInterval(timer)
  }, [announcements.length])

  const handleAnnouncementTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleAnnouncementTouchEnd = (e) => {
    if (!touchStart) return
    const touchEnd = e.changedTouches[0].clientX
    const diff = touchStart - touchEnd
    if (diff > 40) {
      setCurrentAnnouncement((prev) => (prev + 1) % announcements.length)
    } else if (diff < -40) {
      setCurrentAnnouncement((prev) => (prev - 1 + announcements.length) % announcements.length)
    }
  }

  // Live search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true)
        const res = await productAPI.getAll({ search: searchQuery, limit: 6 })
        setSearchResults(res.products || [])
      } catch (err) {
        console.error('Search error:', err)
      } finally {
        setSearchLoading(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setIsSearchOpen(false)
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  return (
    <header className="w-full z-50 sticky top-0 bg-[#FFF9F3] shadow-sm">
      
      {/* 1. TOP ANNOUNCEMENT BAR (Desktop Full + Mobile Rotating & Sliding Carousel) */}
      <div className="bg-[#2D1B16] text-[#FFF9F3] text-xs py-2 px-3 sm:px-4 overflow-hidden select-none">
        
        {/* DESKTOP BAR (lg and up): All 3 segments visible simultaneously */}
        <div className="hidden lg:flex container mx-auto items-center justify-between">
          {/* Left item */}
          <div className="flex items-center gap-2">
            <span className="text-sm">🎁</span>
            <span className="font-sans font-medium text-[12px] sm:text-[13px] tracking-normal">
              Free Shipping on Orders Above ₹499
            </span>
          </div>

          {/* Desktop Center */}
          <div className="text-center font-sans font-medium tracking-normal text-[12px] sm:text-[13px] opacity-90">
            Meaningful Gifts &nbsp;|&nbsp; Premium Quality &nbsp;|&nbsp; Loved by 1000+ Customers
          </div>

          {/* Desktop Right */}
          <div className="flex items-center gap-4 font-sans font-medium text-[12px] opacity-85">
            <Link href="/dashboard?tab=orders" className="hover:text-[#E8C7AF] transition-colors flex items-center gap-1">
              <span>Track Order</span>
            </Link>
            <span className="opacity-40">|</span>
            <Link href="/support" className="hover:text-[#E8C7AF] transition-colors flex items-center gap-1">
              <span>Help</span>
            </Link>
          </div>
        </div>

        {/* MOBILE & TABLET SLIDING BAR (< lg): Touch swipe + Auto-rotate + Prev/Next controls */}
        <div
          className="flex lg:hidden items-center justify-between gap-1 max-w-md mx-auto relative"
          onTouchStart={handleAnnouncementTouchStart}
          onTouchEnd={handleAnnouncementTouchEnd}
        >
          {/* Prev Slide Button */}
          <button
            type="button"
            onClick={() => setCurrentAnnouncement((prev) => (prev - 1 + announcements.length) % announcements.length)}
            className="w-6 h-6 flex items-center justify-center text-white/60 hover:text-white shrink-0 active:scale-90 transition-all cursor-pointer"
            aria-label="Previous announcement"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Sliding Track Viewport */}
          <div className="flex-1 overflow-hidden relative min-h-[20px] flex items-center">
            <div
              className="flex transition-transform duration-500 ease-out w-full"
              style={{ transform: `translateX(-${currentAnnouncement * 100}%)` }}
            >
              {announcements.map((item, idx) => (
                <div
                  key={idx}
                  className="w-full shrink-0 flex items-center justify-center gap-1.5 px-1"
                >
                  {item.isLinks ? (
                    <div className="flex items-center justify-center gap-3 font-sans font-medium text-[12px] sm:text-[13px] text-[#FFF9F3]">
                      <Link
                        href="/dashboard?tab=orders"
                        className="hover:text-[#E8C7AF] active:text-[#E8C7AF] transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Track Order
                      </Link>
                      <span className="opacity-40 select-none">|</span>
                      <Link
                        href="/support"
                        className="hover:text-[#E8C7AF] active:text-[#E8C7AF] transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Help
                      </Link>
                    </div>
                  ) : (
                    <>
                      <span className="text-xs shrink-0">{item.icon}</span>
                      <span className="font-sans font-medium text-[12px] sm:text-[13px] tracking-normal truncate text-center text-[#FFF9F3]">
                        {item.text}
                      </span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Next Slide Button */}
          <button
            type="button"
            onClick={() => setCurrentAnnouncement((prev) => (prev + 1) % announcements.length)}
            className="w-6 h-6 flex items-center justify-center text-white/60 hover:text-white shrink-0 active:scale-90 transition-all cursor-pointer"
            aria-label="Next announcement"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Indicator Dots */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1 pointer-events-none">
            {announcements.map((_, dotIdx) => (
              <div
                key={dotIdx}
                className={`h-0.5 rounded-full transition-all duration-300 ${
                  dotIdx === currentAnnouncement ? 'w-3 bg-[#E8C7AF]' : 'w-1 bg-white/30'
                }`}
              />
            ))}
          </div>

        </div>
      </div>

      {/* 2. MAIN NAVBAR */}
      <nav className="w-full border-b border-[#E8C7AF]/30 py-2.5 sm:py-3.5">
        <div className="container mx-auto px-4 flex items-center justify-between gap-3 md:gap-6">
          
          {/* Mobile: Hamburger + Logo */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              className="lg:hidden p-1 text-[#3E2923] hover:text-[#B87545]"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Official Brand Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <img
                src="/logo.png"
                alt="SKONEASU"
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-contain shadow-xs group-hover:scale-105 transition-transform duration-300"
              />
              <div className="flex flex-col">
                <span className="font-serif text-lg sm:text-2xl font-bold tracking-wider text-[#2D1B16] leading-none">
                  SKONEASU
                </span>
                <span className="hidden sm:block text-[8.5px] tracking-[0.22em] font-sans font-bold text-[#B87545] uppercase mt-0.5">
                  GIFTED WITH LOVE
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links (Dynamic Main Categories from DB) */}
          <div className="hidden lg:flex items-center gap-5 xl:gap-7">
            {displayCategories.map((cat) => {
              const displayName = cat.name
              const isOccasion = cat.slug === 'occasions'
              return (
                <Link
                  key={cat.slug}
                  href={getCategoryLink(cat)}
                  className={`font-sans font-semibold text-[14px] lg:text-[15px] text-[#3E2923] hover:text-[#B87545] transition-colors py-1 whitespace-nowrap ${
                    isOccasion ? 'relative flex items-center gap-1' : ''
                  }`}
                >
                  <span>{displayName}</span>
                  {isOccasion && (
                    <span className="bg-[#E53935] text-white font-sans text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                      New
                    </span>
                  )}
                </Link>
              )
            })}

            {/* FIXED: Collections button right before About */}
            <Link
              href="/shop"
              className="font-sans font-semibold text-[14px] lg:text-[15px] text-[#3E2923] hover:text-[#B87545] transition-colors py-1 whitespace-nowrap"
            >
              Collections
            </Link>

            {/* FIXED: About button */}
            <Link
              href="/about"
              className="font-sans font-semibold text-[14px] lg:text-[15px] text-[#3E2923] hover:text-[#B87545] transition-colors py-1 whitespace-nowrap"
            >
              About
            </Link>
          </div>

          {/* Search + Action Icons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Desktop Rounded Search Bar */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex relative items-center">
              <input
                type="text"
                placeholder="Search for gifts, jewelry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-52 lg:w-60 xl:w-72 bg-white border border-[#E8C7AF] text-[#3E2923] placeholder-[#5A382B]/60 font-sans text-[13px] sm:text-[14px] rounded-full pl-4 pr-9 py-2 focus:outline-none focus:ring-1 focus:ring-[#B87545]"
              />
              <button type="submit" className="absolute right-3 text-[#5A382B] hover:text-[#3E2923]">
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Mobile Search Icon */}
            <button
              type="button"
              className="md:hidden p-1.5 text-[#3E2923]"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Desktop Account */}
            <div className="hidden sm:block">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-1.5 text-[#3E2923] hover:text-[#B87545]">
                      <User className="w-5 h-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 bg-[#FFF9F3] border-[#E8C7AF]">
                    <div className="px-3 py-2 border-b border-[#E8C7AF]/40">
                      <p className="text-xs text-[#5A382B]">Signed in as</p>
                      <p className="text-sm font-semibold truncate text-[#3E2923]">{profile?.full_name || user.email}</p>
                    </div>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/dashboard">My Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/orders">My Orders</Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild className="cursor-pointer text-[#B87545] font-semibold">
                        <Link href="/admin/orders">Admin Panel</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-[#E8C7AF]/40" />
                    <DropdownMenuItem onClick={signOut} className="text-red-700 cursor-pointer">
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/auth/signin" className="p-1.5 text-[#3E2923] hover:text-[#B87545] block">
                  <User className="w-5 h-5" />
                </Link>
              )}
            </div>

            {/* Wishlist Icon with Red Circle Badge */}
            <Link href="/wishlist" className="relative p-1.5 text-[#3E2923] hover:text-[#B87545]">
              <Heart className="w-5 h-5" />
              <span className="absolute 0 top-0.5 right-0.5 min-w-[16px] h-4 rounded-full bg-[#E53935] text-[10px] font-bold text-white flex items-center justify-center px-1">
                {wishlistCount}
              </span>
            </Link>

            {/* Cart Icon with Red Circle Badge */}
            <Link href="/cart" className="relative p-1.5 text-[#3E2923] hover:text-[#B87545]">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 rounded-full bg-[#E53935] text-[10px] font-bold text-white flex items-center justify-center px-1">
                {cartCount}
              </span>
            </Link>
          </div>

        </div>
      </nav>

      {/* SEARCH DIALOG (For mobile and live search) */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="sm:max-w-md bg-[#FFF9F3] border-[#E8C7AF] text-[#3E2923] p-5">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg font-bold">Search Gifts</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSearchSubmit} className="relative mt-2">
            <Input
              type="text"
              placeholder="Search for gifts, jewelry, combos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border-[#E8C7AF] text-sm pr-10"
              autoFocus
            />
            <button type="submit" className="absolute right-3 top-2.5 text-[#5A382B]">
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Quick results */}
          {searchLoading ? (
            <div className="py-4 text-center text-xs text-[#5A382B]">Searching...</div>
          ) : searchResults.length > 0 ? (
            <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
              {searchResults.map((item) => (
                <Link
                  key={item.id}
                  href={`/product/${item.slug}`}
                  onClick={() => setIsSearchOpen(false)}
                  className="flex items-center gap-3 p-2 rounded hover:bg-[#F8EEE4]"
                >
                  <img
                    src={item.images?.[0]?.image_url || '/default-product.jpeg'}
                    alt={item.name}
                    className="w-10 h-10 object-cover rounded bg-neutral-100"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#3E2923] truncate">{item.name}</p>
                    <p className="text-[11px] text-[#B87545] font-semibold">₹{item.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* MOBILE DRAWER */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[80vw] max-w-xs bg-[#FFF9F3] border-r border-[#E8C7AF] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#E8C7AF]/40">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                <img src="/logo.png" alt="SKONEASU" className="w-8 h-8 rounded-full object-contain shadow-xs" />
                <span className="font-serif text-lg font-bold text-[#2D1B16]">SKONEASU</span>
              </Link>
            </div>

            <div className="py-4 space-y-3 text-sm font-medium text-[#3E2923]">
              {displayCategories.map((cat) => {
                const displayName = cat.name
                const isOccasion = cat.slug === 'occasions'
                return (
                  <Link
                    key={cat.slug}
                    href={getCategoryLink(cat)}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between py-1 hover:text-[#B87545]"
                  >
                    <span>{displayName}</span>
                    {isOccasion && (
                      <span className="bg-[#E53935] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                        New
                      </span>
                    )}
                  </Link>
                )
              })}
              {/* FIXED: Collections button right before About */}
              <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-[#B87545]">
                Collections
              </Link>

              {/* FIXED: About button */}
              <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-[#B87545]">
                About
              </Link>
              <Link href="/support" onClick={() => setMobileMenuOpen(false)} className="block py-1 hover:text-[#B87545]">
                Help & Contact
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E8C7AF]/40">
            {user ? (
              <div className="space-y-2">
                <div className="pb-1">
                  <p className="text-[11px] text-[#7A665E]">Signed in as</p>
                  <p className="text-sm font-semibold truncate text-[#2D1B16]">{profile?.full_name || user.email}</p>
                </div>

                {isAdmin && (
                  <Button size="sm" asChild className="w-full text-xs bg-[#B87545] hover:bg-[#9E5F35] text-white font-medium justify-center">
                    <Link href="/admin/orders" onClick={() => setMobileMenuOpen(false)}>
                      Admin Dashboard
                    </Link>
                  </Button>
                )}

                <Button size="sm" variant="outline" asChild className="w-full text-xs border-[#3E2923] text-[#2D1B16] hover:bg-[#F8EEE4] justify-center">
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    My Dashboard
                  </Link>
                </Button>

                <Button size="sm" variant="outline" asChild className="w-full text-xs border-[#3E2923]/60 text-[#2D1B16] hover:bg-[#F8EEE4] justify-center">
                  <Link href="/orders" onClick={() => setMobileMenuOpen(false)}>
                    My Orders
                  </Link>
                </Button>

                <Button size="sm" variant="ghost" onClick={signOut} className="w-full text-xs text-red-700 hover:text-red-800 hover:bg-red-50 mt-1">
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button asChild className="w-full bg-[#2D1B16] text-white text-xs">
                <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>

    </header>
  )
}
