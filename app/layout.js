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
  title: "SKONEASU — Premium Gifting for Him & Her",
  description: "Discover thoughtfully curated premium gifts for her and him. Jewelry, accessories, gift combos and more. SKONEASU — For You Only.",
  keywords: "skoneasu, premium gifts, gifts for her, gifts for him, gift combos, jewelry gifts, luxury gifting india",
  icons: {
    icon: [
      { url: "/logo.png?v=4", type: "image/png" },
      { url: "/favicon.ico?v=4" }
    ],
    shortcut: "/logo.png?v=4",
    apple: "/logo.png?v=4",
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${playfair.variable} antialiased`}>
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
