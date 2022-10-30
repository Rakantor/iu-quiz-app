<template>
  <v-expansion-panels>
    <v-expansion-panel
      v-for="(item, i) in questions"
      :key="i"
    >
      <v-expansion-panel-header>
        {{ item.question }}
      </v-expansion-panel-header>
      <v-expansion-panel-content class="text-pre-wrap">
        <div class="text-pre-wrap">{{ item.solution }}</div>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script>
import { collection, getDocs } from 'firebase/firestore'
import { OpenEndedQuestionConverter } from '~/plugins/open-ended-question'

export default {
  name: 'CoopComponent',
  props: {
    courseID: {
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
      const questionsRef = collection(this.$db, `kurse/${this.courseID}/fragenOffen`).withConverter(OpenEndedQuestionConverter)

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
    }
  }
}
</script>