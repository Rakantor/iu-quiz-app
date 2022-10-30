<template>
  <v-container fluid>
    <v-row>
      <v-col v-for="(course, id) in courses" :key="id" cols="12" lg="6">
        <v-card flat width="100%" class="rounded-lg" @click="openCourse(id)">
          <v-row no-gutters class="flex-nowrap">
            <v-col cols="auto">
              <v-img
                src="https://www.onlinecollegeplan.com/wp-content/uploads/2018/05/computer-programming.jpg"
                :width="imgSize"
                :height="imgSize"
                class="rounded-l-lg"
              ></v-img>
            </v-col>
            <v-col cols="auto">
              <v-card-title class="text--secondary text-subtitle-1">{{ id.toUpperCase() }}</v-card-title>
              <v-card-subtitle class="text--primary text-h6 text-wrap">{{ course.name }}</v-card-subtitle>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import _cloneDeep from 'lodash-es/cloneDeep'
import { collection, getDocs } from 'firebase/firestore'
import { demoAccounts } from '~/components/DemoInfoDialog.vue'

export default {
  name: 'DashboardPage',
  layout ({ $auth }) {
    // Ref: https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth#currentuser
    // return $auth.currentUser.emailVerified ? 'default' : 'unverified'

    // TODO: For demo purposes only. Delete in production.
    return $auth.currentUser.emailVerified || demoAccounts.includes($auth.currentUser.email) ? 'default' : 'unverified'
  },
  data () {
    return {
      imgSize: 125
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
      this.$store.commit('setCourses', _cloneDeep(courses))
    })
  },
  methods: {
    openCourse (courseID) {
      this.$store.commit('setSelectedCourse', courseID)
      this.$router.push(`courses/${courseID}`)
    }
  }
}
</script>
