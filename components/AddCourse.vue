<template>
  <v-dialog v-model="show" max-width="500" persistent>
    <template #activator="{ on, attrs }">
      <v-card flat width="100%" class="rounded-lg" v-bind="attrs" v-on="on">
        <v-card-text class="text-h6">
          <v-icon left x-large>mdi-plus</v-icon>
          Kurs hinzufügen
        </v-card-text>
      </v-card>
    </template>
    <ValidationObserver ref="addCourseObserver" v-slot="{ invalid }">
      <form @submit.prevent="addCourse">
        <v-card>
          <v-card-title>Neuer Kurs</v-card-title>
          <v-card-text>
            <ValidationProvider v-slot="{ errors }" name="courseID" rules="required">
              <v-text-field
                v-model="id"
                required
                label="ID"
                persistent-placeholder
                placeholder="ISEF01"
                :error-messages="errors"
              ></v-text-field>
            </ValidationProvider>
            <ValidationProvider v-slot="{ errors }" name="course" rules="required">
              <v-text-field
                v-model="title"
                required
                label="Bezeichnung"
                persistent-placeholder
                placeholder="Projekt Software Engineering"
                :error-messages="errors"
              ></v-text-field>
            </ValidationProvider>
            <ValidationProvider v-slot="{ errors }" name="tutor" rules="required|email">
              <v-text-field
                v-model="tutor"
                required
                label="Tutor E-Mail"
                persistent-placeholder
                placeholder="john.johnson@iu.org"
                :error-messages="errors"
              ></v-text-field>
            </ValidationProvider>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn text color="primary" @click="close">Abbrechen</v-btn>
            <v-btn type="submit" depressed color="primary" :loading="loading" :disabled="invalid">Hinzufügen</v-btn>
          </v-card-actions>
        </v-card>
      </form>
    </ValidationObserver>
  </v-dialog>
</template>

<script>
import { doc, setDoc } from 'firebase/firestore'
// We use vee-validate@3 for form validation.
// https://vee-validate.logaretm.com/v3/guide/basics.html
import { ValidationProvider, ValidationObserver, extend } from 'vee-validate'
import { required, email } from 'vee-validate/dist/rules'

// Override the default error message of required fields
extend('required', {
  ...required,
  message: 'Pflichtfeld'
})

extend('email', {
  ...email,
  message: 'Keine gültige E-Mail-Adresse'
})

export default {
  name: 'AddCourseDialog',
  components: {
    ValidationProvider,
    ValidationObserver
  },
  data () {
    return {
      show: false,
      loading: false,
      id: '',
      title: '',
      tutor: ''
    }
  },
  methods: {
    addCourse () {
      this.loading = true
      const courseID = this.id.toLowerCase().trim()
      const courseName = this.title.trim()
      const tutorEmail = this.tutor.toLowerCase().trim()
      const c = { name: courseName, tutor: tutorEmail }

      // Add a new document
      setDoc(doc(this.$db, `kurse/${courseID}`), c)
      .then((docRef) => {
        // Successfully added a new course to the database.
        this.$store.commit('setCourse', { courseID, courseData: c })
        this.$toast({content: `Der Kurs "${courseID.toUpperCase()} - ${courseName}" wurde hinzugefügt!`, color: 'success'})
        this.close()
      })
      .catch((error) => {
        // Failed to add a new course to the database; display error message
        this.$toast({content: error, color: 'error'})
      })
      .then(() => { this.loading = false })
    },
    close () {
      this.id = ''
      this.title = ''
      this.tutor = ''
      this.show = false
      this.$refs.addCourseObserver.reset()
    }
  }
}
</script>