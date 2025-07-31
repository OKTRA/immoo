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
				// IMMOO Premium Branding Colors - Enhanced with CSS Variables
				'immoo-navy': {
					DEFAULT: 'hsl(var(--immoo-navy))',
					light: 'hsl(var(--immoo-navy-light))',
					dark: '#0F172A',
					50: '#F8FAFC',
					100: '#F1F5F9',
					200: '#E2E8F0',
					300: '#CBD5E1',
					400: '#94A3B8',
					500: '#64748B',
					600: '#475569',
					700: '#334155',
					800: '#1E293B',
					900: 'hsl(var(--immoo-navy))',
					950: '#020617'
				},
				'immoo-gold': {
					DEFAULT: 'hsl(var(--immoo-gold))',
					light: 'hsl(var(--immoo-gold-light))',
					dark: '#B45309',
					50: '#FFFBEB',
					100: '#FEF3C7',
					200: '#FDE68A',
					300: '#FCD34D',
					400: '#FBBF24',
					500: 'hsl(var(--immoo-gold-light))',
					600: 'hsl(var(--immoo-gold))',
					700: '#B45309',
					800: '#92400E',
					900: '#78350F',
					950: '#451A03'
				},
				'immoo-pearl': {
					DEFAULT: 'hsl(var(--immoo-pearl))',
					dark: '#F3F4F6',
					50: 'hsl(var(--immoo-pearl))',
					100: '#F3F4F6',
					200: '#E5E7EB',
					300: '#D1D5DB',
					400: '#9CA3AF',
					500: '#6B7280',
					600: '#4B5563',
					700: '#374151',
					800: '#1F2937',
					900: '#111827'
				},
				'immoo-gray': {
					DEFAULT: 'hsl(var(--immoo-gray))',
					light: '#F9FAFB',
					dark: '#D1D5DB'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'xl': '1rem',
				'2xl': '1.5rem',
				'3xl': '2rem'
			},
			fontFamily: {
				'immoo': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
			},
			boxShadow: {
				'immoo-sm': '0 2px 8px -2px rgba(17, 24, 39, 0.1)',
				'immoo-md': '0 8px 25px -5px rgba(17, 24, 39, 0.1), 0 4px 10px -3px rgba(17, 24, 39, 0.05)',
				'immoo-lg': '0 20px 40px -12px rgba(17, 24, 39, 0.15)',
				'immoo-xl': '0 25px 50px -12px rgba(17, 24, 39, 0.25)',
				'immoo-2xl': '0 35px 60px -12px rgba(17, 24, 39, 0.3)',
				'immoo-gold': '0 25px 50px -12px rgba(217, 119, 6, 0.25)',
				'immoo-gold-lg': '0 35px 60px -12px rgba(217, 119, 6, 0.4)',
				'immoo-glow': '0 0 30px rgba(217, 119, 6, 0.5)',
				'immoo-glow-lg': '0 0 50px rgba(217, 119, 6, 0.6)',
			},
			backdropBlur: {
				'immoo': '16px',
				'immoo-lg': '24px',
			},
			backgroundImage: {
				'immoo-gradient': 'linear-gradient(135deg, hsl(var(--immoo-navy)), hsl(var(--immoo-navy-light)))',
				'immoo-gold-gradient': 'linear-gradient(135deg, hsl(var(--immoo-gold)), hsl(var(--immoo-gold-light)))',
				'immoo-hero': 'linear-gradient(135deg, hsl(var(--background)) 0%, hsl(var(--card)) 50%, hsl(var(--muted))/30 100%)',
				'immoo-premium': 'linear-gradient(135deg, hsl(var(--immoo-pearl)) 0%, rgba(255,255,255,0.8) 50%, hsl(var(--immoo-pearl))/30 100%)',
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
				// IMMOO Premium Animations - Enhanced
				'immoo-glow': {
					'0%, 100%': { 
						boxShadow: '0 0 20px rgba(217, 119, 6, 0.5)',
						filter: 'brightness(1)'
					},
					'50%': { 
						boxShadow: '0 0 40px rgba(217, 119, 6, 0.8), 0 0 60px rgba(217, 119, 6, 0.3)',
						filter: 'brightness(1.1)'
					}
				},
				'immoo-float': {
					'0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
					'33%': { transform: 'translateY(-20px) rotate(1deg)' },
					'66%': { transform: 'translateY(-10px) rotate(-1deg)' }
				},
				'immoo-pulse': {
					'0%, 100%': { 
						opacity: '1',
						transform: 'scale(1)'
					},
					'50%': { 
						opacity: '0.8',
						transform: 'scale(1.05)'
					}
				},
				'immoo-bounce-in': {
					'0%': {
						opacity: '0',
						transform: 'scale(0.3) rotate(-10deg)'
					},
					'50%': {
						opacity: '1',
						transform: 'scale(1.1) rotate(5deg)'
					},
					'100%': {
						opacity: '1',
						transform: 'scale(1) rotate(0deg)'
					}
				},
				'immoo-slide-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(60px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'immoo-shimmer': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'immoo-rotate': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' }
				},
				'immoo-breathe': {
					'0%, 100%': { transform: 'scale(1)' },
					'50%': { transform: 'scale(1.05)' }
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
				// IMMOO Premium Animations - Enhanced
				'immoo-glow': 'immoo-glow 3s ease-in-out infinite',
				'immoo-float': 'immoo-float 6s ease-in-out infinite',
				'immoo-pulse': 'immoo-pulse 2s ease-in-out infinite',
				'immoo-bounce-in': 'immoo-bounce-in 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'immoo-slide-up': 'immoo-slide-up 0.8s ease-out',
				'immoo-shimmer': 'immoo-shimmer 2s ease-in-out infinite',
				'immoo-rotate': 'immoo-rotate 20s linear infinite',
				'immoo-breathe': 'immoo-breathe 4s ease-in-out infinite'
			},
			transitionTimingFunction: {
				'immoo-bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'immoo-ease': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
			},
			scale: {
				'102': '1.02',
				'103': '1.03',
				'108': '1.08',
			}
		}
	},
	plugins: [require("tailwindcss-animate"), require('@tailwindcss/line-clamp')],
} satisfies Config;
