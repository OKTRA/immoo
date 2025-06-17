import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
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
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// IMMOO Premium Branding Colors (Utility Classes)
				immoo: {
					'navy': '#111827', // Bleu nuit
					'gold': '#D97706', // Or doux
					'pearl': '#F9FAFB', // Blanc cassé
					'gray': '#E5E7EB', // Gris perle
					'navy-light': '#1F2937', // Bleu nuit plus clair
					'navy-dark': '#0F172A', // Bleu nuit plus foncé
					'gold-light': '#F59E0B', // Or plus clair
					'gold-dark': '#B45309' // Or plus foncé
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
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-out': {
					'0%': { opacity: '1' },
					'100%': { opacity: '0' }
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'slide-in': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'slide-in-right': {
					'0%': { transform: 'translateX(100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(100%)' },
					'100%': { transform: 'translateY(0)' }
				},
				'slide-down': {
					'0%': { transform: 'translateY(-100%)' },
					'100%': { transform: 'translateY(0)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' }
				},
				'pulse-soft': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' }
				},
				'shimmer': {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' }
				},
				// IMMOO Premium Animations
				'immoo-glow': {
					'0%, 100%': { boxShadow: '0 0 20px rgba(217, 119, 6, 0.3)' },
					'50%': { boxShadow: '0 0 30px rgba(217, 119, 6, 0.5)' }
				},
				'immoo-float': {
					'0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
					'50%': { transform: 'translateY(-10px) rotate(2deg)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.3s ease-out',
				'scale-in': 'scale-in 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
				'slide-in': 'slide-in 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
				'slide-in-right': 'slide-in-right 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
				'slide-up': 'slide-up 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
				'slide-down': 'slide-down 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
				'float': 'float 3s ease-in-out infinite',
				'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
				'shimmer': 'shimmer 2s linear infinite',
				// IMMOO Premium Animations
				'immoo-glow': 'immoo-glow 2s ease-in-out infinite',
				'immoo-float': 'immoo-float 6s ease-in-out infinite'
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
