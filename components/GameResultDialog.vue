<template>
  <v-dialog v-model="show" persistent width="500">
    <v-card class="mx-auto">
      <v-card-title class="justify-center">{{ title }}</v-card-title>
      <v-card-text>
        <v-row no-gutters class="text-h4 text--primary">
          <v-col cols="5" class="d-flex justify-end">{{ result.correctAnswersPl1 }}</v-col>
          <v-col cols="2" class="d-flex justify-center">:</v-col>
          <v-col cols="5" class="d-flex justify-start">{{ result.correctAnswersPl2 }}</v-col>
        </v-row>
        <v-row no-gutters class="text-subtitle-1">
          <v-col cols="5" class="d-flex justify-end">{{ game.player1name }}</v-col>
          <v-col cols="2" class="d-flex justify-center"></v-col>
          <v-col cols="5" class="d-flex justify-start">{{ game.player2name }}</v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn depressed block color="primary" :to="`/courses/${courseId}`">Abschließen</v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { Game } from '~/plugins/game'

export default {
  props: {
    game: {
      type: Game,
      required: true
    },
    courseId: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      show: false
    }
  },
  computed: {
    result () {
      return this.game.getResult()
    },
    title () {
      if (this.result.tie) return 'Unentschieden!'
      else return this.result.winner === this.playerNumber ? 'Gewonnen!' : 'Verloren :('
    },
    playerNumber () {
      return this.game.player1id === this.$auth.currentUser.uid ? 1 : 2
    }
  }
}
</script>