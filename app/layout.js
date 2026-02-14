import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import { CartProvider } from "@/contexts/CartContext"
import { WishlistProvider } from "@/contexts/WishlistContext"
import { Toaster } from "sonner"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
})

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
})

export const metadata = {
  title: "Skoneasu - For You Only",
  description: "Discover our exquisite collection of handcrafted luxury jewelry. Skoneasu - For you only.",
  keywords: "skoneasu, luxury jewelry, diamond rings, gemstone necklaces, premium jewelry, engagement rings",

}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
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
