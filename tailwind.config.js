import tailwindAnimate from 'tailwindcss-animate';
import tailwindTypography from '@tailwindcss/typography';

// Brand colors live in CSS vars (index.css); color-mix keeps `/opacity` modifiers working.
const brand = (v) => `color-mix(in srgb, var(${v}) calc(<alpha-value> * 100%), transparent)`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './content/**/*.{md,mdx}', './index.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['var(--font-display)'],
      },
      boxShadow: {
        block: '6px 6px 0 var(--shadow, var(--ink))',
        'block-lg': '10px 10px 0 var(--shadow, var(--ink))',
      },
      colors: {
        ink: brand('--ink'),
        paper: {DEFAULT: brand('--paper'), 2: brand('--paper-2')},
        cta: {DEFAULT: brand('--cta'), ink: brand('--cta-ink')},
        'pop-1': brand('--pop-1'),
        'pop-2': brand('--pop-2'),
        glow: brand('--glow'),
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
              textDecorationColor: 'color-mix(in srgb, var(--ink) 35%, transparent)',
            },
            strong: {
              color: 'var(--foreground)',
              fontWeight: '650',
            },
            h2: {
              fontFamily: 'var(--font-display)',
              textTransform: 'uppercase',
              color: 'var(--foreground)',
              fontWeight: '600',
              letterSpacing: '-0.01em',
              fontSize: theme('fontSize.3xl')[0],
              marginTop: '2.4em',
              marginBottom: '0.8em',
              paddingTop: '1em',
              borderTop: '1px solid color-mix(in srgb, var(--ink) 18%, transparent)',
            },
            h3: {
              color: 'var(--foreground)',
              fontWeight: '600',
              marginTop: '1.8em',
              marginBottom: '0.7em',
            },
            hr: {
              borderColor: 'color-mix(in srgb, var(--ink) 18%, transparent)',
              marginTop: '2.5em',
              marginBottom: '2.5em',
            },
            blockquote: {
              color: 'var(--foreground)',
              fontStyle: 'normal',
              borderLeftColor: 'color-mix(in srgb, var(--ink) 30%, transparent)',
              backgroundColor: 'color-mix(in srgb, var(--ink) 6%, transparent)',
              borderRadius: '0',
              padding: '1rem 1.25rem',
            },
            code: {
              color: 'var(--foreground)',
              fontWeight: '500',
              backgroundColor: 'color-mix(in srgb, var(--ink) 8%, transparent)',
              borderRadius: '0',
              padding: '0.18em 0.34em',
            },
            'code::before': {
              content: 'none',
            },
            'code::after': {
              content: 'none',
            },
            pre: {
              borderRadius: '0',
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
              color: 'color-mix(in srgb, var(--ink) 55%, transparent)',
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
            '--tw-prose-bullets': 'color-mix(in srgb, var(--ink) 55%, transparent)',
            '--tw-prose-hr': 'color-mix(in srgb, var(--ink) 18%, transparent)',
            '--tw-prose-quotes': 'var(--foreground)',
            '--tw-prose-quote-borders': 'color-mix(in srgb, var(--ink) 30%, transparent)',
            '--tw-prose-captions': 'var(--muted-foreground)',
            '--tw-prose-code': 'var(--foreground)',
            '--tw-prose-pre-bg': 'var(--ink)',
            '--tw-prose-th-borders': 'color-mix(in srgb, var(--ink) 18%, transparent)',
            '--tw-prose-td-borders': 'color-mix(in srgb, var(--ink) 12%, transparent)',
          },
        },
      }),
    },
  },
  plugins: [tailwindAnimate, tailwindTypography],
};
