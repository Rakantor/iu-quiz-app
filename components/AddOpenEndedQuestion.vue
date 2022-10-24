<template>
  <v-card>
    <ValidationObserver ref="observer" v-slot="{ invalid }">
      <form @submit.prevent="submit">
        <v-card-title>Offene Frage einreichen</v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <ValidationProvider v-slot="{ errors }" name="Frage/Aufgabenstellung" rules="required|min:20">
                <v-textarea
                  v-model="question"
                  required
                  auto-grow
                  filled
                  counter
                  label="Frage/Aufgabenstellung"
                  :error-messages="errors"
                ></v-textarea>
              </ValidationProvider>
            </v-col>
            <v-col cols="12">
              <ValidationProvider v-slot="{ errors }" name="Musterlösung" rules="required|min:50">
                <v-textarea
                  v-model="solution"
                  required
                  auto-grow
                  filled
                  counter
                  label="Musterlösung"
                  :error-messages="errors"
                ></v-textarea>
              </ValidationProvider>
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
import { required, min } from 'vee-validate/dist/rules'

extend('required', {
  ...required,
  message: 'Pflichtfeld'
})

extend('min', {
  ...min,
  message: '{_field_} muss mindestens {length} Zeichen lang sein.'
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
      solution: ''
    }
  },
  methods: {
    submit () {
      this.loading = true

      const q = {
        ersteller: this.$auth.currentUser.uid, // Ref: https://firebase.google.com/docs/reference/js/v8/firebase.User
        erstellt: Date.now() / 1000, // Current UNIX timestamp in seconds
        frage: this.question,
        musterloesung: this.solution,
        bewertungen: [],
        schwierigkeit: []
      }

      // Atomically add the new question to the "offen" (fragen/{kursID}/offen) array field.
      const questionsRef = doc(this.$db, 'fragen', this.$store.state.selectedCourse)
      updateDoc(questionsRef, {
        offen: arrayUnion(q) // Ref: https://firebase.google.com/docs/firestore/manage-data/add-data#update_elements_in_an_array
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
      this.solution = ''
      this.$refs.observer.reset()
    }
  }
}
</script>