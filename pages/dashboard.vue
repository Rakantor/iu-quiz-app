<template>
  <v-row>
    <v-col class="text-center">
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
</template>

<script>
export default {
  name: 'DashboardPage',
  layout ({ $auth }) {
    // Ref: https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth#currentuser
    return $auth.currentUser.emailVerified ? 'default' : 'unverified'
  }
}
</script>
