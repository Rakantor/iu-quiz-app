<template>
  <v-data-table
    :headers="headers"
    :items="questions"
    :items-per-page.sync="itemsPerPage"
    :sort-by="sortBy"
    :sort-desc="sortDesc"
    no-data-text="Keine Daten vorhanden"
    no-results-text="Keine passenden Ergebnisse gefunden"
    locale="de-DE"
    :footer-props="{ itemsPerPageOptions: itemsPerPageArray, itemsPerPageText: 'Fragen pro Seite'}"
  >
    <!-- eslint-disable-next-line vue/valid-v-slot -->
    <template #item.created="{ item }">
      {{ new Date(item.created * 1000).toLocaleDateString('de-DE') }}
    </template>

    <!-- eslint-disable-next-line vue/valid-v-slot -->
    <template #item.status="{ item }">
      <v-icon :color="getStatusIcon(item.status).color">{{ getStatusIcon(item.status).icon }}</v-icon>
    </template>

    <!-- eslint-disable-next-line -->
    <template #footer.page-text="{ pageStart, pageStop, itemsLength }">
      <span>{{ pageStart }}-{{ pageStop }} von {{ itemsLength }}</span>
    </template>
  </v-data-table>
</template>

<script>
import { states } from '~/plugins/closed-ended-question'

export default {
  name: 'OpenEndedQuestionsList',
  props: {
    questions: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      headers: [
        { text: 'Hinzugefügt', value: 'created', width: 1, class: 'text-no-wrap' },
        { text: 'Status', value: 'status', width: 1, class: 'text-no-wrap' },
        {
          text: 'Frage',
          sortable: false,
          value: 'question',
        }
      ],
      itemsPerPageArray: [10, 25, 50],
      itemsPerPage: 10,
      sortBy: 'created',
      sortDesc: true
    }
  },
  methods: {
    getStatusIcon (status) {
      switch(status) {
        case states.approved: return { icon: 'mdi-check', color: 'success' }
        case states.declined: return { icon: 'mdi-close', color: 'error' }
        default: return { icon: 'mdi-timer-sand', color: '' }
      }
    }
  }
}
</script>