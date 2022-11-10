<template>
  <v-card>
    <v-card-title>Community Fragen</v-card-title>
    <OpenEndedQuestionsList :questions="questions" />
    <v-divider></v-divider>
    <AddOpenEndedQuestion @added="addQuestionToList" />
  </v-card>
</template>

<script>
import { collection, getDocs } from 'firebase/firestore'
import { OpenEndedQuestionConverter } from '~/plugins/open-ended-question'

export default {
  name: 'CoopComponent',
  props: {
    courseId: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      questions: []
    }
  },
  created () {
    this.getQuestions()
  },
  methods: {
    getQuestions () {
      // Create a reference to the open-ended questions collection of the currently selected course
      const questionsRef = collection(this.$db, `kurse/${this.courseId}/fragenOffen`).withConverter(OpenEndedQuestionConverter)

      // Execute the query
      getDocs(questionsRef).then((querySnapshot) => {
        this.questions = []
        querySnapshot.forEach((doc) => {
          // Convert to OpenEndedQuestion object
          this.questions.push(doc.data())
        })
      }).catch((error) => {
        // Failed to fetch questions from the database; display error message
        this.$toast({ content: error, color: 'error' })
      })
    },
    addQuestionToList (q) {
      this.questions.push(q)
    }
  }
}
</script>