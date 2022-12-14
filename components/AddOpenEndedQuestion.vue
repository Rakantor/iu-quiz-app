<template>
  <v-card>
    <ValidationObserver ref="observer" v-slot="{ invalid }">
      <form @submit.prevent="submit">
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <ValidationProvider v-slot="{ errors }" name="Kapitelnummer" :rules="{ regex: /^[1-9]+$/ }">
                <v-text-field
                  v-model="chapter"
                  filled
                  hint="Freilassen, wenn deine Frage das Wissen aus mehreren Kapiteln vereint."
                  persistent-hint
                  maxlength="1"
                  label="Kapitelnummer"
                  :error-messages="errors"
                ></v-text-field>
              </ValidationProvider>
            </v-col>
            <v-col cols="12">
              <ValidationProvider v-slot="{ errors }" name="Frage/Aufgabenstellung" :rules="{ required: true, min: 20, max: questionMaxLength }">
                <v-textarea
                  v-model="question"
                  required
                  auto-grow
                  filled
                  counter
                  :maxlength="questionMaxLength"
                  label="Frage/Aufgabenstellung"
                  :error-messages="errors"
                ></v-textarea>
              </ValidationProvider>
            </v-col>
            <v-col cols="12">
              <ValidationProvider v-slot="{ errors }" name="Musterlösung" :rules="{ required: true, min: 50, max: solutionMaxLength }">
                <v-textarea
                  v-model="solution"
                  required
                  auto-grow
                  filled
                  counter
                  :maxlength="solutionMaxLength"
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
          <v-btn text color="primary" @click="reset">Reset</v-btn>
          <v-btn v-if="editing" outlined color="primary" @click="$emit('close')">Abbrechen</v-btn>
          <v-btn
            type="submit"
            depressed
            color="primary"
            :loading="loading"
            :disabled="invalid"
          >
            {{ editing ? 'Absenden' : 'Einreichen' }}
          </v-btn>
        </v-card-actions>
      </form>
    </ValidationObserver>
  </v-card>
</template>

<script>
import { collection, doc, addDoc, setDoc, writeBatch } from 'firebase/firestore'
// We use vee-validate@3 for form validation.
// https://vee-validate.logaretm.com/v3/guide/basics.html
import { ValidationProvider, ValidationObserver, extend } from 'vee-validate'
import { required, min, max, regex } from 'vee-validate/dist/rules'
import dedent from 'dedent'
import _isEmpty from 'lodash-es/isEmpty'
import _isEqual from 'lodash-es/isEqual'
import { OpenEndedQuestion, OpenEndedQuestionConverter } from '~/plugins/open-ended-question'

extend('required', {
  ...required,
  message: 'Pflichtfeld'
})

extend('min', {
  ...min,
  message: '{_field_} muss mindestens {length} Zeichen lang sein.'
})

extend('max', {
  ...max,
  message: '{_field_} darf maximal {length} Zeichen lang sein.'
})

extend('regex', {
  ...regex,
  message: '{_field_} muss eine Zahl von 1-9 sein.'
})

export default {
  components: {
    ValidationProvider,
    ValidationObserver
  },
  props: {
    openEndedQuestion: OpenEndedQuestion
  },
  data () {
    return {
      questionMaxLength: 250,
      solutionMaxLength: 1500,
      chapter: null,
      question: '',
      solution: '',
      loading: false
    }
  },
  computed: {
    editing () {
      return !_isEmpty(this.openEndedQuestion)
    }
  },
  watch: {
    openEndedQuestion () {
      this.reset()
    }
  },
  mounted () {
    this.reset()
  },
  methods: {
    submit () {
      // Remove extra spaces at the start and end of the string (trim),
      // then remove extra spaces between words (1st replace),
      // then remove extra line breaks so that there's max 1 empty line between paragraphs (2nd replace).
      this.question = this.question.trim().replace(/ +/g, ' ').replace(/[\r\n]{3,}/g, '\n\n')
      this.solution = this.solution.trim().replace(/ +/g, ' ').replace(/[\r\n]{3,}/g, '\n\n')

      // Wait until the models are updated in the UI
      this.$nextTick(() => {
        this.$refs.observer.validate().then((success) => {
          if (!success) return
          this.editing ? this.updateQuestion() : this.createQuestion()
        })
      })
    },
    createQuestion () {
      const q = new OpenEndedQuestion(
        null,
        this.chapter,
        this.question,
        this.solution,
        this.$auth.currentUser.uid,
        Date.now() / 1000, // Current UNIX timestamp in seconds
        [],
        {}
      )

      // Add a new document with a generated id
      this.loading = true
      addDoc(collection(this.$db, `kurse/${this.$store.state.selectedCourse}/fragenOffen`).withConverter(OpenEndedQuestionConverter), q)
      .then((docRef) => {
        // Successfully added new question to database
        q.id = docRef.id
        this.$store.commit('addOpenEndedQuestion', q)
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
    updateQuestion () {
      const q = new OpenEndedQuestion(
        this.openEndedQuestion.id,
        this.chapter,
        this.question,
        this.solution,
        this.openEndedQuestion.creator,
        this.openEndedQuestion.created,
        this.openEndedQuestion.helpful,
        this.openEndedQuestion.difficulty
      )

      // Abort if no changes were made to the question
      if (_isEqual(this.openEndedQuestion, q)) return

      // Update an existing document
      this.loading = true
      setDoc(doc(this.$db, `kurse/${this.$store.state.selectedCourse}/fragenOffen/${q.id}`).withConverter(OpenEndedQuestionConverter), q)
      .then((docRef) => {
        // Successfully updated the question
        this.$store.commit('addOpenEndedQuestion', q)
        this.$toast({ content: 'Die Frage wurde überarbeitet!', color: 'success' })
      })
      .catch((error) => {
        // Failed to add question to database; display error message
        this.$toast({content: error, color: 'error'})
      })
      .then(() => {
        this.loading = false
      })
    },
    reset () {
      if (this.editing) {
        this.chapter = this.openEndedQuestion.chapter
        this.question = this.openEndedQuestion.question
        this.solution = this.openEndedQuestion.solution
      } else {
        this.chapter = ''
        this.question = ''
        this.solution = ''
      }
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
        // Generate random integer between 1 (inclusive) and 1000 (inclusive)
        const randomNumber = Math.floor(Math.random() * (1000 - 1 + 1) + 1)
        // Generate random integer between 1 (inclusive) and 9 (inclusive)
        const chapter = Math.floor(Math.random() * (9 - 1 + 1) + 1)

        const q = new OpenEndedQuestion(
          null,
          chapter,
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