<template>
  <v-container>
    <v-row>
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
  name: 'CourseIndexPage',
  data() {
    return {
      courseID: undefined
    }
  },
  computed: {
  },
  created () {
    this.courseID = this.$route.params.course
  },
  methods: {
    playVersus () {
      // TODO
      this.$router.push(`${this.$route.path}/play`)
    },
    playCoop () {
      // TODO
      this.$toast({ content: 'Todo: Co-op Mode implementieren', color: 'info' })
    }
  }
}
</script>
