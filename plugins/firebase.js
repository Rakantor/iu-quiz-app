import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'

// Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyCA_xE5wcYMYNcVkj-diZHbss5Pqb5ZmTA',
  authDomain: 'iu-quiz-app.firebaseapp.com',
  projectId: 'iu-quiz-app',
  storageBucket: 'iu-quiz-app.appspot.com',
  messagingSenderId: '632060210614',
  appId: '1:632060210614:web:e2bd45b412b3bd2caba517'
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase App Check
self.FIREBASE_APPCHECK_DEBUG_TOKEN = process.env.firebaseAppCheckDebugToken
initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('6LcrDqoiAAAAALVT6mjDGTj8EMjukfkQJqxnZ2SA'),
  // Optional argument. If true, the SDK automatically refreshes App Check tokens as needed.
  isTokenAutoRefreshEnabled: true
})

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app)

export default ({ app }, inject) => {
  // Inject $auth and $db in Vue, context and store.
  // Ref: https://nuxtjs.org/docs/directory-structure/plugins/
  inject('auth', auth)
  inject('db', db)
}