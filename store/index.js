export const state = () => ({
  firebaseInitialized: false,
  userLoggedIn: false,
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
  setUserLoggedIn (state, isLoggedIn) {
    state.userLoggedIn = isLoggedIn
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