<template>
  <v-container fluid class="pa-0">
    <v-sheet class="rounded-lg pa-2">
      <span class="text-h4 text--secondary">{{ courseID.toUpperCase() }}</span>
      <span class="text-h4">{{ $store.getters.getCourseByID(courseID).name }}</span>
    </v-sheet>
    <v-container>
      <v-row>
        <v-col v-if="isAuthorized" cols="12">
          <TutorPanel :course-id="courseID" />
        </v-col>
        <v-col cols="12">
          <Challenge :course-id="courseID" />
        </v-col>
        <v-col cols="12">
          <Coop :course-id="courseID" />
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script>
export default {
  name: 'CourseIndexPage',
  data() {
    return {
      courseID: undefined
    }
  },
  computed: {
    isAuthorized () {
      const isTutor = this.$auth.currentUser.email.endsWith('@iu.org')
      const isAdmin = this.$store.getters.isAdmin
      return isTutor || isAdmin
    }
  },
  created () {
    this.courseID = this.$route.params.course
  }
}
</script>
