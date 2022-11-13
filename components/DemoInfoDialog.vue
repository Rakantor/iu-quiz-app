<!-- TODO: This component is for demo purposes only. Delete in production. -->

<template>
  <v-dialog v-model="show" width="500">
    <template #activator="{ on, attrs }">
      <v-btn dark color="red lighten-2" :style="{left: '50%', transform:'translateX(-50%)'}" v-bind="attrs" v-on="on">
        <v-icon left>mdi-alert-circle-outline</v-icon>
        Mit Demo-Account Anmelden
      </v-btn>
    </template>
    <v-card elevation="12" class="mx-auto">
      <v-card-title>Information zu Demo-Accounts</v-card-title>
      <v-card-text>
        <p>
          Da die E-Mails zur <strong>Kontoverifizierung</strong> und Passwortrücksetzung meist vom Spam-Filter
          der IU-Mailserver geblockt werden, kann im Rahmen dieser Demo alternativ mit einem Demo-Account angemeldet werden.
        </p>
        <v-row>
          <v-col cols="12" sm="4">
            <v-btn depressed block color="primary" @click="signIn('student')">Student</v-btn>
          </v-col>
          <v-col cols="12" sm="4">
            <v-btn depressed block color="primary" @click="signIn('tutor')">Tutor</v-btn>
          </v-col>
          <v-col cols="12" sm="4">
            <v-btn depressed block color="primary" @click="signIn('admin')">Admin</v-btn>
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text color="primary" @click="show = false">Schließen</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { signInWithEmailAndPassword } from 'firebase/auth'

export default {
  data () {
    return {
      show: false,
      accounts: {
        student: {
          email: 'max.muster.test@iubh-fernstudium.de',
          password: '295B&&r374T!^973'
        },
        tutor: {
          email: 'tutor.test@iu.org',
          password: '3#2&%648n5@E3y83'
        },
        admin: {
          email: 'admin.test@iu.org',
          password: 'x7^@72U9y224#7%5'
        }
      },
      loading: false
    }
  },
  methods: {
    signIn (type) {
      this.loading = true

      signInWithEmailAndPassword(this.$auth, this.accounts[type].email, this.accounts[type].password)
      .then((userCredential) => {
        // User signed in successfully.
        // The authentication state observer will redirect the user to the main page (dashboard),
        // see pages/index.vue
      })
      .catch((error) => {
        // Sign in failed; display error message
        const errorCode = error.code
        const errorMessage = error.message
        this.$toast({content: `${errorCode}: ${errorMessage}`, color: 'error'})
      })
      .then(() => {
        this.loading = false
      })
    }
  }
}
</script>