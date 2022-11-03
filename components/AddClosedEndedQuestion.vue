<template>
  <v-card>
    <ValidationObserver ref="observer" v-slot="{ invalid }">
      <form @submit.prevent="submit">
        <v-card-title>Geschlossene Frage einreichen</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <ValidationProvider v-slot="{ errors }" name="frage" rules="required">
                <v-text-field v-model="question" required label="Frage" :error-messages="errors"></v-text-field>
              </ValidationProvider>
            </v-col>
            <v-col v-for="(n, index) in 4" :key="index">
              <ValidationProvider v-slot="{ errors }" :name="`antwort${n}`" rules="required">
                <v-text-field v-model="answers[index]" required :label="`Antwort #${n}`" :error-messages="errors"></v-text-field>
              </ValidationProvider>
            </v-col>
            <v-col cols="12">
              <ValidationProvider v-slot="{ errors }" name="richtig" rules="required">
                <v-select v-model="correctAnswer" required :items="answers" label="Richtige Antwort" :error-messages="errors"></v-select>
              </ValidationProvider>
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="comment"
                label="(Optional) Anmerkung"
                persistent-hint
                hint="Nur der Tutor kann deine Anmerkung sehen."
              >
                <template #message="{ message }">
                  <v-icon small>mdi-information</v-icon>
                  <span>{{ message }}</span>
                </template>
              </v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn v-if="$config.NODE_ENV !== 'production'" depressed color="warning" @click="addQuestionsForTesting">+10 Fragen</v-btn>
          <v-spacer />
          <v-btn text color="primary" @click="clear">Reset</v-btn>
          <v-btn type="submit" depressed color="primary" :loading="loading" :disabled="invalid">Einreichen</v-btn>
        </v-card-actions>
      </form>
    </ValidationObserver>
  </v-card>
</template>

<script>
import { collection, doc, addDoc, writeBatch } from 'firebase/firestore'
// We use vee-validate@3 for form validation.
// https://vee-validate.logaretm.com/v3/guide/basics.html
import { ValidationProvider, ValidationObserver, extend } from 'vee-validate'
import { required } from 'vee-validate/dist/rules'
import { ClosedEndedQuestion, ClosedEndedQuestionConverter, states } from '~/plugins/closed-ended-question'

// Override the default error message of required fields
extend('required', {
  ...required,
  message: 'Pflichtfeld'
})

export default {
  components: {
    ValidationProvider,
    ValidationObserver
  },
  data () {
    return {
      loading: false,
      question: '',
      answers: [],
      correctAnswer: null,
      comment: ''
    }
  },
  methods: {
    isAuthorized () {
      const isTutor = this.$auth.currentUser.email.endsWith('@iu.org')
      const isAdmin = this.$store.getters.isAdmin
      return isTutor || isAdmin
    },
    submit () {
      this.loading = true

      const q = new ClosedEndedQuestion(
        null,
        this.question,
        this.answers,
        this.correctAnswer,
        this.$auth.currentUser.uid, // Ref: https://firebase.google.com/docs/reference/js/v8/firebase.User
        Date.now() / 1000, // Current UNIX timestamp in seconds
        this.comment ? [this.comment] : [],
        this.isAuthorized() ? states.approved : states.new
      )

      // Add a new document with a generated id
      addDoc(collection(this.$db, `kurse/${this.$store.state.selectedCourse}/fragenGeschlossen`).withConverter(ClosedEndedQuestionConverter), q)
      .then((docRef) => {
        // Successfully added new question to database
        const content = this.isAuthorized()
          ? 'Die Frage wurde hinzugefügt!'
          : 'Deine Frage wurde eingereicht und wartet auf Bestätigung durch den Tutor!'
        this.$toast({ content, color: 'success' })
      })
      .catch((error) => {
        // Failed to add question to database; display error message
        this.$toast({content: error, color: 'error'})
      })
      .then(() => {
        this.loading = false
      })
    },
    clear () {
      this.question = ''
      this.answers = []
      this.correctAnswer = null
      this.comment = ''
      this.$refs.observer.reset()
    },
    // TODO: This method is used for writing test data to the database and should be removed in production
    addQuestionsForTesting () {
      this.loading = true
      const answers = ['Antwort 1', 'Antwort 2', 'Antwort 3', 'Antwort 4']
      const batch = writeBatch(this.$db)

      for (let i = 1; i <= 10; i++) {
        // Generate random integer between 1 (inlcusive) and 1000 (inclusive)
        const randomNumber = Math.floor(Math.random() * (1000 - 1 + 1) + 1)

        // Generate random integer between 0 (inlcusive) and 3 (inclusive)
        const correctAnswer = Math.floor(Math.random() * (3 + 1))

        const q = new ClosedEndedQuestion(
          null,
          `Frage ${randomNumber}: Was ist die richtige Antwort? (Richtig: ${correctAnswer+1})`,
          answers,
          answers[correctAnswer],
          this.$auth.currentUser.uid, // Ref: https://firebase.google.com/docs/reference/js/v8/firebase.User
          Date.now() / 1000, // Current UNIX timestamp in seconds
          [],
          states.approved
        )

        const questionRef = doc(collection(this.$db, `kurse/${this.$store.state.selectedCourse}/fragenGeschlossen`).withConverter(ClosedEndedQuestionConverter))
        batch.set(questionRef, q)
      }

      // Commit the batch
      batch.commit().then((empty) => {
        // Successfully added new questions to the database
        this.$toast({ content: '10 Fragen wurden hinzugefügt!', color: 'success' })
      }).catch((error) => {
        // Failed to add questions to the database; display error message
        this.$toast({content: error, color: 'error'})
      }).then(() => {
        this.loading = false
      })
    }
  }
}
</script>