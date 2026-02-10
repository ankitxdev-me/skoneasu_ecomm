'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Star, Shield, Truck, RefreshCw, Heart, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { productAPI, categoryAPI } from '@/lib/api'
import { useCart } from '@/contexts/CartContext'
import { toast } from 'sonner'
import ProductCard from '@/components/ProductCard'

import { supabase } from '@/lib/supabase' // Add import

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [heroImage, setHeroImage] = useState('https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&h=1080&fit=crop')
  const { addToCart } = useCart()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [productsData, categoriesData, settingsData] = await Promise.all([
        productAPI.getAll({ featured: 'true', limit: 8 }),
        categoryAPI.getAll(),
        supabase.from('store_settings').select('value').eq('key', 'home_hero_image').single()
      ])

      setFeaturedProducts(productsData.products || [])
      setCategories(categoriesData || [])

      if (settingsData.data?.value) {
        setHeroImage(settingsData.data.value)
      }
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[600px] md:h-[700px] bg-muted overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Luxury Jewelry"
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
        </div>

        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight">
              SKONEASU
            </h1>
            <p className="text-lg md:text-xl mb-8 text-neutral-100 leading-relaxed">
              We create thoughtfully curated gift combos that turn simple moments into lasting memories-for him, her, and everyone you love!.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild className="bg-white text-primary hover:bg-muted">
                <Link href="/shop">
                  Explore Collection <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="bg-transparent border-white text-white hover:bg-white hover:text-primary">
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="border-b border-border bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-wrap justify-center gap-8">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'On orders over ₹999' },
              { icon: RefreshCw, title: 'Easy Returns', desc: '7-day return policy' },
              { icon: Star, title: 'Premium Quality', desc: 'Handcrafted excellence' },
            ].map((item, idx) => (
              <div key={idx} className="text-center w-40 md:w-48">
                <item.icon className="h-8 w-8 mx-auto mb-3 text-secondary" />
                <h3 className="font-semibold text-primary mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold text-primary mb-4">
              Shop by Category
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our carefully curated collections, each piece designed to celebrate life's precious moments
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {loading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="animate-pulse">
                  <div className="aspect-square bg-muted rounded-lg mb-3" />
                  <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
                </div>
              ))
            ) : (
              categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/shop?category=${category.slug}`}
                  className="group"
                >
                  <Card className="overflow-hidden border-2 border-transparent hover:border-secondary transition-all duration-300">
                    <CardContent className="p-0">
                      <div className="aspect-square relative overflow-hidden">
                        <img
                          src={category.image_url || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400'}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-4 text-center">
                        <h3 className="font-semibold text-primary group-hover:text-secondary transition-colors">
                          {category.name}
                        </h3>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold text-primary mb-4">
              Featured Collection
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Handpicked masterpieces that embody luxury and timeless beauty
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="animate-pulse">
                  <div className="aspect-square bg-muted rounded-lg mb-4" />
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              ))
            ) : (
              featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild className="border-primary text-primary hover:bg-primary hover:text-white">
              <Link href="/shop">
                View All Products <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold text-primary mb-4">
              What Our Customers Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Priya Sharma',
                text: 'The diamond ring exceeded all my expectations. The craftsmanship is impeccable and the service was outstanding.',
                rating: 5,
              },
              {
                name: 'Rahul Verma',
                text: 'Purchased a necklace for my wife. She absolutely loves it! The quality and packaging were both premium.',
                rating: 5,
              },
              {
                name: 'Ananya Kapoor',
                text: 'Beautiful collection and genuine products. The certification and hallmarking gave me complete confidence.',
                rating: 5,
              },
            ].map((testimonial, idx) => (
              <Card key={idx} className="border-border">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-secondary text-secondary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.text}"</p>
                  <p className="font-semibold text-primary">{testimonial.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-serif font-bold text-primary mb-4">
            Join Our Exclusive Circle
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Subscribe to receive updates on new collections, exclusive offers, and jewelry care tips
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-4 py-3 rounded-lg border border-border flex-1 bg-background"
            />
            <Button size="lg" className="whitespace-nowrap bg-primary text-primary-foreground hover:bg-secondary">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}


