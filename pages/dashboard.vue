<template>
  <v-container>
    <v-row>
      <v-col v-for="course, id in courses" :key="id">
        <v-card :width="vCardSize" :height="vCardSize" align="center" justify="center" @click="openCourse">
          {{ id.toUpperCase() }} - {{ course.name }}
        </v-card>
      </v-col>
      <v-col cols="12" class="text-center">
        <blockquote class="blockquote">
          &#8220;First, solve the problem. Then, write the code.&#8221;
          <footer>
            <small>
              <em>&mdash;John Johnson</em>
            </small>
          </footer>
        </blockquote>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { collection, getDocs } from 'firebase/firestore'

export default {
  name: 'DashboardPage',
  layout ({ $auth }) {
    // Ref: https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth#currentuser
    return $auth.currentUser.emailVerified ? 'default' : 'unverified'
  },
  data () {
    return {
      vCardSize: 150
    }
  },
  computed: {
    courses () {
      return this.$store.state.courses
    }
  },
  created () {
    // Load all courses from the database and convert to JS object
    getDocs(collection(this.$db, 'kurse')).then(querySnapshot => {
      const courses = {}
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        courses[doc.id] = doc.data()
      })

      // Save courses in Vuex store
      this.$store.commit('setCourses', courses)
    })
  },
  methods: {
    openCourse () {
      // TODO
      this.$toast({ content: 'TODO: Eigener Bereich für jeden Kurs.', color: 'info', timeout: 3000 })
    }
  }
}
</script>
