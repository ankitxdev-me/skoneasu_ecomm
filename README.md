# 💎 SKONEASU — Premium Luxury Gifting Ecommerce Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payment_Gateway-02042B?style=for-the-badge&logo=razorpay)](https://razorpay.com/)

**SKONEASU** is a modern, high-performance luxury gifting e-commerce platform crafted with Next.js App Router, Supabase PostgreSQL, and Tailwind CSS. Designed specifically for timeless gifting, it offers a refined brown-and-gold aesthetic, seamless shopping experiences, an integrated user dashboard, and a full-featured admin management panel.

---

## ✨ Key Features

### 🛍️ Storefront & Shopping Experience
- **Luxury Aesthetic**: Rich curated color palette (`#2D1B16`, `#E8C7AF`, `#FAF2EB`), elegant typography, and smooth micro-interactions.
- **Top Announcement Carousel**: 
  - Desktop multi-segment announcement bar.
  - Mobile swipeable, rotating announcement slider featuring free shipping notices, store highlights, and an integrated **Track Order | Help** link.
- **Curated Collections**: Dedicated showcases for Him, Her, Luxury Gifts, and Festive Occasions.
- **Real-Time Live Search**: Debounced instant search modal across products, titles, and categories.
- **Dynamic Badge System**: Automatic badge assignment based on discount percentage:
  - Calculated percentage (`-XX%`) for discounts under 30%.
  - `SALE` badge for discounts between 30% and 49%.
  - `SPECIAL OFFER` badge for discounts 50% and above.
  - `NEW` badge for latest arrivals.

### 📦 Product Details & Variants
- **High-Resolution Galleries**: Multi-image product viewer with thumbnail navigation and zoom.
- **Dynamic Variant System**: Custom variants (Size, Color, Material) with reactive price modifiers and stock checks.
- **Customer Reviews**: Rating system with multi-image attachments, verified badges, and pinned reviews.

### 💳 Cart, Checkout & Payments
- **Persistent Cart & Wishlist**: Context-backed reactive states with drawer notifications.
- **Coupon System**: Dynamic coupon code validation supporting both flat discounts and percentages with minimum order value checks.
- **Dual Payment Modes**:
  - **Razorpay Gateway**: Secure online card, UPI, netbanking, and wallet payments.
  - **Cash on Delivery (COD)**: Seamless offline payment workflow with order verification.
- **Automated Tax & Shipping**: Configurable tax rates, standard shipping, and free shipping thresholds.

### 👤 User Account Dashboard (`/dashboard`)
- **Sticky Side Navigation**: Persistent left menu that stays in view across all views without reloading.
- **Profile Settings**: Update name, phone number, and account details.
- **Address Book**: Add, edit, remove, and select default delivery addresses.
- **Security**: Direct password change and credential updates.
- **Inline My Orders**: Track past orders, view order status badges (`Paid`, `Pending`, `Shipped`, `Delivered`), items breakdown, and download invoices.
- **Inline Wishlist**: Browse saved items with one-click "Add to Cart" and delete options.
- **Inline Support Tickets**: View submitted tickets with status indicators (`Open`, `In Progress`, `Resolved`), priority levels, and open new requests.

### 🛠️ Admin Management Panel (`/admin`)
- **Products Management**: Full CRUD operations, variant creator, image uploads to Supabase Storage, and inventory stock tracking.
- **Categories Management**: Organize store hierarchy, define main collections, and upload category banners.
- **Orders Desk**: Real-time order monitoring, status workflow updates, customer shipping details, and invoice generation.
- **Review Moderation**: Approve, reject, or pin standout customer reviews to the storefront.
- **Coupons Engine**: Create discount campaigns with start/expiry dates, usage limits, and discount thresholds.
- **Customer Support Desk**: Respond directly to customer tickets and manage ticket resolution lifecycle.
- **Store Settings**: Configure store tax percentages, base shipping fees, free shipping qualifying limits, and social media links.

---

## 🏗️ Project Architecture

```
singleapp/
├── app/                        # Next.js 14 App Router
│   ├── admin/                  # Admin panel routes (products, orders, reviews, coupons, support)
│   ├── api/                    # Route handlers (REST endpoints, Razorpay, Supabase service-role)
│   ├── auth/                   # Signin, signup, forgot-password, update-password
│   ├── checkout/               # Multi-step checkout with address selection & payment
│   ├── dashboard/              # User dashboard with fixed sidebar (orders, wishlist, tickets)
│   ├── orders/                 # Order details and invoice generation
│   ├── product/[slug]/         # Dynamic product details page
│   ├── shop/                   # Catalog with multi-faceted filtering and sorting
│   ├── support/                # Customer support ticket creation and discussion
│   └── page.js                 # High-converting storefront homepage
├── components/                 # Reusable UI & business components
│   ├── ui/                     # Radix UI / shadcn/ui components (cards, dialogs, buttons, etc.)
│   ├── Header.js               # Responsive header, rotating announcement, navigation drawers
│   ├── Footer.js               # Footer with developer channels, policies, and newsletter
│   └── ProductCard.js          # Product card with dynamic badge calculations and quick cart
├── contexts/                   # React Contexts (AuthContext, CartContext, WishlistContext)
├── hooks/                      # Custom hooks (mobile detection, toast triggers)
├── lib/                        # Core utilities & API wrappers
│   ├── api.js                  # Frontend API client for all backend endpoints
│   ├── razorpay.js             # Razorpay server SDK initialization
│   ├── schema.sql              # Master PostgreSQL database schema
│   ├── supabase.js             # Supabase client (anon key)
│   ├── supabase-admin.js       # Supabase client (service-role key)
│   └── utils.js                # Tailwind class merge helper (cn)
└── public/                     # Static media, luxury banners, and icons
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v18.17.0` or higher
- **npm**: `v9.0.0` or higher
- **Supabase Account**: A Supabase project with database & storage buckets enabled
- **Razorpay Account**: Razorpay test/live API credentials

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/ankit-gupta77/skoneasu_ecomm.git
cd skoneasu_ecomm
npm install
```

### 3. Environment Variables

Create a `.env` file in the project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 4. Database Setup

1. Open your **Supabase Dashboard** and navigate to the **SQL Editor**.
2. Open [`lib/schema.sql`](./lib/schema.sql) in this repository.
3. Paste the contents into the SQL Editor and click **Run**.
4. In **Supabase Storage**, ensure two public buckets exist:
   - `product-images` (Public access enabled)
   - `review-images` (Public access enabled)

### 5. Running the Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## 👑 Assigning Admin Role

To grant admin privileges to any user:
1. Register an account through `/auth/signup`.
2. Go to **Supabase Dashboard** &rarr; **Table Editor** &rarr; `profiles`.
3. Locate your user record and change the `role` column value from `customer` to `admin`.
4. Refresh your session; the **Admin Dashboard** option will now appear in your account menu.

---

## 📦 Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server on port 3001 |
| `npm run build` | Builds the production bundle |
| `npm run start` | Starts the production server |
| `npm run lint` | Runs ESLint to check for code quality |

---

## 🛡️ License

This project is private and proprietary. All rights reserved.
