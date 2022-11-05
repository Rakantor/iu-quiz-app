<template>
  <v-data-iterator
    :items="questions"
    :items-per-page.sync="itemsPerPage"
    :page.sync="page"
    :search="search"
    :sort-by="sortBy.toLowerCase()"
    :sort-desc="sortDesc"
  >
    <template #header>
      <v-toolbar
        flat
        class="mb-1"
      >
        <v-text-field
          v-model="search"
          clearable
          flat
          solo-inverted
          hide-details
          prepend-inner-icon="mdi-magnify"
          label="Search"
        ></v-text-field>
        <template v-if="$vuetify.breakpoint.mdAndUp">
          <v-spacer></v-spacer>
          <v-select
            v-model="sortBy"
            flat
            solo-inverted
            hide-details
            :items="keys"
            prepend-inner-icon="mdi-magnify"
            label="Sort by"
          ></v-select>
          <v-spacer></v-spacer>
          <v-btn-toggle
            v-model="sortDesc"
            mandatory
          >
            <v-btn
              large
              depressed
              color="blue"
              :value="false"
            >
              <v-icon>mdi-arrow-up</v-icon>
            </v-btn>
            <v-btn
              large
              depressed
              color="blue"
              :value="true"
            >
              <v-icon>mdi-arrow-down</v-icon>
            </v-btn>
          </v-btn-toggle>
        </template>
      </v-toolbar>
    </template>

    <template #default="props">
      <v-container fluid>
        <v-card outlined>
          <v-expansion-panels hover accordion>
            <v-expansion-panel
              v-for="(item, i) in props.items"
              :key="i"
            >
              <v-expansion-panel-header>
                <strong>{{ item.question }}</strong>
              </v-expansion-panel-header>
              <v-expansion-panel-content class="text-pre-wrap">
                <div class="text-pre-wrap">{{ item.solution }}</div>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card>
      </v-container>
    </template>
  </v-data-iterator>
</template>

<script>
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
      itemsPerPageArray: [10, 20, 30],
      search: '',
      filter: {},
      sortDesc: false,
      page: 1,
      itemsPerPage: 10,
      sortBy: 'created',
      keys: [
        'Created'
      ]
    }
  },
  computed: {
    numberOfPages () {
      return Math.ceil(this.questions.length / this.itemsPerPage)
    },
    filteredKeys () {
      return this.keys.filter(key => key !== 'Name')
    },
  },
  methods: {
    nextPage () {
      if (this.page + 1 <= this.numberOfPages) this.page += 1
    },
    formerPage () {
      if (this.page - 1 >= 1) this.page -= 1
    },
    updateItemsPerPage (number) {
      this.itemsPerPage = number
    },
  },
}
</script>