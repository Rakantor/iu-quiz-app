<template>
  <v-navigation-drawer
    v-if="$store.state.user"
    v-model="drawer"
    app dark clipped
    :mini-variant="mini"
    :permanent="!mobile"
    :touchless="!mobile"
  >
    <v-list>
      <v-list-item link class="px-2" :to="{ name: 'user' }">
        <v-list-item-avatar>
          <v-img src="https://avatarfiles.alphacoders.com/207/207426.png"></v-img>
        </v-list-item-avatar>
          <v-list-item-content>
          <v-list-item-title>{{ $store.state.user.displayName }}</v-list-item-title>
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
      <v-list-item link :to="{ name: 'forum' }">
        <v-list-item-icon>
          <v-icon>mdi-account-group</v-icon>
        </v-list-item-icon>
        <v-list-item-title>Community</v-list-item-title>
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
export default {
  data () {
    return {
      drawer: true,
      miniVariant: false
    }
  },
  computed: {
    mobile () {
      return this.$vuetify.breakpoint.smAndDown
    },
    mini () {
      if (this.mobile) return false
      else return this.miniVariant
    }
  },
  methods: {
    toggle () {
      if (this.mobile) this.drawer = !this.drawer
      else this.miniVariant = !this.miniVariant
    }
  }
}
</script>