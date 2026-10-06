/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'Manrope', 'sans-serif'],
        serif: ['var(--font-serif)', 'Playfair Display', 'serif'],
        script: ['Allura', 'Parisienne', 'cursive'],
      },
      colors: {
        chocolate: {
          DEFAULT: '#3E2923',
          dark: '#2A1A16',
          light: '#5A382B',
          hover: '#4D332C'
        },
        cream: {
          DEFAULT: '#F8EEE4',
          light: '#FFF9F3',
          soft: '#FAF3EB',
          dark: '#EDE0D2'
        },
        ivory: '#FFF9F3',
        champagne: {
          DEFAULT: '#E8C7AF',
          light: '#F3DEC9',
          dark: '#D4AA8F'
        },
        blush: {
          DEFAULT: '#D9B78C',
          light: '#E8CDAA',
          soft: '#F4E4D3'
        },
        terracotta: {
          DEFAULT: '#B87545',
          light: '#C9875C',
          dark: '#9E5F35'
        },
        gold: {
          DEFAULT: '#D4AF37',
          light: '#E5C158',
          dark: '#AA8825'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#3E2923',
          foreground: '#FFF9F3'
        },
        secondary: {
          DEFAULT: '#B87545',
          foreground: '#FFF9F3'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: '#F8EEE4',
          foreground: '#5A382B'
        },
        accent: {
          DEFAULT: '#C9875C',
          foreground: '#FFF9F3'
        },
        popover: {
          DEFAULT: '#FFF9F3',
          foreground: '#3E2923'
        },
        card: {
          DEFAULT: '#FFF9F3',
          foreground: '#3E2923'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.4s ease-out forwards'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
}
