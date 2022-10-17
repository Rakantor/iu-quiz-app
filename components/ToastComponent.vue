<template>
  <v-snackbar
    v-model="show"
    dark
    :color="color"
    :timeout="timeout"
  >
    {{ content }}
    <template #action="{ attrs }">
      <v-btn
        color="primary"
        text
        v-bind="attrs"
        @click="show = false"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
export default {
  data() {
    return {
      show: false,
      content: '',
      color: '',
      timeout: 5000
    }
  },
  created() {
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'toast/showMessage') {
        this.content = state.toast.content
        this.color = state.toast.color
        this.timeout = state.toast.timeout
        this.show = true
      }
    })
  }
}
</script>