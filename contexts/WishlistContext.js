'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'sonner'

const WishlistContext = createContext()

export function WishlistProvider({ children }) {
    const [wishlist, setWishlist] = useState([])

    // Load wishlist from local storage on mount
    useEffect(() => {
        const savedWishlist = localStorage.getItem('wishlist')
        if (savedWishlist) {
            try {
                setWishlist(JSON.parse(savedWishlist))
            } catch (error) {
                console.error('Failed to parse wishlist:', error)
            }
        }
    }, [])

    // Save wishlist to local storage whenever it changes
    useEffect(() => {
        localStorage.setItem('wishlist', JSON.stringify(wishlist))
    }, [wishlist])

    const addToWishlist = (product) => {
        if (wishlist.some(item => item.id === product.id)) {
            toast.info('Item already in wishlist')
            return
        }
        setWishlist([...wishlist, product])
        toast.success('Added to wishlist')
    }

    const removeFromWishlist = (productId) => {
        setWishlist(wishlist.filter(item => item.id !== productId))
        toast.success('Removed from wishlist')
    }

    const isInWishlist = (productId) => {
        return wishlist.some(item => item.id === productId)
    }

    const toggleWishlist = (product) => {
        if (isInWishlist(product.id)) {
            removeFromWishlist(product.id)
        } else {
            addToWishlist(product)
        }
    }

    return (
        <WishlistContext.Provider value={{
            wishlist,
            addToWishlist,
            removeFromWishlist,
            isInWishlist,
            toggleWishlist,
            wishlistCount: wishlist.length
        }}>
            {children}
        </WishlistContext.Provider>
    )
}

export function useWishlist() {
    const context = useContext(WishlistContext)
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider')
    }
    return context
}
