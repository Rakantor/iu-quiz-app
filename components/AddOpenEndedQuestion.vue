<template>
  <v-card>
    <ValidationObserver ref="observer" v-slot="{ invalid }">
      <form @submit.prevent="submit">
        <v-card-title style="cursor: pointer;" @click="showBody = !showBody">
          <span class="flex-grow-1 flex-shrink-0 text-subtitle-1 font-weight-medium">Eigene Frage einreichen</span>
          <v-btn icon @click.stop="showBody = !showBody">
            <v-icon>{{ showBody ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
          </v-btn>
        </v-card-title>
        <v-expand-transition>
          <div v-show="showBody">
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
              <v-btn v-if="$config.NODE_ENV !== 'production'" depressed color="warning" @click="addQuestionsForTesting">+10 Fragen</v-btn>
              <v-spacer />
              <v-btn text color="primary" @click="clear">Reset</v-btn>
              <v-btn type="submit" depressed color="primary" :loading="loading" :disabled="invalid">Einreichen</v-btn>
            </v-card-actions>
          </div>
        </v-expand-transition>
      </form>
    </ValidationObserver>
  </v-card>
</template>

<script>
import { collection, doc, addDoc, writeBatch } from 'firebase/firestore'
// We use vee-validate@3 for form validation.
// https://vee-validate.logaretm.com/v3/guide/basics.html
import { ValidationProvider, ValidationObserver, extend } from 'vee-validate'
import { required, min } from 'vee-validate/dist/rules'
import dedent from 'dedent'
import { OpenEndedQuestion, OpenEndedQuestionConverter } from '~/plugins/open-ended-question'

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
      showBody: false,
      loading: false,
      question: '',
      solution: ''
    }
  },
  methods: {
    submit () {
      this.loading = true

      const q = new OpenEndedQuestion(
        null,
        this.question,
        this.solution,
        this.$auth.currentUser.uid, // Ref: https://firebase.google.com/docs/reference/js/v8/firebase.User
        Date.now() / 1000, // Current UNIX timestamp in seconds
        [],
        {}
      )

      // Add a new document with a generated id.
      addDoc(collection(this.$db, `kurse/${this.$store.state.selectedCourse}/fragenOffen`).withConverter(OpenEndedQuestionConverter), q)
      .then((docRef) => {
        // Successfully added new question to database
        q.id = docRef.id
        this.$emit('added', q)
        this.$toast({ content: 'Deine Frage wurde hinzugefügt!', color: 'success' })
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
    },
    // TODO: This method is used for writing test data to the database and should be removed in production
    addQuestionsForTesting () {
      this.loading = true
      const solution = 
        dedent`Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
        sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
        sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
        Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
        sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
        sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
        Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr,
        sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
        sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
        Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
        
        Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat,
        vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim
        qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi.
        Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod
        tincidunt ut laoreet dolore magna aliquam erat volutpat.`
      const batch = writeBatch(this.$db)

      for (let i = 1; i <= 10; i++) {
        // Generate random integer between 1 (inlcusive) and 1000 (inclusive)
        const randomNumber = Math.floor(Math.random() * (1000 - 1 + 1) + 1)

        const q = new OpenEndedQuestion(
          null,
          `Frage ${randomNumber}: Erläutere den Sinn des Lebens.`,
          solution,
          this.$auth.currentUser.uid, // Ref: https://firebase.google.com/docs/reference/js/v8/firebase.User
          Date.now() / 1000, // Current UNIX timestamp in seconds
          [],
          {}
        )

        const questionRef = doc(collection(this.$db, `kurse/${this.$store.state.selectedCourse}/fragenOffen`).withConverter(OpenEndedQuestionConverter))
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