<template>
  <v-overlay color="transparent">
    <v-progress-circular color="primary" indeterminate />
  </v-overlay>
</template>

<script>
import { onAuthStateChanged } from 'firebase/auth'

export default {
  name: 'IndexPage',
  layout: 'empty',
  created () {
    // Setting an authentication state observer on the Firebase Auth object.
    // This observer gets called when Auth finished initializing and
    // whenever the user's sign-in state changes.
    onAuthStateChanged(this.$auth, (user) => {
      this.$store.commit('initFirebase')
      if (user) {
        // User is signed in; redirect to main page (dashboard)
        this.$store.commit('setUserLoggedIn', true)
        this.$router.push({ name: 'dashboard' })
      } else {
        // User is signed out; redirect to login page
        this.$store.commit('setUserLoggedIn', false)
        this.$router.push({ name: 'login' })
      }
    })
  }
}
</script>
