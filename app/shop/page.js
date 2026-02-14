'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { Filter, SlidersHorizontal, ChevronDown, Check, X, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet'
import { Checkbox } from '@/components/ui/checkbox'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { productAPI, categoryAPI } from '@/lib/api'
import { useCart } from '@/contexts/CartContext'
import { Slider } from '@/components/ui/slider'
import ProductCard from '@/components/ProductCard'

export default function ShopPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><div className="animate-pulse text-neutral-400">Loading...</div></div>}>
            <ShopContent />
        </Suspense>
    )
}

function ShopContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 })
    const [filters, setFilters] = useState({
        category: searchParams.get('category') || '',
        search: searchParams.get('search') || '',
        sort: searchParams.get('sort') || 'newest',
        min_price: '',
        max_price: ''
    })

    // Load initial data
    useEffect(() => {
        loadCategories()
    }, [])

    // Load products when filters change
    useEffect(() => {
        loadProducts()
    }, [filters, searchParams])

    // Sync state with URL params
    useEffect(() => {
        setFilters(prev => ({
            ...prev,
            category: searchParams.get('category') || '',
            search: searchParams.get('search') || '',
            sort: searchParams.get('sort') || 'newest',
        }))
    }, [searchParams])

    const loadCategories = async () => {
        try {
            const data = await categoryAPI.getAll()
            setCategories(data || [])
        } catch (error) {
            console.error('Error loading categories:', error)
        }
    }

    const loadProducts = async () => {
        setLoading(true)
        try {
            // Build query params
            const params = {
                sort: filters.sort,
                limit: 50 // Show plenty of items
            }

            if (filters.category) params.category = filters.category
            if (filters.search) params.search = filters.search
            if (filters.min_price) params.min_price = filters.min_price
            if (filters.max_price) params.max_price = filters.max_price

            const data = await productAPI.getAll(params)
            setProducts(data.products || [])

            // Update price range from API if provided, adapting to the current scope
            if (data.priceRange) {
                setPriceRange(data.priceRange)
            }
        } catch (error) {
            console.error('Error loading products:', error)
        } finally {
            setLoading(false)
        }
    }

    const updateFilter = (key, value) => {
        const newFilters = { ...filters, [key]: value }
        setFilters(newFilters)

        // Update URL
        const params = new URLSearchParams(searchParams.toString())
        if (value) {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        router.push(`/shop?${params.toString()}`)
    }

    const clearFilters = () => {
        setFilters({
            category: '',
            search: '',
            sort: 'newest',
            min_price: '',
            max_price: ''
        })
        router.push('/shop')
    }

    const { addToCart } = useCart()

    return (
        <div className="min-h-screen bg-white">
            <Header />

            {/* Page Header */}
            <div className="bg-muted/30 py-12 mb-8 border-b border-border">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl font-serif font-bold text-primary mb-4">
                        Our Collection
                    </h1>
                    <p className="text-neutral-600 max-w-2xl">
                        Explore our handcrafted jewelry, designed to bring elegance and sparkle to every moment.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 pb-20">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Mobile Filter Sheet & Search */}
                    <div className="lg:hidden mb-6 space-y-3">
                        <SearchInput
                            initialQuery={filters.search}
                            onSearch={(q) => updateFilter('search', q)}
                            placeholder="Search products..."
                            className="w-full"
                        />
                        <div className="flex gap-2">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" className="flex-1">
                                        <Filter className="mr-2 h-4 w-4" /> Filters
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left">
                                    <SheetHeader>
                                        <SheetTitle>Filters</SheetTitle>
                                        <SheetDescription>Refine your search</SheetDescription>
                                    </SheetHeader>
                                    <div className="py-6 space-y-6">
                                        <FilterSidebar
                                            categories={categories}
                                            filters={filters}
                                            updateFilter={updateFilter}
                                            clearFilters={clearFilters}
                                            priceRange={priceRange}
                                        />
                                    </div>
                                </SheetContent>
                            </Sheet>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="flex-1">
                                        <SlidersHorizontal className="mr-2 h-4 w-4" /> Sort
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => updateFilter('sort', 'newest')}>
                                        Newest
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => updateFilter('sort', 'price_asc')}>
                                        Price: Low to High
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => updateFilter('sort', 'price_desc')}>
                                        Price: High to Low
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Sidebar Filters (Desktop) */}
                    <div className="hidden lg:block w-64 flex-shrink-0">
                        <div className="sticky top-24">
                            <FilterSidebar
                                categories={categories}
                                filters={filters}
                                updateFilter={updateFilter}
                                clearFilters={clearFilters}
                                priceRange={priceRange}
                            />
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1">
                        {/* Desktop Sort Bar */}
                        <div className="hidden lg:flex justify-between items-center mb-6">
                            <p className="text-neutral-500">
                                Showing {products.length} results
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Sort by:</span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            {filters.sort === 'newest' && 'Newest'}
                                            {filters.sort === 'price_asc' && 'Price: Low to High'}
                                            {filters.sort === 'price_desc' && 'Price: High to Low'}
                                            <ChevronDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => updateFilter('sort', 'newest')}>
                                            Newest
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => updateFilter('sort', 'price_asc')}>
                                            Price: Low to High
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => updateFilter('sort', 'price_desc')}>
                                            Price: High to Low
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                                {Array.from({ length: 6 }).map((_, idx) => (
                                    <div key={idx} className="animate-pulse">
                                        <div className="aspect-square bg-neutral-200 rounded-lg mb-4" />
                                        <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2" />
                                        <div className="h-4 bg-neutral-200 rounded w-1/2" />
                                    </div>
                                ))}
                            </div>
                        ) : products.length > 0 ? (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                                {products.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-neutral-50 rounded-lg">
                                <h3 className="text-lg font-semibold text-neutral-900 mb-2">No products found</h3>
                                <p className="text-neutral-500 mb-6">Try adjusting your filters</p>
                                <Button onClick={clearFilters}>Clear All Filters</Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

function FilterSidebar({ categories, filters, updateFilter, clearFilters, priceRange }) {
    // Local state for slider dragging
    const [localPrice, setLocalPrice] = useState([0, 1000000])

    // Update local state when filters or available range changes
    // Only if user isn't actively dragging (requires more logic, but for now strict sync is fine for "onValueChange")
    // Actually, we should sync ONLY when the dependencies change, not on every render.
    useEffect(() => {
        if (priceRange) {
            const min = filters.min_price ? parseInt(filters.min_price) : priceRange.min
            const max = filters.max_price ? parseInt(filters.max_price) : priceRange.max
            setLocalPrice([min, max])
        }
    }, [priceRange.min, priceRange.max, filters.min_price, filters.max_price])

    const handlePriceChange = (value) => {
        setLocalPrice(value)
    }

    const handlePriceCommit = (value) => {
        updateFilter('min_price', value[0])
        updateFilter('max_price', value[1])
    }

    return (
        <div className="space-y-8">
            <div>
                <h3 className="font-semibold text-primary mb-4">Search</h3>
                <SearchInput initialQuery={filters.search} onSearch={(q) => updateFilter('search', q)} />
            </div>

            <div>
                <h3 className="font-semibold text-primary mb-4">Categories</h3>
                <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="all"
                            checked={!filters.category}
                            onCheckedChange={() => updateFilter('category', '')}
                        />
                        <label
                            htmlFor="all"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            All Jewelry
                        </label>
                    </div>
                    {categories.map((cat) => (
                        <div key={cat.id} className="flex items-center space-x-2">
                            <Checkbox
                                id={cat.slug}
                                checked={filters.category === cat.slug}
                                onCheckedChange={() => updateFilter('category', cat.slug)}
                            />
                            <label
                                htmlFor={cat.slug}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                            >
                                {cat.name}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="font-semibold text-primary mb-4">Price Range</h3>
                <div className="px-2">
                    <Slider
                        defaultValue={[priceRange.min, priceRange.max]}
                        value={localPrice}
                        min={priceRange.min}
                        max={priceRange.max}
                        step={100}
                        onValueChange={handlePriceChange}
                        onValueCommit={handlePriceCommit}
                        className="mb-4"
                    />
                    <div className="flex items-center justify-between text-sm text-neutral-600">
                        <span>₹{localPrice[0].toLocaleString()}</span>
                        <span>₹{localPrice[1].toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-neutral-100">
                <Button variant="ghost" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50" onClick={clearFilters}>
                    <X className="mr-2 h-4 w-4" /> Clear Filters
                </Button>
            </div>
        </div>
    )
}

function SearchInput({ initialQuery, onSearch, placeholder = "Search...", className = "" }) {
    const [query, setQuery] = useState(initialQuery || '')

    // Update query if initialQuery changes
    useEffect(() => {
        setQuery(initialQuery || '')
    }, [initialQuery])

    const handleSubmit = (e) => {
        e.preventDefault()
        onSearch(query)
    }

    return (
        <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
            <div className="relative flex-1">
                <input
                    type="text"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 rounded-md border border-neutral-200 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                {query && (
                    <button
                        type="button"
                        onClick={() => { setQuery(''); onSearch(''); }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
            <Button type="submit" size="sm">
                <Search className="h-4 w-4" />
            </Button>
        </form>
    )
}

