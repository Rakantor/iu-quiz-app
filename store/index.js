export const state = () => ({
  firebaseInitialized: false
})

export const getters = {
}

export const mutations = {
  initFirebase (state) {
    state.firebaseInitialized = true
  }
}

export const actions = {
}