'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Gift,
  Truck,
  Sparkles,
  Heart,
  ChevronLeft,
  ChevronRight,
  Diamond,
  ShoppingCart,
  Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import CustomerReviews from '@/components/CustomerReviews'
import { productAPI, categoryAPI } from '@/lib/api'
import { supabase } from '@/lib/supabase'

import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'

export default function HomePage() {
  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [newArrivalProducts, setNewArrivalProducts] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [occasionProducts, setOccasionProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [heroImage, setHeroImage] = useState('/default_hero_banner.png')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [prodsRes, catsRes, settingsRes, newArrivalsRes, featuredRes, occasionsRes] = await Promise.all([
        productAPI.getAll({ limit: 12 }),
        categoryAPI.getAll(),
        supabase.from('store_settings').select('value').eq('key', 'home_hero_image').single(),
        productAPI.getAll({ category: 'new-product', limit: 8 }),
        productAPI.getAll({ featured: true, limit: 8 }),
        productAPI.getAll({ category: 'occasions', limit: 12 })
      ])

      const allProds = prodsRes.products || []
      setProducts(allProds)
      setCategories(catsRes || [])

      if (settingsRes.data?.value && settingsRes.data.value.trim() !== '') {
        setHeroImage(settingsRes.data.value)
      }

      // Direct DB product sets without synthetic fallbacks
      setNewArrivalProducts(newArrivalsRes.products || [])
      setFeaturedProducts(featuredRes.products || [])
      setOccasionProducts(occasionsRes.products || [])
    } catch (err) {
      console.error('Failed to load home data:', err)
    } finally {
      setLoading(false)
    }
  }


  const scrollCategories = (direction = 'right') => {
    const el = document.getElementById('category-scroll-container')
    if (el) {
      const scrollStep = 260
      if (direction === 'right') {
        if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 20) {
          el.scrollTo({ left: 0, behavior: 'smooth' })
        } else {
          el.scrollBy({ left: scrollStep, behavior: 'smooth' })
        }
      } else {
        if (el.scrollLeft <= 20) {
          el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' })
        } else {
          el.scrollBy({ left: -scrollStep, behavior: 'smooth' })
        }
      }
    }
  }

  
  // Uniform product helpers (all data sourced directly from Supabase DB)
  const getProductImage = (p) => {
    return p?.images?.[0]?.image_url || p?.product_images?.[0]?.image_url || '/default-product.jpeg'
  }

  const getProductRating = (p) => {
    if (p?.averageRating && p?.reviewCount > 0) {
      return {
        rating: Number(p.averageRating).toFixed(1),
        count: Number(p.reviewCount)
      }
    }
    if (p?.reviews && Array.isArray(p.reviews) && p.reviews.length > 0) {
      const avg = p.reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / p.reviews.length
      return {
        rating: Number(avg).toFixed(1),
        count: p.reviews.length
      }
    }
    // No real reviews in DB: return null. Never output fake 50-110 default reviews.
    return null
  }

  const getProductDiscountPercent = (p) => {
    if (p?.discount_price && p.price && p.discount_price < p.price) {
      return Math.round(((p.price - p.discount_price) / p.price) * 100)
    }
    return null
  }

  // Pure dynamic data references from database state (Spotlight uses best_seller, remaining fill cards without duplication)
  const featuredSpotlight = featuredProducts.find(p => p.best_seller) || (featuredProducts.length > 0 ? featuredProducts[0] : null)
  const featuredCards = featuredProducts.filter(p => p.id !== featuredSpotlight?.id).slice(0, 4)

  const newArrivalSpotlight = newArrivalProducts.length > 0 ? newArrivalProducts[0] : null
  const newArrivalCards = newArrivalProducts.filter(p => p.id !== newArrivalSpotlight?.id).slice(0, 4)

  return (
    <div className="min-h-screen bg-[#FFF9F3] text-[#2D1B16]">
      <Header />

      {/* =========================================================
          HERO SECTION (Desktop & Phone View EXACTLY as in Mockup)
          ========================================================= */}
      <section className="relative w-full bg-[#F8EEE4] overflow-hidden">
        
        {/* DESKTOP HERO VIEW */}
        <div className="hidden md:block relative w-full min-h-[520px] lg:min-h-[580px] flex items-center pb-10 lg:pb-12">
          <img
            src={heroImage}
            alt="SKONEASU Gift Collection"
            className="absolute inset-0 w-full h-full object-cover object-right"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A0D08]/90 via-[#2D1B16]/75 to-[#3E2923]/10" />

          <div className="container mx-auto px-6 relative z-10 py-12">
            <div className="max-w-xl">
              <span className="font-sans text-[11px] sm:text-[12px] uppercase tracking-[0.16em] font-semibold text-[#E8C7AF] block mb-3">
                MEANINGFUL GIFTS, LASTING MEMORIES
              </span>
              
              <h1 className="font-serif font-semibold text-[42px] sm:text-[50px] md:text-[58px] lg:text-[64px] xl:text-[68px] text-[#FFF9F3] tracking-[-0.02em] leading-[1.0] mb-4">
                Perfect Gifts<br />
                for <span className="text-[#C8845C] font-serif font-semibold">Him, Her</span> &amp;<br />
                Everyone You Love
              </h1>

              <p className="font-sans font-normal text-[15px] sm:text-[16px] text-[#E8D5C0] leading-[1.55] mb-7 max-w-sm">
                Thoughtfully curated jewelry, accessories and gift combos to make every moment special.
              </p>

              <div className="flex items-center gap-3 mb-8">
                <Button asChild className="bg-[#3E2923] hover:bg-[#2A1A16] text-[#FFF9F3] font-sans font-semibold text-[13px] sm:text-[14px] px-6 h-10 rounded-lg tracking-wide">
                  <Link href="/shop" className="inline-flex items-center gap-1.5">
                    Shop Collections <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
                <Button variant="outline" asChild className="bg-transparent border border-[#FFF9F3]/60 text-[#FFF9F3] hover:bg-white/10 font-sans font-semibold text-[13px] sm:text-[14px] px-6 h-10 rounded-lg">
                  <Link href="/shop?category=gift-combos">
                    Find the Perfect Gift
                  </Link>
                </Button>
              </div>

              {/* 4 Trust Badges Desktop - vertical stacked like reference */}
              <div className="grid grid-cols-4 gap-3 pt-5 border-t border-[#FFF9F3]/15">
                <div className="flex flex-col items-center text-center gap-1.5">
                  <Gift className="w-5 h-5 text-[#E8C7AF]" />
                  <span className="text-[10px] font-semibold leading-tight text-[#E8C7AF]/90">Curated<br/>Gift Combos</span>
                </div>
                <div className="flex flex-col items-center text-center gap-1.5">
                  <Sparkles className="w-5 h-5 text-[#E8C7AF]" />
                  <span className="text-[10px] font-semibold leading-tight text-[#E8C7AF]/90">Premium<br/>Quality</span>
                </div>
                <div className="flex flex-col items-center text-center gap-1.5">
                  <Truck className="w-5 h-5 text-[#E8C7AF]" />
                  <span className="text-[10px] font-semibold leading-tight text-[#E8C7AF]/90">Fast &amp; Secure<br/>Delivery</span>
                </div>
                <div className="flex flex-col items-center text-center gap-1.5">
                  <Heart className="w-5 h-5 text-[#E8C7AF]" />
                  <span className="text-[10px] font-semibold leading-tight text-[#E8C7AF]/90">Loved by<br/>1000+ Customers</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* PHONE HERO VIEW (With Black Tint & Crisp Light/White Text) */}
        <div className="block md:hidden relative w-full overflow-hidden bg-[#1A0D08]">
          <div className="relative min-h-[440px] w-full flex flex-col justify-center px-5 py-7">
            <img
              src={heroImage}
              alt="SKONEASU Gift Collection"
              className="absolute inset-0 w-full h-full object-cover object-[42%_center]"
            />
            
            {/* Black Tint / Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20 pointer-events-none" />

            {/* Content Area */}
            <div className="relative z-10 w-full">
              <span className="font-sans text-[11px] uppercase tracking-[0.16em] font-semibold text-[#E8C7AF] block mb-2">
                MEANINGFUL GIFTS,<br />LASTING MEMORIES
              </span>

              <h1 className="font-serif font-semibold text-[32px] sm:text-[38px] text-white tracking-[-0.02em] leading-[1.02] mb-2.5">
                Perfect Gifts<br />
                for <span className="text-[#F3C5A5] font-serif font-semibold">Him, Her</span> &amp;<br />
                Everyone You Love
              </h1>

              <p className="font-sans font-normal text-[13px] sm:text-[14px] text-[#E8D5C0] leading-[1.55] mb-5 max-w-[280px]">
                Thoughtfully curated jewelry, accessories and gift combos to make every moment special.
              </p>

              {/* Both Buttons Full-Width */}
              <div className="space-y-2.5 w-full">
                <Button asChild className="w-full bg-[#FAF2EA] hover:bg-white text-[#2D1B16] text-xs font-bold h-10 rounded-lg shadow-sm">
                  <Link href="/shop" className="inline-flex items-center justify-center gap-1.5 w-full">
                    Shop Collections <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full bg-black/40 border-white/40 text-white hover:bg-black/60 text-xs font-semibold h-10 rounded-lg shadow-2xs">
                  <Link href="/shop?category=gift-combos" className="inline-flex items-center justify-center w-full">
                    Find the Perfect Gift
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* 4 Trust Badges in a single horizontal row on phone */}
          <div className="grid grid-cols-4 gap-1 text-center py-4 px-2 bg-[#2D1B16] border-b border-white/10 text-white">
            <div className="flex flex-col items-center">
              <Gift className="w-4 h-4 text-[#E8C7AF] mb-1.5" />
              <span className="text-[10px] font-semibold text-[#E8D5C0] leading-tight">Curated<br />Gift Combos</span>
            </div>
            <div className="flex flex-col items-center">
              <Sparkles className="w-4 h-4 text-[#E8C7AF] mb-1.5" />
              <span className="text-[10px] font-semibold text-[#E8D5C0] leading-tight">Premium<br />Quality</span>
            </div>
            <div className="flex flex-col items-center">
              <Truck className="w-4 h-4 text-[#E8C7AF] mb-1.5" />
              <span className="text-[10px] font-semibold text-[#E8D5C0] leading-tight">Fast<br />Delivery</span>
            </div>
            <div className="flex flex-col items-center">
              <Heart className="w-4 h-4 text-[#E8C7AF] mb-1.5" />
              <span className="text-[10px] font-semibold text-[#E8D5C0] leading-tight">Loved by<br />Customers</span>
            </div>
          </div>
        </div>

                    {/* Decorative handwritten accent */}
              <div className="hidden xl:block absolute right-[10%] top-[10%] z-10 pointer-events-none select-none -rotate-6">
                <span className="font-script text-[#E8C7AF]/70 text-3xl sm:text-4xl tracking-wide">
                  Gifts that tell your story ♡
                </span>
              </div>
      </section>




      {/* =========================================================
          SHOP BY CATEGORY (Responsive: Sleek Overlapping Card on Desktop, Clean 4-Grid on Mobile)
          ========================================================= */}
      <section className="relative z-20 w-full mb-8 sm:mb-12">
        
        {/* DESKTOP & TABLET VIEW (md and up): Sleek, wide card with minimal margins & ~20% overlap */}
        <div className="hidden md:block -mt-7 sm:-mt-8 md:-mt-8 lg:-mt-9 px-3 sm:px-4 md:px-6 lg:px-8 max-w-[1440px] mx-auto w-full">
          <div className="bg-[#FFFBF7] rounded-[24px] md:rounded-[28px] lg:rounded-[32px] shadow-[0_8px_24px_rgba(45,27,22,0.05)] border border-[#F0E4D8]/80 py-3.5 md:py-4 px-5 sm:px-6 md:px-8">
            <div className="flex items-center justify-between gap-4 lg:gap-8">
              
              {/* Left Header Area: Compact & balanced */}
              <div className="shrink-0 w-[180px] lg:w-[210px] text-left">
                <h2 className="font-serif font-semibold text-2xl lg:text-[28px] xl:text-[32px] text-[#2D1B16] leading-[1.1] tracking-[-0.015em]">
                  Shop by Category
                </h2>
                <p className="font-sans font-normal text-[13px] lg:text-[14px] text-[#8C6B58] leading-[1.55] mt-1">
                  Explore our curated collections for every special moment
                </p>
              </div>

              {/* Right: Contained Carousel + Scroll Arrow */}
              <div className="flex-1 flex items-center gap-3 sm:gap-4 min-w-0 relative">
                
                {/* Scrollable Track */}
                <div className="relative flex-1 min-w-0 overflow-hidden">
                  <div
                    id="category-scroll-container"
                    className="flex items-center gap-3 sm:gap-4 md:gap-5 overflow-x-auto scroll-smooth hide-scrollbar py-1"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {categories.map((cat) => (
                      <Link
                        key={cat.id || cat.slug}
                        href={`/shop?category=${encodeURIComponent(cat.slug)}`}
                        className="group flex flex-col items-center text-center shrink-0 w-[78px] sm:w-[84px] md:w-[88px] lg:w-[92px] focus:outline-none"
                      >
                        <div className="w-14 h-14 sm:w-15 sm:h-15 md:w-16 md:h-16 lg:w-[68px] lg:h-[68px] rounded-full p-1 bg-[#F5EBE1] border border-[#E8C7AF]/60 group-hover:border-[#B87545] transition-all duration-300 group-hover:scale-105 shadow-xs aspect-square flex items-center justify-center">
                          <div className="w-full h-full rounded-full overflow-hidden bg-[#FAF2EB]">
                            <img
                              src={cat.image_url}
                              alt={cat.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              loading="lazy"
                            />
                          </div>
                        </div>
                        <span
                          className="font-sans font-semibold text-[13px] sm:text-[14px] text-[#2D1B16] mt-2 group-hover:text-[#B87545] transition-colors leading-[1.3] text-center max-w-full block px-0.5 tracking-normal"
                          style={{
                            fontFamily: '"Manrope", sans-serif',
                            fontWeight: 600,
                            fontSize: 'clamp(13px, 1.05vw, 14px)',
                            lineHeight: '1.3',
                            textAlign: 'center'
                          }}
                        >
                          {cat.name}
                        </span>
                      </Link>
                    ))}
                  </div>

                  {/* Subtle fade on right edge */}
                  <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-[#FFFBF7] to-transparent" />
                </div>

                {/* Compact Scroll Arrow */}
                <button
                  type="button"
                  onClick={() => scrollCategories('right')}
                  className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-[#EFE2D4] hover:bg-[#E2D0C0] active:scale-95 text-[#73533D] hover:text-[#2D1B16] flex items-center justify-center shrink-0 transition-all duration-200 shadow-xs cursor-pointer focus:outline-none"
                  aria-label="See more categories"
                  title="See more categories"
                >
                  <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5" />
                </button>

              </div>

            </div>
          </div>
        </div>

        {/* MOBILE VIEW (< md): Horizontal scroll for ALL categories + View All Button */}
        <div className="block md:hidden px-4 pt-5 pb-3">
          
          {/* Header Row: Shop by Category + View All Button */}
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="font-serif font-semibold text-xl sm:text-2xl text-[#2D1B16] whitespace-nowrap tracking-[-0.015em]">
              Shop by Category
            </h2>
            <Link
              href="/shop"
              className="text-xs font-semibold text-[#2D1B16] border border-[#2D1B16] px-3.5 py-1 rounded-full hover:bg-[#2D1B16] hover:text-white transition-colors flex items-center gap-1 shrink-0"
            >
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Horizontal scrollable row for ALL categories */}
          <div className="flex items-center gap-3 overflow-x-auto scroll-smooth hide-scrollbar pb-2 pt-1 -mx-4 px-4">
            {categories.map((cat) => (
              <Link
                key={cat.id || cat.slug}
                href={`/shop?category=${encodeURIComponent(cat.slug)}`}
                className="group flex flex-col items-center text-center shrink-0 w-[78px] sm:w-[84px] focus:outline-none"
              >
                <div className="relative w-full pt-[100%] rounded-2xl bg-[#F5EBE1] border border-[#E8C7AF]/60 group-hover:border-[#B87545] transition-all duration-300 group-hover:scale-105 shadow-xs overflow-hidden">
                  <div className="absolute inset-1 rounded-xl overflow-hidden bg-[#FAF2EB]">
                    <img
                      src={cat.image_url}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                </div>
                <span
                  className="font-sans font-semibold text-[13px] sm:text-[14px] text-[#2D1B16] mt-1.5 group-hover:text-[#B87545] transition-colors leading-[1.3] text-center max-w-full block px-0.5 tracking-normal"
                  style={{
                    fontFamily: '"Manrope", sans-serif',
                    fontWeight: 600,
                    fontSize: '13px',
                    lineHeight: '1.3',
                    textAlign: 'center'
                  }}
                >
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>

        </div>

      </section>


                        {/* =========================================================
          TWO-PANEL FEATURE: GIFTS FOR HER / GIFTS FOR HIM
          ========================================================= */}
      <section className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 mb-10 sm:mb-14 lg:mb-18">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
          
          {/* Left: Gifts for Her */}
          <div className="group relative rounded-2xl md:rounded-[24px] lg:rounded-[28px] overflow-hidden min-h-[230px] sm:min-h-[260px] md:min-h-[270px] lg:min-h-[300px] xl:min-h-[320px] flex flex-col justify-between p-6 sm:p-7 md:p-8 lg:p-10 shadow-sm border border-[#F0E4D8]/70 bg-[#FCEBE4]">
            
            {/* Background Image */}
            <img
              src="/hers_gift_banner.png"
              alt="Gifts for Her Collection"
              className="absolute inset-0 w-full h-full object-cover object-right group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            
            {/* Soft readable gradient overlay on the left */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#FCEBE4]/95 via-[#FCEBE4]/75 to-transparent w-[75%] sm:w-[65%] md:w-[70%] lg:w-[60%] pointer-events-none" />

            {/* Content Area */}
            <div className="relative z-10 max-w-[70%] sm:max-w-[65%] md:max-w-[62%] lg:max-w-[58%] flex flex-col justify-between h-full">
              <div>
                <span className="text-[11px] sm:text-xs font-semibold text-[#5A382B] tracking-wide block mb-1">
                  Thoughtful &amp; Elegant
                </span>
                <h3 className="font-serif font-semibold text-2xl sm:text-3xl lg:text-[34px] text-[#2D1B16] leading-[1.1] tracking-[-0.015em] mb-2">
                  Gifts for Her
                </h3>
                <p className="text-xs sm:text-[13px] text-[#5A382B] leading-relaxed mb-5 sm:mb-6 max-w-[240px] lg:max-w-[270px]">
                  Jewelry, accessories and more for the special women in your life.
                </p>
              </div>

              <div>
                <Button asChild className="bg-[#2D1B16] hover:bg-[#1A0E0A] text-[#FFF9F3] text-xs sm:text-[13px] font-semibold h-9 sm:h-10 px-5 rounded-lg inline-flex items-center gap-1.5 shadow-sm transition-all duration-200 active:scale-95">
                  <Link href="/shop?category=gifts-for-her">
                    Explore Gifts for Her &rarr;
                  </Link>
                </Button>
              </div>
            </div>

          </div>

          {/* Right: Gifts for Him */}
          <div className="group relative rounded-2xl md:rounded-[24px] lg:rounded-[28px] overflow-hidden min-h-[230px] sm:min-h-[260px] md:min-h-[270px] lg:min-h-[300px] xl:min-h-[320px] flex flex-col justify-between p-6 sm:p-7 md:p-8 lg:p-10 shadow-sm border border-[#3A2218]/40 bg-[#1E110B]">
            
            {/* Background Image */}
            <img
              src="/mens_gift_banner.png"
              alt="Gifts for Him Collection"
              className="absolute inset-0 w-full h-full object-cover object-right group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            
            {/* Dark cinematic gradient overlay on the left */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#1A0E08]/95 via-[#1A0E08]/75 to-transparent w-[75%] sm:w-[65%] md:w-[70%] lg:w-[60%] pointer-events-none" />

            {/* Content Area */}
            <div className="relative z-10 max-w-[70%] sm:max-w-[65%] md:max-w-[62%] lg:max-w-[58%] flex flex-col justify-between h-full">
              <div>
                <span className="text-[11px] sm:text-xs font-semibold text-[#E8C7AF] tracking-wide block mb-1">
                  Timeless &amp; Stylish
                </span>
                <h3 className="font-serif font-semibold text-2xl sm:text-3xl lg:text-[34px] text-[#FFF9F3] leading-[1.1] tracking-[-0.015em] mb-2">
                  Gifts for Him
                </h3>
                <p className="text-xs sm:text-[13px] text-[#E8D5C0] leading-relaxed mb-5 sm:mb-6 max-w-[240px] lg:max-w-[260px]">
                  Premium accessories and gift sets for every occasion.
                </p>
              </div>

              <div>
                <Button asChild className="bg-[#FFF9F3] hover:bg-white text-[#2D1B16] text-xs sm:text-[13px] font-semibold h-9 sm:h-10 px-5 rounded-lg inline-flex items-center gap-1.5 shadow-sm transition-all duration-200 active:scale-95">
                  <Link href="/shop?category=gifts-for-him">
                    Explore Gifts for Him &rarr;
                  </Link>
                </Button>
              </div>
            </div>

          </div>

        </div>
      </section>


      
      {/* =========================================================
          1. FEATURED COLLECTION (Spotlight Card + Horizontal Scroller)
          ========================================================= */}
      <section className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 mb-12 sm:mb-16 lg:mb-20">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-[#8C4B23] flex items-center gap-1.5 mb-1">
              &mdash; HANDPICKED FOR EVERY MOMENT
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#2D1B16] tracking-[-0.02em] leading-[1.05]">
              Featured <span className="text-[#C8845C]">Collection</span>
            </h2>
            <p className="text-xs sm:text-[13px] text-[#5A382B] mt-0.5">
              Handpicked masterpieces that embody luxury and timeless beauty
            </p>
          </div>

          <Link
            href="/shop"
            className="text-xs font-semibold text-[#2D1B16] border border-[#2D1B16] lg:border-none lg:bg-[#2D1B16] lg:text-[#FFF9F3] lg:hover:bg-[#1A0E0A] px-3.5 py-1.5 lg:px-4 lg:py-2 rounded-full lg:rounded-lg transition-colors flex items-center gap-1 shrink-0"
          >
            View All Products &rarr;
          </Link>
        </div>

        {/* LOADING SKELETON */}
        {loading ? (
          <div>
            {/* Desktop Skeleton */}
            <div className="hidden lg:flex items-stretch gap-4 xl:gap-5 animate-pulse">
              <div className="w-[38%] shrink-0 rounded-2xl min-h-[360px] bg-[#E8DDD0]/50 p-6 flex flex-col justify-between border border-[#E8C7AF]/30">
                <div className="w-20 h-6 bg-[#D8CBBF]/60 rounded" />
                <div className="space-y-3">
                  <div className="w-3/4 h-8 bg-[#D8CBBF]/60 rounded" />
                  <div className="w-1/3 h-5 bg-[#D8CBBF]/60 rounded" />
                  <div className="w-28 h-9 bg-[#D8CBBF]/60 rounded-lg" />
                </div>
              </div>
              <div className="flex-1 grid grid-cols-4 gap-3.5 xl:gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-xl border border-[#E8C7AF]/40 p-3 flex flex-col justify-between">
                    <div className="aspect-square rounded-lg bg-[#F5EBE1] mb-2.5" />
                    <div className="space-y-2">
                      <div className="w-3/4 h-4 bg-[#F5EBE1] rounded" />
                      <div className="w-1/2 h-4 bg-[#F5EBE1] rounded" />
                    </div>
                    <div className="w-full h-8 bg-[#F5EBE1] rounded-lg mt-3" />
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Skeleton */}
            <div className="block lg:hidden space-y-4 animate-pulse">
              <div className="w-full rounded-2xl min-h-[260px] bg-[#E8DDD0]/50 p-5 flex flex-col justify-between border border-[#E8C7AF]/30">
                <div className="w-16 h-5 bg-[#D8CBBF]/60 rounded" />
                <div className="space-y-2">
                  <div className="w-3/4 h-6 bg-[#D8CBBF]/60 rounded" />
                  <div className="w-1/3 h-4 bg-[#D8CBBF]/60 rounded" />
                </div>
              </div>
              <div className="flex gap-3 overflow-hidden">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-[155px] shrink-0 bg-white rounded-xl border border-[#E8C7AF]/40 p-2.5">
                    <div className="aspect-square rounded-lg bg-[#F5EBE1] mb-2" />
                    <div className="w-3/4 h-3 bg-[#F5EBE1] rounded mb-2" />
                    <div className="w-1/2 h-3 bg-[#F5EBE1] rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : featuredSpotlight ? (
          <>
            {/* DESKTOP LAYOUT (lg and up): 1 Spotlight Card on Left + 4 Cards on Right */}
            <div className="hidden lg:flex items-stretch gap-4 xl:gap-5">
              {/* Spotlight Card */}
              <div className="w-[38%] shrink-0 relative rounded-2xl overflow-hidden min-h-[360px] flex flex-col justify-between p-6 xl:p-7 shadow-sm border border-[#F0E4D8]/70 bg-[#1A0A06] group">
                <img
                  src={getProductImage(featuredSpotlight)}
                  alt={featuredSpotlight.name}
                  className="absolute inset-0 w-full h-full object-cover object-right group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#1A0A06]/95 via-[#260E08]/75 to-transparent w-[78%] pointer-events-none" />

                <div className="relative z-10 flex items-center justify-between">
                  <span className="bg-[#A64B2A] text-white text-[11px] font-semibold px-2.5 py-0.5 rounded shadow-xs">
                    {featuredSpotlight.discount_price ? 'Special Offer' : 'Bestseller'}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleWishlist(featuredSpotlight)}
                    className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-neutral-700 flex items-center justify-center transition-all shadow-xs"
                    aria-label="Wishlist"
                  >
                    <Heart className={`w-4 h-4 ${isInWishlist(featuredSpotlight.id) ? 'fill-[#E53935] text-[#E53935]' : ''}`} />
                  </button>
                </div>

                <div className="relative z-10 max-w-[85%] mt-auto pt-6">
                  <span className="text-white/60 text-xs font-light block mb-1">&mdash;</span>
                  <Link href={`/product/${featuredSpotlight.slug}`}>
                    <h3 className="font-serif text-2xl xl:text-3xl font-bold text-white leading-tight mb-2 hover:text-[#E8C7AF] transition-colors">
                      {featuredSpotlight.name}
                    </h3>
                  </Link>
                  <div className="flex items-baseline gap-2 mb-1.5">
                    <span className="font-bold text-lg text-white">₹{featuredSpotlight.discount_price || featuredSpotlight.price}</span>
                    {featuredSpotlight.discount_price && (
                      <span className="text-xs text-white/60 line-through">₹{featuredSpotlight.price}</span>
                    )}
                  </div>
                  {getProductRating(featuredSpotlight) && (
                    <div className="flex items-center gap-1 text-[#F59E0B] text-xs mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                      ))}
                      <span className="text-white/80 font-medium ml-1">
                        {getProductRating(featuredSpotlight).rating} ({getProductRating(featuredSpotlight).count})
                      </span>
                    </div>
                  )}

                  <Button
                    onClick={() => addToCart(featuredSpotlight)}
                    className="bg-[#F8EEE4] hover:bg-white text-[#2D1B16] text-xs font-semibold h-10 px-5 rounded-lg inline-flex items-center gap-2 shadow-sm transition-all duration-200"
                  >
                    <ShoppingCart className="w-4 h-4" /> Add to Cart
                  </Button>
                </div>
              </div>

              {/* 4 Cards Grid on Right */}
              <div className="flex-1 min-w-0 grid grid-cols-4 gap-3.5 xl:gap-4">
                {featuredCards.map((item) => {
                  const discount = getProductDiscountPercent(item)
                  const ratingData = getProductRating(item)
                  const rating = ratingData?.rating
                  const count = ratingData?.count
                  return (
                    <div key={item.id} className="bg-white rounded-xl border border-[#E8C7AF]/60 p-3 flex flex-col justify-between hover:shadow-md transition-all group">
                      <div>
                        <div className="relative aspect-square rounded-lg overflow-hidden bg-[#FAF2EB] mb-2.5">
                          <img
                            src={getProductImage(item)}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {discount && (
                            <span className="absolute top-2 left-2 z-10 bg-[#E53935] text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-xs">
                              -{discount}%
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => toggleWishlist(item)}
                            className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-neutral-600 flex items-center justify-center transition-all shadow-xs"
                            aria-label="Wishlist"
                          >
                            <Heart className={`w-3.5 h-3.5 ${isInWishlist(item.id) ? 'fill-[#E53935] text-[#E53935]' : ''}`} />
                          </button>
                        </div>
                        <Link href={`/product/${item.slug}`}>
                          <h4 className="font-sans font-semibold text-[14px] sm:text-[15px] leading-[1.4] text-[#2D1B16] line-clamp-1 group-hover:text-[#B87545] transition-colors">
                            {item.name}
                          </h4>
                        </Link>
                        {rating ? (
                          <div className="flex items-center gap-1 mt-1 text-[#F59E0B] flex-nowrap whitespace-nowrap min-h-[18px]">
                            <div className="flex items-center shrink-0">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B] shrink-0" />
                              ))}
                            </div>
                            <span className="text-[11px] font-semibold text-neutral-600 ml-0.5 whitespace-nowrap">{rating} ({count})</span>
                          </div>
                        ) : (
                          <div className="min-h-[18px] mt-1" />
                        )}
                        <div className="flex items-baseline gap-1.5 mt-1">
                          <span className="font-sans font-bold text-[16px] sm:text-[17px] text-[#2D1B16]">₹{item.discount_price || item.price}</span>
                          {item.discount_price && (
                            <span className="font-sans font-normal sm:font-medium text-[12px] sm:text-[13px] text-neutral-400 line-through">₹{item.price}</span>
                          )}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => addToCart(item)}
                        className="w-full mt-3 bg-[#2D1B16] hover:bg-[#1A0E0A] text-white font-sans font-semibold text-[13px] sm:text-[14px] h-8 rounded-lg flex items-center justify-center gap-1.5"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* PHONE & TABLET LAYOUT (< lg) */}
            <div className="block lg:hidden">
              <div className="relative w-full rounded-2xl overflow-hidden min-h-[270px] sm:min-h-[300px] mb-4 p-5 sm:p-6 flex flex-col justify-between shadow-sm border border-[#F0E4D8]/70 bg-[#1A0A06] group">
                <img
                  src={getProductImage(featuredSpotlight)}
                  alt={featuredSpotlight.name}
                  className="absolute inset-0 w-full h-full object-cover object-right"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#1A0A06]/95 via-[#260E08]/75 to-transparent w-[80%] pointer-events-none" />

                <div className="relative z-10 flex items-center justify-between">
                  <span className="bg-[#A64B2A] text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-xs">
                    {featuredSpotlight.discount_price ? 'Special Offer' : 'Bestseller'}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleWishlist(featuredSpotlight)}
                    className="w-7 h-7 rounded-full bg-white/90 text-neutral-700 flex items-center justify-center"
                    aria-label="Wishlist"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isInWishlist(featuredSpotlight.id) ? 'fill-[#E53935] text-[#E53935]' : ''}`} />
                  </button>
                </div>

                <div className="relative z-10 max-w-[85%] mt-auto pt-4">
                  <span className="text-white/60 text-xs font-light block mb-1">&mdash;</span>
                  <Link href={`/product/${featuredSpotlight.slug}`}>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-white leading-tight mb-1.5 hover:text-[#E8C7AF] transition-colors">
                      {featuredSpotlight.name}
                    </h3>
                  </Link>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-bold text-base text-white">₹{featuredSpotlight.discount_price || featuredSpotlight.price}</span>
                    {featuredSpotlight.discount_price && (
                      <span className="text-xs text-white/60 line-through">₹{featuredSpotlight.price}</span>
                    )}
                  </div>
                  {getProductRating(featuredSpotlight) && (
                    <div className="flex items-center gap-1 text-[#F59E0B] text-xs mb-3.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
                      ))}
                      <span className="text-white/80 font-medium text-[11px] ml-1">
                        {getProductRating(featuredSpotlight).rating} ({getProductRating(featuredSpotlight).count})
                      </span>
                    </div>
                  )}

                  <Button
                    size="sm"
                    onClick={() => addToCart(featuredSpotlight)}
                    className="bg-[#2D1B16] hover:bg-black text-white text-xs font-semibold h-8 px-4 rounded-lg inline-flex items-center gap-1.5 border border-white/20"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                  </Button>
                </div>
              </div>

              {/* Horizontal Scroller of Cards */}
              <div className="flex items-stretch gap-3 overflow-x-auto scroll-smooth hide-scrollbar pb-3 pt-1 -mx-3 px-3 sm:-mx-4 sm:px-4">
                {featuredCards.map((item) => {
                  const discount = getProductDiscountPercent(item)
                  return (
                    <div key={item.id} className="w-[155px] sm:w-[175px] shrink-0 bg-white rounded-xl border border-[#E8C7AF]/60 p-2.5 flex flex-col justify-between shadow-2xs">
                      <div>
                        <div className="relative aspect-square rounded-lg overflow-hidden bg-[#FAF2EB] mb-2">
                          <img src={getProductImage(item)} alt={item.name} className="w-full h-full object-cover" />
                          {discount && (
                            <span className="absolute top-1.5 left-1.5 z-10 bg-[#E53935] text-white text-[9px] font-semibold px-1.5 py-0.5 rounded shadow-xs">
                              -{discount}%
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => toggleWishlist(item)}
                            className="absolute top-1.5 right-1.5 z-10 w-6 h-6 rounded-full bg-white/90 text-neutral-600 flex items-center justify-center"
                            aria-label="Wishlist"
                          >
                            <Heart className={`w-3 h-3 ${isInWishlist(item.id) ? 'fill-[#E53935] text-[#E53935]' : ''}`} />
                          </button>
                        </div>
                        <Link href={`/product/${item.slug}`}>
                          <h4 className="font-sans font-semibold text-[13px] sm:text-[14px] leading-[1.4] text-[#2D1B16] line-clamp-1 hover:text-[#C8845C] transition-colors">{item.name}</h4>
                        </Link>
                        {getProductRating(item) ? (
                          <div className="flex items-center gap-0.5 mt-0.5 text-[#F59E0B] flex-nowrap whitespace-nowrap min-h-[16px]">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-2.5 h-2.5 fill-[#F59E0B] text-[#F59E0B]" />
                            ))}
                            <span className="text-[10px] font-semibold text-neutral-600 ml-0.5 whitespace-nowrap">{getProductRating(item).rating} ({getProductRating(item).count})</span>
                          </div>
                        ) : (
                          <div className="min-h-[16px] mt-0.5" />
                        )}
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="font-sans font-bold text-[15px] sm:text-[16px] text-[#2D1B16]">₹{item.discount_price || item.price}</span>
                          {item.discount_price && <span className="font-sans font-normal text-[12px] text-neutral-400 line-through">₹{item.price}</span>}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => addToCart(item)}
                        className="w-full mt-2 bg-[#2D1B16] text-white text-[11px] font-semibold h-7 rounded-lg flex items-center justify-center gap-1"
                      >
                        <ShoppingCart className="w-3 h-3" /> Add to Cart
                      </Button>
                    </div>
                  )
                })}
              </div>

              {/* Pagination Indicators */}
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <div className="w-6 h-1 rounded-full bg-[#B87545]" />
                <div className="w-4 h-1 rounded-full bg-[#E8C7AF]/50" />
                <div className="w-4 h-1 rounded-full bg-[#E8C7AF]/50" />
              </div>
            </div>
          </>
        ) : null}

      </section>


      {/* =========================================================
          2. NEW ARRIVALS (Matches Image 1 Phone & Image 2 Desktop)
          ========================================================= */}
      <section className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 mb-12 sm:mb-16 lg:mb-20">
        {loading ? (
          <div className="bg-[#1E110B] rounded-[28px] sm:rounded-[32px] p-6 lg:p-8 xl:p-10 text-white animate-pulse">
            <div className="flex items-stretch gap-6 xl:gap-8">
              <div className="w-[30%] space-y-4 py-2">
                <div className="w-24 h-4 bg-white/20 rounded" />
                <div className="w-48 h-8 bg-white/20 rounded" />
                <div className="w-full h-12 bg-white/10 rounded" />
              </div>
              <div className="flex-1 grid grid-cols-4 gap-3.5">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white/10 rounded-xl p-3 h-56" />
                ))}
              </div>
            </div>
          </div>
        ) : newArrivalProducts.length > 0 ? (
          <>
            {/* DESKTOP VIEW (lg and up) */}
            <div className="hidden lg:block bg-[#1E110B] rounded-[28px] sm:rounded-[32px] p-6 lg:p-8 xl:p-10 text-white relative overflow-hidden shadow-md">
              <div className="absolute inset-0 bg-gradient-to-r from-[#1A0E08] via-[#24130C]/90 to-[#1A0E08]/80 pointer-events-none" />
              <img
                src="/mens_gift_banner.png"
                alt="New Arrivals Atmosphere"
                className="absolute bottom-0 left-0 w-[45%] h-full object-cover object-left opacity-35 pointer-events-none"
              />

              <div className="relative z-10 flex items-stretch gap-6 xl:gap-8">
                {/* Left Column */}
                <div className="w-[30%] xl:w-[28%] shrink-0 flex flex-col justify-between py-2">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#E8C7AF] flex items-center gap-1.5 mb-2">
                      &mdash; FRESH TRENDS, NEW STORIES
                    </span>
                    <h2 className="font-serif text-3xl xl:text-4xl font-semibold text-white tracking-[-0.02em] leading-[1.05]">
                      New <span className="text-[#D4A57E]">Arrivals</span>
                    </h2>
                    <p className="text-xs sm:text-[13px] text-[#E8D5C0] leading-relaxed mt-2.5 max-w-[250px]">
                      Be the first to explore our latest additions, curated just for you.
                    </p>

                    <Button asChild className="bg-[#F8EEE4] hover:bg-white text-[#2D1B16] text-xs font-semibold h-10 px-5 rounded-full inline-flex items-center gap-1.5 shadow-sm mt-6">
                      <Link href="/shop?filter=new-arrivals">
                        Explore New Arrivals &rarr;
                      </Link>
                    </Button>
                  </div>

                  <div className="mt-8 text-[11px] text-[#E8C7AF]/70 font-serif italic">
                    New Beginnings, Beautiful Gifts
                  </div>
                </div>

                {/* Right Column */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div className="grid grid-cols-4 gap-3.5 xl:gap-4">
                    {newArrivalCards.map((item) => (
                      <div key={item.id} className="bg-white rounded-xl border border-white/10 p-3 flex flex-col justify-between text-[#2D1B16] hover:shadow-lg transition-all group">
                        <div>
                          <div className="relative aspect-square rounded-lg overflow-hidden bg-[#FAF2EB] mb-2.5">
                            <img src={getProductImage(item)} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <span className="absolute top-2 left-2 z-10 bg-[#B87545] text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-xs">
                              New
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleWishlist(item)}
                              className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 hover:bg-white text-neutral-600 flex items-center justify-center transition-all shadow-xs"
                              aria-label="Wishlist"
                            >
                              <Heart className={`w-3.5 h-3.5 ${isInWishlist(item.id) ? 'fill-[#E53935] text-[#E53935]' : ''}`} />
                            </button>
                          </div>
                          <Link href={`/product/${item.slug}`}>
                            <h4 className="font-sans font-semibold text-[14px] sm:text-[15px] leading-[1.4] text-[#2D1B16] line-clamp-1 group-hover:text-[#B87545] transition-colors">
                              {item.name}
                            </h4>
                          </Link>
                          {getProductRating(item) ? (
                            <div className="flex items-center gap-1 mt-1 text-[#F59E0B] flex-nowrap whitespace-nowrap min-h-[18px]">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
                              ))}
                              <span className="text-[11px] font-semibold text-neutral-600 ml-0.5 whitespace-nowrap">{getProductRating(item).rating} ({getProductRating(item).count})</span>
                            </div>
                          ) : (
                            <div className="min-h-[18px] mt-1" />
                          )}
                          <div className="flex items-baseline gap-1.5 mt-1">
                            <span className="font-bold text-sm text-[#2D1B16]">₹{item.discount_price || item.price}</span>
                            {item.discount_price && <span className="text-xs text-neutral-400 line-through">₹{item.price}</span>}
                          </div>
                        </div>

                        <Button
                          size="sm"
                          onClick={() => addToCart(item)}
                          className="w-full mt-3 bg-[#2D1B16] hover:bg-[#1A0E0A] text-white text-xs font-semibold h-8 rounded-lg flex items-center justify-center gap-1.5"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-2 mt-5">
                    <div className="w-6 h-1 rounded-full bg-[#E8C7AF]" />
                    <div className="w-4 h-1 rounded-full bg-white/20" />
                    <div className="w-4 h-1 rounded-full bg-white/20" />
                  </div>
                </div>
              </div>
            </div>

            {/* PHONE & TABLET VIEW (< lg) */}
            <div className="block lg:hidden">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="font-sans text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.16em] text-[#8C4B23] flex items-center gap-1.5 mb-1">
                    &mdash; FRESH TRENDS, NEW STORIES
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-[#2D1B16] leading-tight">
                    New <span className="text-[#C8845C]">Arrivals</span>
                  </h2>
                  <p className="text-xs text-[#5A382B] mt-0.5">
                    Be the first to explore our latest additions, curated just for you.
                  </p>
                </div>

                <Link
                  href="/shop?filter=new-arrivals"
                  className="text-xs font-semibold text-[#2D1B16] border border-[#2D1B16] px-3.5 py-1.5 rounded-full transition-colors flex items-center gap-1 shrink-0"
                >
                  View All Products &rarr;
                </Link>
              </div>

              {newArrivalSpotlight && (
                <div className="relative w-full rounded-2xl overflow-hidden min-h-[250px] sm:min-h-[280px] mb-4 p-5 sm:p-6 flex flex-col justify-between shadow-sm border border-[#F0E4D8]/70 bg-[#FAF4ED] group">
                  <img
                    src={getProductImage(newArrivalSpotlight)}
                    alt={newArrivalSpotlight.name}
                    className="absolute inset-0 w-full h-full object-cover object-right"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FAF4ED]/95 via-[#FAF4ED]/75 to-transparent w-[80%] pointer-events-none" />

                  <div className="relative z-10 flex items-center justify-between">
                    <span className="bg-[#B87545] text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-xs">
                      New
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleWishlist(newArrivalSpotlight)}
                      className="w-7 h-7 rounded-full bg-white/90 text-neutral-700 flex items-center justify-center"
                      aria-label="Wishlist"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isInWishlist(newArrivalSpotlight.id) ? 'fill-[#E53935] text-[#E53935]' : ''}`} />
                    </button>
                  </div>

                  <div className="relative z-10 max-w-[85%] mt-auto pt-4">
                    <span className="text-[#8C4B23] text-xs font-light block mb-1">&mdash;</span>
                    <Link href={`/product/${newArrivalSpotlight.slug}`}>
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2D1B16] leading-tight mb-1 hover:text-[#C8845C] transition-colors">
                        {newArrivalSpotlight.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-[#5A382B] mb-2 line-clamp-1">{newArrivalSpotlight.short_description || newArrivalSpotlight.description || 'Thoughtfully curated luxury gift.'}</p>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-bold text-base text-[#2D1B16]">₹{newArrivalSpotlight.discount_price || newArrivalSpotlight.price}</span>
                      {newArrivalSpotlight.discount_price && (
                        <span className="text-xs text-neutral-400 line-through">₹{newArrivalSpotlight.price}</span>
                      )}
                    </div>
                    {getProductRating(newArrivalSpotlight) && (
                      <div className="flex items-center gap-1 text-[#F59E0B] text-xs mb-3.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
                        ))}
                        <span className="text-neutral-600 font-medium text-[11px] ml-1">
                          {getProductRating(newArrivalSpotlight).rating} ({getProductRating(newArrivalSpotlight).count})
                        </span>
                      </div>
                    )}

                    <Button
                      size="sm"
                      onClick={() => addToCart(newArrivalSpotlight)}
                      className="bg-[#2D1B16] hover:bg-black text-white text-xs font-semibold h-8 px-4 rounded-lg inline-flex items-center gap-1.5"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                    </Button>
                  </div>
                </div>
              )}

              {/* Horizontal Scroller */}
              <div className="flex items-stretch gap-3 overflow-x-auto scroll-smooth hide-scrollbar pb-3 pt-1 -mx-3 px-3 sm:-mx-4 sm:px-4">
                {newArrivalCards.slice(1).map((item) => (
                  <div key={item.id} className="w-[155px] sm:w-[175px] shrink-0 bg-white rounded-xl border border-[#E8C7AF]/60 p-2.5 flex flex-col justify-between shadow-2xs">
                    <div>
                      <div className="relative aspect-square rounded-lg overflow-hidden bg-[#FAF2EB] mb-2">
                        <img src={getProductImage(item)} alt={item.name} className="w-full h-full object-cover" />
                        <span className="absolute top-1.5 left-1.5 z-10 bg-[#B87545] text-white text-[9px] font-semibold px-1.5 py-0.5 rounded shadow-xs">
                          New
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleWishlist(item)}
                          className="absolute top-1.5 right-1.5 z-10 w-6 h-6 rounded-full bg-white/90 text-neutral-600 flex items-center justify-center"
                          aria-label="Wishlist"
                        >
                          <Heart className={`w-3 h-3 ${isInWishlist(item.id) ? 'fill-[#E53935] text-[#E53935]' : ''}`} />
                        </button>
                      </div>
                      <Link href={`/product/${item.slug}`}>
                        <h4 className="font-sans font-medium text-xs text-[#2D1B16] line-clamp-1">{item.name}</h4>
                      </Link>
                      {getProductRating(item) ? (
                        <div className="flex items-center gap-0.5 mt-0.5 text-[#F59E0B] flex-nowrap whitespace-nowrap min-h-[16px]">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-2.5 h-2.5 fill-[#F59E0B] text-[#F59E0B]" />
                          ))}
                          <span className="text-[10px] font-semibold text-neutral-600 ml-0.5 whitespace-nowrap">{getProductRating(item).rating} ({getProductRating(item).count})</span>
                        </div>
                      ) : (
                        <div className="min-h-[16px] mt-0.5" />
                      )}
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="font-bold text-xs sm:text-sm text-[#2D1B16]">₹{item.discount_price || item.price}</span>
                        {item.discount_price && <span className="text-[10px] text-neutral-400 line-through">₹{item.price}</span>}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => addToCart(item)}
                      className="w-full mt-2 bg-[#2D1B16] text-white text-[11px] font-semibold h-7 rounded-lg flex items-center justify-center gap-1"
                    >
                      <ShoppingCart className="w-3 h-3" /> Add to Cart
                    </Button>
                  </div>
                ))}
              </div>

              {/* Pagination Indicators */}
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <div className="w-6 h-1 rounded-full bg-[#B87545]" />
                <div className="w-4 h-1 rounded-full bg-[#E8C7AF]/50" />
                <div className="w-4 h-1 rounded-full bg-[#E8C7AF]/50" />
              </div>
            </div>
          </>
        ) : null}

            </section>

            {/* =========================================================
          OCCASIONS SECTION (Connected to Header via id="occasions")
          Black Tint + White/Light Text for Crystal Clear Legibility
          ========================================================= */}
      <section id="occasions" className="scroll-mt-24 w-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 mb-10 sm:mb-14 lg:mb-18">
        
        {/* Single Main Banner with /Occasions_bg.png with Black Tint & Light Text */}
        <div className="relative rounded-[18px] sm:rounded-[24px] lg:rounded-[28px] overflow-hidden border border-[#4A2E20]/60 shadow-md min-h-[230px] sm:min-h-[280px] md:min-h-[340px] lg:min-h-[390px] xl:min-h-[420px] flex items-center bg-[#1E100A]">
          
          {/* Main Background Image */}
          <img
            src="/Occasions_bg.png"
            alt="Gifts for Every Special Moment"
            className="absolute inset-0 w-full h-full object-cover object-right sm:object-center"
          />

          {/* Black Tint / Dark Gradient Overlay for Maximum Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent w-[85%] sm:w-[70%] md:w-[58%] lg:w-[50%] pointer-events-none" />

          {/* Left Half: Clean text area with Light / White text */}
          <div className="relative z-10 w-[72%] sm:w-[58%] md:w-[52%] lg:w-[48%] flex flex-col justify-center items-start p-4 sm:p-6 md:p-8 lg:p-12 xl:p-14">
            
            {/* Eyebrow in warm champagne gold */}
            <span className="text-[9.5px] sm:text-[11px] md:text-xs lg:text-sm font-bold uppercase tracking-[0.18em] sm:tracking-[0.2em] text-[#E8C7AF] mb-1 sm:mb-1.5 md:mb-2.5 font-sans flex items-center gap-1">
              &mdash; SHOP BY OCCASION
            </span>
            
            {/* Headline in pure White with warm gold accent */}
            <h2 className="font-serif text-[18px] sm:text-[24px] md:text-[34px] lg:text-[46px] xl:text-[54px] font-semibold text-white tracking-[-0.02em] leading-[1.05] mb-1 sm:mb-2 md:mb-3">
              Gifts for Every <br />
              <span className="text-[#F3C5A5] font-bold">Special Moment</span>
            </h2>

            {/* Subtitle in soft luminous cream */}
            <p className="text-[10.5px] sm:text-xs md:text-sm lg:text-base text-[#E8D5C0] font-medium leading-snug sm:leading-relaxed mb-3 sm:mb-4 md:mb-6 font-sans max-w-[210px] sm:max-w-xs md:max-w-md lg:max-w-lg line-clamp-2 sm:line-clamp-none">
              Thoughtful gifts for every celebration, milestone and memorable occasion.
            </p>

            {/* CTA Button */}
            <Button asChild className="bg-[#FAF2EA] hover:bg-white text-[#2A160F] text-[10px] sm:text-xs md:text-sm lg:text-[14px] font-bold h-7 sm:h-8 md:h-10 lg:h-11 px-3.5 sm:px-4 md:px-6 lg:px-7 rounded-full inline-flex items-center gap-1.5 shadow-md transition-all active:scale-95">
              <Link href="/shop?category=occasions">
                Explore Collection &rarr;
              </Link>
            </Button>
          </div>

          {/* Right Half: Diwali gift box with bow & Happy Diwali tag, lanterns & diyas in the image */}
        </div>

        {/* Product Cards Row with Horizontal Scroll for Desktop & Phone */}
        <div className="relative mt-4 sm:mt-5 md:mt-6">
          {loading ? (
            <div className="flex items-stretch gap-2.5 sm:gap-3.5 lg:gap-4 overflow-hidden pb-3 pt-1 animate-pulse">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-[155px] sm:w-[185px] md:w-[210px] lg:w-[calc(20%-13px)] shrink-0 bg-white rounded-2xl border border-[#F0E5DC] p-2.5 sm:p-3.5">
                  <div className="aspect-square rounded-xl bg-[#FAF5EE] mb-2" />
                  <div className="w-3/4 h-3 bg-[#FAF5EE] rounded mb-2" />
                  <div className="w-1/2 h-3 bg-[#FAF5EE] rounded" />
                </div>
              ))}
            </div>
          ) : occasionProducts.length > 0 ? (
            <div
              id="occasions-scroll-container"
              className="flex items-stretch gap-2.5 sm:gap-3.5 lg:gap-4 overflow-x-auto scroll-smooth hide-scrollbar pb-3 pt-1 -mx-3 px-3 sm:-mx-4 sm:px-4 md:mx-0 md:px-0"
            >
              {occasionProducts.map((item) => {
                const imgUrl = getProductImage(item)
                const ratingData = getProductRating(item)
                const ratingValue = ratingData?.rating
                const reviewsCount = ratingData?.count
                const displayPrice = item.discount_price || item.price

                return (
                  <div
                    key={item.id}
                    className="w-[155px] sm:w-[185px] md:w-[210px] lg:w-[calc(20%-13px)] shrink-0 bg-white rounded-2xl border border-[#F0E5DC] p-2.5 sm:p-3.5 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all duration-300 group"
                  >
                    <div>
                      {/* Product Image + Wishlist Button */}
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-[#FAF5EE] mb-2 sm:mb-2.5">
                        <Link href={`/product/${item.slug}`}>
                          <img
                            src={imgUrl}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        </Link>

                        <button
                          type="button"
                          onClick={() => toggleWishlist(item)}
                          className="absolute top-2 right-2 z-10 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/95 hover:bg-white text-neutral-600 flex items-center justify-center transition-all shadow-xs active:scale-90"
                          aria-label="Wishlist"
                        >
                          <Heart
                            className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                              isInWishlist(item.id) ? 'fill-[#E53935] text-[#E53935]' : ''
                            }`}
                          />
                        </button>
                      </div>

                      {/* Product Name */}
                      <Link href={`/product/${item.slug}`}>
                        <h4 className="font-sans font-semibold text-[14px] sm:text-[15px] leading-[1.4] text-[#231711] line-clamp-1 group-hover:text-[#B07A54] transition-colors">
                          {item.name}
                        </h4>
                      </Link>

                      {/* Price Row + Cart Button */}
                      <div className="flex items-center justify-between mt-1.5 sm:mt-2 pt-0.5">
                        <div>
                          <span className="font-sans font-bold text-[15px] sm:text-[16px] text-[#231711]">
                            ₹{displayPrice?.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => addToCart(item)}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#FAF0E6] hover:bg-[#F3E2D3] text-[#5A382B] flex items-center justify-center transition-colors active:scale-95 shadow-2xs cursor-pointer"
                          aria-label="Add to cart"
                          title="Add to Cart"
                        >
                          <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[1.8]" />
                        </button>
                      </div>

                      {/* Rating Row */}
                      {ratingValue ? (
                        <div className="flex items-center gap-1 mt-1 text-[#F59E0B] flex-nowrap whitespace-nowrap min-h-[18px]">
                          <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-[#F59E0B] text-[#F59E0B]" />
                          <span className="text-[10px] sm:text-[11px] font-semibold text-neutral-600 ml-0.5">
                            {ratingValue} <span className="font-normal text-neutral-400">({reviewsCount})</span>
                          </span>
                        </div>
                      ) : (
                        <div className="min-h-[18px] mt-1" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 bg-white/60 rounded-2xl border border-[#F0E5DC]">
              <p className="text-sm text-[#5A382B]">New occasion gifts arriving soon.</p>
              <Button asChild size="sm" className="mt-3 bg-[#2D1B16] text-[#FFF9F3]">
                <Link href="/shop">Browse All Gifts</Link>
              </Button>
            </div>
          )}
        </div>

      </section>
{/* Customer Reviews */}
      <CustomerReviews />

      <Footer />
    </div>
  )
}
