<template>
  <v-container>
    <v-row>
      <v-col cols="12" class="text-center">
        <blockquote class="blockquote">
          <p>
            Über den Link "Community" gelangen die Studierenden zu einem externen Forum,<br/>
            in dem sie sich über Kursinhalte und die Web App austauschen können.
          </p>
          <p>Denkbar wäre auch eine Integration mit Course Feeds®.</p>
        </blockquote>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'ForumPage',
  layout ({ $auth }) {
    // Ref: https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth#currentuser
    return $auth.currentUser.emailVerified ? 'default' : 'unverified'
  },
}
</script>
