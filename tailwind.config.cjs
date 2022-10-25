/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: ['./src/**/*.{html,js,tsx}'],
  theme: {
    screens: {
      sm: { min: '0px', max: '767px' },
      // => @media (min-width: 640px and max-width: 767px) { ... }

      md: { min: '768px', max: '1023px' },
      // => @media (min-width: 768px and max-width: 1023px) { ... }

      lg: { min: '1024px', max: '1279px' },
      // => @media (min-width: 1024px and max-width: 1279px) { ... }

      xl: { min: '1280px', max: '1535px' },
      // => @media (min-width: 1280px and max-width: 1535px) { ... }

      '2xl': { min: '1536px' },
      // => @media (min-width: 1536px) { ... }
    },
    extend: {
      fontFamily: {
        sans: ['Montserrat'],
      },
      backgroundSize: {
        'size-200': '200% 200%',
        'size-100': '100% 100%',
      },
      backgroundPosition: {
        'pos-0': '0% 0%',
        'pos-100/0': '100% 0%',
        'pos-100': '100% 100%',
      },
      animation: {
        appear: 'textAppear 0.6s 1s ease-in-out normal forwards',
        shadowAppear: 'shadowAppear 2s 1s ease-in-out normal forwards',
        'navbar-exp-anim': 'expNav 1s ease-in-out normal forwards',
        'anim-info-disappear': 'anim-info-disappear 1s ease-in-out forward',
      },
      keyframes: {
        textAppear: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        shadowAppear: {
          from: { 'box-shadow': '0px 0px 0px #000000, 0px 0px 0px #1e1e25' },
          to: {
            'box-shadow': '20px 20px 60px #000000, -20px -20px 60px #1e1e25',
          },
        },
        expNav: {
          from: { width: '100vw' },
          to: { width: '150vw' },
        },
        'anim-info-disappear': {
          from: { opacity: 1 },
          to: { opacity: 0 },
        },
      },
    },
  },
  plugins: [],
}
