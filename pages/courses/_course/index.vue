<template>
  <v-container fluid>
    <v-row v-if="$store.getters.isAdmin">
      <v-col cols="12">
        <RemoveCourse :course-id="courseID" />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" sm="6">
        <v-card height="100%" class="d-flex align-center pa-2">
          <v-row no-gutters>
            <v-col cols="12">
              <span class="text-h5 text--secondary">{{ courseID.toUpperCase() }}</span>
            </v-col>
            <v-col cols="12">
              <span class="text-h5">{{ $store.getters.getCourseByID(courseID).name }}</span>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6">
        <v-card>
          <v-card-title>Tutor</v-card-title>
          <v-card-text>
            <v-row align="center">
              <v-col cols="auto">
                <v-avatar size="64">
                  <img src="https://www.w3schools.com/howto/img_avatar.png" />
                </v-avatar>
              </v-col>
              <v-col>
                <div>{{ tutorName }}</div>
                <div>{{ tutorEmail }}</div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12">
        <v-row>
          <v-col v-if="isAuthorized" cols="12">
            <TutorPanel :course-id="courseID" />
          </v-col>
          <v-col cols="12">
            <QuizComponent :course-id="courseID" />
          </v-col>
          <v-col cols="12">
            <Coop :course-id="courseID" />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import _capitalize from 'lodash-es/capitalize'

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
    },
    tutorEmail () {
      return this.$store.getters.getCourseByID(this.courseID).tutor
    },
    tutorName () {
      const nameParsed = this.tutorEmail.split('@')[0]
      const nameParts = []
      for (const namePart of nameParsed.split('.')) {
        nameParts.push(_capitalize(namePart))
      }
      return nameParts.join(' ')
    }
  },
  created () {
    this.courseID = this.$route.params.course
  }
}
</script>
