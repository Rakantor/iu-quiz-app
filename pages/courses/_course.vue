<template>
  <v-container fluid fill-height>
    <NuxtChild />
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      courseID: undefined
    }
  },
  created () {
    this.courseID = this.$route.params.course
  }
}
</script>
