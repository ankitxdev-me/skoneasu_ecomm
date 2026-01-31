'use client'

import Link from 'next/link'
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function Footer() {
  return (
    <footer className="bg-neutral-50 border-t border-neutral-200 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-2xl font-serif font-bold mb-4">LUXE JEWELS</h3>
            <p className="text-neutral-600 mb-4 text-sm leading-relaxed">
              Crafting timeless elegance with exquisite diamonds and precious gemstones. Each piece tells a unique story of luxury and sophistication.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" size="icon" className="rounded-full">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full">
                <Twitter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-neutral-900 mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shop" className="text-neutral-600 hover:text-amber-600 transition-colors">
                  Shop All
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-neutral-600 hover:text-amber-600 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-neutral-600 hover:text-amber-600 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-neutral-600 hover:text-amber-600 transition-colors">
                  Shipping & Returns
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold text-neutral-900 mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/faq" className="text-neutral-600 hover:text-amber-600 transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="text-neutral-600 hover:text-amber-600 transition-colors">
                  Size Guide
                </Link>
              </li>
              <li>
                <Link href="/care-guide" className="text-neutral-600 hover:text-amber-600 transition-colors">
                  Jewelry Care
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-neutral-600 hover:text-amber-600 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h4 className="font-semibold text-neutral-900 mb-4">Get in Touch</h4>
            <ul className="space-y-3 text-sm text-neutral-600 mb-6">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>1800-123-4567</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>hello@luxejewels.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Mumbai, India</span>
              </li>
            </ul>
            <h4 className="font-semibold text-neutral-900 mb-2 text-sm">Newsletter</h4>
            <div className="flex gap-2">
              <Input placeholder="Your email" className="text-sm" />
              <Button size="sm">Subscribe</Button>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-neutral-600">
          <p>© 2025 LUXE JEWELS. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-amber-600 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-amber-600 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
