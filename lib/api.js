// API client for making requests to backend

const API_BASE = '/api'

export class APIError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

async function fetchAPI(endpoint, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  })
  
  const data = await response.json()
  
  if (!response.ok) {
    throw new APIError(data.error || 'An error occurred', response.status)
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
  getBySlug: (slug) => fetchAPI(`/products/slug/${slug}`),
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
}

// Review API
export const reviewAPI = {
  create: (data) => fetchAPI('/reviews', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => fetchAPI(`/reviews/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => fetchAPI(`/reviews/${id}`, { method: 'DELETE' }),
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

// Admin API
export const adminAPI = {
  products: {
    getAll: () => fetchAPI('/admin/products'),
    create: (data) => fetchAPI('/admin/products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => fetchAPI(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => fetchAPI(`/admin/products/${id}`, { method: 'DELETE' }),
  },
  orders: {
    getAll: () => fetchAPI('/admin/orders'),
    updateStatus: (id, status) => fetchAPI(`/admin/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }),
  },
  stats: () => fetchAPI('/admin/stats'),
}
