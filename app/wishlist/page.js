'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { Loader2 } from 'lucide-react'

export default function WishlistPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard?tab=wishlist')
  }, [router])

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#8C6D62]" />
      </div>
    </div>
  )
}
