const colors = require('tailwindcss/colors')
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: ["./**/*.{html,njk,svg}"],
  theme: {
    colors: {
      transparent: 'transparent',
      black: '#000',
      white: '#fff',
      blue: {
        50: '#DCE8FA',
        100: '#CADCF8',
        200: '#A6C4F3',
        300: '#82ACEE',
        400: '#5E94E9',
        500: '#3B7CE4',
        600: '#1E66D8',
        700: '#1955B4',
        800: '#144490',
        900: '#0D2D5F',
      },
      teal: {
        50: '#EFF5F5',
        100: '#E2ECED',
        200: '#C9DCDD',
        300: '#A7C5C7',
        400: '#84AEB2',
        500: '#62959C',
        600: '#4C7379',
        700: '#375257',
        800: '#213134',
        900: '#0B1112',
        950: '#000101'
      },
      almond: {
        50: '#FCFAF8',
        100: '#F8F5EF',
        200: '#F0EADD',
        300: '#DDD0B3',
        400: '#CBB688',
        500: '#B89D5E',
        600: '#967D42',
        700: '#6C5A2F',
        800: '#41371D',
        900: '#17130A',
      },
      red: {
        50: '#FADFE0',
        100: '#F8CDCF',
        200: '#F2AAAC',
        300: '#ED868A',
        400: '#E86367',
        500: '#E33F44',
        600: '#D92026',
        700: '#AD191E',
        800: '#801316',
        900: '#540C0F',
        950: '#3D090B'
      },
      gray: colors.slate,
    },
    extend: {
      fontFamily: {
        display: ['Helsinki', ...defaultTheme.fontFamily.sans],
        serif: ['Georgia', ...defaultTheme.fontFamily.serif],
        mono: ['"IBM Plex Mono"', ...defaultTheme.fontFamily.mono],
      },
    },
  },
  plugins: [require('@tailwindcss/forms')({ strategy: 'base' }), require('@tailwindcss/typography')],
}
