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
          <v-spacer />
          <v-btn text color="primary" @click="clear">Reset</v-btn>
          <v-btn type="submit" depressed color="primary" :loading="loading" :disabled="invalid">Einreichen</v-btn>
        </v-card-actions>
      </form>
    </ValidationObserver>
  </v-card>
</template>

<script>
import { doc, updateDoc, arrayUnion } from 'firebase/firestore'
// We use vee-validate@3 for form validation.
// https://vee-validate.logaretm.com/v3/guide/basics.html
import { ValidationProvider, ValidationObserver, extend } from 'vee-validate'
import { required } from 'vee-validate/dist/rules'

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
    submit () {
      this.loading = true

      const q = {
        ersteller: this.$auth.currentUser.uid, // Ref: https://firebase.google.com/docs/reference/js/v8/firebase.User
        erstellt: Date.now() / 1000, // Current UNIX timestamp in seconds
        frage: this.question,
        antworten: this.answers,
        richtig: this.answers.indexOf(this.correctAnswer),
        kommentare: this.comment ? [this.comment] : [],
        status: 'neu'
      }

      // Atomically add the new question to the "geschlossen" (fragen/{kursID}/geschlossen) array field.
      const questionsRef = doc(this.$db, 'fragen', this.$store.state.selectedCourse)
      updateDoc(questionsRef, {
        geschlossen: arrayUnion(q) // Ref: https://firebase.google.com/docs/firestore/manage-data/add-data#update_elements_in_an_array
      }).then((empty) => {
        // Successfully added new question to database
        this.$toast({ content: 'Deine Frage wurde eingereicht!', color: 'success' })
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
    }
  }
}
</script>