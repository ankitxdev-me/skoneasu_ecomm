'use client'

import Link from 'next/link'
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function Footer() {
  return (
    <footer className="bg-muted/30 border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.jpg" alt="Skoneasu" className="h-10 w-auto" />
              <h3 className="text-2xl font-serif font-bold text-primary">SKONEASU</h3>
            </div>
            <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
              Perfect Gifts for Him, Her & Everyone. From the Heart.
            </p>
            <div className="flex gap-3">
              <Link href="https://www.instagram.com/the.skoneasu?igsh=YjBqcHRmdzJscnp0" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="icon" className="rounded-full border-primary/20 hover:bg-primary/10 hover:text-primary">
                  <Facebook className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="https://www.instagram.com/the.skoneasu?igsh=YjBqcHRmdzJscnp0" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="icon" className="rounded-full border-primary/20 hover:bg-primary/10 hover:text-primary">
                  <Instagram className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="https://www.instagram.com/the.skoneasu?igsh=YjBqcHRmdzJscnp0" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="icon" className="rounded-full border-primary/20 hover:bg-primary/10 hover:text-primary">
                  <Twitter className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-primary mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shop" className="text-muted-foreground hover:text-secondary transition-colors">
                  Shop All
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-secondary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-secondary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-muted-foreground hover:text-secondary transition-colors">
                  Shipping & Returns
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold text-primary mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-secondary transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="text-muted-foreground hover:text-secondary transition-colors">
                  Size Guide
                </Link>
              </li>
              <li>
                <Link href="/care-guide" className="text-muted-foreground hover:text-secondary transition-colors">
                  Jewelry Care
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-secondary transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h4 className="font-semibold text-primary mb-4">Get in Touch</h4>
            <ul className="space-y-3 text-sm text-muted-foreground mb-6">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-secondary" />
                <span>support@skoneasu.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-secondary" />
                <span>157/A, C-6, Block A, Najafgarh, New Delhi - 110043, India</span>
              </li>
            </ul>
            <h4 className="font-semibold text-primary mb-2 text-sm">Newsletter</h4>
            <div className="flex gap-2">
              <Input placeholder="Your email" className="text-sm border-primary/20 bg-background" />
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-secondary">Subscribe</Button>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2025 SKONEASU. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-secondary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-secondary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer >
  )
}
