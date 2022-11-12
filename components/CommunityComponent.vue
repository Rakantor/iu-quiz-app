<template>
  <v-card>
    <v-card-title>Community Fragen</v-card-title>
    <OpenEndedQuestionsList />
    <v-divider></v-divider>
    <v-expansion-panels accordion class="text-subtitle-1 font-weight-medium">
      <v-expansion-panel>
        <v-expansion-panel-header>
          Eigene Frage einsenden
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <AddOpenEndedQuestion />
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-card>
</template>

<script>
import { collection, getDocs } from 'firebase/firestore'
import { OpenEndedQuestionConverter } from '~/plugins/open-ended-question'

export default {
  name: 'CommunityComponent',
  computed: {
    courseId () {
      return this.$store.state.selectedCourse
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
        const questions = []
        querySnapshot.forEach((doc) => {
          // Convert to OpenEndedQuestion object
          questions.push(doc.data())
        })
        this.$store.commit('setOpenEndedQuestions', questions)
      }).catch((error) => {
        // Failed to fetch questions from the database; display error message
        this.$toast({ content: error, color: 'error' })
      })
    }
  }
}
</script>