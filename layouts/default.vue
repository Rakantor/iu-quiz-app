<template>
  <v-app dark>
    <v-app-bar fixed app>
      <v-toolbar-title v-text="title" />
      <v-spacer />
      <v-btn v-if="loggedIn" icon color="primary" @click="logout">
        <v-icon>mdi-logout-variant</v-icon>
      </v-btn>
    </v-app-bar>
    <v-main>
      <Nuxt />
    </v-main>
    <v-footer :absolute="!fixed" app>
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
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
    loggedIn () {
      return this.$store.state.userLoggedIn
    }
  },
  methods: {
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
