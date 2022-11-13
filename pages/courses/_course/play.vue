<template>
  <v-container v-if="selectedQuestion" fluid class="fill-height">
    <GameResultDialog ref="resultDialog" :game="game" :course-id="courseID" />
    <v-row dense>
      <v-col cols="12">
        <p class="text-h6 text-center">{{ game.player1name }} vs. {{ game.player2name || '?' }}</p>
      </v-col>
      <v-col cols="12">
        <v-icon
          v-for="oneIndex, zeroIndex in game.questionIds.length" :key="zeroIndex"
          :color="dotColor(zeroIndex)"
        >mdi-circle</v-icon>
      </v-col>
      <v-col cols="12">
        <v-card class="d-flex align-center" height="250" :disabled="submittedAnswer === null" @click="nextQuestion">
          <span class="flex-grow-1 text-h5 text--primary font-weight-medium text-center">{{ selectedQuestion.question }}</span>
        </v-card>
      </v-col>
      <v-col v-for="answer, i in answersShuffled" :key="i" cols="6">
        <v-card
          :color="selectedQuestion.correctAnswer === answer ? answerColor : ''"
          class="d-flex align-center"
          height="150"
          @click="submittedAnswer === null ? submitAnswer(answer) : nextQuestion()"
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
    <v-card color="transparent" class="mx-auto">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </v-card>
  </v-container>
</template>

<script>
import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc,
  writeBatch, query, where, orderBy, limit, arrayUnion, arrayRemove, increment
} from 'firebase/firestore'
import _sampleSize from 'lodash-es/sampleSize'
import _shuffle from 'lodash-es/shuffle'
import _isEmpty from 'lodash-es/isEmpty'
import { ClosedEndedQuestionConverter, states } from '~/plugins/closed-ended-question'
import { Game, GameConverter } from '~/plugins/game'

export default {
  name: 'PlayPage',
  data() {
    return {
      courseID: undefined,
      game: null,
      questions: [],
      selectedQuestion: null,
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
    unansweredQuestions () {
      if (!_isEmpty(this.game)) {
        const questionsAnswered = this.game[`player${this.playerNumber}answers`].map(q => q.frage)
        return this.game.questions.filter(q => !questionsAnswered.includes(q.id))
      }
      return []
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
  beforeDestroy () {
    // Automatically submit a wrong answer when the user leaves without answering the question
    if (this.submittedAnswer === null) {
      this.submitAnswer(-1)
    }
  },
  methods: {
    getQuestions () {
      // Create a reference to the closed-ended questions collection of the currently selected course
      const questionsRef = collection(this.$db, `kurse/${this.courseID}/fragenGeschlossen`).withConverter(ClosedEndedQuestionConverter)

      // Create a query against the collection.
      // Only questions with the status "approved" (=genehmigt) should be fetched from the database
      const q = query(questionsRef, where('status', '==', states.approved))

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
          this.game.questions = this.questions.filter(q => this.game.questionIds.includes(q.id))

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
      this.game.questions = this.questions.filter(q => game.questionIds.includes(q.id))
      this.game.player2id = this.$auth.currentUser.uid
      this.game.player2name = this.$store.state.user.displayName
      this.game.player2answers = []
      this.game.playerIds.push(this.game.player2id)

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
      // Randomly pick 5 questions (or less) from the available questions
      // Ref: https://lodash.com/docs/#sampleSize
      const rndQuestions = _sampleSize(this.questions, 5)
      const g = new Game(
        null,
        rndQuestions.map(q => q.id),
        Date.now() / 1000, // Current UNIX timestamp in seconds
        false,
        this.$auth.currentUser.uid,
        this.$store.state.user.displayName,
        [],
        '',
        '',
        []
      )
      g.questions = rndQuestions

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
      // Get a new write batch
      const batch = writeBatch(this.$db)

      // Update the user's given answers for the current game
      const gameRef = doc(this.$db, `kurse/${this.courseID}/spiele/${this.game.id}`)
      batch.update(gameRef, {
        [`spieler${this.playerNumber}antworten`]: arrayUnion({
          frage: this.selectedQuestion.id,
          antwort: this.submittedAnswer,
          richtig: this.answerCorrect
        })
      })

      // Increment the number of correct/incorrect answers given by the user by 1
      const updateField = this.answerCorrect ? 'fragenRichtig' : 'fragenFalsch'
      const userRef = doc(this.$db, `benutzer/${this.$auth.currentUser.uid}`)
      batch.update(userRef, {
          [`spiele.${this.courseID}.${updateField}`]: increment(1)
      })

      // Commit the batch
      batch.commit().then((empty) => {
        // Batch execution was successful
        this.game[`player${this.playerNumber}answers`].push({
          frage: this.selectedQuestion.id,
          antwort: this.submittedAnswer,
          richtig: this.answerCorrect
        })
      }).catch((error) => {
        // Batch execution failed; display error message
        this.$toast({content: error, color: 'error'})
      })
    },
    submitAnswer (answer) {
      clearInterval(this.timer)
      this.submittedAnswer = answer
      this.updateGame()
    },
    nextQuestion () {
      if (_isEmpty(this.unansweredQuestions)) {
        this.finishRound()
        return
      }

      this.submittedAnswer = null
      this.selectedQuestion = this.unansweredQuestions[0]
      this.timeLeft = this.timePerRound * 1000 // convert sec to ms
      const interval = 100 // in ms

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
    finishRound () {
      const gameComplete = this.game.player2answers.length === this.game.questionIds.length
      if (gameComplete) this.completeGame()

      this.$store.commit('removeGameInProgress', this.courseID)
      const ref = doc(this.$db, `benutzer/${this.$auth.currentUser.uid}`)

      updateDoc(ref, {
        spieleBegonnen: arrayRemove({ kurs: this.courseID, spiel: this.game.id })
      }).then((empty) => {
        if (!gameComplete) this.$router.push(`/courses/${this.courseID}`)
      }).catch((error) => {
        this.$toast({content: error, color: 'error'})
      })
    },
    completeGame () {
      this.game.completed = true
      const result = this.game.getResult()

      // Figure out which player won and which player lost, or if the game was a tie
      let updateFieldPl1 = ''
      let updateFieldPl2 = ''
      if (result.tie) {
        updateFieldPl1 = updateFieldPl2 = 'unentschieden'
      } else {
        updateFieldPl1 = result.winner === 1 ? 'gewonnen' : 'verloren'
        updateFieldPl2 = result.winner === 2 ? 'gewonnen' : 'verloren'
      }

      // Show the results dialog
      this.$refs.resultDialog.show = true

      // Get a new write batch
      const batch = writeBatch(this.$db)

      // Increment the number of games won/lost/tie of player1 by 1
      const refPl1 = doc(this.$db, `benutzer/${this.game.player1id}`)
      batch.update(refPl1, { [`spiele.${this.courseID}.${updateFieldPl1}`]: increment(1) })

      // Increment the number of games won/lost/tie of player2 by 1
      const refPl2 = doc(this.$db, `benutzer/${this.game.player2id}`)
      batch.update(refPl2, { [`spiele.${this.courseID}.${updateFieldPl2}`]: increment(1) })

      // Set the game's "completed" field to true
      const refGame = doc(this.$db, `kurse/${this.courseID}/spiele/${this.game.id}`)
      batch.update(refGame, { abgeschlossen: true })

      // Commit the batch
      batch.commit().catch((error) => {
        // Batch execution failed; display error message
        this.$toast({ content: error, color: 'error' })
      })
    },
    dotColor (index) {
      if (!this.game || index + 1 > this.game[`player${this.playerNumber}answers`].length) return ''
      else {
        const questionId = this.game[`player${this.playerNumber}answers`][index].frage
        const answer = this.game[`player${this.playerNumber}answers`][index].antwort
        const correct = answer === this.game.questions.find(q => q.id === questionId).correctAnswer
        return correct ? 'success' : 'error'
      }
    }
  }
}
</script>

<style scoped>
.v-card--disabled {
  opacity: 0.87 !important; /* same as text--primary */
}
</style>