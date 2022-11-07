<template>
  <v-card outlined width="500">
    <v-card-text>
      <v-row align="center" justify="center" no-gutters class="text-subtitle-1">
        <v-col cols="auto">
          <div class="text--primary text-center">{{ game.player1name }}</div>
          <v-icon
            v-for="oneIndex, zeroIndex in game.questionIds.length" :key="'pl1'+zeroIndex"
            small
            :color="dotColor(game, 1, zeroIndex)"
          >mdi-circle</v-icon>
        </v-col>
        <v-col cols="auto" class="mx-12">vs.</v-col>
        <v-col cols="auto">
          <div class="text--primary text-center">{{ game.player2name || '?' }}</div>
          <v-icon
            v-for="oneIndex, zeroIndex in game.questionIds.length" :key="'pl2'+zeroIndex"
            small
            :color="dotColor(game, 2, zeroIndex)"
          >mdi-circle</v-icon>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import { Game } from '~/plugins/game'

export default {
  name: 'OpenGameCard',
  props: {
    game: {
      type: Game,
      required: true
    }
  },
  methods: {
    dotColor (game, playerNumber, index) {
      if (!game || index + 1 > game[`player${playerNumber}answers`].length) return ''
      else {
        const correct = game[`player${playerNumber}answers`][index].richtig
        return correct ? 'success' : 'error'
      }
    }
  }
}
</script>