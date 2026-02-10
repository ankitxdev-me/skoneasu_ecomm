'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { cartAPI } from '@/lib/api'
import { useAuth } from './AuthContext'
import { toast } from 'sonner'
import debounce from 'lodash/debounce' // We might need to install lodash or write a simple debounce

const CartContext = createContext({})

// Simple debounce implementation if lodash is not available
function simpleDebounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function CartProvider({ children }) {
  const { user } = useAuth()
  const router = useRouter()
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Global Coupon State
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponError, setCouponError] = useState('')
  const [couponSuccess, setCouponSuccess] = useState('')

  // Load cart on mount or auth change
  useEffect(() => {
    if (user) {
      loadCart()
    } else {
      setCart([]) // Guest cart disabled, clear cart
    }
    setIsInitialized(true)
  }, [user])

  /*
  const loadGuestCart = () => {
    try {
      const savedCart = localStorage.getItem('guest_cart')
      if (savedCart) {
        const parsed = JSON.parse(savedCart)
        setCart(Array.isArray(parsed) ? parsed : [])
      } else {
        setCart([])
      }
    } catch (e) {
      console.error('Error loading guest cart', e)
      setCart([])
    }
  }

  const saveGuestCart = (newCart) => {
    localStorage.setItem('guest_cart', JSON.stringify(newCart))
  }
  */

  const loadCart = async () => {
    try {
      setLoading(true)
      const data = await cartAPI.get()
      setCart(Array.isArray(data) ? data : [])

      // Merge guest cart if exists? (Optional enhancement for later)
      // For now, just load the server cart
    } catch (error) {
      console.error('Error loading cart:', error)
      setCart([])
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (product, quantity = 1, variantId = null) => {
    if (!user) {
      toast.error('Please login to add to cart')
      router.push('/auth/signin')
      return
    }

    const tempId = 'temp-' + Date.now()

    // Create optimistic item
    const newItem = {
      id: tempId,
      product_id: product.id,
      variant_id: variantId,
      quantity: quantity,
      product: product, // Store full product for guest/optimistic display
      variant: product.variants?.find(v => v.id === variantId)
    }

    // Optimistic Update
    setCart(prev => {
      const currentCart = Array.isArray(prev) ? prev : []
      // Check if item already exists
      const existingIndex = currentCart.findIndex(item =>
        item.product_id === product.id && item.variant_id === variantId
      )

      let newCart
      if (existingIndex >= 0) {
        newCart = [...currentCart]
        newCart[existingIndex] = {
          ...newCart[existingIndex],
          quantity: newCart[existingIndex].quantity + quantity
        }
      } else {
        newCart = [...currentCart, newItem]
      }
      return newCart
    })

    toast.success('Added to cart')

    try {
      await cartAPI.add({ product_id: product.id, variant_id: variantId, quantity })
      // We reload to get the real IDs from server
      // To avoid UI flicker, we could just rely on the loadCart replacing the optimistic item
      await loadCart()
    } catch (error) {
      toast.error(error.message || 'Failed to add to cart')
      // Revert on error (reloading cart from server is safest)
      loadCart()
    }
  }

  const updateQuantity = async (itemId, quantity) => {
    // Optimistic Update
    setCart(prev => {
      const currentCart = Array.isArray(prev) ? prev : []
      const newCart = currentCart.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
      return newCart
    })

    // Skip API calls for temporary items (they haven't been confirmed by server yet)
    if (typeof itemId === 'string' && itemId.startsWith('temp-')) {
      return
    }

    // Debounce or fire-and-forget logic could go here
    // For now, we await but configured the UI to already be updated
    try {
      await cartAPI.update(itemId, { quantity })
    } catch (error) {
      console.error('Failed to update quantity', error)
      loadCart() // Revert
    }
  }

  const removeFromCart = async (itemId) => {
    // Optimistic Update
    setCart(prev => {
      const currentCart = Array.isArray(prev) ? prev : []
      const newCart = currentCart.filter(item => item.id !== itemId)
      return newCart
    })

    toast.success('Removed from cart')

    // Skip API calls for temporary items
    if (typeof itemId === 'string' && itemId.startsWith('temp-')) {
      return
    }

    try {
      await cartAPI.remove(itemId)
    } catch (error) {
      console.error('Failed to remove item', error)
      loadCart() // Revert
    }
  }

  const clearCart = async () => {
    setCart([])
    try {
      await cartAPI.clear()
    } catch (error) {
      loadCart()
    }
  }

  const cartTotal = (Array.isArray(cart) ? cart : []).reduce((sum, item) => {
    const price = item.product?.discount_price || item.product?.price || 0
    const variantPrice = item.variant ? price + (item.variant.price_modifier || 0) : price
    return sum + (variantPrice * item.quantity)
  }, 0)

  // GST is 12%, and Discount is exactly equal to GST
  const cartGST = Math.round(cartTotal * 0.12 * 100) / 100
  const cartDiscount = cartGST

  const cartCount = (Array.isArray(cart) ? cart : []).reduce((sum, item) => sum + item.quantity, 0)

  const value = {
    cart,
    loading,
    cartTotal,
    cartGST,
    cartDiscount,
    cartCount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart: loadCart,

    // Coupon State & Methods
    couponCode,
    setCouponCode,
    appliedCoupon,
    setAppliedCoupon,
    couponDiscount,
    setCouponDiscount,
    couponError,
    setCouponError,
    couponSuccess,
    setCouponSuccess,
    clearCoupon: () => {
      setCouponCode('')
      setAppliedCoupon(null)
      setCouponDiscount(0)
      setCouponError('')
      setCouponSuccess('')
    }
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
