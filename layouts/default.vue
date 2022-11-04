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
      <v-img src="/iu-logo.svg" contain class="svg flex-grow-0 flex-shrink-1"></v-img>
    </v-app-bar>
    <v-main>
      <Nuxt />
    </v-main>
    <FooterApp />
    <ToastComponent />
  </v-app>
</template>

<script>
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
    }
  }
}
</script>

<style scoped>
.svg {
  filter: brightness(0) invert(1);
}
</style>