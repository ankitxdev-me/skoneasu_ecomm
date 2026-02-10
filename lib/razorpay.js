import Razorpay from 'razorpay'
import crypto from 'crypto'

export async function createRazorpayOrder(amount, currency = 'INR', receipt) {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId || !keySecret) {
    console.error('Razorpay keys missing')
    return {
      success: false,
      message: 'Razorpay keys not configured. Payment gateway is currently inactive.'
    }
  }

  try {
    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })

    const options = {
      amount: Math.round(amount), // amount in the smallest currency unit
      currency,
      receipt,
    }

    const order = await instance.orders.create(options)

    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      raw: order
    }
  } catch (error) {
    console.error('Razorpay Order Creation Failed:', error)
    return {
      success: false,
      message: error.message || 'Failed to create Razorpay order'
    }
  }
}

export function verifyPaymentSignature(orderId, paymentId, signature) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keySecret) {
    console.error('Razorpay secret missing for verification')
    return false
  }

  const generatedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(orderId + '|' + paymentId)
    .digest('hex')

  if (generatedSignature !== signature) {
    console.log('--- Signature Mismatch ---')
    console.log('Key Secret Exists?', !!keySecret)
    console.log('Order ID:', orderId)
    console.log('Payment ID:', paymentId)
    console.log('Provided Sig:', signature)
    console.log('Generated Sig:', generatedSignature)
  }

  return generatedSignature === signature
}

export const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}
