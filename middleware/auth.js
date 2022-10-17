export default function ({ $auth, store, route, redirect }) {
  // If Firebase Auth hasn't been initialized yet, redirect to index page
  if (!store.state.firebaseInitialized && route.name !== 'index') {
    return redirect({ name: 'index' })
  }
  // If the user attempts to access any site other than the login page without being logged in,
  // redirect to login page
  else if (store.state.firebaseInitialized && (!$auth.currentUser && route.name !== 'login')) {
    return redirect({ name: 'login' })
  }
}