/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
        extend: {
                borderRadius: {
                        lg: 'var(--radius)',
                        md: 'calc(var(--radius) - 2px)',
                        sm: 'calc(var(--radius) - 4px)',
                        '2xl': 'calc(var(--radius) + 4px)',
                        '3xl': 'calc(var(--radius) + 8px)'
                },
                colors: {
                        background: 'hsl(var(--background))',
                        foreground: 'hsl(var(--foreground))',
                        card: {
                                DEFAULT: 'hsl(var(--card))',
                                foreground: 'hsl(var(--card-foreground))'
                        },
                        popover: {
                                DEFAULT: 'hsl(var(--popover))',
                                foreground: 'hsl(var(--popover-foreground))'
                        },
                        primary: {
                                DEFAULT: 'hsl(var(--primary))',
                                foreground: 'hsl(var(--primary-foreground))'
                        },
                        secondary: {
                                DEFAULT: 'hsl(var(--secondary))',
                                foreground: 'hsl(var(--secondary-foreground))'
                        },
                        muted: {
                                DEFAULT: 'hsl(var(--muted))',
                                foreground: 'hsl(var(--muted-foreground))'
                        },
                        accent: {
                                DEFAULT: 'hsl(var(--accent))',
                                foreground: 'hsl(var(--accent-foreground))'
                        },
                        destructive: {
                                DEFAULT: 'hsl(var(--destructive))',
                                foreground: 'hsl(var(--destructive-foreground))'
                        },
                        success: {
                                DEFAULT: 'hsl(var(--success))',
                                foreground: 'hsl(var(--success-foreground))'
                        },
                        warning: {
                                DEFAULT: 'hsl(var(--warning))',
                                foreground: 'hsl(var(--warning-foreground))'
                        },
                        border: 'hsl(var(--border))',
                        input: 'hsl(var(--input))',
                        ring: 'hsl(var(--ring))',
                        chart: {
                                '1': 'hsl(var(--chart-1))',
                                '2': 'hsl(var(--chart-2))',
                                '3': 'hsl(var(--chart-3))',
                                '4': 'hsl(var(--chart-4))',
                                '5': 'hsl(var(--chart-5))'
                        }
                },
                fontFamily: {
                        sans: ['IBM Plex Sans Arabic', 'Noto Kufi Arabic', 'sans-serif'],
                        mono: ['IBM Plex Mono', 'SF Mono', 'Monaco', 'monospace']
                },
                fontSize: {
                        'xs': ['0.75rem', { lineHeight: '1.4' }],
                        'sm': ['0.875rem', { lineHeight: '1.5' }],
                        'base': ['1rem', { lineHeight: '1.6' }],
                        'lg': ['1.125rem', { lineHeight: '1.6' }],
                        'xl': ['1.25rem', { lineHeight: '1.5' }],
                        '2xl': ['1.5rem', { lineHeight: '1.4' }],
                        '3xl': ['1.875rem', { lineHeight: '1.3' }],
                        '4xl': ['2.25rem', { lineHeight: '1.2' }],
                        '5xl': ['3rem', { lineHeight: '1.15' }],
                        '6xl': ['3.75rem', { lineHeight: '1.1' }]
                },
                letterSpacing: {
                        tighter: '-0.03em',
                        tight: '-0.02em',
                        normal: '-0.011em',
                        wide: '0.025em'
                },
                spacing: {
                        '18': '4.5rem',
                        '88': '22rem',
                        '128': '32rem'
                },
                boxShadow: {
                        'soft': '0 2px 8px -2px hsl(var(--shadow-color) / 0.08)',
                        'medium': '0 4px 16px -4px hsl(var(--shadow-color) / 0.12)',
                        'large': '0 8px 32px -8px hsl(var(--shadow-color) / 0.16)',
                        'glow': '0 0 20px -5px hsl(var(--primary) / 0.35)',
                        'glow-lg': '0 0 40px -10px hsl(var(--primary) / 0.4)',
                        'inner-soft': 'inset 0 2px 4px 0 hsl(var(--shadow-color) / 0.06)'
                },
                keyframes: {
                        'accordion-down': {
                                from: {
                                        height: '0'
                                },
                                to: {
                                        height: 'var(--radix-accordion-content-height)'
                                }
                        },
                        'accordion-up': {
                                from: {
                                        height: 'var(--radix-accordion-content-height)'
                                },
                                to: {
                                        height: '0'
                                }
                        },
                        'fade-in': {
                                from: { opacity: '0', transform: 'translateY(8px)' },
                                to: { opacity: '1', transform: 'translateY(0)' }
                        },
                        'fade-out': {
                                from: { opacity: '1', transform: 'translateY(0)' },
                                to: { opacity: '0', transform: 'translateY(8px)' }
                        },
                        'slide-in-right': {
                                from: { opacity: '0', transform: 'translateX(-16px)' },
                                to: { opacity: '1', transform: 'translateX(0)' }
                        },
                        'scale-in': {
                                from: { opacity: '0', transform: 'scale(0.95)' },
                                to: { opacity: '1', transform: 'scale(1)' }
                        },
                        'pulse-soft': {
                                '0%, 100%': { opacity: '1' },
                                '50%': { opacity: '0.7' }
                        },
                        'bounce-soft': {
                                '0%, 100%': { transform: 'translateY(0)' },
                                '50%': { transform: 'translateY(-4px)' }
                        }
                },
                animation: {
                        'accordion-down': 'accordion-down 0.2s ease-out',
                        'accordion-up': 'accordion-up 0.2s ease-out',
                        'fade-in': 'fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                        'fade-out': 'fade-out 0.2s ease-in forwards',
                        'slide-in': 'slide-in-right 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                        'scale-in': 'scale-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
                        'bounce-soft': 'bounce-soft 2s ease-in-out infinite'
                },
                transitionTimingFunction: {
                        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
                        'smooth-out': 'cubic-bezier(0.16, 1, 0.3, 1)'
                }
        }
  },
  plugins: [require("tailwindcss-animate")],
};
