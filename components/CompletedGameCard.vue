<template>
  <v-card width="500">
    <v-row align="center">
      <v-col cols="auto">
        <v-icon size="48" color="amber">{{ icon }}</v-icon>
      </v-col>
      <v-col>
        <div class="text-h6 text--primary">{{ title }}</div>
        <div class="text-caption text--secondary">gegen {{ opponentName }}</div>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import { Game } from '~/plugins/game'

export default {
  name: 'CompletedGameCard',
  props: {
    game: {
      type: Game,
      required: true
    }
  },
  computed: {
    result () {
      return this.game.getResult()
    },
    playerNumber () {
      return this.game.player1id === this.$auth.currentUser.uid ? 1 : 2
    },
    isWinner () {
      return !this.result.tie && this.result.winner === this.playerNumber
    },
    title () {
      if (this.result.tie) return 'Unentschieden'
      else return this.isWinner ? 'Sieg' : 'Niederlage'
    },
    icon () {
      return this.isWinner ? 'mdi-trophy' : 'mdi-trophy-broken'
    },
    opponentName () {
      return this.game.player1id === this.$auth.currentUser.uid ? this.game.player2name : this.game.player1name
    }
  }
}
</script>