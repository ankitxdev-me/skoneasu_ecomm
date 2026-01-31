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

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        productAPI.getAll({ featured: 'true', limit: 8 }),
        categoryAPI.getAll()
      ])
      setFeaturedProducts(productsData.products || [])
      setCategories(categoriesData || [])
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
      <section className="relative h-[600px] md:h-[700px] bg-neutral-100 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&h=1080&fit=crop"
            alt="Luxury Jewelry"
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
        </div>
        
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight">
              Timeless Elegance
            </h1>
            <p className="text-lg md:text-xl mb-8 text-neutral-100 leading-relaxed">
              Discover our exquisite collection of handcrafted luxury jewelry. Each piece tells a unique story of beauty and sophistication.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild className="bg-white text-neutral-900 hover:bg-neutral-100">
                <Link href="/shop">
                  Explore Collection <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="bg-transparent border-white text-white hover:bg-white hover:text-neutral-900">
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="border-b border-neutral-200 bg-neutral-50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Shield, title: 'Certified Authentic', desc: 'BIS Hallmarked' },
              { icon: Truck, title: 'Free Shipping', desc: 'On orders over ₹50,000' },
              { icon: RefreshCw, title: 'Easy Returns', desc: '30-day return policy' },
              { icon: Star, title: 'Premium Quality', desc: 'Handcrafted excellence' },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <item.icon className="h-8 w-8 mx-auto mb-3 text-amber-600" />
                <h3 className="font-semibold text-neutral-900 mb-1">{item.title}</h3>
                <p className="text-sm text-neutral-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold text-neutral-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Explore our carefully curated collections, each piece designed to celebrate life's precious moments
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {loading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="animate-pulse">
                  <div className="aspect-square bg-neutral-200 rounded-lg mb-3" />
                  <div className="h-4 bg-neutral-200 rounded w-3/4 mx-auto" />
                </div>
              ))
            ) : (
              categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/shop?category=${category.slug}`}
                  className="group"
                >
                  <Card className="overflow-hidden border-2 border-transparent hover:border-amber-600 transition-all duration-300">
                    <CardContent className="p-0">
                      <div className="aspect-square relative overflow-hidden">
                        <img
                          src={category.image_url || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400'}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-4 text-center">
                        <h3 className="font-semibold text-neutral-900 group-hover:text-amber-600 transition-colors">
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
      <section className="py-16 bg-neutral-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold text-neutral-900 mb-4">
              Featured Collection
            </h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">
              Handpicked masterpieces that embody luxury and timeless beauty
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="animate-pulse">
                  <div className="aspect-square bg-neutral-200 rounded-lg mb-4" />
                  <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-neutral-200 rounded w-1/2" />
                </div>
              ))
            ) : (
              featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
              ))
            )}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild>
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
            <h2 className="text-4xl font-serif font-bold text-neutral-900 mb-4">
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
              <Card key={idx} className="border-neutral-200">
                <CardContent className="p-6">
                  <div className="flex mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <p className="text-neutral-600 mb-4 italic">"{testimonial.text}"</p>
                  <p className="font-semibold text-neutral-900">{testimonial.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-amber-50 border-t border-amber-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-serif font-bold text-neutral-900 mb-4">
            Join Our Exclusive Circle
          </h2>
          <p className="text-neutral-600 mb-8 max-w-2xl mx-auto">
            Subscribe to receive updates on new collections, exclusive offers, and jewelry care tips
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-4 py-3 rounded-lg border border-neutral-300 flex-1"
            />
            <Button size="lg" className="whitespace-nowrap">
              Subscribe
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

function ProductCard({ product, onAddToCart }) {
  const price = product.discount_price || product.price
  const hasDiscount = product.discount_price && product.discount_price < product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0

  return (
    <Card className="group overflow-hidden border-neutral-200 hover:shadow-xl transition-all duration-300">
      <CardContent className="p-0">
        <Link href={`/product/${product.slug}`}>
          <div className="relative aspect-square overflow-hidden bg-neutral-100">
            <img
              src={product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800'}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            {hasDiscount && (
              <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                -{discountPercent}%
              </div>
            )}
            {product.new_arrival && (
              <div className="absolute top-3 right-3 bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                New
              </div>
            )}
          </div>
        </Link>

        <div className="p-4">
          <Link href={`/product/${product.slug}`}>
            <h3 className="font-semibold text-neutral-900 mb-2 group-hover:text-amber-600 transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>
          
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-neutral-900">
              ₹{price?.toLocaleString('en-IN')}
            </span>
            {hasDiscount && (
              <span className="text-sm text-neutral-500 line-through">
                ₹{product.price?.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1"
              onClick={() => onAddToCart(product.id)}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </Button>
            <Button size="sm" variant="outline">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
