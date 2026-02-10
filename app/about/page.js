'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Star, Heart, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white">
            <Header />

            {/* Hero Section */}
            <section className="relative h-[50vh] min-h-[400px] bg-neutral-900 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop"
                        alt="Fashion and Style"
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                </div>
                <div className="relative container mx-auto px-4 text-center text-white">
                    <h1 className="text-5xl md:text-7xl font-serif font-bold mb-4">
                        Fashion & Style
                    </h1>
                    <p className="text-xl md:text-2xl font-light text-neutral-200 max-w-2xl mx-auto">
                        Where Elegance Meets Emotion
                    </p>
                </div>
            </section>

            {/* Brand Story */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <h2 className="text-4xl font-serif font-bold text-primary">
                                Our Story
                            </h2>
                            <div className="w-20 h-1 bg-secondary" />
                            <p className="text-lg text-neutral-600 leading-relaxed">
                                At Skoneasu, we believe that fashion is more than just accessories; it's a language of love and expression. We create thoughtfully curated gift combos that turn simple moments into lasting memories-for him, her, and everyone you love!
                            </p>
                            <p className="text-lg text-neutral-600 leading-relaxed">
                                Founded with a passion for exquisite craftsmanship and timeless style, our mission is to bring you jewelry and accessories that not only elevate your look but also touch your heart.
                            </p>
                        </div>
                        <div className="relative h-[500px] rounded-lg overflow-hidden shadow-xl">
                            <img
                                src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop"
                                alt="Our craftsmanship"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-20 bg-muted/30">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-serif font-bold text-primary mb-4">
                            The Essence of Style
                        </h2>
                        <p className="text-muted-foreground max-w-xl mx-auto">
                            Our core values shape every piece we create and every combo we curate.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Star,
                                title: 'Timeless Elegance',
                                desc: 'We curate designs that transcend trends, ensuring your style remains iconic through the ages.'
                            },
                            {
                                icon: Heart,
                                title: 'Curated with Love',
                                desc: 'Every gift combo is thoughtfully assembled to create a meaningful emotional connection.'
                            },
                            {
                                icon: Award,
                                title: 'Uncompromised Quality',
                                desc: 'We are committed to the highest standards of craftsmanship, using only premium materials.'
                            }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow text-center">
                                <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <item.icon className="h-8 w-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-primary mb-3">{item.title}</h3>
                                <p className="text-neutral-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-primary text-white text-center">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl font-serif font-bold mb-6">
                        Find Your Signature Style
                    </h2>
                    <p className="text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto">
                        Explore our exclusive collection and discover the perfect piece that resonates with your unique personality.
                    </p>
                    <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-6">
                        <Link href="/shop">
                            Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </section>

            <Footer />
        </div>
    )
}
