/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Military-inspired color palette
        barn_red: {
          DEFAULT: '#780000',
          100: '#180000',
          200: '#310000',
          300: '#490000',
          400: '#620000',
          500: '#780000',
          600: '#c80000',
          700: '#ff1616',
          800: '#ff6464',
          900: '#ffb1b1'
        },
        fire_brick: {
          DEFAULT: '#c1121f',
          100: '#260406',
          200: '#4d070c',
          300: '#730b12',
          400: '#990e17',
          500: '#c1121f',
          600: '#eb2330',
          700: '#f05a64',
          800: '#f59198',
          900: '#fac8cb'
        },
        papaya_whip: {
          DEFAULT: '#fdf0d5',
          100: '#593c04',
          200: '#b17908',
          300: '#f5ae22',
          400: '#f9cf7b',
          500: '#fdf0d5',
          600: '#fdf2dc',
          700: '#fef5e5',
          800: '#fef9ed',
          900: '#fffcf6'
        },
        prussian_blue: {
          DEFAULT: '#003049',
          100: '#00090e',
          200: '#00131d',
          300: '#001c2b',
          400: '#002539',
          500: '#003049',
          600: '#00679f',
          700: '#00a0f7',
          800: '#50c2ff',
          900: '#a7e0ff'
        },
        air_superiority_blue: {
          DEFAULT: '#669bbc',
          100: '#122028',
          200: '#233f51',
          300: '#355f79',
          400: '#477fa2',
          500: '#669bbc',
          600: '#85afc9',
          700: '#a4c3d7',
          800: '#c2d7e4',
          900: '#e1ebf2'
        },
        // Keep shadcn/ui compatibility
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['Rubik', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
        editorial: ['PPEditorialNew', 'serif'],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
