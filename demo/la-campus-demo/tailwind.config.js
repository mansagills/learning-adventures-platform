/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ===== PLAYFUL GEOMETRIC DESIGN SYSTEM =====

        // Semantic tokens
        background: '#FFFDF5', // Warm Cream (Paper feel)
        foreground: '#1E293B', // Slate 800 (Softer than black)
        muted: '#F1F5F9', // Slate 100
        'muted-foreground': '#64748B', // Slate 500

        // Primary brand - Vivid Violet
        brand: {
          50: '#F5F3FF',
          100: '#ECEBFF',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
        },

        // Accent teal (keeping for compatibility)
        accent: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },

        // Playful Geometric accent colors
        'pg-violet': '#8B5CF6', // Primary accent
        'pg-pink': '#F472B6', // Hot Pink (secondary)
        'pg-yellow': '#FBBF24', // Amber (tertiary - optimism)
        'pg-mint': '#34D399', // Emerald (quaternary - freshness)

        // Fun colors for variety (keeping existing)
        sunshine: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
        coral: {
          50: '#FFF1F2',
          100: '#FFE4E6',
          200: '#FECDD3',
          300: '#FDA4AF',
          400: '#FB7185',
          500: '#F43F5E',
          600: '#E11D48',
          700: '#BE123C',
        },
        ocean: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        grass: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
        },

        // Text colors
        ink: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },

        // Error states
        error: {
          500: '#EF4444',
          600: '#DC2626',
        },

        // Border color for Playful Geometric (dark chunky borders)
        'pg-border': '#1E293B',
      },

      fontFamily: {
        // New Playful Geometric fonts
        display: [
          'var(--font-outfit)',
          'var(--font-nunito)',
          'system-ui',
          'sans-serif',
        ],
        body: [
          'var(--font-plus-jakarta)',
          'var(--font-inter)',
          'system-ui',
          'sans-serif',
        ],
        // Keep old fonts for compatibility during transition
        heading: [
          'var(--font-outfit)',
          'var(--font-nunito)',
          'system-ui',
          'sans-serif',
        ],
        // Direct font family names for Playful Geometric
        outfit: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
        'plus-jakarta': ['var(--font-plus-jakarta)', 'system-ui', 'sans-serif'],
      },

      fontSize: {
        // Major Third scale (1.25 ratio) for Playful Geometric
        'pg-xs': ['0.64rem', { lineHeight: '1rem' }],
        'pg-sm': ['0.8rem', { lineHeight: '1.25rem' }],
        'pg-base': ['1rem', { lineHeight: '1.5rem' }],
        'pg-lg': ['1.25rem', { lineHeight: '1.75rem' }],
        'pg-xl': ['1.563rem', { lineHeight: '2rem' }],
        'pg-2xl': ['1.953rem', { lineHeight: '2.25rem' }],
        'pg-3xl': ['2.441rem', { lineHeight: '2.5rem' }],
        'pg-4xl': ['3.052rem', { lineHeight: '1.1' }],
        'pg-5xl': ['3.815rem', { lineHeight: '1.1' }],
      },

      borderRadius: {
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
        // Playful Geometric specific
        pg: '16px',
        'pg-lg': '24px',
      },

      borderWidth: {
        // Chunky borders for Playful Geometric
        pg: '2px',
        3: '3px',
      },

      boxShadow: {
        // ===== PLAYFUL GEOMETRIC HARD SHADOWS =====
        // The "Pop" Shadow - No blur, solid offset
        pop: '4px 4px 0px 0px #1E293B',
        'pop-hover': '6px 6px 0px 0px #1E293B',
        'pop-active': '2px 2px 0px 0px #1E293B',

        // Card shadows
        'card-sticker': '8px 8px 0px 0px #E2E8F0',
        'card-sticker-hover': '12px 12px 0px 0px #E2E8F0',
        'card-featured': '8px 8px 0px 0px #F472B6', // Pink shadow for featured

        // Colored shadows for variety
        'pop-violet': '4px 4px 0px 0px #8B5CF6',
        'pop-pink': '4px 4px 0px 0px #F472B6',
        'pop-yellow': '4px 4px 0px 0px #FBBF24',
        'pop-mint': '4px 4px 0px 0px #34D399',

        // Focus shadow
        'pop-focus': '0 0 0 2px #8B5CF6, 4px 4px 0px 0px #8B5CF6',

        // Legacy shadows (keeping for compatibility)
        fun: '0 10px 25px -5px rgba(139, 92, 246, 0.3), 0 8px 10px -6px rgba(139, 92, 246, 0.2)',
        'fun-lg':
          '0 20px 35px -5px rgba(139, 92, 246, 0.4), 0 10px 15px -6px rgba(139, 92, 246, 0.3)',
        colorful:
          '0 10px 30px -5px rgba(139, 92, 246, 0.3), 0 0 0 1px rgba(20, 184, 166, 0.1)',
      },

      animation: {
        // ===== PLAYFUL GEOMETRIC ANIMATIONS =====
        // Pop-in entrance (bouncy scale)
        'pop-in': 'popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',

        // Wiggle on hover
        'wiggle-hover': 'wiggleHover 0.4s ease-in-out',

        // Card lift
        lift: 'lift 0.2s ease-out forwards',
        unlift: 'unlift 0.2s ease-out forwards',

        // Marquee for logos
        marquee: 'marquee 30s linear infinite',
        'marquee-reverse': 'marquee 30s linear infinite reverse',

        // Legacy animations (keeping)
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        wiggle: 'wiggle 0.5s ease-in-out',
        float: 'float 3s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 2s linear infinite',
        confetti: 'confetti 0.6s ease-out',
      },

      keyframes: {
        // Playful Geometric keyframes
        popIn: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '70%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        wiggleHover: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(3deg)' },
          '75%': { transform: 'rotate(-3deg)' },
        },
        lift: {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(-2px, -2px)' },
        },
        unlift: {
          '0%': { transform: 'translate(-2px, -2px)' },
          '100%': { transform: 'translate(0, 0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },

        // Legacy keyframes
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        confetti: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': {
            transform: 'translateY(-100px) rotate(360deg)',
            opacity: '0',
          },
        },
      },

      transitionTimingFunction: {
        // Bouncy easing for Playful Geometric
        bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },

      transitionDuration: {
        250: '250ms',
      },

      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
    },
  },
  plugins: [],
};
