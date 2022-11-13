import colors from 'vuetify/es5/util/colors'

export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: '%s',
    title: 'Quiz App',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '~/assets/variables.scss'
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '~/plugins/firebase.js',
    '~/plugins/toast.js'
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify',
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
  ],

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      lang: 'en',
    },
  },

  router: {
    middleware: 'auth'
  },

  env: {
    firebaseAppCheckDebugToken: process.env.NODE_ENV !== 'production'
  },

  publicRuntimeConfig: {
    NODE_ENV: process.env.NODE_ENV
  },

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    theme: {
      dark: false,
      themes: {
        light: {
          // Vuetify default light theme colors
          // primary: colors.blue.darken2,
          primary: '#3772ff', // same as iu.de
          secondary: colors.grey.darken3,
          accent: colors.blue.accent1,
          error: colors.red.accent2,
          info: colors.blue.base,
          success: colors.green.base,
          warning: colors.orange.darken1,
          background: '#f1f2f6' // same as MyCampus
        },
        dark: {
          // Vuetify default dark theme colors
          primary: colors.blue.base,
          secondary: colors.grey.darken3,
          accent: colors.pink.accent2,
          error: colors.red.accent2,
          info: colors.blue.base,
          success: colors.green.base,
          warning: colors.orange.darken1,
        },
      },
    },
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    extend(config) {
      config.resolve.alias.vue = 'vue/dist/vue.common'
    },
    transpile: [
      'vee-validate/dist/rules'
    ],
  },
}
