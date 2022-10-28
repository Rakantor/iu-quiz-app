export const state = () => ({
  firebaseInitialized: false,
  user: null,
  courses: {},
  selectedCourse: undefined
})

export const getters = {
  getCourseByID: (state) => (courseID) => {
    return state.courses[courseID]
  }
}

export const mutations = {
  initFirebase (state) {
    state.firebaseInitialized = true
  },
  setUser (state, user) {
    state.user = user
  },
  setCourses (state, courses) {
    state.courses = courses
  },
  setSelectedCourse (state, courseID) {
    state.selectedCourse = courseID
  }
}

export const actions = {
}