import _pick from 'lodash-es/pick'

export const state = () => ({
  firebaseInitialized: false,
  idTokenResult: null,
  user: null,
  courses: {},
  selectedCourse: undefined,
  openEndedQuestions: []
})

export const getters = {
  isAdmin (state) {
    return state.idTokenResult && state.idTokenResult.claims.admin
  },
  getCourseByID: (state) => (courseID) => {
    return state.courses[courseID]
  },
  getFavoriteCourses (state) {
    // Ref: https://lodash.com/docs/#pick
    return _pick(state.courses, state.user.courses)
  }
}

export const mutations = {
  initFirebase (state) {
    state.firebaseInitialized = true
  },
  setIdTokenResult (state, idTokenResult) {
    state.idTokenResult = idTokenResult
  },
  setUser (state, user) {
    state.user = user
  },
  setUserDisplayName (state, name) {
    this._vm.$set(state.user, 'displayName', name)
  },
  setCourses (state, courses) {
    state.courses = courses
  },
  initCourse (state, courseID) {
    state.user.setGames({ [courseID]: {} })
  },
  addFavoriteCourse (state, courseID) {
    state.user.courses.push(courseID)
  },
  removeFavoriteCourse (state, courseID) {
    const index = state.user.courses.findIndex(e => e === courseID)
    state.user.courses.splice(index, 1)
  },
  setCourse (state, { courseID, courseData }) {
    if (courseData) this._vm.$set(state.courses, courseID, courseData)
    else this._vm.$delete(state.courses, courseID)
  },
  setSelectedCourse (state, courseID) {
    state.selectedCourse = courseID
  },
  setOpenEndedQuestions (state, questions) {
    state.openEndedQuestions = questions
  },
  addOpenEndedQuestion (state, question) {
    const index = state.openEndedQuestions.findIndex(q => q.id === question.id)
    if (index === -1) {
      // The question does not exist in the array --> add
      state.openEndedQuestions.push(question)
    } else {
      // The question already exists in the array --> update
      this._vm.$set(state.openEndedQuestions, index, question)
    }
  },
  toggleHelpfulQuestion (state, questionId) {
    const index = state.openEndedQuestions.findIndex(q => q.id === questionId)
    if (index !== -1) {
      const i = state.openEndedQuestions[index].helpful.indexOf(this.$auth.currentUser.uid)
      if (i === -1) state.openEndedQuestions[index].helpful.push(this.$auth.currentUser.uid)
      else state.openEndedQuestions[index].helpful.splice(i, 1)
    }
  },
  setDifficulty (state, { questionId, difficulty }) {
    const index = state.openEndedQuestions.findIndex(q => q.id === questionId)
    if (index !== -1) {
      const i = state.openEndedQuestions[index].difficulty[difficulty].indexOf(this.$auth.currentUser.uid)

      if (i !== -1) {
        state.openEndedQuestions[index].difficulty[difficulty].splice(i, 1)
      } else {
        const indexEasy = state.openEndedQuestions[index].difficulty.easy.indexOf(this.$auth.currentUser.uid)
        if (indexEasy !== -1) state.openEndedQuestions[index].difficulty.easy.splice(indexEasy, 1)
        const indexMedium = state.openEndedQuestions[index].difficulty.medium.indexOf(this.$auth.currentUser.uid)
        if (indexMedium !== -1) state.openEndedQuestions[index].difficulty.medium.splice(indexMedium, 1)
        const indexHard = state.openEndedQuestions[index].difficulty.hard.indexOf(this.$auth.currentUser.uid)
        if (indexHard !== -1) state.openEndedQuestions[index].difficulty.hard.splice(indexHard, 1)
        state.openEndedQuestions[index].difficulty[difficulty].push(this.$auth.currentUser.uid)
      }

      state.openEndedQuestions[index].updateDifficultyLevel()
    }
  },
  addGameInProgress (state, { courseID, gameID }) {
    const index = state.user.gamesStarted.findIndex(e => e.course === courseID)
    if (index !== -1) {
      state.user.gamesStarted[index].course = courseID
      state.user.gamesStarted[index].game = gameID
    } else {
      state.user.gamesStarted.push({ course: courseID, game: gameID })
    }
  },
  removeGameInProgress (state, courseID) {
    const index = state.user.gamesStarted.findIndex(e => e.course === courseID)
    state.user.gamesStarted.splice(index, 1)
  }
}

export const actions = {
}