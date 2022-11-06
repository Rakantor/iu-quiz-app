<template>
  <v-dialog v-model="show" max-width="500" persistent>
    <template #activator="{ on, attrs }">
      <v-card v-bind="attrs" v-on="on">
        <v-card-text class="text-h6 error--text">
          <v-icon left color="error">mdi-delete</v-icon>
          Kurs löschen
        </v-card-text>
      </v-card>
    </template>
    <v-card>
      <v-card-title>Kurs löschen</v-card-title>
      <v-card-text class="text-subtitle-1">
        Möchtest du den Kurs <strong>{{ courseId.toUpperCase() }}</strong> dauerhaft und unwiderruflich löschen?
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text color="primary" @click="show = false">Abbrechen</v-btn>
        <v-btn depressed color="primary" :loading="loading" @click="deleteCourse">Löschen</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { doc, deleteDoc } from 'firebase/firestore'

export default {
  name: 'RemoveCourseDialog',
  props: {
    courseId: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      show: false,
      loading: false
    }
  },
  methods: {
    deleteCourse () {
      this.loading = true

      // Delete document
      deleteDoc(doc(this.$db, `kurse/${this.courseId}`))
      .then((docRef) => {
        // Successfully deleted the course from the database.
        this.$store.commit('setCourse', { courseId: this.courseId, courseData: null })
        this.$toast({content: `Der Kurs "${this.courseId.toUpperCase()}" wurde gelöscht.`, color: 'success'})
        this.show = false

        this.$router.push({ name: 'dashboard' })
      })
      .catch((error) => {
        // Failed to add a new course to the database; display error message
        this.$toast({content: error, color: 'error'})
      })
      .then(() => { this.loading = false })
    }
  }
}
</script>