'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { reviewAPI } from '@/lib/api'
import { Star, ChevronLeft, ChevronRight, Check } from 'lucide-react'

// Curated order and labels directly aligned with database products
const targetOrder = [
  'Neha Gupta',
  'Kunal Singh',
  'Simran Kaur',
  'Arjun Malhotra',
  'Ananya Sharma',
  'Rohan Mehta'
]

const friendlyProductNames = {
  'zirconia-heart-silver-necklace': 'Pearl Necklace',
  'zirconia-silver-necklace': 'Pearl Necklace',
  'classic-mens-watch': "Men's Watch",
  'classic-black-dial-watch': "Men's Watch",
  'elegant-ring-set': 'Ring Set',
  'gold-plated-stacking-rings-set': 'Ring Set',
  'mens-gift-combo': 'Gift Combo',
  'black-bead-bracelet': 'Black Bead Bracelet',
  'natural-stone-beaded-bracelet': 'Natural Stone Beaded Bracelet'
}

export default function CustomerReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [desktopIndex, setDesktopIndex] = useState(0)
  const [mobileIndex, setMobileIndex] = useState(0)

  // Touch swipe refs
  const touchStartX = useRef(null)
  const touchEndX = useRef(null)

  useEffect(() => {
    loadPinnedReviews()
  }, [])

  const loadPinnedReviews = async () => {
    try {
      const data = await reviewAPI.getPinned()
      if (Array.isArray(data) && data.length > 0) {
        // Sort reviews to match the exact presentation order from the design
        const sorted = [...data].sort((a, b) => {
          const nameA = a.user?.full_name || ''
          const nameB = b.user?.full_name || ''
          const idxA = targetOrder.indexOf(nameA)
          const idxB = targetOrder.indexOf(nameB)
          if (idxA !== -1 && idxB !== -1) return idxA - idxB
          if (idxA !== -1) return -1
          if (idxB !== -1) return 1
          return 0
        })
        setReviews(sorted)
      }
    } catch (error) {
      console.error('Error loading reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const items = reviews.length > 0 ? reviews : []
  const total = items.length

  // Desktop shows 4 cards at a time
  const maxDesktopIndex = Math.max(0, total - 4)

  const handlePrevDesktop = useCallback(() => {
    setDesktopIndex((prev) => (prev > 0 ? prev - 1 : maxDesktopIndex))
  }, [maxDesktopIndex])

  const handleNextDesktop = useCallback(() => {
    setDesktopIndex((prev) => (prev < maxDesktopIndex ? prev + 1 : 0))
  }, [maxDesktopIndex])

  const handlePrevMobile = useCallback(() => {
    setMobileIndex((prev) => (prev > 0 ? prev - 1 : total - 1))
  }, [total])

  const handleNextMobile = useCallback(() => {
    setMobileIndex((prev) => (prev < total - 1 ? prev + 1 : 0))
  }, [total])

  // Touch handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX
  }

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    const distance = touchStartX.current - touchEndX.current
    if (distance > 45) {
      handleNextMobile()
    } else if (distance < -45) {
      handlePrevMobile()
    }
    touchStartX.current = null
    touchEndX.current = null
  }

  const getProductImg = (item) => {
    const slug = item.product?.slug
    if (slug === 'zirconia-silver-necklace' && item.user?.full_name === 'Ananya Sharma') {
      return 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80'
    }
    if (item.product?.images?.[0]?.image_url) return item.product.images[0].image_url
    if (item.product?.product_images?.[0]?.image_url) return item.product.product_images[0].image_url
    return 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&q=80'
  }

  const getPurchasedLabel = (item) => {
    const name = item.user?.full_name
    if (name === 'Neha Gupta') return 'Purchased Pearl Necklace'
    if (name === 'Kunal Singh') return "Purchased Men's Watch"
    if (name === 'Simran Kaur') return 'Purchased Ring Set'
    if (name === 'Arjun Malhotra') return 'Purchased Gift Combo'
    if (name === 'Ananya Sharma') return 'Purchased Zirconia Silver Pendant Set'
    
    const slug = item.product?.slug
    const friendly = friendlyProductNames[slug] || item.product?.name || 'Luxury Gift'
    return `Purchased ${friendly}`
  }

  if (loading) {
    return (
      <section className="py-20 bg-[#FAF5EE] border-t border-[#EDE1D3]/70">
        <div className="max-w-[1360px] mx-auto px-4 text-center">
          <div className="w-8 h-8 border-2 border-[#C8845C] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-serif italic text-[#7D6456]">Loading reviews...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 sm:py-20 bg-[#FAF5EE] border-t border-[#EDE1D3]/70 overflow-hidden select-none">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ============================================================ */}
        {/* Section Header                                               */}
        {/* ============================================================ */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          {/* Eyebrow */}
          <div className="inline-flex items-center justify-center gap-2 mb-2 sm:mb-2.5">
            <span className="hidden sm:inline-block w-6 h-[1px] bg-[#B07A54]/60" />
            <span className="font-sans text-[11px] sm:text-[12px] uppercase tracking-[0.16em] font-semibold text-[#B07A54]">
              Loved By 1000+ Gifting Enthusiasts
            </span>
            <span className="hidden sm:inline-block w-6 h-[1px] bg-[#B07A54]/60" />
          </div>

          {/* Main Title */}
          <h2 className="font-serif font-semibold text-2xl sm:text-3xl md:text-[36px] lg:text-[42px] text-[#1E110B] tracking-[-0.015em] leading-[1.1] mt-1 mb-2.5">
            What Our <span className="text-[#C8845C]">Customers</span> Say
          </h2>

          {/* Subtitle */}
          <p className="font-sans font-normal text-[14px] sm:text-[15px] text-[#7D6456] leading-[1.55] max-w-lg mx-auto">
            Real stories and heartfelt moments from customers who found their perfect gifts with us.
          </p>

          {/* Star Divider Ornament */}
          <div className="flex items-center justify-center gap-3 mt-3 sm:mt-4">
            <span className="h-[1px] w-8 sm:w-12 bg-gradient-to-r from-transparent to-[#D8C2AF]" />
            <span className="text-[#C8845C] text-[11px] sm:text-xs">✦</span>
            <span className="h-[1px] w-8 sm:w-12 bg-gradient-to-l from-transparent to-[#D8C2AF]" />
          </div>
        </div>

        {/* ============================================================ */}
        {/* DESKTOP VIEW (Visible on md and up: 4 cards with side arrows) */}
        {/* ============================================================ */}
        <div className="hidden md:block relative">
          <div className="flex items-center gap-3 lg:gap-4">
            
            {/* Left Circular Arrow Button */}
            <button
              onClick={handlePrevDesktop}
              aria-label="Previous reviews"
              className="w-10 h-10 rounded-full bg-white border border-[#E8DACD] text-[#3E2923] flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:bg-[#FAF5EE] hover:border-[#C8845C] transition-all shrink-0 active:scale-95"
            >
              <ChevronLeft className="w-5 h-5 text-[#4A3228]" />
            </button>

            {/* Cards Carousel Window */}
            <div className="flex-1 overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-out gap-4 lg:gap-5"
                style={{
                  transform: `translateX(-${desktopIndex * (100 / 4 + 1.25)}%)`
                }}
              >
                {items.map((review) => {
                  const initial = review.user?.full_name?.trim()?.charAt(0)?.toUpperCase() || 'C'
                  const imgUrl = getProductImg(review)
                  const purchasedLabel = getPurchasedLabel(review)

                  return (
                    <div
                      key={review.id}
                      className="w-[calc(25%-15px)] shrink-0 bg-white rounded-2xl p-5 lg:p-6 border border-[#F0E5DC] shadow-[0_4px_20px_rgba(40,20,10,0.03)] hover:shadow-[0_8px_28px_rgba(40,20,10,0.07)] transition-all duration-300 flex flex-col justify-between"
                    >
                      {/* Top: 5 Stars + Elegant Curly Quote */}
                      <div className="flex items-center justify-between mb-3.5">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < review.rating
                                  ? 'fill-[#E5A83B] text-[#E5A83B]'
                                  : 'text-[#E5D7CB]'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-serif text-2xl lg:text-3xl text-[#E0CEBF] font-light leading-none select-none">
                          ”
                        </span>
                      </div>

                      {/* Middle: Quote text on left, Product Thumbnail on right */}
                      <div className="flex items-start justify-between gap-3 mb-5 min-h-[76px]">
                        <p className="font-serif italic font-medium text-[16px] sm:text-[18px] lg:text-[19px] text-[#2C1D16] leading-[1.5] line-clamp-4 flex-1">
                          “{review.comment}”
                        </p>
                        
                        <div className="w-[58px] h-[58px] lg:w-[64px] lg:h-[64px] rounded-xl overflow-hidden shrink-0 border border-[#F0E5DC] shadow-sm bg-[#FAF5EE]">
                          <img
                            src={imgUrl}
                            alt={review.product?.name || 'Purchased item'}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      </div>

                      {/* Bottom: Dark initial avatar, User Name with Verified Badge, Purchased product */}
                      <div className="flex items-center gap-2.5 pt-1 mt-auto">
                        <div className="w-8 h-8 rounded-full bg-[#1E110B] text-white flex items-center justify-center font-semibold text-[11px] shrink-0 tracking-wider">
                          {initial}
                        </div>
                        
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <span className="font-sans font-semibold text-[13px] sm:text-[14px] text-[#1E110B] truncate leading-tight">
                              {review.user?.full_name}
                            </span>
                            <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#10B981] text-white shrink-0 ml-0.5" title="Verified Buyer">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                          </div>
                          <p className="text-[10.5px] text-[#8B776D] truncate leading-tight mt-0.5">
                            {purchasedLabel}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right Circular Arrow Button (Caramel filled as in design) */}
            <button
              onClick={handleNextDesktop}
              aria-label="Next reviews"
              className="w-10 h-10 rounded-full bg-[#965F38] text-white flex items-center justify-center shadow-[0_4px_12px_rgba(150,95,56,0.25)] hover:bg-[#834F2B] transition-all shrink-0 active:scale-95"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Desktop Pagination Dots */}
          <div className="flex items-center justify-center gap-1.5 mt-8">
            {Array.from({ length: maxDesktopIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setDesktopIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 ${
                  desktopIndex === idx
                    ? 'w-6 h-2 rounded-full bg-[#965F38]'
                    : 'w-2 h-2 rounded-full bg-[#E5D7CB] hover:bg-[#C8845C]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* ============================================================ */}
        {/* PHONE VIEW (Visible on small screens: 1 card, bottom nav)    */}
        {/* ============================================================ */}
        <div className="block md:hidden">
          <div
            className="touch-pan-y"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* The Active Review Card */}
            {items[mobileIndex] && (() => {
              const review = items[mobileIndex]
              const initial = review.user?.full_name?.trim()?.charAt(0)?.toUpperCase() || 'C'
              const imgUrl = getProductImg(review)
              const purchasedLabel = getPurchasedLabel(review)

              return (
                <div
                  key={review.id}
                  className="bg-white rounded-2xl p-6 border border-[#F0E5DC] shadow-[0_6px_24px_rgba(40,20,10,0.04)] transition-all duration-300 flex flex-col justify-between max-w-sm mx-auto min-h-[220px]"
                >
                  {/* Top: 5 Stars + Elegant Curly Quote */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? 'fill-[#E5A83B] text-[#E5A83B]'
                              : 'text-[#E5D7CB]'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-serif text-3xl text-[#E0CEBF] font-light leading-none select-none">
                      ”
                    </span>
                  </div>

                  {/* Middle: Quote text on left, Product Thumbnail on right */}
                  <div className="flex items-start justify-between gap-3 mb-6">
                    <p className="font-serif italic text-sm text-[#2C1D16] leading-[1.65] flex-1">
                      “{review.comment}”
                    </p>
                    
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-[#F0E5DC] shadow-sm bg-[#FAF5EE]">
                      <img
                        src={imgUrl}
                        alt={review.product?.name || 'Purchased item'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Bottom: Dark initial avatar, User Name with Verified Badge, Purchased product */}
                  <div className="flex items-center gap-3 pt-1 mt-auto">
                    <div className="w-9 h-9 rounded-full bg-[#1E110B] text-white flex items-center justify-center font-semibold text-xs shrink-0 tracking-wider">
                      {initial}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-sans font-semibold text-[13px] sm:text-[14px] text-[#1E110B] truncate leading-tight">
                          {review.user?.full_name}
                        </span>
                        <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#10B981] text-white shrink-0" title="Verified Buyer">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      </div>
                      <p className="text-[11px] text-[#8B776D] truncate leading-tight mt-0.5">
                        {purchasedLabel}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Phone Bottom Controls: Left Arrow, Centered Dots (— • •), Right Arrow */}
          <div className="flex items-center justify-between max-w-sm mx-auto px-4 mt-6">
            {/* Prev Button */}
            <button
              onClick={handlePrevMobile}
              aria-label="Previous review"
              className="w-9 h-9 rounded-full bg-white border border-[#E8DACD] text-[#3E2923] flex items-center justify-center shadow-sm hover:bg-[#FAF5EE] active:scale-95 transition-all"
            >
              <ChevronLeft className="w-4 h-4 text-[#4A3228]" />
            </button>

            {/* Dots */}
            <div className="flex items-center gap-1.5">
              {items.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setMobileIndex(idx)}
                  aria-label={`Go to review ${idx + 1}`}
                  className={`transition-all duration-300 ${
                    mobileIndex === idx
                      ? 'w-5 h-2 rounded-full bg-[#965F38]'
                      : 'w-2 h-2 rounded-full bg-[#E5D7CB]'
                  }`}
                />
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={handleNextMobile}
              aria-label="Next review"
              className="w-9 h-9 rounded-full bg-white border border-[#E8DACD] text-[#3E2923] flex items-center justify-center shadow-sm hover:bg-[#FAF5EE] active:scale-95 transition-all"
            >
              <ChevronRight className="w-4 h-4 text-[#4A3228]" />
            </button>
          </div>
        </div>

      </div>
    </section>
  )
}
