<template>
  <v-app :style="{ background: $vuetify.theme.themes[theme].background }">
    <v-main>
      <v-container fill-height>
        <v-card max-width="500" class="mx-auto">
          <v-card-title>
            Verifiziere deine E-Mail-Adresse!
          </v-card-title>
          <v-card-text>
            <p>Wir haben eine E-Mail an deine E-Mail-Adresse <strong>{{ userEmail }}</strong> geschickt.
            Folge dem Link in der E-Mail, um dein Konto zu verifizieren.</p>
            <p>Solltest du keine E-Mail erhalten haben, wirf einen Blick in deinen Spam-Ordner.</p>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="logout">Logout</v-btn>
            <v-btn depressed color="primary" :loading="loading" @click="sendVerificationEmail">E-Mail erneut senden</v-btn>
          </v-card-actions>
        </v-card>
      </v-container>
    </v-main>
    <FooterApp />
    <ToastComponent />
  </v-app>
</template>

<script>
import { sendEmailVerification, signOut } from 'firebase/auth'

export default {
  name: 'UnverifiedLayout',
  layout: 'unverified',
  data () {
    return {
      loading: false
    }
  },
  computed: {
    theme () {
      return (this.$vuetify.theme.dark) ? 'dark' : 'light'
    },
    userEmail () {
      return this.$auth.currentUser.email
    }
  },
  methods: {
    sendVerificationEmail () {
      this.loading = true

      sendEmailVerification(this.$auth.currentUser)
      .then((empty) => {
        // Email verification sent!
        this.$toast({
          content: 'Erfolg! Folge dem Link in der E-Mail, die wir dir gerade geschickt haben, um deine Registrierung abzuschließen!',
          color: 'success',
          timeout: -1
        })
      })
      .catch((error) => {
        this.$toast({ content: error, color: 'error' })
      })
      .then(() => { this.loading = false })
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
