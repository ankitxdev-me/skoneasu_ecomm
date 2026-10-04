// API client for making requests to backend

const API_BASE = '/api'

export class APIError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

import { supabase } from '@/lib/supabase'

// async function fetchAPI(endpoint, options = {}) {
//   let token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

//   // If no manual token, try Supabase session
//   if (!token) {
//     const { data } = await supabase.auth.getSession()
//     token = data?.session?.access_token
//   }

//   const headers = {
//     'Content-Type': 'application/json',
//     ...options.headers
//   }

//   if (token) {
//     headers['Authorization'] = `Bearer ${token}`
//   }

//   const response = await fetch(`${API_BASE}${endpoint}`, {
//     ...options,
//     headers,
//     cache: 'no-store'
//   })

//   const data = await response.json()

//   if (!response.ok) {
//     throw new APIError(data.error || 'Check your internet connection', response.status)
//   }

//   return data
// }

async function fetchAPI(endpoint, options = {}) {
  let token = null

  // First priority: current Supabase session
  try {
    const {
      data: { session }
    } = await supabase.auth.getSession()

    token = session?.access_token || null
  } catch (error) {
    console.error('Failed to get Supabase session:', error)
  }

  // Fallback for old/custom auth flow
  if (!token && typeof window !== 'undefined') {
    token = localStorage.getItem('auth_token')
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    cache: 'no-store'
  })

  const data = await response.json()

  if (!response.ok) {
    throw new APIError(
      data.error || 'Check your internet connection',
      response.status
    )
  }

  return data
}


// Auth API
export const authAPI = {
  signUp: (data) => fetchAPI('/auth/signup', { method: 'POST', body: JSON.stringify(data) }),
  signIn: (data) => fetchAPI('/auth/signin', { method: 'POST', body: JSON.stringify(data) }),
  signOut: () => fetchAPI('/auth/signout', { method: 'POST' }),
  getProfile: () => fetchAPI('/profile'),
  updateProfile: (data) => fetchAPI('/profile', { method: 'PUT', body: JSON.stringify(data) }),
}

// Product API
export const productAPI = {
  getAll: (params) => {
    const query = new URLSearchParams(params).toString()
    return fetchAPI(`/products${query ? '?' + query : ''}`)
  },
  getBySlug: (slug) => fetchAPI(`/products/slug/${slug}?include=variations`),
}

// Category API
export const categoryAPI = {
  getAll: () => fetchAPI('/categories'),
  getBySlug: (slug) => fetchAPI(`/categories/${slug}`),
}

// Cart API
export const cartAPI = {
  get: () => fetchAPI('/cart'),
  add: (data) => fetchAPI('/cart', { method: 'POST', body: JSON.stringify(data) }),
  update: (itemId, data) => fetchAPI(`/cart/${itemId}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (itemId) => fetchAPI(`/cart/${itemId}`, { method: 'DELETE' }),
  clear: () => fetchAPI('/cart/clear', { method: 'DELETE' }),
}

// Wishlist API
export const wishlistAPI = {
  get: () => fetchAPI('/wishlist'),
  add: (productId) => fetchAPI('/wishlist', { method: 'POST', body: JSON.stringify({ product_id: productId }) }),
  remove: (productId) => fetchAPI(`/wishlist/${productId}`, { method: 'DELETE' }),
}

// Order API
export const orderAPI = {
  getAll: () => fetchAPI('/orders'),
  getById: (id) => fetchAPI(`/orders/${id}`),
  create: (data) => fetchAPI('/orders/create', { method: 'POST', body: JSON.stringify(data) }),
  verifyPayment: (data) => fetchAPI('/orders/verify-payment', { method: 'POST', body: JSON.stringify(data) }),
  requestCancellation: (id, reason) => fetchAPI(`/orders/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) }),
  requestAddressChange: (id, newAddress) => fetchAPI(`/orders/${id}/address-change`, { method: 'POST', body: JSON.stringify({ new_address: newAddress }) }),
}

// Review API
export const reviewAPI = {
  create: (data) => fetchAPI('/reviews', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => fetchAPI(`/reviews/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => fetchAPI(`/reviews/${id}`, { method: 'DELETE' }),
  getPinned: () => fetchAPI('/reviews/pinned'),
}

// Address API
export const addressAPI = {
  getAll: () => fetchAPI('/addresses'),
  create: (data) => fetchAPI('/addresses', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => fetchAPI(`/addresses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => fetchAPI(`/addresses/${id}`, { method: 'DELETE' }),
}

// Coupon API
export const couponAPI = {
  validate: (code, totalAmount) => fetchAPI('/coupons/validate', {
    method: 'POST',
    body: JSON.stringify({ code, total_amount: totalAmount })
  }),
}

// Support API
export const supportAPI = {
  getAll: () => fetchAPI('/support'),
  getById: (id) => fetchAPI(`/support/${id}`),
}

// Admin API
export const adminAPI = {
  products: {
    getAll: () => fetchAPI('/admin/products'),
    create: (data) => fetchAPI('/admin/products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => fetchAPI(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    getById: (id) => fetchAPI(`/admin/products/${id}`),
    delete: (id) => fetchAPI(`/admin/products/${id}`, { method: 'DELETE' }),
  },
  orders: {
    getAll: () => fetchAPI('/admin/orders'),
    updateStatus: (id, payload) => fetchAPI(`/admin/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(typeof payload === 'string' ? { status: payload } : payload)
    }),
    handleCancellation: (id, status) => fetchAPI(`/admin/orders/${id}/cancellation`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }),
    handleAddressChange: (id, status) => fetchAPI(`/admin/orders/${id}/address-change`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }),
  },
  categories: {
    create: (data) => fetchAPI('/admin/categories', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => fetchAPI(`/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => fetchAPI(`/admin/categories/${id}`, { method: 'DELETE' }),
  },
  customers: {
    getAll: () => fetchAPI('/admin/customers'),
  },
  coupons: {
    getAll: () => fetchAPI('/admin/coupons'),
    create: (data) => fetchAPI('/admin/coupons', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id) => fetchAPI(`/admin/coupons/${id}`, { method: 'DELETE' }),
  },
  stats: (range) => fetchAPI(`/admin/stats${range ? `?range=${range}` : ''}`),
  settings: {
    get: () => fetchAPI('/admin/settings'),
    update: (data) => fetchAPI('/admin/settings', { method: 'PUT', body: JSON.stringify(data) }),
  },
  support: {
    getAll: () => fetchAPI('/admin/support'),
    getById: (id) => fetchAPI(`/admin/support/${id}`),
    reply: (id, data) => fetchAPI(`/admin/support/${id}/reply`, { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id, status) => fetchAPI(`/admin/support/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) }),
  },
  getReviews: () => fetchAPI('/admin/reviews'),
  deleteReview: (id) => fetchAPI(`/admin/reviews/${id}`, { method: 'DELETE' }),
  togglePinReview: (id) => fetchAPI(`/admin/reviews/${id}/pin`, { method: 'POST', body: JSON.stringify({}) }),
}
