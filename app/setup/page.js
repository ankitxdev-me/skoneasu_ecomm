'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, AlertCircle, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function SetupPage() {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const setupSteps = [
    {
      title: 'Complete Supabase Anon Key',
      status: 'required',
      description: 'The NEXT_PUBLIC_SUPABASE_ANON_KEY is incomplete',
      action: 'Update /app/.env with complete key from Supabase dashboard',
      code: 'NEXT_PUBLIC_SUPABASE_ANON_KEY=your_complete_key_here'
    },
    {
      title: 'Execute Database Schema',
      status: 'required',
      description: 'Run the provided SQL in Supabase SQL Editor',
      action: 'Execute main schema + demo products SQL'
    },
    {
      title: 'Add Razorpay Keys',
      status: 'optional',
      description: 'Payment gateway ready but needs API keys',
      action: 'Add when ready to enable payments',
      code: 'RAZORPAY_KEY_ID=\nRAZORPAY_KEY_SECRET='
    },
    {
      title: 'Email Service',
      status: 'optional',
      description: 'Configure later for order notifications',
      action: 'Add Resend or SendGrid API key when needed'
    }
  ]

  const features = {
    implemented: [
      'User Authentication System',
      'Product Catalog with Categories',
      'Shopping Cart & Wishlist',
      'Checkout Flow',
      'Order Management',
      'User Dashboard',
      'Admin Dashboard',
      'Product Reviews',
      'Coupon System',
      'Address Management',
      'Mobile Responsive Design',
      'Premium Luxury UI'
    ],
    pending: [
      'Complete Supabase connection',
      'Database schema execution',
      'Razorpay payment integration',
      'Email notifications'
    ]
  }

  return (
    <div className=\"min-h-screen bg-neutral-50 py-12 px-4\">
      <div className=\"max-w-5xl mx-auto\">
        {/* Header */}
        <div className=\"text-center mb-12\">
          <h1 className=\"text-4xl font-serif font-bold text-neutral-900 mb-4\">
            🎉 LUXE JEWELS Platform
          </h1>
          <p className=\"text-xl text-neutral-600\">
            MVP Build Complete - Setup Required
          </p>
        </div>

        {/* Status Alert */}
        <Alert className=\"mb-8 border-amber-200 bg-amber-50\">
          <AlertCircle className=\"h-5 w-5 text-amber-600\" />
          <AlertDescription className=\"text-amber-900\">
            <strong>Action Required:</strong> Complete the setup steps below to activate all features
          </AlertDescription>
        </Alert>

        {/* Setup Steps */}
        <Card className=\"mb-8\">
          <CardHeader>
            <CardTitle>Setup Checklist</CardTitle>
            <CardDescription>Follow these steps to complete the installation</CardDescription>
          </CardHeader>
          <CardContent className=\"space-y-6\">
            {setupSteps.map((step, idx) => (
              <div key={idx} className=\"border-l-4 border-neutral-200 pl-4\">
                <div className=\"flex items-start gap-3 mb-2\">
                  {step.status === 'required' ? (
                    <XCircle className=\"h-5 w-5 text-red-500 mt-0.5\" />
                  ) : (
                    <AlertCircle className=\"h-5 w-5 text-amber-500 mt-0.5\" />
                  )}
                  <div className=\"flex-1\">
                    <h3 className=\"font-semibold text-neutral-900 mb-1\">
                      {step.title}
                      <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                        step.status === 'required' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {step.status.toUpperCase()}
                      </span>
                    </h3>
                    <p className=\"text-sm text-neutral-600 mb-2\">{step.description}</p>
                    <p className=\"text-sm font-medium text-neutral-900\">{step.action}</p>
                    {step.code && (
                      <div className=\"mt-2 bg-neutral-900 text-neutral-100 p-3 rounded text-xs font-mono relative\">
                        <pre className=\"whitespace-pre-wrap\">{step.code}</pre>
                        <Button
                          size=\"sm\"
                          variant=\"ghost\"
                          className=\"absolute top-2 right-2 h-6 px-2 text-neutral-400 hover:text-neutral-100\"
                          onClick={() => copyToClipboard(step.code)}
                        >
                          {copied ? <Check className=\"h-3 w-3\" /> : <Copy className=\"h-3 w-3\" />}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Features */}
        <div className=\"grid md:grid-cols-2 gap-6 mb-8\">
          <Card>
            <CardHeader>
              <CardTitle className=\"text-green-700\">✅ Implemented Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className=\"space-y-2\">
                {features.implemented.map((feature, idx) => (
                  <li key={idx} className=\"flex items-center gap-2 text-sm\">
                    <CheckCircle2 className=\"h-4 w-4 text-green-600\" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className=\"text-amber-700\">⏳ Pending Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className=\"space-y-2\">
                {features.pending.map((item, idx) => (
                  <li key={idx} className=\"flex items-center gap-2 text-sm\">
                    <AlertCircle className=\"h-4 w-4 text-amber-600\" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className=\"grid grid-cols-2 md:grid-cols-4 gap-4\">
              <Button variant=\"outline\" asChild className=\"w-full\">
                <a href=\"/\" target=\"_blank\">Homepage</a>
              </Button>
              <Button variant=\"outline\" asChild className=\"w-full\">
                <a href=\"https://ckuhiigwpjbnonvtuaav.supabase.co\" target=\"_blank\">Supabase Dashboard</a>
              </Button>
              <Button variant=\"outline\" asChild className=\"w-full\">
                <a href=\"/README.md\" target=\"_blank\">Documentation</a>
              </Button>
              <Button variant=\"outline\" asChild className=\"w-full\">
                <a href=\"/api/categories\" target=\"_blank\">Test API</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <div className=\"mt-8 text-center text-sm text-neutral-600\">
          <p>Once setup is complete, restart the server:</p>
          <code className=\"block mt-2 bg-neutral-900 text-neutral-100 p-3 rounded font-mono\">
            sudo supervisorctl restart nextjs
          </code>
        </div>
      </div>
    </div>
  )
}
