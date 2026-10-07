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
  ChevronRight,
  X,
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


// Branded Social & Developer SVG Icons
function WhatsAppIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.41a8.17 8.17 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24zm4.51 11.64c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.25-1.49-1.4-1.74-.14-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.47c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.72 4.31 3.81.6.26 1.07.42 1.44.54.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.59.21-1.09.15-1.19-.06-.1-.23-.17-.48-.29z"/>
    </svg>
  )
}

function LinkedInIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
    </svg>
  )
}

function GitHubIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  )
}

function InstagramGradientIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  )
}


const DEVELOPER_CHANNELS = [
  {
    id: 'email',
    title: 'Email',
    subtitle: 'Send me an email',
    href: 'mailto:ankitgupta72724@gmail.com?subject=Inquiry%20from%20SKONEASU%20Website',
    iconBg: 'bg-[#96522E]',
    icon: <Mail className="w-4 h-4 text-white" />
  },
  {
    id: 'whatsapp',
    title: 'WhatsApp',
    subtitle: 'Chat with me directly',
    href: 'https://wa.me/919336106110?text=Hi%20Ankit%2C%20I%20saw%20your%20work%20on%20SKONEASU',
    iconBg: 'bg-[#25D366]',
    icon: <WhatsAppIcon className="w-4 h-4 text-white" />
  },
  {
    id: 'linkedin',
    title: 'LinkedIn',
    subtitle: 'Connect professionally',
    href: 'https://www.linkedin.com/in/ankitxdev-me',
    iconBg: 'bg-[#0A66C2]',
    icon: <LinkedInIcon className="w-4 h-4 text-white" />
  },
  {
    id: 'github',
    title: 'GitHub',
    subtitle: 'View my projects',
    href: 'https://github.com/ankitxdev-me',
    iconBg: 'bg-[#202020]',
    icon: <GitHubIcon className="w-4 h-4 text-white" />
  },
  {
    id: 'instagram',
    title: 'Instagram',
    subtitle: '@ankitxtech.me',
    href: 'https://instagram.com/ankitxtech.me',
    iconBg: 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]',
    icon: <InstagramGradientIcon className="w-4 h-4 text-white" />
  }
]

export default function Footer() {
  // Mobile accordion states (Developer open by default as in reference image)
  const [openSection, setOpenSection] = useState('developer')
  // Developer Contact Modal / Popover States
  const [desktopContactOpen, setDesktopContactOpen] = useState(false)
  const [mobileContactOpen, setMobileContactOpen] = useState(false)

  // Prevent background scrolling when mobile contact drawer is open
  useEffect(() => {
    if (mobileContactOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileContactOpen])


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
          <div className="lg:col-span-2 pl-6 lg:border-l lg:border-[#331E14] relative">
            <h4 className="font-serif font-bold text-sm tracking-wider uppercase text-white mb-4">
              DEVELOPER
            </h4>
            
            {/* Developer Profile Card (Exact match to desktop mockup) */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#824E2E] text-white flex items-center justify-center font-serif text-base font-bold shrink-0 shadow-sm border border-[#A66840]/60">
                A
              </div>
              <div>
                <h5 className="font-semibold text-white text-[13.5px] leading-tight">Ankit Gupta</h5>
                <p className="text-[11.5px] text-[#B59E91] leading-tight mt-0.5">
                  Freelance Developer &amp; Problem Solver.
                </p>
              </div>
            </div>

            {/* Contact Developer Button (Desktop Trigger) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDesktopContactOpen(!desktopContactOpen)}
                className="inline-flex items-center justify-between gap-2.5 px-4 py-2 rounded-full border border-[#D4A373]/60 bg-[#24130A]/60 hover:bg-[#D4A373]/15 text-[#FFF9F3] text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-95 group"
              >
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#D4A373] group-hover:scale-110 transition-transform" />
                  <span>Contact Developer</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-[#D4A373] transition-transform duration-200 ${desktopContactOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Desktop Popover Menu (Dark themed as in mockup) */}
              {desktopContactOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDesktopContactOpen(false)}
                  />
                  <div className="absolute left-0 bottom-full mb-3 w-[285px] bg-[#1C0F08] border border-[#3E2416] rounded-2xl p-3.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-[#331C11]">
                      <span className="font-serif font-bold text-sm text-[#FFF9F3]">
                        Contact Developer
                      </span>
                      <button
                        onClick={() => setDesktopContactOpen(false)}
                        className="text-[#968275] hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      {DEVELOPER_CHANNELS.map((ch) => (
                        <a
                          key={ch.id}
                          href={ch.href}
                          target={ch.id !== 'email' ? '_blank' : undefined}
                          rel={ch.id !== 'email' ? 'noopener noreferrer' : undefined}
                          className="flex items-center justify-between p-2 rounded-xl hover:bg-[#2A160D] transition-colors group text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-8 h-8 rounded-full ${ch.iconBg} flex items-center justify-center shrink-0 shadow-xs`}>
                              {ch.icon}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[12.5px] font-semibold text-[#FFF9F3] group-hover:text-white leading-tight">
                                {ch.title}
                              </p>
                              <p className="text-[10.5px] text-[#A68F81] group-hover:text-[#CDB5A6] leading-tight truncate">
                                {ch.subtitle}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-[#73533D] group-hover:text-[#D4A373] group-hover:translate-x-0.5 transition-all shrink-0 ml-1.5" />
                        </a>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
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
                  <div className="w-11 h-11 rounded-full bg-[#824E2E] text-white flex items-center justify-center font-serif text-lg font-bold shrink-0 shadow-sm border border-[#A66840]/60">
                    A
                  </div>
                  <div>
                    <h5 className="font-semibold text-white text-sm">Ankit Gupta</h5>
                    <p className="text-xs text-[#CDB5A6] mt-0.5">
                      Freelance Developer &amp; Problem Solver.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMobileContactOpen(true)}
                  className="w-full py-2.5 px-4 rounded-full border border-[#D4A373]/60 bg-[#24130A] flex items-center justify-center gap-2 text-white text-xs font-semibold hover:bg-[#D4A373]/15 transition-all active:scale-98 shadow-xs cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5 text-[#D4A373]" />
                  <span>Contact Developer</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#D4A373]" />
                </button>
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

      {/* ============================================================ */}
      {/* MOBILE DEVELOPER BOTTOM SHEET (Exact Match to Mockup)        */}
      {/* ============================================================ */}
      {mobileContactOpen && (
        <div className="fixed inset-0 z-[120] block lg:hidden">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/65 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-300"
            onClick={() => setMobileContactOpen(false)}
          />

          {/* Bottom Sheet Drawer */}
          <div className="fixed inset-x-0 bottom-0 z-[121] w-full max-w-lg mx-auto bg-[#F8EFE6] rounded-t-[32px] sm:rounded-t-[36px] p-5 pt-3 pb-7 shadow-2xl animate-in slide-in-from-bottom duration-300 border-t border-[#E8D7C7] max-h-[90vh] overflow-y-auto">
            {/* Grab Handle Bar */}
            <div className="w-12 h-1.5 bg-[#C9B2A2] rounded-full mx-auto mb-3.5" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-1 px-1">
              <h3 className="font-serif font-bold text-[22px] text-[#24130A] tracking-tight">
                Contact Developer
              </h3>
              <button
                type="button"
                onClick={() => setMobileContactOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#705648] hover:text-[#24130A] hover:bg-black/5 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5 stroke-[2]" />
              </button>
            </div>

            {/* Channels List */}
            <div className="space-y-2.5">
              {DEVELOPER_CHANNELS.map((ch) => (
                <a
                  key={ch.id}
                  href={ch.href}
                  target={ch.id !== 'email' ? '_blank' : undefined}
                  rel={ch.id !== 'email' ? 'noopener noreferrer' : undefined}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FFF9F3] hover:bg-white border border-[#EADBCE] shadow-2xs transition-all active:scale-[0.99] group text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-10 h-10 rounded-full ${ch.iconBg} flex items-center justify-center shrink-0 shadow-xs`}>
                      {ch.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[14px] sm:text-[15px] font-semibold text-[#24130A] leading-tight font-sans">
                        {ch.title}
                      </p>
                      <p className="text-[11.5px] sm:text-[12px] text-[#806B5E] leading-tight truncate mt-0.5 font-sans">
                        {ch.subtitle}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#A89284] group-hover:text-[#24130A] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </a>
              ))}
            </div>

            {/* iOS Home Indicator Bar */}
            <div className="w-32 h-1 bg-[#C9B2A2] rounded-full mx-auto mt-6" />
          </div>
        </div>
      )}
    </footer>
  )
}
