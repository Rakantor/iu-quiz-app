<template>
  <v-app :style="{ background: $vuetify.theme.themes[theme].background }">
    <NavigationDrawer ref="navDrawer" />
    <v-app-bar app dark clipped-left>
      <v-app-bar-nav-icon @click="toggleNavDrawer" />
      <v-toolbar-title v-text="title" />
      <v-spacer />
      <!-- TODO: Enable theme switching some time maybe
      <v-btn icon @click="$vuetify.theme.dark = !$vuetify.theme.dark">
        <v-icon>mdi-theme-light-dark</v-icon>
      </v-btn>
      -->
      <v-btn v-if="loggedIn" icon @click="logout">
        <v-icon>mdi-logout-variant</v-icon>
      </v-btn>
    </v-app-bar>
    <v-main>
      <Nuxt />
    </v-main>
    <FooterApp />
    <ToastComponent />
  </v-app>
</template>

<script>
import { signOut } from 'firebase/auth'

export default {
  name: 'DefaultLayout',
  data() {
    return {
      fixed: false,
      title: 'IU Quiz App',
    }
  },
  computed: {
    theme () {
      return (this.$vuetify.theme.dark) ? 'dark' : 'light'
    },
    loggedIn () {
      return this.$store.state.user
    }
  },
  methods: {
    toggleNavDrawer () {
      this.$refs.navDrawer.toggle()
    },
    logout () {
      signOut(this.$auth).then(() => {
        // Sign-out successful
        // The authentication state observer will redirect the user to the main page (dashboard),
        // see pages/index.vue
      }).catch((error) => {
        // An error happened.
        this.$toast({ content: error, color: 'error' })
      })
    }
  }
}
</script>
