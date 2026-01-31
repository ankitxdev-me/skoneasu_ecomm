'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { cartAPI } from '@/lib/api'
import { useAuth } from './AuthContext'
import { toast } from 'sonner'

const CartContext = createContext({})

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      loadCart()
    } else {
      setCart([])
    }
  }, [user])

  const loadCart = async () => {
    try {
      setLoading(true)
      const data = await cartAPI.get()
      setCart(data)
    } catch (error) {
      console.error('Error loading cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (productId, variantId = null, quantity = 1) => {
    try {
      await cartAPI.add({ product_id: productId, variant_id: variantId, quantity })
      await loadCart()
      toast.success('Added to cart')
    } catch (error) {
      toast.error(error.message || 'Failed to add to cart')
      throw error
    }
  }

  const updateQuantity = async (itemId, quantity) => {
    try {
      await cartAPI.update(itemId, { quantity })
      await loadCart()
    } catch (error) {
      toast.error(error.message || 'Failed to update cart')
      throw error
    }
  }

  const removeFromCart = async (itemId) => {
    try {
      await cartAPI.remove(itemId)
      await loadCart()
      toast.success('Removed from cart')
    } catch (error) {
      toast.error(error.message || 'Failed to remove from cart')
      throw error
    }
  }

  const clearCart = async () => {
    try {
      await cartAPI.clear()
      setCart([])
    } catch (error) {
      toast.error(error.message || 'Failed to clear cart')
      throw error
    }
  }

  const cartTotal = cart.reduce((sum, item) => {
    const price = item.product?.discount_price || item.product?.price || 0
    const variantPrice = item.variant ? price + (item.variant.price_modifier || 0) : price
    return sum + (variantPrice * item.quantity)
  }, 0)

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const value = {
    cart,
    loading,
    cartTotal,
    cartCount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart: loadCart,
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
