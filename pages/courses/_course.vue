<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <span class="text-h4">{{ title }}</span>
      </v-col>
      <v-col cols="auto">
        <v-btn depressed color="primary" @click="playVersus">Challenge Mode</v-btn>
      </v-col>
      <v-col cols="auto">
        <v-btn depressed color="primary" @click="playCoop">Co-op Mode</v-btn>
      </v-col>
      <v-col cols="12">
        <AddClosedEndedQuestion />
      </v-col>
      <v-col cols="12">
        <AddOpenEndedQuestion />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      courseID: undefined
    }
  },
  computed: {
    title () {
      const courseName = this.$store.getters.getCourseByID(this.courseID).name
      return `${this.courseID.toUpperCase()} - ${courseName}`
    }
  },
  created () {
    this.courseID = this.$route.params.course
  },
  methods: {
    playVersus () {
      // TODO
      this.$toast({ content: 'Todo: Challenge Mode implementieren', color: 'info' })
    },
    playCoop () {
      // TODO
      this.$toast({ content: 'Todo: Co-op Mode implementieren', color: 'info' })
    }
  }
}
</script>
