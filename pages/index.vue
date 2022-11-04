<template>
  <v-overlay color="transparent">
    <v-progress-circular color="primary" indeterminate />
  </v-overlay>
</template>

<script>
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import _capitalize from 'lodash-es/capitalize'
import { User, UserConverter } from '~/plugins/user'

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

        // Get user claims
        // Ref: https://firebase.google.com/docs/auth/admin/custom-claims
        user.getIdTokenResult().then((idTokenResult) => {
          this.$store.commit('setIdTokenResult', idTokenResult)
        })
      } else {
        // User is signed out; redirect to login page
        this.$store.commit('setUser', null)
        this.$store.commit('setIdTokenResult', null)
        this.$router.push({ name: 'login' })
      }
    })
  },
  methods: {
    getUser () {
      const ref = doc(this.$db, `benutzer/${this.$auth.currentUser.uid}`).withConverter(UserConverter)
      getDoc(ref).then((docSnap) => {
        if (docSnap.exists()) {
          // Successfully retrieved user data from the db.
          this.redirectToDashboard(docSnap.data())
        } else {
          // No user data was found in the database, which means the user has just signed up.
          this.createUser()
          
        }
      })
    },
    createUser () {
      const displayName = _capitalize(this.$auth.currentUser.email.split('.')[0])
      const user = new User(displayName, [], [])

      // Add a new document in collection "users"
      setDoc(doc(this.$db, 'benutzer', this.$auth.currentUser.uid).withConverter(UserConverter), user)
      .then((docSnap) => {
        this.redirectToDashboard()
      })
      .catch((error) => {
        // Couldn't create user data document
        this.$toast({ content: error, color: 'error' })
      })
    },
    redirectToDashboard (user) {
      this.$store.commit('setUser', user)
      this.$router.push({ name: 'dashboard' })
    }
  }
}
</script>
