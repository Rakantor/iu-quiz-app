<template>
  <v-navigation-drawer v-if="$store.state.userLoggedIn" app clipped :mini-variant="miniVariant">
    <v-list>
      <v-list-item link class="px-2" @click="gotoProfilePage">
        <v-list-item-avatar>
          <v-img src="https://avatarfiles.alphacoders.com/207/207426.png"></v-img>
        </v-list-item-avatar>
          <v-list-item-content>
          <v-list-item-title>{{ userName }}</v-list-item-title>
          <v-list-item-subtitle>{{ $auth.currentUser.email }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <v-divider></v-divider>
    <v-list nav dense>
      <v-list-item link :to="{ name: 'dashboard' }">
        <v-list-item-icon>
          <v-icon>mdi-view-dashboard</v-icon>
        </v-list-item-icon>
        <v-list-item-title>Dashboard</v-list-item-title>
      </v-list-item>
      <v-list-item link :to="{ name: 'help' }">
        <v-list-item-icon>
          <v-icon>mdi-frequently-asked-questions</v-icon>
        </v-list-item-icon>
        <v-list-item-title>Hilfe (FAQ)</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import _capitalize from 'lodash-es/capitalize'

export default {
  data () {
    return {
      miniVariant: false
    }
  },
  computed: {
    userName () {
      const givenName = this.$auth.currentUser.email.split('.')[0]
      return _capitalize(givenName)
    }
  },
  methods: {
    toggle () {
      this.miniVariant = !this.miniVariant
    },
    gotoProfilePage () {
      // TODO
      this.$toast({ content: 'TODO: Benutzerbereich implementieren', color: 'info' })
    }
  }
}
</script>