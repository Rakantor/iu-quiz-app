<template>
  <v-container>
    <v-sheet class="rounded-lg pa-4">
      <v-row align="center">
        <v-col cols="auto" style="position: relative">
          <v-avatar size="200">
            <v-img src="https://avatarfiles.alphacoders.com/207/207426.png"></v-img>
          </v-avatar>
          <v-btn fab absolute dark style="bottom: 15px; right: 15px" @click="changeProfilePic">
            <v-icon>mdi-account-edit</v-icon>
          </v-btn>
        </v-col>
        <v-col>
          <div class="text-h4">{{ userFullName }}</div>
          <div class="text-h6 text--secondary">{{ userRole }}</div>
          <v-spacer class="my-6"></v-spacer>
          <div class="text-subtitle-1 text--secondary">Registriert: {{ formatDate($auth.currentUser.metadata.creationTime) }}</div>
          <div class="text-subtitle-1 text--secondary">Letzter Login: {{ formatDate($auth.currentUser.metadata.lastSignInTime) }}</div>
        </v-col>
        <v-col cols="12">
          <v-divider></v-divider>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-text-field v-model="displayName" label="Anzeigename" counter="15" :maxlength="15"></v-text-field>
          <v-text-field v-model="fullName" label="Vollständiger Name" disabled></v-text-field>
          <v-text-field v-model="email" label="E-Mail-Adresse" disabled></v-text-field>
          <v-btn depressed color="primary" :loading="loading" @click="save">
            Änderungen speichern
          </v-btn>
          <v-btn outlined color="primary" @click="logout">
            <v-icon left>mdi-logout-variant</v-icon>
            Logout
          </v-btn>
        </v-col>
      </v-row>
    </v-sheet>
  </v-container>
</template>

<script>
import { signOut } from 'firebase/auth'
import { doc, updateDoc } from 'firebase/firestore'
import _capitalize from 'lodash-es/capitalize'

export default {
  name: 'UserPage',
  data () {
    return {
      fullName: '',
      displayName: '',
      email: '',
      loading: false
    }
  },
  computed: {
    userFullName () {
      const nameParsed = this.$auth.currentUser.email.split('@')[0]
      const nameParts = []

      for (const namePart of nameParsed.split('.')) {
        nameParts.push(_capitalize(namePart))
      }

      return nameParts.join(' ')
    },
    userRole () {
      const isTutor = this.$auth.currentUser.email.endsWith('@iu.org')
      const isAdmin = this.$store.getters.isAdmin
      if (isAdmin) return 'Admin'
      else if (isTutor) return 'Tutor'
      else return 'Student'
    }
  },
  created () {
    this.fullName = this.userFullName
    this.displayName = this.$store.state.user.displayName
    this.email = this.$auth.currentUser.email
  },
  methods: {
    formatDate (str) {
      return new Date(str).toLocaleString('de-DE')
    },
    changeProfilePic () {
      // TODO
      this.$toast({ content: 'Diese Funktion ist in der Demo-Version nicht verfügbar.', color: 'info', timeout: 3000 })
    },
    save () {
      const newDisplayName = this.displayName.trim()
      if (!newDisplayName || newDisplayName === this.$store.state.user.displayName) return

      this.loading = true
      const ref = doc(this.$db, `benutzer/${this.$auth.currentUser.uid}`)
      updateDoc(ref, {
        anzeigename: newDisplayName
      }).then((empty) => {
        this.$store.commit('setUserDisplayName', newDisplayName)
        this.$toast({ content: 'Die Änderungen wurden gespeichert!', color: 'success' })
      }).catch((error) => {
        // Failed to update user profile; display error message
        this.$toast({content: error, color: 'error'})
      }).then(() => {
        this.loading = false
      })
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
