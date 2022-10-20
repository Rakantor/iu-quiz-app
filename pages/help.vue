<template>
  <v-container>
    <v-row>
      <v-col cols="12" class="text-center">
        <blockquote class="blockquote">
          &#8220;First, solve the problem. Then, write the code.&#8221;
          <footer>
            <small>
              <em>&mdash;John Johnson</em>
            </small>
          </footer>
        </blockquote>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'HelpPage',
  layout ({ $auth }) {
    // Ref: https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth#currentuser
    return $auth.currentUser.emailVerified ? 'default' : 'unverified'
  },
}
</script>
