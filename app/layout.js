import { Manrope, Playfair_Display } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import { CartProvider } from "@/contexts/CartContext"
import { WishlistProvider } from "@/contexts/WishlistContext"
import { Toaster } from "sonner"

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

export const metadata = {
  title: "SKONEASU - Premium Gifting for Him & Her",
  description: "Discover thoughtfully curated premium gifts for her and him. Jewelry, accessories, gift combos and more. SKONEASU - For You Only.",
  keywords: "skoneasu, premium gifts, gifts for her, gifts for him, gift combos, jewelry gifts, luxury gifting india",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.png", type: "image/png" }
    ],
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${manrope.variable} ${playfair.variable} font-sans antialiased`}>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              {children}
              <Toaster position="top-right" richColors />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
