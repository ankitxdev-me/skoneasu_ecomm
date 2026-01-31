import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { createRazorpayOrder, verifyPaymentSignature } from '@/lib/razorpay'

// Helper function to get user from session
async function getAuthUser(request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return null
  
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error) return null
  return user
}

// Helper function to check if user is admin
async function isAdmin(userId) {
  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()
  
  return data?.role === 'admin'
}

// ============ AUTH ENDPOINTS ============

async function handleSignUp(body) {
  const { email, password, full_name, phone } = body
  
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })
  
  if (authError) throw authError
  
  // Create profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      full_name,
      phone,
      role: 'user'
    })
  
  if (profileError) throw profileError
  
  return { user: authData.user, session: authData.session }
}

async function handleSignIn(body) {
  const { email, password } = body
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) throw error
  
  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single()
  
  return { user: data.user, session: data.session, profile }
}

async function handleSignOut(request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) throw new Error('No auth token')
  
  const { error } = await supabase.auth.signOut(token)
  if (error) throw error
  
  return { message: 'Signed out successfully' }
}

async function handleGetProfile(request) {
  const user = await getAuthUser(request)
  if (!user) throw new Error('Unauthorized')
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (error) throw error
  return data
}

async function handleUpdateProfile(request, body) {
  const user = await getAuthUser(request)
  if (!user) throw new Error('Unauthorized')
  
  const { data, error } = await supabase
    .from('profiles')
    .update(body)
    .eq('id', user.id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// ============ CATEGORY ENDPOINTS ============

async function handleGetCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')
  
  if (error) throw error
  return data
}

async function handleGetCategoryBySlug(slug) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (error) throw error
  return data
}

// ============ PRODUCT ENDPOINTS ============

async function handleGetProducts(searchParams) {
  let query = supabase
    .from('products')
    .select(\`
      *,
      category:categories(id, name, slug),
      images:product_images(id, image_url, sort_order),
      variants:product_variants(id, variant_type, variant_value, stock, price_modifier)
    \`)
  
  // Filters
  if (searchParams.category) {
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', searchParams.category)
      .single()
    
    if (category) {
      query = query.eq('category_id', category.id)
    }
  }
  
  if (searchParams.featured === 'true') {
    query = query.eq('featured', true)
  }
  
  if (searchParams.best_seller === 'true') {
    query = query.eq('best_seller', true)
  }
  
  if (searchParams.new_arrival === 'true') {
    query = query.eq('new_arrival', true)
  }
  
  if (searchParams.min_price) {
    query = query.gte('price', parseFloat(searchParams.min_price))
  }
  
  if (searchParams.max_price) {
    query = query.lte('price', parseFloat(searchParams.max_price))
  }
  
  if (searchParams.search) {
    query = query.or(`name.ilike.%${searchParams.search}%,description.ilike.%${searchParams.search}%`)
  }
  
  // Sorting
  if (searchParams.sort === 'price_asc') {
    query = query.order('price', { ascending: true })
  } else if (searchParams.sort === 'price_desc') {
    query = query.order('price', { ascending: false })
  } else if (searchParams.sort === 'newest') {
    query = query.order('created_at', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }
  
  // Pagination
  const page = parseInt(searchParams.page) || 1
  const limit = parseInt(searchParams.limit) || 12
  const from = (page - 1) * limit
  const to = from + limit - 1
  
  query = query.range(from, to)
  
  const { data, error, count } = await query
  
  if (error) throw error
  
  return {
    products: data,
    pagination: {
      page,
      limit,
      total: count
    }
  }
}

async function handleGetProductBySlug(slug) {
  const { data, error } = await supabase
    .from('products')
    .select(\`
      *,
      category:categories(id, name, slug),
      images:product_images(id, image_url, sort_order),
      variants:product_variants(id, variant_type, variant_value, stock, price_modifier),
      reviews:reviews(
        id,
        rating,
        comment,
        created_at,
        user:profiles(full_name)
      )
    \`)
    .eq('slug', slug)
    .single()
  
  if (error) throw error
  
  // Calculate average rating
  if (data.reviews && data.reviews.length > 0) {
    const avgRating = data.reviews.reduce((sum, r) => sum + r.rating, 0) / data.reviews.length
    data.averageRating = avgRating.toFixed(1)
    data.reviewCount = data.reviews.length
  } else {
    data.averageRating = 0
    data.reviewCount = 0
  }
  
  return data
}

// ============ CART ENDPOINTS ============

async function handleGetCart(request) {
  const user = await getAuthUser(request)
  if (!user) throw new Error('Unauthorized')
  
  const { data, error } = await supabase
    .from('cart_items')
    .select(\`
      *,
      product:products(
        id,
        name,
        slug,
        price,
        discount_price,
        stock_quantity,
        images:product_images(image_url)
      ),
      variant:product_variants(
        id,
        variant_type,
        variant_value,
        stock,
        price_modifier
      )
    \`)
    .eq('user_id', user.id)
  
  if (error) throw error
  return data
}

async function handleAddToCart(request, body) {
  const user = await getAuthUser(request)
  if (!user) throw new Error('Unauthorized')
  
  const { product_id, variant_id, quantity } = body
  
  // Check if item already exists
  let query = supabase
    .from('cart_items')
    .select('*')
    .eq('user_id', user.id)
    .eq('product_id', product_id)
  
  if (variant_id) {
    query = query.eq('variant_id', variant_id)
  } else {
    query = query.is('variant_id', null)
  }
  
  const { data: existing } = await query.single()
  
  if (existing) {
    // Update quantity
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity: existing.quantity + quantity })
      .eq('id', existing.id)
      .select()
      .single()
    
    if (error) throw error
    return data
  } else {
    // Insert new item
    const { data, error } = await supabase
      .from('cart_items')
      .insert({
        user_id: user.id,
        product_id,
        variant_id,
        quantity
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

async function handleUpdateCartItem(request, itemId, body) {
  const user = await getAuthUser(request)
  if (!user) throw new Error('Unauthorized')
  
  const { quantity } = body
  
  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', itemId)
    .eq('user_id', user.id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

async function handleRemoveFromCart(request, itemId) {
  const user = await getAuthUser(request)
  if (!user) throw new Error('Unauthorized')
  
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', itemId)
    .eq('user_id', user.id)
  
  if (error) throw error
  return { message: 'Item removed from cart' }
}

async function handleClearCart(request) {
  const user = await getAuthUser(request)
  if (!user) throw new Error('Unauthorized')
  
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', user.id)
  
  if (error) throw error
  return { message: 'Cart cleared' }
}

// ============ WISHLIST ENDPOINTS ============

async function handleGetWishlist(request) {
  const user = await getAuthUser(request)
  if (!user) throw new Error('Unauthorized')
  
  const { data, error } = await supabase
    .from('wishlists')
    .select(\`
      *,
      product:products(
        id,
        name,
        slug,
        price,
        discount_price,
        images:product_images(image_url)
      )
    \`)
    .eq('user_id', user.id)
  
  if (error) throw error
  return data
}

async function handleAddToWishlist(request, body) {
  const user = await getAuthUser(request)
  if (!user) throw new Error('Unauthorized')
  
  const { product_id } = body
  
  const { data, error } = await supabase
    .from('wishlists')
    .insert({
      user_id: user.id,
      product_id
    })
    .select()
    .single()
  
  if (error) {
    if (error.code === '23505') {
      throw new Error('Product already in wishlist')
    }
    throw error
  }
  return data
}

async function handleRemoveFromWishlist(request, productId) {
  const user = await getAuthUser(request)
  if (!user) throw new Error('Unauthorized')
  
  const { error } = await supabase
    .from('wishlists')
    .delete()
    .eq('user_id', user.id)
    .eq('product_id', productId)
  
  if (error) throw error
  return { message: 'Item removed from wishlist' }
}

// ============ ORDER ENDPOINTS ============

async function handleGetOrders(request) {
  const user = await getAuthUser(request)
  if (!user) throw new Error('Unauthorized')
  
  const { data, error } = await supabase
    .from('orders')
    .select(\`
      *,
      items:order_items(*)
    \`)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

async function handleGetOrderById(request, orderId) {
  const user = await getAuthUser(request)
  if (!user) throw new Error('Unauthorized')
  
  const { data, error } = await supabase
    .from('orders')
    .select(\`
      *,
      items:order_items(*)
    \`)
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single()
  
  if (error) throw error
  return data
}

async function handleCreateOrder(request, body) {
  const user = await getAuthUser(request)
  if (!user) throw new Error('Unauthorized')
  
  const { shipping_address, billing_address, coupon_code } = body
  
  // Get cart items
  const { data: cartItems } = await supabase
    .from('cart_items')
    .select(\`
      *,
      product:products(*),
      variant:product_variants(*)
    \`)
    .eq('user_id', user.id)
  
  if (!cartItems || cartItems.length === 0) {
    throw new Error('Cart is empty')
  }
  
  // Calculate total
  let total = 0
  const orderItems = []
  
  for (const item of cartItems) {
    const price = item.product.discount_price || item.product.price
    const variantPrice = item.variant ? price + item.variant.price_modifier : price
    const subtotal = variantPrice * item.quantity
    
    total += subtotal
    
    orderItems.push({
      product_id: item.product_id,
      product_name: item.product.name,
      product_image: item.product.images?.[0]?.image_url,
      variant_details: item.variant,
      price: variantPrice,
      quantity: item.quantity,
      subtotal
    })
    
    // Check stock
    if (item.variant) {
      if (item.variant.stock < item.quantity) {
        throw new Error(\`Insufficient stock for \${item.product.name}\`)
      }
    } else {
      if (item.product.stock_quantity < item.quantity) {
        throw new Error(\`Insufficient stock for \${item.product.name}\`)
      }
    }
  }
  
  // Apply coupon if provided
  let discount = 0
  if (coupon_code) {
    const { data: coupon } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', coupon_code)
      .eq('active', true)
      .single()
    
    if (coupon) {
      if (total >= (coupon.min_order_amount || 0)) {
        if (coupon.discount_type === 'percent') {
          discount = (total * coupon.discount_value) / 100
          if (coupon.max_discount_amount) {
            discount = Math.min(discount, coupon.max_discount_amount)
          }
        } else {
          discount = coupon.discount_value
        }
        
        // Update coupon usage
        await supabase
          .from('coupons')
          .update({ used_count: coupon.used_count + 1 })
          .eq('id', coupon.id)
      }
    }
  }
  
  const finalTotal = total - discount
  
  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      status: 'pending',
      total_amount: finalTotal,
      payment_status: 'pending',
      shipping_address,
      billing_address: billing_address || shipping_address,
      coupon_code,
      discount_amount: discount
    })
    .select()
    .single()
  
  if (orderError) throw orderError
  
  // Create order items
  const itemsWithOrderId = orderItems.map(item => ({
    ...item,
    order_id: order.id
  }))
  
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(itemsWithOrderId)
  
  if (itemsError) throw itemsError
  
  // Create Razorpay order
  const razorpayOrder = createRazorpayOrder(
    finalTotal * 100, // Convert to paise
    'INR',
    order.id
  )
  
  if (razorpayOrder.success) {
    await supabase
      .from('orders')
      .update({ razorpay_order_id: razorpayOrder.orderId })
      .eq('id', order.id)
  }
  
  return {
    order,
    razorpay: razorpayOrder
  }
}

async function handleVerifyPayment(request, body) {
  const user = await getAuthUser(request)
  if (!user) throw new Error('Unauthorized')
  
  const { order_id, payment_id, signature } = body
  
  // Verify signature
  const isValid = verifyPaymentSignature(order_id, payment_id, signature)
  
  if (!isValid) {
    throw new Error('Invalid payment signature')
  }
  
  // Update order
  const { data, error } = await supabase
    .from('orders')
    .update({
      payment_status: 'paid',
      status: 'paid',
      razorpay_payment_id: payment_id,
      razorpay_signature: signature
    })
    .eq('razorpay_order_id', order_id)
    .eq('user_id', user.id)
    .select()
    .single()
  
  if (error) throw error
  
  // Deduct stock
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', data.id)
  
  for (const item of orderItems) {
    if (item.variant_details) {
      await supabase.rpc('decrement_variant_stock', {
        variant_id: item.variant_details.id,
        qty: item.quantity
      })
    } else {
      await supabase.rpc('decrement_product_stock', {
        product_id: item.product_id,
        qty: item.quantity
      })
    }
  }
  
  // Clear cart
  await supabase
    .from('cart_items')
    .delete()
    .eq('user_id', user.id)
  
  return data
}

// ============ REVIEW ENDPOINTS ============

async function handleCreateReview(request, body) {
  const user = await getAuthUser(request)
  if (!user) throw new Error('Unauthorized')
  
  const { product_id, rating, comment } = body
  
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      user_id: user.id,
      product_id,
      rating,
      comment
    })
    .select()
    .single()
  
  if (error) {
    if (error.code === '23505') {
      throw new Error('You have already reviewed this product')
    }
    throw error
  }
  return data
}

async function handleUpdateReview(request, reviewId, body) {
  const user = await getAuthUser(request)
  if (!user) throw new Error('Unauthorized')
  
  const { rating, comment } = body
  
  const { data, error } = await supabase
    .from('reviews')
    .update({ rating, comment })
    .eq('id', reviewId)
    .eq('user_id', user.id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

async function handleDeleteReview(request, reviewId) {
  const user = await getAuthUser(request)
  if (!user) throw new Error('Unauthorized')
  
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)
    .eq('user_id', user.id)
  
  if (error) throw error
  return { message: 'Review deleted' }
}

// ============ ADDRESS ENDPOINTS ============

async function handleGetAddresses(request) {
  const user = await getAuthUser(request)
  if (!user) throw new Error('Unauthorized')
  
  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })
  
  if (error) throw error
  return data
}

async function handleCreateAddress(request, body) {
  const user = await getAuthUser(request)
  if (!user) throw new Error('Unauthorized')
  
  const { data, error } = await supabase
    .from('addresses')
    .insert({
      user_id: user.id,
      ...body
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

async function handleUpdateAddress(request, addressId, body) {
  const user = await getAuthUser(request)
  if (!user) throw new Error('Unauthorized')
  
  const { data, error } = await supabase
    .from('addresses')
    .update(body)
    .eq('id', addressId)
    .eq('user_id', user.id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

async function handleDeleteAddress(request, addressId) {
  const user = await getAuthUser(request)
  if (!user) throw new Error('Unauthorized')
  
  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', addressId)
    .eq('user_id', user.id)
  
  if (error) throw error
  return { message: 'Address deleted' }
}

// ============ ADMIN ENDPOINTS ============

async function handleAdminGetProducts(request) {
  const user = await getAuthUser(request)
  if (!user || !(await isAdmin(user.id))) {
    throw new Error('Unauthorized')
  }
  
  const { data, error } = await supabase
    .from('products')
    .select(\`
      *,
      category:categories(name),
      images:product_images(*),
      variants:product_variants(*)
    \`)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

async function handleAdminCreateProduct(request, body) {
  const user = await getAuthUser(request)
  if (!user || !(await isAdmin(user.id))) {
    throw new Error('Unauthorized')
  }
  
  const { images, variants, ...productData } = body
  
  // Create product
  const { data: product, error: productError } = await supabase
    .from('products')
    .insert(productData)
    .select()
    .single()
  
  if (productError) throw productError
  
  // Add images
  if (images && images.length > 0) {
    const imageData = images.map((img, idx) => ({
      product_id: product.id,
      image_url: img,
      sort_order: idx + 1
    }))
    
    await supabase.from('product_images').insert(imageData)
  }
  
  // Add variants
  if (variants && variants.length > 0) {
    const variantData = variants.map(v => ({
      product_id: product.id,
      ...v
    }))
    
    await supabase.from('product_variants').insert(variantData)
  }
  
  return product
}

async function handleAdminUpdateProduct(request, productId, body) {
  const user = await getAuthUser(request)
  if (!user || !(await isAdmin(user.id))) {
    throw new Error('Unauthorized')
  }
  
  const { images, variants, ...productData } = body
  
  // Update product
  const { data, error } = await supabase
    .from('products')
    .update(productData)
    .eq('id', productId)
    .select()
    .single()
  
  if (error) throw error
  
  // Update images if provided
  if (images) {
    await supabase.from('product_images').delete().eq('product_id', productId)
    
    const imageData = images.map((img, idx) => ({
      product_id: productId,
      image_url: img,
      sort_order: idx + 1
    }))
    
    await supabase.from('product_images').insert(imageData)
  }
  
  return data
}

async function handleAdminDeleteProduct(request, productId) {
  const user = await getAuthUser(request)
  if (!user || !(await isAdmin(user.id))) {
    throw new Error('Unauthorized')
  }
  
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)
  
  if (error) throw error
  return { message: 'Product deleted' }
}

async function handleAdminGetOrders(request) {
  const user = await getAuthUser(request)
  if (!user || !(await isAdmin(user.id))) {
    throw new Error('Unauthorized')
  }
  
  const { data, error } = await supabase
    .from('orders')
    .select(\`
      *,
      user:profiles(full_name, email, phone),
      items:order_items(*)
    \`)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

async function handleAdminUpdateOrderStatus(request, orderId, body) {
  const user = await getAuthUser(request)
  if (!user || !(await isAdmin(user.id))) {
    throw new Error('Unauthorized')
  }
  
  const { status } = body
  
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

async function handleAdminGetStats(request) {
  const user = await getAuthUser(request)
  if (!user || !(await isAdmin(user.id))) {
    throw new Error('Unauthorized')
  }
  
  // Get total orders
  const { count: totalOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
  
  // Get total revenue
  const { data: orders } = await supabase
    .from('orders')
    .select('total_amount')
    .eq('payment_status', 'paid')
  
  const totalRevenue = orders?.reduce((sum, o) => sum + parseFloat(o.total_amount), 0) || 0
  
  // Get total products
  const { count: totalProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
  
  // Get total customers
  const { count: totalCustomers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'user')
  
  return {
    totalOrders,
    totalRevenue,
    totalProducts,
    totalCustomers
  }
}

// ============ COUPON ENDPOINTS ============

async function handleValidateCoupon(body) {
  const { code, total_amount } = body
  
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code)
    .eq('active', true)
    .single()
  
  if (error || !data) {
    throw new Error('Invalid coupon code')
  }
  
  if (data.expiry_date && new Date(data.expiry_date) < new Date()) {
    throw new Error('Coupon has expired')
  }
  
  if (data.usage_limit && data.used_count >= data.usage_limit) {
    throw new Error('Coupon usage limit reached')
  }
  
  if (total_amount < (data.min_order_amount || 0)) {
    throw new Error(\`Minimum order amount is ₹\${data.min_order_amount}\`)
  }
  
  let discount = 0
  if (data.discount_type === 'percent') {
    discount = (total_amount * data.discount_value) / 100
    if (data.max_discount_amount) {
      discount = Math.min(discount, data.max_discount_amount)
    }
  } else {
    discount = data.discount_value
  }
  
  return {
    valid: true,
    discount,
    coupon: data
  }
}

// ============ MAIN ROUTE HANDLER ============

export async function GET(request, context) {
  try {
    const { params } = context
    const path = params.path || []
    const { searchParams } = new URL(request.url)
    const searchParamsObj = Object.fromEntries(searchParams.entries())
    
    // Route matching
    if (path[0] === 'categories') {
      if (path[1]) {
        return NextResponse.json(await handleGetCategoryBySlug(path[1]))
      }
      return NextResponse.json(await handleGetCategories())
    }
    
    if (path[0] === 'products') {
      if (path[1] === 'slug' && path[2]) {
        return NextResponse.json(await handleGetProductBySlug(path[2]))
      }
      return NextResponse.json(await handleGetProducts(searchParamsObj))
    }
    
    if (path[0] === 'cart') {
      return NextResponse.json(await handleGetCart(request))
    }
    
    if (path[0] === 'wishlist') {
      return NextResponse.json(await handleGetWishlist(request))
    }
    
    if (path[0] === 'orders') {
      if (path[1]) {
        return NextResponse.json(await handleGetOrderById(request, path[1]))
      }
      return NextResponse.json(await handleGetOrders(request))
    }
    
    if (path[0] === 'profile') {
      return NextResponse.json(await handleGetProfile(request))
    }
    
    if (path[0] === 'addresses') {
      return NextResponse.json(await handleGetAddresses(request))
    }
    
    // Admin routes
    if (path[0] === 'admin') {
      if (path[1] === 'products') {
        return NextResponse.json(await handleAdminGetProducts(request))
      }
      if (path[1] === 'orders') {
        return NextResponse.json(await handleAdminGetOrders(request))
      }
      if (path[1] === 'stats') {
        return NextResponse.json(await handleAdminGetStats(request))
      }
    }
    
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request, context) {
  try {
    const { params } = context
    const path = params.path || []
    const body = await request.json()
    
    // Route matching
    if (path[0] === 'auth') {
      if (path[1] === 'signup') {
        return NextResponse.json(await handleSignUp(body))
      }
      if (path[1] === 'signin') {
        return NextResponse.json(await handleSignIn(body))
      }
      if (path[1] === 'signout') {
        return NextResponse.json(await handleSignOut(request))
      }
    }
    
    if (path[0] === 'cart') {
      return NextResponse.json(await handleAddToCart(request, body))
    }
    
    if (path[0] === 'wishlist') {
      return NextResponse.json(await handleAddToWishlist(request, body))
    }
    
    if (path[0] === 'orders') {
      if (path[1] === 'create') {
        return NextResponse.json(await handleCreateOrder(request, body))
      }
      if (path[1] === 'verify-payment') {
        return NextResponse.json(await handleVerifyPayment(request, body))
      }
    }
    
    if (path[0] === 'reviews') {
      return NextResponse.json(await handleCreateReview(request, body))
    }
    
    if (path[0] === 'addresses') {
      return NextResponse.json(await handleCreateAddress(request, body))
    }
    
    if (path[0] === 'coupons' && path[1] === 'validate') {
      return NextResponse.json(await handleValidateCoupon(body))
    }
    
    // Admin routes
    if (path[0] === 'admin') {
      if (path[1] === 'products') {
        return NextResponse.json(await handleAdminCreateProduct(request, body))
      }
    }
    
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request, context) {
  try {
    const { params } = context
    const path = params.path || []
    const body = await request.json()
    
    if (path[0] === 'profile') {
      return NextResponse.json(await handleUpdateProfile(request, body))
    }
    
    if (path[0] === 'cart' && path[1]) {
      return NextResponse.json(await handleUpdateCartItem(request, path[1], body))
    }
    
    if (path[0] === 'reviews' && path[1]) {
      return NextResponse.json(await handleUpdateReview(request, path[1], body))
    }
    
    if (path[0] === 'addresses' && path[1]) {
      return NextResponse.json(await handleUpdateAddress(request, path[1], body))
    }
    
    // Admin routes
    if (path[0] === 'admin') {
      if (path[1] === 'products' && path[2]) {
        return NextResponse.json(await handleAdminUpdateProduct(request, path[2], body))
      }
      if (path[1] === 'orders' && path[2]) {
        return NextResponse.json(await handleAdminUpdateOrderStatus(request, path[2], body))
      }
    }
    
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, context) {
  try {
    const { params } = context
    const path = params.path || []
    
    if (path[0] === 'cart') {
      if (path[1] === 'clear') {
        return NextResponse.json(await handleClearCart(request))
      }
      if (path[1]) {
        return NextResponse.json(await handleRemoveFromCart(request, path[1]))
      }
    }
    
    if (path[0] === 'wishlist' && path[1]) {
      return NextResponse.json(await handleRemoveFromWishlist(request, path[1]))
    }
    
    if (path[0] === 'reviews' && path[1]) {
      return NextResponse.json(await handleDeleteReview(request, path[1]))
    }
    
    if (path[0] === 'addresses' && path[1]) {
      return NextResponse.json(await handleDeleteAddress(request, path[1]))
    }
    
    // Admin routes
    if (path[0] === 'admin' && path[1] === 'products' && path[2]) {
      return NextResponse.json(await handleAdminDeleteProduct(request, path[2]))
    }
    
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
