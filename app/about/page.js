'use client'

import React from 'react'
import Link from 'next/link'
import {
  Diamond,
  Heart,
  Award,
  Gift,
  Sparkles,
  Star,
  Users
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col selection:bg-[#B87545]/20 selection:text-[#231711]">
      <Header />

      <main className="flex-1 w-full">
        {/* =========================================================
            1. HERO BANNER: Golden Diwali Gift Still Life
            ========================================================= */}
        <section className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 mt-3 sm:mt-5 mb-12 sm:mb-16 lg:mb-20">
          <div className="relative rounded-[22px] sm:rounded-[30px] lg:rounded-[36px] overflow-hidden border border-[#EADBCE]/85 shadow-sm min-h-[300px] sm:min-h-[380px] md:min-h-[440px] lg:min-h-[500px] flex items-center bg-[#FAF4ED]">
            {/* Background Image */}
            <img
              src="/Golden Diwali Gift Still Life.png"
              alt="More Than Gifts, A Way to Express"
              className="absolute inset-0 w-full h-full object-cover object-right sm:object-center"
            />

            {/* Soft readable gradient fade on the left */}
            <div className="absolute inset-y-0 left-0 w-[70%] sm:w-[58%] md:w-[52%] lg:w-[48%] bg-gradient-to-r from-[#FAF2EA]/95 via-[#FAF2EA]/70 to-transparent pointer-events-none" />

            {/* Left Content Area */}
            <div className="relative z-10 w-[72%] sm:w-[58%] md:w-[52%] lg:w-[46%] p-5 sm:p-8 md:p-12 lg:p-16 flex flex-col items-start">
              <span className="text-[10px] sm:text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-[#8C4B23] flex items-center gap-1.5 mb-2 sm:mb-3 font-sans">
                <Diamond className="w-3.5 h-3.5 fill-[#8C4B23] stroke-none" /> OUR STORY
              </span>

              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-[54px] xl:text-[60px] font-bold text-[#231711] tracking-tight leading-[1.08] mb-2.5 sm:mb-4">
                More Than Gifts, <br />
                <span className="text-[#C8845C]">A Way to Express</span>
              </h1>

              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-[#5A382B] font-medium leading-relaxed mb-5 sm:mb-7 md:mb-8 font-sans max-w-xs sm:max-w-sm md:max-w-md">
                At Skoneasu, we believe every gift carries a feeling, a story, and a piece of your heart.
              </p>

              <Button asChild className="bg-[#2A160F] hover:bg-black text-white text-xs sm:text-sm md:text-[14.5px] font-semibold h-9 sm:h-10 md:h-12 px-5 sm:px-6 md:px-8 rounded-full inline-flex items-center gap-2 shadow-sm transition-all active:scale-95">
                <a href="#our-story">
                  Our Journey &rarr;
                </a>
              </Button>
            </div>
          </div>
        </section>

        {/* =========================================================
            2. OUR STORY (2-Column Grid: Pearl Jewelry Box + Story)
            ========================================================= */}
        <section id="our-story" className="scroll-mt-24 w-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 mb-14 sm:mb-18 lg:mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-14 xl:gap-16 items-center">
            
            {/* Left Image: Exquisite Pearl Jewelry Box */}
            <div className="relative rounded-[22px] sm:rounded-[28px] overflow-hidden shadow-sm border border-[#EADBCE]/80 aspect-[4/3] bg-[#FAF5EE] group">
              <img
                src="/about_pearl_necklace.jpg"
                alt="Exquisite Pearl Jewelry Collection"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>

            {/* Right Story Description */}
            <div className="flex flex-col justify-center items-start lg:pl-2">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#8C4B23] flex items-center gap-1.5 mb-2 font-sans">
                <Diamond className="w-3.5 h-3.5 fill-[#8C4B23] stroke-none" /> ABOUT SKONEASU
              </span>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[46px] font-bold text-[#231711] tracking-tight leading-tight mb-4 sm:mb-5">
                Our Story
              </h2>

              <p className="text-xs sm:text-sm md:text-base text-[#5A382B] leading-relaxed mb-4 font-sans">
                At Skoneasu, we believe that fashion is more than just accessories; it's a language of love and expression. We create thoughtfully curated gift combos that turn simple moments into lasting memories — for him, her, and everyone you love!
              </p>

              <p className="text-xs sm:text-sm md:text-base text-[#5A382B] leading-relaxed mb-6 sm:mb-8 font-sans">
                Founded with a passion for exquisite craftsmanship and timeless style, our mission is to bring you jewelry and accessories that not only elevate your look but also touch your heart.
              </p>

              <Button asChild className="bg-[#2A160F] hover:bg-black text-white text-xs sm:text-sm font-semibold h-10 sm:h-11 px-6 sm:px-7 rounded-full inline-flex items-center gap-2 shadow-sm transition-all active:scale-95">
                <Link href="/shop">
                  Discover Our Collections &rarr;
                </Link>
              </Button>
            </div>

          </div>
        </section>

        {/* =========================================================
            3. OUR CORE VALUES (3 White Cards)
            ========================================================= */}
        <section className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 mb-14 sm:mb-18 lg:mb-24">
          <div className="text-center mb-8 sm:mb-12">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#8C4B23] inline-block mb-1.5 font-sans">
              &mdash; OUR CORE VALUES
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-[42px] font-bold text-[#231711] tracking-tight leading-tight mb-2">
              The Essence of Style
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-[#6B4B3D] max-w-xl mx-auto font-sans">
              Our core values shape every piece we create and every combo we curate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Value 1 */}
            <div className="bg-white rounded-[20px] sm:rounded-[24px] p-6 sm:p-8 lg:p-9 border border-[#EADBCE]/80 shadow-2xs hover:shadow-md transition-all duration-300 text-center flex flex-col items-center group">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#FAF0E6] flex items-center justify-center mb-4 sm:mb-5 text-[#8C4B23] group-hover:scale-110 transition-transform">
                <Diamond className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.8]" />
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#231711] mb-2 sm:mb-3">
                Timeless Elegance
              </h3>
              <p className="text-xs sm:text-[13.5px] text-[#6B4B3D] leading-relaxed font-sans">
                We curate designs that transcend trends, ensuring your style remains iconic through the ages.
              </p>
            </div>

            {/* Value 2 */}
            <div className="bg-white rounded-[20px] sm:rounded-[24px] p-6 sm:p-8 lg:p-9 border border-[#EADBCE]/80 shadow-2xs hover:shadow-md transition-all duration-300 text-center flex flex-col items-center group">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#FAF0E6] flex items-center justify-center mb-4 sm:mb-5 text-[#8C4B23] group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.8]" />
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#231711] mb-2 sm:mb-3">
                Curated with Love
              </h3>
              <p className="text-xs sm:text-[13.5px] text-[#6B4B3D] leading-relaxed font-sans">
                Every gift combo is thoughtfully assembled to create a meaningful emotional connection.
              </p>
            </div>

            {/* Value 3 */}
            <div className="bg-white rounded-[20px] sm:rounded-[24px] p-6 sm:p-8 lg:p-9 border border-[#EADBCE]/80 shadow-2xs hover:shadow-md transition-all duration-300 text-center flex flex-col items-center group">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#FAF0E6] flex items-center justify-center mb-4 sm:mb-5 text-[#8C4B23] group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.8]" />
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#231711] mb-2 sm:mb-3">
                Uncompromised Quality
              </h3>
              <p className="text-xs sm:text-[13.5px] text-[#6B4B3D] leading-relaxed font-sans">
                We are committed to the highest standards of craftsmanship, using only premium materials.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================
            4. OUR MISSION (Dark Chocolate Card with Indian Jewelry Portrait)
            ========================================================= */}
        <section className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 mb-14 sm:mb-18 lg:mb-24">
          <div className="relative rounded-[24px] sm:rounded-[32px] bg-[#1E110B] text-white p-6 sm:p-8 md:p-10 lg:p-12 xl:p-14 overflow-hidden shadow-lg border border-[#3A2218]">
            {/* Subtle background ambient lights */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#1E110B] via-[#24130C]/95 to-[#1A0E08] pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-14 items-center">
              
              {/* Left Image: Indian Woman in Exquisite Jewelry */}
              <div className="relative rounded-[20px] sm:rounded-[24px] overflow-hidden aspect-[4/3] w-full shadow-md border border-white/10 group">
                <img
                  src="/about_mission_jewelry.jpg"
                  alt="Creating Moments That Matter - Craftsmanship"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>

              {/* Right Content */}
              <div className="flex flex-col justify-center">
                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#D4A57E] flex items-center gap-1.5 mb-2 font-sans">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4A57E]" /> OUR MISSION
                </span>

                <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-tight leading-tight mb-3 sm:mb-4">
                  Creating Moments <br />
                  That Matter
                </h2>

                <p className="text-xs sm:text-sm lg:text-[14.5px] text-[#E8D5C0] leading-relaxed mb-6 sm:mb-8 font-sans">
                  We aim to make gifting effortless, meaningful, and unforgettable. Whether it's a celebration, a milestone, or a simple gesture, Skoneasu is here to help you express what words sometimes cannot.
                </p>

                {/* 3 Value Pillars */}
                <div className="space-y-4">
                  {/* Pillar 1 */}
                  <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 p-2 rounded-xl hover:bg-white/5 transition-colors">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#B87545]/20 border border-[#B87545]/30 flex items-center justify-center text-[#E8C7AF] shrink-0">
                      <Gift className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-sm sm:text-base text-white">
                        Thoughtful Curation
                      </h4>
                      <p className="text-[11px] sm:text-xs text-[#E8D5C0]/80">
                        Gifts that speak from the heart
                      </p>
                    </div>
                  </div>

                  {/* Pillar 2 */}
                  <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 p-2 rounded-xl hover:bg-white/5 transition-colors">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#B87545]/20 border border-[#B87545]/30 flex items-center justify-center text-[#E8C7AF] shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-sm sm:text-base text-white">
                        Premium Craftsmanship
                      </h4>
                      <p className="text-[11px] sm:text-xs text-[#E8D5C0]/80">
                        Quality you can trust
                      </p>
                    </div>
                  </div>

                  {/* Pillar 3 */}
                  <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 p-2 rounded-xl hover:bg-white/5 transition-colors">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#B87545]/20 border border-[#B87545]/30 flex items-center justify-center text-[#E8C7AF] shrink-0">
                      <Heart className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-sm sm:text-base text-white">
                        Memorable Experiences
                      </h4>
                      <p className="text-[11px] sm:text-xs text-[#E8D5C0]/80">
                        Turning moments into memories
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* =========================================================
            5. OUR JOURNEY & STATS + Luxurious Golden Celebration Box
            ========================================================= */}
        <section className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 mb-14 sm:mb-18 lg:mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-14 xl:gap-16 items-center">
            
            {/* Left Column: Heading, Story & Button */}
            <div className="flex flex-col justify-center items-start">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#8C4B23] mb-2 font-sans">
                &mdash; OUR JOURNEY
              </span>

              <h2 className="font-serif text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#231711] tracking-tight leading-tight mb-4">
                From a Simple Idea <br />
                to a Growing Community
              </h2>

              <div className="w-12 h-0.5 bg-[#C8845C] mb-5" />

              <p className="text-xs sm:text-sm md:text-base text-[#5A382B] leading-relaxed mb-6 sm:mb-8 font-sans">
                What started as a small idea has now become a community of gift lovers who believe in meaningful connections. We are grateful for every customer who trusts us to be a part of their special moments.
              </p>

              <Button asChild className="bg-[#2A160F] hover:bg-black text-white text-xs sm:text-sm font-semibold h-10 sm:h-11 px-6 sm:px-7 rounded-full inline-flex items-center gap-2 shadow-sm transition-all active:scale-95">
                <Link href="/shop">
                  Be a Part of Our Story &rarr;
                </Link>
              </Button>
            </div>

            {/* Right Column: 4 Stats in a Row + Luxurious Gift Box Image */}
            <div>
              {/* 4 Stat Badges in a single horizontal grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
                {/* Stat 1 */}
                <div className="bg-white rounded-xl p-3 sm:p-3.5 border border-[#EADBCE]/80 shadow-2xs text-center flex flex-col items-center">
                  <Gift className="w-5 h-5 text-[#8C4B23] mb-1.5" />
                  <span className="font-serif text-xl sm:text-2xl font-bold text-[#231711]">
                    10K+
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-[#6B4B3D] font-medium mt-0.5">
                    Happy Customers
                  </span>
                </div>

                {/* Stat 2 */}
                <div className="bg-white rounded-xl p-3 sm:p-3.5 border border-[#EADBCE]/80 shadow-2xs text-center flex flex-col items-center">
                  <Heart className="w-5 h-5 text-[#8C4B23] mb-1.5" />
                  <span className="font-serif text-xl sm:text-2xl font-bold text-[#231711]">
                    500+
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-[#6B4B3D] font-medium mt-0.5">
                    Unique Gift Combos
                  </span>
                </div>

                {/* Stat 3 */}
                <div className="bg-white rounded-xl p-3 sm:p-3.5 border border-[#EADBCE]/80 shadow-2xs text-center flex flex-col items-center">
                  <Star className="w-5 h-5 text-[#8C4B23] mb-1.5" />
                  <span className="font-serif text-xl sm:text-2xl font-bold text-[#231711]">
                    4.8
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-[#6B4B3D] font-medium mt-0.5">
                    Average Rating
                  </span>
                </div>

                {/* Stat 4 */}
                <div className="bg-white rounded-xl p-3 sm:p-3.5 border border-[#EADBCE]/80 shadow-2xs text-center flex flex-col items-center">
                  <Users className="w-5 h-5 text-[#8C4B23] mb-1.5" />
                  <span className="font-serif text-xl sm:text-2xl font-bold text-[#231711]">
                    50+
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-[#6B4B3D] font-medium mt-0.5">
                    Cities Across India
                  </span>
                </div>
              </div>

              {/* Luxurious Golden Celebration Gift Box Image */}
              <div className="relative rounded-[20px] sm:rounded-[24px] overflow-hidden aspect-[2.2/1] sm:aspect-[2.4/1] w-full shadow-sm border border-[#EADBCE]/80 mt-4 sm:mt-5 bg-[#FAF4ED] group">
                <img
                  src="/Luxurious Golden Celebration Gift Box.png"
                  alt="Skoneasu Luxurious Golden Celebration Gift Box"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
            </div>

          </div>
        </section>

        {/* =========================================================
            6. JOIN OUR JOURNEY (Dark Banner with Gold Accents)
            ========================================================= */}
        <section className="w-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 mb-14 sm:mb-18 lg:mb-20">
          <div className="relative rounded-[22px] sm:rounded-[28px] lg:rounded-[32px] bg-[#1E110B] text-white p-7 sm:p-10 md:p-14 lg:p-16 text-center overflow-hidden shadow-md border border-[#3A2218]">
            {/* Subtle background gradient & botanical accent lines */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#2E180E] via-[#1E110B] to-[#120804] pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#D4A57E] mb-2 font-sans flex items-center gap-1.5">
                &#8767; JOIN OUR JOURNEY
              </span>

              <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-[44px] font-bold text-white tracking-tight leading-tight mb-3">
                Find <span className="text-[#D4A57E]">Your Signature Style</span>
              </h2>

              <p className="text-xs sm:text-sm md:text-base text-[#E8D5C0] leading-relaxed mb-6 sm:mb-8 font-sans max-w-lg">
                Explore our exclusive collection and discover the perfect piece that resonates with your unique personality.
              </p>

              <Button asChild className="bg-[#B86B3E] hover:bg-[#9E572D] text-white text-xs sm:text-sm font-semibold h-10 sm:h-11 px-7 sm:px-8 rounded-lg inline-flex items-center gap-2 shadow-sm transition-all active:scale-95">
                <Link href="/shop">
                  Shop Now &rarr;
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
