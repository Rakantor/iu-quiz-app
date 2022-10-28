<template>
  <v-container fluid fill-height>
    <v-row>
      <v-col cols="12">
        <span class="text-h4">{{ title }}</span>
      </v-col>
    </v-row>
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
  computed: {
    title () {
      const courseName = this.$store.getters.getCourseByID(this.courseID).name
      return `${this.courseID.toUpperCase()} - ${courseName}`
    }
  },
  created () {
    this.courseID = this.$route.params.course
  }
}
</script>

<style>
.tete {
  flex: 1 1 auto;
}
</style>