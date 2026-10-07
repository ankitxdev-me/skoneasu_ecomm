'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Filter,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Search,
  Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { productAPI, categoryAPI } from '@/lib/api'
import { Slider } from '@/components/ui/slider'
import ProductCard from '@/components/ProductCard'

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFF9F3] flex items-center justify-center">
          <div className="animate-pulse text-[#73533D] font-sans font-medium text-sm">
            Loading collection...
          </div>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  )
}

function ShopContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [rawProducts, setRawProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  // Mobile Filter Sheet state
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  // Filters State
  const getInitialCategory = () => {
    let cat = searchParams.get('category') || ''
    const filter = searchParams.get('filter') || ''
    if (!cat && (filter === 'new-arrivals' || filter === 'new-product')) return 'new-product'
    if (cat === 'new-arrivals') return 'new-product'
    return cat
  }
  const [selectedCategory, setSelectedCategory] = useState(getInitialCategory())
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest')
  const [selectedRating, setSelectedRating] = useState(null)
  const [inStockOnly, setInStockOnly] = useState(false)
  const [onSaleOnly, setOnSaleOnly] = useState(false)

  // Price range slider state
  const [priceBounds, setPriceBounds] = useState({ min: 200, max: 2000 })
  const [selectedPrice, setSelectedPrice] = useState([200, 2000])

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 12

  // Sync with URL params
  useEffect(() => {
    let cat = searchParams.get('category') || ''
    const filter = searchParams.get('filter') || ''
    if (!cat && (filter === 'new-arrivals' || filter === 'new-product')) {
      cat = 'new-product'
    } else if (cat === 'new-arrivals') {
      cat = 'new-product'
    }
    const srch = searchParams.get('search') || ''
    const srt = searchParams.get('sort') || 'newest'
    setSelectedCategory(cat)
    setSearchQuery(srch)
    setSortBy(srt)
  }, [searchParams])

  // Fetch initial data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [catsData, prodsData] = await Promise.all([
        categoryAPI.getAll(),
        productAPI.getAll({ limit: 100 }),
      ])

      const cats = Array.isArray(catsData) ? catsData : []
      setCategories(cats)

      const prods = prodsData.products || []
      setRawProducts(prods)

      if (prods.length > 0) {
        const prices = prods.map((p) => p.discount_price || p.price || 0)
        const minP = Math.floor(Math.min(...prices) / 100) * 100 || 200
        const maxP = Math.ceil(Math.max(...prices) / 100) * 100 || 2000
        setPriceBounds({ min: minP, max: maxP })
        setSelectedPrice([minP, maxP])
      }
    } catch (err) {
      console.error('Error loading shop data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Update query string in URL
  const updateUrlParam = (key, value) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/shop?${params.toString()}`)
  }

  const handleCategorySelect = (slug) => {
    const newSlug = selectedCategory === slug ? '' : slug
    setSelectedCategory(newSlug)
    updateUrlParam('category', newSlug)
    setCurrentPage(1)
  }

  const handleSearchSubmit = (q) => {
    setSearchQuery(q)
    updateUrlParam('search', q)
    setCurrentPage(1)
  }

  const handleSortChange = (sortOption) => {
    setSortBy(sortOption)
    updateUrlParam('sort', sortOption)
    setCurrentPage(1)
  }

  const handleClearFilters = () => {
    setSelectedCategory('')
    setSearchQuery('')
    setSortBy('newest')
    setSelectedRating(null)
    setInStockOnly(false)
    setOnSaleOnly(false)
    setSelectedPrice([priceBounds.min, priceBounds.max])
    setCurrentPage(1)
    router.push('/shop')
  }

  // Calculate category product counts dynamically
  const categoryCounts = useMemo(() => {
    const counts = {}
    rawProducts.forEach((p) => {
      (p.categories || []).forEach((c) => {
        const slug = c.category?.slug || c.slug
        if (slug) counts[slug] = (counts[slug] || 0) + 1
      })
    })
    return counts
  }, [rawProducts])

  const availabilityCounts = useMemo(() => {
    let inStock = 0
    let onSale = 0
    rawProducts.forEach((p) => {
      if ((p.stock_quantity ?? 1) > 0) inStock++
      if (p.discount_price && p.discount_price < p.price) onSale++
    })
    return { inStock, onSale }
  }, [rawProducts])

  // Filter & Sort products
  const filteredProducts = useMemo(() => {
    return rawProducts
      .filter((p) => {
        // Category filter
        if (selectedCategory) {
          const matchCat = (p.categories || []).some((c) => {
            const slug = c.category?.slug || c.slug
            return slug === selectedCategory
          })
          if (!matchCat) return false
        }

        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim()
          const nameMatch = p.name?.toLowerCase().includes(q)
          const descMatch = p.description?.toLowerCase().includes(q)
          if (!nameMatch && !descMatch) return false
        }

        // Price range filter
        const price = p.discount_price || p.price || 0
        if (price < selectedPrice[0] || price > selectedPrice[1]) {
          return false
        }

        // Rating filter
        if (selectedRating !== null) {
          const avg = p.averageRating || (p.reviews?.length ? p.reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / p.reviews.length : 0)
          if (avg < selectedRating) return false
        }

        // In stock filter
        if (inStockOnly) {
          if ((p.stock_quantity ?? 1) <= 0) return false
        }

        // On sale filter
        if (onSaleOnly) {
          if (!p.discount_price || p.discount_price >= p.price) return false
        }

        return true
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') {
          return (a.discount_price || a.price) - (b.discount_price || b.price)
        }
        if (sortBy === 'price_desc') {
          return (b.discount_price || b.price) - (a.discount_price || a.price)
        }
        // Default newest
        return new Date(b.created_at || 0) - new Date(a.created_at || 0)
      })
  }, [
    rawProducts,
    selectedCategory,
    searchQuery,
    selectedPrice,
    selectedRating,
    inStockOnly,
    onSaleOnly,
    sortBy,
  ])

  // Pagination slicing
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE))
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredProducts, currentPage])

  const scrollToGrid = () => {
    if (typeof window !== 'undefined') {
      const el = document.getElementById('product-grid-section')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const selectedCategoryObj = categories.find((c) => c.slug === selectedCategory)

  // Active filter pills list
  const activePills = []
  if (selectedCategoryObj) {
    activePills.push({
      id: 'cat',
      label: selectedCategoryObj.name,
      onRemove: () => handleCategorySelect(selectedCategory),
    })
  } else if (!selectedCategory && rawProducts.length > 0) {
    activePills.push({
      id: 'all',
      label: 'All Collections',
      onRemove: null,
    })
  }
  if (inStockOnly) {
    activePills.push({
      id: 'stock',
      label: 'In Stock',
      onRemove: () => setInStockOnly(false),
    })
  }
  if (onSaleOnly) {
    activePills.push({
      id: 'sale',
      label: 'On Sale',
      onRemove: () => setOnSaleOnly(false),
    })
  }
  if (selectedRating !== null) {
    activePills.push({
      id: 'rating',
      label: `${selectedRating}★ & up`,
      onRemove: () => setSelectedRating(null),
    })
  }
  if (searchQuery.trim()) {
    activePills.push({
      id: 'search',
      label: `"${searchQuery}"`,
      onRemove: () => handleSearchSubmit(''),
    })
  }

  const sortLabel = {
    newest: 'Newest',
    price_asc: 'Price: Low to High',
    price_desc: 'Price: High to Low',
  }[sortBy] || 'Newest'

  return (
    <div className="min-h-screen bg-[#FFF9F3] text-[#2D1B16]">
      <Header />

      <main className="max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 mt-4 sm:mt-6 pb-16 sm:pb-24">
        
        {/* =========================================================
            1. TOP HERO BANNER (Matches Reference Image Exactly)
            ========================================================= */}
        <section className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden bg-[#F7EDE3] border border-[#E8C7AF]/60 mb-6 sm:mb-8 shadow-xs">
          
          {/* Banner photography background */}
          <img
            src="/Collection_banner.png"
            alt="SKONEASU Collection"
            className="absolute inset-0 w-full h-full object-cover object-right md:object-right-center"
          />

          {/* Smooth left-to-right fade overlay for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#F7EDE3] via-[#F7EDE3]/90 md:via-[#F7EDE3]/75 to-transparent w-full md:w-[75%] lg:w-[62%] pointer-events-none" />

          {/* Banner Content */}
          <div className="relative z-10 p-5 sm:p-7 md:p-9 lg:p-11 max-w-xl">
            {/* Breadcrumb: Home > Collections */}
            <nav className="flex items-center gap-1.5 text-xs text-[#8C6B58] font-sans font-medium mb-2.5 sm:mb-3">
              <Link href="/" className="hover:text-[#2D1B16] transition-colors">
                Home
              </Link>
              <span className="opacity-60">&gt;</span>
              <span className="text-[#2D1B16] font-semibold">Collections</span>
            </nav>

            {/* Title: Our Collection */}
            <h1 className="font-serif font-semibold text-3xl sm:text-4xl md:text-[42px] lg:text-[46px] text-[#2D1B16] leading-[1.05] tracking-[-0.02em] mb-2 sm:mb-3">
              Our Collection
            </h1>

            {/* Description */}
            <p className="font-sans font-normal text-xs sm:text-[14px] text-[#73533D] leading-relaxed max-w-md">
              Explore our handcrafted jewelry, designed to bring elegance and sparkle to every moment.
            </p>
          </div>

          {/* Handwritten luxury script accent */}
          <div className="hidden lg:block absolute left-[45%] top-[24%] z-10 pointer-events-none select-none -rotate-6">
            <span className="font-script text-[#73533D]/80 text-2xl xl:text-3xl tracking-wide">
              Gifts that tell your story &#9825;
            </span>
          </div>
        </section>

        {/* =========================================================
            2. MOBILE CONTROLS BAR (< lg)
            ========================================================= */}
        <div className="block lg:hidden mb-5">
          <div className="flex items-center gap-2.5">
            {/* Filter Drawer Toggle */}
            <Button
              variant="outline"
              onClick={() => setMobileFilterOpen(true)}
              className="flex-1 bg-white border-[#E8C7AF] text-[#2D1B16] hover:bg-[#FAF2EB] rounded-xl text-xs sm:text-sm font-semibold h-10 flex items-center justify-center gap-2 shadow-2xs"
            >
              <Filter className="w-4 h-4 text-[#8C4B23]" />
              <span>Filters</span>
            </Button>

            {/* Mobile Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-1 bg-white border-[#E8C7AF] text-[#2D1B16] hover:bg-[#FAF2EB] rounded-xl text-xs sm:text-sm font-semibold h-10 flex items-center justify-between px-3.5 shadow-2xs"
                >
                  <span className="truncate">Sort: {sortLabel}</span>
                  <ChevronDown className="w-4 h-4 ml-1 shrink-0 text-[#8C4B23]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-[#FFF9F3] border-[#E8C7AF]">
                <DropdownMenuItem onClick={() => handleSortChange('newest')} className="cursor-pointer">
                  Newest
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange('price_asc')} className="cursor-pointer">
                  Price: Low to High
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange('price_desc')} className="cursor-pointer">
                  Price: High to Low
                </DropdownMenuItem>

              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* =========================================================
            3. MAIN BODY: LEFT SIDEBAR + RIGHT PRODUCT GRID
            ========================================================= */}
        <div className="flex flex-col lg:flex-row gap-6 xl:gap-8 items-start">
          
          {/* DESKTOP FILTER SIDEBAR */}
          <aside className="hidden lg:block w-[240px] xl:w-[260px] shrink-0 sticky top-24 self-start">
            <FilterSidebarContent
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategorySelect}
              categoryCounts={categoryCounts}
              totalCount={rawProducts.length}
              searchQuery={searchQuery}
              onSearch={handleSearchSubmit}
              priceBounds={priceBounds}
              selectedPrice={selectedPrice}
              onPriceChange={setSelectedPrice}
              selectedRating={selectedRating}
              onSelectRating={setSelectedRating}
              inStockOnly={inStockOnly}
              onToggleInStock={() => setInStockOnly(!inStockOnly)}
              onSaleOnly={onSaleOnly}
              onToggleOnSale={() => setOnSaleOnly(!onSaleOnly)}
              availabilityCounts={availabilityCounts}
              onClearFilters={handleClearFilters}
            />
          </aside>

          {/* RIGHT PRODUCT DISPLAY SECTION */}
          <div id="product-grid-section" className="flex-1 min-w-0 w-full">
            
            {/* TOP BAR: Results Count + Active Filter Tags + Desktop Sort Dropdown */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-2 border-b border-[#E8C7AF]/40">
              
              {/* Left: Showing count + active tags */}
              <div className="flex items-center flex-wrap gap-2">
                <span className="font-sans font-medium text-xs sm:text-[13px] text-[#73533D]">
                  Showing {filteredProducts.length} results
                </span>

                {/* Filter Pills */}
                {activePills.map((pill) => (
                  <span
                    key={pill.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F5EBE1] border border-[#E8C7AF] text-[#2D1B16] shadow-2xs"
                  >
                    <span>{pill.label}</span>
                    {pill.onRemove && (
                      <button
                        type="button"
                        onClick={pill.onRemove}
                        className="hover:text-[#E53935] transition-colors ml-0.5 cursor-pointer"
                        aria-label={`Remove filter ${pill.label}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {/* Desktop Sort Dropdown */}
              <div className="hidden lg:flex items-center gap-2 shrink-0">
                <span className="font-sans text-xs sm:text-[13px] text-[#73533D]">Sort by:</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white border-[#E8C7AF] text-[#2D1B16] hover:bg-[#FAF2EB] rounded-lg text-xs font-semibold h-8.5 px-3 min-w-[140px] justify-between shadow-2xs"
                    >
                      <span>{sortLabel}</span>
                      <ChevronDown className="w-3.5 h-3.5 ml-1 text-[#8C4B23]" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-[#FFF9F3] border-[#E8C7AF]">
                    <DropdownMenuItem onClick={() => handleSortChange('newest')} className="cursor-pointer">
                      Newest
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSortChange('price_asc')} className="cursor-pointer">
                      Price: Low to High
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSortChange('price_desc')} className="cursor-pointer">
                      Price: High to Low
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSortChange('rating')} className="cursor-pointer">
                      Customer Rating
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

            </div>

            {/* PRODUCT GRID */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4 md:gap-5">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-[#E8C7AF]/40 p-3 animate-pulse flex flex-col justify-between">
                    <div className="aspect-square rounded-lg bg-[#FAF2EB] mb-2.5" />
                    <div className="space-y-2">
                      <div className="w-3/4 h-4 bg-[#FAF2EB] rounded" />
                      <div className="w-1/2 h-3.5 bg-[#FAF2EB] rounded" />
                    </div>
                    <div className="w-full h-8 bg-[#FAF2EB] rounded-lg mt-3" />
                  </div>
                ))}
              </div>
            ) : paginatedProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4 md:gap-5">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-[#E8C7AF]/60 p-8 shadow-xs">
                <h3 className="font-serif font-semibold text-lg text-[#2D1B16] mb-2">No products found</h3>
                <p className="font-sans text-xs sm:text-sm text-[#73533D] mb-5">Try relaxing your filter criteria or searching for something else.</p>
                <Button
                  onClick={handleClearFilters}
                  className="bg-[#2D1B16] text-[#FFF9F3] hover:bg-[#3E2923] text-xs font-semibold px-5 h-9 rounded-lg"
                >
                  Clear All Filters
                </Button>
              </div>
            )}

            {/* =========================================================
                4. PAGINATION (Matches Mockup Exactly)
                ========================================================= */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-10 sm:mt-12 select-none">
                {/* Prev Button */}
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1))
                    scrollToGrid()
                  }}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-[#E8C7AF] bg-white text-[#2D1B16] hover:bg-[#F5EBE1] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Previous Page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page numbers */}
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1
                  const isActive = pageNum === currentPage
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => {
                        setCurrentPage(pageNum)
                        scrollToGrid()
                      }}
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg font-sans text-xs sm:text-sm font-semibold flex items-center justify-center transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#B87545] text-white shadow-2xs'
                          : 'bg-white border border-[#E8C7AF] text-[#2D1B16] hover:bg-[#F5EBE1]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}

                {/* Next Button */}
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                    scrollToGrid()
                  }}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-[#E8C7AF] bg-white text-[#2D1B16] hover:bg-[#F5EBE1] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
                  aria-label="Next Page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>

        </div>

      </main>

      {/* MOBILE FILTER SHEET */}
      <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
        <SheetContent side="left" className="w-[85vw] max-w-sm bg-[#FFF9F3] border-r border-[#E8C7AF] p-5 overflow-y-auto">
          <SheetHeader className="pb-3 border-b border-[#E8C7AF]/40">
            <SheetTitle className="font-serif text-lg font-bold text-[#2D1B16] flex items-center justify-between">
              <span>Filter Products</span>
            </SheetTitle>
          </SheetHeader>
          <div className="pt-4">
            <FilterSidebarContent
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={(slug) => {
                handleCategorySelect(slug)
                setMobileFilterOpen(false)
              }}
              categoryCounts={categoryCounts}
              totalCount={rawProducts.length}
              searchQuery={searchQuery}
              onSearch={(q) => {
                handleSearchSubmit(q)
                setMobileFilterOpen(false)
              }}
              priceBounds={priceBounds}
              selectedPrice={selectedPrice}
              onPriceChange={setSelectedPrice}
              selectedRating={selectedRating}
              onSelectRating={(r) => {
                setSelectedRating(r)
                setMobileFilterOpen(false)
              }}
              inStockOnly={inStockOnly}
              onToggleInStock={() => setInStockOnly(!inStockOnly)}
              onSaleOnly={onSaleOnly}
              onToggleOnSale={() => setOnSaleOnly(!onSaleOnly)}
              availabilityCounts={availabilityCounts}
              onClearFilters={() => {
                handleClearFilters()
                setMobileFilterOpen(false)
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Footer />
    </div>
  )
}

/**
 * FilterSidebarContent: Shared between Desktop Sidebar & Mobile Sheet
 */
function FilterSidebarContent({
  categories,
  selectedCategory,
  onSelectCategory,
  categoryCounts,
  totalCount,
  searchQuery,
  onSearch,
  priceBounds,
  selectedPrice,
  onPriceChange,
  selectedRating,
  onSelectRating,
  inStockOnly,
  onToggleInStock,
  onSaleOnly,
  onToggleOnSale,
  availabilityCounts,
  onClearFilters,
}) {
  const [catOpen, setCatOpen] = useState(true)
  const [priceOpen, setPriceOpen] = useState(true)
  const [ratingOpen, setRatingOpen] = useState(true)
  const [availOpen, setAvailOpen] = useState(true)

  const [localSearch, setLocalSearch] = useState(searchQuery || '')

  useEffect(() => {
    setLocalSearch(searchQuery || '')
  }, [searchQuery])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    onSearch(localSearch)
  }

  return (
    <div className="space-y-6 text-[#2D1B16]">
      
      {/* 1. Search Box */}
      <div>
        <h3 className="font-sans font-semibold text-[14px] text-[#2D1B16] mb-2">Search</h3>
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            placeholder="Search products..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full bg-white border border-[#E8C7AF] text-xs sm:text-sm text-[#2D1B16] placeholder-[#8C6B58]/60 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-1 focus:ring-[#B87545]"
          />
          <button
            type="submit"
            className="absolute right-2.5 top-2.5 text-[#8C6B58] hover:text-[#2D1B16]"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* 2. Categories with Counts */}
      <div className="border-t border-[#E8C7AF]/40 pt-4">
        <button
          type="button"
          onClick={() => setCatOpen(!catOpen)}
          className="flex items-center justify-between w-full font-sans font-semibold text-[14px] text-[#2D1B16] mb-2.5 cursor-pointer"
        >
          <span>Categories</span>
          {catOpen ? <ChevronUp className="w-4 h-4 text-[#8C6B58]" /> : <ChevronDown className="w-4 h-4 text-[#8C6B58]" />}
        </button>

        {catOpen && (
          <div className="space-y-2 mt-2">
            {/* All Collections */}
            <label
              onClick={() => onSelectCategory('')}
              className="flex items-center justify-between text-xs sm:text-sm cursor-pointer group py-0.5 select-none"
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    !selectedCategory ? 'bg-[#2D1B16] border-[#2D1B16] text-white' : 'border-[#C8AA98] bg-white'
                  }`}
                >
                  {!selectedCategory && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span className={`font-medium ${!selectedCategory ? 'text-[#2D1B16] font-semibold' : 'text-[#5A382B] group-hover:text-[#2D1B16]'}`}>
                  All Collections
                </span>
              </div>
              <span className="text-[11px] text-neutral-400">({totalCount})</span>
            </label>

            {/* Individual DB Categories */}
            {categories.map((cat) => {
              const isChecked = selectedCategory === cat.slug
              const count = categoryCounts[cat.slug] || 0
              return (
                <label
                  key={cat.id || cat.slug}
                  onClick={() => onSelectCategory(cat.slug)}
                  className="flex items-center justify-between text-xs sm:text-sm cursor-pointer group py-0.5 select-none"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        isChecked ? 'bg-[#2D1B16] border-[#2D1B16] text-white' : 'border-[#C8AA98] bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className={`font-medium ${isChecked ? 'text-[#2D1B16] font-semibold' : 'text-[#5A382B] group-hover:text-[#2D1B16]'}`}>
                      {cat.name}
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-400">({count})</span>
                </label>
              )
            })}
          </div>
        )}
      </div>

      {/* 3. Price Range */}
      <div className="border-t border-[#E8C7AF]/40 pt-4">
        <button
          type="button"
          onClick={() => setPriceOpen(!priceOpen)}
          className="flex items-center justify-between w-full font-sans font-semibold text-[14px] text-[#2D1B16] mb-2.5 cursor-pointer"
        >
          <span>Price Range</span>
          {priceOpen ? <ChevronUp className="w-4 h-4 text-[#8C6B58]" /> : <ChevronDown className="w-4 h-4 text-[#8C6B58]" />}
        </button>

        {priceOpen && (
          <div className="pt-2 px-1">
            <Slider
              min={priceBounds.min}
              max={priceBounds.max}
              step={50}
              value={selectedPrice}
              onValueChange={onPriceChange}
              className="mb-3"
            />
            <div className="flex items-center justify-between font-sans text-xs sm:text-[13px] text-[#73533D]">
              <span className="font-semibold">₹{selectedPrice[0]}</span>
              <span className="font-semibold">₹{selectedPrice[1]}</span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Rating */}
      <div className="border-t border-[#E8C7AF]/40 pt-4">
        <button
          type="button"
          onClick={() => setRatingOpen(!ratingOpen)}
          className="flex items-center justify-between w-full font-sans font-semibold text-[14px] text-[#2D1B16] mb-2.5 cursor-pointer"
        >
          <span>Rating</span>
          {ratingOpen ? <ChevronUp className="w-4 h-4 text-[#8C6B58]" /> : <ChevronDown className="w-4 h-4 text-[#8C6B58]" />}
        </button>

        {ratingOpen && (
          <div className="space-y-1.5 mt-2">
            {[5, 4, 3, 2].map((stars) => {
              const isChecked = selectedRating === stars
              return (
                <label
                  key={stars}
                  onClick={() => onSelectRating(isChecked ? null : stars)}
                  className="flex items-center gap-2 text-xs sm:text-sm cursor-pointer group py-0.5 select-none"
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      isChecked ? 'bg-[#2D1B16] border-[#2D1B16] text-white' : 'border-[#C8AA98] bg-white'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div className="flex items-center gap-1 text-[#F59E0B]">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < stars ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-neutral-300 fill-neutral-200'
                        }`}
                      />
                    ))}
                    <span className="text-xs text-[#5A382B] ml-1 font-medium">{stars} &amp; up</span>
                  </div>
                </label>
              )
            })}
          </div>
        )}
      </div>

      {/* 5. Availability */}
      <div className="border-t border-[#E8C7AF]/40 pt-4">
        <button
          type="button"
          onClick={() => setAvailOpen(!availOpen)}
          className="flex items-center justify-between w-full font-sans font-semibold text-[14px] text-[#2D1B16] mb-2.5 cursor-pointer"
        >
          <span>Availability</span>
          {availOpen ? <ChevronUp className="w-4 h-4 text-[#8C6B58]" /> : <ChevronDown className="w-4 h-4 text-[#8C6B58]" />}
        </button>

        {availOpen && (
          <div className="space-y-2 mt-2">
            {/* In Stock */}
            <label
              onClick={onToggleInStock}
              className="flex items-center justify-between text-xs sm:text-sm cursor-pointer group py-0.5 select-none"
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    inStockOnly ? 'bg-[#2D1B16] border-[#2D1B16] text-white' : 'border-[#C8AA98] bg-white'
                  }`}
                >
                  {inStockOnly && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span className={`font-medium ${inStockOnly ? 'text-[#2D1B16] font-semibold' : 'text-[#5A382B] group-hover:text-[#2D1B16]'}`}>
                  In Stock
                </span>
              </div>
              <span className="text-[11px] text-neutral-400">({availabilityCounts.inStock})</span>
            </label>

            {/* On Sale */}
            <label
              onClick={onToggleOnSale}
              className="flex items-center justify-between text-xs sm:text-sm cursor-pointer group py-0.5 select-none"
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    onSaleOnly ? 'bg-[#2D1B16] border-[#2D1B16] text-white' : 'border-[#C8AA98] bg-white'
                  }`}
                >
                  {onSaleOnly && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span className={`font-medium ${onSaleOnly ? 'text-[#2D1B16] font-semibold' : 'text-[#5A382B] group-hover:text-[#2D1B16]'}`}>
                  On Sale
                </span>
              </div>
              <span className="text-[11px] text-neutral-400">({availabilityCounts.onSale})</span>
            </label>
          </div>
        )}
      </div>

      {/* 6. Clear Filters Button */}
      <div className="pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClearFilters}
          className="w-full bg-[#FFF9F3] border-[#E8C7AF] text-[#8C4B23] hover:bg-[#F5EBE1] hover:text-[#2D1B16] rounded-xl text-xs sm:text-[13px] font-semibold h-10 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
        >
          <X className="w-3.5 h-3.5" />
          <span>Clear Filters</span>
        </Button>
      </div>

    </div>
  )
}
