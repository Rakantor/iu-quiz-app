<template>
  <v-card>
    <v-card-title>Challenge</v-card-title>
    <v-card-subtitle>Teste dein Wissen, indem du in Quizduellen gegen deine Kommilitonen antrittst!</v-card-subtitle>
    <v-card-text>
      <v-btn large depressed color="success" class="my-3" @click="playVersus">
        <v-icon left>mdi-play</v-icon>
        Spielen
      </v-btn>
    </v-card-text>
    <v-divider></v-divider>
    <v-expansion-panels v-model="expPanel" accordion class="text-subtitle-1 font-weight-medium">
      <v-expansion-panel>
        <v-expansion-panel-header>
          Offene Spiele ({{ openGames.length }})
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-row>
            <v-col v-for="(og, i) in openGames" :key="i" cols="12">
              <OpenGameCard :game="og" />
            </v-col>
          </v-row>
        </v-expansion-panel-content>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-header>
          Beendete Spiele ({{ completedGames.length }})
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-row>
            <v-col v-for="(cg, i) in completedGames" :key="i" cols="12">
              <CompletedGameCard :game="cg" />
            </v-col>
          </v-row>
        </v-expansion-panel-content>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-header>
          Persönliche Statistik
        </v-expansion-panel-header>
        <v-expansion-panel-content>
            <v-row>
              <v-col cols="auto">
                <div class="text-subtitle-1">Spiele:</div>
                <div class="text-body-2">Siege:</div>
                <div class="text-body-2">Unentschieden:</div>
                <div class="text-body-2">Niederlagen:</div>
              </v-col>
              <v-col cols="auto">
                <div class="text-subtitle-1">{{ games.won + games.lost + games.tie }}</div>
                <div class="text-body-2">{{ games.won }}</div>
                <div class="text-body-2">{{ games.tie }}</div>
                <div class="text-body-2">{{ games.lost }}</div>
              </v-col>
              <v-col cols="auto">
                <div class="text-subtitle-1">Fragen:</div>
                <div class="text-body-2">Richtig:</div>
              </v-col>
              <v-col cols="auto">
                <div class="text-subtitle-1">{{ games.questionsCorrect + games.questionsIncorrect }}</div>
                <div class="text-body-2">{{ questionsCorrectPercent }}%</div>
              </v-col>
              <v-col cols="12" class="text-body-2">
                {{ text }}
              </v-col>
            </v-row>
        </v-expansion-panel-content>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-header>
          Neue Quizfrage einreichen
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <AddClosedEndedQuestion />
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-card>
</template>

<script>
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { GameConverter } from '~/plugins/game'

export default {
  name: 'QuizComponent',
  props: {
    courseId: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      openGames: [],
      completedGames: [],
      expPanel: 0
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
      if (this.questionsAnswered >= 20 && this.questionsCorrectPercent >= 85) {
        return 'Du scheinst gut auf die Klausur vorbereitet zu sein. Viel Glück!'
      } else {
        return 'Wir empfehlen Dir noch ein wenig zu üben, bevor du zur Klausur antrittst.'
      }
    }
  },
  created () {
    // Get list of unfinished games from db
    this.getOpenGames()
    // Get list of completed games from db (limit to 10 most recent)
    this.getCompletedGames()
  },
  methods: {
    getOpenGames () {
      const q = query(
        collection(this.$db, `kurse/${this.courseId}/spiele`).withConverter(GameConverter),
        where('abgeschlossen', '==', false),
        where('spielerIds', 'array-contains', this.$auth.currentUser.uid),
        orderBy('erstellt', 'desc')
      )

      getDocs(q).then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          // doc.data() is never undefined for query doc snapshots
          this.openGames.push(doc.data())
        })
      }).catch((error) => {
        // Query failed; display error message
        this.$toast({ content: error, color: 'error' })
      })
    },
    getCompletedGames () {
      const q = query(
        collection(this.$db, `kurse/${this.courseId}/spiele`).withConverter(GameConverter),
        where('abgeschlossen', '==', true),
        where('spielerIds', 'array-contains', this.$auth.currentUser.uid),
        orderBy('erstellt', 'desc'),
        limit(10)
      )

      getDocs(q).then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          // doc.data() is never undefined for query doc snapshots
          this.completedGames.push(doc.data())
        })
      }).catch((error) => {
        // Query failed; display error message
        this.$toast({ content: error, color: 'error' })
      })
    },
    playVersus () {
      // TODO
      this.$router.push(`${this.$route.path}/play`)
    }
  }
}
</script>