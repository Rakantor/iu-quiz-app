export const state = () => ({
  firebaseInitialized: false,
  idTokenResult: null,
  user: null,
  courses: {},
  selectedCourse: undefined
})

export const getters = {
  isAdmin (state) {
    return state.idTokenResult && state.idTokenResult.claims.admin
  },
  getCourseByID: (state) => (courseID) => {
    return state.courses[courseID]
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
  setCourses (state, courses) {
    state.courses = courses
  },
  setCourse (state, { courseID, courseData }) {
    this._vm.$set(state.courses, courseID, courseData)
  },
  setSelectedCourse (state, courseID) {
    state.selectedCourse = courseID
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