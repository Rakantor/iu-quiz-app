export const state = () => ({
  firebaseInitialized: false,
  userLoggedIn: false,
  courses: []
})

export const getters = {
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
  }
}

export const actions = {
}