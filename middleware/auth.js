export default function ({ $auth, store, route, redirect }) {
  const noAuthRoutes = ['login', 'help']
  // If Firebase Auth hasn't been initialized yet, redirect to index page
  if (!store.state.firebaseInitialized && route.name !== 'index') {
    return redirect({ name: 'index' })
  }
  // If the user attempts to access any site other than those defined in noAuthRoutes without being logged in,
  // redirect to login page
  else if (store.state.firebaseInitialized && (!$auth.currentUser && !noAuthRoutes.includes(route.name))) {
    return redirect({ name: 'login' })
  }
}