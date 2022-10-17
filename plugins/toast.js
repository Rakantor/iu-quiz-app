export default ({ store, app }, inject) => {
  // Inject $toast in Vue, context and store.
  // Ref: https://nuxtjs.org/docs/directory-structure/plugins/
  inject('toast', payload => store.commit('toast/showMessage', payload))
}