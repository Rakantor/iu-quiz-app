<template>
  <v-card v-if="newQuestions.length > 0">
    <v-card-title>
      <v-badge color="primary" offset-x="-5" offset-y="10" :content="newQuestions.length">
        Neue Fragen
      </v-badge>
    </v-card-title>
    <v-window
      continuous
      show-arrows
    >
      <v-window-item
        v-for="question, index in newQuestions" :key="index"
      >
        <v-card max-width="500" class="mx-auto">
          <v-card-title>{{ question.question }}</v-card-title>
          <v-card-text>
            <p>
              <ol v-for="answer, i in question.answers" :key="i" :start="i+1">
                <li>{{ answer }}</li>
              </ol>
            </p>
            <p>Richtig: {{ question.correctAnswer }}</p>
            <p v-if="question.comments.length > 0">
              User-Kommentar:<br />
              {{ question.comments[0] }}
            </p>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-btn icon large color="success" @click="updateQuestion(question, true)">
              <v-icon>mdi-check</v-icon>
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn icon large color="error" @click="updateQuestion(question, false)">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-window-item>
    </v-window>
  </v-card>
</template>

<script>
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore'
import { ClosedEndedQuestionConverter, states } from '~/plugins/closed-ended-question'

export default {
  name: 'TutorPanel',
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
  computed: {
    newQuestions () {
      return this.questions.filter(q => q.status === states.new)
    }
  },
  created () {
    this.getQuestions()
  },
  methods: {
    getQuestions () {
      // Create a reference to the closed-ended questions collection of the currently selected course
      const questionsRef = collection(this.$db, `kurse/${this.courseId}/fragenGeschlossen`).withConverter(ClosedEndedQuestionConverter)

      // Execute the query
      getDocs(questionsRef).then((querySnapshot) => {
        this.questions = []
        querySnapshot.forEach((doc) => {
          // Convert to ClosedEndedQuestion object
          this.questions.push(doc.data())
        })
      }).catch((error) => {
        // Failed to fetch questions from the database; display error message
        this.$toast({ content: error, color: 'error' })
      })
    },
    updateQuestion (question, approve) {
      question.status = approve ? states.approved : states.declined
      const ref = doc(this.$db, `kurse/${this.courseId}/fragenGeschlossen/${question.id}`)

      updateDoc(ref, {
        status: question.status
      }).then((empty) => {
        this.$toast({ content: 'Die Frage wurde aktualisiert.', color: 'success', timeout: 2000 })
      }).catch((error) => {
        // Failed to update the question; display error message
        this.$toast({content: error, color: 'error'})
      })
    }
  }
}
</script>