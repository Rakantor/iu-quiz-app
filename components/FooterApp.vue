<template>
  <v-footer app dark>
    <v-row justify="center" no-gutters>
      <v-col cols="12" class="text-center">
        <span class="text-caption">&copy; {{ new Date().getFullYear() }}</span>
        <v-btn dark small text rounded :to="{ name: 'help' }">FAQ</v-btn>
      </v-col>
    </v-row>
  </v-footer>
</template>