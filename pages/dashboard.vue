<template>
  <v-container v-if="!coursesLoaded" fluid fill-height>
    <v-card color="transparent" class="mx-auto">
      <v-progress-circular indeterminate color="primary" size="32"></v-progress-circular>
    </v-card>
  </v-container>
  <v-container v-else fluid>
    <v-row>
      <v-col cols="12">
        <v-tabs v-model="tab" color="primary" background-color="transparent" centered>
          <v-tab>Meine Kurse ({{ Object.keys(userCourses).length }})</v-tab>
          <v-tab>Alle Kurse ({{ Object.keys(allCourses).length }})</v-tab>
        </v-tabs>
      </v-col>
      <v-col cols="12">
        <v-tabs-items v-model="tab" style="background-color: transparent !important;">
          <v-tab-item>
            <CourseList :courses="userCourses" />
          </v-tab-item>
          <v-tab-item>
            <v-row v-if="$store.getters.isAdmin">
              <v-col cols="12">
                <AddCourse />
              </v-col>
            </v-row>
            <CourseList :courses="allCourses" />
          </v-tab-item>
        </v-tabs-items>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import _cloneDeep from 'lodash-es/cloneDeep'
import { collection, getDocs } from 'firebase/firestore'
import _isEmpty from 'lodash-es/isEmpty'

export default {
  name: 'DashboardPage',
  layout ({ $auth }) {
    // Ref: https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth#currentuser
    return $auth.currentUser.emailVerified ? 'default' : 'unverified'
  },
  data () {
    return {
      coursesLoaded: false,
      tab: 0
    }
  },
  computed: {
    allCourses () {
      return this.$store.state.courses
    },
    userCourses () {
      return this.$store.getters.getFavoriteCourses
    }
  },
  created () {
    // Load all courses from the database and convert to JS object
    getDocs(collection(this.$db, 'kurse'))
    .then(querySnapshot => {
      const courses = {}
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        courses[doc.id] = doc.data()
      })

      // Save courses in Vuex store
      this.$store.commit('setCourses', _cloneDeep(courses))

      // Switch to the "All Courses" tab (index = 1) if the student doesn't have any favorite courses
      this.tab = _isEmpty(this.userCourses) ? 1 : 0
      this.coursesLoaded = true
    })
    .catch((error) => {
      // Couldn't get list of courses from the db; display error message
      this.$toast({ content: error, color: 'error' })
    })
  }
}
</script>
