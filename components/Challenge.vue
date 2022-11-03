<template>
  <v-container fluid>
    <v-subheader class="text-h5 text--primary">Challenge</v-subheader>
    <v-divider></v-divider>
    <v-btn depressed color="success" class="my-3" @click="playVersus">
      <v-icon left>mdi-play</v-icon>
      Quiz Spielen
    </v-btn>
    <AddClosedEndedQuestion />
  </v-container>
</template>

<script>
export default {
  name: 'ChallengeComponent',
  props: {
    courseId: {
      type: String,
      required: true
    }
  },
  data () {
    return {
    }
  },
  created () {
  },
  methods: {
    playVersus () {
      // TODO
      this.$router.push(`${this.$route.path}/play`)
    }
  }
}
</script>