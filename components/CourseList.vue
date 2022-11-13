<template>
  <v-row>
    <v-col v-for="(course, id) in courses" :key="id" cols="12" lg="6">
      <v-card width="100%" @click="openCourse(id)">
        <v-row no-gutters class="flex-nowrap">
          <v-col class="flex-grow-0 flex-shrink-1">
            <v-img
              src="https://www.onlinecollegeplan.com/wp-content/uploads/2018/05/computer-programming.jpg"
              :width="imgSize"
              :height="imgSize"
              class="rounded-l-lg"
            ></v-img>
          </v-col>
          <v-col class="flex-grow-1 flex-shrink-0">
            <v-card-title class="text--secondary text-subtitle-1">{{ id.toUpperCase() }}</v-card-title>
            <v-card-subtitle class="text--primary text-h6">{{ course.name }}</v-card-subtitle>
          </v-col>
          <v-col class="flex-grow-0 flex-shrink-1">
            <v-btn icon @click.stop="isFavoriteCourse(id) ? addToFavorites(id, false) : addToFavorites(id, true)">
              <v-icon>{{ isFavoriteCourse(id) ? 'mdi-heart' : 'mdi-heart-outline' }}</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'

export default {
  name: 'CourseList',
  props: {
    courses: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      imgSize: 125
    }
  },
  methods: {
    openCourse (courseID) {
      this.$store.commit('setSelectedCourse', courseID)
      this.$router.push(`courses/${courseID}`)
    },
    isFavoriteCourse (courseID) {
      return this.$store.state.user.courses && this.$store.state.user.courses.includes(courseID)
    },
    addToFavorites (courseID, add) {
      const userRef = doc(this.$db, `benutzer/${this.$auth.currentUser.uid}`)

      updateDoc(userRef, {
        kurse: add ? arrayUnion(courseID) : arrayRemove(courseID)
      }).then((empty) => {
        // Query execution was successful
        add ? this.$store.commit('addFavoriteCourse', courseID) : this.$store.commit('removeFavoriteCourse', courseID)
      }).catch((error) => {
        // Failed; display error message
        this.$toast({ content: error, color: 'error' })
      })
    }
  }
}
</script>
