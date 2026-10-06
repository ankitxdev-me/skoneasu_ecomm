import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { createRazorpayOrder, verifyPaymentSignature } from '@/lib/razorpay'

// Helper function to get user from session and a scoped client
async function getAuthUser(request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return { user: null, scopedSupabase: supabase }

  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error) return { user: null, scopedSupabase: supabase }

  // Create a scoped client with the user's access token to trigger RLS policies correctly
  const scopedSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }
  )

  return { user, scopedSupabase }
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

  // Create or Update profile (upsert matches on id)
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: authData.user.id,
      email,
      full_name,
      phone,
      role: 'user',
      updated_at: new Date().toISOString()
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
  const { user, scopedSupabase } = await getAuthUser(request)
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await scopedSupabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) throw error
  return data
}

async function handleUpdateProfile(request, body) {
  const { user, scopedSupabase } = await getAuthUser(request)
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await scopedSupabase
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
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

async function handleGetCategoryBySlug(slug) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', targetSlug)
    .single()

  if (error) throw error
  return data
}

// ============ PRODUCT ENDPOINTS ============

async function handleGetProducts(searchParams) {
  let selectQuery = `
    *,
    categories:product_categories(category:categories(id, name, slug)),
    images:product_images(id, image_url, sort_order),
    variants:product_variants(id, variant_type, variant_value, stock, price_modifier, attributes, variant_name),
    reviews:reviews(rating)
  `

  // Use !inner for category filtering to filter products by related category
  if (searchParams.category) {
    selectQuery = `
      *,
      categories:product_categories!inner(category:categories(id, name, slug), category_id),
      images:product_images(id, image_url, sort_order),
      variants:product_variants(id, variant_type, variant_value, stock, price_modifier, attributes, variant_name),
      reviews:reviews(rating)
    `
  }

  let query
  if (searchParams.search) {
    // If search is present, use the RPC function which returns ranked results
    query = supabase.rpc('search_products', { keyword: searchParams.search })

    // We need to re-select related data because RPC returns only products columns by default (unless defined otherwise)
    // Wait, RPC returns SETOF products. We can still join!
    // But Supabase JS client handles this by chaining select on the RPC result.
    query = query.select(selectQuery)
  } else {
    query = supabase
      .from('products')
      .select(selectQuery)
  }

  // Filters
  if (searchParams.category) {
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', searchParams.category)
      .single()

    if (category) {
      query = query.eq('categories.category_id', category.id)
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

  // Sorting
  if (searchParams.sort === 'price_asc') {
    query = query.order('price', { ascending: true })
  } else if (searchParams.sort === 'price_desc') {
    query = query.order('price', { ascending: false })
  } else if (searchParams.sort === 'newest') {
    query = query.order('created_at', { ascending: true })
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

  // Calculate ratings
  data.forEach(product => {
    if (product.reviews && product.reviews.length > 0) {
      const avg = product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      product.averageRating = parseFloat(avg.toFixed(1))
      product.reviewCount = product.reviews.length
    } else {
      product.averageRating = 0
      product.reviewCount = 0
    }
    // Remove heavy reviews array from list response to save bandwidth, 
    // or keep it if needed? Better to remove or keep only count/avg if client works that way.
    // But for now, client might not expect it removed if I used it, but I just added it.
    delete product.reviews
  })

  // Calculate Price Stats (Min/Max) for the current filtered scope
  let minPrice = 0
  let maxPrice = 1000000

  try {
    let statsQuery

    // 1. Base Query for Stats (Search vs Normal)
    if (searchParams.search) {
      statsQuery = supabase.rpc('search_products', { keyword: searchParams.search }).select('price')
    } else {
      statsQuery = supabase.from('products').select('price')
    }

    // 2. Apply Filters to Stats Query (Must match main query filters!)
    if (searchParams.category) {
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', searchParams.category)
        .single()

      if (category) {
        // If we are in "Normal" mode (no search), we need to join to filter by category.
        // If we are in "Search" mode (RPC), products are returned. We can still filter by category_id if the column exists in the output.
        // My RPC returns `SETOF products`, so it has `category_id` column if the table has it.
        // Wait, the products table might NOT have valid category_id if we use the junction table `product_categories`.
        // If the `products` table has a legacy `category_id`, we can use it.
        // But if we rely on `product_categories` junction table...
        // For RPC results: we can embedding is harder.
        // We can use !inner join in the select? 
        // `rpc(...).select('price, product_categories!inner(category_id)').eq('product_categories.category_id', ...)`

        // Let's try the robust way:
        statsQuery = statsQuery.select('price, product_categories!inner(category_id)')
        statsQuery = statsQuery.eq('product_categories.category_id', category.id)
      }
    } else if (!searchParams.search) {
      // If no search and no category, we don't need to join anything.
      // Just select('price') from products is enough.
      // (The code above initialized statsQuery with select('price'))
    }

    // Apply other filters (featured, etc.) to match what user sees
    if (searchParams.featured === 'true') statsQuery = statsQuery.eq('featured', true)
    if (searchParams.best_seller === 'true') statsQuery = statsQuery.eq('best_seller', true)
    if (searchParams.new_arrival === 'true') statsQuery = statsQuery.eq('new_arrival', true)

    // Note: We DO NOT apply min_price/max_price filters to the Stats Query!
    // The stats should show the range of *available* products in this category/search, 
    // NOT restricted by the slider itself (otherwise the slider range would shrink as you drag it!).

    const { data: prices, error: statsError } = await statsQuery

    if (statsError) {
      console.error('Stats query error:', statsError)
    }

    if (prices && prices.length > 0) {
      const priceValues = prices.map(p => p.price)
      minPrice = Math.min(...priceValues)
      maxPrice = Math.max(...priceValues)
    }
  } catch (err) {
    console.error('Error fetching price stats', err)
  }

  return {
    products: data,
    pagination: {
      page,
      limit,
      total: count
    },
    priceRange: {
      min: minPrice,
      max: maxPrice
    }
  }
}

async function handleGetProductBySlug(slug) {
  const slugAliases = {
    'zirconia-silver-necklace': 'zirconia-heart-silver-necklace',
    'classic-black-dial-watch': 'classic-mens-watch',
    'gold-plated-stacking-rings-set': 'elegant-ring-set',
    'natural-stone-beaded-bracelet': 'black-bead-bracelet'
  };
  const targetSlug = slugAliases[slug] || slug;
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories:product_categories(category:categories(id, name, slug)),
      images:product_images(id, image_url, sort_order),
      variants:product_variants(id, variant_type, variant_value, stock, price_modifier, attributes, variant_name),
      reviews:reviews(
        id,
        rating,
        comment,
        created_at,
        image_url,
        user:profiles(full_name)
      )
    `)
    .eq('slug', targetSlug)
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
  const { user, scopedSupabase } = await getAuthUser(request)
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await scopedSupabase
    .from('cart_items')
    .select(`
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
        stock,
        price_modifier,
        attributes,
        variant_name
      )
    `)
    .eq('user_id', user.id)

  if (error) throw error
  return data
}

async function handleAddToCart(request, body) {
  const { user, scopedSupabase } = await getAuthUser(request)
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
  const { user, scopedSupabase } = await getAuthUser(request)
  if (!user) throw new Error('Unauthorized')

  const { quantity } = body

  const { data, error } = await scopedSupabase
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
  const { user, scopedSupabase } = await getAuthUser(request)
  if (!user) throw new Error('Unauthorized')

  const { error } = await scopedSupabase
    .from('cart_items')
    .delete()
    .eq('id', itemId)
    .eq('user_id', user.id)

  if (error) throw error
  return { message: 'Item removed from cart' }
}

async function handleClearCart(request) {
  const { user, scopedSupabase } = await getAuthUser(request)
  if (!user) throw new Error('Unauthorized')

  const { error } = await scopedSupabase
    .from('cart_items')
    .delete()
    .eq('user_id', user.id)

  if (error) throw error
  return { message: 'Cart cleared' }
}

// ============ WISHLIST ENDPOINTS ============

async function handleGetWishlist(request) {
  const { user, scopedSupabase } = await getAuthUser(request)
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await scopedSupabase
    .from('wishlists')
    .select(`
      *,
      product:products(
        id,
        name,
        slug,
        price,
        discount_price,
        images:product_images(image_url)
      )
    `)
    .eq('user_id', user.id)

  if (error) throw error
  return data
}

async function handleAddToWishlist(request, body) {
  const { user, scopedSupabase } = await getAuthUser(request)
  if (!user) throw new Error('Unauthorized')

  const { product_id } = body

  const { data, error } = await scopedSupabase
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
  const { user, scopedSupabase } = await getAuthUser(request)
  if (!user) throw new Error('Unauthorized')

  const { error } = await scopedSupabase
    .from('wishlists')
    .delete()
    .eq('user_id', user.id)
    .eq('product_id', productId)

  if (error) throw error
  return { message: 'Item removed from wishlist' }
}

// ============ ORDER ENDPOINTS ============

async function handleGetOrders(request) {
  const { user, scopedSupabase } = await getAuthUser(request)
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await scopedSupabase
    .from('orders')
    .select(`
      *,
      items:order_items(
        *,
        product:products(
          id, name, slug, price, 
          images:product_images(image_url)
        ),
        variant:product_variants(*)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

async function handleGetOrderById(request, orderId) {
  const { user, scopedSupabase } = await getAuthUser(request)
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await scopedSupabase
    .from('orders')
    .select(`
      *,
      items:order_items(
        *,
        product:products(
          id, name, slug, price, 
          images:product_images(image_url)
        ),
        variant:product_variants(*)
      )
    `)
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single()

  if (error) throw error
  return data
}

async function handleCreateOrder(request, body) {
  const { user, scopedSupabase } = await getAuthUser(request)
  if (!user) throw new Error('Unauthorized')

  const { shipping_address, billing_address, coupon_code, payment_method } = body

  // Get cart items
  const { data: cartItems } = await scopedSupabase
    .from('cart_items')
    .select(`
      *,
      product:products(*),
      variant:product_variants(*)
    `)
    .eq('user_id', user.id)

  if (!cartItems || cartItems.length === 0) {
    throw new Error('Cart is empty')
  }

  // Calculate total and discount
  let total = 0
  let totalDiscount = 0
  const orderItems = []

  for (const item of cartItems) {
    const price = item.product.discount_price || item.product.price
    const originalPrice = item.product.price
    const discountAmount = (originalPrice - price) * item.quantity

    const variantPrice = item.variant ? price + item.variant.price_modifier : price
    const subtotal = variantPrice * item.quantity

    total += subtotal
    totalDiscount += discountAmount

    orderItems.push({
      product_id: item.product_id,
      variant_id: item.variant?.id,
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
        throw new Error(`Insufficient stock for ${item.product.name}`)
      }
    } else {
      if (item.product.stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${item.product.name}`)
      }
    }
  }

  // Fetch store settings
  const { data: settingsData } = await supabase
    .from('store_settings')
    .select('key, value')
    .in('key', ['shipping_fee', 'free_shipping_threshold', 'cod_enabled'])

  let shippingFee = 70
  let freeShippingThreshold = 999
  let codEnabled = true

  if (settingsData) {
    settingsData.forEach(item => {
      if (item.key === 'shipping_fee') shippingFee = Number(item.value)
      if (item.key === 'free_shipping_threshold') freeShippingThreshold = Number(item.value)
      if (item.key === 'cod_enabled') codEnabled = item.value === 'true' || item.value === true
    })
  }

  // Validate COD
  if (payment_method === 'cod' && !codEnabled) {
    return NextResponse.json(
      { error: 'Cash on Delivery is currently disabled' },
      { status: 400 }
    )
  }

  // Calculate shipping
  const shippingCost = total < freeShippingThreshold ? shippingFee : 0
  const subtotalBeforeShipping = total
  total += shippingCost

  // Calculate GST (12%)
  const taxAmount = Math.round(subtotalBeforeShipping * 0.12 * 100) / 100
  // "Give exact amount of discount" -> Discount equals tax
  const discountAmount = taxAmount

  // Apply coupon if provided
  let couponDiscount = 0
  if (coupon_code) {
    // 1. Fetch coupon details first for validation that doesn't require atomicity (amount check)
    const { data: couponPreview } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', coupon_code)
      .eq('active', true)
      .single()

    if (couponPreview) {
      // Check min order amount against SUBTOTAL (not total with shipping)
      if (subtotalBeforeShipping >= (couponPreview.min_order_amount || 0)) {

        // 2. Call RPC to atomically check limit/expiry and increment
        const { data: coupon, error: couponError } = await supabase
          .rpc('apply_coupon', { coupon_code })

        if (couponError) {
          throw new Error(couponError.message)
        }

        // 3. Calculate Discount
        if (coupon.discount_type === 'percent') {
          couponDiscount = (subtotalBeforeShipping * coupon.discount_value) / 100
          if (coupon.max_discount_amount) {
            couponDiscount = Math.min(couponDiscount, coupon.max_discount_amount)
          }
        } else {
          couponDiscount = coupon.discount_value
        }

        // Cap at subtotal
        couponDiscount = Math.min(couponDiscount, subtotalBeforeShipping)
      }
    }
  }

  const finalTotal = total - couponDiscount

  // Auto-save address if not exists
  if (shipping_address) {
    const { data: existingAddress } = await scopedSupabase
      .from('addresses')
      .select('id')
      .eq('user_id', user.id)
      .eq('address_line1', shipping_address.address_line1)
      .eq('postal_code', shipping_address.postal_code)
      .single()

    if (!existingAddress) {
      await scopedSupabase
        .from('addresses')
        .insert({
          user_id: user.id,
          full_name: shipping_address.full_name,
          phone: shipping_address.phone,
          address_line1: shipping_address.address_line1,
          address_line2: shipping_address.address_line2,
          city: shipping_address.city,
          state: shipping_address.state,
          postal_code: shipping_address.postal_code,
          country: shipping_address.country || 'India',
          is_default: false
        })
    }
  }

  // Create order
  const { data: order, error: orderError } = await scopedSupabase
    .from('orders')
    .insert({
      user_id: user.id,
      status: 'pending',
      total_amount: finalTotal,
      payment_status: payment_method === 'cod' ? 'pending' : 'pending',
      shipping_cost: shippingCost || 0,
      tax_amount: taxAmount || 0,
      discount: discountAmount + (couponDiscount || 0),
      payment_method: payment_method || 'online',
      shipping_address,
      billing_address: billing_address || shipping_address,
      coupon_code,
      notes: body.notes
    })
    .select()
    .single()

  if (orderError) throw orderError

  // Create order items
  const itemsWithOrderId = orderItems.map(item => ({
    ...item,
    order_id: order.id
  }))

  const { error: itemsError } = await scopedSupabase
    .from('order_items')
    .insert(itemsWithOrderId)

  if (itemsError) throw itemsError

  // If COD, finalize order immediately
  if (payment_method === 'cod') {
    // Deduct stock
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
    await scopedSupabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)

    return { order }
  }

  // Create Razorpay order
  const razorpayOrder = await createRazorpayOrder(
    finalTotal * 100, // Convert to paise
    'INR',
    order.id
  )

  if (razorpayOrder.success) {
    await scopedSupabase
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
  const { user, scopedSupabase } = await getAuthUser(request)
  if (!user) throw new Error('Unauthorized')

  const { order_id, payment_id, signature } = body

  // Verify signature
  const isValid = verifyPaymentSignature(order_id, payment_id, signature)

  if (!isValid) {
    throw new Error('Invalid payment signature')
  }

  // Update order
  const { data, error } = await scopedSupabase
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
  const { data: orderItems } = await scopedSupabase
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
  await scopedSupabase
    .from('cart_items')
    .delete()
    .eq('user_id', user.id)

  return data
}

// ============ REVIEW ENDPOINTS ============

async function handleGetPinnedReviews() {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      user:profiles(full_name, avatar_url),
      product:products(name, slug, images:product_images(image_url))
    `)
    .eq('is_pinned', true)
    .limit(12)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

async function handleCreateReview(request, body) {
  const { user, scopedSupabase } = await getAuthUser(request)
  if (!user) throw new Error('Unauthorized')

  const { product_id, rating, comment } = body

  const { data, error } = await scopedSupabase
    .from('reviews')
    .insert({
      user_id: user.id,
      product_id,
      rating,
      product_id,
      rating,
      comment,
      image_url: body.image_url
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
  const { user, scopedSupabase } = await getAuthUser(request)
  if (!user) throw new Error('Unauthorized')

  const { rating, comment } = body

  const { data, error } = await scopedSupabase
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
  const { user, scopedSupabase } = await getAuthUser(request)
  if (!user) throw new Error('Unauthorized')

  const { error } = await scopedSupabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)
    .eq('user_id', user.id)

  if (error) throw error
  return { message: 'Review deleted' }
}

async function handleAdminGetReviews(request) {
  const { user, scopedSupabase } = await getAuthUser(request)
  if (!user || !(await isAdmin(user.id))) throw new Error('Unauthorized')

  const { data, error } = await scopedSupabase
    .from('reviews')
    .select(`
      *,
      user:profiles(full_name, email),
      product:products(name, slug)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

async function handleAdminDeleteReview(request, reviewId) {
  const { user, scopedSupabase } = await getAuthUser(request)
  if (!user || !(await isAdmin(user.id))) throw new Error('Unauthorized')

  const { error } = await scopedSupabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)

  if (error) throw error
  return { message: 'Review deleted' }
}

async function handleAdminTogglePinReview(request, reviewId) {
  const { user, scopedSupabase } = await getAuthUser(request)
  if (!user || !(await isAdmin(user.id))) throw new Error('Unauthorized')

  // Check current state
  const { data: review } = await scopedSupabase
    .from('reviews')
    .select('is_pinned')
    .eq('id', reviewId)
    .single()

  const newState = !review.is_pinned

  if (newState) {
    // Check limit
    const { count } = await scopedSupabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('is_pinned', true)

    if (count >= 3) {
      throw new Error('Maximum 3 reviews can be pinned')
    }
  }

  const { data, error } = await scopedSupabase
    .from('reviews')
    .update({ is_pinned: newState })
    .eq('id', reviewId)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============ ADDRESS ENDPOINTS ============

async function handleGetAddresses(request) {
  const { user, scopedSupabase } = await getAuthUser(request)
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await scopedSupabase
    .from('addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false })

  if (error) throw error
  return data
}

async function handleCreateAddress(request, body) {
  const { user, scopedSupabase } = await getAuthUser(request)
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await scopedSupabase
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
  const { user, scopedSupabase } = await getAuthUser(request)
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await scopedSupabase
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
  const { user, scopedSupabase } = await getAuthUser(request)
  if (!user) throw new Error('Unauthorized')

  const { error } = await scopedSupabase
    .from('addresses')
    .delete()
    .eq('id', addressId)
    .eq('user_id', user.id)

  if (error) throw error
  return { message: 'Address deleted' }
}

// ============ ADMIN ENDPOINTS ============

async function handleAdminGetProducts(request) {
  const { user, scopedSupabase } = await getAuthUser(request)
  if (!user || !(await isAdmin(user.id))) {
    throw new Error('Unauthorized')
  }

  const { data, error } = await scopedSupabase
    .from('products')
    .select(`
      *,
      categories:product_categories(category:categories(name)),
      images:product_images(*),
      variants:product_variants(*)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

async function handleAdminCreateProduct(request, body) {
  const { user, scopedSupabase } = await getAuthUser(request)
  if (!user || !(await isAdmin(user.id))) {
    throw new Error('Unauthorized')
  }

  const { images, variants, category_ids, ...productData } = body

  // Generate slug
  const slug = productData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')

  // Create product
  const { data: product, error: productError } = await scopedSupabase
    .from('products')
    .insert({
      ...productData,
      slug
    })
    .select()
    .single()

  if (productError) throw productError

  // Add categories
  if (category_ids && category_ids.length > 0) {
    const categoryData = category_ids.map(catId => ({
      product_id: product.id,
      category_id: catId
    }))

    await scopedSupabase.from('product_categories').insert(categoryData)
  }

  // Add images
  if (images && images.length > 0) {
    const imageData = images.map((img, idx) => ({
      product_id: product.id,
      image_url: img,
      sort_order: idx + 1
    }))

    await scopedSupabase.from('product_images').insert(imageData)
  }

  // Add variants
  if (variants && variants.length > 0) {
    const variantData = variants.map(v => ({
      product_id: product.id,
      variant_type: v.variant_type || 'Combination',
      variant_value: v.variant_value || v.variant_name || 'Default',
      price_modifier: v.price_modifier || 0,
      stock: v.stock || 0,
      attributes: v.attributes || {},
      variant_name: v.variant_name
    }))

    const { error: variantError } = await scopedSupabase.from('product_variants').insert(variantData)
    if (variantError) throw variantError
  }

  return product
}

async function handleAdminUpdateProduct(request, productId, body) {
  const { user, scopedSupabase } = await getAuthUser(request)
  if (!user || !(await isAdmin(user.id))) {
    throw new Error('Unauthorized')
  }

  const { images, variants, category_ids, ...productData } = body

  // Update product
  const { data, error } = await scopedSupabase
    .from('products')
    .update(productData)
    .eq('id', productId)
    .select()
    .single()

  if (error) throw error

  // Update categories if provided
  if (category_ids) {
    // Remove existing
    await scopedSupabase.from('product_categories').delete().eq('product_id', productId)

    // Add new
    if (category_ids.length > 0) {
      const categoryData = category_ids.map(catId => ({
        product_id: productId,
        category_id: catId
      }))

      await scopedSupabase.from('product_categories').insert(categoryData)
    }
  }

  // Update images if provided
  if (images) {
    await scopedSupabase.from('product_images').delete().eq('product_id', productId)

    const imageData = images.map((img, idx) => ({
      product_id: productId,
      image_url: img,
      sort_order: idx + 1
    }))

    await scopedSupabase.from('product_images').insert(imageData)
  }

  // Update variants if provided
  if (variants) {
    // For simplicity, remove existing and add new
    await scopedSupabase.from('product_variants').delete().eq('product_id', productId)

    if (variants.length > 0) {
      const variantData = variants.map(v => ({
        product_id: productId,
        variant_type: v.variant_type || 'Combination',
        variant_value: v.variant_value || v.variant_name || 'Default',
        price_modifier: v.price_modifier || 0,
        stock: v.stock || 0,
        attributes: v.attributes || {},
        variant_name: v.variant_name
      }))

      const { error: variantError } = await scopedSupabase.from('product_variants').insert(variantData)
      if (variantError) throw variantError
    }
  }

  return data
}

async function handleAdminDeleteProduct(request, productId) {
  const { user, scopedSupabase } = await getAuthUser(request)
  if (!user || !(await isAdmin(user.id))) {
    throw new Error('Unauthorized')
  }

  const { error } = await scopedSupabase
    .from('products')
    .delete()
    .eq('id', productId)

  if (error) throw error
  return { message: 'Product deleted' }
}

async function handleAdminGetOrders(request) {
  const { user, scopedSupabase } = await getAuthUser(request)
  if (!user || !(await isAdmin(user.id))) {
    throw new Error('Unauthorized')
  }

  const { data, error } = await scopedSupabase
    .from('orders')
    .select(`
      *,
      user:profiles(full_name, email, phone),
      items:order_items(
        *,
        product:products(
          id, name, slug, price, 
          images:product_images(image_url)
        ),
        variant:product_variants(*)
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

async function handleAdminUpdateOrderStatus(request, orderId, body) {
  const { user, scopedSupabase } = await getAuthUser(request)
  if (!user || !(await isAdmin(user.id))) {
    throw new Error('Unauthorized')
  }

  const { status, payment_status } = body

  const updates = {}
  if (status) updates.status = status
  if (payment_status) updates.payment_status = payment_status

  const { data, error } = await scopedSupabase
    .from('orders')
    .update(updates)
    .eq('id', orderId)
    .select()
    .single()

  if (error) throw error
  return data
}

async function handleAdminGetStats(request) {
  const { user, scopedSupabase } = await getAuthUser(request)
  if (!user || !(await isAdmin(user.id))) {
    throw new Error('Unauthorized')
  }

  const { searchParams } = new URL(request.url)
  const range = searchParams.get('range') || '30d'

  // Calculate start date based on range
  let startDate = new Date()
  if (range === '30d') {
    startDate.setDate(startDate.getDate() - 30)
  } else if (range === '6m') {
    startDate.setMonth(startDate.getMonth() - 6)
  } else if (range === 'all') {
    startDate = new Date(0) // Beginning of time
  } else {
    // Default to 30d if invalid
    startDate.setDate(startDate.getDate() - 30)
  }

  // Get total orders (lifetime)
  const { count: orderCount } = await scopedSupabase
    .from('orders')
    .select('*', { count: 'exact', head: true })

  // Get total revenue (lifetime)
  const { data: allPaidOrders } = await scopedSupabase
    .from('orders')
    .select('total_amount')
    .neq('status', 'cancelled')
  // Removed .eq('payment_status', 'paid') to include COD/Pending orders as "Sales"

  const totalRevenue = allPaidOrders?.reduce((sum, o) => sum + parseFloat(o.total_amount), 0) || 0

  // Get orders for sales trend (filtered by range)
  const { data: rangeOrders } = await scopedSupabase
    .from('orders')
    .select('total_amount, created_at')
    .neq('status', 'cancelled')
    // Removed .eq('payment_status', 'paid') here too
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true })

  // Aggregate sales by date
  const salesMap = {}

  // Initialize map with 0 for all days in range if 30d (optional, but good for charts)
  // For 6m/all, it might be too many points to fill zeros, so we might just show days with sales or aggregate by month.
  // For simplicity and "Sales vs Day" request, let's aggregate by day.

  if (range === '30d') {
    for (let i = 0; i < 30; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      salesMap[dateStr] = 0
    }
  }

  rangeOrders?.forEach(order => {
    const dateStr = new Date(order.created_at).toISOString().split('T')[0]
    salesMap[dateStr] = (salesMap[dateStr] || 0) + parseFloat(order.total_amount)
  })

  // Convert to array
  const salesTrend = Object.entries(salesMap)
    .map(([date, sales]) => ({ date, sales }))
    .sort((a, b) => a.date.localeCompare(b.date))

  // Get total products
  const { count: productCount } = await scopedSupabase
    .from('products')
    .select('*', { count: 'exact', head: true })

  // Get total customers
  const { count: customerCount } = await scopedSupabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'user')

  return {
    orderCount,
    totalRevenue,
    productCount,
    customerCount,
    salesTrend
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
    throw new Error(`Minimum order amount is ₹\${data.min_order_amount}`)
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

// ============ SUPPORT ENDPOINTS ============

async function handleGetSupportTickets(request) {
  const user = await getAuthUser(request)
  if (!user) throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

async function handleGetSupportTicketDetails(request, ticketId) {
  const user = await getAuthUser(request)
  if (!user) throw new Error('Unauthorized')

  // Fetch ticket
  const { data: ticket, error: ticketError } = await supabase
    .from('support_tickets')
    .select('*')
    .eq('id', ticketId)
    .eq('user_id', user.id)
    .single()

  if (ticketError) throw ticketError

  // Fetch messages
  const { data: messages, error: messagesError } = await supabase
    .from('support_messages')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true })

  if (messagesError) throw messagesError

  return {
    ...ticket,
    messages
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

    if (path[0] === 'reviews') {
      if (path[1] === 'pinned') return NextResponse.json(await handleGetPinnedReviews())
    }

    if (path[0] === 'settings' && path[1] === 'social') {
      return NextResponse.json(await handleGetSocialSettings())
    }

    if (path[0] === 'support') {
      if (path[1]) {
        return NextResponse.json(await handleGetSupportTicketDetails(request, path[1]))
      }
      return NextResponse.json(await handleGetSupportTickets(request))
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
      if (path[1] === 'customers') {
        return NextResponse.json(await handleAdminGetCustomers(request))
      }
      if (path[1] === 'coupons') {
        return NextResponse.json(await handleAdminGetCoupons(request))
      }
      if (path[1] === 'support') {
        if (path[2]) {
          return NextResponse.json(await handleAdminGetSupportTicketDetails(request, path[2]))
        }
        return NextResponse.json(await handleAdminGetSupportTickets(request))
      }
      if (path[1] === 'reviews') {
        return NextResponse.json(await handleAdminGetReviews(request))
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




async function handleAdminCreateCategory(request, body) {
  const { user, scopedSupabase } = await getAuthUser(request)
  if (!user || !(await isAdmin(user.id))) throw new Error('Unauthorized')

  const { name, description, image_url, is_main } = body
  const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')

  const { data, error } = await scopedSupabase
    .from('categories')
    .insert({ name, slug, description, image_url, is_main: is_main || false })
    .select()
    .single()

  if (error) throw error
  return data
}

async function handleAdminUpdateCategory(request, categoryId, body) {
  const { user, scopedSupabase } = await getAuthUser(request)
  if (!user || !(await isAdmin(user.id))) throw new Error('Unauthorized')

  const allowedFields = ['name', 'slug', 'description', 'image_url', 'is_main']
  const updateData = {}
  for (const key of allowedFields) {
    if (key in body) updateData[key] = body[key]
  }

  // Enforce maximum 4 main categories
  if (updateData.is_main === true) {
    const { count } = await scopedSupabase
      .from('categories')
      .select('id', { count: 'exact', head: true })
      .eq('is_main', true)
      .neq('id', categoryId)

    if (count >= 4) {
      throw new Error('Only 4 categories can be marked as Main for the navbar. Please unmark another category first.')
    }
  }

  const { data, error } = await scopedSupabase
    .from('categories')
    .update(updateData)
    .eq('id', categoryId)
    .select()
    .single()

  if (error) throw error
  return data
}

async function handleAdminDeleteCategory(request, categoryId) {
  const { user, scopedSupabase } = await getAuthUser(request)
  if (!user || !(await isAdmin(user.id))) throw new Error('Unauthorized')

  const { error } = await scopedSupabase
    .from('categories')
    .delete()
    .eq('id', categoryId)

  if (error) throw error
  return { message: 'Category deleted' }
}

async function handleAdminGetCustomers(request) {
  const { user, scopedSupabase } = await getAuthUser(request)
  if (!user || !(await isAdmin(user.id))) throw new Error('Unauthorized')

  const { data, error } = await scopedSupabase
    .from('profiles')
    .select('id, full_name, email, phone, role, created_at, avatar_url')
    .eq('role', 'user')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

async function handleAdminGetCoupons(request) {
  const { user, scopedSupabase } = await getAuthUser(request)
  if (!user || !(await isAdmin(user.id))) throw new Error('Unauthorized')

  const { data, error } = await scopedSupabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}



async function handleAdminGetSupportTickets(request) {
  const { user, scopedSupabase } = await getAuthUser(request)
  if (!user || !(await isAdmin(user.id))) throw new Error('Unauthorized')

  // Use RPC to bypass RLS issues - scoped client should work better now
  const { data, error } = await scopedSupabase.rpc('get_all_support_tickets_admin')

  if (error) throw error

  // Map to match expected frontend structure (nested user object)
  return data.map(t => ({
    ...t,
    user: {
      full_name: t.user_full_name,
      email: t.user_email
    }
  }))
}

async function handleAdminGetSupportTicketDetails(request, ticketId) {
  const { user, scopedSupabase } = await getAuthUser(request)
  if (!user || !(await isAdmin(user.id))) throw new Error('Unauthorized')

  const { data, error } = await scopedSupabase.rpc('get_support_ticket_details_admin', { p_ticket_id: ticketId })

  if (error) throw error
  return data
}

async function handleAdminCreateCoupon(request, body) {
  const { user, scopedSupabase } = await getAuthUser(request)
  if (!user || !(await isAdmin(user.id))) throw new Error('Unauthorized')

  const {
    code,
    discount_type,
    discount_value,
    min_order_amount,
    max_discount_amount,
    expiry_date,
    usage_limit
  } = body

  const { data, error } = await scopedSupabase
    .from('coupons')
    .insert({
      code: code.toUpperCase(),
      discount_type,
      discount_value,
      min_order_amount,
      max_discount_amount,
      expiry_date,
      usage_limit,
      active: true,
      used_count: 0
    })
    .select()
    .single()

  if (error) throw error
  return data
}

async function handleAdminDeleteCoupon(request, couponId) {
  const { user, scopedSupabase } = await getAuthUser(request)
  if (!user || !(await isAdmin(user.id))) throw new Error('Unauthorized')

  const { error } = await scopedSupabase
    .from('coupons')
    .delete()
    .eq('id', couponId)

  if (error) throw error
  return { message: 'Coupon deleted' }
}

// ... (previous code)

async function handleRequestCancellation(request, orderId, body) {
  const { user, scopedSupabase } = await getAuthUser(request)
  if (!user) throw new Error('Unauthorized')
  const { reason } = body

  const { data: order } = await scopedSupabase.from('orders').select('id, user_id').eq('id', orderId).single()
  if (!order || order.user_id !== user.id) throw new Error('Order not found')

  const { data, error } = await scopedSupabase.from('orders')
    .update({ cancellation_status: 'requested', cancellation_reason: reason })
    .eq('id', orderId)
    .select().single()

  if (error) throw error
  return data
}

async function handleRequestAddressChange(request, orderId, body) {
  const { user, scopedSupabase } = await getAuthUser(request)
  if (!user) throw new Error('Unauthorized')
  const { new_address } = body

  const { data: order } = await scopedSupabase.from('orders').select('id, user_id').eq('id', orderId).single()
  if (!order || order.user_id !== user.id) throw new Error('Order not found')

  const { data, error } = await scopedSupabase.from('orders')
    .update({ address_change_status: 'requested', new_shipping_address: new_address })
    .eq('id', orderId)
    .select().single()

  if (error) throw error
  return data
}



// ...

async function handleAdminReplyTicket(request, ticketId, body) {
  const { user, scopedSupabase } = await getAuthUser(request)
  if (!user || !(await isAdmin(user.id))) throw new Error('Unauthorized')

  const { message, attachments, status } = body

  // Use RPC to bypass RLS (Robust against missing Service Role Key)
  // If message provided, use the reply RPC
  if (message || (attachments && attachments.length > 0)) {
    const { error } = await scopedSupabase.rpc('admin_reply_to_ticket', {
      p_ticket_id: ticketId,
      p_sender_id: user.id,
      p_message: message || '',
      p_attachments: attachments || [],
      p_status: status || 'in_progress'
    })
    if (error) throw error
  } else if (status) {
    // Just status update
    const { error } = await scopedSupabase.rpc('admin_update_ticket_status', {
      p_ticket_id: ticketId,
      p_status: status
    })
    if (error) throw error
  }

  return { success: true }
}

async function handleAdminCancellation(request, orderId, body) {
  const { user, scopedSupabase } = await getAuthUser(request)
  if (!user || !(await isAdmin(user.id))) throw new Error('Unauthorized')
  const { status } = body

  let updateData = { cancellation_status: status }
  if (status === 'approved') {
    updateData.status = 'cancelled'
  }

  const { data, error } = await scopedSupabase.from('orders').update(updateData).eq('id', orderId).select().single()
  if (error) throw error
  return data
}

async function handleAdminAddressChange(request, orderId, body) {
  const { user, scopedSupabase } = await getAuthUser(request)
  if (!user || !(await isAdmin(user.id))) throw new Error('Unauthorized')
  const { status } = body

  let updateData = { address_change_status: status }
  if (status === 'approved') {
    const { data: order } = await scopedSupabase.from('orders').select('new_shipping_address').eq('id', orderId).single()
    if (order && order.new_shipping_address) {
      updateData.shipping_address = order.new_shipping_address
    }
  }

  const { data, error } = await scopedSupabase.from('orders').update(updateData).eq('id', orderId).select().single()
  if (error) throw error
  return data
}

export async function POST(request, context) {
  try {
    const { params } = context
    const path = params.path || []
    const body = await request.json()

    // Route matching
    if (path[0] === 'auth') {
      if (path[1] === 'signup') return NextResponse.json(await handleSignUp(body))
      if (path[1] === 'signin') return NextResponse.json(await handleSignIn(body))
      if (path[1] === 'signout') return NextResponse.json(await handleSignOut(request))
    }

    if (path[0] === 'cart') return NextResponse.json(await handleAddToCart(request, body))
    if (path[0] === 'wishlist') return NextResponse.json(await handleAddToWishlist(request, body))

    if (path[0] === 'orders') {
      if (path[1] === 'create') return NextResponse.json(await handleCreateOrder(request, body))
      if (path[1] === 'verify-payment') return NextResponse.json(await handleVerifyPayment(request, body))

      // Request handlers
      if (path[2] === 'cancel') return NextResponse.json(await handleRequestCancellation(request, path[1], body))
      if (path[2] === 'address-change') return NextResponse.json(await handleRequestAddressChange(request, path[1], body))
    }

    if (path[0] === 'reviews') {
      if (path[1] === 'pinned') return NextResponse.json(await handleGetPinnedReviews())
      return NextResponse.json(await handleCreateReview(request, body))
    }
    if (path[0] === 'addresses') return NextResponse.json(await handleCreateAddress(request, body))
    if (path[0] === 'coupons' && path[1] === 'validate') return NextResponse.json(await handleValidateCoupon(body))

    // Admin routes
    if (path[0] === 'admin') {
      if (path[1] === 'products') return NextResponse.json(await handleAdminCreateProduct(request, body))
      if (path[1] === 'categories') return NextResponse.json(await handleAdminCreateCategory(request, body))
      if (path[1] === 'coupons') return NextResponse.json(await handleAdminCreateCoupon(request, body))
      if (path[1] === 'support' && path[2]) {
        if (path[3] === 'reply') return NextResponse.json(await handleAdminReplyTicket(request, path[2], body))
        if (path[3] === 'status') return NextResponse.json(await handleAdminReplyTicket(request, path[2], { status: body.status }))
      }
      if (path[1] === 'reviews') {
        if (path[3] === 'pin') return NextResponse.json(await handleAdminTogglePinReview(request, path[2]))
        return NextResponse.json(await handleAdminGetReviews(request))
      }
    }

    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request, context) {
  try {
    const { params } = context
    const path = params.path || []
    const body = await request.json()

    if (path[0] === 'profile') return NextResponse.json(await handleUpdateProfile(request, body))
    if (path[0] === 'cart' && path[1]) return NextResponse.json(await handleUpdateCartItem(request, path[1], body))
    if (path[0] === 'reviews' && path[1]) return NextResponse.json(await handleUpdateReview(request, path[1], body))
    if (path[0] === 'addresses' && path[1]) return NextResponse.json(await handleUpdateAddress(request, path[1], body))

    // Admin routes
    if (path[0] === 'admin') {
      if (path[1] === 'settings' && path[2] === 'social') return NextResponse.json(await handleAdminUpdateSocialSettings(request, body))
      if (path[1] === 'products' && path[2]) return NextResponse.json(await handleAdminUpdateProduct(request, path[2], body))
      if (path[1] === 'categories' && path[2]) return NextResponse.json(await handleAdminUpdateCategory(request, path[2], body))
      if (path[3] === 'address-change') return NextResponse.json(await handleAdminAddressChange(request, path[2], body))
      return NextResponse.json(await handleAdminUpdateOrderStatus(request, path[2], body))
    }
    if (path[1] === 'reviews' && path[2]) return NextResponse.json(await handleAdminDeleteReview(request, path[2]))
    return NextResponse.json({ error: 'Not found' }, { status: 404 })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
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
    if (path[0] === 'admin') {
      if (path[1] === 'products' && path[2]) {
        return NextResponse.json(await handleAdminDeleteProduct(request, path[2]))
      }
      if (path[1] === 'categories' && path[2]) {
        return NextResponse.json(await handleAdminDeleteCategory(request, path[2]))
      }
      if (path[1] === 'coupons' && path[2]) {
        return NextResponse.json(await handleAdminDeleteCoupon(request, path[2]))
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


async function handleGetSocialSettings() {
  const { data, error } = await supabase
    .from('store_settings')
    .select('value')
    .eq('key', 'social_links')
    .maybeSingle()

  const defaults = {
    instagram: 'https://www.instagram.com/the.skoneasu?igsh=YjBqcHRmdzJscnp0',
    facebook: 'https://facebook.com',
    twitter: 'https://twitter.com',
    pinterest: 'https://pinterest.com',
    youtube: 'https://youtube.com'
  }

  if (error || !data || !data.value) {
    return defaults
  }

  try {
    const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value
    return { ...defaults, ...parsed }
  } catch (e) {
    return defaults
  }
}

async function handleAdminUpdateSocialSettings(request, body) {
  const { user, scopedSupabase } = await getAuthUser(request)
  if (!user || !(await isAdmin(user.id))) throw new Error('Unauthorized')

  const valString = typeof body === 'string' ? body : JSON.stringify(body)
  const { data, error } = await scopedSupabase
    .from('store_settings')
    .upsert({
      key: 'social_links',
      value: valString,
      description: 'Store social media platform links',
      updated_at: new Date().toISOString()
    }, { onConflict: 'key' })
    .select()
    .single()

  if (error) throw error
  return { success: true, settings: body }
}
