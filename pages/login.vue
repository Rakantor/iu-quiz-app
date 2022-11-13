<template>
  <v-container fill-height>
    <!-- TODO: For demo purposes only. Delete in production. -->
    <v-row justify="center" align="center">
    <v-col cols="12"><DemoInfoDialog /></v-col>
    <v-col cols="12">
    <!-- -->
    <v-card width="500" elevation="12" class="mx-auto">
      <v-card-title class="mb-3">
        <span class="text-h4 text-md-h3 font-weight-black flex-grow-1 flex-shrink-0">Quiz App</span>
        <v-img src="/iu-logo.svg" :height="$vuetify.breakpoint.mdAndUp ? 40 : 30" contain class="flex-grow-0 flex-shrink-1"></v-img>
      </v-card-title>
      <v-card-text v-if="existingUser">
        <v-form ref="loginForm" v-model="valid">
          <v-text-field
            v-model="email"
            label="Deine IU E-Mail-Adresse"
            prepend-icon="mdi-account-circle"
            @keyup.enter="signIn"
          />
          <v-text-field
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            label="Passwort"
            prepend-icon="mdi-lock"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append="showPassword = !showPassword"
            @keyup.enter="signIn"
          />
        </v-form>
        <v-btn
          block
          depressed
          color="primary"
          :loading="loading"
          :disabled="loading"
          class="mt-3"
          @click="signIn"
        >
          Anmelden
        </v-btn>
        <v-btn text block color="primary" class="mt-3" @click="existingUser = false">Noch kein Konto?</v-btn>
        <v-btn text block color="primary" @click="showPwResetDialog = true">Passwort vergessen?</v-btn>
      </v-card-text>
      <v-card-text v-else>
        <v-form ref="signupForm" v-model="valid">
          <v-text-field
            v-model="email"
            :rules="emailRules"
            label="Deine IU E-Mail-Adresse"
            prepend-icon="mdi-account-circle"
            @keyup.enter="signUp"
          />
          <v-text-field
            v-model="password"
            :rules="passwordRules"
            :type="showPassword ? 'text' : 'password'"
            label="Passwort"
            prepend-icon="mdi-lock"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append="showPassword = !showPassword"
            @keyup.enter="signUp"
          />
          <v-text-field
            v-model="passwordConfirm"
            :rules="passwordConfirmRules"
            :type="showPassword ? 'text' : 'password'"
            label="Passwort bestätigen"
            prepend-icon="mdi-lock"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append="showPassword = !showPassword"
            @keyup.enter="signUp"
          />
          <v-checkbox
            v-model="checkbox"
            :rules="[v => !!v || '']"
            required
          >
            <template #label>
              <div>
                Ich stimme den Nutzungs- und Datenschutzbestimmungen zu.
              </div>
            </template>
          </v-checkbox>
        </v-form>
        <v-btn
          block
          depressed
          color="primary"
          :loading="loading"
          :disabled="loading"
          @click="signUp"
        >
          Registrieren
        </v-btn>
        <v-btn
          text
          block
          color="primary"
          class="mt-3"
          @click="existingUser = true"
        >
          Bereits registriert?
        </v-btn>
      </v-card-text>
    </v-card>
    </v-col>
    </v-row>
    <v-dialog v-model="showPwResetDialog" width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Passwort zurücksetzen</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid" @submit.prevent="resetPassword">
            <v-text-field v-model="email" autofocus label="Email" required></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="showPwResetDialog = false">Abbrechen</v-btn>
          <v-btn color="primary" depressed :loading="loading" :disabled="loading" @click="resetPassword">Link senden</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth'

export default {
  name: 'LoginPage',
  layout: 'empty',
  data () {
    return {
      existingUser: true,
      loading: false,
      valid: false,
      showPassword: false,
      showPwResetDialog: false,
      defaultErrorReqField: 'Pflichtfeld',
      email: '',
      emailRules: [
        v => !!v || this.defaultErrorReqField,
        v => /^\w+([.-]?\w+)*@(iubh\.de|iubh-fernstudium\.de|iu\.org)+$/.test(v) || 'Keine gültige IU E-Mail-Adresse'
      ],
      password: '',
      passwordRules: [
        v => !!v || this.defaultErrorReqField,
        v => /^(?=.*?[a-zA-Z])(?=.*?[0-9]).{8,}$/.test(v) || 'Mindestens 8 Zeichen, 1 Buchstabe und 1 Zahl'
      ],
      passwordConfirm: '',
      passwordConfirmRules: [
        v => !!v || this.defaultErrorReqField,
        v => v === this.password || 'Passwörter stimmen nicht überein'
      ],
      checkbox: false
    }
  },
  methods: {
    signUp () {
      this.$refs.signupForm.validate()
      if (this.valid) {
        this.loading = true

        createUserWithEmailAndPassword(this.$auth, this.email, this.password)
        .then((userCredential) => {
          // User signed up successfully.
          // The authentication state observer will redirect the user to the main page (dashboard),
          // see pages/index.vue
          sendEmailVerification(userCredential.user)
          .then(() => {
            // Email verification sent!
            // Nothing to do here...
          })
        })
        .catch((error) => {
          // Sign up failed; display error message
          const errorCode = error.code
          const errorMessage = error.message
          this.$toast({content: `${errorCode}: ${errorMessage}`, color: 'error'})
        })
        .then(() => {
          this.loading = false
        })
      }
    },
    signIn () {
      this.loading = true

      signInWithEmailAndPassword(this.$auth, this.email, this.password)
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
    },
    resetPassword () {
      this.$refs.form.validate()
      if (this.valid) {
        this.loading = true
      
        sendPasswordResetEmail(this.$auth, this.email.trim())
        .then(() => {
          // Password reset email sent!
          this.$toast({
            content:
              `Wir haben dir einen Link zur Passwortrücksetzung an deine E-Mail-Adresse geschickt!
              Solltest du keine E-Mail erhalten haben, überprüfe deinen Spam-Ordner.`,
            color: 'success',
            timeout: -1
          })
        })
        .catch((error) => {
          // Failed to send password reset email; display error message
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
}
</script>
