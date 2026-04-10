import tailwindAnimate from 'tailwindcss-animate';
import tailwindTypography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./app/**/*.{js,jsx,ts,tsx}', './content/**/*.{md,mdx}', './index.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        serif: ['Newsreader', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        sidebar: {
          DEFAULT: 'var(--sidebar)',
          foreground: 'var(--sidebar-foreground)',
          primary: 'var(--sidebar-primary)',
          'primary-foreground': 'var(--sidebar-primary-foreground)',
          accent: 'var(--sidebar-accent)',
          'accent-foreground': 'var(--sidebar-accent-foreground)',
          border: 'var(--sidebar-border)',
          ring: 'var(--sidebar-ring)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: 'var(--foreground)',
            maxWidth: '70ch',
            fontSize: theme('fontSize.base')[0],
            lineHeight: '1.9',
            '[class~="lead"]': {
              color: 'var(--muted-foreground)',
              fontSize: theme('fontSize.xl')[0],
              lineHeight: '1.8',
              marginTop: '0',
              marginBottom: '1.5em',
            },
            p: {
              marginTop: '1em',
              marginBottom: '1em',
            },
            a: {
              color: 'var(--foreground)',
              fontWeight: '500',
              textDecorationThickness: '1px',
              textUnderlineOffset: '0.24em',
              textDecorationColor: 'rgba(120, 95, 65, 0.35)',
            },
            strong: {
              color: 'var(--foreground)',
              fontWeight: '650',
            },
            h2: {
              fontFamily: theme('fontFamily.serif').join(', '),
              color: 'var(--foreground)',
              fontWeight: '600',
              letterSpacing: '-0.01em',
              fontSize: theme('fontSize.3xl')[0],
              marginTop: '2.4em',
              marginBottom: '0.8em',
              paddingTop: '1em',
              borderTop: '1px solid rgba(120, 95, 65, 0.18)',
            },
            h3: {
              color: 'var(--foreground)',
              fontWeight: '600',
              marginTop: '1.8em',
              marginBottom: '0.7em',
            },
            hr: {
              borderColor: 'rgba(120, 95, 65, 0.18)',
              marginTop: '2.5em',
              marginBottom: '2.5em',
            },
            blockquote: {
              color: 'var(--foreground)',
              fontStyle: 'normal',
              borderLeftColor: 'rgba(120, 95, 65, 0.3)',
              backgroundColor: 'rgba(120, 95, 65, 0.06)',
              borderRadius: theme('borderRadius.xl'),
              padding: '1rem 1.25rem',
            },
            code: {
              color: 'var(--foreground)',
              fontWeight: '500',
              backgroundColor: 'rgba(120, 95, 65, 0.08)',
              borderRadius: '0.35rem',
              padding: '0.18em 0.34em',
            },
            'code::before': {
              content: 'none',
            },
            'code::after': {
              content: 'none',
            },
            pre: {
              borderRadius: '1rem',
            },
            ol: {
              paddingLeft: '1.15em',
            },
            ul: {
              paddingLeft: '1.15em',
            },
            'ol > li::marker': {
              color: 'var(--muted-foreground)',
              fontWeight: '600',
            },
            'ul > li::marker': {
              color: 'rgba(120, 95, 65, 0.55)',
            },
          },
        },
        stone: {
          css: {
            '--tw-prose-body': 'var(--foreground)',
            '--tw-prose-headings': 'var(--foreground)',
            '--tw-prose-lead': 'var(--muted-foreground)',
            '--tw-prose-links': 'var(--foreground)',
            '--tw-prose-bold': 'var(--foreground)',
            '--tw-prose-counters': 'var(--muted-foreground)',
            '--tw-prose-bullets': 'rgba(120, 95, 65, 0.55)',
            '--tw-prose-hr': 'rgba(120, 95, 65, 0.18)',
            '--tw-prose-quotes': 'var(--foreground)',
            '--tw-prose-quote-borders': 'rgba(120, 95, 65, 0.3)',
            '--tw-prose-captions': 'var(--muted-foreground)',
            '--tw-prose-code': 'var(--foreground)',
            '--tw-prose-pre-bg': 'rgba(24, 20, 17, 0.94)',
            '--tw-prose-th-borders': 'rgba(120, 95, 65, 0.18)',
            '--tw-prose-td-borders': 'rgba(120, 95, 65, 0.12)',
          },
        },
      }),
    },
  },
  plugins: [tailwindAnimate, tailwindTypography],
};
