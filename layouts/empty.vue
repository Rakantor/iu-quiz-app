<template>
  <v-app>
    <v-main>
      <Nuxt />
    </v-main>
    <FooterApp />
    <ToastComponent />
  </v-app>
</template>

<script>
export default {
  name: 'EmptyLayout',
  layout: 'empty'
}
</script>