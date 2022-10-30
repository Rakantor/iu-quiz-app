<template>
  <v-app :style="{ background: $vuetify.theme.themes[theme].background }">
    <v-main>
      <v-container fill-height>
        <v-card max-width="500px" class="mx-auto">
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
import { sendEmailVerification } from 'firebase/auth'

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
      .then(() => {
        // Email verification sent!
        this.loading = false
        this.$toast({
          content: 'Erfolg! Folge dem Link in der E-Mail, die wir dir gerade geschickt haben, um deine Registrierung abzuschließen!',
          color: 'success',
          timeout: -1
        })
      })
    }
  }
}
</script>
