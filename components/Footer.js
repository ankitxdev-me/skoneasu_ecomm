'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import {
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Mail,
  ChevronDown,
  Truck,
  ShieldCheck,
  Gift,
  Headphones
} from 'lucide-react'

// Custom Pinterest SVG
function PinterestIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
    </svg>
  )
}

export default function Footer() {
  // Mobile accordion states (Developer open by default as in reference image)
  const [openSection, setOpenSection] = useState('developer')

  // Dynamic social media channels configured from Admin Dashboard
  const [socialLinks, setSocialLinks] = useState({
    instagram: 'https://www.instagram.com/the.skoneasu?igsh=YjBqcHRmdzJscnp0',
    facebook: 'https://facebook.com',
    twitter: 'https://twitter.com',
    pinterest: 'https://pinterest.com',
    youtube: 'https://youtube.com'
  })

  useEffect(() => {
    supabase
      .from('store_settings')
      .select('value')
      .eq('key', 'social_links')
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) {
          try {
            const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value
            if (parsed && typeof parsed === 'object') {
              setSocialLinks(prev => ({ ...prev, ...parsed }))
            }
          } catch (e) {
            console.error('Error parsing social_links:', e)
          }
        }
      })
      .catch(() => {})
  }, [])

  const toggleSection = (section) => {
    setOpenSection((prev) => (prev === section ? null : section))
  }

  return (
    <footer className="bg-[#1A0D07] text-[#D5C0B3] border-t border-[#352015] select-none">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ============================================================ */}
        {/* DESKTOP TOP SECTION (Grid with 5 columns & vertical dividers) */}
        {/* ============================================================ */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-8 py-14">
          
          {/* Column 1: Brand Info (col-span-4 with right vertical line) */}
          <div className="lg:col-span-4 pr-6 lg:border-r lg:border-[#331E14]">
            <Link href="/" className="inline-flex items-center gap-3 mb-4 group">
              <img
                src="/logo.png"
                alt="SKONEASU"
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-contain shadow-md border border-[#D4A373]/50 group-hover:scale-105 transition-transform duration-300"
              />
              <div className="flex flex-col text-left">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-[0.08em] text-white leading-none">
                  SKONEASU
                </span>
                <span className="text-[8.5px] sm:text-[9px] tracking-[0.22em] font-sans font-bold text-[#D4A373] uppercase mt-1">
                  GIFTED WITH LOVE
                </span>
              </div>
            </Link>

            <p className="text-[#CDB5A6] text-xs sm:text-[13px] leading-relaxed max-w-sm mb-6 font-sans">
              Perfect Gifts For Him, Her &amp; Everyone. From The Heart. Thoughtfully curated to celebrate your most precious relationships.
            </p>

            {/* Social Icons (5 circular dark buttons) */}
            <div className="flex items-center gap-2.5">
              <a
                href={socialLinks.instagram || "https://www.instagram.com/the.skoneasu"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-[#2C1910] border border-[#44281B] flex items-center justify-center text-[#D5C0B3] hover:text-white hover:border-[#D4A373] transition-all hover:scale-105"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={socialLinks.facebook || "https://facebook.com"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-[#2C1910] border border-[#44281B] flex items-center justify-center text-[#D5C0B3] hover:text-white hover:border-[#D4A373] transition-all hover:scale-105"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={socialLinks.twitter || "https://twitter.com"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter / X"
                className="w-8 h-8 rounded-full bg-[#2C1910] border border-[#44281B] flex items-center justify-center text-[#D5C0B3] hover:text-white hover:border-[#D4A373] transition-all hover:scale-105"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href={socialLinks.pinterest || "https://pinterest.com"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pinterest"
                className="w-8 h-8 rounded-full bg-[#2C1910] border border-[#44281B] flex items-center justify-center text-[#D5C0B3] hover:text-white hover:border-[#D4A373] transition-all hover:scale-105"
              >
                <PinterestIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href={socialLinks.youtube || "https://youtube.com"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-8 h-8 rounded-full bg-[#2C1910] border border-[#44281B] flex items-center justify-center text-[#D5C0B3] hover:text-white hover:border-[#D4A373] transition-all hover:scale-105"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: SHOP (col-span-2) */}
          <div className="lg:col-span-2 pl-2">
            <h4 className="font-sans font-semibold text-[12px] sm:text-[13px] tracking-wider uppercase text-white mb-4">
              SHOP
            </h4>
            <ul className="space-y-3 font-sans text-[13px] text-[#CDB5A6]">
              <li>
                <Link href="/shop?category=gifts-for-her" className="font-sans font-normal hover:text-white transition-colors">
                  Gifts for Her
                </Link>
              </li>
              <li>
                <Link href="/shop?category=gifts-for-him" className="font-sans font-normal hover:text-white transition-colors">
                  Gifts for Him
                </Link>
              </li>
              <li>
                <Link href="/shop?category=gift-combos" className="font-sans font-normal hover:text-white transition-colors">
                  Gift Combos
                </Link>
              </li>
              <li>
                <Link href="/shop?category=jewelry" className="font-sans font-normal hover:text-white transition-colors">
                  Fine Jewelry
                </Link>
              </li>
              <li>
                <Link href="/shop" className="font-sans font-normal hover:text-white transition-colors">
                  All Collections
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: HELP (col-span-2) */}
          <div className="lg:col-span-2">
            <h4 className="font-sans font-semibold text-[12px] sm:text-[13px] tracking-wider uppercase text-white mb-4">
              HELP
            </h4>
            <ul className="space-y-3 font-sans text-[13px] text-[#CDB5A6]">
              <li>
                <Link href="/support" className="font-sans font-normal hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="font-sans font-normal hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="font-sans font-normal hover:text-white transition-colors">
                  Shipping &amp; Delivery
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="font-sans font-normal hover:text-white transition-colors">
                  Returns &amp; Exchanges
                </Link>
              </li>
              <li>
                <Link href="/orders" className="font-sans font-normal hover:text-white transition-colors">
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: ABOUT (col-span-2) */}
          <div className="lg:col-span-2">
            <h4 className="font-sans font-semibold text-[12px] sm:text-[13px] tracking-wider uppercase text-white mb-4">
              ABOUT
            </h4>
            <ul className="space-y-3 font-sans text-[13px] text-[#CDB5A6]">
              <li>
                <Link href="/about" className="font-sans font-normal hover:text-white transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/about" className="font-sans font-normal hover:text-white transition-colors">
                  About SKONEASU
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="font-sans font-normal hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="font-sans font-normal hover:text-white transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: DEVELOPER (col-span-2 with left vertical divider) */}
          <div className="lg:col-span-2 pl-6 lg:border-l lg:border-[#331E14]">
            <h4 className="font-serif font-bold text-sm tracking-wider uppercase text-white mb-3">
              DEVELOPER
            </h4>
            <div className="text-[12px] leading-relaxed text-[#CDB5A6] mb-4 font-sans">
              <p>Built &amp; Designed by</p>
              <p className="font-semibold text-white text-[13px] mt-0.5">Ankit Gupta</p>
              <p className="mt-2 text-[#B59E91] text-[11.5px]">
                Freelance Developer &amp; Problem Solver.
              </p>
            </div>

            <a
              href="mailto:ankitgupta72724@gmail.com?subject=Inquiry%20from%20SKONEASU%20Website"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#D4A373]/60 text-white text-xs font-medium hover:bg-[#D4A373]/15 transition-all active:scale-95 group"
            >
              <Mail className="w-3.5 h-3.5 text-[#D4A373] group-hover:scale-110 transition-transform" />
              <span>Contact Developer</span>
            </a>
          </div>

        </div>

        {/* ============================================================ */}
        {/* PHONE ACCORDION SECTION (Visible on mobile/tablet screens)   */}
        {/* ============================================================ */}
        <div className="block lg:hidden py-10">
          
          {/* Brand & Socials Header */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-3 mb-3.5 group">
              <img
                src="/logo.png"
                alt="SKONEASU"
                className="w-10 h-10 rounded-full object-contain shadow-md border border-[#D4A373]/50 group-hover:scale-105 transition-transform duration-300"
              />
              <div className="flex flex-col text-left">
                <span className="font-serif text-xl font-bold tracking-[0.08em] text-white leading-none">
                  SKONEASU
                </span>
                <span className="text-[8px] tracking-[0.22em] font-sans font-bold text-[#D4A373] uppercase mt-0.5">
                  GIFTED WITH LOVE
                </span>
              </div>
            </Link>

            <p className="text-[#CDB5A6] text-xs leading-relaxed max-w-sm mb-5 font-sans">
              Perfect Gifts For Him, Her &amp; Everyone. From The Heart. Thoughtfully curated to celebrate your most precious relationships.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2.5">
              <a
                href={socialLinks.instagram || "https://www.instagram.com/the.skoneasu"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-[#2C1910] border border-[#44281B] flex items-center justify-center text-[#D5C0B3]"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={socialLinks.facebook || "https://facebook.com"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-[#2C1910] border border-[#44281B] flex items-center justify-center text-[#D5C0B3]"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href={socialLinks.twitter || "https://twitter.com"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter / X"
                className="w-8 h-8 rounded-full bg-[#2C1910] border border-[#44281B] flex items-center justify-center text-[#D5C0B3]"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href={socialLinks.pinterest || "https://pinterest.com"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pinterest"
                className="w-8 h-8 rounded-full bg-[#2C1910] border border-[#44281B] flex items-center justify-center text-[#D5C0B3]"
              >
                <PinterestIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href={socialLinks.youtube || "https://youtube.com"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-8 h-8 rounded-full bg-[#2C1910] border border-[#44281B] flex items-center justify-center text-[#D5C0B3]"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Accordion 1: SHOP */}
          <div className="border-t border-[#331E14]">
            <button
              onClick={() => toggleSection('shop')}
              className="w-full py-4 flex items-center justify-between text-left group"
            >
              <span className="font-serif font-bold text-sm tracking-wider uppercase text-white">
                SHOP
              </span>
              <ChevronDown
                className={`w-4 h-4 text-[#CDB5A6] transition-transform duration-200 ${
                  openSection === 'shop' ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openSection === 'shop' && (
              <ul className="pb-4 space-y-2.5 text-xs text-[#CDB5A6] pl-1">
                <li>
                  <Link href="/shop?category=gifts-for-her" className="hover:text-white">
                    Gifts for Her
                  </Link>
                </li>
                <li>
                  <Link href="/shop?category=gifts-for-him" className="hover:text-white">
                    Gifts for Him
                  </Link>
                </li>
                <li>
                  <Link href="/shop?category=gift-combos" className="hover:text-white">
                    Gift Combos
                  </Link>
                </li>
                <li>
                  <Link href="/shop?category=jewelry" className="hover:text-white">
                    Fine Jewelry
                  </Link>
                </li>
                <li>
                  <Link href="/shop" className="hover:text-white">
                    All Collections
                  </Link>
                </li>
              </ul>
            )}
          </div>

          {/* Accordion 2: HELP */}
          <div className="border-t border-[#331E14]">
            <button
              onClick={() => toggleSection('help')}
              className="w-full py-4 flex items-center justify-between text-left group"
            >
              <span className="font-serif font-bold text-sm tracking-wider uppercase text-white">
                HELP
              </span>
              <ChevronDown
                className={`w-4 h-4 text-[#CDB5A6] transition-transform duration-200 ${
                  openSection === 'help' ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openSection === 'help' && (
              <ul className="pb-4 space-y-2.5 text-xs text-[#CDB5A6] pl-1">
                <li>
                  <Link href="/support" className="hover:text-white">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-white">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="hover:text-white">
                    Shipping &amp; Delivery
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="hover:text-white">
                    Returns &amp; Exchanges
                  </Link>
                </li>
                <li>
                  <Link href="/orders" className="hover:text-white">
                    Track Order
                  </Link>
                </li>
              </ul>
            )}
          </div>

          {/* Accordion 3: ABOUT */}
          <div className="border-t border-[#331E14]">
            <button
              onClick={() => toggleSection('about')}
              className="w-full py-4 flex items-center justify-between text-left group"
            >
              <span className="font-serif font-bold text-sm tracking-wider uppercase text-white">
                ABOUT
              </span>
              <ChevronDown
                className={`w-4 h-4 text-[#CDB5A6] transition-transform duration-200 ${
                  openSection === 'about' ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openSection === 'about' && (
              <ul className="pb-4 space-y-2.5 text-xs text-[#CDB5A6] pl-1">
                <li>
                  <Link href="/about" className="hover:text-white">
                    Our Story
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white">
                    About SKONEASU
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white">
                    Terms &amp; Conditions
                  </Link>
                </li>
              </ul>
            )}
          </div>

          {/* Accordion 4: DEVELOPER (Open as shown in reference phone mockup) */}
          <div className="border-t border-[#331E14]">
            <button
              onClick={() => toggleSection('developer')}
              className="w-full py-4 flex items-center justify-between text-left group"
            >
              <span className="font-serif font-bold text-sm tracking-wider uppercase text-white">
                DEVELOPER
              </span>
              <ChevronDown
                className={`w-4 h-4 text-[#CDB5A6] transition-transform duration-200 ${
                  openSection === 'developer' ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openSection === 'developer' && (
              <div className="pb-5 pt-1 pl-1">
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-11 h-11 rounded-full bg-[#824E2E] text-white flex items-center justify-center font-serif text-lg font-bold shrink-0 shadow-sm">
                    A
                  </div>
                  <div>
                    <h5 className="font-semibold text-white text-sm">Ankit Gupta</h5>
                    <p className="text-xs text-[#CDB5A6] mt-0.5">
                      Freelance Developer &amp; Problem Solver.
                    </p>
                  </div>
                </div>

                <a
                  href="mailto:ankitgupta72724@gmail.com?subject=Inquiry%20from%20SKONEASU%20Website"
                  className="w-full py-2.5 px-4 rounded-full border border-[#D4A373]/60 bg-[#24130A] flex items-center justify-center gap-2 text-white text-xs font-medium hover:bg-[#D4A373]/15 transition-all active:scale-98"
                >
                  <Mail className="w-3.5 h-3.5 text-[#D4A373]" />
                  <span>Contact Developer</span>
                </a>
              </div>
            )}
          </div>

        </div>

        {/* ============================================================ */}
        {/* TRUST BADGES SECTION                                         */}
        {/* Desktop: 4 items in a row with vertical dividers             */}
        {/* Mobile: 2x2 grid with center star divider                    */}
        {/* ============================================================ */}
        <div className="border-t border-[#331E14] py-8 sm:py-10">
          
          {/* Desktop 4-in-a-row */}
          <div className="hidden md:grid md:grid-cols-4 items-center">
            
            {/* 1. Free Shipping */}
            <div className="flex items-center gap-3.5 justify-start md:pr-4">
              <Truck className="w-7 h-7 text-[#D4A373] stroke-[1.6] shrink-0" />
              <div>
                <h5 className="text-white text-xs sm:text-[13px] font-semibold tracking-wide">
                  Free Shipping
                </h5>
                <p className="text-[#A68F81] text-[11px] mt-0.5">On All Orders</p>
              </div>
            </div>

            {/* 2. Secure Payment */}
            <div className="flex items-center gap-3.5 justify-start md:px-4 md:border-l md:border-[#331E14]">
              <ShieldCheck className="w-7 h-7 text-[#D4A373] stroke-[1.6] shrink-0" />
              <div>
                <h5 className="text-white text-xs sm:text-[13px] font-semibold tracking-wide">
                  Secure Payment
                </h5>
                <p className="text-[#A68F81] text-[11px] mt-0.5">100% Safe &amp; Secure</p>
              </div>
            </div>

            {/* 3. Premium Packaging */}
            <div className="flex items-center gap-3.5 justify-start md:px-4 md:border-l md:border-[#331E14]">
              <Gift className="w-7 h-7 text-[#D4A373] stroke-[1.6] shrink-0" />
              <div>
                <h5 className="text-white text-xs sm:text-[13px] font-semibold tracking-wide">
                  Premium Packaging
                </h5>
                <p className="text-[#A68F81] text-[11px] mt-0.5">Make Every Gift Special</p>
              </div>
            </div>

            {/* 4. Dedicated Support */}
            <div className="flex items-center gap-3.5 justify-start md:pl-4 md:border-l md:border-[#331E14]">
              <Headphones className="w-7 h-7 text-[#D4A373] stroke-[1.6] shrink-0" />
              <div>
                <h5 className="text-white text-xs sm:text-[13px] font-semibold tracking-wide">
                  Dedicated Support
                </h5>
                <p className="text-[#A68F81] text-[11px] mt-0.5">We're Here to Help</p>
              </div>
            </div>

          </div>

          {/* Mobile 2x2 Grid with Center ✦ intersection ornament */}
          <div className="grid md:hidden grid-cols-2 relative">
            
            {/* Center Star ✦ */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[#D4A373] text-[9px] pointer-events-none select-none z-10 bg-[#1A0D07] px-1">
              ✦
            </div>

            {/* Top-Left: Free Shipping */}
            <div className="p-3.5 pr-4 border-r border-b border-[#331E14] flex items-center gap-3">
              <Truck className="w-6 h-6 text-[#D4A373] stroke-[1.6] shrink-0" />
              <div>
                <h5 className="text-white text-[12px] font-semibold leading-tight">
                  Free Shipping
                </h5>
                <p className="text-[#A68F81] text-[10.5px] mt-0.5 leading-tight">
                  On All Orders
                </p>
              </div>
            </div>

            {/* Top-Right: Secure Payment */}
            <div className="p-3.5 pl-4 border-b border-[#331E14] flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-[#D4A373] stroke-[1.6] shrink-0" />
              <div>
                <h5 className="text-white text-[12px] font-semibold leading-tight">
                  Secure Payment
                </h5>
                <p className="text-[#A68F81] text-[10.5px] mt-0.5 leading-tight">
                  100% Safe &amp; Secure
                </p>
              </div>
            </div>

            {/* Bottom-Left: Premium Packaging */}
            <div className="p-3.5 pr-4 border-r border-[#331E14] flex items-center gap-3">
              <Gift className="w-6 h-6 text-[#D4A373] stroke-[1.6] shrink-0" />
              <div>
                <h5 className="text-white text-[12px] font-semibold leading-tight">
                  Premium Packaging
                </h5>
                <p className="text-[#A68F81] text-[10.5px] mt-0.5 leading-tight">
                  Make Every Gift Special
                </p>
              </div>
            </div>

            {/* Bottom-Right: Dedicated Support */}
            <div className="p-3.5 pl-4 flex items-center gap-3">
              <Headphones className="w-6 h-6 text-[#D4A373] stroke-[1.6] shrink-0" />
              <div>
                <h5 className="text-white text-[12px] font-semibold leading-tight">
                  Dedicated Support
                </h5>
                <p className="text-[#A68F81] text-[10.5px] mt-0.5 leading-tight">
                  We're Here to Help
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* ============================================================ */}
        {/* BOTTOM BAR                                                   */}
        {/* Desktop & Mobile: Real Payment SVGs visible on all screens   */}
        {/* ============================================================ */}
        <div className="border-t border-[#331E14] py-6 sm:py-7">
          
          {/* Desktop Layout (lg and up) */}
          <div className="hidden lg:flex items-center justify-between gap-6">
            
            {/* Left: Copyright */}
            <p className="text-[12px] text-[#A68F81] whitespace-nowrap">
              &copy; 2026 SKONEASU. All rights reserved.
            </p>

            {/* Center: Payment Gateway Chips (Authentic SVGs matching screenshot) */}
            <div className="flex items-center gap-2">
              {/* Visa */}
              <div className="h-7 px-3 rounded-md bg-white flex items-center justify-center shadow-xs border border-white/20 hover:scale-105 transition-transform" title="Visa">
                <svg viewBox="0 0 36 12" className="h-3 w-auto" fill="none">
                  <path d="M14.3 0.3L9.3 11.7H6.1L3.7 2.5C3.6 2 3.4 1.6 3 1.3C2.3 0.8 1.1 0.3 0 0.1L0.1 0.3H5.2C5.9 0.3 6.5 0.8 6.6 1.5L7.8 8.1L11.1 0.3H14.3ZM26.9 7.9C26.9 4.9 22.8 4.7 22.8 3.4C22.8 3 23.2 2.6 24.1 2.5C24.5 2.4 25.7 2.4 27 3L27.5 0.7C26.8 0.4 25.8 0.2 24.6 0.2C21.6 0.2 19.5 1.8 19.5 4.1C19.5 5.8 21 6.8 22.2 7.4C23.4 8 23.8 8.4 23.8 8.9C23.8 9.7 22.8 10.1 21.9 10.1C20.4 10.1 19.5 9.7 18.8 9.3L18.3 11.7C19.1 12 20.3 12.3 21.6 12.3C24.8 12.3 26.9 10.7 26.9 7.9ZM34.9 11.7H37.7L35.2 0.3H32.7C32.1 0.3 31.5 0.7 31.3 1.2L26.7 11.7H30L30.7 9.8H34.7L34.9 11.7ZM31.6 7.5L33.3 2.9L34.3 7.5H31.6ZM18.9 0.3L16.4 11.7H13.4L15.9 0.3H18.9Z" fill="#1A1F71"/>
                </svg>
              </div>

              {/* Mastercard */}
              <div className="h-7 px-3 rounded-md bg-white flex items-center justify-center shadow-xs border border-white/20 hover:scale-105 transition-transform" title="Mastercard">
                <svg viewBox="0 0 32 20" className="h-4 w-auto" fill="none">
                  <circle cx="10.5" cy="10" r="7" fill="#EB001B"/>
                  <circle cx="21.5" cy="10" r="7" fill="#F79E1B"/>
                  <path d="M16 4.75C17.5 6.15 18.45 8 18.45 10C18.45 12 17.5 13.85 16 15.25C14.5 13.85 13.55 12 13.55 10C13.55 8 14.5 6.15 16 4.75Z" fill="#FF5F00"/>
                </svg>
              </div>

              {/* UPI */}
              <div className="h-7 px-3 rounded-md bg-white flex items-center justify-center shadow-xs border border-white/20 hover:scale-105 transition-transform" title="Unified Payments Interface (UPI)">
                <svg viewBox="0 0 44 18" className="h-3.5 w-auto" fill="none">
                  <path d="M7.8 3H10.5V9.8C10.5 12 8.9 13.5 6.7 13.5C4.4 13.5 2.8 12 2.8 9.8V3H5.5V9.7C5.5 10.7 6.1 11.3 6.7 11.3C7.3 11.3 7.8 10.7 7.8 9.7V3Z" fill="#2C2C2C"/>
                  <path d="M13.2 3H17.2C19.2 3 20.6 4.2 20.6 6.1C20.6 8 19.2 9.2 17.2 9.2H15.9V13.3H13.2V3ZM15.9 7.1H17.1C17.7 7.1 18.2 6.7 18.2 6.1C18.2 5.5 17.7 5.1 17.1 5.1H15.9V7.1Z" fill="#2C2C2C"/>
                  <path d="M22.6 3H25.3V13.3H22.6V3Z" fill="#2C2C2C"/>
                  <path d="M37 3L32 13.3H36.6L41.6 3H37Z" fill="#097939"/>
                  <path d="M33.8 3L28.8 13.3H33.4L38.4 3H33.8Z" fill="#ED7524"/>
                </svg>
              </div>

              {/* RuPay */}
              <div className="h-7 px-3 rounded-md bg-white flex items-center justify-center shadow-xs border border-white/20 hover:scale-105 transition-transform" title="RuPay">
                <svg viewBox="0 0 52 14" className="h-3 w-auto" fill="none">
                  <text x="0" y="11" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontWeight="800" fontSize="12" fill="#092042" letterSpacing="-0.3">RuPay</text>
                  <path d="M41 1.5L37.5 12.5H41.5L45 1.5H41Z" fill="#F47920"/>
                  <path d="M44.5 1.5L41 12.5H45L48.5 1.5H44.5Z" fill="#0B8140"/>
                </svg>
              </div>

              {/* Google Pay */}
              <div className="h-7 px-3 rounded-md bg-white flex items-center justify-center shadow-xs border border-white/20 hover:scale-105 transition-transform" title="Google Pay">
                <svg viewBox="0 0 40 16" className="h-3.5 w-auto" fill="none">
                  <path d="M7.8 7.3H4.2V9.1H6.3C6.1 9.9 5.3 10.6 4.2 10.6C3 10.6 2 9.6 2 8.3C2 7.1 3 6.1 4.2 6.1C4.8 6.1 5.3 6.3 5.7 6.7L7 5.4C6.2 4.7 5.3 4.3 4.2 4.3C2 4.3 0.2 6.1 0.2 8.3C0.2 10.6 2 12.4 4.2 12.4C6.5 12.4 8 10.8 8 8.5C8 8.1 8 7.7 7.8 7.3Z" fill="#4285F4"/>
                  <text x="11" y="11.5" fontFamily="Roboto, sans-serif" fontWeight="500" fontSize="11" fill="#5F6368">Pay</text>
                </svg>
              </div>

              {/* Paytm */}
              <div className="h-7 px-3 rounded-md bg-white flex items-center justify-center shadow-xs border border-white/20 hover:scale-105 transition-transform" title="Paytm">
                <svg viewBox="0 0 42 14" className="h-3 w-auto" fill="none">
                  <text x="0" y="11" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontWeight="800" fontSize="11" fill="#002970">pay</text>
                  <text x="21" y="11" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontWeight="800" fontSize="11" fill="#00BAF2">tm</text>
                </svg>
              </div>
            </div>

            {/* Right: Policy Links */}
            <div className="flex items-center gap-3 text-[12px] text-[#A68F81] whitespace-nowrap">
              <Link href="/privacy" className="font-sans font-normal hover:text-white transition-colors">
                Privacy
              </Link>
              <span className="text-[#452C20]">|</span>
              <Link href="/terms" className="font-sans font-normal hover:text-white transition-colors">
                Terms
              </Link>
              <span className="text-[#452C20]">|</span>
              <Link href="/shipping" className="font-sans font-normal hover:text-white transition-colors">
                Shipping Policy
              </Link>
            </div>

          </div>

          {/* Mobile Layout (visible on phone screens) */}
          <div className="flex lg:hidden flex-col items-center justify-center gap-4 text-center">
            
            {/* Payment Gateway Chips on Mobile */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center">
              {/* Visa */}
              <div className="h-6 sm:h-7 px-2.5 sm:px-3 rounded-md bg-white flex items-center justify-center shadow-xs border border-white/20" title="Visa">
                <svg viewBox="0 0 36 12" className="h-2.5 sm:h-3 w-auto" fill="none">
                  <path d="M14.3 0.3L9.3 11.7H6.1L3.7 2.5C3.6 2 3.4 1.6 3 1.3C2.3 0.8 1.1 0.3 0 0.1L0.1 0.3H5.2C5.9 0.3 6.5 0.8 6.6 1.5L7.8 8.1L11.1 0.3H14.3ZM26.9 7.9C26.9 4.9 22.8 4.7 22.8 3.4C22.8 3 23.2 2.6 24.1 2.5C24.5 2.4 25.7 2.4 27 3L27.5 0.7C26.8 0.4 25.8 0.2 24.6 0.2C21.6 0.2 19.5 1.8 19.5 4.1C19.5 5.8 21 6.8 22.2 7.4C23.4 8 23.8 8.4 23.8 8.9C23.8 9.7 22.8 10.1 21.9 10.1C20.4 10.1 19.5 9.7 18.8 9.3L18.3 11.7C19.1 12 20.3 12.3 21.6 12.3C24.8 12.3 26.9 10.7 26.9 7.9ZM34.9 11.7H37.7L35.2 0.3H32.7C32.1 0.3 31.5 0.7 31.3 1.2L26.7 11.7H30L30.7 9.8H34.7L34.9 11.7ZM31.6 7.5L33.3 2.9L34.3 7.5H31.6ZM18.9 0.3L16.4 11.7H13.4L15.9 0.3H18.9Z" fill="#1A1F71"/>
                </svg>
              </div>

              {/* Mastercard */}
              <div className="h-6 sm:h-7 px-2.5 sm:px-3 rounded-md bg-white flex items-center justify-center shadow-xs border border-white/20" title="Mastercard">
                <svg viewBox="0 0 32 20" className="h-3.5 sm:h-4 w-auto" fill="none">
                  <circle cx="10.5" cy="10" r="7" fill="#EB001B"/>
                  <circle cx="21.5" cy="10" r="7" fill="#F79E1B"/>
                  <path d="M16 4.75C17.5 6.15 18.45 8 18.45 10C18.45 12 17.5 13.85 16 15.25C14.5 13.85 13.55 12 13.55 10C13.55 8 14.5 6.15 16 4.75Z" fill="#FF5F00"/>
                </svg>
              </div>

              {/* UPI */}
              <div className="h-6 sm:h-7 px-2.5 sm:px-3 rounded-md bg-white flex items-center justify-center shadow-xs border border-white/20" title="Unified Payments Interface (UPI)">
                <svg viewBox="0 0 44 18" className="h-3 sm:h-3.5 w-auto" fill="none">
                  <path d="M7.8 3H10.5V9.8C10.5 12 8.9 13.5 6.7 13.5C4.4 13.5 2.8 12 2.8 9.8V3H5.5V9.7C5.5 10.7 6.1 11.3 6.7 11.3C7.3 11.3 7.8 10.7 7.8 9.7V3Z" fill="#2C2C2C"/>
                  <path d="M13.2 3H17.2C19.2 3 20.6 4.2 20.6 6.1C20.6 8 19.2 9.2 17.2 9.2H15.9V13.3H13.2V3ZM15.9 7.1H17.1C17.7 7.1 18.2 6.7 18.2 6.1C18.2 5.5 17.7 5.1 17.1 5.1H15.9V7.1Z" fill="#2C2C2C"/>
                  <path d="M22.6 3H25.3V13.3H22.6V3Z" fill="#2C2C2C"/>
                  <path d="M37 3L32 13.3H36.6L41.6 3H37Z" fill="#097939"/>
                  <path d="M33.8 3L28.8 13.3H33.4L38.4 3H33.8Z" fill="#ED7524"/>
                </svg>
              </div>

              {/* RuPay */}
              <div className="h-6 sm:h-7 px-2.5 sm:px-3 rounded-md bg-white flex items-center justify-center shadow-xs border border-white/20" title="RuPay">
                <svg viewBox="0 0 52 14" className="h-2.5 sm:h-3 w-auto" fill="none">
                  <text x="0" y="11" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontWeight="800" fontSize="12" fill="#092042" letterSpacing="-0.3">RuPay</text>
                  <path d="M41 1.5L37.5 12.5H41.5L45 1.5H41Z" fill="#F47920"/>
                  <path d="M44.5 1.5L41 12.5H45L48.5 1.5H44.5Z" fill="#0B8140"/>
                </svg>
              </div>

              {/* Google Pay */}
              <div className="h-6 sm:h-7 px-2.5 sm:px-3 rounded-md bg-white flex items-center justify-center shadow-xs border border-white/20" title="Google Pay">
                <svg viewBox="0 0 40 16" className="h-3 sm:h-3.5 w-auto" fill="none">
                  <path d="M7.8 7.3H4.2V9.1H6.3C6.1 9.9 5.3 10.6 4.2 10.6C3 10.6 2 9.6 2 8.3C2 7.1 3 6.1 4.2 6.1C4.8 6.1 5.3 6.3 5.7 6.7L7 5.4C6.2 4.7 5.3 4.3 4.2 4.3C2 4.3 0.2 6.1 0.2 8.3C0.2 10.6 2 12.4 4.2 12.4C6.5 12.4 8 10.8 8 8.5C8 8.1 8 7.7 7.8 7.3Z" fill="#4285F4"/>
                  <text x="11" y="11.5" fontFamily="Roboto, sans-serif" fontWeight="500" fontSize="11" fill="#5F6368">Pay</text>
                </svg>
              </div>

              {/* Paytm */}
              <div className="h-6 sm:h-7 px-2.5 sm:px-3 rounded-md bg-white flex items-center justify-center shadow-xs border border-white/20" title="Paytm">
                <svg viewBox="0 0 42 14" className="h-2.5 sm:h-3 w-auto" fill="none">
                  <text x="0" y="11" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontWeight="800" fontSize="11" fill="#002970">pay</text>
                  <text x="21" y="11" fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" fontWeight="800" fontSize="11" fill="#00BAF2">tm</text>
                </svg>
              </div>
            </div>

            <p className="text-[11.5px] text-[#A68F81]">
              &copy; 2026 SKONEASU. All rights reserved.
            </p>

            <div className="flex items-center justify-center gap-3 text-[11.5px] text-[#A68F81]">
              <Link href="/privacy" className="font-sans font-normal hover:text-white transition-colors">
                Privacy
              </Link>
              <span className="text-[#452C20]">|</span>
              <Link href="/terms" className="font-sans font-normal hover:text-white transition-colors">
                Terms
              </Link>
              <span className="text-[#452C20]">|</span>
              <Link href="/shipping" className="font-sans font-normal hover:text-white transition-colors">
                Shipping Policy
              </Link>
            </div>

          </div>

        </div>

      </div>
    </footer>
  )
}
