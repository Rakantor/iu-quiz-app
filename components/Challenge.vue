<template>
  <v-card>
    <v-card-title>
      Spiele {{ games.won + games.lost + games.tie }}
    </v-card-title>
    <v-card-subtitle>
      <div>Siege: {{ games.won }}</div>
      <div>Unentschieden: {{ games.lost }}</div>
      <div>Niederlagen: {{ games.tie }}</div>
      <div>Fragen: {{ games.questionsCorrect + games.questionsIncorrect }}</div>
      <div>Richtig: {{ questionsCorrectPercent }}%</div>
    </v-card-subtitle>
    <v-card-text>
      {{ text }}
    </v-card-text>
    <v-card-text>
      <v-btn depressed color="success" class="my-3" @click="playVersus">
        <v-icon left>mdi-play</v-icon>
        Spielen
      </v-btn>
    </v-card-text>
    <v-divider></v-divider>
    <AddClosedEndedQuestion />
  </v-card>
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
  computed: {
    games () {
      return this.$store.state.user.games[this.courseId]
    },
    questionsCorrectPercent () {
      const percent = (this.games.questionsCorrect / (this.games.questionsCorrect + this.games.questionsIncorrect)) * 100
      // percent will be NaN if the student hasn't played any games yet
      return percent ? Math.round(parseFloat(percent)) : 100 // Convert to float, then round to closest int
    },
    text () {
      if (this.questionsAnswered >= 20 && this.questionsCorrectPercent >= 90) {
        return 'Du scheinst gut auf die Klausur vorbereitet zu sein. Viel Glück!'
      } else {
        return 'Wir empfehlen Dir noch ein wenig zu üben, bevor du zur Klausur antrittst.'
      }
    }
  },
  methods: {
    playVersus () {
      // TODO
      this.$router.push(`${this.$route.path}/play`)
    }
  }
}
</script>