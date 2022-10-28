<template>
  <v-overlay color="transparent">
    <v-progress-circular color="primary" indeterminate />
  </v-overlay>
</template>

<script>
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { UserConverter } from '~/plugins/user'

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
        // User is signed in; get user data from db, then redirect to main page (dashboard)
        this.getUser()
      } else {
        // User is signed out; redirect to login page
        this.$store.commit('setUser', null)
        this.$router.push({ name: 'login' })
      }
    })
  },
  methods: {
    getUser () {
      const ref = doc(this.$db, `benutzer/${this.$auth.currentUser.uid}`).withConverter(UserConverter)
      getDoc(ref).then((docSnap) => {
        if (docSnap.exists()) {
          this.$store.commit('setUser', docSnap.data())
          this.$router.push({ name: 'dashboard' })
        } else {
          this.$toast({ content: 'Benutzer konnte in DB nicht gefunden werden!', color: 'error' })
        }
      })
    }
  }
}
</script>
