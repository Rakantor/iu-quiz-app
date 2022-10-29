<template>
  <v-container v-if="selectedQuestion" fluid class="fill-height">
    <v-row dense>
      <v-col cols="12">
        <p class="text-h6 text-center">{{ game.player1name }} vs. {{ game.player2name || '???' }}</p>
      </v-col>
      <v-col cols="12">
        <v-card class="d-flex align-center" height="250" :disabled="submittedAnswer === null" @click="nextQuestion">
          <span class="flex-grow-1 text-h5 font-weight-medium text-center">{{ selectedQuestion.question }}</span>
        </v-card>
      </v-col>
      <v-col v-for="answer, i in answersShuffled" :key="i" cols="6">
        <v-card
          :color="selectedQuestion.correctAnswer === answer ? answerColor : ''"
          class="d-flex align-center"
          height="150"
          :disabled="submittedAnswer !== null"
          @click="submitAnswer(answer)"
        >
          <div class="flex-grow-1 text-h6 text-center">{{ answer }}</div>
        </v-card>
      </v-col>
      <v-col cols="12">
        <v-progress-linear :value="(timeLeft / (timePerRound * 1000)) * 100" rounded height="20" color="primary" :style="progressBarTransition">
        </v-progress-linear>
      </v-col>
    </v-row>
  </v-container>
  <v-container v-else fluid class="fill-height">
    <v-card flat color="transparent" class="mx-auto">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </v-card>
  </v-container>
</template>

<script>
import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc,
  query, where, orderBy, limit, arrayUnion, arrayRemove, writeBatch
} from 'firebase/firestore'
import _sampleSize from 'lodash-es/sampleSize'
import _shuffle from 'lodash-es/shuffle'
import _capitalize from 'lodash-es/capitalize'
import { ClosedEndedQuestionConverter } from '~/plugins/closed-ended-question'
import { Game, GameConverter } from '~/plugins/game'

export default {
  name: 'PlayPage',
  data() {
    return {
      courseID: undefined,
      game: null,
      questions: [],
      selectedQuestions: [],
      selectedQuestionID: -1,
      submittedAnswer: null,
      timer: null,
      timePerRound: 20, // in seconds
      timeLeft: 0,
      progressBarTransition: 'transition: 0.2s cubic-bezier(0.4, 0, 0.6, 1);'
    }
  },
  computed: {
    playerNumber () {
      return this.game.player1id === this.$auth.currentUser.uid ? 1 : 2
    },
    selectedQuestion () {
      return this.selectedQuestions[this.selectedQuestionID] || null
    },
    answersShuffled () {
      // Ref: https://lodash.com/docs/#shuffle
      return _shuffle(this.selectedQuestion.answers)
    },
    answerCorrect () {
      return this.submittedAnswer === this.selectedQuestion.correctAnswer
    },
    answerColor () {
      return this.submittedAnswer !== null ? `${ this.answerCorrect ? 'success' : 'error' }` : ''
    }
  },
  created () {
    this.courseID = this.$route.params.course
    this.getQuestions().then(() => {
      const gid = this.$store.state.user.gamesStarted.find(e => e.course === this.courseID)

      if (gid && gid.game) {
        this.resumeGame(gid.game)
      } else {
        // There's no game to resume. Find a game.
        this.findGame()
      }
    })
  },
  methods: {
    generateUserName () {
      return _capitalize(this.$auth.currentUser.email.split('.')[0])
    },
    getQuestions () {
      // Create a reference to the closed-ended questions collection of the currently selected course
      const questionsRef = collection(this.$db, `kurse/${this.courseID}/fragenGeschlossen`).withConverter(ClosedEndedQuestionConverter)

      // Create a query against the collection.
      // Only questions with the status "approved" (=genehmigt) should be fetched from the database
      const q = query(questionsRef, where('status', '==', 'genehmigt'))

      // Execute the query
      return getDocs(q).then((querySnapshot) => {
        this.questions = []
        querySnapshot.forEach((doc) => {
          // Convert to ClosedEndedQuestion object
          this.questions.push(doc.data())
        })
      }).catch((error) => {
        // Failed to fetch questions from the database; display error message
        this.$toast({ content: error, color: 'error' })
      })
    },
    resumeGame (gameID) {
      const ref = doc(this.$db, `kurse/${this.courseID}/spiele/${gameID}`).withConverter(GameConverter)
      getDoc(ref).then((docSnap) => {
        if (docSnap.exists()) {
          // Convert to Game object
          this.game = docSnap.data()

          const questionsAnswered = this.game[`player${this.playerNumber}answers`].map(q => q.frage)
          this.selectedQuestions = this.questions.filter(q => this.game.questions.includes(q.id) && !questionsAnswered.includes(q.id))

          // Start the game
          this.nextQuestion()
        } else {
          this.$toast({
            content: 'Es wurde versucht ein begonnenes Spiel fortzusetzen, aber das Spiel wurde in der DB nicht gefunden...',
            color: 'error'
          })
        }
      }).catch((error) => {
        // Failed to fetch game from the database; display error message
        this.$toast({ content: error, color: 'error' })
      })
    },
    findGame () {
      // Create a reference to the games collection of the currently selected course
      const questionsRef = collection(this.$db, `kurse/${this.courseID}/spiele`).withConverter(GameConverter)

      // Find a game that is waiting for an opponent
      const q = query(questionsRef,
        where('spieler1id', '!=', this.$auth.currentUser.uid),
        orderBy('spieler1id'),
        where('spieler2id', '==', ''),
        orderBy('erstellt'),
        limit(1)
      )

      getDocs(q).then((querySnapshot) => {
        if (!querySnapshot.empty) {
          // Join the game
          this.joinGame(querySnapshot.docs[0].data())
        } else {
          // No game in progress found; create a new one
          this.createGame()
        }
      }).catch((error) => {
        // Query failed; display error message
        this.$toast({ content: error, color: 'error' })
      })
    },
    joinGame (game) {
      this.game = game
      this.game.player2id = this.$auth.currentUser.uid
      this.game.player2name = this.generateUserName()
      this.game.player2answers = []
      this.selectedQuestions = this.questions.filter(q => game.questions.includes(q.id))

      // Get a new write batch
      const batch = writeBatch(this.$db)

      // Update the users games in progress
      const userRef = doc(this.$db, `benutzer/${this.$auth.currentUser.uid}`)
      batch.update(userRef, {
        spieleBegonnen: arrayUnion({ kurs: this.courseID, spiel: this.game.id })
      })
      this.$store.commit('addGameInProgress', { courseID: this.courseID, gameID: this.game.id })

      // Set the updated information of the game
      const gameRef = doc(this.$db, `kurse/${this.courseID}/spiele/${this.game.id}`).withConverter(GameConverter)
      batch.set(gameRef, this.game, { merge: true })

      // Commit the batch
      batch.commit().then((empty) => {
        // Start the game
        this.nextQuestion()
      })
      .catch((error) => {
        // Batch execution failed; display error message
        this.$toast({ content: error, color: 'error' })
      })
    },
    createGame () {
      // Randomly pick 10 questions (or less) from the available questions
      // Ref: https://lodash.com/docs/#sampleSize
      this.selectedQuestions = _sampleSize(this.questions, 10)

      const g = new Game(
        null,
        this.selectedQuestions.map(q => q.id),
        Date.now() / 1000, // Current UNIX timestamp in seconds
        this.$auth.currentUser.uid,
        this.generateUserName(),
        [],
        '',
        '',
        []
      )

      // Add a new document with a generated id
      addDoc(collection(this.$db, `kurse/${this.courseID}/spiele`).withConverter(GameConverter), g)
      .then((docRef) => {
        // Successfully added a new game to the database.
        this.game = g
        this.game.id = docRef.id

        // Update the users games in progress
        const userRef = doc(this.$db, `benutzer/${this.$auth.currentUser.uid}`)
        updateDoc(userRef, {
          spieleBegonnen: arrayUnion({ kurs: this.courseID, spiel: this.game.id })
        })
        this.$store.commit('addGameInProgress', { courseID: this.courseID, gameID: this.game.id })

        // Start the game
        this.nextQuestion()
      })
      .catch((error) => {
        // Failed to add a new game to the database; display error message
        this.$toast({content: error, color: 'error'})
      })
    },
    updateGame() {
      const gameRef = doc(this.$db, `kurse/${this.courseID}/spiele/${this.game.id}`)

      // Atomically add a new answer to the "player[ID]answers" array field.
      updateDoc(gameRef, {
          [`spieler${this.playerNumber}antworten`]: arrayUnion({ frage: this.selectedQuestion.id, antwort: this.submittedAnswer })
      }).then((empty) => {
        // Query execution was successful. Nothing else to do here.
      }).catch((error) => {
        // Failed to update the game; display error message
        this.$toast({content: error, color: 'error'})
      })
    },
    submitAnswer (answer) {
      clearInterval(this.timer)
      this.submittedAnswer = answer
      this.updateGame()
    },
    nextQuestion () {
      this.submittedAnswer = null
      this.timeLeft = this.timePerRound * 1000 // convert sec to ms
      const interval = 100 // in ms

      if (++this.selectedQuestionID >= this.selectedQuestions.length) {
        this.finishGame()
        return
      }

      // Hacky solution to disable v-progress-linear transition when resetting its value
      this.progressBarTransition = 'transition: none;'
      setTimeout(() => {
        this.progressBarTransition = 'transition: 0.2s cubic-bezier(0.4, 0, 0.6, 1);'
      }, 50)

      // Activate the timer
      this.timer = setInterval(() => {
        this.timeLeft = this.timeLeft - interval

        // Automatically submit a wrong answer when the time has run out
        if (this.timeLeft < 0) {
          this.submitAnswer(-1)
        }
      }, interval)
    },
    finishGame () {
      this.$store.commit('removeGameInProgress', this.courseID)

      const ref = doc(this.$db, `benutzer/${this.$auth.currentUser.uid}`)

      updateDoc(ref, {
        spieleBegonnen: arrayRemove({ kurs: this.courseID, spiel: this.game.id })
      }).then((empty) => {
        this.$router.push(`/courses/${this.courseID}`)
      }).catch((error) => {
        this.$toast({content: error, color: 'error'})
      })
    }
  }
}
</script>
